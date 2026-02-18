import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star, Zap, Image as ImageIcon, Video, Ghost } from 'lucide-react';
import { usePremium } from '../../context/PremiumContext';
import PaymentModal from './PaymentModal';

const PremiumStore = ({ onClose }) => {
    const { isPremium } = usePremium();
    const [showPayment, setShowPayment] = useState(false);

    const features = [
        {
            icon: <Video className="text-blue-400" size={24} />,
            title: "4K Video Calls",
            desc: "Crystal clear, encrypted video calls."
        },
        {
            icon: <ImageIcon className="text-pink-400" size={24} />,
            title: "Unlimited Media",
            desc: "Send high-res photos & videos."
        },
        {
            icon: <Star className="text-yellow-400" size={24} />,
            title: "Premium Stickers",
            desc: "Access 500+ fun stickers."
        },
        {
            icon: <Ghost className="text-purple-400" size={24} />,
            title: "Ghost Mode",
            desc: "Hide online status completely."
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Zap size={18} className="text-white fill-current" />
                    </div>
                    <span className="font-bold text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        PARALLEL PREMIUM
                    </span>
                </div>
                <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 pb-24">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                        Unlock the <span className="text-blue-500">Full Power</span>
                    </h1>
                    <p className="text-gray-400 max-w-xs mx-auto">
                        Get the ultimate privacy experience with unlimited access to all features.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center gap-4"
                        >
                            <div className="p-3 bg-gray-800 rounded-xl">
                                {f.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-white">{f.title}</h3>
                                <p className="text-sm text-gray-500">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Plan Card */}
                <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-blue-500/30 p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-500 text-xs font-bold text-white px-3 py-1 rounded-bl-xl">
                        BEST VALUE
                    </div>
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <div className="text-sm text-blue-300 font-medium mb-1">Monthly Plan</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white">$4.99</span>
                                <span className="text-sm text-gray-400 line-through">$9.99</span>
                            </div>
                        </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                        {['Ad-free experience', 'Priority support', 'Early access to features'].map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                <Check size={14} className="text-green-400" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent">
                <button
                    onClick={() => setShowPayment(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Zap size={20} className="fill-current" />
                    {isPremium ? "You are Premium!" : "Upgrade Now"}
                </button>
                <div className="text-center mt-3">
                    <span className="text-xs text-gray-500">Cancel anytime. Secure payment via Stripe.</span>
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPayment && (
                    <PaymentModal onClose={() => {
                        setShowPayment(false);
                        // If premium was unlocked in modal, close store too after short delay
                        if (localStorage.getItem('parallel_premium_unlocked') === 'true') {
                            setTimeout(onClose, 500);
                        }
                    }} />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PremiumStore;
