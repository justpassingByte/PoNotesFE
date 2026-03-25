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
import { HighlightKeywords } from '@/components/ui/HighlightKeywords';

interface Player {
    id: string;
    name: string;
    playstyle: string;
    aggression_score: number;
    notesCount: number;
    platform: { name: string };
    ai_playstyle?: string;
    ai_aggression_score?: number;
    ai_exploit_strategy?: any;
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

const MOCK_WHALES: Player[] = [
    {
        id: 'mock-w1',
        name: 'SmoothCall_Mike',
        playstyle: 'CALLING STATION',
        aggression_score: 38,
        notesCount: 12,
        platform: { name: 'GGPoker' },
        ai_playstyle: 'CALLING STATION',
        ai_aggression_score: 38,
        ai_profile: {
            archetype: 'CALLING STATION',
            range_adjustments: [
                'Value bet top pair+ for 3 streets — they call with any pair',
                'Remove bluffs from river range — station pays off everything',
            ],
        },
    },
    {
        id: 'mock-w2',
        name: 'LimpKing42',
        playstyle: 'FISH',
        aggression_score: 22,
        notesCount: 5,
        platform: { name: 'PokerStars' },
        ai_playstyle: 'FISH',
        ai_aggression_score: 22,
        ai_profile: {
            archetype: 'FISH',
            range_adjustments: [
                'Isolate preflop to 4x — punish passive limps',
                'Value bet large on all streets — no fold equity needed',
            ],
        },
    },
];

const MOCK_REGS: Player[] = [
    {
        id: 'mock-r1',
        name: 'xFishKiller99',
        playstyle: 'LAG',
        aggression_score: 72,
        notesCount: 34,
        platform: { name: 'PokerStars' },
        ai_playstyle: 'LAG',
        ai_aggression_score: 72,
        ai_profile: {
            archetype: 'LAG',
            range_adjustments: [
                'CO vs BU 3bet: Fold AJo, KQo — Call AQo, TT-QQ — 4bet AK, KK+',
                'Cbet flop 85% → check-raise dry boards more vs this player',
            ],
        },
    },
    {
        id: 'mock-r2',
        name: 'GTO_Crusher',
        playstyle: 'TAG',
        aggression_score: 55,
        notesCount: 21,
        platform: { name: '888poker' },
        ai_playstyle: 'TAG',
        ai_aggression_score: 55,
        ai_profile: {
            archetype: 'TAG',
            range_adjustments: [
                'Avoid 3bet bluffing OOP — they call too wide in position',
                'Check-raise flop more on Axx boards — they overfold cbet',
            ],
        },
    },
];

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

            {/* 1. Welcome & Primary Action */}
            <div className="relative overflow-hidden rounded-xl bg-[#111318] shadow-2xl border border-gray-800 p-6 sm:p-7 mb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-widest border border-emerald-500/20">
                                <Sparkles className="w-2.5 h-2.5" />
                                Online
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Hero <span className="text-amber-400">{displayName}</span>
                            </h1>
                            <p className="text-gray-400 max-w-md leading-relaxed text-xs sm:text-sm">
                                Scan complete. High-priority targets identified.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <button 
                            onClick={() => setIsAITuningOpen(true)}
                            className="group flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-[#1a1d24] border border-gray-700 text-white font-bold rounded-xl hover:border-gray-500 transition-colors"
                        >
                            <Brain className="w-4 h-4 text-gray-400" />
                            <span className="text-sm uppercase tracking-wider">AI TUNING</span>
                        </button>

                        <Link 
                            href="/analyzer"
                            className="group flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors"
                        >
                            <Zap className="w-4 h-4 fill-current" />
                            <span className="text-sm uppercase tracking-wider">NEW HAND SCAN</span>
                        </Link>
                    </div>
                </div>
            </div>



            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
                {/* Col 1: Top WHALE Targets */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <h2 className="text-[10px] font-bold text-white uppercase tracking-wider">Top Whales</h2>
                        <div className="h-[1px] flex-1 bg-gray-800"></div>
                    </div>
                    <div className="space-y-2.5">
                        {(topWhales.length > 0 ? topWhales : MOCK_WHALES).map(player => (
                            <PlayerCard key={player.id} player={player} />
                        ))}
                    </div>
                </div>

                {/* Col 2: Top REG Targets */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <Target className="w-3.5 h-3.5 text-blue-400" />
                        <h2 className="text-[10px] font-bold text-white uppercase tracking-wider">Top Regs</h2>
                        <div className="h-[1px] flex-1 bg-gray-800"></div>
                    </div>
                    <div className="space-y-2.5">
                        {(topRegs.length > 0 ? topRegs : MOCK_REGS).map(player => (
                            <PlayerCard key={player.id} player={player} isStrong />
                        ))}
                    </div>
                </div>

                {/* Col 3: Quick Actions */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <h2 className="text-[10px] font-bold text-white uppercase tracking-wider">Quick Actions</h2>
                        <div className="h-[1px] flex-1 bg-gray-800"></div>
                    </div>
                    <div className="space-y-2">
                        <Link href="/players" className="flex items-center gap-3 p-3 bg-[#111318] border border-gray-700 rounded-xl hover:border-gray-500 transition-colors group">
                            <div className="w-8 h-8 rounded-lg bg-[#1a1d24] flex items-center justify-center border border-gray-700">
                                <Users className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white">All Players</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{stats.totalCount} tracked</p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>

                        <Link href="/analyzer" className="flex items-center gap-3 p-3 bg-[#111318] border border-gray-700 rounded-xl hover:border-gray-500 transition-colors group">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Zap className="w-4 h-4 text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white">Hand Scanner</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Upload & analyze</p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>

                    {/* Playstyle Breakdown */}
                    <div className="pt-1">
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2 block px-1">Player Breakdown</span>
                        <div className="space-y-1.5">
                            {(() => {
                                const counts = Object.keys(stats.playstyleCounts).length > 0
                                    ? stats.playstyleCounts
                                    : { LAG: 4, TAG: 3, FISH: 6, WHALE: 2, NIT: 1, MANIAC: 1 };
                                const maxCount = Math.max(...Object.values(counts));
                                const barColorMap: Record<string, string> = {
                                    LAG: '#ef4444', TAG: '#3b82f6', NIT: '#22c55e',
                                    FISH: '#eab308', WHALE: '#fbbf24', MANIAC: '#a855f7',
                                    'CALLING STATION': '#f97316', UNKNOWN: '#6b7280',
                                };
                                return Object.entries(counts)
                                    .sort(([,a], [,b]) => b - a)
                                    .map(([style, count]) => (
                                        <div key={style} className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide w-[70px] text-right shrink-0">{style}</span>
                                            <div className="flex-1 h-5 bg-gray-800/50 rounded overflow-hidden">
                                                <div 
                                                    className="h-full rounded"
                                                    style={{ 
                                                        width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%`,
                                                        backgroundColor: barColorMap[style.toUpperCase()] || '#6b7280'
                                                    }}
                                                />
                                            </div>
                                            <span className="text-[11px] font-mono font-bold text-gray-300 w-5 text-right">{count}</span>
                                        </div>
                                    ));
                            })()}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

function PlayerCard({ player, isStrong = false }: { player: Player, isStrong?: boolean }) {
    const getTagStyle = (style: string) => {
        switch (style?.toUpperCase()) {
            case 'LAG': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'TAG': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'NIT': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'FISH': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'WHALE': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'MANIAC': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'CALLING STATION': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };
    const displayTag = player.ai_playstyle || player.playstyle;
    const aggScore = player.ai_aggression_score ?? player.aggression_score;
    const getAggressionColor = (score: number) => {
        if (score > 60) return 'text-red-400';
        if (score > 30) return 'text-yellow-400';
        return 'text-green-400';
    };

    return (
        <Link 
            href={`/players/${player.id}`} 
            className="block bg-[#111318] border border-gray-800 rounded-xl p-3 hover:border-gray-600 transition-all group"
        >
            {/* ROW 1: Name + Tag */}
            <div className="flex justify-between items-start mb-2">
                <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-base text-white tracking-tight truncate">{player.name}</h4>
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{player.platform?.name || 'Unknown'}</span>
                </div>
                <span className={`px-2 py-0.5 text-xs font-bold rounded border ${getTagStyle(displayTag)} uppercase tracking-wide whitespace-nowrap flex-shrink-0 ml-2`}>
                    {displayTag}
                </span>
            </div>

            {/* ROW 2: Range Adjustments (max 2) - Higher Density */}
            {player.ai_profile?.range_adjustments && player.ai_profile.range_adjustments.length > 0 && (
                <div className="mb-3">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block px-1">Range Adjustments</span>
                    <div className="space-y-1">
                        {player.ai_profile.range_adjustments.slice(0, 2).map((adj: string, i: number) => (
                            <div key={i} className="flex items-start gap-2.5 border-l-2 border-gray-700 py-1.5 pl-4">
                                <span className="text-sm text-gray-300 font-medium leading-tight">
                                    <HighlightKeywords text={adj} />
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FOOTER: Metrics */}
            <div className="border-t border-gray-700/60 pt-2 mt-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-base font-mono font-bold ${getAggressionColor(aggScore)}`}>
                                {aggScore}%
                            </span>
                            <span className="text-xs text-gray-600 font-black uppercase tracking-wider">AGG</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <FileText className="w-5 h-5 text-gray-600" />
                            <span className="text-base font-mono font-bold text-gray-400">{player.notesCount}</span>
                        </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </Link>
    );
}

function StatCard({ title, value, icon, color, href }: { title: string, value: number, icon: React.ReactNode, color: string, href: string }) {
    const colors: Record<string, string> = {
        gold: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        red: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    };

    return (
        <Link 
            href={href}
            className="p-5 bg-[#111318] border border-gray-800 rounded-xl group hover:border-gray-600 transition-all"
        >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 border ${colors[color]}`}>
                {icon}
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{title}</div>
        </Link>
    );
}

function ActionButton({ icon, title, desc, href, onClick, disabled = false }: { icon: React.ReactNode, title: string, desc: string, href?: string, onClick?: () => void, disabled?: boolean }) {
    const content = (
        <>
            <div className="w-9 h-9 rounded-lg bg-[#1a1d24] flex items-center justify-center text-gray-400 border border-gray-800">
                {icon}
            </div>
            <div className="text-left">
                <div className="text-sm font-bold text-white">{title}</div>
                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">{desc}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </>
    );

    if (onClick) {
        return (
            <button 
                onClick={onClick}
                disabled={disabled}
                className={`flex items-center gap-3 p-4 rounded-xl border border-gray-800 bg-[#111318] hover:border-gray-600 transition-all group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {content}
            </button>
        );
    }

    return (
        <Link 
            href={disabled ? '#' : (href || '#')}
            className={`flex items-center gap-3 p-4 rounded-xl border border-gray-800 bg-[#111318] hover:border-gray-600 transition-all group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {content}
        </Link>
    );
}
