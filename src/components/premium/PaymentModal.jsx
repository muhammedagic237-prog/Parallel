import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Lock, Zap, ShieldCheck } from 'lucide-react';
import { usePremium } from '../../context/PremiumContext';

/**
 * StoreKit-Ready Payment Modal
 * 
 * This modal acts as a placeholder for Apple StoreKit integration.
 * When the app is wrapped in Capacitor, the `handlePurchase` function
 * will be replaced with actual StoreKit/IAP calls.
 * 
 * Apple Guideline 3.1.1: All in-app purchases must use StoreKit.
 */
const PaymentModal = ({ onClose, onSuccess }) => {
    const { unlockPremium } = usePremium();
    const [purchasing, setPurchasing] = useState(false);

    const handlePurchase = async () => {
        setPurchasing(true);

        // ═══════════════════════════════════════════════════════════
        // CAPACITOR/STOREKIT INTEGRATION POINT
        // Replace this block with:
        //   import { Purchases } from '@revenuecat/purchases-capacitor';
        //   const { customerInfo } = await Purchases.purchaseProduct({ productIdentifier: 'parallel_premium_monthly' });
        //   if (customerInfo.entitlements.active['premium']) { unlockPremium(); }
        //
        // For now, simulate purchase for development/testing only.
        // This mock will be removed before App Store submission.
        // ═══════════════════════════════════════════════════════════
        setTimeout(() => {
            unlockPremium();
            setPurchasing(false);
            if (onSuccess) onSuccess();
            else onClose();
        }, 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)' }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(30px)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)' }}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                            <Zap size={20} className="text-blue-500 fill-current" />
                            Parallel Premium
                        </h3>
                        <button onClick={onClose} className="p-2 rounded-full transition-colors" style={{ background: 'rgba(0,0,0,0.05)', color: 'rgba(0, 0, 0, 0.4)' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Purchase Summary */}
                    <div className="p-5 rounded-2xl mb-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(99, 102, 241, 0.04))', border: '1px solid rgba(255, 255, 255, 0.7)' }}>
                        <div className="text-sm mb-1" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>Monthly Subscription</div>
                        <div className="text-4xl font-black mb-1" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>$4.99<span className="text-base font-normal" style={{ color: 'rgba(0, 0, 0, 0.35)' }}>/mo</span></div>
                        <div className="text-xs" style={{ color: 'rgba(0, 0, 0, 0.35)' }}>Cancel anytime</div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                        {['Encrypted image sharing', '288 emoji stickers', 'Priority features & updates'].map((f, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-green-500 flex-shrink-0" />
                                <span className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>{f}</span>
                            </div>
                        ))}
                    </div>

                    {/* Purchase Button */}
                    <button
                        onClick={handlePurchase}
                        disabled={purchasing}
                        className="w-full text-white font-bold py-4 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 8px 32px rgba(59, 130, 246, 0.25)' }}
                    >
                        {purchasing ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                <Zap size={20} className="fill-current" />
                            </motion.div>
                        ) : (
                            <>
                                <Lock size={16} />
                                Subscribe — $4.99/month
                            </>
                        )}
                    </button>

                    {/* Legal Text */}
                    <div className="text-center mt-4 space-y-1">
                        <p className="text-[10px]" style={{ color: 'rgba(0, 0, 0, 0.3)' }}>
                            Payment will be charged to your Apple ID account at confirmation of purchase.
                        </p>
                        <p className="text-[10px]" style={{ color: 'rgba(0, 0, 0, 0.3)' }}>
                            Subscription automatically renews unless canceled at least 24 hours before the end of the current period.
                        </p>
                        <p className="text-[10px]" style={{ color: 'rgba(0, 0, 0, 0.25)' }}>
                            <a href="#" className="underline">Terms of Use</a> · <a href="#" className="underline">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PaymentModal;
