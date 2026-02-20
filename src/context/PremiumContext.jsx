import React, { createContext, useContext, useState } from 'react';

const PremiumContext = createContext();

export const PremiumProvider = ({ children }) => {
    const [isPremium, setIsPremium] = useState(() => {
        return localStorage.getItem('parallel_premium_unlocked') === 'true';
    });

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

// eslint-disable-next-line react-refresh/only-export-components
export const usePremium = () => useContext(PremiumContext);
