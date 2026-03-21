"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Pencil, Trash2, Eye, Plus, X, Check, Search, Filter,
    ChevronDown, Zap, Shield, Target, RefreshCw, AlignLeft
} from 'lucide-react';
import { Header } from "@/components/layout/Header";
import { StrategyGuide } from "@/components/dashboard/StrategyGuide";
import { API } from "@/lib/api";

const STRATEGIES: Record<string, string[]> = {
    "LAG": [
        "Widen your value 3-betting range preflop to punish their wide opens.",
        "Smooth call with strong draws and monsters on the flop to induce bluffs on later streets.",
        "They will over-barrel; use your strong top-pairs as bluff catchers.",
        "Do not try to bluff this player off top pair."
    ],
    "NIT": [
        "Steal their blinds relentlessly preflop; they fold too often without a premium holding.",
        "If they 3-bet you, fold unless you look down at QQ+ or AKs.",
        "Float the flop and bet the turn if they check to you; they play 'fit-or-fold'.",
        "Never pay off their river raises."
    ],
    "TAG": [
        "Avoid tangling out of position without a solid range advantage.",
        "Attack their c-bets on coordinated boards; they often have air when they check the turn.",
        "Pay attention to sizing tells—they often bet larger with polarized value.",
        "Do not run multi-street elaborate bluffs; TAGs have rigid calling ranges."
    ],
    "MANIAC": [
        "Tighten up preflop and play exclusively for value.",
        "Never slowplay your strong hands preflop.",
        "Let them do the betting for you post-flop.",
        "Prepare for high variance; buy-in full and do not tilt when they hit their 2-outers."
    ],
    "CALLING STATION": [
        "Never bluff under any circumstances. Value bet thinly across all three streets.",
        "Size your value bets larger on wet boards—they don't understand pot odds.",
        "If you miss your draw, give up immediately.",
        "Do not overthink hand reading; they are playing their cards face up."
    ],
    "FISH": [
        "Isolate them preflop to play pots heads-up in position.",
        "Extract maximum value. Size up dramatically when you hit Gin.",
        "Watch for passive limping—punish it with large isolation raises.",
    ],
};

import { fetchPlayerProfile } from "@/app/actions";
import { fetchStrategy, HandStrategy, SolveRequest } from "@/lib/solverAPI";
import { Modal } from "@/components/ui/Modal";
import { TemplateManagerModal } from "@/components/forms/TemplateManagerModal";
import { buildCategorizedBreakdown, emptyCategorizedBreakdown, type CategorizedBreakdown } from "@/lib/analysis/HandCategoryResolver";

interface Note {
    id: string;
    content: string;
    street: string;
    note_type: string;
    created_at: string;
}

interface PlayerDetails {
    id: string;
    name: string;
    playstyle: string;
    aggression_score: number;
    notes: Note[];
    ai_profile?: {
        archetype: string;
        confidence: number;
        aggression_score: number;
        looseness_score: number;
        leaks: string[];
        strategy: string;
    } | null;
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
    const [cooldown, setCooldown] = useState(0); // in seconds

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
    const [editName, setEditName] = useState('');
    const [editPlaystyle, setEditPlaystyle] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Solver state
    const [solveData, setSolveData] = useState<Record<string, HandStrategy> | null>(null);
    const [solveActionBreakdown, setSolveActionBreakdown] = useState<CategorizedBreakdown>(emptyCategorizedBreakdown());
    const [isSolving, setIsSolving] = useState(false);
    const [solveError, setSolveError] = useState<string | null>(null);
    const [isSettingsOpen, setSettingsOpen] = useState(false);

    // Refresh player data via Server Action
    const refreshPlayer = async () => {
        const updated = await fetchPlayerProfile(player.id);
        if (updated) setPlayer(updated as any);
    };

    // AI Profiling Trigger
    const handleRunAIAnalyst = async () => {
        if (cooldown > 0) return;
        setIsAnalyzing(true);
        try {
            const res = await fetch(API.refreshProfile, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: player.id })
            });

            if (res.status === 429) {
                alert("Rate limit reached. Please wait a moment.");
                setCooldown(60); // Set a default cooldown if backend rate limits
                return;
            }

            const json = await res.json();
            if (json.success) {
                await refreshPlayer();
                // Set a 60-second cooldown on success
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
            const res = await fetch(API.notes, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player_id: player.id,
                    street: newNoteStreet,
                    note_type: 'Custom',
                    content: newNoteContent.trim()
                })
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
            const res = await fetch(API.note(noteId), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
            const res = await fetch(API.note(noteId), { method: 'DELETE' });
            if (res.ok) await refreshPlayer();
        } catch (err) {
            console.error("Failed to delete note", err);
        }
    };

    // UPDATE Player
    const handleUpdatePlayer = async () => {
        if (!editName.trim()) return;
        try {
            const res = await fetch(API.player(player.id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
            const res = await fetch(API.player(player.id), { method: 'DELETE' });
            if (res.ok) router.push('/players');
        } catch (err) {
            console.error("Failed to delete player", err);
        }
    };

    // SOLVE
    const handleSolve = async (filterData: SolveRequest) => {
        setIsSolving(true);
        setSolveError(null);
        try {
            const requestPayload: SolveRequest = {
                spot: filterData.spot,
                stack: filterData.stack,
                villainType: filterData.villainType || "NEUTRAL",
                shapingMode: filterData.shapingMode || "balanced",
                street: filterData.street,
                board: filterData.board,
            };

            const response = await fetchStrategy(requestPayload);
            console.log("PlayerProfileClient: fetchStrategy succeeded, returning data", response);

            setSolveData(response ?? null);

            const raiseRecord: Record<string, number> = {};
            const callRecord: Record<string, number> = {};
            const foldRecord: Record<string, number> = {};
            for (const [hand, strat] of Object.entries(response || {})) {
                raiseRecord[hand] = (strat?.raise ?? 0) * 100;
                callRecord[hand] = (strat?.call ?? 0) * 100;
                foldRecord[hand] = (strat?.fold ?? 0) * 100;
            }

            // Categorized action breakdown (post-processing)
            const categorized = buildCategorizedBreakdown(
                raiseRecord,
                callRecord,
                foldRecord,
                filterData.board,
            );
            setSolveActionBreakdown(categorized);

        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Failed to solve";
            setSolveError(message);
        } finally {
            setIsSolving(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f2e1e] via-[#020202] to-black">
            <Header user={user} onSettingsClick={() => setSettingsOpen(true)} />

            <div className="flex-1 overflow-y-auto pt-20 sm:pt-32 px-4 sm:px-8 pb-8 relative scrollbar-hide">
                <div className="max-w-7xl mx-auto relative z-10">

                    {/* Back Navigation Bar */}
                    <button
                        onClick={() => router.push('/players')}
                        className="flex items-center text-gray-400 hover:text-white transition-colors group mb-8"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Players
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* LEFT COLUMN: IDENTIFICATION & STRATEGY */}
                        <div className="lg:col-span-1 space-y-6 lg:space-y-8">

                            {/* Player ID Card */}
                            <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
                                {/* Top accent line */}
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>

                                {editingPlayer ? (
                                    /* EDIT MODE */
                                    <div className="p-8 space-y-4">
                                        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Edit Profile</h2>
                                        <div>
                                            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Playstyle</label>
                                            <select
                                                value={editPlaystyle}
                                                onChange={e => setEditPlaystyle(e.target.value)}
                                                className="w-full bg-background border border-border text-sm rounded-md px-3 py-2 text-white focus:outline-none focus:border-gold"
                                            >
                                                <option value="UNKNOWN">Unknown</option>
                                                <option value="LAG">LAG</option>
                                                <option value="TAG">TAG</option>
                                                <option value="NIT">NIT</option>
                                                <option value="FISH">FISH</option>
                                                <option value="MANIAC">MANIAC</option>
                                                <option value="CALLING STATION">CALLING STATION</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button onClick={() => setEditingPlayer(false)} className="flex-1 text-xs text-gray-400 hover:text-white py-2 border border-border rounded-md transition-colors">Cancel</button>
                                            <button onClick={handleUpdatePlayer} className="flex-1 text-xs text-white bg-felt-light py-2 rounded-md font-semibold hover:bg-felt-default transition-colors">Save Changes</button>
                                        </div>
                                    </div>
                                ) : (
                                    /* VIEW MODE */
                                    <>
                                        {/* Hero Section */}
                                        <div className="relative px-8 pt-8 pb-6">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-felt-light/15 to-transparent rounded-bl-full pointer-events-none"></div>

                                            {/* Avatar + Name */}
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold/30 to-gold/5 border-2 border-gold/40 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                                                    <span className="text-xl font-bold text-gold">{player.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h1 className="text-2xl font-bold text-white truncate">{player.name}</h1>
                                                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-[0.2em]">Opponent Profile</span>
                                                </div>
                                            </div>

                                            {/* Playstyle Badge — Full Width */}
                                            <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Classified As</span>
                                                <span className="px-4 py-1.5 bg-gold/10 text-gold font-black text-xs rounded-full border border-gold/30 tracking-wider shadow-[0_0_12px_rgba(212,175,55,0.1)]">
                                                    {player.playstyle || "UNKNOWN"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="px-8 pb-6 space-y-4">
                                            {/* Aggression Gauge */}
                                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Aggression Level</span>
                                                    <span className="text-lg font-mono text-white font-bold">{player.aggression_score}<span className="text-gray-600 text-xs">/100</span></span>
                                                </div>
                                                {/* Visual Gauge Bar */}
                                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${player.aggression_score > 70 ? 'bg-gradient-to-r from-gold-dim to-gold shadow-[0_0_10px_rgba(255,196,0,0.4)]'
                                                            : player.aggression_score > 40 ? 'bg-gradient-to-r from-felt-default to-felt-light shadow-[0_0_10px_rgba(0,153,77,0.3)]'
                                                                : 'bg-gradient-to-r from-felt-dark to-felt-default shadow-[0_0_10px_rgba(0,51,26,0.3)]'
                                                            }`}
                                                        style={{ width: `${Math.min(player.aggression_score, 100)}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between mt-1.5">
                                                    <span className="text-[9px] text-gray-600">PASSIVE</span>
                                                    <span className="text-[9px] text-gray-600">AGGRESSIVE</span>
                                                </div>
                                            </div>

                                            {/* Notes Counter */}
                                            <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Intel Records</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
                                                    <span className="text-lg font-mono text-gold font-bold">{player.notes.length}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Toolbar */}
                                        <div className="border-t border-white/5 px-8 py-3 flex justify-end gap-1">
                                            <button
                                                onClick={() => { setEditingPlayer(true); setEditName(player.name); setEditPlaystyle(player.playstyle || 'UNKNOWN'); }}
                                                className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gold px-3 py-1.5 rounded-md hover:bg-white/5 transition-all uppercase tracking-wider font-semibold"
                                            >
                                                <Pencil className="w-3 h-3" /> Edit
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-red-400 px-3 py-1.5 rounded-md hover:bg-white/5 transition-all uppercase tracking-wider font-semibold"
                                            >
                                                <Trash2 className="w-3 h-3" /> Remove
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Delete Confirmation Overlay */}
                                {showDeleteConfirm && (
                                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-20 p-6">
                                        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
                                            <Trash2 className="w-5 h-5 text-red-400" />
                                        </div>
                                        <p className="text-white font-semibold text-sm mb-1">Delete {player.name}?</p>
                                        <p className="text-gray-400 text-xs mb-5 text-center">All notes and intel will be permanently removed.</p>
                                        <div className="flex gap-2 w-full max-w-xs">
                                            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 text-xs text-gray-300 py-2.5 border border-border rounded-lg hover:bg-white/5 transition-colors font-medium">Cancel</button>
                                            <button onClick={handleDeletePlayer} className="flex-1 text-xs text-white bg-red-500/80 py-2.5 rounded-lg font-semibold hover:bg-red-500 transition-colors">Confirm Delete</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* AI ANALYST PANEL (PREMIUM FEATURE) */}
                            <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden p-8">
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>

                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-amber-400" />
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tactical Intelligence</h3>
                                    </div>
                                    <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase tracking-widest leading-none">
                                        AI Analyst
                                    </span>
                                </div>

                                {isAnalyzing ? (
                                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                                            <Zap className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-bold text-sm tracking-widest uppercase">Processing Intel</p>
                                            <p className="text-gray-500 text-[10px] mt-1">Aggregating structured tendencies...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* ANALYSIS HEADER: Always visible, shows Playstyle or AI Archetype */}
                                        <div className="flex items-center justify-between p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl shadow-inner group">
                                            <div>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1 px-1">Tactical Analysis</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white/40 font-black text-lg">ANALYSIS:</span>
                                                    <div className="text-amber-400 font-black text-2xl tracking-tighter uppercase group-hover:scale-105 transition-transform origin-left">
                                                        {player.ai_profile?.archetype || player.playstyle || 'UNKNOWN'}
                                                    </div>
                                                </div>
                                            </div>
                                            {player.ai_profile && (
                                                <div className="text-right bg-black/20 p-2 px-3 rounded-lg border border-white/5">
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block mb-0.5">Confidence</span>
                                                    <div className="text-amber-500 font-mono text-base font-black">
                                                        {Math.round(player.ai_profile.confidence * 100)}%
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {player.ai_profile && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Aggression</span>
                                                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                                        <div className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-1000" style={{ width: `${player.ai_profile.aggression_score}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Looseness</span>
                                                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: `${player.ai_profile.looseness_score}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {player.ai_profile && player.ai_profile.leaks.length > 0 && (
                                            <div className="space-y-2">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block">Observed Intelligence Leaks</span>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {player.ai_profile.leaks.map((leak, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 text-[11px] text-gray-300 bg-white/5 p-2.5 rounded-lg border border-white/5 hover:border-amber-500/20 transition-colors">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                                                            {leak}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-4 pt-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Target className="w-4 h-4 text-amber-500" />
                                                <span className="text-[10px] text-amber-500 uppercase tracking-[0.2em] font-black">
                                                    {player.ai_profile ? "Elite Exploit Directives" : "Standard Strategy Guide"}
                                                </span>
                                            </div>

                                            <div className="bg-amber-500/5 p-5 rounded-2xl border border-amber-500/20 relative overflow-hidden backdrop-blur-sm">
                                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>

                                                <div className="relative z-10 space-y-3">
                                                    {player.ai_profile ? (
                                                        /* AI STRATEGY DISPLAY */
                                                        (player.ai_profile.strategy || "").split(/[.;\n]/).filter(s => s.trim().length > 3).map((sentence, idx) => (
                                                            <div key={idx} className="flex gap-3 items-start group">
                                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500/40 group-hover:bg-amber-500 transition-colors shrink-0"></div>
                                                                <p className="text-xs text-gray-200 leading-relaxed font-medium">
                                                                    {sentence.trim()}.
                                                                </p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        /* TEXTBOOK STRATEGY FALLBACK */
                                                        (STRATEGIES[(player.playstyle || '').toUpperCase()] || [
                                                            "Not enough intelligence gathered to formulate a specific exploitative strategy.",
                                                            "Play default GTO ranges and observe their VPIP/PFR deviation."
                                                        ]).map((heuristic: string, idx: number) => (
                                                            <div key={idx} className="flex gap-3 items-start group">
                                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500/20 group-hover:bg-amber-500 transition-colors shrink-0"></div>
                                                                <p className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-200 transition-colors">
                                                                    {heuristic}
                                                                </p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            {!player.ai_profile ? (
                                                <button
                                                    onClick={handleRunAIAnalyst}
                                                    disabled={isAnalyzing || cooldown > 0}
                                                    className="w-full py-4 bg-gradient-to-br from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-black text-sm uppercase tracking-[0.2em] rounded-xl shadow-[0_4px_15px_rgba(245,158,11,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-50 disabled:transform-none"
                                                >
                                                    <Zap className="w-5 h-5" />
                                                    {cooldown > 0 ? `Wait ${cooldown}s` : 'Run AI Deep Analyst'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleRunAIAnalyst}
                                                    disabled={isAnalyzing || cooldown > 0}
                                                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-[10px] text-gray-500 hover:text-amber-400 font-bold uppercase tracking-[0.3em] rounded-xl transition-all border border-dashed border-white/10 hover:border-amber-500/40 group disabled:opacity-50"
                                                >
                                                    <div className="flex items-center justify-center gap-2">
                                                        <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-700`} />
                                                        {cooldown > 0 ? `Cooldown (${cooldown}s)` : 'Recalculate Elite Intel'}
                                                    </div>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* RIGHT COLUMN: INTELLIGENCE FEED */}
                        <div className="lg:col-span-2">
                            <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 h-full shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                                    <div className="flex items-center">
                                        <AlignLeft className="w-5 h-5 text-felt-light mr-3" />
                                        <h2 className="text-lg font-bold text-white tracking-wide">INTELLIGENCE LOG</h2>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-mono text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                                            {player.notes.length} RECORDS
                                        </span>
                                        <button
                                            onClick={() => setShowAddNote(!showAddNote)}
                                            className="flex items-center text-xs px-3 py-1.5 bg-felt-light/20 hover:bg-felt-light/30 text-felt-light border border-felt-light/30 rounded-full transition-all font-bold uppercase tracking-wider"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                                            Add Note
                                        </button>
                                    </div>
                                </div>

                                {/* Inline Add Note Form */}
                                {showAddNote && (
                                    <div className="mb-6 p-5 bg-black/40 border border-felt-light/20 rounded-xl space-y-3">
                                        <div className="flex space-x-2">
                                            {['Preflop', 'Flop', 'Turn', 'River'].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setNewNoteStreet(s)}
                                                    className={`px-3 py-1 text-[10px] font-bold rounded uppercase transition-colors border ${newNoteStreet === s
                                                        ? 'bg-felt-default text-white border-felt-light'
                                                        : 'bg-card text-gray-400 border-border hover:text-gray-200'
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
                                            placeholder="e.g. 3-bet light from BB with suited connectors..."
                                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => { setShowAddNote(false); setNewNoteContent(''); }}
                                                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white border border-border rounded-md transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddNote}
                                                disabled={addingNote || !newNoteContent.trim()}
                                                className="px-4 py-1.5 text-xs bg-felt-light text-white font-semibold rounded-md hover:bg-felt-default transition-colors disabled:opacity-50"
                                            >
                                                {addingNote ? 'Saving...' : 'Save Note'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {player.notes.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl bg-black/30">
                                            No intelligence records available yet. Click &quot;Add Note&quot; to start.
                                        </div>
                                    ) : (
                                        player.notes.map((note) => (
                                            <div key={note.id} className="bg-black/40 border border-white/5 rounded-xl p-5 hover:border-felt-light/30 transition-colors group relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-felt-light to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                                {editingNoteId === note.id ? (
                                                    /* EDIT MODE */
                                                    <div className="space-y-3">
                                                        <div className="flex space-x-2">
                                                            {['Preflop', 'Flop', 'Turn', 'River'].map((s) => (
                                                                <button
                                                                    key={s}
                                                                    type="button"
                                                                    onClick={() => setEditStreet(s)}
                                                                    className={`px-3 py-1 text-[10px] font-bold rounded uppercase transition-colors border ${editStreet === s
                                                                        ? 'bg-felt-default text-white border-felt-light'
                                                                        : 'bg-card text-gray-400 border-border hover:text-gray-200'
                                                                        }`}
                                                                >
                                                                    {s}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <textarea
                                                            value={editContent}
                                                            onChange={e => setEditContent(e.target.value)}
                                                            rows={3}
                                                            className="w-full bg-background border border-gold/30 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => { setEditingNoteId(null); setEditContent(''); }}
                                                                className="flex items-center text-xs text-gray-400 hover:text-white px-2 py-1 border border-border rounded transition-colors"
                                                            >
                                                                <X className="w-3 h-3 mr-1" /> Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateNote(note.id)}
                                                                className="flex items-center text-xs text-white bg-felt-light px-3 py-1 rounded font-semibold hover:bg-felt-default transition-colors"
                                                            >
                                                                <Check className="w-3 h-3 mr-1" /> Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* VIEW MODE */
                                                    <>
                                                        <div className="flex justify-between items-start mb-3">
                                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded border border-white/10 font-mono">
                                                                {note.street || 'General'}
                                                            </span>
                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingNoteId(note.id);
                                                                        setEditContent(note.content);
                                                                        setEditStreet(note.street);
                                                                    }}
                                                                    className="p-1.5 text-gray-500 hover:text-gold hover:bg-white/5 rounded transition-all"
                                                                    title="Edit note"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteNote(note.id)}
                                                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded transition-all"
                                                                    title="Delete note"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-300 leading-relaxed mb-3">{note.content}</p>
                                                        <div className="text-[10px] text-gray-500 font-mono flex items-center">
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            Logged: {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString()}
                                                        </div>
                                                    </>
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
            <Modal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} title="Settings & Tags" size="xl">
                <TemplateManagerModal onClose={() => setSettingsOpen(false)} />
            </Modal>
        </div>
    );
}
