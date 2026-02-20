import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, EyeOff, MessagesSquare, CheckCircle2, ChevronRight, Fingerprint } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

import AuthGate from './components/auth/AuthGate';
import PrivateChat from './components/private/PrivateChat';
import SystemMonitor from './components/public/SystemMonitor';
import DummyDashboard from './components/public/DummyDashboard'; // Realistic Crypto Wallet

import { PremiumProvider } from './context/PremiumContext';
import ErrorBoundary from './components/ErrorBoundary';

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
      <ErrorBoundary>
        <div className="h-[100dvh] w-full ios26-wallpaper overflow-hidden relative">
          {/* Privacy Curtain (Frosted Glass) */}
          <AnimatePresence>
            {isBackgrounded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(50px) saturate(200%)', WebkitBackdropFilter: 'blur(50px) saturate(200%)' }}
              >
                <div className="text-center">
                  <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
                    <span className="text-4xl">🔒</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-widest uppercase" style={{ color: 'rgba(0, 0, 0, 0.8)' }}>Parallel Protected</h2>
                  <p className="text-sm mt-2" style={{ color: 'rgba(0, 0, 0, 0.35)' }}>Content Hidden for Privacy</p>
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
            ) : mode === 'notes' ? (
              <SystemMonitor key="sysmon" onLock={handleLock} />
            ) : null}
          </AnimatePresence>
        </div>
      </ErrorBoundary>
    </PremiumProvider>
  );
}

export default App;
