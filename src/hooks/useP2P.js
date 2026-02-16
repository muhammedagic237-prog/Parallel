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
    } catch (e) {
        console.error("Decrypt failed", e);
        return null;
    }
}

// --- HOOK ---

export const useP2P = (roomId, username) => {
    const [status, setStatus] = useState('disconnected');
    const [peers, setPeers] = useState([]);
    const [messages, setMessages] = useState([]); // { id, text, user, peerId, isMe, timestamp }
    const [myPeerId, setMyPeerId] = useState(null);

    // CALL STATE
    const [incomingCall, setIncomingCall] = useState(null); // { call, meta }
    const [activeCall, setActiveCall] = useState(null); // { call, stream }
    const [remoteStream, setRemoteStream] = useState(null);

    // --- CALL ACTIONS ---
    const callPeer = (remoteId, localStream) => {
        if (!peerInstance.current) return;
        console.log("Calling peer:", remoteId);
        const call = peerInstance.current.call(remoteId, localStream);

        call.on('stream', (stream) => {
            console.log("Remote stream received (Outgoing)");
            setRemoteStream(stream);
        });
        call.on('close', () => endCall());
        call.on('error', (err) => console.error("Call error:", err));

        setActiveCall({ call, stream: localStream });
    };

    const answerCall = (localStream) => {
        if (!incomingCall) return;
        const { call } = incomingCall;

        console.log("Answering call...");
        call.answer(localStream);

        call.on('stream', (stream) => {
            console.log("Remote stream received (Incoming)");
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
            if (data.payload) {
                const entry = connections.current[peerId];

                // If missing secret (incoming), try to lazy load
                if (!entry.sharedSecret) {
                    // Try to find key in refs if we missed it earlier
                    const peerData = peersRef.current.find(p => p.id === peerId);
                    if (peerData) {
                        try {
                            const key = await importKey(JSON.parse(peerData.key));
                            entry.sharedSecret = await deriveSharedSecret(myKeyPair.current.privateKey, key);
                        } catch (e) { console.error("Lazy key derivation failed", e); }
                    }
                }

                if (!entry.sharedSecret) {
                    console.warn("Received data but no secret yet for", peerId);
                    return;
                }

                const json = await decryptMessage(data.payload, entry.sharedSecret);
                if (json) {
                    const msg = JSON.parse(json);
                    // Add to messages with peerId = sender
                    addMessage({ ...msg, peerId, isMe: false });
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
            } catch (e) { console.error("Failed to import key for incoming conn", e); }
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
                console.log('My Peer ID:', id);
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
                console.log("Incoming Call from:", call.peer);
                setIncomingCall({ call });
            });

            peer.on('error', (err) => {
                console.error('Peer Error:', err);
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
                addMessage({ ...payload, isMe: true, peerId: targetPeerId });
            } else {
                console.error("Cannot send to", targetPeerId, "- Connection not ready");
            }
        } else {
            // Broadcast (legacy support)
            Object.values(connections.current).forEach(async (entry) => {
                if (entry.conn.open && entry.sharedSecret) {
                    const encrypted = await encryptMessage(JSON.stringify(payload), entry.sharedSecret);
                    entry.conn.send({ payload: encrypted });
                }
            });
            addMessage({ ...payload, isMe: true, peerId: 'broadcast' });
        }
    };

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
        remoteStream
    };
};
