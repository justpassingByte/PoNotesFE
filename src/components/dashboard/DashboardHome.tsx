'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
    Users, 
    FileText, 
    Zap, 
    Plus, 
    ArrowRight, 
    TrendingDown, 
    Activity, 
    History,
    Search,
    Brain,
    Target,
    ShieldAlert,
    Sparkles
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AITuningModal } from './AITuningModal';

interface Player {
    id: string;
    name: string;
    playstyle: string;
    aggression_score: number;
    notesCount: number;
    platform: { name: string };
    ai_playstyle?: string;
    ai_aggression_score?: number;
    ai_exploit_strategy?: string;
}

interface DashboardHomeProps {
    user?: { email: string; premium_tier: string } | null;
    stats: {
        totalCount: number;
        totalNotesCount: number;
        playstyleCounts: Record<string, number>;
        aiUsage?: { remaining: number; limit: number; resetsAt: string };
        ocrUsage?: { remaining: number; limit: number; resetsAt: string };
    };
    topWhales: Player[];
    topRegs: Player[];
}

export function DashboardHome({ user, stats, topWhales, topRegs }: DashboardHomeProps) {
    const [isAITuningOpen, setIsAITuningOpen] = useState(false);
    const displayName = user?.email ? user.email.split('@')[0].toUpperCase() : 'HERO';

    return (
        <div className="space-y-10 pb-20">
            {/* Modal for AI Tuning */}
            <Modal 
                isOpen={isAITuningOpen} 
                onClose={() => setIsAITuningOpen(false)}
                title="AI Neural Tuning"
            >
                <AITuningModal onClose={() => setIsAITuningOpen(false)} />
            </Modal>

            {/* 1. Welcome & Primary Action */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-card/80 to-card/40 border border-white/10 p-8 sm:p-12 shadow-2xl">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/10 blur-[100px] rounded-full"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-6 flex-1">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest">
                                <Sparkles className="w-3 h-3" />
                                AI Analyst Online
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                                Welcome Back, <span className="text-gold">{displayName}</span>.
                            </h1>
                            <p className="text-gray-400 max-w-lg leading-relaxed text-sm sm:text-base">
                                Your AI is ready to analyze new sessions. Every hand you upload improves your opponent profiles and reveals hidden leaks.
                            </p>
                        </div>

                        {/* Quick Search Input */}
                        <div className="relative max-w-md group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-500 group-focus-within:text-gold transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search Opponent Nickname..."
                                className="block w-full pl-11 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all shadow-inner"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = (e.target as HTMLInputElement).value;
                                        if (val) window.location.href = `/players?search=${encodeURIComponent(val)}`;
                                    }
                                }}
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <span className="text-[10px] font-mono text-gray-600 bg-white/5 px-2 py-1 rounded border border-white/5 uppercase">Press Enter</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                        <Link 
                            href="/analyzer"
                            className="group flex flex-col sm:flex-row items-center justify-center gap-4 px-10 py-6 bg-gold text-black font-black rounded-3xl hover:bg-yellow-400 transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(250,204,21,0.3)] shadow-xl"
                        >
                            <div className="bg-black/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 fill-current" />
                            </div>
                            <div className="text-center sm:text-left">
                                <span className="block text-xs uppercase tracking-widest opacity-70">Deep Scan</span>
                                <span className="block text-lg">NEW HAND</span>
                            </div>
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform hidden sm:block" />
                        </Link>
                        {stats.aiUsage && (
                            <span className={`text-[10px] font-bold tracking-wider ${
                                stats.aiUsage.remaining === 0 ? 'text-red-500' : 'text-gray-500'
                            }`}>
                                {stats.aiUsage.remaining === 0
                                    ? `AI limit reached · Resets ${new Date(stats.aiUsage.resetsAt).toLocaleDateString()}`
                                    : `${stats.aiUsage.remaining} AI turn${stats.aiUsage.remaining !== 1 ? 's' : ''} left`
                                }
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Key Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <StatCard 
                    title="Total Targets" 
                    value={stats.totalCount} 
                    icon={<Users className="w-5 h-5" />} 
                    color="blue"
                    href="/players"
                />
                <StatCard 
                    title="Total Notes" 
                    value={stats.totalNotesCount} 
                    icon={<FileText className="w-5 h-5" />} 
                    color="gold"
                    href="/players"
                />
                <StatCard 
                    title="Hands Analyzed" 
                    value={stats.totalNotesCount > 0 ? Math.floor(stats.totalNotesCount / 3) : 0} 
                    icon={<Activity className="w-5 h-5" />} 
                    color="green"
                    href="/history"
                />
                <StatCard 
                    title="Active Sessions" 
                    value={1} 
                    icon={<TrendingDown className="w-5 h-5" />} 
                    color="red"
                    href="/dashboard"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 3. Top Whales (Weak Targets) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <Target className="w-5 h-5 text-gold" />
                            Top Whales (Weak Targets)
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {topWhales.length > 0 ? (
                            topWhales.map(player => (
                                <PlayerCard key={player.id} player={player} />
                            ))
                        ) : (
                            <div className="py-12 text-center bg-card/40 border border-dashed border-white/10 rounded-2xl">
                                <p className="text-sm text-gray-500">No weak targets identified yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Top Regulars (Strong Targets) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                            Top Regulars (Caution)
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {topRegs.length > 0 ? (
                            topRegs.map(player => (
                                <PlayerCard key={player.id} player={player} isStrong />
                            ))
                        ) : (
                            <div className="py-12 text-center bg-card/40 border border-dashed border-white/10 rounded-2xl">
                                <p className="text-sm text-gray-500">No strong regs detected yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 5. Quick Actions */}
            <div className="pt-6">
                <h2 className="text-xl font-bold text-white px-2 mb-4">Neural & Quick Operations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ActionButton 
                        icon={<Search className="w-5 h-5" />} 
                        title="Find Opponent" 
                        desc="Lookup specific nicknames" 
                        href="/players" 
                    />
                    <ActionButton 
                        icon={<History className="w-5 h-5" />} 
                        title="Analysis History" 
                        desc="Review past mistakes" 
                        href="/history" 
                    />
                    <ActionButton 
                        icon={<Brain className="w-5 h-5" />} 
                        title="AI Tuning" 
                        desc="Adjust analysis prompts" 
                        onClick={() => setIsAITuningOpen(true)}
                    />
                    <ActionButton 
                        icon={<Plus className="w-5 h-5" />} 
                        title="Manual Note" 
                        desc="Add detail for player" 
                        href="/players" 
                    />
                </div>
            </div>
        </div>
    );
}

function PlayerCard({ player, isStrong = false }: { player: Player, isStrong?: boolean }) {
    return (
        <Link 
            href={`/players/${player.id}`} 
            className={`p-5 bg-card/60 border border-white/5 rounded-2xl hover:border-gold/30 transition-all group flex flex-col justify-between ${isStrong ? 'hover:border-red-500/30' : 'hover:bg-gold/5'}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-white mb-1 group-hover:text-gold transition-colors">{player.name}</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded border ${
                            player.playstyle === 'FISH' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                            player.playstyle === 'WHALE' ? 'text-gold bg-gold/10 border-gold/30 animate-pulse font-extrabold' :
                            player.playstyle === 'MANIAC' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                            player.playstyle === 'LAG' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                            player.playstyle === 'TAG' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                            'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        }`}>
                            {player.playstyle}
                        </span>
                        {player.ai_playstyle && (
                            <span className="text-[10px] uppercase font-black tracking-widest text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/30 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-gold animate-pulse"></span>
                                AI: {player.ai_playstyle}
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Aggression</div>
                    <div className={`text-xl font-black ${isStrong ? 'text-red-400' : 'text-white'}`}>
                        {player.ai_aggression_score ?? player.aggression_score}%
                    </div>
                </div>
            </div>

            {player.ai_exploit_strategy && (
                <div className={`mt-4 p-2 bg-black/20 rounded-lg border-l-2 ${isStrong ? 'border-red-500/50' : 'border-gold/50'}`}>
                    <p className="text-[10px] text-gray-400 italic font-medium line-clamp-1">
                        "{player.ai_exploit_strategy}"
                    </p>
                </div>
            )}

            <div className="mt-4 flex items-center justify-between text-[10px] text-gray-500 font-bold">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3" />
                        {player.notesCount}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <History className="w-3 h-3" />
                        {player.platform?.name || 'Unknown'}
                    </div>
                </div>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-gold" />
            </div>
        </Link>
    );
}

function StatCard({ title, value, icon, color, href }: { title: string, value: number, icon: React.ReactNode, color: string, href: string }) {
    const colors: Record<string, string> = {
        gold: "text-gold bg-gold/10 border-gold/20",
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        red: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    };

    return (
        <Link 
            href={href}
            className="p-6 bg-card/40 border border-white/5 rounded-3xl group hover:border-white/20 hover:bg-white/[0.02] transition-all"
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${colors[color]}`}>
                {icon}
            </div>
            <div className="text-3xl font-black text-white mb-1">{value}</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{title}</div>
        </Link>
    );
}

function ActionButton({ icon, title, desc, href, onClick, disabled = false }: { icon: React.ReactNode, title: string, desc: string, href?: string, onClick?: () => void, disabled?: boolean }) {
    const content = (
        <>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="text-left">
                <div className="text-sm font-bold text-white group-hover:text-gold transition-colors">{title}</div>
                <div className="text-[10px] text-gray-500 font-medium group-hover:text-gray-400 transition-colors uppercase tracking-tight">{desc}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 ml-auto group-hover:text-gold group-hover:translate-x-1 transition-all" />
        </>
    );

    if (onClick) {
        return (
            <button 
                onClick={onClick}
                disabled={disabled}
                className={`flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-card/40 hover:bg-white/5 hover:border-white/10 transition-all group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {content}
            </button>
        );
    }

    return (
        <Link 
            href={disabled ? '#' : (href || '#')}
            className={`flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-card/40 hover:bg-white/5 hover:border-white/10 transition-all group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {content}
        </Link>
    );
}
