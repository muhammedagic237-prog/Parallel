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
              transition={{ duration: 0.15 }}
              className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
              style={{ background: 'rgba(6, 10, 20, 0.88)', backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)' }}
            >
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(100, 160, 255, 0.08)', border: '1px solid rgba(120, 180, 255, 0.1)' }}>
                  <span className="text-4xl">🔒</span>
                </div>
                <h2 className="text-2xl font-bold tracking-widest uppercase text-white">Parallel Protected</h2>
                <p className="text-sm mt-2" style={{ color: 'rgba(140, 180, 255, 0.4)' }}>Content Hidden for Privacy</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {locked ? (
            <AuthGate key="auth" onAuthenticated={handleAuth} />
          ) : mode === 'dummy' ? (
            <DummyDashboard key="dummy" onLock={handleLock} />
          ) : mode === 'private' ? (
            <PrivateChat key="private" onLock={handleLock} />
          ) : null}
        </AnimatePresence>
      </div>
    </PremiumProvider>
  );
}

export default App;
