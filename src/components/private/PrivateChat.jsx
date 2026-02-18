import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ArrowLeft, Camera, Image as ImageIcon, Mic, Phone, Video, Info, Send, Plus, PhoneOff, MicOff, VideoOff, Clock, Check, CheckCheck, Zap, Smile } from 'lucide-react';
import { useP2P } from '../../hooks/useP2P';
import { usePremium } from '../../context/PremiumContext';
import PremiumStore from '../premium/PremiumStore';
import StickerPicker from '../premium/StickerPicker';

const PrivateChat = ({ onLock }) => {
    const [activeChat, setActiveChat] = useState(null);
    const [setupMode, setSetupMode] = useState(true);
    const [roomId, setRoomId] = useState("");
    const [showStore, setShowStore] = useState(false);
    const { isPremium } = usePremium();
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

    // CUSTOM PARALLEL LOGIN UI (White Theme)
    if (setupMode) {
        return (
            <div className="bg-white text-black h-[100dvh] flex flex-col items-center justify-center p-8 font-sans overflow-hidden">
                {/* LOGO: Rounded Square with Full-Height Parallel Lines V5 */}
                <div className="mb-12 relative flex flex-col items-center">
                    {/* Back / Lock Button */}
                    <button onClick={onLock} className="absolute -top-8 left-0 text-gray-400 hover:text-black transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <clipPath id="roundedBox">
                                <rect x="5" y="5" width="90" height="90" rx="25" />
                            </clipPath>
                        </defs>
                        {/* Rounded Square Border */}
                        <rect x="5" y="5" width="90" height="90" rx="25" stroke="black" strokeWidth="3" fill="none" />

                        {/* Two Full-Height Parallel Lines (Clipped to Box Shape) */}
                        <g clipPath="url(#roundedBox)">
                            {/* Line 1 (Left Partition) */}
                            <line x1="38" y1="0" x2="38" y2="100" stroke="black" strokeWidth="4" />
                            {/* Line 2 (Right Partition) */}
                            <line x1="62" y1="0" x2="62" y2="100" stroke="black" strokeWidth="4" />
                        </g>
                    </svg>
                    <h1 className="text-2xl font-light tracking-[0.3em] mt-6" style={{ fontFamily: 'Inter, sans-serif' }}>PARALLEL</h1>
                </div>

                <form onSubmit={handleConnect} className="w-full max-w-sm space-y-4">
                    <div className="space-y-3">
                        <input
                            value={username} onChange={e => setUsername(e.target.value)}
                            placeholder="Username"
                            className="w-full bg-gray-50 text-black p-4 rounded-lg outline-none border border-gray-300 focus:border-black text-base placeholder-gray-500 transition-colors"
                            autoFocus
                        />
                        <input
                            value={roomId} onChange={e => setRoomId(e.target.value)}
                            placeholder="Room Key"
                            className="w-full bg-gray-50 text-black p-4 rounded-lg outline-none border border-gray-300 focus:border-black text-base placeholder-gray-500 transition-colors"
                        />
                    </div>

                    <button type="submit" className="w-full bg-black text-white p-4 rounded-lg font-semibold text-base hover:opacity-80 transition-opacity flex items-center justify-center gap-2">
                        <span>Enter Parallel</span>
                        <ArrowLeft className="rotate-180" size={18} />
                    </button>
                </form>

                <div className="mt-auto mb-4 text-xs text-gray-400 font-medium tracking-widest text-center">
                    ENCRYPTED P2P MESSENGER
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black text-white h-[100dvh] w-full flex flex-col font-sans overflow-hidden relative">
            {/* Security Watermark (Visual Deterrent) */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] overflow-hidden flex flex-wrap content-center justify-center select-none">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="w-64 h-64 flex items-center justify-center transform -rotate-45">
                        <span className="text-2xl font-black text-white whitespace-nowrap">PARALLEL SECURE</span>
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

// --- INSTAGRAM DIRECT LIST ---
const ChatListView = ({ onLock, onSelectChat, peers, status, currentUser, retentionEnabled, onToggleRetention, onPanicWipe, onOpenStore }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col h-full bg-black"
    >
        {/* Header */}
        <header className="px-4 py-3 flex justify-between items-center sticky top-0 z-10 bg-black">
            <div className="flex items-center gap-3">
                <button onClick={onLock} className="text-white">
                    <ArrowLeft size={24} strokeWidth={2} />
                </button>
                <div className="flex items-center gap-1 cursor-pointer">
                    <h1 className="text-xl font-bold">{currentUser}</h1>
                    <span className="text-[10px] mt-1 text-gray-400">▼</span>
                </div>
            </div>
            <div className="flex gap-5 text-white items-center">
                {/* Premium Button */}
                <button
                    onClick={onOpenStore}
                    className="text-yellow-400 hover:text-yellow-300 active:scale-95 transition-all"
                    title="Premium Store"
                >
                    <Zap size={22} className="fill-current" />
                </button>

                {/* Panic Wipe Button */}
                <button
                    onClick={onPanicWipe}
                    className="relative text-red-500 hover:text-red-400 active:scale-90 transition-all"
                    title="Panic Wipe"
                >
                    <Zap size={22} strokeWidth={2} />
                </button>

                <button
                    onClick={() => onToggleRetention(!retentionEnabled)}
                    className={`relative transition-colors ${retentionEnabled ? 'text-blue-500' : 'text-gray-500'}`}
                >
                    <Clock size={24} strokeWidth={1.5} />
                    {retentionEnabled && <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>}
                </button>

                <div className="relative">
                    <Video size={28} strokeWidth={1.5} />
                    {status === 'connected' && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                    )}
                    {status === 'connecting' && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-yellow-500 rounded-full border-2 border-black animate-ping"></div>
                    )}
                </div>
                <div className="relative">
                    <Send size={26} strokeWidth={1.5} className="-rotate-12 translate-y-0.5" />
                    {peers.length > 0 && <div className="absolute -top-1 -right-1 bg-red-500 text-[10px] font-bold px-1 rounded-full min-w-[16px] text-center">{peers.length}</div>}
                </div>
            </div>
        </header>

        {/* Search */}
        <div className="px-4 mt-2 mb-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input type="text" placeholder="Search" className="w-full bg-[#262626] text-white py-2 pl-10 pr-4 rounded-xl text-sm outline-none placeholder-gray-500" />
            </div>
        </div>

        {/* Stories / Active Peers */}
        <div className="pl-4 pb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <div className="inline-flex flex-col items-center mr-4 relative">
                <div className="w-16 h-16 rounded-full bg-[#262626] flex items-center justify-center relative">
                    <span className="text-2xl font-bold text-gray-500">+</span>
                    <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5">
                        <Plus size={14} className="text-black" />
                    </div>
                </div>
                <span className="text-xs text-gray-400 mt-1">Your note</span>
            </div>

            {peers.map(peer => (
                <div key={peer.id} className="inline-flex flex-col items-center mr-4" onClick={() => onSelectChat(peer)}>
                    <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                        <div className="w-full h-full rounded-full bg-black p-[2px]">
                            <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center text-lg font-semibold cursor-pointer">
                                {(peer.user || '?')[0].toUpperCase()}
                            </div>
                        </div>
                    </div>
                    <span className="text-xs text-white mt-1">{peer.user}</span>
                </div>
            ))}
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 flex justify-between items-center text-white">
                <h3 className="font-bold text-base">Messages</h3>
                <span className="text-[#0095F6] text-sm font-semibold">Requests</span>
            </div>

            {peers.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <div className={`w-4 h-4 rounded-full mb-3 ${status === 'connecting' ? 'bg-yellow-500 animate-ping' : status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
                    <p>{status === 'connecting' ? 'Connecting to room...' : status === 'connected' ? 'Waiting for peers...' : 'Disconnected'}</p>
                </div>
            )}

            {peers.map(peer => (
                <button
                    key={peer.id}
                    onClick={() => onSelectChat({ id: peer.id, name: peer.user })}
                    className="w-full px-4 py-3 flex items-center gap-3 active:bg-[#121212] transition-colors"
                >
                    <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center font-bold text-lg text-white relative">
                        {(peer.user || '?')[0].toUpperCase()}
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black"></div>
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="text-sm font-normal text-white">{peer.user}</h3>
                        <div className="text-sm text-gray-400 flex items-center gap-1">
                            <span>Active now</span>
                            <span className="w-1 h-1 rounded-full bg-green-500"></span>
                        </div>
                    </div>
                    <div className="text-gray-500">
                        <Camera size={22} strokeWidth={1.5} />
                    </div>
                </button>
            ))}
        </div>
    </motion.div>
);

// --- INSTAGRAM DM CONVERSATION (Pixel-Perfect Clone) ---

// Helper: format timestamp for separators
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

// Helper: Should we show a time separator between two messages?
const shouldShowTimeSeparator = (prevMsg, currMsg) => {
    if (!prevMsg) return true; // Always show before first message
    return (currMsg.timestamp - prevMsg.timestamp) > 15 * 60 * 1000; // 15 min gap
};

// Helper: Determine bubble rounding based on grouping (Instagram-style)
const getBubbleRounding = (isMe, isFirstInGroup, isLastInGroup) => {
    // Instagram uses 18px radius with reduced corners on the "inner" side for consecutive messages
    if (isMe) {
        if (isFirstInGroup && isLastInGroup) return 'rounded-[22px]'; // Solo message
        if (isFirstInGroup) return 'rounded-[22px] rounded-br-md'; // First of group
        if (isLastInGroup) return 'rounded-[22px] rounded-tr-md'; // Last of group
        return 'rounded-[22px] rounded-tr-md rounded-br-md'; // Middle of group
    } else {
        if (isFirstInGroup && isLastInGroup) return 'rounded-[22px]';
        if (isFirstInGroup) return 'rounded-[22px] rounded-bl-md';
        if (isLastInGroup) return 'rounded-[22px] rounded-tl-md';
        return 'rounded-[22px] rounded-tl-md rounded-bl-md';
    }
};

const ConversationView = ({ chat, onBack, messages, onSendMessage, onVideoCall, isTyping, onTyping, onOpenStore }) => {
    const [input, setInput] = useState("");
    const [reactionMsg, setReactionMsg] = useState(null);
    const [showStickers, setShowStickers] = useState(false);
    const { isPremium } = usePremium();
    const endRef = useRef(null);
    const typingTimeout = useRef(null);

    const REACTIONS = ['❤️', '🔥', '😂', '👍', '😮', '😢'];

    const handleVideoCall = () => {
        if (!isPremium) {
            onOpenStore();
            return;
        }
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            onVideoCall(stream);
        }).catch(() => alert("Camera access required for video calls."));
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSendMessage(input, 'text');
        setInput("");
        if (navigator.vibrate) navigator.vibrate(10);
    };

    const handleHeartSend = () => {
        onSendMessage('❤️', 'sticker');
        if (navigator.vibrate) navigator.vibrate(10);
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (!typingTimeout.current) {
            onTyping();
            typingTimeout.current = setTimeout(() => {
                typingTimeout.current = null;
            }, 2000);
        }
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Find last sent message for "Seen" indicator
    const lastSentIdx = messages.reduce((acc, m, i) => m.isMe ? i : acc, -1);

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-black flex flex-col z-20"
        >
            {/* Header */}
            <header className="px-3 py-2 flex items-center justify-between bg-black border-b border-[#262626]">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="text-white active:opacity-50 transition-opacity"><ArrowLeft size={26} strokeWidth={1.5} /></button>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1.5px]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white uppercase">
                                    {(chat.name || '?')[0]}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-[15px] font-semibold leading-tight text-white">{chat.name}</h3>
                            <span className="text-[11px] text-gray-400 leading-tight">
                                {isTyping ? (
                                    <span className="text-green-400 flex items-center gap-1">
                                        typing
                                        <span className="flex gap-0.5">
                                            <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </span>
                                    </span>
                                ) : 'Active now'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-5 text-white pr-1">
                    <Phone size={22} strokeWidth={1.5} className="opacity-50" />
                    <button onClick={handleVideoCall} className="relative">
                        <Video size={24} strokeWidth={1.5} className={!isPremium ? "text-blue-400" : "text-white"} />
                        {!isPremium && <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-[2px]"><Zap size={8} className="text-black fill-current" /></div>}
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2" onClick={() => setReactionMsg(null)}>
                {/* E2E Banner (like Instagram) */}
                <div className="flex flex-col items-center mb-6 mt-2">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px] mb-3">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                            <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold text-white uppercase">
                                {(chat.name || '?')[0]}
                            </div>
                        </div>
                    </div>
                    <h3 className="text-white font-bold text-lg">{chat.name}</h3>
                    <p className="text-gray-500 text-xs mt-1">Parallel • Encrypted P2P</p>
                    <div className="bg-[#262626] rounded-full px-3 py-1.5 mt-3 flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span className="text-[11px] text-gray-400">End-to-end encrypted</span>
                    </div>
                </div>

                {/* Messages */}
                {messages.map((msg, idx) => {
                    const isMe = msg.isMe;
                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;

                    // Grouping logic: consecutive messages from same sender
                    const sameSenderAsPrev = prevMsg && prevMsg.isMe === isMe;
                    const sameSenderAsNext = nextMsg && nextMsg.isMe === isMe;
                    const isFirstInGroup = !sameSenderAsPrev;
                    const isLastInGroup = !sameSenderAsNext;

                    // Show avatar only on last message of other's consecutive group
                    const showAvatar = !isMe && isLastInGroup;
                    // Spacer for avatar alignment when not showing avatar
                    const avatarSpacer = !isMe && !showAvatar;

                    // Time separator
                    const showTime = shouldShowTimeSeparator(prevMsg, msg);

                    // Spacing between groups
                    const groupGap = isFirstInGroup && idx > 0 && !showTime ? 'mt-2' : 'mt-[2px]';

                    const bubbleRounding = getBubbleRounding(isMe, isFirstInGroup, isLastInGroup);

                    return (
                        <React.Fragment key={msg.id}>
                            {/* Time Separator */}
                            {showTime && (
                                <div className="flex justify-center my-4">
                                    <span className="text-[11px] text-gray-500 font-medium">
                                        {formatTimestamp(msg.timestamp)}
                                    </span>
                                </div>
                            )}

                            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${groupGap} relative group`}>
                                {/* Left-side Avatar (other's messages) */}
                                {!isMe && (
                                    <div className="w-7 h-7 mr-2 flex-shrink-0 self-end">
                                        {showAvatar ? (
                                            <div className="w-full h-full rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1px]">
                                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                                    <span className="text-[10px] font-bold text-white uppercase select-none">
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
                                                <div className="bg-[#333] rounded-full px-2 py-1.5 flex gap-1 shadow-2xl border border-gray-700">
                                                    {REACTIONS.map(r => (
                                                        <button key={r} className="text-xl hover:scale-125 transition-transform px-0.5 active:scale-90" onClick={(e) => { e.stopPropagation(); setReactionMsg(null); }}>
                                                            {r}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Message Bubble */}
                                    {msg.type === 'sticker' ? (
                                        <div
                                            className="text-7xl hover:scale-110 transition-transform cursor-pointer active:scale-95"
                                            onDoubleClick={() => setReactionMsg(msg.id)}
                                        >
                                            {msg.text}
                                        </div>
                                    ) : (
                                        <div
                                            onDoubleClick={() => setReactionMsg(msg.id)}
                                            className={`
                                                px-3.5 py-2 text-[15px] leading-[20px] break-words cursor-pointer select-none
                                                ${isMe
                                                    ? `bg-[#3797F0] text-white ${bubbleRounding}`
                                                    : `bg-[#262626] text-white ${bubbleRounding}`}
                                            `}
                                        >
                                            {msg.text}
                                        </div>
                                    )}

                                    {/* Delivery Status — only under last sent message in group */}
                                    {isMe && isLastInGroup && (
                                        <div className="flex justify-end mt-0.5 pr-1">
                                            {idx === lastSentIdx && msg.status === 'delivered' ? (
                                                <span className="text-[10px] text-gray-500 font-normal">Seen</span>
                                            ) : msg.status === 'delivered' ? (
                                                <CheckCheck size={13} className="text-blue-400" />
                                            ) : msg.status === 'failed' ? (
                                                <span className="text-[10px] text-red-400 font-medium">Not sent</span>
                                            ) : (
                                                <Check size={13} className="text-gray-600" />
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
                        <div className="w-7 h-7 rounded-full bg-gray-700 mr-2 flex-shrink-0 self-end flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white uppercase">{(chat.name || '?')[0]}</span>
                        </div>
                        <div className="bg-[#262626] rounded-[22px] rounded-bl-md px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            {/* Footer / Input Bar — Instagram-style */}
            <form onSubmit={handleSend} className="px-3 py-2 bg-black flex items-center gap-2 border-t border-[#262626]">
                <button type="button" className="h-11 w-11 flex items-center justify-center rounded-full bg-[#3797F0] text-white flex-shrink-0 active:scale-90 transition-transform">
                    <Camera size={22} />
                </button>

                <div className="flex-1 bg-[#262626] rounded-full h-11 flex items-center px-4 gap-2 border border-[#363636]">
                    <input
                        value={input}
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Message..."
                        className="bg-transparent border-none outline-none text-white text-[15px] w-full placeholder-gray-500"
                        autoComplete="off"
                    />
                    {input ? (
                        <button type="submit" className="text-[#0095F6] font-bold text-sm flex-shrink-0 active:opacity-60">Send</button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isPremium) onOpenStore();
                                    else setShowStickers(!showStickers);
                                }}
                                className="text-white flex-shrink-0 active:opacity-50"
                            >
                                <Smile size={22} strokeWidth={1.5} />
                            </button>
                        </>
                    )}
                </div>

                {/* Heart / Mic button (Instagram shows heart when empty) */}
                {!input && (
                    <button
                        type="button"
                        onClick={handleHeartSend}
                        className="text-white flex-shrink-0 active:scale-75 transition-transform"
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
        </motion.div>
    );
};


// --- VIDEO CALL COMPONENTS ---
const IncomingCallModal = ({ onAnswer, onReject }) => (
    <motion.div
        initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="fixed top-4 left-4 right-4 bg-gray-900 rounded-2xl p-4 shadow-2xl border border-gray-800 z-50 flex items-center justify-between"
    >
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse" />
            <div>
                <h3 className="text-white font-bold">Incoming Video Call...</h3>
                <span className="text-xs text-gray-400">Encrypted P2P Connection</span>
            </div>
        </div>
        <div className="flex gap-3">
            <button onClick={onReject} className="p-3 bg-red-500 rounded-full text-white"><PhoneOff size={20} /></button>
            <button onClick={onAnswer} className="p-3 bg-green-500 rounded-full text-white"><Video size={20} /></button>
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
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Remote Video (Full Screen) */}
            <div className="flex-1 relative bg-gray-900">
                {remoteStream ? (
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">Connecting...</div>
                )}

                {/* Local Video (PiP) */}
                <div className="absolute top-4 right-4 w-32 h-48 bg-gray-800 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Controls */}
            <div className="h-24 bg-black/80 backdrop-blur-md flex items-center justify-center gap-8 pb-4">
                <button onClick={toggleMute} className={`p-4 rounded-full ${muted ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}>
                    {muted ? <MicOff /> : <Mic />}
                </button>
                <button onClick={onEnd} className="p-4 rounded-full bg-red-600 text-white shadow-lg scale-110">
                    <PhoneOff size={32} />
                </button>
                <button onClick={toggleCamera} className={`p-4 rounded-full ${cameraOff ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}>
                    {cameraOff ? <VideoOff /> : <Video />}
                </button>
            </div>
        </div>
    );
};

export default PrivateChat;
