import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, RefreshCcw, Settings, Wallet, CreditCard, Activity, TrendingUp, Bell, Copy, QrCode, Eye, EyeOff, Clock, ChevronRight } from 'lucide-react';

const DummyDashboard = ({ onLock }) => {
    const [assets, setAssets] = useState([
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', balance: 0.0165, price: 96400, change: 2.4, color: '#F7931A', history: [94000, 95200, 94800, 95600, 96000, 96200, 96400] },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', balance: 0.48, price: 2750, change: -1.2, color: '#627EEA', history: [2800, 2780, 2760, 2750, 2740, 2745, 2750] },
        { id: 'solana', symbol: 'SOL', name: 'Solana', balance: 5.2, price: 112, change: 5.8, color: '#9945FF', history: [105, 107, 108, 110, 111, 112, 112.4] },
        { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', balance: 1250, price: 0.182, change: 3.1, color: '#C2A633', history: [0.175, 0.177, 0.179, 0.180, 0.181, 0.182, 0.182] },
        { id: 'ripple', symbol: 'XRP', name: 'XRP', balance: 320, price: 0.78, change: -0.8, color: '#23292F', history: [0.79, 0.785, 0.782, 0.78, 0.779, 0.781, 0.78] },
        { id: 'cardano', symbol: 'ADA', name: 'Cardano', balance: 450, price: 0.62, change: 1.5, color: '#0033AD', history: [0.61, 0.612, 0.615, 0.618, 0.619, 0.621, 0.62] },
    ]);
    const [loading, setLoading] = useState(false);
    const [balanceHidden, setBalanceHidden] = useState(false);
    const [activeTab, setActiveTab] = useState('portfolio');
    const [lastUpdated, setLastUpdated] = useState(null);

    const transactions = [
        { type: 'receive', asset: 'BTC', amount: '+0.005', from: '0x8a2f...3b1e', time: '2h ago', usdValue: '+$482.00' },
        { type: 'send', asset: 'ETH', amount: '-0.12', to: '0x4c7d...9f2a', time: '5h ago', usdValue: '-$330.00' },
        { type: 'swap', assetFrom: 'SOL', assetTo: 'DOGE', amount: '2 SOL → 1,230 DOGE', time: '1d ago', usdValue: '$224.80' },
        { type: 'receive', asset: 'XRP', amount: '+150', from: 'Binance', time: '2d ago', usdValue: '+$117.00' },
        { type: 'buy', asset: 'ADA', amount: '+200', time: '3d ago', usdValue: '$124.00' },
        { type: 'send', asset: 'BTC', amount: '-0.003', to: '0xf1e2...a8c4', time: '4d ago', usdValue: '-$289.20' },
        { type: 'receive', asset: 'SOL', amount: '+1.5', from: 'Phantom', time: '5d ago', usdValue: '+$168.00' },
    ];

    const fetchPrices = useCallback(async () => {
        setLoading(true);
        try {
            const ids = 'bitcoin,ethereum,solana,dogecoin,ripple,cardano';
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
            const data = await response.json();

            if (data) {
                setAssets(prev => prev.map(asset => {
                    const marketData = data[asset.id];
                    if (marketData) {
                        const newPrice = marketData.usd;
                        return {
                            ...asset,
                            price: newPrice,
                            change: marketData.usd_24h_change || asset.change,
                            history: [...asset.history.slice(1), newPrice],
                        };
                    }
                    return asset;
                }));
                setLastUpdated(new Date());
            }
        } catch {
            // Silently fail — fallback prices remain
        } finally {
            setTimeout(() => setLoading(false), 600);
        }
    }, []);

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 30000);
        return () => clearInterval(interval);
    }, [fetchPrices]);

    const totalBalance = assets.reduce((sum, a) => sum + (a.price * a.balance), 0);
    const totalChange = assets.reduce((sum, a) => {
        const val = a.price * a.balance;
        return sum + (val * (a.change / 100));
    }, 0);
    const percentChange = totalBalance > 0 ? (totalChange / (totalBalance - totalChange)) * 100 : 0;

    const chartPath = (history, w, h) => {
        const min = Math.min(...history);
        const max = Math.max(...history);
        const range = max - min || 1;
        const step = w / (history.length - 1);
        return 'M ' + history.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(' L ');
    };

    const formatPrice = (price) => {
        if (price >= 1) return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return '$' + price.toFixed(4);
    };

    const getCryptoIcon = (symbol) => {
        const icons = { BTC: '₿', ETH: 'Ξ', SOL: '◎', DOGE: 'Ð', XRP: '✕', ADA: '₳' };
        return icons[symbol] || symbol[0];
    };

    return (
        <div className="h-[100dvh] flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-8 pb-6 relative z-10" style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)' }}>
                {/* Top row */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={onLock} className="p-2.5 rounded-xl active:scale-95 transition-transform" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.7)' }}>
                        <ArrowLeft size={18} style={{ color: 'rgba(0, 0, 0, 0.7)' }} />
                    </button>
                    <div className="flex gap-2">
                        <button className="p-2.5 rounded-xl relative" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.7)', color: 'rgba(0, 0, 0, 0.6)' }}>
                            <Bell size={18} />
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                        <button className="p-2.5 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.7)', color: 'rgba(0, 0, 0, 0.6)' }}>
                            <QrCode size={18} />
                        </button>
                        <button className="p-2.5 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.7)', color: 'rgba(0, 0, 0, 0.6)' }}>
                            <Settings size={18} />
                        </button>
                    </div>
                </div>

                {/* Balance */}
                <div className="flex flex-col items-center mb-5">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>Total Balance</span>
                        <button onClick={() => setBalanceHidden(!balanceHidden)} className="active:opacity-60" style={{ color: 'rgba(0, 0, 0, 0.35)' }}>
                            {balanceHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                    <h1 className="text-[38px] font-black tracking-tight leading-none" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                        {balanceHidden ? '••••••' : `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </h1>
                    <div className={`flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-bold ${totalChange >= 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                        {totalChange >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        <span>{totalChange >= 0 ? '+' : ''}${Math.abs(totalChange).toFixed(2)} ({percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%)</span>
                    </div>
                    {lastUpdated && (
                        <span className="text-[10px] mt-2 flex items-center gap-1" style={{ color: 'rgba(0, 0, 0, 0.3)' }}>
                            <Clock size={10} />
                            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-5">
                    <ActionButton icon={<ArrowUpRight />} label="Send" />
                    <ActionButton icon={<ArrowDownRight />} label="Receive" />
                    <ActionButton icon={<RefreshCcw className={loading ? 'animate-spin' : ''} />} label="Swap" onClick={fetchPrices} />
                    <ActionButton icon={<CreditCard />} label="Buy" />
                    <ActionButton icon={<Copy />} label="Copy" />
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex px-5 pt-4 pb-2 gap-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.3)' }}>
                <button
                    onClick={() => setActiveTab('portfolio')}
                    className={`pb-2 text-sm font-semibold transition-colors relative`}
                    style={{ color: activeTab === 'portfolio' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.35)' }}
                >
                    Portfolio
                    {activeTab === 'portfolio' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('activity')}
                    className={`pb-2 text-sm font-semibold transition-colors relative`}
                    style={{ color: activeTab === 'activity' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.35)' }}
                >
                    Activity
                    {activeTab === 'activity' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {activeTab === 'portfolio' ? (
                    <>
                        {assets.map(asset => {
                            const value = asset.price * asset.balance;
                            return (
                                <div key={asset.id} className="p-4 rounded-2xl flex items-center justify-between transition-all" style={{ background: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(20px)' }}>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black"
                                            style={{ backgroundColor: asset.color + '18', color: asset.color, border: `1.5px solid ${asset.color}33` }}
                                        >
                                            {getCryptoIcon(asset.symbol)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[15px] leading-tight" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{asset.name}</h4>
                                            <span className="text-[11px]" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>{asset.balance} {asset.symbol}</span>
                                        </div>
                                    </div>

                                    {/* Sparkline */}
                                    <div className="w-16 h-8 mx-2">
                                        <svg width="64" height="32" viewBox="0 0 100 50" preserveAspectRatio="none">
                                            <path d={chartPath(asset.history, 100, 50)} fill="none" stroke={asset.change >= 0 ? '#16a34a' : '#dc2626'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>

                                    <div className="text-right min-w-[80px]">
                                        <h4 className="font-bold text-[14px]" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{balanceHidden ? '•••' : `$${value.toFixed(2)}`}</h4>
                                        <div className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${asset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {asset.change >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                            {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                                        </div>
                                        <span className="text-[10px]" style={{ color: 'rgba(0, 0, 0, 0.3)' }}>{formatPrice(asset.price)}</span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Trending */}
                        <div className="mt-4 px-1">
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-1" style={{ color: 'rgba(0, 0, 0, 0.5)' }}><TrendingUp size={14} /> Trending</h3>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {[
                                    { name: 'PEPE', change: '+12.4%', color: '#16a34a' },
                                    { name: 'WIF', change: '+8.7%', color: '#16a34a' },
                                    { name: 'BONK', change: '-3.2%', color: '#dc2626' },
                                    { name: 'JUP', change: '+6.1%', color: '#16a34a' },
                                ].map(t => (
                                    <div key={t.name} className="rounded-xl px-3 py-2 min-w-[80px] text-center flex-shrink-0" style={{ background: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(255, 255, 255, 0.6)' }}>
                                        <span className="text-xs font-bold block" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{t.name}</span>
                                        <span className="text-[11px] font-semibold" style={{ color: t.color }}>{t.change}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {transactions.map((tx, i) => (
                            <div key={i} className="p-4 rounded-2xl flex items-center justify-between" style={{ background: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(20px)' }}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'receive' ? 'bg-green-500/10 text-green-600' :
                                        tx.type === 'send' ? 'bg-red-500/10 text-red-600' :
                                            tx.type === 'swap' ? 'bg-purple-500/10 text-purple-600' :
                                                'bg-blue-500/10 text-blue-600'
                                        }`}>
                                        {tx.type === 'receive' ? <ArrowDownRight size={18} /> :
                                            tx.type === 'send' ? <ArrowUpRight size={18} /> :
                                                tx.type === 'swap' ? <RefreshCcw size={16} /> :
                                                    <CreditCard size={16} />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[14px] capitalize" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{tx.type}</h4>
                                        <span className="text-[11px]" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                                            {tx.type === 'swap' ? tx.amount : `${tx.amount} ${tx.asset}`}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[13px] font-bold ${tx.usdValue.startsWith('+') ? 'text-green-600' :
                                        tx.usdValue.startsWith('-') ? 'text-red-600' : ''
                                        }`} style={!tx.usdValue.startsWith('+') && !tx.usdValue.startsWith('-') ? { color: 'rgba(0, 0, 0, 0.85)' } : {}}>{tx.usdValue}</span>
                                    <div className="text-[10px] flex items-center justify-end gap-1" style={{ color: 'rgba(0, 0, 0, 0.3)' }}>
                                        <Clock size={9} />{tx.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Bottom Nav */}
            <div className="h-20 flex items-center justify-around pb-4" style={{ background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', borderTop: '1px solid rgba(255, 255, 255, 0.5)' }}>
                <NavIcon icon={<Wallet />} label="Wallet" active />
                <NavIcon icon={<TrendingUp />} label="Market" />
                <NavIcon icon={<RefreshCcw />} label="Trade" />
                <NavIcon icon={<Activity />} label="Earn" />
                <NavIcon icon={<Settings />} label="Settings" />
            </div>
        </div>
    );
};

const ActionButton = ({ icon, label, onClick }) => (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={onClick}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-active:scale-90 transition-transform" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.7)', color: 'rgba(0, 0, 0, 0.7)' }}>
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <span className="text-[10px] font-semibold" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{label}</span>
    </div>
);

const NavIcon = ({ icon, label, active }) => (
    <div className={`flex flex-col items-center gap-1 cursor-pointer transition-colors`} style={{ color: active ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.3)' }}>
        {React.cloneElement(icon, { size: 22 })}
        <span className="text-[10px] font-medium">{label}</span>
    </div>
);

export default DummyDashboard;
