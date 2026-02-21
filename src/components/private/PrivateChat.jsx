import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ArrowLeft, Camera, Phone, Video, Send, Plus, PhoneOff, Mic, MicOff, VideoOff, Clock, Check, CheckCheck, Zap, Smile, Trash2, Image as ImageIcon, MoreVertical, Ban, AlertTriangle } from 'lucide-react';
import { useP2P } from '../../hooks/useP2P';
import { usePremium } from '../../context/PremiumContext';
import PremiumStore from '../premium/PremiumStore';
import StickerPicker from '../premium/StickerPicker';
import { emojiToUrl } from '../../utils/emojiToUrl';
import IncognitoKeyboard from './IncognitoKeyboard';

const PrivateChat = ({ onLock }) => {
    const [activeChat, setActiveChat] = useState(null);
    const [setupMode, setSetupMode] = useState(true);
    const [roomId, setRoomId] = useState("");
    const [showStore, setShowStore] = useState(false);

    const [username, setUsername] = useState("");

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

    const handleConnect = (e) => {
        e.preventDefault();
        if (roomId && username) setSetupMode(false);
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

                <form onSubmit={handleConnect} className="w-full max-w-sm space-y-4">
                    <div className="space-y-3">
                        <input
                            value={username} onChange={e => setUsername(e.target.value)}
                            placeholder="Username"
                            className="w-full p-4 rounded-2xl outline-none text-base transition-colors"
                            style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.7)', color: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                            autoFocus
                        />
                        <input
                            value={roomId} onChange={e => setRoomId(e.target.value)}
                            placeholder="Room Key"
                            className="w-full p-4 rounded-2xl outline-none text-base transition-colors"
                            style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.7)', color: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                        />
                    </div>

                    <button type="submit" className="w-full p-4 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
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
        <div className="h-[100dvh] w-full flex flex-col font-sans overflow-hidden relative">
            {/* Security Watermark (Visual Deterrent) */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.02] overflow-hidden flex flex-wrap content-center justify-center select-none">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="w-64 h-64 flex items-center justify-center transform -rotate-45">
                        <span className="text-2xl font-black whitespace-nowrap" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>PARALLEL SECURE</span>
                    </div>
                ))}
            </div>
            <AnimatePresence initial={false} mode="wait">
                {activeChat ? (
                    <ConversationView
                        key="conversation"
                        chat={activeChat}
                        messages={p2p.messages.filter(m => m.peerId === activeChat.id)}
                        onSendMessage={(text, type) => p2p.sendMessage(text, activeChat.id, type)}
                        onVideoCall={(stream) => p2p.callPeer(activeChat.id, stream)}
                        onBack={() => setActiveChat(null)}
                        isTyping={!!p2p.typingPeers[activeChat.id]}
                        onTyping={() => p2p.sendTyping(activeChat.id)}
                        onOpenStore={() => setShowStore(true)}
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
                        retentionEnabled={p2p.retentionEnabled}
                        onToggleRetention={p2p.toggleRetention}
                        onPanicWipe={() => { p2p.panicWipe(); onLock(); }}
                        onOpenStore={() => setShowStore(true)}
                    />
                )}
            </AnimatePresence>

            {/* INCOMING CALL MODAL */}
            {p2p.incomingCall && (
                <IncomingCallModal
                    call={p2p.incomingCall}
                    onAnswer={() => {
                        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                            p2p.answerCall(stream);
                        }).catch(() => { /* User denied camera */ });
                    }}
                    onReject={() => p2p.endCall()}
                />
            )}

            {/* ACTIVE CALL OVERLAY */}
            {p2p.activeCall && (
                <VideoCallOverlay
                    call={p2p.activeCall}
                    remoteStream={p2p.remoteStream}
                    onEnd={() => p2p.endCall()}
                />
            )}

            {/* PREMIUM STORE - Global Overlay */}
            <AnimatePresence>
                {showStore && <PremiumStore onClose={() => setShowStore(false)} />}
            </AnimatePresence>
        </div>
    );
};

// --- CHAT LIST — iOS 26 Liquid Glass ---
const ChatListView = memo(({ onLock, onSelectChat, peers, status, currentUser, retentionEnabled, onToggleRetention, onPanicWipe, onOpenStore }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col h-full"
    >
        {/* Header — Frosted Glass */}
        <header className="px-4 py-3 flex justify-between items-center sticky top-0 z-10" style={{ background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', borderBottom: '1px solid rgba(255, 255, 255, 0.5)' }}>
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
                {/* Premium Button */}
                <button
                    onClick={onOpenStore}
                    className="text-amber-500 hover:text-amber-400 active:scale-95 transition-all"
                    title="Premium Store"
                >
                    <Zap size={22} className="fill-current" />
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

                <button
                    onClick={() => onToggleRetention(!retentionEnabled)}
                    className={`relative transition-all ${retentionEnabled ? 'text-blue-500' : ''}`}
                    style={!retentionEnabled ? { color: 'rgba(0, 0, 0, 0.3)' } : {}}
                    title={retentionEnabled ? '24h Retention ON' : '24h Retention OFF'}
                >
                    <Clock size={22} strokeWidth={1.5} />
                    {retentionEnabled && (
                        <>
                            <div className="absolute -top-1.5 -right-2.5 bg-blue-500 text-[7px] font-black text-white px-1 py-0.5 rounded-md leading-none tracking-tight" style={{ boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)' }}>24H</div>
                            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-blue-400" style={{ animationDuration: '2s' }}></div>
                        </>
                    )}
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

        {/* Search */}
        <div className="px-4 mt-2 mb-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4" style={{ color: 'rgba(0, 0, 0, 0.3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input type="text" placeholder="Search" className="w-full py-2.5 pl-10 pr-4 rounded-2xl text-sm outline-none" style={{ background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.6)', color: 'rgba(0, 0, 0, 0.8)' }} />
            </div>
        </div>

        {/* Stories / Active Peers */}
        <div className="pl-4 pb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <div className="inline-flex flex-col items-center mr-4 relative">
                <div className="w-16 h-16 rounded-full flex items-center justify-center relative" style={{ background: 'rgba(255, 255, 255, 0.35)', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
                    <span className="text-2xl font-bold" style={{ color: 'rgba(0, 0, 0, 0.3)' }}>+</span>
                    <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5">
                        <Plus size={14} className="text-white" />
                    </div>
                </div>
                <span className="text-xs mt-1" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>Your note</span>
            </div>

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
                <span className="text-[#0095F6] text-sm font-semibold">Requests</span>
            </div>

            {peers.length === 0 && (
                <div className="flex flex-col items-center justify-center flex-1 px-6 py-10">
                    {/* Animated Radar Pulse */}
                    <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                        {/* Outer pulsing rings */}
                        <div className="absolute inset-0 rounded-full animate-ping opacity-[0.06]" style={{ background: status === 'connected' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(234, 179, 8, 0.5)', animationDuration: '2.5s' }}></div>
                        <div className="absolute inset-4 rounded-full animate-ping opacity-[0.1]" style={{ background: status === 'connected' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(234, 179, 8, 0.4)', animationDuration: '2s', animationDelay: '0.5s' }}></div>
                        <div className="absolute inset-8 rounded-full animate-ping opacity-[0.15]" style={{ background: status === 'connected' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(234, 179, 8, 0.3)', animationDuration: '1.5s', animationDelay: '1s' }}></div>
                        {/* Center icon */}
                        <div className="relative w-16 h-16 rounded-full flex items-center justify-center z-10" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                            {status === 'connecting' ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(234, 179, 8, 0.8)" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                                </motion.div>
                            ) : status === 'connected' ? (
                                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                                    <Send size={26} strokeWidth={1.5} className="-rotate-12" style={{ color: 'rgba(59, 130, 246, 0.8)' }} />
                                </motion.div>
                            ) : (
                                <Phone size={26} style={{ color: 'rgba(0, 0, 0, 0.3)' }} />
                            )}
                        </div>
                    </div>

                    {/* Status Text */}
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'rgba(0, 0, 0, 0.75)' }}>
                        {status === 'connecting' ? 'Connecting...' : status === 'connected' ? 'Room is Ready' : 'Disconnected'}
                    </h3>
                    <p className="text-sm text-center mb-6" style={{ color: 'rgba(0, 0, 0, 0.35)' }}>
                        {status === 'connecting' ? 'Establishing secure connection' : status === 'connected' ? 'Share the room key with a friend to start chatting' : 'Connection lost, please try again'}
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
                    className="w-full px-4 py-3 flex items-center gap-3 transition-colors"
                    style={{ background: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg relative" style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(255, 255, 255, 0.5)', color: 'rgba(0, 0, 0, 0.7)' }}>
                        {(peer.user || '?')[0].toUpperCase()}
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="text-sm font-medium" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{peer.user}</h3>
                        <div className="text-sm flex items-center gap-1" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                            <span>Active now</span>
                            <span className="w-1 h-1 rounded-full bg-green-500"></span>
                        </div>
                    </div>
                    <div style={{ color: 'rgba(0, 0, 0, 0.3)' }}>
                        <Camera size={22} strokeWidth={1.5} />
                    </div>
                </button>
            ))}
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

const REACTIONS = ['❤️', '🔥', '😂', '👍', '😮', '😢'];

const ConversationView = memo(({ chat, onBack, messages, onSendMessage, onVideoCall, isTyping, onTyping, onOpenStore, onWipeAndLock }) => {
    const [input, setInput] = useState("");
    const [reactionMsg, setReactionMsg] = useState(null);
    const [showStickers, setShowStickers] = useState(false);
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const { isPremium } = usePremium();
    const endRef = useRef(null);
    const typingTimeout = useRef(null);
    const fileInputRef = useRef(null);
    const inputDisplayRef = useRef(null);

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

    const handleIncognitoEnter = useCallback(() => {
        if (!input.trim()) return;
        onSendMessage(input, 'text');
        setInput("");
        if (navigator.vibrate) navigator.vibrate(10);
    }, [input, onSendMessage]);

    const handleImagePick = useCallback(() => {
        if (!isPremium) {
            onOpenStore();
            return;
        }
        fileInputRef.current?.click();
    }, [isPremium, onOpenStore]);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Only images are supported.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            alert('Image must be under 2MB for P2P transfer.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            onSendMessage(reader.result, 'image');
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }, [onSendMessage]);

    const handleVideoCall = useCallback(() => {
        if (!isPremium) {
            onOpenStore();
            return;
        }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Video calls require HTTPS and camera permissions.");
            return;
        }
        try {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                onVideoCall(stream);
            }).catch(() => alert("Camera access required for video calls."));
        } catch {
            alert("Video calls are not supported on this device/browser.");
        }
    }, [isPremium, onOpenStore, onVideoCall]);

    const handleSend = useCallback((e) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSendMessage(input, 'text');
        setInput("");
        if (navigator.vibrate) navigator.vibrate(10);
    }, [input, onSendMessage]);

    const handleHeartSend = useCallback(() => {
        onSendMessage('❤️', 'sticker');
        if (navigator.vibrate) navigator.vibrate(10);
    }, [onSendMessage]);



    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const lastSentIdx = messages.reduce((acc, m, i) => m.isMe ? i : acc, -1);

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 flex flex-col z-20"
        >
            {/* Header — Frosted Glass */}
            <header className="px-3 py-2 flex items-center justify-between" style={{ background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', borderBottom: '1px solid rgba(255, 255, 255, 0.5)' }}>
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="active:opacity-50 transition-opacity" style={{ color: 'rgba(0, 0, 0, 0.7)' }}><ArrowLeft size={26} strokeWidth={1.5} /></button>
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
                <div className="flex gap-5 pr-1" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>
                    <Phone size={22} strokeWidth={1.5} className="opacity-50" />
                    <button onClick={handleVideoCall} className="relative">
                        <Video size={24} strokeWidth={1.5} className={!isPremium ? "text-blue-500" : ""} style={isPremium ? { color: 'rgba(0, 0, 0, 0.6)' } : {}} />
                        {!isPremium && <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-[2px]"><Zap size={8} className="text-black fill-current" /></div>}
                    </button>
                    <div className="relative">
                        <button onClick={() => setShowOptions(!showOptions)} className="active:opacity-50 transition-opacity">
                            <MoreVertical size={24} strokeWidth={1.5} />
                        </button>
                        <AnimatePresence>
                            {showOptions && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute top-8 right-0 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-48 z-50 text-sm overflow-hidden flex flex-col"
                                >
                                    <button
                                        onClick={() => { setShowOptions(false); onWipeAndLock(); }}
                                        className="px-4 py-2.5 flex items-center gap-3 text-red-500 hover:bg-red-50 font-medium transition-colors"
                                    >
                                        <Ban size={16} /> Block User
                                    </button>
                                    <button
                                        onClick={() => { setShowOptions(false); setShowReportModal(true); }}
                                        className="px-4 py-2.5 flex items-center gap-3 text-orange-500 hover:bg-orange-50 font-medium transition-colors"
                                    >
                                        <AlertTriangle size={16} /> Report User
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

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
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2" onClick={() => setReactionMsg(null)}>
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
                                    {/* Reaction popup */}
                                    <AnimatePresence>
                                        {reactionMsg === msg.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                className="absolute -top-12 left-1/2 -translate-x-1/2 z-30"
                                            >
                                                <div className="rounded-full px-2 py-1.5 flex gap-1 shadow-2xl" style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(30px) saturate(200%)', WebkitBackdropFilter: 'blur(30px) saturate(200%)', border: '1px solid rgba(255, 255, 255, 0.7)' }}>
                                                    {REACTIONS.map(r => (
                                                        <button key={r} className="hover:scale-125 transition-transform px-0.5 active:scale-90" onClick={(e) => { e.stopPropagation(); setReactionMsg(null); }}>
                                                            <img src={emojiToUrl(r)} alt={r} width={26} height={26} draggable={false} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Message Bubble */}
                                    {msg.type === 'sticker' ? (
                                        <div
                                            className="hover:scale-110 transition-transform cursor-pointer active:scale-95"
                                            onDoubleClick={() => setReactionMsg(msg.id)}
                                        >
                                            <img
                                                src={emojiToUrl(msg.text)}
                                                alt={msg.text}
                                                width={100}
                                                height={100}
                                                draggable={false}
                                                style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
                                            />
                                        </div>
                                    ) : msg.type === 'image' ? (
                                        <div
                                            onDoubleClick={() => setReactionMsg(msg.id)}
                                            className={`overflow-hidden cursor-pointer ${bubbleRounding}`}
                                            style={isMe
                                                ? { border: '2px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }
                                                : { border: '2px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }
                                            }
                                        >
                                            <img src={msg.text} alt="Shared" className="max-w-[260px] max-h-[300px] object-cover" style={{ borderRadius: 'inherit' }} />
                                        </div>
                                    ) : (
                                        <div
                                            onDoubleClick={() => setReactionMsg(msg.id)}
                                            className={`
                                                px-3.5 py-2 text-[15px] leading-[20px] break-words cursor-pointer select-none ${bubbleRounding}
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
                                        <div className="flex justify-end mt-0.5 pr-1">
                                            {idx === lastSentIdx && msg.status === 'delivered' ? (
                                                <span className="text-[10px] font-normal" style={{ color: 'rgba(0, 0, 0, 0.35)' }}>Seen</span>
                                            ) : msg.status === 'delivered' ? (
                                                <CheckCheck size={13} className="text-blue-500" />
                                            ) : msg.status === 'failed' ? (
                                                <span className="text-[10px] text-red-500 font-medium">Not sent</span>
                                            ) : (
                                                <Check size={13} style={{ color: 'rgba(0, 0, 0, 0.25)' }} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start mt-2 mb-1">
                        <div className="w-7 h-7 rounded-full mr-2 flex-shrink-0 self-end flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.45)', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
                            <span className="text-[10px] font-bold uppercase" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>{(chat.name || '?')[0]}</span>
                        </div>
                        <div className="rounded-[22px] rounded-bl-md px-4 py-3" style={{ background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.65)' }}>
                            <div className="flex gap-1">
                                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'rgba(0, 0, 0, 0.3)', animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'rgba(0, 0, 0, 0.3)', animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'rgba(0, 0, 0, 0.3)', animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            {/* Footer / Input Bar — Frosted Glass */}
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
            <form onSubmit={handleSend} className="px-3 py-2 flex items-center gap-2" style={{ background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', borderTop: '1px solid rgba(255, 255, 255, 0.5)' }}>
                <button type="button" onClick={handleImagePick} className="h-11 w-11 flex items-center justify-center rounded-full text-white flex-shrink-0 active:scale-90 transition-transform relative" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}>
                    <ImageIcon size={22} />
                    {!isPremium && <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-[2px]"><Zap size={8} className="text-black fill-current" /></div>}
                </button>

                <div
                    className="flex-1 rounded-full h-11 flex items-center px-4 gap-2 cursor-text"
                    style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(10px)' }}
                    onClick={() => { setShowKeyboard(true); setShowStickers(false); }}
                >
                    <div ref={inputDisplayRef} className="flex-1 text-[15px] min-h-[20px] select-none overflow-hidden whitespace-nowrap" style={{ color: input ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.35)' }}>
                        {input || 'Message...'}
                        {showKeyboard && <span className="inline-block w-[2px] h-[18px] bg-blue-500 ml-[1px] align-text-bottom animate-pulse" />}
                    </div>
                    {input ? (
                        <button type="submit" className="text-blue-500 font-bold text-sm flex-shrink-0 active:opacity-60">Send</button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isPremium) onOpenStore();
                                    else setShowStickers(!showStickers);
                                }}
                                className="flex-shrink-0 active:opacity-50"
                                style={{ color: 'rgba(0, 0, 0, 0.5)' }}
                            >
                                <Smile size={22} strokeWidth={1.5} />
                            </button>
                        </>
                    )}
                </div>

                {/* Heart button */}
                {!input && (
                    <button
                        type="button"
                        onClick={handleHeartSend}
                        className="flex-shrink-0 active:scale-75 transition-transform"
                        style={{ color: 'rgba(0, 0, 0, 0.5)' }}
                    >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
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
        </motion.div>
    );
});


// --- VIDEO CALL COMPONENTS — Frosted Glass ---
const IncomingCallModal = ({ onAnswer, onReject }) => (
    <motion.div
        initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-4 left-4 right-4 rounded-3xl p-4 shadow-2xl z-50 flex items-center justify-between"
        style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', border: '1px solid rgba(255, 255, 255, 0.7)' }}
    >
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full animate-pulse" style={{ background: 'rgba(59, 130, 246, 0.1)' }} />
            <div>
                <h3 className="font-bold" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>Incoming Video Call...</h3>
                <span className="text-xs" style={{ color: 'rgba(0, 0, 0, 0.35)' }}>Encrypted P2P Connection</span>
            </div>
        </div>
        <div className="flex gap-3">
            <button onClick={onReject} className="p-3 rounded-full text-white active:scale-90 transition-transform" style={{ background: 'rgba(239, 68, 68, 0.85)' }}><PhoneOff size={20} /></button>
            <button onClick={onAnswer} className="p-3 rounded-full text-white active:scale-90 transition-transform" style={{ background: 'rgba(34, 197, 94, 0.85)' }}><Video size={20} /></button>
        </div>
    </motion.div>
);

const VideoCallOverlay = ({ call, remoteStream, onEnd }) => {
    const remoteVideoRef = useRef(null);
    const localVideoRef = useRef(null);
    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
        if (localVideoRef.current && call.stream) {
            localVideoRef.current.srcObject = call.stream;
        }
    }, [remoteStream, call.stream]);

    const toggleMute = () => {
        if (call.stream) {
            call.stream.getAudioTracks().forEach(track => track.enabled = muted);
            setMuted(!muted);
        }
    };

    const toggleCamera = () => {
        if (call.stream) {
            call.stream.getVideoTracks().forEach(track => track.enabled = cameraOff);
            setCameraOff(!cameraOff);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#f0f0f0' }}>
            {/* Remote Video (Full Screen) */}
            <div className="flex-1 relative" style={{ background: 'rgba(0, 0, 0, 0.05)' }}>
                {remoteStream ? (
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'rgba(0, 0, 0, 0.35)' }}>Connecting...</div>
                )}

                {/* Local Video (PiP) */}
                <div className="absolute top-4 right-4 w-32 h-48 rounded-3xl overflow-hidden shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(255, 255, 255, 0.7)' }}>
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Controls */}
            <div className="h-24 flex items-center justify-center gap-8 pb-4" style={{ background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', borderTop: '1px solid rgba(255, 255, 255, 0.6)' }}>
                <button onClick={toggleMute} className="p-4 rounded-full transition-all active:scale-90" style={muted ? { background: 'rgba(0,0,0,0.8)', color: 'white' } : { background: 'rgba(255,255,255,0.6)', color: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.7)' }}>
                    {muted ? <MicOff /> : <Mic />}
                </button>
                <button onClick={onEnd} className="p-4 rounded-full text-white shadow-lg scale-110 active:scale-95 transition-transform" style={{ background: 'rgba(220, 38, 38, 0.85)', boxShadow: '0 4px 20px rgba(220, 38, 38, 0.3)' }}>
                    <PhoneOff size={32} />
                </button>
                <button onClick={toggleCamera} className="p-4 rounded-full transition-all active:scale-90" style={cameraOff ? { background: 'rgba(0,0,0,0.8)', color: 'white' } : { background: 'rgba(255,255,255,0.6)', color: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.7)' }}>
                    {cameraOff ? <VideoOff /> : <Video />}
                </button>
            </div>
        </div>
    );
};

export default PrivateChat;
