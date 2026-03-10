import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import { joinRoom, subscribeToRoom, updateHeartbeat, deletePeer, cleanupGhostPeers, getRoomPeerCount } from '../services/firebase';
import { filterMessage } from '../utils/contentFilter';
import { playMessageSound } from '../utils/notificationSound';

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
    const [messages, setMessages] = useState([]);
    const [myPeerId, setMyPeerId] = useState(null);
    const [typingPeers, setTypingPeers] = useState({});


    const connections = useRef({});
    const myKeyPair = useRef(null);
    const peerInstance = useRef(null);
    const peersRef = useRef([]);
    const heartbeatRef = useRef(null);
    const roomIdRef = useRef(null);
    const myPeerIdRef = useRef(null);

    // Helper: Add Message to State (deduplicate by id)
    const addMessage = useCallback((msg) => {
        setMessages(prev => {
            // Prevent duplicate messages
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg].sort((a, b) => a.timestamp - b.timestamp);
        });
    }, []);

    // --- CONNECTION HANDLERS ---

    const setupConnection = async (conn, remoteKey, peerId) => {
        // IMPORTANT: Wait for connection to actually open before setting up
        const onOpen = () => {
            // Connection opened
        };

        // If conn is already open, skip waiting
        if (!conn.open) {
            conn.on('open', onOpen);
        } else {
            onOpen();
        }

        connections.current[peerId] = { conn };

        // If we have key (outgoing), derive immediately
        if (remoteKey) {
            try {
                connections.current[peerId].sharedSecret = await deriveSharedSecret(myKeyPair.current.privateKey, remoteKey);
            } catch {
                // Failed to derive shared secret
            }
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
                if (!entry) return;

                // If missing secret (incoming), try to lazy load
                if (!entry.sharedSecret) {
                    const peerData = peersRef.current.find(p => p.id === peerId);
                    if (peerData) {
                        try {
                            const key = await importKey(JSON.parse(peerData.key));
                            entry.sharedSecret = await deriveSharedSecret(myKeyPair.current.privateKey, key);
                        } catch {
                            // Key derivation failed
                        }
                    }
                }

                if (!entry.sharedSecret) {
                    return;
                }

                const json = await decryptMessage(data.payload, entry.sharedSecret);
                if (json) {
                    try {
                        const msg = JSON.parse(json);
                        addMessage({ ...msg, peerId, isMe: false, status: 'delivered' });
                        playMessageSound();
                        // Send delivery confirmation back
                        if (entry.conn && entry.conn.open) {
                            entry.conn.send({ type: 'delivered', msgId: msg.id });
                        }
                    } catch {
                        // Failed to parse decrypted message
                    }
                }
            }
        });

        conn.on('close', () => {
            delete connections.current[peerId];
        });

        conn.on('error', () => {
            delete connections.current[peerId];
        });
    };

    const handleIncomingConnection = async (conn) => {
        const peerId = conn.peer;

        // If we already have a connection to this peer, close the old one
        if (connections.current[peerId]) {

            try {
                connections.current[peerId].conn.close();
            } catch { /* ignore */ }
            delete connections.current[peerId];
        }

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
        if (!peer || peer.destroyed) return;

        // Don't connect if we already have an open connection
        const existing = connections.current[remotePeerData.id];
        if (existing && existing.conn && existing.conn.open) {
            return;
        }

        // Clean up stale connection entry
        if (existing) {
            try { existing.conn.close(); } catch { /* ignore */ }
            delete connections.current[remotePeerData.id];
        }

        try {

            const conn = peer.connect(remotePeerData.id, {
                metadata: { user: username },
                reliable: true
            });

            if (!conn) {
                return;
            }

            const remoteKey = await importKey(JSON.parse(remotePeerData.key));
            await setupConnection(conn, remoteKey, remotePeerData.id);
        } catch {
            // Failed to connect to peer
        }
    };

    useEffect(() => {
        if (!roomId || !username) return;

        let unsubscribeFirestore = () => { };
        let destroyed = false;

        roomIdRef.current = roomId;

        const init = async () => {
            setStatus('connecting');

            try {
                // E2E Encryption requires Secure Context (HTTPS) on iOS/Android
                if (!window.crypto || !window.crypto.subtle) {
                    throw new Error("HTTPS Required for End-to-End Encryption. Please use the Vercel URL, not a local IP.");
                }

                // 1. Generate Keys (FRESH every time for security — keys are ephemeral)
                myKeyPair.current = await generateKeyPair();
                const exportedPublicKey = await exportKey(myKeyPair.current.publicKey);

                // 2. Init PeerJS — Generate a FRESH ID every session
                // Using a strict alphanumeric random ID to prevent PeerJS server rejection from spaces/emojis in names.
                const id = `pui_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;
                setMyPeerId(id);
                myPeerIdRef.current = id;

                const peer = new Peer(id, {
                    debug: 0,
                    secure: true,
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:global.stun.twilio.com:3478' },
                            { urls: 'stun:stun1.l.google.com:19302' },
                            { urls: 'stun:stun2.l.google.com:19302' },
                            // Free TURN servers for mobile NAT traversal
                            {
                                urls: 'turn:a.relay.metered.ca:80',
                                username: 'e8dd65b92f4ff3e5a',
                                credential: 'parallel2024'
                            },
                            {
                                urls: 'turn:a.relay.metered.ca:443',
                                username: 'e8dd65b92f4ff3e5a',
                                credential: 'parallel2024'
                            },
                            {
                                urls: 'turn:a.relay.metered.ca:443?transport=tcp',
                                username: 'e8dd65b92f4ff3e5a',
                                credential: 'parallel2024'
                            }
                        ]
                    }
                });

                peerInstance.current = peer;
                peersRef.current = [];

                // Connection Timeout Trap — if PeerJS server doesn't respond in 15s, throw error
                const connectionTimeout = setTimeout(() => {
                    if (peerInstance.current && !peerInstance.current.open) {
                        setStatus('error');
                    }
                }, 15000);

                peer.on('open', async (openedId) => {
                    clearTimeout(connectionTimeout);
                    if (destroyed) return;

                    setStatus('connected');

                    // 3. Clean up any ghost peers with our username (from previous sessions)
                    await cleanupGhostPeers(roomId, openedId, username);

                    // 3.5 Enforce 2-person room limit
                    const currentCount = await getRoomPeerCount(roomId);
                    if (currentCount >= 2) {
                        setStatus('room-full');
                        peer.destroy();
                        return;
                    }

                    // 4. Join Room (register in Firestore)
                    await joinRoom(roomId, openedId, {
                        user: username,
                        key: JSON.stringify(exportedPublicKey)
                    });

                    // 4. Start Heartbeat (keeps us "alive" in Firestore)
                    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
                    heartbeatRef.current = setInterval(() => {
                        if (!destroyed) {
                            updateHeartbeat(roomId, openedId);
                        }
                    }, 5000);

                    // 5. Subscribe to room peers
                    unsubscribeFirestore = subscribeToRoom(roomId, (roomPeers) => {
                        if (destroyed) return;

                        const others = roomPeers.filter(p => p.id !== openedId && p.user !== username);
                        setPeers(others);
                        peersRef.current = others;

                        // Connect to any unconnected peers
                        others.forEach((p) => {
                            const existing = connections.current[p.id];
                            if (!existing || !existing.conn || !existing.conn.open) {
                                connectToPeer(p);
                            } else if (existing && !existing.sharedSecret) {
                                // Try to derive key if missing
                                (async () => {
                                    try {
                                        const key = await importKey(JSON.parse(p.key));
                                        existing.sharedSecret = await deriveSharedSecret(myKeyPair.current.privateKey, key);
                                    } catch { /* ignore */ }
                                })();
                            }
                        });
                    });
                });

                peer.on('connection', (conn) => handleIncomingConnection(conn));

                peer.on('error', (err) => {
                    // If the error is "ID taken" (stale session), generate new ID
                    if (err.type === 'unavailable-id') {

                        setStatus('error');
                    } else if (err.type === 'peer-unavailable') {
                        // Peer we tried to connect to doesn't exist — normal for stale peers
                    } else {
                        setStatus('error');
                    }
                });

                peer.on('disconnected', () => {
                    if (destroyed) return;

                    setStatus('connecting');
                    // Try to reconnect
                    try {
                        peer.reconnect();
                    } catch {
                        setStatus('error');
                    }
                });
            } catch {

                setStatus('error');
            }
        };

        // Initialize
        if (typeof window !== 'undefined') {
            init();
        }

        // Cleanup on page unload — delete our peer from Firestore
        const handleBeforeUnload = () => {
            if (myPeerIdRef.current && roomIdRef.current) {
                // Use sendBeacon for reliable unload cleanup
                deletePeer(roomIdRef.current, myPeerIdRef.current);
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            destroyed = true;

            // Stop heartbeat
            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
                heartbeatRef.current = null;
            }

            // Unsubscribe Firestore
            unsubscribeFirestore();

            // Close all data connections
            Object.values(connections.current).forEach(entry => {
                try { entry.conn.close(); } catch { /* ignore */ }
            });
            connections.current = {};

            // Destroy PeerJS instance
            if (peerInstance.current) {
                try { peerInstance.current.destroy(); } catch { /* ignore */ }
                peerInstance.current = null;
            }

            // Delete peer from Firestore (cleanup ghost)
            if (myPeerIdRef.current && roomIdRef.current) {
                deletePeer(roomIdRef.current, myPeerIdRef.current);
            }

            // Remove unload listener
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, username]);

    // Send Message (Direct or Broadcast) — OPTIMISTIC UI
    const sendMessage = async (text, targetPeerId, type = 'text') => {
        // Apple Guideline 1.2: Filter objectionable content before sending
        if (type === 'text') {
            const check = filterMessage(text);
            if (check.blocked) {
                // Show filtered notification to sender only — message is never sent
                const filteredMsg = {
                    id: Date.now() + Math.random(),
                    user: username,
                    text: '⚠️ Message blocked: ' + check.reason,
                    type: 'system',
                    timestamp: Date.now(),
                    isMe: true,
                    peerId: targetPeerId || 'broadcast',
                    status: 'filtered'
                };
                addMessage(filteredMsg);
                return;
            }
        }

        const payload = {
            id: Date.now() + Math.random(),
            user: username,
            text,
            type,
            timestamp: Date.now()
        };

        // OPTIMISTIC: Show message INSTANTLY before encryption
        const optimisticMsg = {
            ...payload,
            isMe: true,
            peerId: targetPeerId || 'broadcast',
            status: 'sending'
        };
        addMessage(optimisticMsg);

        const updateStatus = (status) => {
            setMessages(prev => prev.map(m =>
                m.id === payload.id ? { ...m, status } : m
            ));
        };

        const trySend = async (peerId) => {
            let entry = connections.current[peerId];

            if (!entry || !entry.conn || !entry.conn.open) {
                const peerData = peersRef.current.find(p => p.id === peerId);
                if (peerData) {
                    await connectToPeer(peerData);

                    // Give mobile WebRTC handshake time to establish
                    await new Promise(r => setTimeout(r, 2000));
                    entry = connections.current[peerId];
                }
            }

            if (entry && entry.conn && entry.conn.open && entry.sharedSecret) {
                try {
                    const encrypted = await encryptMessage(JSON.stringify(payload), entry.sharedSecret);
                    entry.conn.send({ payload: encrypted });
                    return true;
                } catch {

                    return false;
                }
            }


            return false;
        };

        if (targetPeerId) {
            const success = await trySend(targetPeerId);
            updateStatus(success ? 'sent' : 'failed');
        } else {
            const entries = Object.entries(connections.current);
            for (const [, entry] of entries) {
                if (entry.conn && entry.conn.open && entry.sharedSecret) {
                    try {
                        const encrypted = await encryptMessage(JSON.stringify(payload), entry.sharedSecret);
                        entry.conn.send({ payload: encrypted });
                    } catch {
                        // Broadcast send failed
                    }
                }
            }
            updateStatus('sent');
        }
    };

    // Send typing signal
    const sendTyping = (targetPeerId) => {
        const entry = connections.current[targetPeerId];
        if (entry && entry.conn && entry.conn.open) {
            try {
                entry.conn.send({ type: 'typing' });
            } catch { /* ignore */ }
        }
    };

    // Panic Wipe
    const panicWipe = () => {
        setMessages([]);
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
        // Features
        typingPeers,
        sendTyping,
        panicWipe
    };
};
