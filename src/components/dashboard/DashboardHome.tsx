'use client';

import React from 'react';
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
    Target
} from 'lucide-react';
import { Player } from '@/components/dashboard/PlayerListClient';

interface DashboardHomeProps {
    user?: { email: string; premium_tier: string } | null;
    stats: {
        totalCount: number;
        totalNotesCount: number;
        playstyleCounts: Record<string, number>;
    };
    topFish: Player[];
}

export function DashboardHome({ user, stats, topFish }: DashboardHomeProps) {
    const displayName = user?.email ? user.email.split('@')[0].toUpperCase() : 'HERO';

    return (
        <div className="space-y-10 pb-20">
            {/* 1. Welcome & Primary Action */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-card/80 to-card/40 border border-white/10 p-8 sm:p-12 shadow-2xl">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/10 blur-[100px] rounded-full"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" />
                            AI Analyst Online
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                            Welcome Back, <span className="text-gold">{displayName}</span>.
                        </h1>
                        <p className="text-gray-400 max-w-lg leading-relaxed">
                            Your AI is ready to analyze new sessions. Every hand you upload improves your opponent profiles and reveals hidden leaks.
                        </p>
                    </div>
                    
                    <Link 
                        href="/analyzer"
                        className="group flex items-center justify-center gap-3 px-8 py-5 bg-gold text-black font-bold rounded-2xl hover:bg-yellow-400 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(250,204,21,0.4)]"
                    >
                        <Zap className="w-5 h-5 fill-current" />
                        ANALYZE NEW HAND
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3. Top Fish (Weak Targets) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <Target className="w-5 h-5 text-gold" />
                            Top Weak Targets
                        </h2>
                        <Link href="/players" className="text-xs text-gray-500 hover:text-gold transition-colors">
                            View all players
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {topFish.length > 0 ? (
                            topFish.map(player => (
                                <Link 
                                    href={`/players/${player.id}`} 
                                    key={player.id}
                                    className="p-5 bg-card/60 border border-white/5 rounded-2xl hover:border-gold/30 hover:bg-gold/5 transition-all group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-white mb-1 group-hover:text-gold transition-colors">{player.name}</h4>
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded">
                                                {player.playstyle}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-gray-500 uppercase">Aggression</div>
                                            <div className="text-lg font-black text-white">{player.aggression_score}%</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-4 text-[10px] text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <FileText className="w-3 h-3" />
                                            {player.notesCount} Notes
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <History className="w-3 h-3" />
                                            {player.platform?.name}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-card/40 border border-dashed border-white/10 rounded-2xl">
                                <p className="text-sm text-gray-500">No weak targets identified yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Quick Actions */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white px-2">Quick Actions</h2>
                    <div className="flex flex-col gap-3">
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
                            icon={<Plus className="w-5 h-5" />} 
                            title="Manual Note" 
                            desc="Add detail for player" 
                            href="/players" 
                        />
                        <ActionButton 
                            icon={<Brain className="w-5 h-5" />} 
                            title="AI Tuning" 
                            desc="Adjust analysis prompts" 
                            href="/dashboard"
                            disabled
                        />
                    </div>
                </div>
            </div>
        </div>
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

function ActionButton({ icon, title, desc, href, disabled = false }: { icon: React.ReactNode, title: string, desc: string, href: string, disabled?: boolean }) {
    return (
        <Link 
            href={disabled ? '#' : href}
            className={`flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-card/40 hover:bg-white/5 hover:border-white/10 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gold">
                {icon}
            </div>
            <div>
                <div className="text-sm font-bold text-white">{title}</div>
                <div className="text-[10px] text-gray-500 uppercase font-medium">{desc}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 ml-auto group-hover:text-gold transition-colors" />
        </Link>
    );
}

function Sparkles({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
        </svg>
    );
}
