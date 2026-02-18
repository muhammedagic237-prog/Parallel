import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

import AuthGate from './components/auth/AuthGate';
import PrivateChat from './components/private/PrivateChat';
import DummyDashboard from './components/public/DummyDashboard'; // Realistic Crypto Wallet

import { PremiumProvider } from './context/PremiumContext';

function App() {
  const [locked, setLocked] = useState(true); // Locked by default
  const [mode, setMode] = useState('private'); // 'private' | 'dummy'
  const [isBackgrounded, setIsBackgrounded] = useState(false);

  // Curtain Mode: Blur when app is in background
  useEffect(() => {
    const handleBlur = () => setIsBackgrounded(true);
    const handleFocus = () => setIsBackgrounded(false);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleAuth = (accessMode) => {
    setMode(accessMode);
    setLocked(false);
  };

  const handleLock = () => {
    setLocked(true);
  };

  return (
    <PremiumProvider>
      <div className="h-[100dvh] w-full bg-black overflow-hidden relative">
        {/* Privacy Curtain (Blur) */}
        <AnimatePresence>
          {isBackgrounded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-3xl flex items-center justify-center pointer-events-none"
            >
              <div className="text-white text-center">
                <div className="text-6xl mb-6">🔒</div>
                <h2 className="text-2xl font-bold tracking-widest uppercase">Parallel Protected</h2>
                <p className="text-sm text-gray-400 mt-2">Content Hidden for Privacy</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {locked ? (
            <AuthGate key="auth" onAuthenticated={handleAuth} />
          ) : (
            mode === 'dummy' ? (
              <DummyDashboard key="dummy" onLock={handleLock} />
            ) : null
          )}


          {/* 
        PrivateChat is ALWAYS mounted (but hidden) to preserve P2P RAM state.
        It is only visible when !locked and mode === 'private'.
      */}
          <div className="absolute inset-0 z-20" style={{ display: (!locked && mode === 'private') ? 'block' : 'none' }}>
            <PrivateChat key="private" onLock={handleLock} />
          </div>
        </AnimatePresence>
      </div>
    </PremiumProvider>
  );
}

export default App;
