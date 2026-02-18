import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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
        name: "Street",
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

const TABS_PER_ROW = 6;

const StickerPicker = ({ onSelect, onClose }) => {
    const [activePack, setActivePack] = useState(0);

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 h-[55vh] bg-gray-900 rounded-t-3xl border-t border-gray-800 shadow-2xl z-40 flex flex-col"
        >
            {/* Header + Close */}
            <div className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <span className="text-gray-400 font-medium text-sm">{STICKER_PACKS[activePack].name}</span>
                <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Category Tabs (scrollable) */}
            <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-800 px-2 py-2 gap-1 flex-shrink-0">
                {STICKER_PACKS.map((pack, idx) => (
                    <button
                        key={pack.name}
                        onClick={() => setActivePack(idx)}
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${activePack === idx
                                ? 'bg-blue-600 scale-110 shadow-lg shadow-blue-500/30'
                                : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                        title={pack.name}
                    >
                        {pack.icon}
                    </button>
                ))}
            </div>

            {/* Sticker Grid (scrollable) */}
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
                                className="aspect-square flex items-center justify-center text-4xl hover:bg-gray-800 rounded-xl transition-colors active:bg-gray-700"
                            >
                                <span style={{
                                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                                }}>
                                    {sticker}
                                </span>
                            </motion.button>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default StickerPicker;
