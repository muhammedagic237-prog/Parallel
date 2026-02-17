import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, RefreshCcw, Settings, Wallet, CreditCard, Activity } from 'lucide-react';
// framer-motion removed — not used in this component

const DummyDashboard = ({ onLock }) => {
    const [assets, setAssets] = useState([
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', balance: 0.245, price: 96400, change: 2.4, history: [94000, 95200, 94800, 96000, 96400] },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', balance: 4.12, price: 2750, change: -1.2, history: [2800, 2780, 2760, 2740, 2750] },
        { id: 'solana', symbol: 'SOL', name: 'Solana', balance: 145.5, price: 112.40, change: 5.8, history: [105, 108, 110, 111, 112.4] }
    ]);
    const [loading, setLoading] = useState(false);

    // Fetch Live Prices (Free CoinGecko API)
    const fetchPrices = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
            const data = await response.json();

            if (data) {
                setAssets(prev => prev.map(asset => {
                    const marketData = data[asset.id];
                    if (marketData) {
                        return {
                            ...asset,
                            price: marketData.usd,
                            change: marketData.usd_24h_change
                        };
                    }
                    return asset;
                }));
            }
        } catch (err) {
            console.error("Failed to fetch prices", err);
        } finally {
            setTimeout(() => setLoading(false), 800);
        }
    };

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const totalBalance = assets.reduce((sum, asset) => sum + (asset.price * asset.balance), 0);
    const weightedChange = assets.reduce((sum, asset) => {
        const value = asset.price * asset.balance;
        return sum + (value * (asset.change / 100));
    }, 0);
    const percentChange = totalBalance > 0 ? (weightedChange / (totalBalance - weightedChange)) * 100 : 0;

    // Simple SVG Line Chart Generator
    const generateChartPath = (history, width, height) => {
        const min = Math.min(...history);
        const max = Math.max(...history);
        const range = max - min || 1;

        const stepX = width / (history.length - 1);

        const points = history.map((val, i) => {
            const x = i * stepX;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(' L ');

        return `M ${points}`;
    };

    return (
        <div className="bg-black text-white h-[100dvh] flex flex-col font-sans overflow-hidden">
            {/* Header / Portfolio Value */}
            <div className="p-6 pt-8 bg-gradient-to-b from-[#1a1a1a] to-black rounded-b-3xl shadow-lg relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={onLock} className="p-2 bg-[#262626] rounded-full hover:bg-gray-700 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex gap-3">
                        <div className="p-2 bg-[#262626] rounded-full"><Settings size={20} /></div>
                        <div className="p-2 bg-[#262626] rounded-full"><Activity size={20} /></div>
                    </div>
                </div>

                <div className="flex flex-col items-center mb-4">
                    <span className="text-gray-400 text-sm font-medium tracking-wider mb-1">TOTAL BALANCE</span>
                    <h1 className="text-4xl font-bold tracking-tight">
                        ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h1>
                    <div className={`flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-bold ${weightedChange >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {weightedChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        <span>{weightedChange >= 0 ? '+' : ''}${Math.abs(weightedChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%)</span>
                    </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex justify-center gap-6 mt-6">
                    <ActionButton icon={<ArrowUpRight />} label="Send" />
                    <ActionButton icon={<ArrowDownRight />} label="Receive" />
                    <ActionButton icon={<RefreshCcw className={loading ? 'animate-spin' : ''} />} label="Swap" onClick={fetchPrices} />
                    <ActionButton icon={<CreditCard />} label="Buy" />
                </div>
            </div>

            {/* Asset List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex justify-between items-center px-2 mb-2">
                    <h3 className="text-lg font-bold">Assets</h3>
                    <span className="text-sm text-[#0095F6] font-semibold cursor-pointer">See All</span>
                </div>

                {assets.map(asset => (
                    <div key={asset.id} className="bg-[#121212] p-4 rounded-2xl flex items-center justify-between active:bg-[#1a1a1a] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white border border-gray-700">
                                {asset.symbol[0]}
                            </div>
                            <div>
                                <h4 className="font-bold text-base">{asset.name}</h4>
                                <span className="text-xs text-gray-500">{asset.balance} {asset.symbol}</span>
                            </div>
                        </div>

                        {/* Mini Chart */}
                        <div className="w-16 h-8">
                            <svg width="64" height="32" viewBox="0 0 100 50" preserveAspectRatio="none">
                                <path
                                    d={generateChartPath(asset.history, 100, 50)}
                                    fill="none"
                                    stroke={asset.change >= 0 ? '#4ade80' : '#ef4444'}
                                    strokeWidth="3"
                                    vectorEffect="non-scaling-stroke"
                                />
                            </svg>
                        </div>

                        <div className="text-right">
                            <h4 className="font-bold text-base">${asset.price.toLocaleString()}</h4>
                            <div className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Nav (Visual Only) */}
            <div className="h-20 bg-black border-t border-[#262626] flex items-center justify-around text-gray-500 pb-4">
                <NavIcon icon={<Wallet />} label="Wallet" active />
                <NavIcon icon={<Activity />} label="Market" />
                <NavIcon icon={<RefreshCcw />} label="Trade" />
                <NavIcon icon={<Settings />} label="Settings" />
            </div>
        </div>
    );
};

const ActionButton = ({ icon, label, onClick }) => (
    <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={onClick}>
        <div className="w-12 h-12 rounded-full bg-[#262626] flex items-center justify-center text-white group-active:scale-95 transition-transform border border-transparent group-hover:border-gray-600">
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <span className="text-xs text-gray-400 font-medium">{label}</span>
    </div>
);

const NavIcon = ({ icon, label, active }) => (
    <div className={`flex flex-col items-center gap-1 cursor-pointer ${active ? 'text-white' : 'text-gray-600'}`}>
        {React.cloneElement(icon, { size: 24 })}
        <span className="text-[10px] font-medium">{label}</span>
    </div>
);

export default DummyDashboard;
