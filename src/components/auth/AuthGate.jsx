import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

// Hash PIN with SHA-256 so plaintext is never stored on disk
const hashPin = async (pin) => {
    const encoded = new TextEncoder().encode(pin + '_parallel_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const AuthGate = ({ onAuthenticated }) => {
    const [savedHash, setSavedHash] = useState(() => localStorage.getItem('parallel_secret_pin'));
    const [isSettingPin, setIsSettingPin] = useState(() => !localStorage.getItem('parallel_secret_pin'));
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [setupStep, setSetupStep] = useState(1);
    const [firstPin, setFirstPin] = useState("");

    const handleInput = (num) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            if (navigator.vibrate) navigator.vibrate(15);

            if (newPin.length === 4) {
                if (isSettingPin) {
                    if (setupStep === 1) {
                        if (navigator.vibrate) navigator.vibrate(30);
                        setFirstPin(newPin);
                        setSetupStep(2);
                        setTimeout(() => setPin(""), 300);
                    } else {
                        if (newPin === firstPin) {
                            if (navigator.vibrate) navigator.vibrate(30);
                            hashPin(newPin).then(hash => {
                                localStorage.setItem('parallel_secret_pin', hash);
                                setSavedHash(hash);
                                setIsSettingPin(false);
                                setPin("");
                                setFirstPin("");
                                setSetupStep(1);
                            });
                        } else {
                            if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
                            setError(true);
                            setTimeout(() => {
                                setPin("");
                                setFirstPin("");
                                setSetupStep(1);
                                setError(false);
                            }, 500);
                        }
                    }
                } else {
                    // Migration: old plaintext PINs are 4 chars, new hashes are 64 chars
                    if (savedHash && savedHash.length <= 4) {
                        // Legacy plaintext PIN — compare directly, then upgrade to hash
                        if (newPin === savedHash) {
                            if (navigator.vibrate) navigator.vibrate(30);
                            hashPin(newPin).then(hash => {
                                localStorage.setItem('parallel_secret_pin', hash);
                                setSavedHash(hash);
                            });
                            onAuthenticated();
                        } else {
                            if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
                            setError(true);
                            setTimeout(() => {
                                setPin("");
                                setError(false);
                            }, 500);
                        }
                    } else {
                        hashPin(newPin).then(hash => {
                            if (hash === savedHash) {
                                if (navigator.vibrate) navigator.vibrate(30);
                                onAuthenticated();
                            } else {
                                if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
                                setError(true);
                                setTimeout(() => {
                                    setPin("");
                                    setError(false);
                                }, 500);
                            }
                        });
                    }
                }
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key >= '0' && e.key <= '9') handleInput(e.key);
            if (e.key === 'Backspace') setPin(p => p.slice(0, -1));
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="h-full w-full flex flex-col items-center justify-center px-8"
            style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(60px) saturate(200%)', WebkitBackdropFilter: 'blur(60px) saturate(200%)' }}
        >
            {/* Lock Icon */}
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${isSettingPin ? 'mb-4' : 'mb-8'}`}
                style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.7)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)' }}
            >
                <span className="text-3xl">{isSettingPin ? '🔑' : '🔒'}</span>
            </div>

            {isSettingPin && (
                <div className="text-center mb-8">
                    <h2 className="text-lg font-bold" style={{ color: 'rgba(0,0,0,0.85)' }}>
                        {setupStep === 1 ? 'Set Parallel PIN' : 'Confirm PIN'}
                    </h2>
                    <p className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.5)' }}>
                        {setupStep === 1 ? 'Choose a 4-digit code for your secure chat' : 'Enter the code again to verify'}
                    </p>
                </div>
            )}

            {/* PIN Dots */}
            <div className="flex gap-5 mb-10">
                {[0, 1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        animate={error ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                        transition={{ duration: 0.3 }}
                        className="w-3.5 h-3.5 rounded-full transition-all duration-200"
                        style={pin.length > i
                            ? { background: 'rgba(0, 0, 0, 0.7)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }
                            : { background: 'rgba(0, 0, 0, 0.12)', border: '1.5px solid rgba(0, 0, 0, 0.2)' }
                        }
                    />
                ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-5 w-72 place-items-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleInput(String(num))}
                        className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-medium active:scale-90 transition-all"
                        style={{
                            color: 'rgba(0, 0, 0, 0.8)',
                            background: 'rgba(255, 255, 255, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                        }}
                    >
                        {num}
                    </button>
                ))}
                <div />
                <button
                    onClick={() => handleInput("0")}
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-medium active:scale-90 transition-all"
                    style={{
                        color: 'rgba(0, 0, 0, 0.8)',
                        background: 'rgba(255, 255, 255, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    }}
                >
                    0
                </button>
                <button
                    onClick={() => setPin(p => p.slice(0, -1))}
                    className="w-20 h-20 rounded-full flex items-center justify-center text-xl active:scale-90 transition-all"
                    style={{ color: 'rgba(0, 0, 0, 0.5)' }}
                >
                    ⌫
                </button>
            </div>

            {/* Forgot PIN helper — only shown on login, not setup */}
            {!isSettingPin && (
                <div className="mt-8 text-center px-6">
                    <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(0, 0, 0, 0.3)' }}>
                        <span className="font-semibold" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>Forgot your PIN?</span>
                        {' '}Delete and reinstall the app to reset. Parallel stores zero data — you won't lose anything.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AuthGate;
