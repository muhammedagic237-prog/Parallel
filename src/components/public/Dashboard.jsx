import React from 'react';

const FinanceDashboard = ({ onUnlock }) => {
    return (
        <div style={{ backgroundColor: 'red', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', zIndex: 99999 }} onClick={onUnlock} onTouchStart={onUnlock}>
            <h1 style={{ fontSize: '40px', color: 'white', fontWeight: 'bold' }}>DEBUG MODE ACTIVE</h1>
            <p style={{ color: 'white', fontSize: '20px' }}>TAP ANYWHERE TO UNLOCK</p>
            <p style={{ color: 'black', marginTop: '20px' }}>If you see the bank UI, the cache is still broken.</p>
        </div>
    );
};

export default FinanceDashboard;
