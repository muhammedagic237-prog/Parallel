import React, { createContext, useContext, useState, useEffect } from 'react';

const PremiumContext = createContext();

export const usePremium = () => useContext(PremiumContext);

export const PremiumProvider = ({ children }) => {
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        // Check local storage on mount
        const unlocked = localStorage.getItem('parallel_premium_unlocked') === 'true';
        setIsPremium(unlocked);
    }, []);

    const unlockPremium = () => {
        localStorage.setItem('parallel_premium_unlocked', 'true');
        setIsPremium(true);
        // Dispatch event for other tabs if needed
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <PremiumContext.Provider value={{ isPremium, unlockPremium }}>
            {children}
        </PremiumContext.Provider>
    );
};
