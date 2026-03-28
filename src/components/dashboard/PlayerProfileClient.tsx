"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Pencil, Trash2, Eye, Plus, X, Check, Search, Filter,
    ChevronDown, Zap, Shield, Target, RefreshCw, AlignLeft, Brain, Users
} from 'lucide-react';

import { Header } from "@/components/layout/Header";
import { useLanguage } from '@/i18n/LanguageContext';
import { API, apiFetch, apiPost, apiDelete } from "@/lib/api";

const STRATEGIES: Record<string, string[]> = {
    "LAG": [
        "Widen your value 3-betting range preflop to punish their wide opens.",
        "Smooth call with strong draws and monsters on the flop to induce bluffs on later streets.",
        "They will over-barrel; use your strong top-pairs as bluff catchers.",
        "Do not try to find bluffs on this player."
    ],
    "NIT": [
        "Steal their blinds relentlessly preflop; they fold too often without a premium holding.",
        "If they 3-bet you, fold unless you look down at QQ+ or AKs.",
        "Float the flop and bet the turn if they check to you.",
        "Never pay off their river raises."
    ],
    "TAG": [
        "Avoid tangling out of position without a solid range advantage.",
        "Attack their c-bets on coordinated boards.",
        "Pay attention to sizing tells—they often bet larger with polarized value.",
        "Do not run multi-street elaborate bluffs."
    ],
    "MANIAC": [
        "Tighten up preflop and play exclusively for value.",
        "Never slowplay your strong hands preflop.",
        "Let them do the betting for you post-flop.",
        "Prepare for high variance."
    ],
    "CALLING STATION": [
        "Never bluff under any circumstances. Value bet thinly across all three streets.",
        "Size your value bets larger on wet boards.",
        "If you miss your draw, give up immediately.",
        "They are playing their cards face up."
    ],
    "FISH": [
        "Isolate them preflop to play pots heads-up in position.",
        "Extract maximum value. Size up dramatically when you hit Gin.",
        "Watch for passive limping—punish it with isolation raises."
    ],
};

import { fetchPlayerProfile } from "@/app/actions";
import { fetchStrategy, HandStrategy, SolveRequest } from "@/lib/solverAPI";
import { Modal } from "@/components/ui/Modal";
import { TemplateManagerModal } from "@/components/forms/TemplateManagerModal";
import { buildCategorizedBreakdown, emptyCategorizedBreakdown, type CategorizedBreakdown } from "@/lib/analysis/HandCategoryResolver";
import { HighlightKeywords } from "@/components/ui/HighlightKeywords";

const getTagStyle = (style: string) => {
    switch (style?.toUpperCase()) {
        case 'LAG': return { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500' };
        case 'TAG': return { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-500' };
        case 'NIT': return { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-500' };
        case 'FISH': return { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-500' };
        case 'WHALE': return { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30', dot: 'bg-amber-500' };
        case 'MANIAC': return { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-500' };
        case 'CALLING STATION': return { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-500' };
        default: return { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30', dot: 'bg-gray-500' };
    }
};


interface Note {
    id: string;
    content: string;
    street: string;
    note_type: string;
    created_at: string;
    is_ai_generated?: boolean;
}

interface PlayerDetails {
    id: string;
    name: string;
    playstyle: string;
    aggression_score: number;
    notes: Note[];
    platform: {
        id: string;
        name: string;
    };
    ai_profile?: {
        archetype: string;
        confidence: number;
        aggression_score: number;
        looseness_score: number;
        leaks: string[];
        strategy: any;
        range_adjustments?: string[];
        gto_deviation_reason?: string;
    } | null;
    ai_exploit_strategy?: any;
    usage?: {
        allowed: boolean;
        used: number;
        limit: number;
        remaining: number;
        resetsAt: string;
    };
}

interface PlayerProfileClientProps {
    initialPlayer: PlayerDetails;
    user?: { email: string; premium_tier: string } | null;
}

export function PlayerProfileClient({
    initialPlayer,
    user: user
}: PlayerProfileClientProps) {
    const router = useRouter();
    const [player, setPlayer] = useState<PlayerDetails>(initialPlayer);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [usage, setUsage] = useState<PlayerDetails['usage']>(initialPlayer.usage);

    // Add Note state
    const [showAddNote, setShowAddNote] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newNoteStreet, setNewNoteStreet] = useState('Preflop');
    const [addingNote, setAddingNote] = useState(false);

    // Edit Note state
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editStreet, setEditStreet] = useState('Preflop');

    // Edit Player state
    const [editingPlayer, setEditingPlayer] = useState(false);
    const [editName, setEditName] = useState(initialPlayer.name);
    const [editPlaystyle, setEditPlaystyle] = useState(initialPlayer.playstyle || 'UNKNOWN');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Solver state
    const [solveData, setSolveData] = useState<Record<string, HandStrategy> | null>(null);
    const [solveActionBreakdown, setSolveActionBreakdown] = useState<CategorizedBreakdown>(emptyCategorizedBreakdown());
    const [isSolving, setIsSolving] = useState(false);
    const [solveError, setSolveError] = useState<string | null>(null);
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    
    const { t } = useLanguage();

    // Refresh player data via Server Action
    const refreshPlayer = async () => {
        const updated = await fetchPlayerProfile(player.id);
        if (updated) {
            setPlayer(updated as any);
            if ((updated as any).usage) setUsage((updated as any).usage);
        }
    };

    // Fetch current usage on mount if not pre-populated by SSR
    useEffect(() => {
        if (usage !== undefined) return;
        apiFetch(`${API.usage}?action=AI_ANALYZE`)
            .then(r => r.json())
            .then(json => { if (json.success && json.data) setUsage(json.data); })
            .catch(() => { });
    }, []);

    // AI Profiling Trigger
    const handleRunAIAnalyst = async () => {
        if (cooldown > 0) return;
        if (usage && !usage.allowed) {
            const resetTime = usage.resetsAt
                ? new Date(usage.resetsAt).toLocaleString()
                : 'next period';
            alert(`You have reached your ${user?.premium_tier || 'FREE'} plan AI limit. Resets at ${resetTime}.`);
            return;
        }

        setIsAnalyzing(true);
        try {
            const res = await apiPost(API.refreshProfile, { playerId: player.id });

            const json = await res.json();

            if (json.usage) setUsage(json.usage);

            if (json.success) {
                await refreshPlayer();
                setCooldown(60);
                const timer = setInterval(() => {
                    setCooldown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                alert(json.error || "Analysis failed");
            }
        } catch (err) {
            console.error("Failed to run AI analysis", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // CREATE Note
    const handleAddNote = async () => {
        if (!newNoteContent.trim()) return;
        setAddingNote(true);
        try {
            const res = await apiPost(API.notes, {
                player_id: player.id,
                street: newNoteStreet,
                note_type: 'Custom',
                content: newNoteContent.trim()
            });
            if (res.ok) {
                setNewNoteContent('');
                setShowAddNote(false);
                await refreshPlayer();
            }
        } catch (err) {
            console.error("Failed to add note", err);
        } finally {
            setAddingNote(false);
        }
    };

    // UPDATE Note
    const handleUpdateNote = async (noteId: string) => {
        if (!editContent.trim()) return;
        try {
            const res = await apiFetch(API.note(noteId), {
                method: 'PUT',
                body: JSON.stringify({
                    content: editContent.trim(),
                    street: editStreet
                })
            });
            if (res.ok) {
                setEditingNoteId(null);
                setEditContent('');
                await refreshPlayer();
            }
        } catch (err) {
            console.error("Failed to update note", err);
        }
    };

    // DELETE Note
    const handleDeleteNote = async (noteId: string) => {
        try {
            const res = await apiDelete(API.note(noteId));
            if (res.ok) await refreshPlayer();
        } catch (err) {
            console.error("Failed to delete note", err);
        }
    };

    // UPDATE Player
    const handleUpdatePlayer = async () => {
        if (!editName.trim()) return;
        try {
            const res = await apiFetch(API.player(player.id), {
                method: 'PUT',
                body: JSON.stringify({ name: editName.trim(), playstyle: editPlaystyle })
            });
            if (res.ok) {
                setEditingPlayer(false);
                await refreshPlayer();
            }
        } catch (err) {
            console.error("Failed to update player", err);
        }
    };

    // DELETE Player
    const handleDeletePlayer = async () => {
        try {
            const res = await apiDelete(API.player(player.id));
            if (res.ok) router.push('/players');
        } catch (err) {
            console.error("Failed to delete player", err);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent">
            <Header user={user} onSettingsClick={() => setSettingsOpen(true)} />

            <div className="flex-1 overflow-y-auto pt-20 sm:pt-32 px-4 sm:px-8 pb-8 relative scrollbar-hide">
                <div className="max-w-7xl mx-auto relative z-10">

                    {/* Back Navigation Bar */}
                    <button
                        onClick={() => router.push('/players')}
                        className="flex items-center text-gray-400 hover:text-white transition-colors group mb-8"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        {t('player.back')}
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* LEFT COLUMN: TACTICAL INTELLIGENCE (WIDE 2/3) */}
                        <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
                            {/* ANALYSIS HEADER */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Brain className="w-6 h-6 text-gray-400" />
                                    <div>
                                        <h2 className="text-base font-bold text-white tracking-wider uppercase">{t('player.tactical_ai')}</h2>
                                        <p className="text-xs text-gray-500 font-mono uppercase font-black tracking-widest">{t('player.exploit_engine')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{t('player.live')}</span>
                                    <button onClick={refreshPlayer} className="p-2 text-gray-500 hover:text-white transition-colors">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* STRATEGY DISPLAY */}
                            <div className="bg-[#111318] border border-gray-800 rounded-xl p-5 relative overflow-hidden">


                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t('player_profile.core_strategy')}</span>
                                    </div>

                                    {isAnalyzing ? (
                                        <div className="py-12 flex flex-col items-center justify-center space-y-3">
                                            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{t('player_profile.analyzing')}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="max-h-[300px] overflow-y-auto scrollbar-hide pr-2 mb-6 space-y-3">
                                                {(() => {
                                                    const rawStrategy = player.ai_profile?.strategy || player.ai_exploit_strategy;
                                                    if (!rawStrategy) {
                                                        return <blockquote className="text-base md:text-lg font-medium text-gray-200 leading-relaxed tracking-tight italic">&quot;{t('player_profile.gathering_data')}&quot;</blockquote>;
                                                    }

                                                    // Normalize to array if it's an object/array
                                                    const strategyArray = Array.isArray(rawStrategy)
                                                        ? rawStrategy
                                                        : (typeof rawStrategy === 'object' && rawStrategy !== null ? [rawStrategy] : null);

                                                    if (strategyArray) {
                                                        return strategyArray.map((move: any, i: number) => (
                                                            <div key={i} className="border-l-2 border-gray-800 pl-4 py-2 mb-4 last:mb-0">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="text-[11px] text-amber-400 font-bold uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">{move.node || 'GENERAL'}</span>
                                                                </div>
                                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                                                                    <div>
                                                                        <p className="text-[9px] text-gray-500 uppercase font-black">{t('player_profile.action')}</p>
                                                                        <p className="text-white text-sm font-bold leading-tight mt-1">{move.action || '-'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 uppercase font-black">{t('player_profile.range')}</p>
                                                                        <p className="text-sm font-bold leading-tight mt-1.5">{move.range || '-'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 uppercase font-black">{t('player_profile.structure')}</p>
                                                                        <p className="text-base font-bold leading-tight mt-1.5">{move.structure || '-'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 uppercase font-black">{t('player_profile.sizing_freq')}</p>
                                                                        <p className="text-base font-bold leading-tight mt-1.5">
                                                                            <HighlightKeywords text={move.sizing || '-'} /> ({move.frequency || '-'})
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ));
                                                    }

                                                    // Fallback for primitive strings
                                                    return (
                                                        <blockquote className="text-base md:text-lg font-medium text-gray-200 leading-relaxed tracking-tight italic">
                                                            &quot;<HighlightKeywords text={String(rawStrategy)} />&quot;
                                                        </blockquote>
                                                    );
                                                })()}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-700/60">
                                                <div className="space-y-2">
                                                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest">{t('player_profile.archetype')}</p>
                                                    {(() => { const tag = getTagStyle(player.ai_profile?.archetype || player.playstyle || ''); return (
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${tag.dot}`}></div>
                                                        <span className={`text-lg font-bold uppercase tracking-tighter ${tag.text}`}>{player.ai_profile?.archetype || player.playstyle || 'Analyzing'}</span>
                                                    </div>
                                                    ); })()}
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t('player_profile.aggression') ?? "Aggression"}</p>
                                                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-amber-500 rounded-full"
                                                            style={{ width: `${player.ai_profile?.aggression_score || player.aggression_score || 50}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{t('player_profile.analysis_mode')}</p>
                                                    <div className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-1.5">
                                                        <Zap className="w-3 h-3" /> {t('player_profile.hybrid_mode')}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* DETAILED STATS GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-black/40 backdrop-blur-sm shadow-xl border border-gray-700 rounded-xl p-5">
                                    <h3 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center justify-between">
                                        {t('player_profile.positional_leaks')}
                                        <Shield className="w-3 h-3 text-gray-500" />
                                    </h3>
                                    <div className="space-y-4">
                                        {(player.ai_profile?.leaks && player.ai_profile.leaks.length > 0) ? (
                                            player.ai_profile.leaks.map((leak, idx) => (
                                                <div key={idx} className="flex items-center gap-3 group">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 group-hover:bg-red-500 transition-colors"></div>
                                                    <span className="text-xs text-gray-300 font-medium">{leak}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-[10px] text-gray-600 italic uppercase">{t('player_profile.no_leaks')}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-black/40 backdrop-blur-sm shadow-xl border border-gray-700 rounded-xl p-5">
                                    <h3 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center justify-between">
                                        {t('player_profile.range_adjustments')}
                                        <Target className="w-3 h-3 text-gray-500" />
                                    </h3>
                                    <div className="space-y-4">
                                        {(player.ai_profile?.range_adjustments && player.ai_profile.range_adjustments.length > 0) ? (
                                            player.ai_profile.range_adjustments.map((adj, idx) => (
                                                <div key={idx} className="flex items-start gap-2 border-l-2 border-gray-800 pl-3 py-1">
                                                    <Brain className="w-3 h-3 text-gray-600 shrink-0 mt-0.5" />
                                                    <span className="text-[12px] text-gray-300 font-medium leading-tight">
                                                        <HighlightKeywords text={adj} />
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-[10px] text-gray-600 italic uppercase">{t('player_profile.neural_pending')}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleRunAIAnalyst}
                                disabled={isAnalyzing || cooldown > 0}
                                className="w-full py-4 bg-amber-500 text-black font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        <span>{t('player.system_analyzing')}</span>
                                    </>
                                ) : (
                                    cooldown > 0 ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 opacity-50" />
                                            <span>{t('player.cooldown')}: {cooldown}S</span>
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="w-5 h-5" />
                                            <span>{t('player.strategy_analyst')}</span>
                                        </>
                                    )
                                )}
                            </button>
                        </div>

                        {/* RIGHT COLUMN: PLAYER ID & FEED (NARROW 1/3) */}
                        <div className="space-y-6 order-1 lg:order-2">
                            {/* PLAYER IDENTITY CARD */}
                            <div className="bg-[#111318] border border-gray-800 rounded-xl p-5 relative overflow-hidden">


                                {editingPlayer ? (
                                    <div className="space-y-6 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gold font-black uppercase tracking-widest">{t('player_profile.codename')}</label>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                className="w-full bg-black/60 backdrop-blur-md shadow-inner border border-gray-700 rounded-lg px-4 py-3 text-white font-bold text-lg focus:outline-none focus:border-gray-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gold font-black uppercase tracking-widest">{t('player_profile.basic_style')}</label>
                                            <select
                                                value={editPlaystyle}
                                                onChange={e => setEditPlaystyle(e.target.value)}
                                                className="w-full bg-black/60 backdrop-blur-md shadow-inner border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500 transition-all"
                                            >
                                                <option value="UNKNOWN">{t('player_form.playstyle_unknown') || "Unknown"}</option>
                                                <option value="LAG">{t('player_form.playstyle_lag') || "LAG (Loose Aggressive)"}</option>
                                                <option value="TAG">{t('player_form.playstyle_tag') || "TAG (Tight Aggressive)"}</option>
                                                <option value="NIT">{t('player_form.playstyle_nit') || "NIT (Super Tight)"}</option>
                                                <option value="FISH">{t('player_form.playstyle_fish') || "FISH (Recreational)"}</option>
                                                <option value="WHALE">WHALE (Donor)</option>
                                                <option value="MANIAC">{t('player_form.playstyle_maniac') || "MANIAC"}</option>
                                                <option value="CALLING STATION">{t('player_form.playstyle_calling_station') || "STATION"}</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={handleUpdatePlayer} className="flex-1 py-3 bg-amber-500 text-black font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-amber-400 transition-colors">{t('player_profile.save_changes')}</button>
                                            <button onClick={() => setEditingPlayer(false)} className="px-4 py-3 bg-black/60 backdrop-blur-md shadow-inner text-gray-500 font-bold text-[10px] uppercase tracking-widest rounded-lg border border-gray-700">{t('player_profile.cancel')}</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="flex gap-5">
                                                {/* Hardcoded Avatar - Balanced Size */}
                                                <div className="w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center border border-gray-800 shadow-xl self-start mt-2">
                                                    <Users className="w-8 h-8 text-gray-700" />
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                        <span className="text-xs text-gray-500 font-mono tracking-widest uppercase">{t('player_profile.target_overview')}</span>
                                                    </div>
                                                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-2 truncate max-w-[300px] leading-tight text-white/90">{player.name}</h1>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest bg-[#1a1d24] px-3 py-1 rounded-lg border border-gray-800 shadow-inner">
                                                            {player.platform.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => { setEditingPlayer(true); setEditName(player.name); setEditPlaystyle(player.playstyle || 'UNKNOWN'); }}
                                                className="p-2 bg-black/60 backdrop-blur-md shadow-inner hover:bg-gray-800 rounded-lg border border-gray-700 transition-colors group"
                                            >
                                                <Pencil className="w-4 h-4 text-gray-400 group-hover:text-gold transition-colors" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-6">
                                            <div className="p-3 bg-[#1a1d24] rounded-lg border border-gray-800">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{t('player_profile.playstyle') || "Playstyle"}</p>
                                                {(() => { const tag = getTagStyle(player.playstyle || ''); return (
                                                <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded border ${tag.bg} ${tag.text} ${tag.border} uppercase tracking-tight`}>{player.playstyle || t('player_profile.no_data')}</span>
                                                ); })()}
                                            </div>
                                            <div className="p-3 bg-[#1a1d24] rounded-lg border border-gray-800">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{t('player_profile.aggression') || "Aggression"}</p>
                                                <p className="text-sm font-bold text-white tracking-tight">{player.aggression_score}%</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-700/60">
                                            <div></div>
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="flex items-center gap-2 text-[10px] text-gray-600 hover:text-red-500 transition-colors uppercase tracking-widest font-black"
                                            >
                                                <Trash2 className="w-3 h-3" /> {t('player_profile.delete')}
                                            </button>
                                        </div>
                                    </>
                                )}

                                {showDeleteConfirm && (
                                    <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center rounded-xl z-20 p-6 text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                                            <Trash2 className="w-6 h-6 text-red-500" />
                                        </div>
                                        <p className="text-white font-black text-sm uppercase tracking-wider mb-1">{t('player_profile.confirm_termination')}</p>
                                        <p className="text-gray-500 text-[10px] mb-6 uppercase tracking-widest font-bold">{t('player_profile.wipe_intel')} {player.name}?</p>
                                        <div className="flex flex-col gap-2 w-full">
                                            <button onClick={handleDeletePlayer} className="w-full py-3 bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-red-600 transition-colors">{t('player_profile.delete_player')}</button>
                                            <button onClick={() => setShowDeleteConfirm(false)} className="w-full py-3 text-[10px] text-gray-500 font-black uppercase tracking-widest">{t('player_profile.keep_intel')}</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* NOTES FEED */}
                            <div className="bg-[#111318] border border-gray-800 rounded-xl p-5 overflow-hidden flex flex-col max-h-[600px]">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <AlignLeft className="w-4 h-4 text-gray-400 mr-2" />
                                        <h2 className="text-xs font-bold text-white tracking-wider uppercase">{t('hands.notes')}</h2>
                                    </div>
                                    <button
                                        onClick={() => setShowAddNote(!showAddNote)}
                                        className="w-7 h-7 flex items-center justify-center bg-[#1a1d24] hover:bg-gray-800 text-gray-400 rounded-lg border border-gray-700 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {showAddNote && (
                                    <div className="mb-4 p-4 bg-black/60 backdrop-blur-md shadow-inner border border-gray-700 rounded-lg space-y-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            {['Pre', 'Flop', 'Turn', 'Riv'].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setNewNoteStreet(s === 'Pre' ? 'Preflop' : s === 'Riv' ? 'River' : s)}
                                                    className={`px-2 py-0.5 text-[8px] font-bold rounded border transition-colors uppercase tracking-widest ${newNoteStreet.startsWith(s)
                                                        ? 'bg-amber-500 text-black border-amber-500'
                                                        : 'bg-black/40 backdrop-blur-sm shadow-xl text-gray-500 border-gray-700 hover:text-white'
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={newNoteContent}
                                            onChange={e => setNewNoteContent(e.target.value)}
                                            rows={2}
                                            placeholder={t('player_profile.observation')}
                                            className="w-full bg-black/40 backdrop-blur-sm shadow-xl border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gray-500 transition-colors resize-none placeholder:text-gray-700"
                                        />
                                        <button
                                            onClick={handleAddNote}
                                            disabled={addingNote || !newNoteContent.trim()}
                                            className="w-full py-2 text-[10px] bg-amber-500 text-black font-bold uppercase tracking-widest rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
                                        >
                                            {addingNote ? t('hands.adding') : t('hands.add_note')}
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-4 overflow-y-auto pr-2 scrollbar-none">
                                    {player.notes.length === 0 ? (
                                        <div className="text-center py-8 text-gray-600 border border-dashed border-gray-700 rounded-lg bg-black/60 backdrop-blur-md shadow-inner">
                                            <p className="text-[10px] font-bold uppercase tracking-widest">{t('player_profile.no_notes')}</p>
                                        </div>
                                    ) : (
                                        player.notes.map((note) => (
                                            <div key={note.id} className="border-l-2 border-gray-800 pl-4 py-2 hover:border-gray-600 transition-all group relative">
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-amber-500 uppercase tracking-widest font-black bg-amber-500/10 px-3 py-1.5 rounded border border-amber-500/20">
                                                            {note.street || 'General'}
                                                        </span>
                                                        {note.is_ai_generated && <Zap className="w-4 h-4 text-amber-500" />}
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditingNoteId(note.id); setEditContent(note.content); setEditStreet(note.street); }} className="text-gray-600 hover:text-gold transition-colors"><Pencil className="w-2.5 h-2.5" /></button>
                                                        <button onClick={() => handleDeleteNote(note.id)} className="text-gray-600 hover:text-red-500 transition-colors"><Trash2 className="w-2.5 h-2.5" /></button>
                                                    </div>
                                                </div>

                                                {editingNoteId === note.id ? (
                                                    <div className="space-y-2">
                                                        <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full bg-black/40 backdrop-blur-sm shadow-xl border border-gray-700 rounded-lg p-2 text-[11px] text-white focus:outline-none focus:border-gray-500" />
                                                        <div className="flex gap-1">
                                                            <button onClick={() => handleUpdateNote(note.id)} className="flex-1 bg-amber-500 text-black text-[9px] font-bold uppercase py-1 rounded">{t('player_profile.save')}</button>
                                                            <button onClick={() => setEditingNoteId(null)} className="flex-1 bg-black/60 backdrop-blur-md shadow-inner text-gray-500 text-[9px] font-bold uppercase py-1 rounded border border-gray-700">{t('player_profile.cancel')}</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className={`text-base leading-relaxed ${note.is_ai_generated ? 'text-amber-200/90 italic' : 'text-gray-300 font-medium'}`}>
                                                        <HighlightKeywords text={note.content} />
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} title={t('player_profile.intelligence_templates')} size="xl">
                <TemplateManagerModal onClose={() => setSettingsOpen(false)} />
            </Modal>
        </div>
    );
}
