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
    const [activeTab, setActiveTab] = useState('portfolio'); // portfolio | activity
    const [lastUpdated, setLastUpdated] = useState(null);

    // Fake transaction history
    const transactions = [
        { type: 'receive', asset: 'BTC', amount: '+0.005', from: '0x8a2f...3b1e', time: '2h ago', usdValue: '+$482.00' },
        { type: 'send', asset: 'ETH', amount: '-0.12', to: '0x4c7d...9f2a', time: '5h ago', usdValue: '-$330.00' },
        { type: 'swap', assetFrom: 'SOL', assetTo: 'DOGE', amount: '2 SOL → 1,230 DOGE', time: '1d ago', usdValue: '$224.80' },
        { type: 'receive', asset: 'XRP', amount: '+150', from: 'Binance', time: '2d ago', usdValue: '+$117.00' },
        { type: 'buy', asset: 'ADA', amount: '+200', time: '3d ago', usdValue: '$124.00' },
        { type: 'send', asset: 'BTC', amount: '-0.003', to: '0xf1e2...a8c4', time: '4d ago', usdValue: '-$289.20' },
        { type: 'receive', asset: 'SOL', amount: '+1.5', from: 'Phantom', time: '5d ago', usdValue: '+$168.00' },
    ];

    // Fetch Live Prices (CoinGecko)
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
        const interval = setInterval(fetchPrices, 30000); // Every 30s for real-time feel
        return () => clearInterval(interval);
    }, [fetchPrices]);

    const totalBalance = assets.reduce((sum, a) => sum + (a.price * a.balance), 0);
    const totalChange = assets.reduce((sum, a) => {
        const val = a.price * a.balance;
        return sum + (val * (a.change / 100));
    }, 0);
    const percentChange = totalBalance > 0 ? (totalChange / (totalBalance - totalChange)) * 100 : 0;

    // SVG Chart path
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
        <div className="bg-black text-white h-[100dvh] flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-8 pb-6 bg-gradient-to-b from-[#0a0a0a] to-black relative z-10">
                {/* Top row */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={onLock} className="p-2.5 bg-[#1a1a1a] rounded-xl active:scale-95 transition-transform border border-[#2a2a2a]">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex gap-2">
                        <button className="p-2.5 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] relative">
                            <Bell size={18} />
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                        <button className="p-2.5 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
                            <QrCode size={18} />
                        </button>
                        <button className="p-2.5 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
                            <Settings size={18} />
                        </button>
                    </div>
                </div>

                {/* Balance */}
                <div className="flex flex-col items-center mb-5">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-500 text-xs font-semibold tracking-[0.15em] uppercase">Total Balance</span>
                        <button onClick={() => setBalanceHidden(!balanceHidden)} className="text-gray-500 active:text-white">
                            {balanceHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                    <h1 className="text-[38px] font-black tracking-tight leading-none">
                        {balanceHidden ? '••••••' : `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </h1>
                    <div className={`flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-bold ${totalChange >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {totalChange >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        <span>{totalChange >= 0 ? '+' : ''}${Math.abs(totalChange).toFixed(2)} ({percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%)</span>
                    </div>
                    {lastUpdated && (
                        <span className="text-gray-600 text-[10px] mt-2 flex items-center gap-1">
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
            <div className="flex px-5 pt-4 pb-2 gap-4 border-b border-[#1a1a1a]">
                <button
                    onClick={() => setActiveTab('portfolio')}
                    className={`pb-2 text-sm font-semibold transition-colors relative ${activeTab === 'portfolio' ? 'text-white' : 'text-gray-500'}`}
                >
                    Portfolio
                    {activeTab === 'portfolio' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3797F0] rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('activity')}
                    className={`pb-2 text-sm font-semibold transition-colors relative ${activeTab === 'activity' ? 'text-white' : 'text-gray-500'}`}
                >
                    Activity
                    {activeTab === 'activity' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3797F0] rounded-full" />}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {activeTab === 'portfolio' ? (
                    <>
                        {assets.map(asset => {
                            const value = asset.price * asset.balance;
                            return (
                                <div key={asset.id} className="bg-[#111] p-4 rounded-2xl flex items-center justify-between active:bg-[#181818] transition-all border border-[#1c1c1c]">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black"
                                            style={{ backgroundColor: asset.color + '22', color: asset.color, border: `1.5px solid ${asset.color}44` }}
                                        >
                                            {getCryptoIcon(asset.symbol)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[15px] leading-tight">{asset.name}</h4>
                                            <span className="text-[11px] text-gray-500">{asset.balance} {asset.symbol}</span>
                                        </div>
                                    </div>

                                    {/* Sparkline */}
                                    <div className="w-16 h-8 mx-2">
                                        <svg width="64" height="32" viewBox="0 0 100 50" preserveAspectRatio="none">
                                            <path d={chartPath(asset.history, 100, 50)} fill="none" stroke={asset.change >= 0 ? '#4ade80' : '#ef4444'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>

                                    <div className="text-right min-w-[80px]">
                                        <h4 className="font-bold text-[14px]">{balanceHidden ? '•••' : `$${value.toFixed(2)}`}</h4>
                                        <div className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {asset.change >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                            {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                                        </div>
                                        <span className="text-gray-600 text-[10px]">{formatPrice(asset.price)}</span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Market Movers - Bottom */}
                        <div className="mt-4 px-1">
                            <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-1"><TrendingUp size={14} /> Trending</h3>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {[
                                    { name: 'PEPE', change: '+12.4%', color: '#4ade80' },
                                    { name: 'WIF', change: '+8.7%', color: '#4ade80' },
                                    { name: 'BONK', change: '-3.2%', color: '#ef4444' },
                                    { name: 'JUP', change: '+6.1%', color: '#4ade80' },
                                ].map(t => (
                                    <div key={t.name} className="bg-[#111] border border-[#1c1c1c] rounded-xl px-3 py-2 min-w-[80px] text-center flex-shrink-0">
                                        <span className="text-xs font-bold block">{t.name}</span>
                                        <span className="text-[11px] font-semibold" style={{ color: t.color }}>{t.change}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    /* Activity / Transactions */
                    <>
                        {transactions.map((tx, i) => (
                            <div key={i} className="bg-[#111] p-4 rounded-2xl flex items-center justify-between border border-[#1c1c1c]">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'receive' ? 'bg-green-500/10 text-green-400' :
                                            tx.type === 'send' ? 'bg-red-500/10 text-red-400' :
                                                tx.type === 'swap' ? 'bg-purple-500/10 text-purple-400' :
                                                    'bg-blue-500/10 text-blue-400'
                                        }`}>
                                        {tx.type === 'receive' ? <ArrowDownRight size={18} /> :
                                            tx.type === 'send' ? <ArrowUpRight size={18} /> :
                                                tx.type === 'swap' ? <RefreshCcw size={16} /> :
                                                    <CreditCard size={16} />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[14px] capitalize">{tx.type}</h4>
                                        <span className="text-[11px] text-gray-500">
                                            {tx.type === 'swap' ? tx.amount : `${tx.amount} ${tx.asset}`}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[13px] font-bold ${tx.usdValue.startsWith('+') ? 'text-green-400' :
                                            tx.usdValue.startsWith('-') ? 'text-red-400' : 'text-white'
                                        }`}>{tx.usdValue}</span>
                                    <div className="text-[10px] text-gray-600 flex items-center justify-end gap-1">
                                        <Clock size={9} />{tx.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Bottom Nav */}
            <div className="h-20 bg-[#050505] border-t border-[#1a1a1a] flex items-center justify-around text-gray-500 pb-4">
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
        <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center text-white group-active:scale-90 transition-transform border border-[#2a2a2a]">
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <span className="text-[10px] text-gray-400 font-semibold">{label}</span>
    </div>
);

const NavIcon = ({ icon, label, active }) => (
    <div className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${active ? 'text-white' : 'text-gray-600'}`}>
        {React.cloneElement(icon, { size: 22 })}
        <span className="text-[10px] font-medium">{label}</span>
    </div>
);

export default DummyDashboard;
