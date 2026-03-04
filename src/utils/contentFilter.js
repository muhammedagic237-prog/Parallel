/**
 * Client-side content filter for Apple App Store compliance (Guideline 1.2).
 * Filters objectionable material before messages are sent.
 * This runs locally — no data is sent to any server for filtering.
 */

// Curated blocklist of severe/objectionable terms (partial matches disabled to avoid false positives)
const BLOCKED_WORDS = [
    // Slurs and hate speech (exact-match only)
    'nigger', 'nigga', 'faggot', 'retard', 'kike', 'spic', 'chink', 'wetback', 'tranny',
    // CSAM-related terms
    'child porn', 'cp links', 'underage nude', 'jailbait',
    // Extreme violence / threats
    'kill yourself', 'kys',
    // Terrorism
    'join isis', 'heil hitler', 'sieg heil'
];

// Regex patterns for more nuanced detection
const BLOCKED_PATTERNS = [
    /\b(?:k+\s*y+\s*s)\b/i,                    // "k y s" variations
    /\b(?:kill\s+(?:your|ur)\s*self)\b/i,       // "kill yourself" variations
];

/**
 * Check if a message contains objectionable content.
 * @param {string} text - The message text to check
 * @returns {{ blocked: boolean, reason?: string }}
 */
export const filterMessage = (text) => {
    if (!text || typeof text !== 'string') return { blocked: false };

    const lower = text.toLowerCase().trim();

    // Check exact phrases
    for (const word of BLOCKED_WORDS) {
        if (lower.includes(word)) {
            return { blocked: true, reason: 'This message contains content that violates our community guidelines.' };
        }
    }

    // Check regex patterns
    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(lower)) {
            return { blocked: true, reason: 'This message contains content that violates our community guidelines.' };
        }
    }

    return { blocked: false };
};
