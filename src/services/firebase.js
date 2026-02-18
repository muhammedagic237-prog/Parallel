import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";


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
    } catch (e) {
        // Ignore if doc was deleted
    }
};

export const deletePeer = async (roomId, peerId) => {
    try {
        const roomRef = doc(db, 'parallel_rooms', roomId, 'peers', peerId);
        await deleteDoc(roomRef);
    } catch (e) {
        // Ignore
    }
};


export const subscribeToRoom = (roomId, onPeersUpdate) => {
    const peersRef = collection(db, 'parallel_rooms', roomId, 'peers');
    return onSnapshot(peersRef, (snapshot) => {
        const peers = [];
        const now = Date.now();
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            // Filter out ghosts older than 60 seconds (if lastSeen exists)
            // Note: serverTimestamp() is null initially on local write, so allow null
            let isAlive = true;
            if (data.lastSeen) {
                const lastSeenTime = data.lastSeen.toMillis ? data.lastSeen.toMillis() : Date.now();
                if (now - lastSeenTime > 60000) {
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
