// --- SECURE STORAGE UTILITY ---
// Using Web Crypto API for AES-GCM encryption of LocalStorage data.

const STORAGE_KEY_DATA = 'parallel_chat_data';
const STORAGE_KEY_IV = 'parallel_chat_iv'; // We store IV alongside data (it's public)
const KEY_MATERIAL = 'parallel_device_key'; // Local key (simulated device encryption)

const ALGO_AES = { name: "AES-GCM", length: 256 };

// 1. Get or Generate Device Key
async function getDeviceKey() {
    let rawKey = localStorage.getItem(KEY_MATERIAL);

    if (!rawKey) {
        // Generate new key
        const key = await window.crypto.subtle.generateKey(ALGO_AES, true, ["encrypt", "decrypt"]);
        const exported = await window.crypto.subtle.exportKey("jwk", key);
        rawKey = JSON.stringify(exported);
        localStorage.setItem(KEY_MATERIAL, rawKey);
    }

    return window.crypto.subtle.importKey(
        "jwk",
        JSON.parse(rawKey),
        ALGO_AES,
        true,
        ["encrypt", "decrypt"]
    );
}

// 2. Encrypt and Save
export async function saveMessagesSecurely(messages) {
    try {
        const key = await getDeviceKey();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const enc = new TextEncoder();

        const data = JSON.stringify(messages);
        const ciphertext = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            enc.encode(data)
        );

        // Store
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(Array.from(new Uint8Array(ciphertext))));
        localStorage.setItem(STORAGE_KEY_IV, JSON.stringify(Array.from(iv)));
        console.log("Messages saved securely.");
    } catch (e) {
        console.error("Save failed", e);
    }
}

// 3. Load and Decrypt
export async function loadMessagesSecurely() {
    try {
        const rawData = localStorage.getItem(STORAGE_KEY_DATA);
        const rawIv = localStorage.getItem(STORAGE_KEY_IV);

        if (!rawData || !rawIv) return [];

        const key = await getDeviceKey();
        const iv = new Uint8Array(JSON.parse(rawIv));
        const data = new Uint8Array(JSON.parse(rawData));

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            data
        );

        const decoded = new TextDecoder().decode(decrypted);
        const messages = JSON.parse(decoded);

        return pruneOldMessages(messages);
    } catch (e) {
        console.error("Load failed or data corrupted", e);
        return [];
    }
}

// 4. Prune Old Messages (> 24 Hours)
function pruneOldMessages(messages) {
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    const validMessages = messages.filter(msg => {
        return (now - msg.timestamp) < TWENTY_FOUR_HOURS;
    });

    if (validMessages.length < messages.length) {
        console.log(`Pruned ${messages.length - validMessages.length} old messages.`);
        saveMessagesSecurely(validMessages); // Re-save pruned list
    }

    return validMessages;
}

// 5. Clear All (Manual wipe)
export function clearSecureStorage() {
    localStorage.removeItem(STORAGE_KEY_DATA);
    localStorage.removeItem(STORAGE_KEY_IV);
    console.log("Secure storage wiped.");
}

// Check if storage is enabled (UI Flag)
export const getRetentionPreference = () => {
    return localStorage.getItem('parallel_retention_enabled') === 'true';
};

export const setRetentionPreference = (enabled) => {
    localStorage.setItem('parallel_retention_enabled', enabled);
    if (!enabled) clearSecureStorage();
};
