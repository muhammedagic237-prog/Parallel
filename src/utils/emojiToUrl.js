/**
 * Convert an emoji character to a Twemoji SVG image URL.
 * Uses the jdecked/twemoji CDN (community fork of Twitter Twemoji).
 * Returns a URL to a high-quality SVG illustration of the emoji.
 */

const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg';

export const emojiToUrl = (emoji) => {
    const codepoints = [];

    for (const char of emoji) {
        const cp = char.codePointAt(0);
        // Skip variation selectors (U+FE0E, U+FE0F) and zero-width joiners for URL
        if (cp === 0xFE0F || cp === 0xFE0E) continue;
        codepoints.push(cp.toString(16));
    }

    return `${TWEMOJI_BASE}/${codepoints.join('-')}.svg`;
};
