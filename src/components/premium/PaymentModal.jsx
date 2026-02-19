import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { usePremium } from '../../context/PremiumContext';

const PaymentModal = ({ onClose, onSuccess }) => {
    const { unlockPremium } = usePremium();
    const [step, setStep] = useState('form'); // form | processing | success
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    const handlePay = (e) => {
        e.preventDefault();
        setStep('processing');
        setTimeout(() => {
            setStep('success');
            unlockPremium();
            setTimeout(() => {
                if (onSuccess) onSuccess();
                else onClose();
            }, 2000);
        }, 1500);
    };

    // Format card number with spaces
    const handleCardChange = (e) => {
        const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            setCardNumber(parts.join(' '));
        } else {
            setCardNumber(v);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: 'rgba(6, 10, 20, 0.85)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                style={{ background: 'rgba(12, 16, 30, 0.9)', border: '1px solid rgba(120, 180, 255, 0.1)', backdropFilter: 'blur(20px)' }}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Lock size={20} className="text-green-500" />
                            Secure Checkout
                        </h3>
                        <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'form' && (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                onSubmit={handlePay}
                                className="space-y-4"
                            >
                                <div className="p-4 rounded-xl mb-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(30, 50, 100, 0.3), rgba(20, 30, 60, 0.5))', border: '1px solid rgba(120, 180, 255, 0.1)' }}>
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <CreditCard size={120} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="text-xs text-gray-400 uppercase mb-1">Card Number</div>
                                        <div className="text-xl font-mono text-white mb-4 tracking-wider">
                                            {cardNumber || '0000 0000 0000 0000'}
                                        </div>
                                        <div className="flex justify-between">
                                            <div>
                                                <div className="text-[10px] text-gray-400 uppercase">Card Holder</div>
                                                <div className="text-sm font-medium text-gray-300">PARALLEL USER</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-400 uppercase">Expires</div>
                                                <div className="text-sm font-medium text-gray-300">{expiry || 'MM/YY'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Card Number</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="text"
                                                value={cardNumber}
                                                onChange={handleCardChange}
                                                className="w-full rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-mono"
                                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(120, 180, 255, 0.1)', color: 'white' }}
                                                placeholder="0000 0000 0000 0000"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Expiry Date</label>
                                            <input
                                                type="text"
                                                value={expiry}
                                                onChange={(e) => setExpiry(e.target.value.replace(/[^0-9/]/g, '').slice(0, 5))}
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                className="w-full rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-center font-mono"
                                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(120, 180, 255, 0.1)' }}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">CVC</label>
                                            <input
                                                type="text"
                                                value={cvc}
                                                onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                                                placeholder="123"
                                                maxLength={3}
                                                className="w-full rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-center font-mono"
                                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(120, 180, 255, 0.1)' }}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full text-white font-bold py-3.5 rounded-xl active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, rgba(56, 140, 255, 0.7), rgba(100, 80, 255, 0.6))', border: '1px solid rgba(120, 180, 255, 0.2)', boxShadow: '0 8px 32px rgba(56, 140, 255, 0.15)' }}
                                >
                                    Pay $4.99
                                </button>

                                <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
                                    <Lock size={10} /> Encrypted by Stripe (Mock)
                                </p>
                            </motion.form>
                        )}

                        {step === 'processing' && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-12"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <Loader2 size={48} className="text-blue-500 mb-4" />
                                </motion.div>
                                <h4 className="text-lg font-medium text-white">Processing Payment...</h4>
                                <p className="text-sm text-gray-400">Confirming with bank</p>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-8"
                            >
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className="bg-green-500/20 p-4 rounded-full mb-4"
                                >
                                    <CheckCircle size={64} className="text-green-500" />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
                                <p className="text-gray-400 text-center mb-6">
                                    Welcome to Parallel Premium.<br />
                                    All features are now unlocked.
                                </p>
                                <div className="text-xs text-gray-600">Redirecting...</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PaymentModal;
