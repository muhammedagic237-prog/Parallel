import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const STICKER_PACKS = [
    {
        name: "Fun",
        stickers: ["👻", "💀", "👽", "👾", "🤖", "🎃", "😺", "🙈", "🙉", "🙊", "💥", "💨", "💦", "💤", "🎉", "🎊"]
    },
    {
        name: "Love",
        stickers: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖"]
    },
    {
        name: "Reactions",
        stickers: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩"]
    },
    {
        name: "Hands",
        stickers: ["👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️", "🤟", "🤘", "👌", "🤌", "🤏", "👈", "👉", "👆"]
    }
];

const StickerPicker = ({ onSelect, onClose }) => {
    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 h-[50vh] bg-gray-900 rounded-t-3xl border-t border-gray-800 shadow-2xl z-40 flex flex-col"
        >
            {/* Handle/Header */}
            <div className="w-full flex items-center justify-between p-4 border-b border-gray-800">
                <span className="text-gray-400 font-medium ml-2">Stickers</span>
                <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-gray-400">
                    <X size={18} />
                </button>
            </div>

            {/* Sticker Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {STICKER_PACKS.map((pack) => (
                    <div key={pack.name} className="mb-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">{pack.name}</h3>
                        <div className="grid grid-cols-4 gap-4">
                            {pack.stickers.map((sticker, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onSelect(sticker)}
                                    className="aspect-square flex items-center justify-center text-5xl hover:bg-gray-800 rounded-xl transition-colors"
                                >
                                    <span style={{
                                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                                        WebkitTextStroke: "1px rgba(255,255,255,0.2)"
                                    }}>
                                        {sticker}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default StickerPicker;
