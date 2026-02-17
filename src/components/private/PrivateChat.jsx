import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Camera, Image as ImageIcon, Mic, Phone, Video, Heart, Info, Send, Plus, PhoneOff, MicOff, VideoOff, RefreshCw, Clock } from 'lucide-react';
import { useP2P } from '../../hooks/useP2P';

const PrivateChat = ({ onLock }) => {
    const [activeChat, setActiveChat] = useState(null);
    const [setupMode, setSetupMode] = useState(true);
    const [roomId, setRoomId] = useState("");
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
                        onSendMessage={(text) => p2p.sendMessage(text, activeChat.id)}
                        onVideoCall={(stream) => p2p.callPeer(activeChat.id, stream)}
                        onBack={() => setActiveChat(null)}
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
                        });
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
        </div>
    );
};

// --- INSTAGRAM DIRECT LIST ---
const ChatListView = ({ onLock, onSelectChat, peers, status, currentUser, retentionEnabled, onToggleRetention }) => (
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
            <div className="flex gap-6 text-white">
                <button
                    onClick={() => onToggleRetention(!retentionEnabled)}
                    className={`relative transition-colors ${retentionEnabled ? 'text-blue-500' : 'text-gray-500'}`}
                >
                    <Clock size={24} strokeWidth={1.5} />
                    {retentionEnabled && <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>}
                </button>

                <div className="relative">
                    <Video size={28} strokeWidth={1.5} />
                    {status === 'connected' && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black"></div>}
                </div>
                <div className="relative">
                    <Send size={26} strokeWidth={1.5} className="-rotate-12 translate-y-0.5" />
                    <div className="absolute -top-1 -right-1 bg-red-500 text-[10px] font-bold px-1 rounded-full min-w-[16px] text-center">1</div>
                </div>
            </div>
        </header>

        {/* Message Requests / Tabs */}
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
                                {peer.user[0].toUpperCase()}
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
                    <p>No active peers found.</p>
                </div>
            )}

            {peers.map(peer => (
                <button
                    key={peer.id}
                    onClick={() => onSelectChat({ id: peer.id, name: peer.user })}
                    className="w-full px-4 py-3 flex items-center gap-3 active:bg-[#121212] transition-colors"
                >
                    <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center font-bold text-lg text-white">
                        {peer.user[0].toUpperCase()}
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

// --- INSTAGRAM CONVERSATION ---
const ConversationView = ({ chat, onBack, messages, onSendMessage, onVideoCall }) => {
    const [input, setInput] = useState("");
    const endRef = useRef(null);

    // Pass video call action
    const handleVideoCall = () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            onVideoCall(stream);
        }).catch(err => alert("Camera access required for video calls."));
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSendMessage(input);
        setInput("");
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-white"><ArrowLeft size={28} strokeWidth={1.5} /></button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1.5px]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-white">
                                    {chat.name[0]}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-sm font-bold leading-tight text-white">{chat.name}</h3>
                            <span className="text-[11px] text-gray-400">Safe P2P • Active now</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-6 text-white pr-2">
                    <Phone size={24} strokeWidth={1.5} />
                    <button onClick={handleVideoCall}><Video size={28} strokeWidth={1.5} /></button>
                    <Info size={24} strokeWidth={1.5} />
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {messages.map((msg, idx) => {
                    const isMe = msg.isMe;
                    const isLast = idx === messages.length - 1;
                    const showAvatar = !isMe && (isLast || messages[idx + 1]?.isMe);

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                            {!isMe && (
                                <div className="w-7 h-7 rounded-full bg-gray-700 mr-2 flex-shrink-0 self-end overflow-hidden">
                                    {showAvatar && <div className="w-full h-full flex items-center justify-center text-[10px]">{msg.user[0]}</div>}
                                </div>
                            )}

                            <div className={`
                                max-w-[70%] px-4 py-3 text-[15px] leading-snug break-words
                                ${isMe
                                    ? 'bg-[#3797F0] text-white rounded-[22px] rounded-br-md'
                                    : 'bg-[#262626] text-white rounded-[22px] rounded-bl-md'}
                            `}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>

            {/* Footer */}
            <form onSubmit={handleSend} className="p-3 bg-black flex items-center gap-3 mb-1">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[#262626] text-white cursor-pointer">
                    <Camera size={22} className="text-[#3797F0]" />
                </div>

                <div className="flex-1 bg-[#262626] rounded-full h-11 flex items-center px-4 gap-2 border border-transparent focus-within:border-gray-700 transition-colors">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        type="text"
                        placeholder="Message..."
                        className="bg-transparent border-none outline-none text-white text-[15px] w-full placeholder-gray-400"
                    />
                    {!input && <Mic size={20} className="text-white" />}
                    {!input && <ImageIcon size={20} className="text-white" />}
                    {input && <button type="submit" className="text-[#0095F6] font-semibold text-sm">Send</button>}
                </div>

                {!input && (
                    <div className="h-10 w-10 flex items-center justify-center rounded-full text-white cursor-pointer hover:bg-[#121212]">
                        <Heart size={24} strokeWidth={1.5} />
                    </div>
                )}
            </form>
        </motion.div>
    );
};

// --- VIDEO CALL COMPONENTS ---
const IncomingCallModal = ({ call, onAnswer, onReject }) => (
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
            call.stream.getAudioTracks().forEach(track => track.enabled = !muted);
            setMuted(!muted);
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
                <button onClick={() => setCameraOff(!cameraOff)} className={`p-4 rounded-full ${cameraOff ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}>
                    {cameraOff ? <VideoOff /> : <Video />}
                </button>
            </div>
        </div>
    );
};

export default PrivateChat;
