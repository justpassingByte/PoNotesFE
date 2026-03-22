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

            {/* 1. Welcome & Primary Action (Compact) */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-card/60 to-card/30 border border-white/5 p-6 sm:p-8 shadow-xl mb-4">
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
                                Radial scan complete. High-priority targets identified for exploitation.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4">
                        <button 
                            onClick={() => setIsAITuningOpen(true)}
                            className="group flex-1 sm:flex-none flex items-center justify-center gap-4 px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 hover:border-gold/30 transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                        >
                            <div className="bg-gold/20 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                                <Brain className="w-5 h-5 text-gold" />
                            </div>
                            <span className="text-sm uppercase tracking-wider">AI NEURAL TUNING</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
                        </button>

                        <Link 
                            href="/analyzer"
                            className="group flex-1 sm:flex-none flex items-center justify-center gap-4 px-8 py-4 bg-gold text-black font-black rounded-2xl hover:bg-yellow-400 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                        >
                            <div className="bg-black/10 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                                <Zap className="w-5 h-5 fill-current" />
                            </div>
                            <span className="text-sm uppercase tracking-wider">NEW HAND SCAN</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>



            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                {/* Top WHALE Targets */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-gold animate-pulse" />
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">High Value: TOP WHALES</h2>
                        </div>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-gold/30 to-transparent ml-4"></div>
                    </div>
                    
                    <div className="space-y-6">
                        {topWhales.length > 0 ? (
                            topWhales.map(player => (
                                <PlayerCard key={player.id} player={player} />
                            ))
                        ) : (
                            <div className="py-12 text-center bg-card/20 border border-dashed border-white/5 rounded-[2rem] opacity-50">
                                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">No Whale Targets Detected</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top REG Targets */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-400" />
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Opponents: TOP REGS</h2>
                        </div>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-400/30 to-transparent ml-4"></div>
                    </div>

                    <div className="space-y-6">
                        {topRegs.length > 0 ? (
                            topRegs.map(player => (
                                <PlayerCard key={player.id} player={player} isStrong />
                            ))
                        ) : (
                            <div className="py-12 text-center bg-card/20 border border-dashed border-white/5 rounded-[2rem] opacity-50">
                                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">No Regular Targets Detected</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}

function PlayerCard({ player, isStrong = false }: { player: Player, isStrong?: boolean }) {
    console.log("Debug PlayerCard DashboardHome:", { id: player.id, name: player.name, ai_profile: player.ai_profile });
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
                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-1.5 mb-1 text-[8px] font-black text-gold/60 uppercase tracking-widest">
                        <Zap className="w-2.5 h-2.5" />
                        Live Range Adjustments
                    </div>
                    {player.ai_profile.range_adjustments.slice(0, 3).map((adj: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-xl px-3 py-2">
                            <Brain className="w-3 h-3 text-gold/60 flex-shrink-0" />
                            <span className="text-[11px] text-gray-100 font-bold leading-tight">{adj}</span>
                        </div>
                    ))}
                </div>
            ) : player.ai_exploit_strategy ? (
                <div className={`mt-4 p-3 bg-black/40 rounded-xl border-l-2 ${isStrong ? 'border-red-500/50' : 'border-gold/50 shadow-[0_0_15px_rgba(250,204,21,0.05)]'}`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <Brain className="w-2.5 h-2.5 text-gold" />
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Exploit Strategy</span>
                    </div>
                    <p className="text-[11px] text-gray-300 italic font-medium leading-tight">
                        "{player.ai_exploit_strategy}"
                    </p>
                </div>
            ) : (
                <div className="mt-4 p-4 text-center border border-dashed border-white/5 rounded-xl">
                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em]">Neural profile pending scan...</span>
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
