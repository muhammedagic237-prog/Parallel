import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ArrowLeft, Check, CheckCheck, Smile, Trash2, Image as ImageIcon, MoreVertical, Ban, AlertTriangle, Sun, Moon, X, Camera, ChevronDown } from 'lucide-react';
import { useP2P } from '../../hooks/useP2P';
import StickerPicker from './StickerPicker';
import { emojiToUrl } from '../../utils/emojiToUrl';
import IncognitoKeyboard from './IncognitoKeyboard';
import { compressImage } from '../../utils/compressImage';
import SafeImage from './SafeImage';

const PrivateChat = ({ onLock }) => {
    const [activeChat, setActiveChat] = useState(null);
    const [setupMode, setSetupMode] = useState(true);
    const [roomId, setRoomId] = useState("");


    const [username, setUsername] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [ageConfirmed, setAgeConfirmed] = useState(false);

    // P2P Hook
    const p2p = useP2P(setupMode ? null : roomId, setupMode ? null : username);

    // Screenshot Detection (Theater/Warning)
    useEffect(() => {
        const handleKeyUp = (e) => {
            if (e.key === 'PrintScreen') {
                alert("⚠️ Security Warning: Screenshots are discouraged in Parallel.");
            }
        };
        window.addEventListener('keyup', handleKeyUp);
        return () => window.removeEventListener('keyup', handleKeyUp);
    }, []);

    // Auto-navigate to chat when first peer connects — ONLY ONCE
    const hasAutoNavigated = useRef(false);
    useEffect(() => {
        if (!hasAutoNavigated.current && !activeChat && p2p.peers.length === 1) {
            hasAutoNavigated.current = true;
            const peer = p2p.peers[0];
            queueMicrotask(() => setActiveChat({ id: peer.id, name: peer.user }));
        }
    }, [p2p.peers, activeChat]);

    const handleConnect = (e) => {
        e.preventDefault();
        if (!roomId || !username) return;
        const letters = (roomId.match(/[a-zA-Z]/g) || []).length;
        const numbers = (roomId.match(/[0-9]/g) || []).length;
        if (letters < 4 || numbers < 3) {
            alert("Room key must contain at least 4 letters and 3 numbers (in any order).");
            return;
        }
        if (!ageConfirmed || !termsAccepted) {
            alert("You must confirm your age and accept the Terms of Use to continue.");
            return;
        }
        setSetupMode(false);
    };

    // SETUP / LOGIN SCREEN — iOS 26 Liquid Glass
    if (setupMode) {
        return (
            <div className="h-[100dvh] flex flex-col items-center justify-center p-8 font-sans overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(60px) saturate(200%)', WebkitBackdropFilter: 'blur(60px) saturate(200%)' }}
            >
                {/* LOGO */}
                <div className="mb-12 relative flex flex-col items-center">
                    <button onClick={onLock} className="absolute -top-8 left-0 transition-colors" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <clipPath id="roundedBox">
                                <rect x="5" y="5" width="90" height="90" rx="25" />
                            </clipPath>
                        </defs>
                        <rect x="5" y="5" width="90" height="90" rx="25" stroke="rgba(0,0,0,0.7)" strokeWidth="3" fill="rgba(255,255,255,0.3)" />
                        <g clipPath="url(#roundedBox)">
                            <line x1="38" y1="0" x2="38" y2="100" stroke="rgba(0,0,0,0.7)" strokeWidth="4" />
                            <line x1="62" y1="0" x2="62" y2="100" stroke="rgba(0,0,0,0.7)" strokeWidth="4" />
                        </g>
                    </svg>
                    <h1 className="text-2xl font-light tracking-[0.3em] mt-6" style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(0, 0, 0, 0.8)' }}>PARALLEL</h1>
                </div>

                <form onSubmit={handleConnect} autoComplete="off" className="w-full max-w-sm space-y-4">
                    <div className="space-y-3">
                        <input
                            value={username} onChange={e => setUsername(e.target.value)}
                            placeholder="Username"
                            className="w-full p-4 rounded-2xl outline-none text-base transition-colors"
                            style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.7)', color: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            name="p_alias"
                            data-lpignore="true"
                            data-1p-ignore
                            data-form-type="other"
                            autoFocus
                        />
                        <input
                            value={roomId} onChange={e => setRoomId(e.target.value)}
                            placeholder="Room Key"
                            className="w-full p-4 rounded-2xl outline-none text-base transition-colors"
                            style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.7)', color: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            name="p_rkey"
                            data-lpignore="true"
                            data-1p-ignore
                            data-form-type="other"
                        />
                    </div>

                    {/* Apple Compliance: Terms Acceptance & Age Gate */}
                    <div className="space-y-3 px-1">
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                            <input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)}
                                className="mt-0.5 w-5 h-5 rounded accent-blue-500 flex-shrink-0" />
                            <span className="text-xs leading-relaxed" style={{ color: 'rgba(0, 0, 0, 0.55)' }}>
                                I confirm I am <strong>at least 17 years old</strong>
                            </span>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                            <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="mt-0.5 w-5 h-5 rounded accent-blue-500 flex-shrink-0" />
                            <span className="text-xs leading-relaxed" style={{ color: 'rgba(0, 0, 0, 0.55)' }}>
                                I agree to the <strong>Terms of Use</strong> and <strong>Privacy Policy</strong> and understand that Parallel has a zero-tolerance policy for objectionable content
                            </span>
                        </label>
                    </div>

                    <button type="submit"
                        disabled={!termsAccepted || !ageConfirmed}
                        className="w-full p-4 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.25)' }}
                    >
                        <span>Enter Parallel</span>
                        <ArrowLeft className="rotate-180" size={18} />
                    </button>
                </form>

                <div className="mt-auto mb-4 text-xs font-medium tracking-widest text-center" style={{ color: 'rgba(0, 0, 0, 0.3)' }}>
                    ENCRYPTED P2P MESSENGER
                </div>
            </div>
        );
    }

    return (
        <div className="h-[100dvh] w-full flex flex-col font-sans overflow-hidden relative parallel-container">
            {/* Security Watermark (Visual Deterrent) */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.02] overflow-hidden flex flex-wrap content-center justify-center select-none">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="w-64 h-64 flex items-center justify-center transform -rotate-45">
                        <span className="text-2xl font-black whitespace-nowrap" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>PARALLEL SECURE</span>
                    </div>
                ))}
            </div>
            <AnimatePresence initial={false}>
                {activeChat ? (
                    <ConversationView
                        key="conversation"
                        chat={activeChat}
                        messages={p2p.messages.filter(m => m.peerId === activeChat.id)}
                        onSendMessage={(text, type) => p2p.sendMessage(text, activeChat.id, type)}

                        onBack={() => setActiveChat(null)}
                        isTyping={!!p2p.typingPeers[activeChat.id]}
                        onTyping={() => p2p.sendTyping(activeChat.id)}
                        onWipeAndLock={() => { p2p.panicWipe(); onLock(); }}
                    />
                ) : (
                    <ChatListView
                        key="list"
                        peers={p2p.peers}
                        onLock={onLock}
                        onSelectChat={(peer) => setActiveChat(peer)}
                        status={p2p.status}
                        currentUser={username}
                        onPanicWipe={() => { p2p.panicWipe(); onLock(); }}
                    />
                )}
            </AnimatePresence>




        </div>
    );
};

// --- CHAT LIST — iOS 26 Liquid Glass ---
const ChatListView = memo(({ onLock, onSelectChat, peers, status, currentUser, onPanicWipe }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col h-full"
    >
        {/* Header — Frosted Glass */}
        <header className="glass-header px-4 py-3 flex justify-between items-center sticky top-0 z-10" style={{ background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', borderBottom: '1px solid rgba(255, 255, 255, 0.5)', paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
            <div className="flex items-center gap-3">
                <button onClick={onLock} style={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                    <ArrowLeft size={24} strokeWidth={2} />
                </button>
                <div className="flex items-center gap-1 cursor-pointer">
                    <h1 className="text-xl font-bold" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{currentUser}</h1>
                    <span className="text-[10px] mt-1" style={{ color: 'rgba(0, 0, 0, 0.3)' }}>▼</span>
                </div>
            </div>
            <div className="flex gap-5 items-center">
                {/* Theme Toggle Button (Stateless) */}
                <button
                    onClick={() => document.body.classList.toggle('dark-theme')}
                    className="active:scale-90 transition-all text-amber-500"
                    title="Toggle Dark Theme"
                >
                    <Sun size={20} strokeWidth={2} className="icon-sun" />
                    <Moon size={20} strokeWidth={2} className="icon-moon text-gray-500" />
                </button>



                {/* Panic Wipe Button */}
                <button
                    onClick={onPanicWipe}
                    className="relative active:scale-90 transition-all"
                    title="Panic Wipe — Erase All Messages"
                >
                    <div className="p-1.5 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <Trash2 size={16} className="text-red-500" strokeWidth={2} />
                    </div>
                </button>

                {/* Mini Parallel Logo with connection indicator */}
                <div className="relative">
                    <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
                        <rect x="10" y="10" width="80" height="80" rx="22" stroke="rgba(0,0,0,0.15)" strokeWidth="4" fill="rgba(255,255,255,0.35)" />
                        <line x1="40" y1="22" x2="40" y2="78" stroke="rgba(0,0,0,0.5)" strokeWidth="5" strokeLinecap="round" />
                        <line x1="60" y1="22" x2="60" y2="78" stroke="rgba(0,0,0,0.5)" strokeWidth="5" strokeLinecap="round" />
                    </svg>
                    {status === 'connected' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                    {status === 'connecting' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white animate-pulse"></div>
                    )}
                </div>
            </div>
        </header>

        {/* Connection Status Pill */}
        <div className="flex justify-center py-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.3)' }}>
            <div className="glass-pill flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.35)', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
                <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : status === 'connecting' ? 'bg-yellow-500 animate-pulse' : status === 'error' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                <span className="text-tertiary text-[10px] font-medium" style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                    {status === 'connected' ? 'Encrypted & Connected' : status === 'connecting' ? 'Establishing Secure Link...' : status === 'room-full' ? 'Room Full (2/2)' : status === 'error' ? 'Connection Error' : 'Disconnected'}
                </span>
            </div>
        </div>

        {/* Removed Search by User Request */}

        {/* Stories / Active Peers */}
        <div className="pl-4 pb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {/* Removed 'Your note' by User Request */}

            {peers.map(peer => (
                <div key={peer.id} className="inline-flex flex-col items-center mr-4" onClick={() => onSelectChat({ id: peer.id, name: peer.user })}>
                    <div className="w-16 h-16 rounded-full p-[2px]" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #6366f1, #0ea5e9)' }}>
                        <div className="w-full h-full rounded-full p-[2px]" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
                            <div className="w-full h-full rounded-full flex items-center justify-center text-lg font-semibold cursor-pointer" style={{ background: 'rgba(59, 130, 246, 0.08)', color: 'rgba(0, 0, 0, 0.7)' }}>
                                {(peer.user || '?')[0].toUpperCase()}
                            </div>
                        </div>
                    </div>
                    <span className="text-xs mt-1" style={{ color: 'rgba(0, 0, 0, 0.7)' }}>{peer.user}</span>
                </div>
            ))}
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 flex justify-between items-center">
                <h3 className="font-bold text-base" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>Messages</h3>
            </div>

            {peers.length === 0 && (
                <div className="flex flex-col items-center justify-center flex-1 px-6 py-10">
                    {/* Animated Radar Pulse - Larger and more premium */}
                    <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                        {/* Outer pulsing rings - Expanded insets and boosted opacity */}
                        <div className="absolute -inset-4 rounded-full animate-ping opacity-[0.2]" style={{ background: status === 'connected' ? 'rgba(59, 130, 246, 0.7)' : 'rgba(234, 179, 8, 0.7)', animationDuration: '3s' }}></div>
                        <div className="absolute -inset-2 rounded-full animate-ping opacity-[0.25]" style={{ background: status === 'connected' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(234, 179, 8, 0.6)', animationDuration: '2.5s', animationDelay: '0.4s' }}></div>
                        <div className="absolute inset-2 rounded-full animate-ping opacity-[0.3]" style={{ background: status === 'connected' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(234, 179, 8, 0.5)', animationDuration: '2s', animationDelay: '0.8s' }}></div>
                        <div className="absolute inset-6 rounded-full animate-ping opacity-[0.4]" style={{ background: status === 'connected' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(234, 179, 8, 0.4)', animationDuration: '1.5s', animationDelay: '1.2s' }}></div>
                        {/* Center icon */}
                        <div className="relative w-20 h-20 rounded-full flex items-center justify-center z-10" style={{ background: 'rgba(255, 255, 255, 0.7)', border: '2px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                            {status === 'connecting' ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(234, 179, 8, 0.9)" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                                </motion.div>
                            ) : status === 'connected' ? (
                                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(59, 130, 246, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-rotate-12"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                </motion.div>
                            ) : status === 'room-full' ? (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(239, 68, 68, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            ) : (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(0, 0, 0, 0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 8v4l3 3" /></svg>
                            )}
                        </div>
                    </div>

                    {/* Status Text */}
                    <h3 className="text-lg font-semibold mb-1" style={{ color: status === 'room-full' ? 'rgba(239, 68, 68, 0.85)' : 'rgba(0, 0, 0, 0.75)' }}>
                        {status === 'connecting' ? 'Connecting...' : status === 'connected' ? 'Room is Ready' : status === 'room-full' ? 'Room is Full' : 'Disconnected'}
                    </h3>
                    <p className="text-sm text-center mb-6" style={{ color: 'rgba(0, 0, 0, 0.35)' }}>
                        {status === 'connecting' ? 'Establishing secure connection' : status === 'connected' ? 'Share the room key with a friend to start chatting' : status === 'room-full' ? 'This room already has 2 users. Parallel supports secure 1-on-1 conversations only.' : 'Connection lost, please try again'}
                    </p>

                    {/* Connection Badge */}
                    {status === 'connected' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-4 py-2 rounded-2xl flex items-center gap-2 mb-4"
                            style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)' }}
                        >
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-medium" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>Encrypted & Listening</span>
                        </motion.div>
                    )}

                    {/* Helpful Tips */}
                    <div className="w-full max-w-xs p-4 rounded-2xl mt-2" style={{ background: 'rgba(255, 255, 255, 0.35)', border: '1px solid rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(20px)' }}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(0, 0, 0, 0.3)' }}>Quick Tips</div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59, 130, 246, 0.08)' }}>
                                    <span className="text-xs">🔒</span>
                                </div>
                                <span className="text-xs" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>Messages are end-to-end encrypted</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59, 130, 246, 0.08)' }}>
                                    <span className="text-xs">👥</span>
                                </div>
                                <span className="text-xs" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>Both users must enter the same room key</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59, 130, 246, 0.08)' }}>
                                    <span className="text-xs">💨</span>
                                </div>
                                <span className="text-xs" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>Messages vanish when you close the app</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {peers.map(peer => (
                <button
                    key={peer.id}
                    onClick={() => onSelectChat({ id: peer.id, name: peer.user })}
                    className="chat-row w-full px-4 py-3 flex items-center gap-3 transition-colors active:bg-white/30"
                >
                    <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg relative" style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(255, 255, 255, 0.5)', color: 'rgba(0, 0, 0, 0.7)' }}>
                        {(peer.user || '?')[0].toUpperCase()}
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="text-primary text-sm font-medium" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{peer.user}</h3>
                        <div className="text-tertiary text-sm flex items-center gap-1" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                            <span>Active now</span>
                            <span className="w-1 h-1 rounded-full bg-green-500"></span>
                        </div>
                    </div>
                    <div className="text-muted" style={{ color: 'rgba(0, 0, 0, 0.3)' }}>
                        <Camera size={22} strokeWidth={1.5} />
                    </div>
                </button>
            ))}

            {/* App Info Section — visible when returning from chat */}
            {peers.length > 0 && (
                <div className="mt-4 mx-4 mb-6">
                    <div className="glass-card rounded-2xl p-4" style={{ background: 'rgba(255, 255, 255, 0.35)', border: '1px solid rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(20px)' }}>
                        <div className="text-muted text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(0, 0, 0, 0.3)' }}>Privacy Status</div>
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-secondary text-xs" style={{ color: 'rgba(0, 0, 0, 0.55)' }}>End-to-end encrypted · AES-256-GCM</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-secondary text-xs" style={{ color: 'rgba(0, 0, 0, 0.55)' }}>RAM-only · Zero disk writes</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-secondary text-xs" style={{ color: 'rgba(0, 0, 0, 0.55)' }}>Peer-to-peer · No server storage</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-secondary text-xs" style={{ color: 'rgba(0, 0, 0, 0.55)' }}>Messages vanish when app closes</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-muted text-[10px] text-center mt-3 px-4" style={{ color: 'rgba(0, 0, 0, 0.25)' }}>Parallel does not store, log, or transmit your conversations. Everything exists only in device memory.</p>
                </div>
            )}
        </div>
    </motion.div>
));

// --- CONVERSATION VIEW — iOS 26 Liquid Glass ---

const formatTimestamp = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (hours < 48) return 'Yesterday ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const shouldShowTimeSeparator = (prevMsg, currMsg) => {
    if (!prevMsg) return true;
    return (currMsg.timestamp - prevMsg.timestamp) > 15 * 60 * 1000;
};

const getBubbleRounding = (isMe, isFirstInGroup, isLastInGroup) => {
    if (isMe) {
        if (isFirstInGroup && isLastInGroup) return 'rounded-[22px]';
        if (isFirstInGroup) return 'rounded-[22px] rounded-br-md';
        if (isLastInGroup) return 'rounded-[22px] rounded-tr-md';
        return 'rounded-[22px] rounded-tr-md rounded-br-md';
    } else {
        if (isFirstInGroup && isLastInGroup) return 'rounded-[22px]';
        if (isFirstInGroup) return 'rounded-[22px] rounded-bl-md';
        if (isLastInGroup) return 'rounded-[22px] rounded-tl-md';
        return 'rounded-[22px] rounded-tl-md rounded-bl-md';
    }
};



const ConversationView = memo(({ chat, onBack, messages, onSendMessage, isTyping, onTyping, onWipeAndLock }) => {
    const [input, setInput] = useState("");
    const [showStickers, setShowStickers] = useState(false);

    const [showKeyboard, setShowKeyboard] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const endRef = useRef(null);
    const typingTimeout = useRef(null);
    const fileInputRef = useRef(null);
    const inputDisplayRef = useRef(null);
    const inputRef = useRef(input);

    // Keep ref in sync — this does NOT trigger re-renders in callbacks
    useEffect(() => { inputRef.current = input; }, [input]);

    // Incognito keyboard handlers
    const handleIncognitoKey = useCallback((key) => {
        setInput(prev => prev + key);
        if (!typingTimeout.current) {
            onTyping();
            typingTimeout.current = setTimeout(() => {
                typingTimeout.current = null;
            }, 2000);
        }
    }, [onTyping]);

    const handleIncognitoBackspace = useCallback(() => {
        setInput(prev => prev.slice(0, -1));
    }, []);

    // Stable callback — reads from ref, NOT from state, so it never recreates
    const handleIncognitoEnter = useCallback(() => {
        const val = inputRef.current;
        if (!val.trim()) return;
        onSendMessage(val, 'text');
        setInput("");
        if (navigator.vibrate) navigator.vibrate(10);
    }, [onSendMessage]);



    const handleImagePick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Only images are supported.');
            return;
        }

        try {
            // ALWAYS compress through Canvas — this strips ALL EXIF metadata
            // (GPS location, camera info, original file size) for privacy.
            // Target: 800KB max for fast P2P delivery.
            const compressed = await compressImage(file, 800 * 1024);
            onSendMessage(compressed, 'image');
        } catch {
            alert('Failed to process image. Please try a different photo.');
        }
        e.target.value = '';
    }, [onSendMessage]);



    const handleSend = useCallback((e) => {
        e.preventDefault();
        const val = inputRef.current;
        if (!val.trim()) return;
        onSendMessage(val, 'text');
        setInput("");
        if (navigator.vibrate) navigator.vibrate(10);
    }, [onSendMessage]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const lastSentIdx = messages.reduce((acc, m, i) => m.isMe ? i : acc, -1);

    return (
        <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="parallel-container absolute inset-0 flex flex-col z-20"
            style={{ background: 'inherit' }}
        >
            {/* Header — Frosted Glass */}
            <header className="glass-header px-3 py-2 flex items-center justify-between" style={{ background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', borderBottom: '1px solid rgba(255, 255, 255, 0.5)', paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => { setShowKeyboard(false); setShowStickers(false); onBack(); }} className="active:opacity-50 transition-opacity" style={{ color: 'rgba(0, 0, 0, 0.7)' }}><ArrowLeft size={26} strokeWidth={1.5} /></button>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full p-[1.5px]" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #6366f1, #0ea5e9)' }}>
                            <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
                                <div className="w-full h-full rounded-full flex items-center justify-center text-sm font-bold uppercase" style={{ background: 'rgba(59, 130, 246, 0.08)', color: 'rgba(0, 0, 0, 0.7)' }}>
                                    {(chat.name || '?')[0]}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-[15px] font-semibold leading-tight" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{chat.name}</h3>
                            <span className="text-[11px] leading-tight" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                                {isTyping ? (
                                    <span className="text-blue-500 flex items-center gap-1">
                                        typing
                                        <span className="flex gap-0.5">
                                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </span>
                                    </span>
                                ) : 'Active now'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 pr-1 items-center">
                    {/* Panic Wipe — always visible in chat */}
                    <button
                        onClick={onWipeAndLock}
                        className="active:scale-90 transition-all"
                        title="Panic Wipe — Erase All & Lock"
                    >
                        <div className="p-1.5 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <Trash2 size={16} className="text-red-500" strokeWidth={2} />
                        </div>
                    </button>
                    <button onClick={() => setShowOptions(!showOptions)} className="active:opacity-50 transition-opacity" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>
                        <MoreVertical size={24} strokeWidth={1.5} />
                    </button>
                </div>
            </header>

            {/* Options Menu — Full-screen backdrop so it doesn't lag or overlap */}
            <AnimatePresence>
                {showOptions && (
                    <>
                        {/* Tap-to-dismiss backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setShowOptions(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="fixed top-14 right-4 rounded-2xl shadow-2xl py-1.5 w-52 z-50 overflow-hidden"
                            style={{ background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', border: '1px solid rgba(255, 255, 255, 0.7)' }}
                        >
                            <button
                                onClick={() => { setShowOptions(false); onWipeAndLock(); }}
                                className="w-full px-4 py-3 flex items-center gap-3 text-red-500 active:bg-red-50 font-medium text-sm transition-colors"
                            >
                                <Ban size={17} /> Block User
                            </button>
                            <div className="mx-3 h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
                            <button
                                onClick={() => { setShowOptions(false); setShowReportModal(true); }}
                                className="w-full px-4 py-3 flex items-center gap-3 text-orange-500 active:bg-orange-50 font-medium text-sm transition-colors"
                            >
                                <AlertTriangle size={17} /> Report User
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Report Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center p-6"
                        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                                <AlertTriangle size={32} className="text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Report Abuse</h3>
                            <p className="text-sm text-gray-500 mb-6 font-medium">
                                Because Parallel is an encrypted, zero-knowledge network without central servers, we cannot access your chat logs. <br /><br /> Reporting will immediately sever the P2P connection, purge all local RAM logs, and permanently block this user from your current session to ensure your safety.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 rounded-full font-semibold text-gray-600 bg-gray-100">Cancel</button>
                                <button onClick={() => { setShowReportModal(false); onWipeAndLock(); }} className="flex-1 py-3 rounded-full font-semibold text-white bg-orange-500">Report & Wipe</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
                {/* E2E Banner */}
                <div className="flex flex-col items-center mb-6 mt-2">
                    <div className="w-20 h-20 rounded-full p-[2px] mb-3" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #6366f1, #0ea5e9)' }}>
                        <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.8)' }}>
                            <div className="w-full h-full rounded-full flex items-center justify-center text-2xl font-bold uppercase" style={{ background: 'rgba(59, 130, 246, 0.08)', color: 'rgba(0, 0, 0, 0.7)' }}>
                                {(chat.name || '?')[0]}
                            </div>
                        </div>
                    </div>
                    <h3 className="font-bold text-lg" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{chat.name}</h3>
                    <p className="text-xs mt-1" style={{ color: 'rgba(0, 0, 0, 0.35)' }}>Parallel • Encrypted P2P</p>
                    <div className="rounded-full px-3 py-1.5 mt-3 flex items-center gap-1.5" style={{ background: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(0, 0, 0, 0.35)' }}>
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span className="text-[11px]" style={{ color: 'rgba(0, 0, 0, 0.35)' }}>End-to-end encrypted</span>
                    </div>
                    {messages.length === 0 && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-[11px] mt-4 text-center max-w-[240px]"
                            style={{ color: 'rgba(0, 0, 0, 0.25)' }}
                        >
                            Messages exist only in RAM and vanish when you close the app. Say something — it won't last forever.
                        </motion.p>
                    )}
                </div>

                {/* Messages */}
                {messages.map((msg, idx) => {
                    const isMe = msg.isMe;
                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;

                    const sameSenderAsPrev = prevMsg && prevMsg.isMe === isMe;
                    const sameSenderAsNext = nextMsg && nextMsg.isMe === isMe;
                    const isFirstInGroup = !sameSenderAsPrev;
                    const isLastInGroup = !sameSenderAsNext;

                    const showAvatar = !isMe && isLastInGroup;
                    const showTime = shouldShowTimeSeparator(prevMsg, msg);
                    const groupGap = isFirstInGroup && idx > 0 && !showTime ? 'mt-2' : 'mt-[2px]';
                    const bubbleRounding = getBubbleRounding(isMe, isFirstInGroup, isLastInGroup);

                    return (
                        <React.Fragment key={msg.id}>
                            {/* Time Separator */}
                            {showTime && (
                                <div className="flex justify-center my-4">
                                    <span className="text-[11px] font-medium" style={{ color: 'rgba(0, 0, 0, 0.35)' }}>
                                        {formatTimestamp(msg.timestamp)}
                                    </span>
                                </div>
                            )}

                            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${groupGap} relative group`}>
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}
                                >
                                    {/* Left-side Avatar */}
                                    {!isMe && (
                                        <div className="w-7 h-7 mr-2 flex-shrink-0 self-end">
                                            {showAvatar ? (
                                                <div className="w-full h-full rounded-full p-[1px]" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1, #0ea5e9)' }}>
                                                    <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.85)' }}>
                                                        <span className="text-[10px] font-bold uppercase select-none" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                                            {(msg.user || '?')[0]}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full" />
                                            )}
                                        </div>
                                    )}

                                    <div className="relative max-w-[75%]">


                                        {/* Message Bubble */}
                                        {msg.type === 'sticker' ? (
                                            <motion.div
                                                initial={{ scale: 0.3, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ type: 'spring', damping: 12, stiffness: 300 }}
                                                className="hover:scale-110 transition-transform cursor-pointer active:scale-95"
                                            >
                                                <img
                                                    src={emojiToUrl(msg.text)}
                                                    alt={msg.text}
                                                    width={100}
                                                    height={100}
                                                    draggable={false}
                                                    style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
                                                />
                                            </motion.div>
                                        ) : msg.type === 'image' ? (
                                            <div
                                                className={`overflow-hidden cursor-pointer ${bubbleRounding}`}
                                                style={isMe
                                                    ? { border: '2px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }
                                                    : { border: '2px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }
                                                }
                                            >
                                                <SafeImage src={msg.text} alt="Shared" className="max-w-[260px] max-h-[300px] object-cover" style={{ borderRadius: 'inherit' }} />
                                            </div>
                                        ) : (
                                            <div
                                                className={`
                                                px-3.5 py-2 text-[15px] leading-[20px] break-words select-none ${bubbleRounding}
                                            `}
                                                style={isMe
                                                    ? { background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.75), rgba(99, 102, 241, 0.65))', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)', color: 'white', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.15)' }
                                                    : { background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.65)', color: 'rgba(0, 0, 0, 0.85)', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)' }
                                                }
                                            >
                                                {msg.text}
                                            </div>
                                        )}

                                        {/* Delivery Status */}
                                        {isMe && isLastInGroup && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex justify-end mt-0.5 pr-1"
                                            >
                                                {idx === lastSentIdx && msg.status === 'delivered' ? (
                                                    <span className="text-[10px] font-normal" style={{ color: 'rgba(0, 0, 0, 0.35)' }}>Seen</span>
                                                ) : msg.status === 'delivered' ? (
                                                    <CheckCheck size={13} className="text-blue-500" />
                                                ) : msg.status === 'failed' ? (
                                                    <span className="text-[10px] text-red-500 font-medium">Not sent</span>
                                                ) : (
                                                    <Check size={13} style={{ color: 'rgba(0, 0, 0, 0.25)' }} />
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </React.Fragment>
                    );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex justify-start mt-2 mb-1"
                    >
                        <div className="w-7 h-7 rounded-full mr-2 flex-shrink-0 self-end flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.45)', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
                            <span className="text-[10px] font-bold uppercase" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>{(chat.name || '?')[0]}</span>
                        </div>
                        <div className="rounded-[22px] rounded-bl-md px-4 py-3" style={{ background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.65)' }}>
                            <div className="flex gap-1 items-center" style={{ height: 16 }}>
                                <span className="w-2 h-2 rounded-full typing-dot" style={{ background: 'rgba(0, 0, 0, 0.3)', animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 rounded-full typing-dot" style={{ background: 'rgba(0, 0, 0, 0.3)', animationDelay: '160ms' }}></span>
                                <span className="w-2 h-2 rounded-full typing-dot" style={{ background: 'rgba(0, 0, 0, 0.3)', animationDelay: '320ms' }}></span>
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={endRef} />
            </div>

            {/* Footer / Input Bar — Frosted Glass */}
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
            <form onSubmit={handleSend} className="px-3 py-2 flex items-center gap-2" style={{ background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', borderTop: '1px solid rgba(255, 255, 255, 0.5)', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
                <button type="button" onClick={handleImagePick} className="h-11 w-11 flex items-center justify-center rounded-full text-white flex-shrink-0 active:scale-90 transition-transform relative" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}>
                    <ImageIcon size={22} />

                </button>

                <div
                    className="flex-1 min-w-0 rounded-[22px] min-h-[44px] flex items-end px-4 py-2.5 gap-2 cursor-text"
                    style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(10px)', transition: 'all 0.2s' }}
                    onClick={() => { setShowKeyboard(true); setShowStickers(false); }}
                >
                    <div ref={inputDisplayRef} className="flex-1 min-w-0 text-[15px] min-h-[20px] max-h-[120px] select-none overflow-y-auto break-words whitespace-pre-wrap scrollbar-hide" style={{ color: input ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.35)', wordBreak: 'break-word' }}>
                        {input || 'Message...'}
                        {showKeyboard && <span className="inline-block w-[2px] h-[18px] bg-blue-500 ml-[1px] align-text-bottom animate-pulse" />}
                    </div>
                    {input ? (
                        <button type="submit" className="text-blue-500 font-bold text-sm flex-shrink-0 active:opacity-60 pb-0.5">Send</button>
                    ) : (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowStickers(!showStickers);
                                setShowKeyboard(false);
                            }}
                            className="flex-shrink-0 active:opacity-50 pb-0.5"
                            style={{ color: 'rgba(0, 0, 0, 0.5)' }}
                        >
                            <Smile size={22} strokeWidth={1.5} />
                        </button>
                    )}
                </div>

                {/* Dismiss Keyboard Button */}
                {showKeyboard && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowKeyboard(false); }}
                        className="h-11 w-11 flex items-center justify-center rounded-full flex-shrink-0 active:scale-90 transition-transform"
                        style={{ background: 'rgba(0, 0, 0, 0.06)', color: 'rgba(0, 0, 0, 0.4)' }}
                        title="Hide Keyboard"
                    >
                        <ChevronDown size={22} strokeWidth={2} />
                    </button>
                )}

            </form>

            <AnimatePresence>
                {showStickers && (
                    <StickerPicker
                        onClose={() => setShowStickers(false)}
                        onSelect={(sticker) => {
                            onSendMessage(sticker, 'sticker');
                            setShowStickers(false);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Incognito Keyboard */}
            <AnimatePresence>
                <IncognitoKeyboard
                    visible={showKeyboard && !showStickers}
                    onKeyPress={handleIncognitoKey}
                    onBackspace={handleIncognitoBackspace}
                    onEnter={handleIncognitoEnter}
                />
            </AnimatePresence>
        </motion.div >
    );
});




export default PrivateChat;
