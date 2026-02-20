import React, { useState, useEffect } from 'react';
import { ArrowLeft, Cpu, HardDrive, Wifi, Activity, Smartphone, CheckCircle2 } from 'lucide-react';

const SystemMonitor = ({ onLock }) => {
    const [cpuUse, setCpuUse] = useState(12);
    const [ramUse, setRamUse] = useState(45);
    const [networkPing, setNetworkPing] = useState(24);

    // Simulate fluctuating stats
    useEffect(() => {
        const interval = setInterval(() => {
            setCpuUse(prev => Math.max(5, Math.min(95, prev + (Math.floor(Math.random() * 10) - 4))));
            setRamUse(prev => Math.max(30, Math.min(85, prev + (Math.floor(Math.random() * 4) - 2))));
            setNetworkPing(Math.floor(Math.random() * 15) + 15);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-[100dvh] w-full flex flex-col font-sans"
            style={{ background: '#f2f2f7' }}
        >
            {/* Header */}
            <header className="px-4 py-3 flex items-center gap-3 bg-white border-b border-gray-200">
                <button onClick={onLock} className="text-blue-500 active:opacity-50">
                    <ArrowLeft size={26} strokeWidth={2} />
                </button>
                <h1 className="text-xl font-bold text-black tracking-tight">System Status</h1>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-6 pb-12 space-y-6">

                {/* Device Info Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                        <Smartphone size={32} className="text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">iPhone 14 Pro</h2>
                        <p className="text-sm text-gray-500">iOS 16.5 • 256GB</p>
                        <div className="flex items-center gap-1 mt-1">
                            <CheckCircle2 size={14} className="text-green-500" />
                            <span className="text-xs text-green-600 font-medium">System optimized</span>
                        </div>
                    </div>
                </div>

                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 pl-2">Live Telemetry</h3>

                {/* Grid Stats */}
                <div className="grid grid-cols-2 gap-4">
                    {/* CPU */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
                            <Cpu size={20} className="text-indigo-500" />
                        </div>
                        <span className="text-3xl font-bold text-gray-900">{cpuUse}%</span>
                        <span className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">CPU Load</span>
                    </div>

                    {/* RAM */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-3">
                            <Activity size={20} className="text-purple-500" />
                        </div>
                        <span className="text-3xl font-bold text-gray-900">{ramUse}%</span>
                        <span className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Memory</span>
                    </div>

                    {/* Storage */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                            <HardDrive size={20} className="text-orange-500" />
                        </div>
                        <span className="text-3xl font-bold text-gray-900">142<span className="text-lg text-gray-500">GB</span></span>
                        <span className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Available</span>
                    </div>

                    {/* Network */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mb-3">
                            <Wifi size={20} className="text-teal-500" />
                        </div>
                        <span className="text-3xl font-bold text-gray-900">{networkPing}<span className="text-lg text-gray-500">ms</span></span>
                        <span className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Latency</span>
                    </div>
                </div>

                {/* Diagnostics List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Thermal State</span>
                        <span className="text-sm text-green-500 font-medium">Nominal</span>
                    </div>
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Battery Health</span>
                        <span className="text-sm text-gray-600 font-medium">96%</span>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Uptime</span>
                        <span className="text-sm text-gray-600 font-medium">14 days, 2 hrs</span>
                    </div>
                </div>

                <div className="text-center pt-4">
                    <button className="px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold active:scale-95 transition-transform">
                        Run Diagnostics
                    </button>
                    <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest">Local Device Check Tool</p>
                </div>
            </div>
        </div>
    );
};

export default SystemMonitor;
