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
    ai_profile?: any;
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
        <div className="space-y-8 pb-20">
            {/* Modal for AI Tuning */}
            <Modal 
                isOpen={isAITuningOpen} 
                onClose={() => setIsAITuningOpen(false)}
                title="AI Neural Tuning Engine"
                size="xl"
            >
                <AITuningModal onClose={() => setIsAITuningOpen(false)} />
            </Modal>

            {/* 1. Quick Operations (Moved to Top) */}
            <div className="pt-2">
                <div className="flex items-center justify-between px-2 mb-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Neural & Quick Operations</h2>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <ActionButton 
                        icon={<Users className="w-5 h-5" />} 
                        title="Players" 
                        desc="Browse all targets" 
                        href="/players" 
                    />
                    <ActionButton 
                        icon={<History className="w-5 h-5" />} 
                        title="History" 
                        desc="Review past sessions" 
                        href="/history" 
                    />
                    <ActionButton 
                        icon={<Brain className="w-5 h-5" />} 
                        title="AI Tuning" 
                        desc="Adjust logic prompts" 
                        onClick={() => setIsAITuningOpen(true)}
                    />
                    <ActionButton 
                        icon={<Plus className="w-5 h-5" />} 
                        title="New Note" 
                        desc="Manual player intel" 
                        href="/players" 
                    />
                </div>
            </div>

            {/* 2. Welcome & Primary Action (Shrunken, Search Removed) */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-card/60 to-card/30 border border-white/5 p-6 sm:p-8 shadow-xl">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/5 blur-[80px] rounded-full"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-gold/10 text-gold text-[9px] font-bold uppercase tracking-[0.2em]">
                                <Sparkles className="w-2.5 h-2.5" />
                                System Online
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Hero <span className="text-gold">{displayName}</span>
                            </h1>
                            <p className="text-gray-400 max-w-md leading-relaxed text-xs sm:text-sm">
                                Ready for analysis. Upload hands to sharpen your edge and exploit opponent patterns.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                        <Link 
                            href="/analyzer"
                            className="group flex items-center justify-center gap-4 px-8 py-4 bg-gold text-black font-black rounded-2xl hover:bg-yellow-400 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                        >
                            <div className="bg-black/10 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                                <Zap className="w-5 h-5 fill-current" />
                            </div>
                            <span className="text-sm uppercase tracking-wider">NEW HAND SCAN</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        {stats.aiUsage && (
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all ${stats.aiUsage.remaining === 0 ? 'bg-red-500' : 'bg-gold'}`}
                                        style={{ width: `${(stats.aiUsage.remaining / stats.aiUsage.limit) * 100}%` }}
                                    ></div>
                                </div>
                                <span className={`text-[10px] font-bold tracking-wider ${
                                    stats.aiUsage.remaining === 0 ? 'text-red-500' : 'text-gray-500'
                                }`}>
                                    {stats.aiUsage.remaining} / {stats.aiUsage.limit}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Key Stats Grid */}
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

            <div className="space-y-10">
                {/* 4. Top Whales (Weak Targets) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2 text-gold">
                        <h2 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                            <Target className="w-5 h-5" />
                            Target Priority: High
                        </h2>
                        <Link href="/players" className="text-[10px] text-gray-500 hover:text-gold uppercase tracking-widest font-bold font-mono transition-colors italic">Analyze More &gt;</Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {topWhales.length > 0 ? (
                            topWhales.map(player => (
                                <PlayerCard key={player.id} player={player} />
                            ))
                        ) : (
                            <div className="py-12 text-center bg-card/20 border border-dashed border-white/5 rounded-2xl">
                                <p className="text-sm text-gray-500 font-medium font-mono uppercase tracking-widest opacity-50">Radial search yield: 0 targets</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 5. Top Regulars (Strong Targets) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2 text-rose-500">
                        <h2 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                            <ShieldAlert className="w-5 h-5" />
                            Strategic Threats
                        </h2>
                        <Link href="/players" className="text-[10px] text-gray-500 hover:text-rose-400 uppercase tracking-widest font-bold font-mono transition-colors italic">Deep Scan &gt;</Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {topRegs.length > 0 ? (
                            topRegs.map(player => (
                                <PlayerCard key={player.id} player={player} isStrong />
                            ))
                        ) : (
                            <div className="py-12 text-center bg-card/20 border border-dashed border-white/5 rounded-2xl">
                                <p className="text-sm text-gray-500 font-medium font-mono uppercase tracking-widest opacity-50">No high-risk entities detected</p>
                            </div>
                        )}
                    </div>
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
                <div className="text-right flex flex-col items-end">
                    <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">AGGRESSION</span>
                    <div className={`text-xl font-black font-mono tracking-tighter ${isStrong ? 'text-red-400' : 'text-white'}`}>
                        {player.ai_aggression_score ?? player.aggression_score}%
                    </div>
                </div>
            </div>

            {player.ai_profile?.range_adjustments && player.ai_profile.range_adjustments.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                    {player.ai_profile.range_adjustments.slice(0, 2).map((adj: string, i: number) => (
                        <div key={i} className="px-2.5 py-1 bg-gold/10 border border-gold/20 rounded-lg text-[10px] text-gold font-black uppercase tracking-tighter">
                            {adj}
                        </div>
                    ))}
                </div>
            ) : player.ai_exploit_strategy ? (
                <div className={`mt-4 p-2 bg-black/40 rounded-lg border-l-2 ${isStrong ? 'border-red-500/50' : 'border-gold/50 shadow-[0_0_15px_rgba(250,204,21,0.05)]'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                        <Brain className="w-2.5 h-2.5 text-gold" />
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Exploit Strategy</span>
                    </div>
                    <p className="text-[10px] text-gray-300 italic font-medium line-clamp-2 leading-tight">
                        "{player.ai_exploit_strategy}"
                    </p>
                </div>
            ) : null}

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
