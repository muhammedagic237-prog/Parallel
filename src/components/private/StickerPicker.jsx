import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { emojiToUrl } from '../../utils/emojiToUrl';

const STICKER_PACKS = [
    {
        name: "Love",
        icon: "❤️",
        stickers: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "😍", "🥰", "😘", "💋", "🫶", "🥲"]
    },
    {
        name: "Reactions",
        icon: "😂",
        stickers: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥹", "😍", "🤩", "😏", "🤔", "🤫", "🤭", "😶", "😑", "😤", "🥺"]
    },
    {
        name: "Dark",
        icon: "💀",
        stickers: ["💀", "☠️", "👻", "👽", "👾", "🤖", "🎃", "😈", "👿", "🔥", "💣", "🕳️", "⚰️", "🪦", "🩸", "🦇", "🕷️", "🕸️", "🌑", "⚡", "💥", "🌪️", "🫥", "🤐"]
    },
    {
        name: "Objects",
        icon: "🔫",
        stickers: ["🔫", "💣", "🗡️", "⚔️", "🛡️", "💊", "💉", "🚬", "🥊", "🗿", "⛓️", "🔪", "🪓", "🏴‍☠️", "💰", "💵", "💎", "🎰", "🎯", "🧨", "🪖", "🎱", "🏎️", "💸"]
    },
    {
        name: "Money",
        icon: "💰",
        stickers: ["💰", "💵", "💴", "💶", "💷", "💸", "💳", "🪙", "💎", "📈", "📉", "🏦", "🤑", "💲", "🏧", "💹", "🎰", "🏆", "👑", "🥇", "🎩", "🕶️", "🛥️", "✈️"]
    },
    {
        name: "Hands",
        icon: "🤝",
        stickers: ["👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️", "🤟", "🤘", "👌", "🤌", "🤏", "👈", "👉", "👆", "👇", "☝️", "🫵", "🫰", "🤙", "💪", "🙏", "🤝"]
    },
    {
        name: "Animals",
        icon: "🐺",
        stickers: ["🐺", "🦁", "🐯", "🐍", "🦈", "🦅", "🐉", "🦂", "🐊", "🦍", "🐻", "🐆", "🦇", "🕷️", "🐗", "🦎", "🐘", "🐬", "🦏", "🐃", "🦬", "🐲", "🦖", "🦕"]
    },
    {
        name: "Fun",
        icon: "🎉",
        stickers: ["🎉", "🎊", "🎈", "🎁", "🪅", "🎵", "🎶", "🎸", "🥁", "🎤", "🎧", "🎮", "🕹️", "🎲", "🎯", "🏀", "⚽", "🏈", "🎳", "🛹", "🏄", "🎪", "🤹", "🎭"]
    },
    {
        name: "Food",
        icon: "🍕",
        stickers: ["🍕", "🍔", "🌮", "🍟", "🍗", "🥩", "🍖", "🌭", "🍿", "🧁", "🍩", "🍪", "🎂", "🍰", "🍫", "🍬", "🍭", "🍺", "🍻", "🥂", "🍾", "🍷", "☕", "🧃"]
    },
    {
        name: "Weather",
        icon: "🌩️",
        stickers: ["🌩️", "⛈️", "🌧️", "❄️", "🌪️", "🌈", "☀️", "🌙", "⭐", "🌟", "💫", "✨", "☄️", "🌊", "🔥", "❤️‍🔥", "🌋", "🏔️", "🌄", "🌅", "🌃", "🌌", "🪐", "🌍"]
    },
    {
        name: "Flags",
        icon: "🏴",
        stickers: ["🏴‍☠️", "🏁", "🚩", "🏳️‍🌈", "🇺🇸", "🇬🇧", "🇩🇪", "🇫🇷", "🇪🇸", "🇮🇹", "🇧🇷", "🇯🇵", "🇰🇷", "🇨🇳", "🇷🇺", "🇹🇷", "🇸🇦", "🇮🇳", "🇦🇺", "🇨🇦", "🇲🇽", "🇦🇷", "🇳🇬", "🇿🇦"]
    },
    {
        name: "Symbols",
        icon: "⚠️",
        stickers: ["⚠️", "🚫", "❌", "⭕", "❗", "❓", "‼️", "⁉️", "♻️", "✅", "☑️", "🔘", "🔴", "🟢", "🔵", "🟡", "⚪", "⚫", "🟤", "🟠", "🟣", "♾️", "💯", "🆘"]
    }
];

const StickerPicker = ({ onSelect, onClose }) => {
    const [activePack, setActivePack] = useState(0);

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 h-[55vh] rounded-t-3xl shadow-2xl z-40 flex flex-col overflow-hidden"
            style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(50px) saturate(200%)',
                WebkitBackdropFilter: 'blur(50px) saturate(200%)',
                borderTop: '1px solid rgba(255, 255, 255, 0.7)',
                boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.06)',
            }}
        >
            {/* Header + Close */}
            <div className="w-full flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.5)' }}>
                <span className="font-medium text-sm" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{STICKER_PACKS[activePack].name}</span>
                <button onClick={onClose} className="p-2 rounded-full transition-colors" style={{ background: 'rgba(0,0,0,0.05)', color: 'rgba(0, 0, 0, 0.4)' }}>
                    <X size={18} />
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-1 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.4)' }}>
                {STICKER_PACKS.map((pack, idx) => (
                    <button
                        key={pack.name}
                        onClick={() => setActivePack(idx)}
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                        style={activePack === idx
                            ? { background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.15))', border: '1px solid rgba(59, 130, 246, 0.3)', transform: 'scale(1.1)', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.12)' }
                            : { background: 'rgba(255,255,255,0.3)', border: '1px solid transparent' }
                        }
                        title={pack.name}
                    >
                        <img src={emojiToUrl(pack.icon)} alt={pack.name} width={22} height={22} loading="lazy" />
                    </button>
                ))}
            </div>

            {/* Sticker Grid */}
            <div className="flex-1 overflow-y-auto p-3">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePack}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.15 }}
                        className="grid grid-cols-6 gap-2"
                    >
                        {STICKER_PACKS[activePack].stickers.map((sticker, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.85 }}
                                onClick={() => onSelect(sticker)}
                                className="aspect-square flex items-center justify-center rounded-xl transition-colors active:opacity-70 p-1.5"
                                style={{ background: 'transparent' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <img
                                    src={emojiToUrl(sticker)}
                                    alt={sticker}
                                    width={42}
                                    height={42}
                                    loading="lazy"
                                    draggable={false}
                                    style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }}
                                />
                            </motion.button>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default StickerPicker;
