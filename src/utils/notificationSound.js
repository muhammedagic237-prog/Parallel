/**
 * Notification Sound — Web Audio API
 *
 * Generates a classic short message-received chime using pure synthesis.
 * No external audio files needed — works offline and is ~0 KB.
 *
 * Sound design: two-tone ascending "ding" (similar to iMessage / WhatsApp).
 */

let audioCtx = null;

const getAudioContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
};

/**
 * Play a short two-note notification chime.
 * Safe to call anytime — silently fails if AudioContext is blocked.
 */
export const playMessageSound = () => {
    try {
        const ctx = getAudioContext();

        // Resume context if suspended (required after user interaction on mobile)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const now = ctx.currentTime;

        // --- Note 1: E6 (1318 Hz) ---
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1318, now);
        gain1.gain.setValueAtTime(0.15, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.15);

        // --- Note 2: G6 (1568 Hz) — slightly delayed for the classic "ding-ding" ---
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1568, now + 0.1);
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.setValueAtTime(0.18, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.3);
    } catch {
        // AudioContext not available — fail silently
    }
};
