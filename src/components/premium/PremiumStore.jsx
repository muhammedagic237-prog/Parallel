import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X, Check, Star, Zap, Image as ImageIcon, Video } from 'lucide-react';
import { usePremium } from '../../context/PremiumContext';
import PaymentModal from './PaymentModal';

const PremiumStore = ({ onClose }) => {
    const { isPremium } = usePremium();
    const [showPayment, setShowPayment] = useState(false);

    const features = [
        {
            icon: <Video className="text-blue-500" size={24} />,
            title: "HD Video Calls",
            desc: "Encrypted peer-to-peer video calls."
        },
        {
            icon: <ImageIcon className="text-cyan-500" size={24} />,
            title: "Image Sharing",
            desc: "Send encrypted photos directly via P2P."
        },
        {
            icon: <Star className="text-amber-500" size={24} />,
            title: "288 Stickers",
            desc: "12 packs of expressive emoji stickers."
        },
        {
            icon: <Zap className="text-purple-500" size={24} />,
            title: "Priority Features",
            desc: "Early access to new Parallel features."
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
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(50px) saturate(200%)',
                WebkitBackdropFilter: 'blur(50px) saturate(200%)',
            }}
        >
            {/* Header */}
            <div className="p-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                        <Zap size={18} className="text-white fill-current" />
                    </div>
                    <span className="font-bold text-lg tracking-wide text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                        PARALLEL PREMIUM
                    </span>
                </div>
                <button onClick={onClose} className="p-2 rounded-full transition-colors" style={{ background: 'rgba(0,0,0,0.05)', color: 'rgba(0, 0, 0, 0.4)' }}>
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 pb-24">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black mb-2 tracking-tight" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                        Unlock the <span className="text-blue-500">Full Power</span>
                    </h1>
                    <p className="max-w-xs mx-auto" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
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
                                background: 'rgba(255,255,255,0.5)',
                                border: '1px solid rgba(255, 255, 255, 0.7)',
                                backdropFilter: 'blur(20px)',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                            }}
                        >
                            <div className="p-3 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.06)' }}>
                                {f.icon}
                            </div>
                            <div>
                                <h3 className="font-bold" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{f.title}</h3>
                                <p className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Plan Card */}
                <div className="p-6 rounded-3xl relative overflow-hidden" style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.06))',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(20px)',
                }}>
                    <div className="absolute top-0 right-0 text-xs font-bold text-white px-3 py-1 rounded-bl-xl" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                        BEST VALUE
                    </div>
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <div className="text-sm font-medium mb-1" style={{ color: 'rgba(0, 0, 0, 0.45)' }}>Monthly Plan</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>$4.99</span>
                                <span className="text-sm line-through" style={{ color: 'rgba(0, 0, 0, 0.3)' }}>$9.99</span>
                            </div>
                        </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                        {['Ad-free experience', 'Priority support', 'Early access to features'].map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                <Check size={14} className="text-green-500" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Sticky Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: 'linear-gradient(to top, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.85) 60%, transparent 100%)' }}>
                <button
                    onClick={() => setShowPayment(true)}
                    className="w-full text-white font-bold py-4 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.25)',
                    }}
                >
                    <Zap size={20} className="fill-current" />
                    {isPremium ? "You are Premium!" : "Upgrade Now"}
                </button>
                <div className="text-center mt-3">
                    <span className="text-xs" style={{ color: 'rgba(0, 0, 0, 0.3)' }}>Cancel anytime. Secure payment via Stripe.</span>
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
