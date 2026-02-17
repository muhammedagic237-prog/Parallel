import React, { useState } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Lock, Fingerprint } from 'lucide-react';

const AuthGate = ({ onAuthenticated }) => {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);

    // In a real app, this would be hashed/salted
    const SECRET_PIN = "2025";
    const DUMMY_PIN = "0000";

    const handleInput = (num) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            // Haptic feedback per keypress
            if (navigator.vibrate) navigator.vibrate(15);

            if (newPin.length === 4) {
                if (newPin === SECRET_PIN) {
                    if (navigator.vibrate) navigator.vibrate(30);
                    onAuthenticated('private');
                } else if (newPin === DUMMY_PIN) {
                    if (navigator.vibrate) navigator.vibrate(30);
                    onAuthenticated('dummy');
                } else {
                    // Error haptic — strong double buzz
                    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
                    setError(true);
                    setTimeout(() => {
                        setPin("");
                        setError(false);
                    }, 500);
                }
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white select-none"
        >
            <div className="mb-8 flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${error ? 'bg-red-500' : 'bg-white/10'}`}>
                    {error ? <Lock size={32} /> : <div className="animate-pulse"><Fingerprint size={40} /></div>}
                </div>
                <h2 className="text-xl font-medium tracking-wide">Enter Passcode</h2>
                <div className="flex gap-4 mt-6 h-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < pin.length ? 'bg-white' : 'bg-white/20'}`} />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 w-72">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleInput(num)}
                        className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-2xl font-light transition-colors"
                    >
                        {num}
                    </button>
                ))}
                <div className="w-16 h-16" /> {/* Spacer */}
                <button
                    onClick={() => handleInput(0)}
                    className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-2xl font-light transition-colors"
                >
                    0
                </button>
                <button className="w-16 h-16 flex items-center justify-center" onClick={handleDelete}>
                    <span className="text-xl">⌫</span>
                </button>
            </div>
        </motion.div>
    );
};

export default AuthGate;
