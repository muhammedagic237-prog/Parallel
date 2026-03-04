import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp, updateDoc, getDocs } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyBQDdzlJemo4Cbw3SKcTDX_YjQ27eCp5ug",
    authDomain: "ghost-chatamd.firebaseapp.com",
    projectId: "ghost-chatamd",
    storageBucket: "ghost-chatamd.appspot.com",
    messagingSenderId: "100973455099363666904",
    appId: "1:100973455099363666904:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- PRESENCE & SIGNALING ---

export const joinRoom = async (roomId, peerId, userData) => {
    const roomRef = doc(db, 'parallel_rooms', roomId, 'peers', peerId);
    await setDoc(roomRef, {
        ...userData,
        lastSeen: serverTimestamp()
    });
};

export const updateHeartbeat = async (roomId, peerId) => {
    try {
        const roomRef = doc(db, 'parallel_rooms', roomId, 'peers', peerId);
        await updateDoc(roomRef, {
            lastSeen: serverTimestamp()
        });
    } catch {
        // Ignore if doc was deleted
    }
};

export const deletePeer = async (roomId, peerId) => {
    try {
        const roomRef = doc(db, 'parallel_rooms', roomId, 'peers', peerId);
        await deleteDoc(roomRef);
    } catch {
        // Ignore
    }
};

// Clean up ghost peers with the same username (from previous sessions that didn't unload cleanly)
export const cleanupGhostPeers = async (roomId, myPeerId, myUsername) => {
    try {
        const peersRef = collection(db, 'parallel_rooms', roomId, 'peers');
        const snapshot = await getDocs(peersRef);
        const deletePromises = [];

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            // Delete any peer with our username that isn't our current PeerJS ID
            if (data.user === myUsername && docSnap.id !== myPeerId) {
                deletePromises.push(deleteDoc(docSnap.ref));
            }
        });

        await Promise.all(deletePromises);
    } catch {
        // Ignore cleanup errors
    }
};

// Check how many alive peers are in a room (for enforcing 2-person limit)
export const getRoomPeerCount = async (roomId) => {
    try {
        const peersRef = collection(db, 'parallel_rooms', roomId, 'peers');
        const snapshot = await getDocs(peersRef);
        const now = Date.now();
        let aliveCount = 0;

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            let isAlive = true;
            if (data.lastSeen) {
                const lastSeenTime = data.lastSeen.toMillis ? data.lastSeen.toMillis() : Date.now();
                if (now - lastSeenTime > 15000) {
                    isAlive = false;
                }
            }
            if (isAlive) aliveCount++;
        });

        return aliveCount;
    } catch {
        return 0;
    }
};

export const subscribeToRoom = (roomId, onPeersUpdate) => {
    const peersRef = collection(db, 'parallel_rooms', roomId, 'peers');
    return onSnapshot(peersRef, (snapshot) => {
        const peers = [];
        const now = Date.now();
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            // Filter out ghosts older than 15 seconds (fast detection of crashed/exited users)
            let isAlive = true;
            if (data.lastSeen) {
                const lastSeenTime = data.lastSeen.toMillis ? data.lastSeen.toMillis() : Date.now();
                if (now - lastSeenTime > 15000) {
                    isAlive = false;
                }
            }

            if (isAlive) {
                peers.push({ id: docSnap.id, ...data });
            }
        });
        onPeersUpdate(peers);
    });
};
