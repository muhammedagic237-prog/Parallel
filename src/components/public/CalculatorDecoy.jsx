import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Info, X } from 'lucide-react';

const CalculatorDecoy = ({ onLock }) => {
    const [display, setDisplay] = useState('0');
    const [prevValue, setPrevValue] = useState(null);
    const [operator, setOperator] = useState(null);
    const [waitingForNewValue, setWaitingForNewValue] = useState(false);
    const [showLegal, setShowLegal] = useState(false);

    const pressTimer = useRef(null);

    // -- Math Engine --
    const calculate = (a, b, op) => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (isNaN(numA) || isNaN(numB)) return typeof b === 'string' ? b : String(b);

        let result = 0;
        switch (op) {
            case '+': result = numA + numB; break;
            case '-': result = numA - numB; break;
            case '×': result = numA * numB; break;
            case '÷':
                if (numB === 0) return 'Error';
                result = numA / numB;
                break;
            default: return String(b);
        }
        // Fix JS floating point issues (e.g. 0.1 + 0.2)
        return String(parseFloat(Number(result).toPrecision(10)));
    };

    // -- Button Handlers --
    const inputDigit = (digit) => {
        if (display === 'Error') {
            setDisplay(digit);
            setWaitingForNewValue(false);
            return;
        }

        if (waitingForNewValue) {
            setDisplay(digit);
            setWaitingForNewValue(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };

    const inputDot = () => {
        if (waitingForNewValue) {
            setDisplay('0.');
            setWaitingForNewValue(false);
            return;
        }
        if (display.indexOf('.') === -1 && display !== 'Error') {
            setDisplay(display + '.');
        }
    };

    const clearAll = () => {
        setDisplay('0');
        setPrevValue(null);
        setOperator(null);
        setWaitingForNewValue(false);
    };

    const toggleSign = () => {
        if (display === 'Error') return;
        const val = parseFloat(display);
        if (isNaN(val)) return;
        setDisplay(String(val * -1));
    };

    const inputPercent = () => {
        if (display === 'Error') return;
        const val = parseFloat(display);
        if (isNaN(val)) return;
        setDisplay(String(parseFloat(Number(val / 100).toPrecision(10))));
    };

    const handleOperator = (nextOperator) => {
        if (display === 'Error') return;

        if (operator && !waitingForNewValue) {
            const result = calculate(prevValue, display, operator);
            setDisplay(result);
            setPrevValue(result);
        } else {
            setPrevValue(display);
        }

        setOperator(nextOperator);
        setWaitingForNewValue(true);
    };

    const handleEquals = useCallback(() => {
        if (!operator || !prevValue || display === 'Error') return;

        const result = calculate(prevValue, display, operator);
        setDisplay(result);
        setPrevValue(null);
        setOperator(null);
        setWaitingForNewValue(true);
    }, [operator, prevValue, display]);

    // -- Secret Trigger Mechanism --
    const handleEqualsInteractionStart = useCallback(() => {
        handleEquals();

        pressTimer.current = setTimeout(() => {
            setDisplay(currentDisplay => {
                if (currentDisplay === '2025' || currentDisplay === '2025.') {
                    setTimeout(() => {
                        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
                        onLock();
                    }, 0);
                }
                return currentDisplay;
            });
        }, 1500);
    }, [handleEquals, onLock]);

    const handleEqualsInteractionEnd = useCallback(() => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    }, []);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (pressTimer.current) clearTimeout(pressTimer.current);
        };
    }, []);

    // Format display number with commas
    const formatDisplay = (val) => {
        if (val === 'Error') return val;
        const parts = val.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    // Scale text to fit display if it gets too long
    const displayLength = display.length;
    let fontSize = 'text-7xl';
    if (displayLength > 7) fontSize = 'text-6xl';
    if (displayLength > 9) fontSize = 'text-5xl';
    if (displayLength > 12) fontSize = 'text-4xl';

    return (
        <div className="h-[100dvh] w-full bg-black flex flex-col font-sans select-none overflow-hidden relative">

            {/* Info Button for Legal Requirements */}
            <button
                onClick={() => setShowLegal(true)}
                className="absolute top-12 left-6 p-2 text-white/50 hover:text-white/70 active:text-white/90 transition-colors z-10"
            >
                <Info size={22} />
            </button>

            {/* Legal / Info Modal */}
            <AnimatePresence>
                {showLegal && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute inset-0 z-50 bg-[#1c1c1e] text-white flex flex-col"
                    >
                        <header className="flex justify-between items-center p-4 border-b border-white/10 shrink-0">
                            <h2 className="text-xl font-semibold">About Parallel</h2>
                            <button onClick={() => setShowLegal(false)} className="p-2 bg-white/10 rounded-full active:bg-white/20 transition-colors">
                                <X size={20} />
                            </button>
                        </header>
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-sm text-gray-300 leading-relaxed font-light">
                            <section>
                                <h3 className="text-white font-medium text-lg mb-2">Privacy Policy</h3>
                                <p className="mb-3">Parallel is designed with privacy as the foundation. We collect the absolute minimum data required to facilitate peer-to-peer connections.</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Signaling Data:</strong> To establish connections, we temporarily store your chosen username, a randomly generated peer ID, and an ephemeral public encryption key in Google Firebase Firestore. This data is automatically deleted when you leave the room or after 15 seconds of inactivity.</li>
                                    <li><strong>PeerJS Server:</strong> We use PeerJS cloud signaling to negotiate WebRTC connections. PeerJS does not store message content.</li>
                                    <li><strong>End-to-End Encryption:</strong> All messages are encrypted using ECDH (P-256) + AES-GCM (256-bit). Only sender and recipient can decrypt. We cannot read your messages.</li>
                                    <li><strong>No Analytics:</strong> We do not use any third-party analytics, tracking, or advertising SDKs.</li>
                                    <li><strong>Data Deletion:</strong> Signaling data is auto-deleted when you leave. Use Panic Wipe to instantly purge all local data. Contact support@parallelapp.io for additional requests.</li>
                                    <li><strong>No Account Required:</strong> Parallel requires no phone number, email, or registration.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-white font-medium text-lg mb-2">Terms of Use (EULA)</h3>
                                <p className="mb-3">By using Parallel, you agree to the following terms:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Zero Tolerance Policy:</strong> Parallel maintains a strict zero-tolerance policy for objectionable content, including hate speech, harassment, bullying, threats, sexually explicit material, content involving minors, and illegal activity.</li>
                                    <li><strong>Content Filtering:</strong> Parallel employs client-side content filtering to detect and block objectionable material before it is sent.</li>
                                    <li><strong>User Blocking &amp; Reporting:</strong> You can instantly block and report any peer. This severs the cryptographic connection and purges all local session data.</li>
                                    <li><strong>User Responsibility:</strong> You are responsible for the content you send and the connections you accept.</li>
                                    <li><strong>Age Requirement:</strong> You must be at least 17 years old to use Parallel.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-white font-medium text-lg mb-2">Contact</h3>
                                <p>For support, privacy inquiries, or to report abuse:</p>
                                <p className="mt-2"><strong className="text-white">Email:</strong> support@parallelapp.io</p>
                            </section>

                            <div className="pt-8 pb-12 text-center text-xs text-white/30">
                                Parallel v1.0.0<br />
                                End-to-end encrypted P2P messenger.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Display Area */}
            <div className={`flex-1 flex items-end justify-end px-6 pb-4 ${fontSize} tracking-tight font-light text-white overflow-hidden break-all`}>
                {formatDisplay(display)}
            </div>

            {/* Keypad */}
            <div className="w-full px-4 space-y-3" style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>
                {/* Row 1 */}
                <div className="flex gap-3 justify-between">
                    <button onClick={clearAll} className="w-[22%] aspect-square rounded-full bg-[#a5a5a5] active:bg-[#d4d4d2] active:scale-[0.92] text-black text-2xl font-medium transition-all duration-100">
                        {display === '0' ? 'AC' : 'C'}
                    </button>
                    <button onClick={toggleSign} className="w-[22%] aspect-square rounded-full bg-[#a5a5a5] active:bg-[#d4d4d2] active:scale-[0.92] text-black text-2xl font-medium transition-all duration-100">
                        +/-
                    </button>
                    <button onClick={inputPercent} className="w-[22%] aspect-square rounded-full bg-[#a5a5a5] active:bg-[#d4d4d2] active:scale-[0.92] text-black text-2xl font-medium transition-all duration-100">
                        %
                    </button>
                    <button onClick={() => handleOperator('÷')} className={`w-[22%] aspect-square rounded-full text-3xl font-medium transition-all duration-100 active:scale-[0.92] ${operator === '÷' && waitingForNewValue ? 'bg-white text-[#f1a33b]' : 'bg-[#f1a33b] active:bg-[#f3c285] text-white'}`}>
                        ÷
                    </button>
                </div>
                {/* Row 2 */}
                <div className="flex gap-3 justify-between">
                    <button onClick={() => inputDigit('7')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] active:scale-[0.92] text-white text-3xl font-normal transition-all duration-100">7</button>
                    <button onClick={() => inputDigit('8')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] active:scale-[0.92] text-white text-3xl font-normal transition-all duration-100">8</button>
                    <button onClick={() => inputDigit('9')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] active:scale-[0.92] text-white text-3xl font-normal transition-all duration-100">9</button>
                    <button onClick={() => handleOperator('×')} className={`w-[22%] aspect-square rounded-full text-3xl font-medium transition-all duration-100 active:scale-[0.92] ${operator === '×' && waitingForNewValue ? 'bg-white text-[#f1a33b]' : 'bg-[#f1a33b] active:bg-[#f3c285] text-white'}`}>
                        ×
                    </button>
                </div>
                {/* Row 3 */}
                <div className="flex gap-3 justify-between">
                    <button onClick={() => inputDigit('4')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] active:scale-[0.92] text-white text-3xl font-normal transition-all duration-100">4</button>
                    <button onClick={() => inputDigit('5')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] active:scale-[0.92] text-white text-3xl font-normal transition-all duration-100">5</button>
                    <button onClick={() => inputDigit('6')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] active:scale-[0.92] text-white text-3xl font-normal transition-all duration-100">6</button>
                    <button onClick={() => handleOperator('-')} className={`w-[22%] aspect-square rounded-full text-4xl font-medium transition-all duration-100 active:scale-[0.92] ${operator === '-' && waitingForNewValue ? 'bg-white text-[#f1a33b]' : 'bg-[#f1a33b] active:bg-[#f3c285] text-white'}`}>
                        −
                    </button>
                </div>
                {/* Row 4 */}
                <div className="flex gap-3 justify-between">
                    <button onClick={() => inputDigit('1')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] active:scale-[0.92] text-white text-3xl font-normal transition-all duration-100">1</button>
                    <button onClick={() => inputDigit('2')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] active:scale-[0.92] text-white text-3xl font-normal transition-all duration-100">2</button>
                    <button onClick={() => inputDigit('3')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] active:scale-[0.92] text-white text-3xl font-normal transition-all duration-100">3</button>
                    <button onClick={() => handleOperator('+')} className={`w-[22%] aspect-square rounded-full text-4xl font-medium transition-all duration-100 active:scale-[0.92] ${operator === '+' && waitingForNewValue ? 'bg-white text-[#f1a33b]' : 'bg-[#f1a33b] active:bg-[#f3c285] text-white'}`}>
                        +
                    </button>
                </div>
                {/* Row 5 */}
                <div className="flex gap-3 justify-between">
                    <button onClick={() => inputDigit('0')} className="w-[47.5%] aspect-[2.15/1] rounded-full bg-[#333333] active:bg-[#737373] active:scale-[0.95] text-white text-3xl font-normal transition-all duration-100 flex items-center justify-start pl-8 text-left">
                        0
                    </button>
                    <button onClick={inputDot} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] active:scale-[0.92] text-white text-3xl font-normal transition-all duration-100">.</button>

                    {/* The Secret '=' Button */}
                    <button
                        onMouseDown={handleEqualsInteractionStart}
                        onMouseUp={handleEqualsInteractionEnd}
                        onMouseLeave={handleEqualsInteractionEnd}
                        onTouchStart={handleEqualsInteractionStart}
                        onTouchEnd={handleEqualsInteractionEnd}
                        className="w-[22%] aspect-square rounded-full bg-[#f1a33b] active:bg-[#f3c285] active:scale-[0.92] text-white text-4xl font-medium transition-all duration-100 select-none"
                    >
                        =
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalculatorDecoy;
