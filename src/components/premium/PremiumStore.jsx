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
            icon: <ImageIcon className="text-cyan-300" size={24} />,
            title: "Unlimited Media",
            desc: "Send high-res photos & videos."
        },
        {
            icon: <Star className="text-amber-300" size={24} />,
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex flex-col overflow-hidden"
            style={{
                background: 'rgba(6, 10, 20, 0.92)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}
        >
            {/* Header */}
            <div className="p-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(56, 140, 255, 0.6), rgba(140, 100, 255, 0.5))' }}>
                        <Zap size={18} className="text-white fill-current" />
                    </div>
                    <span className="font-bold text-lg tracking-wide text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa, #a78bfa)' }}>
                        PARALLEL PREMIUM
                    </span>
                </div>
                <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 pb-24">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                        Unlock the <span style={{ color: '#60a5fa' }}>Full Power</span>
                    </h1>
                    <p className="max-w-xs mx-auto" style={{ color: 'rgba(140, 180, 255, 0.5)' }}>
                        Get the ultimate privacy experience with unlimited access to all features.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 gap-3 mb-8">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.08 }}
                            className="p-4 rounded-2xl flex items-center gap-4"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(120, 180, 255, 0.08)',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            <div className="p-3 rounded-xl" style={{ background: 'rgba(100, 160, 255, 0.08)' }}>
                                {f.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-white">{f.title}</h3>
                                <p className="text-sm" style={{ color: 'rgba(140, 180, 255, 0.4)' }}>{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Plan Card */}
                <div className="p-6 rounded-3xl relative overflow-hidden" style={{
                    background: 'linear-gradient(135deg, rgba(30, 60, 140, 0.3), rgba(80, 50, 140, 0.2))',
                    border: '1px solid rgba(100, 160, 255, 0.15)',
                    backdropFilter: 'blur(12px)',
                }}>
                    <div className="absolute top-0 right-0 text-xs font-bold text-white px-3 py-1 rounded-bl-xl" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                        BEST VALUE
                    </div>
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <div className="text-sm font-medium mb-1" style={{ color: 'rgba(140, 180, 255, 0.6)' }}>Monthly Plan</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white">$4.99</span>
                                <span className="text-sm text-gray-500 line-through">$9.99</span>
                            </div>
                        </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                        {['Ad-free experience', 'Priority support', 'Early access to features'].map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(200, 220, 255, 0.7)' }}>
                                <Check size={14} className="text-green-400" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Sticky Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: 'linear-gradient(to top, rgba(6, 10, 20, 1) 0%, rgba(6, 10, 20, 0.95) 60%, transparent 100%)' }}>
                <button
                    onClick={() => setShowPayment(true)}
                    className="w-full text-white font-bold py-4 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                    style={{
                        background: 'linear-gradient(135deg, rgba(56, 140, 255, 0.7), rgba(100, 80, 255, 0.6))',
                        border: '1px solid rgba(120, 180, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(56, 140, 255, 0.15)',
                    }}
                >
                    <Zap size={20} className="fill-current" />
                    {isPremium ? "You are Premium!" : "Upgrade Now"}
                </button>
                <div className="text-center mt-3">
                    <span className="text-xs" style={{ color: 'rgba(140, 180, 255, 0.3)' }}>Cancel anytime. Secure payment via Stripe.</span>
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPayment && (
                    <PaymentModal onClose={() => {
                        setShowPayment(false);
                    }} onSuccess={() => {
                        setShowPayment(false);
                        setTimeout(onClose, 500);
                    }} />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PremiumStore;
