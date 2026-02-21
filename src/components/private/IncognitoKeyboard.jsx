import React, { useState, useCallback, useRef, memo } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Delete, ArrowBigUp, Globe, ChevronLeft } from 'lucide-react';

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

const IncognitoKeyboard = memo(({ onKeyPress, onBackspace, onEnter, visible }) => {
    const [layout, setLayout] = useState('lower');
    const [capsLock, setCapsLock] = useState(false);
    const backspaceTimer = useRef(null);
    const backspaceInterval = useRef(null);

    const handleKey = useCallback((key) => {
        if (navigator.vibrate) navigator.vibrate(5); // Subtle haptic

        switch (key) {
            case 'SHIFT':
                if (layout === 'lower') {
                    setLayout('upper');
                } else if (layout === 'upper') {
                    if (capsLock) {
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
                setLayout(capsLock ? 'upper' : 'lower');
                break;
            default:
                onKeyPress(key);
                // Auto-lowercase after typing one uppercase letter (unless caps lock)
                if (layout === 'upper' && !capsLock) {
                    setLayout('lower');
                }
                break;
        }
    }, [layout, capsLock, onKeyPress, onBackspace, onEnter]);

    // Long-press backspace for continuous delete
    const startBackspaceHold = useCallback(() => {
        backspaceTimer.current = setTimeout(() => {
            backspaceInterval.current = setInterval(() => {
                onBackspace();
                if (navigator.vibrate) navigator.vibrate(3);
            }, 60);
        }, 400);
    }, [onBackspace]);

    const stopBackspaceHold = useCallback(() => {
        clearTimeout(backspaceTimer.current);
        clearInterval(backspaceInterval.current);
    }, []);

    const getKeyWidth = (key) => {
        switch (key) {
            case 'SPACE': return 'flex-[3]';
            case 'ENTER': return 'flex-[1.5]';
            case 'SHIFT': return 'flex-[1.3]';
            case 'BACK': return 'flex-[1.3]';
            case 'NUM': case 'SYM': case 'ABC': return 'flex-[1.2]';
            default: return 'flex-1';
        }
    };

    const renderKey = (key) => {
        const isSpecial = ['SHIFT', 'BACK', 'ENTER', 'NUM', 'SYM', 'ABC', 'SPACE'].includes(key);
        const isShiftActive = (layout === 'upper');

        const keyContent = (() => {
            switch (key) {
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
                    return <span className="text-[17px] font-normal">{key}</span>;
            }
        })();

        const specialBg = key === 'ENTER'
            ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
            : isShiftActive && key === 'SHIFT'
                ? 'rgba(255, 255, 255, 0.75)'
                : 'rgba(0, 0, 0, 0.04)';

        const specialColor = key === 'ENTER'
            ? 'white'
            : 'rgba(0, 0, 0, 0.65)';

        return (
            <button
                key={key}
                onTouchStart={key === 'BACK' ? startBackspaceHold : undefined}
                onTouchEnd={key === 'BACK' ? stopBackspaceHold : undefined}
                onMouseDown={key === 'BACK' ? startBackspaceHold : undefined}
                onMouseUp={key === 'BACK' ? stopBackspaceHold : undefined}
                onMouseLeave={key === 'BACK' ? stopBackspaceHold : undefined}
                onClick={() => handleKey(key)}
                className={`h-[42px] rounded-lg flex items-center justify-center active:scale-[0.92] active:opacity-70 transition-all select-none ${getKeyWidth(key)}`}
                style={{
                    background: isSpecial ? specialBg : 'rgba(255, 255, 255, 0.65)',
                    color: isSpecial ? specialColor : 'rgba(0, 0, 0, 0.85)',
                    border: key === 'ENTER' ? 'none' : '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: isSpecial ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                }}
            >
                {keyContent}
            </button>
        );
    };

    if (!visible) return null;

    const currentLayout = LAYOUTS[layout];

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
            <div className="px-1.5 pb-2 space-y-[5px]">
                {currentLayout.map((row, ri) => (
                    <div key={ri} className="flex gap-[5px] justify-center px-0.5">
                        {row.map(key => renderKey(key))}
                    </div>
                ))}
            </div>
        </motion.div>
    );
});

IncognitoKeyboard.displayName = 'IncognitoKeyboard';

export default IncognitoKeyboard;
