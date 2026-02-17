import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";


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

export const subscribeToRoom = (roomId, onPeersUpdate) => {
    const peersRef = collection(db, 'parallel_rooms', roomId, 'peers');
    return onSnapshot(peersRef, (snapshot) => {
        const peers = [];
        snapshot.forEach(doc => {
            peers.push({ id: doc.id, ...doc.data() });
        });
        onPeersUpdate(peers);
    });
};
