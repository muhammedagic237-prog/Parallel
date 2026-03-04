import React, { useState, useCallback, useRef, memo } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Delete, ArrowBigUp } from 'lucide-react';

const LAYOUTS = {
    lower: [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['SHIFT', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'BACK'],
        ['NUM', 'SPACE', 'ENTER'],
    ],
    upper: [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
        ['NUM', 'SPACE', 'ENTER'],
    ],
    num: [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
        ['SYM', '.', ',', '?', '!', "'", 'BACK'],
        ['ABC', 'SPACE', 'ENTER'],
    ],
    sym: [
        ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
        ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
        ['NUM', '.', ',', '?', '!', "'", 'BACK'],
        ['ABC', 'SPACE', 'ENTER'],
    ],
};

// Memoized individual key to prevent full keyboard re-render on each press
// Module-level flag: once a touch is detected, skip all subsequent mouse events
let usedTouch = false;

const SPECIAL_KEYS = ['SHIFT', 'BACK', 'ENTER', 'SPACE', 'NUM', 'SYM', 'ABC'];

const KeyButton = memo(({ keyVal, isSpecial, isShiftActive, capsLock, onPress, onBackspaceDown, onBackspaceUp }) => {
    const [showPreview, setShowPreview] = useState(false);
    const previewTimer = useRef(null);

    const isCharKey = !SPECIAL_KEYS.includes(keyVal);

    const triggerPreview = useCallback(() => {
        if (!isCharKey) return;
        setShowPreview(true);
        clearTimeout(previewTimer.current);
        previewTimer.current = setTimeout(() => setShowPreview(false), 400);
    }, [isCharKey]);

    const getWidth = () => {
        switch (keyVal) {
            case 'SPACE': return 'flex-[3]';
            case 'ENTER': return 'flex-[1.5]';
            case 'SHIFT': return 'flex-[1.3]';
            case 'BACK': return 'flex-[1.3]';
            case 'NUM': case 'SYM': case 'ABC': return 'flex-[1.2]';
            default: return 'flex-1';
        }
    };

    const keyContent = (() => {
        switch (keyVal) {
            case 'SHIFT':
                return <ArrowBigUp size={20} fill={capsLock ? 'currentColor' : 'none'} strokeWidth={capsLock ? 2.5 : 1.5} />;
            case 'BACK':
                return <Delete size={20} strokeWidth={1.5} />;
            case 'ENTER':
                return <span className="text-xs font-semibold tracking-wide">Send</span>;
            case 'SPACE':
                return <span className="text-xs tracking-wider" style={{ color: 'rgba(0,0,0,0.3)' }}>incognito</span>;
            case 'NUM':
                return <span className="text-xs font-semibold">123</span>;
            case 'SYM':
                return <span className="text-xs font-semibold">#+=</span>;
            case 'ABC':
                return <span className="text-xs font-semibold">ABC</span>;
            default:
                return <span className="text-[17px] font-normal">{keyVal}</span>;
        }
    })();

    const specialBg = keyVal === 'ENTER'
        ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
        : isShiftActive && keyVal === 'SHIFT'
            ? 'rgba(255, 255, 255, 0.75)'
            : 'rgba(0, 0, 0, 0.04)';

    const specialColor = keyVal === 'ENTER' ? 'white' : 'rgba(0, 0, 0, 0.65)';

    const isBack = keyVal === 'BACK';

    // Touch handler — fires first on mobile, sets flag to block mouseDown
    const handleTouchStart = useCallback((e) => {
        e.preventDefault();
        usedTouch = true;
        triggerPreview();
        onPress(keyVal);
        if (isBack) onBackspaceDown();
    }, [keyVal, onPress, isBack, onBackspaceDown, triggerPreview]);

    const handleTouchEnd = useCallback((e) => {
        e.preventDefault();
        if (isBack) onBackspaceUp();
    }, [isBack, onBackspaceUp]);

    // Mouse handler — only fires on desktop (skipped if touch already fired)
    const handleMouseDown = useCallback((e) => {
        if (usedTouch) return; // Touch already handled this
        e.preventDefault();
        triggerPreview();
        onPress(keyVal);
        if (isBack) onBackspaceDown();
    }, [keyVal, onPress, isBack, onBackspaceDown, triggerPreview]);

    const handleMouseUp = useCallback(() => {
        if (usedTouch) return;
        if (isBack) onBackspaceUp();
    }, [isBack, onBackspaceUp]);

    return (
        <button
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={isBack ? onBackspaceUp : undefined}
            className={`h-[50px] text-[20px] rounded-[10px] flex items-center justify-center select-none relative ${getWidth()}`}
            style={{
                background: isSpecial ? specialBg : 'rgba(255, 255, 255, 0.95)',
                color: isSpecial ? specialColor : 'rgba(0, 0, 0, 0.85)',
                border: keyVal === 'ENTER' ? 'none' : '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: isSpecial ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                userSelect: 'none',
                overflow: 'visible',
            }}
        >
            {keyContent}

            {/* iOS-style key preview popup */}
            {showPreview && isCharKey && (
                <div
                    className="absolute pointer-events-none z-50 flex items-center justify-center rounded-xl"
                    style={{
                        bottom: '115%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 46,
                        height: 54,
                        background: 'rgba(255, 255, 255, 0.97)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.08)',
                        fontSize: 28,
                        fontWeight: 400,
                        color: 'rgba(0, 0, 0, 0.9)',
                    }}
                >
                    {keyVal}
                    {/* Tail pointing down */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: -6,
                            left: '50%',
                            transform: 'translateX(-50%) rotate(45deg)',
                            width: 12,
                            height: 12,
                            background: 'rgba(255, 255, 255, 0.97)',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            borderTop: 'none',
                            borderLeft: 'none',
                        }}
                    />
                </div>
            )}
        </button>
    );
});
KeyButton.displayName = 'KeyButton';

const IncognitoKeyboard = memo(({ onKeyPress, onBackspace, onEnter, visible }) => {
    const [layout, setLayout] = useState('lower');
    const [capsLock, setCapsLock] = useState(false);
    const backspaceTimer = useRef(null);
    const backspaceInterval = useRef(null);
    const layoutRef = useRef(layout);
    const capsLockRef = useRef(capsLock);

    // Keep refs in sync for use in non-re-rendering callbacks
    layoutRef.current = layout;
    capsLockRef.current = capsLock;

    const startBackspaceHold = useCallback(() => {
        backspaceTimer.current = setTimeout(() => {
            backspaceInterval.current = setInterval(() => {
                onBackspace();
            }, 50); // Faster repeat for smoother delete
        }, 350);
    }, [onBackspace]);

    const stopBackspaceHold = useCallback(() => {
        clearTimeout(backspaceTimer.current);
        clearInterval(backspaceInterval.current);
    }, []);

    // Single handler using refs to avoid re-render dependency
    const handleKey = useCallback((key) => {
        switch (key) {
            case 'SHIFT':
                if (layoutRef.current === 'lower') {
                    setLayout('upper');
                } else if (layoutRef.current === 'upper') {
                    if (capsLockRef.current) {
                        setCapsLock(false);
                        setLayout('lower');
                    } else {
                        setCapsLock(true);
                    }
                }
                break;
            case 'BACK':
                onBackspace();
                break;
            case 'ENTER':
                onEnter();
                break;
            case 'SPACE':
                onKeyPress(' ');
                break;
            case 'NUM':
                setLayout('num');
                break;
            case 'SYM':
                setLayout('sym');
                break;
            case 'ABC':
                setLayout(capsLockRef.current ? 'upper' : 'lower');
                break;
            default:
                onKeyPress(key);
                // Auto-lowercase after one uppercase letter (unless caps lock)
                if (layoutRef.current === 'upper' && !capsLockRef.current) {
                    setLayout('lower');
                }
                break;
        }
    }, [onKeyPress, onBackspace, onEnter]);

    if (!visible) return null;

    const currentLayout = LAYOUTS[layout];
    const isShiftActive = layout === 'upper';

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="w-full flex-shrink-0"
            style={{
                background: 'rgba(210, 215, 225, 0.85)',
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                borderTop: '1px solid rgba(255, 255, 255, 0.4)',
                paddingBottom: 'env(safe-area-inset-bottom, 8px)',
            }}
        >
            {/* Privacy Badge */}
            <div className="flex items-center justify-center gap-1.5 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(0, 0, 0, 0.25)' }}>
                    Incognito Keyboard — No Data Leaves This App
                </span>
            </div>

            {/* Keyboard Rows */}
            <div className="px-2 pt-2 pb-4 space-y-[8px]">
                {currentLayout.map((row, ri) => (
                    <div key={ri} className="flex gap-[6px] justify-center px-0.5">
                        {row.map(key => {
                            const isSpecial = SPECIAL_KEYS.includes(key);
                            return (
                                <KeyButton
                                    key={key}
                                    keyVal={key}
                                    isSpecial={isSpecial}
                                    isShiftActive={isShiftActive}
                                    capsLock={capsLock}
                                    onPress={handleKey}
                                    onBackspaceDown={startBackspaceHold}
                                    onBackspaceUp={stopBackspaceHold}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </motion.div>
    );
});

IncognitoKeyboard.displayName = 'IncognitoKeyboard';

export default IncognitoKeyboard;
