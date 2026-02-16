import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import AuthGate from './components/auth/AuthGate';
import PrivateChat from './components/private/PrivateChat';
import DummyDashboard from './components/public/DummyDashboard'; // Realistic Crypto Wallet

function App() {
  const [locked, setLocked] = useState(true); // Locked by default
  const [mode, setMode] = useState('private'); // 'private' | 'dummy'

  const handleAuth = (accessMode) => {
    setMode(accessMode);
    setLocked(false);
  };

  const handleLock = () => {
    setLocked(true);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50 relative">
      <AnimatePresence mode="wait">
        {locked ? (
          <AuthGate key="auth" onAuthenticated={handleAuth} />
        ) : (
          mode === 'dummy' ? (
            <DummyDashboard key="dummy" onLock={handleLock} />
          ) : (
            <div className="absolute inset-0 z-20">
              <PrivateChat key="private" onLock={handleLock} />
            </div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
