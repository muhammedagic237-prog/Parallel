import React, { useState, useRef, useEffect, useCallback } from 'react';

const CalculatorDecoy = ({ onLock }) => {
    const [display, setDisplay] = useState('0');
    const [prevValue, setPrevValue] = useState(null);
    const [operator, setOperator] = useState(null);
    const [waitingForNewValue, setWaitingForNewValue] = useState(false);

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
    const handleEqualsInteractionStart = useCallback((e) => {
        e.preventDefault(); // Prevent default touch behavior
        handleEquals();

        // Wait 1.5 seconds. If they are holding it down AND the display shows "2025," trigger the lock.
        pressTimer.current = setTimeout(() => {
            setDisplay(prevDisplay => {
                if (prevDisplay === '2025' || prevDisplay === '2025.') {
                    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
                    onLock();
                }
                return prevDisplay;
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
        <div className="h-[100dvh] w-full bg-black flex flex-col font-sans select-none overflow-hidden">
            {/* Display Area */}
            <div className={`flex-1 flex items-end justify-end px-6 pb-4 ${fontSize} tracking-tight font-light text-white overflow-hidden break-all`}>
                {formatDisplay(display)}
            </div>

            {/* Keypad */}
            <div className="w-full px-4 pb-8 space-y-3">
                {/* Row 1 */}
                <div className="flex gap-3 justify-between">
                    <button onClick={clearAll} className="w-[22%] aspect-square rounded-full bg-[#a5a5a5] active:bg-[#d4d4d2] text-black text-2xl font-medium transition-colors">
                        {display === '0' ? 'AC' : 'C'}
                    </button>
                    <button onClick={toggleSign} className="w-[22%] aspect-square rounded-full bg-[#a5a5a5] active:bg-[#d4d4d2] text-black text-2xl font-medium transition-colors">
                        +/-
                    </button>
                    <button onClick={inputPercent} className="w-[22%] aspect-square rounded-full bg-[#a5a5a5] active:bg-[#d4d4d2] text-black text-2xl font-medium transition-colors">
                        %
                    </button>
                    <button onClick={() => handleOperator('÷')} className={`w-[22%] aspect-square rounded-full text-3xl font-medium transition-colors ${operator === '÷' && waitingForNewValue ? 'bg-white text-[#f1a33b]' : 'bg-[#f1a33b] active:bg-[#f3c285] text-white'}`}>
                        ÷
                    </button>
                </div>
                {/* Row 2 */}
                <div className="flex gap-3 justify-between">
                    <button onClick={() => inputDigit('7')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] text-white text-3xl font-normal transition-colors">7</button>
                    <button onClick={() => inputDigit('8')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] text-white text-3xl font-normal transition-colors">8</button>
                    <button onClick={() => inputDigit('9')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] text-white text-3xl font-normal transition-colors">9</button>
                    <button onClick={() => handleOperator('×')} className={`w-[22%] aspect-square rounded-full text-3xl font-medium transition-colors ${operator === '×' && waitingForNewValue ? 'bg-white text-[#f1a33b]' : 'bg-[#f1a33b] active:bg-[#f3c285] text-white'}`}>
                        ×
                    </button>
                </div>
                {/* Row 3 */}
                <div className="flex gap-3 justify-between">
                    <button onClick={() => inputDigit('4')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] text-white text-3xl font-normal transition-colors">4</button>
                    <button onClick={() => inputDigit('5')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] text-white text-3xl font-normal transition-colors">5</button>
                    <button onClick={() => inputDigit('6')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] text-white text-3xl font-normal transition-colors">6</button>
                    <button onClick={() => handleOperator('-')} className={`w-[22%] aspect-square rounded-full text-4xl font-medium transition-colors ${operator === '-' && waitingForNewValue ? 'bg-white text-[#f1a33b]' : 'bg-[#f1a33b] active:bg-[#f3c285] text-white'}`}>
                        −
                    </button>
                </div>
                {/* Row 4 */}
                <div className="flex gap-3 justify-between">
                    <button onClick={() => inputDigit('1')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] text-white text-3xl font-normal transition-colors">1</button>
                    <button onClick={() => inputDigit('2')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] text-white text-3xl font-normal transition-colors">2</button>
                    <button onClick={() => inputDigit('3')} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] text-white text-3xl font-normal transition-colors">3</button>
                    <button onClick={() => handleOperator('+')} className={`w-[22%] aspect-square rounded-full text-4xl font-medium transition-colors ${operator === '+' && waitingForNewValue ? 'bg-white text-[#f1a33b]' : 'bg-[#f1a33b] active:bg-[#f3c285] text-white'}`}>
                        +
                    </button>
                </div>
                {/* Row 5 */}
                <div className="flex gap-3 justify-between">
                    <button onClick={() => inputDigit('0')} className="w-[47.5%] aspect-[2.15/1] rounded-full bg-[#333333] active:bg-[#737373] text-white text-3xl font-normal transition-colors flex items-center justify-start pl-8 text-left">
                        0
                    </button>
                    <button onClick={inputDot} className="w-[22%] aspect-square rounded-full bg-[#333333] active:bg-[#737373] text-white text-3xl font-normal transition-colors">.</button>

                    {/* The Secret '=' Button */}
                    <button
                        onMouseDown={handleEqualsInteractionStart}
                        onMouseUp={handleEqualsInteractionEnd}
                        onMouseLeave={handleEqualsInteractionEnd}
                        onTouchStart={handleEqualsInteractionStart}
                        onTouchEnd={handleEqualsInteractionEnd}
                        className="w-[22%] aspect-square rounded-full bg-[#f1a33b] active:bg-[#f3c285] text-white text-4xl font-medium transition-colors select-none"
                    >
                        =
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalculatorDecoy;
