import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { joinRoom, subscribeToRoom } from '../services/firebase';

// --- CRYPTO UTILS ---
const ALGO_ECDH = { name: "ECDH", namedCurve: "P-256" };
const ALGO_AES = { name: "AES-GCM", length: 256 };

async function generateKeyPair() {
    return window.crypto.subtle.generateKey(ALGO_ECDH, true, ["deriveKey", "deriveBits"]);
}

async function exportKey(key) {
    return window.crypto.subtle.exportKey("jwk", key);
}

async function importKey(jwk) {
    return window.crypto.subtle.importKey("jwk", jwk, ALGO_ECDH, true, []);
}

async function deriveSharedSecret(privateKey, publicKey) {
    return window.crypto.subtle.deriveKey(
        { name: "ECDH", public: publicKey },
        privateKey,
        ALGO_AES,
        false,
        ["encrypt", "decrypt"]
    );
}

async function encryptMessage(text, key) {
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(text)
    );
    return JSON.stringify({
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(ciphertext))
    });
}

async function decryptMessage(packedJson, key) {
    try {
        const packed = JSON.parse(packedJson);
        const iv = new Uint8Array(packed.iv);
        const data = new Uint8Array(packed.data);

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            data
        );
        return new TextDecoder().decode(decrypted);
    } catch {
        return null;
    }
}

// --- HOOK ---

export const useP2P = (roomId, username) => {
    const [status, setStatus] = useState('disconnected');
    const [peers, setPeers] = useState([]);
    const [messages, setMessages] = useState([]); // { id, text, user, peerId, isMe, timestamp, status }
    const [myPeerId, setMyPeerId] = useState(null);
    const [retentionEnabled, setRetentionEnabledState] = useState(false);
    const [typingPeers, setTypingPeers] = useState({}); // { peerId: timestamp }

    // Toggle Retention (RAM Only Mode)
    const toggleRetention = (enabled) => {
        setRetentionEnabledState(enabled);
        // Note: No persistence preference saved to disk to avoid forensics.
        if (!enabled) {
            // If disabled, we could clear old messages immediately, or just stop the 24h timer.
            // For now, let's keep it simple: It just toggles the "24h policy".
            // Actually, if disabled, standard behavior is ephemeral (which is what we have).
        }
    };

    // 24h Pruning Interval (RAM Only)
    useEffect(() => {
        if (!retentionEnabled) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

            setMessages(prev => {
                const valid = prev.filter(msg => (now - msg.timestamp) < TWENTY_FOUR_HOURS);
                if (valid.length !== prev.length) return valid;
                return prev;
            });
        }, 60 * 1000); // Check every minute

        return () => clearInterval(interval);
    }, [retentionEnabled]);

    // Note: Removed localStorage saving effects. Messages are now strictly in RAM.

    // CALL STATE
    const [incomingCall, setIncomingCall] = useState(null); // { call, meta }
    const [activeCall, setActiveCall] = useState(null); // { call, stream }
    const [remoteStream, setRemoteStream] = useState(null);

    // --- CALL ACTIONS ---
    const callPeer = (remoteId, localStream) => {
        if (!peerInstance.current) return;

        const call = peerInstance.current.call(remoteId, localStream);

        call.on('stream', (stream) => {
            setRemoteStream(stream);
        });
        call.on('close', () => endCall());
        call.on('error', () => { });

        setActiveCall({ call, stream: localStream });
    };

    const answerCall = (localStream) => {
        if (!incomingCall) return;
        const { call } = incomingCall;

        call.answer(localStream);

        call.on('stream', (stream) => {
            setRemoteStream(stream);
        });
        call.on('close', () => endCall());

        setActiveCall({ call, stream: localStream });
        setIncomingCall(null);
    };

    const endCall = () => {
        if (activeCall) {
            activeCall.call.close();
            activeCall.stream?.getTracks().forEach(track => track.stop());
        }
        if (incomingCall) incomingCall.call.close();

        setActiveCall(null);
        setIncomingCall(null);
        setRemoteStream(null);
    };

    const connections = useRef({});
    const myKeyPair = useRef(null);
    const peerInstance = useRef(null);
    const peersRef = useRef([]); // Sync access to peers for incoming connections

    // Helper: Add Message to State
    const addMessage = (msg) => {
        setMessages(prev => [...prev, msg].sort((a, b) => a.timestamp - b.timestamp));
    };

    // --- CONNECTION HANDLERS (Defined before useEffect to avoid hoisting issues) ---

    const setupConnection = async (conn, remoteKey, peerId) => {
        connections.current[peerId] = { conn };

        // If we have key (outgoing), derive immediately
        if (remoteKey) {
            connections.current[peerId].sharedSecret = await deriveSharedSecret(myKeyPair.current.privateKey, remoteKey);
        }

        conn.on('data', async (data) => {
            // Typing indicator (unencrypted control signal)
            if (data.type === 'typing') {
                setTypingPeers(prev => ({ ...prev, [peerId]: Date.now() }));
                return;
            }
            // Delivery confirmation
            if (data.type === 'delivered') {
                setMessages(prev => prev.map(m => m.id === data.msgId ? { ...m, status: 'delivered' } : m));
                return;
            }

            if (data.payload) {
                const entry = connections.current[peerId];

                // If missing secret (incoming), try to lazy load
                if (!entry.sharedSecret) {
                    const peerData = peersRef.current.find(p => p.id === peerId);
                    if (peerData) {
                        try {
                            const key = await importKey(JSON.parse(peerData.key));
                            entry.sharedSecret = await deriveSharedSecret(myKeyPair.current.privateKey, key);
                        } catch { /* Key derivation failed — will retry on next message */ }
                    }
                }

                if (!entry.sharedSecret) {
                    return;
                }

                const json = await decryptMessage(data.payload, entry.sharedSecret);
                if (json) {
                    const msg = JSON.parse(json);
                    addMessage({ ...msg, peerId, isMe: false, status: 'delivered' });
                    // Send delivery confirmation back
                    if (entry.conn.open) {
                        entry.conn.send({ type: 'delivered', msgId: msg.id });
                    }
                }
            }
        });

        conn.on('close', () => {
            delete connections.current[peerId];
        });
    };

    const handleIncomingConnection = async (conn) => {
        // Attempt to find peer key immediately
        const peerId = conn.peer;
        const peerData = peersRef.current.find(p => p.id === peerId);
        let remoteKey = null;

        if (peerData) {
            try {
                remoteKey = await importKey(JSON.parse(peerData.key));
            } catch { /* Will derive key when message arrives */ }
        }

        setupConnection(conn, remoteKey, peerId);
    };

    const connectToPeer = async (remotePeerData) => {
        const peer = peerInstance.current;
        if (!peer) return;

        const conn = peer.connect(remotePeerData.id, {
            metadata: { user: username }
        });

        const remoteKey = await importKey(JSON.parse(remotePeerData.key));
        setupConnection(conn, remoteKey, remotePeerData.id);
    };

    useEffect(() => {
        if (!roomId || !username) return;

        let unsubscribeFirestore = () => { };

        const init = async () => {
            setStatus('connecting');

            // 1. Generate Keys
            myKeyPair.current = await generateKeyPair();
            const exportedPublicKey = await exportKey(myKeyPair.current.publicKey);

            // 2. Init PeerJS
            const id = `parallel_${roomId}_${username}_${Math.floor(Math.random() * 100000)}`;
            setMyPeerId(id);

            const peer = new Peer(id, {
                debug: 1,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ]
                }
            });

            peerInstance.current = peer;
            peersRef.current = []; // Reset peers ref

            peer.on('open', async (id) => {

                setStatus('connected');

                // 3. Join Room
                await joinRoom(roomId, id, {
                    user: username,
                    key: JSON.stringify(exportedPublicKey)
                });

                // 4. Subscribe
                unsubscribeFirestore = subscribeToRoom(roomId, (roomPeers) => {
                    const others = roomPeers.filter(p => p.id !== id);
                    setPeers(others);
                    peersRef.current = others; // Update sync ref

                    others.forEach(async (p) => {
                        if (!connections.current[p.id]) {
                            connectToPeer(p);
                        } else {
                            // If we have a connection entry but no secret (e.g. came from incoming), try to derive now
                            const entry = connections.current[p.id];
                            if (entry && !entry.sharedSecret) {
                                const key = await importKey(JSON.parse(p.key));
                                entry.sharedSecret = await deriveSharedSecret(myKeyPair.current.privateKey, key);
                            }
                        }
                    });
                });
            });

            peer.on('connection', (conn) => handleIncomingConnection(conn));

            // VIDEO CALL LISTENER
            peer.on('call', (call) => {

                setIncomingCall({ call });
            });

            peer.on('error', () => { // Removed console.error
                setStatus('error');
            });
        };

        // Initialize Peer (Client Side Only)
        if (typeof window !== 'undefined') {
            init();
        }

        return () => {
            if (peerInstance.current) peerInstance.current.destroy();
            unsubscribeFirestore();
            connections.current = {};
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, username]);

    // Send Message (Direct or Broadcast)
    const sendMessage = async (text, targetPeerId) => {
        const payload = {
            id: Date.now() + Math.random(),
            user: username,
            text,
            timestamp: Date.now()
        };

        // If target provided, direct message
        if (targetPeerId) {
            const entry = connections.current[targetPeerId];
            if (entry && entry.conn.open && entry.sharedSecret) {
                const encrypted = await encryptMessage(JSON.stringify(payload), entry.sharedSecret);
                entry.conn.send({ payload: encrypted });

                // Local Echo
                addMessage({ ...payload, isMe: true, peerId: targetPeerId, status: 'sent' });
            } else {
                // No connection ready, message will fail silently
            }
        } else {
            // Broadcast (legacy support)
            Object.values(connections.current).forEach(async (entry) => {
                if (entry.conn.open && entry.sharedSecret) {
                    const encrypted = await encryptMessage(JSON.stringify(payload), entry.sharedSecret);
                    entry.conn.send({ payload: encrypted });
                }
            });
            addMessage({ ...payload, isMe: true, peerId: 'broadcast', status: 'sent' });
        }
    };

    // Send typing signal
    const sendTyping = (targetPeerId) => {
        const entry = connections.current[targetPeerId];
        if (entry && entry.conn.open) {
            entry.conn.send({ type: 'typing' });
        }
    };

    // Panic Wipe: Instantly purge all messages from RAM and reset state
    const panicWipe = () => {
        setMessages([]);
        // Vibrate for feedback if supported
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    };

    // Clear typing indicators older than 3s
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setTypingPeers(prev => {
                const next = {};
                for (const [id, ts] of Object.entries(prev)) {
                    if (now - ts < 3000) next[id] = ts;
                }
                return Object.keys(next).length !== Object.keys(prev).length ? next : prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return {
        status,
        peers,
        messages,
        sendMessage,
        myPeerId,
        // Call Exports
        callPeer,
        incomingCall,
        answerCall,
        endCall,
        activeCall,
        remoteStream,
        // Retention
        retentionEnabled,
        toggleRetention,
        // WOW Features
        typingPeers,
        sendTyping,
        panicWipe
    };
};
