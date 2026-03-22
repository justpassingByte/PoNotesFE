"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Pencil, Trash2, Eye, Plus, X, Check, Search, Filter,
    ChevronDown, Zap, Shield, Target, RefreshCw, AlignLeft, Brain
} from 'lucide-react';
import { Header } from "@/components/layout/Header";
import { API } from "@/lib/api";

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
        strategy: string;
        range_adjustments?: string[];
        gto_deviation_reason?: string;
    } | null;
    ai_exploit_strategy?: string | null;
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
        fetch(`${API.usage}?action=AI_ANALYZE`)
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
            const res = await fetch(API.refreshProfile, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: player.id })
            });

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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* LEFT COLUMN: TACTICAL INTELLIGENCE (WIDE 2/3) */}
                        <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
                            {/* ANALYSIS HEADER */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gold/10 rounded-xl border border-gold/20">
                                        <Brain className="w-5 h-5 text-gold" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black text-white tracking-[0.2em] uppercase">Tactical AI Analysis</h2>
                                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Active Exploitive Engine v4.2</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">Live Feed</span>
                                    <button onClick={refreshPlayer} className="p-2 text-gray-500 hover:text-white transition-colors">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* ELITE STRATEGY DISPLAY */}
                            <div className="bg-card/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-8">
                                        <div className="h-0.5 w-8 bg-gold"></div>
                                        <span className="text-[10px] text-gold font-black uppercase tracking-[0.3em]">Core Exploit Strategy</span>
                                    </div>
                                    
                                    {isAnalyzing ? (
                                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                            <RefreshCw className="w-8 h-8 text-gold animate-spin" />
                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Neural Calibration in progress...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold/20 pr-4 mb-10">
                                                <blockquote className="text-base md:text-lg font-medium text-gray-200 leading-relaxed tracking-tight italic">
                                                    &quot;{player.ai_profile?.strategy || player.ai_exploit_strategy || "Gathering more data for neural mapping..."}&quot;
                                                </blockquote>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
                                                <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Archetype</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-gold"></div>
                                                        <span className="text-lg font-bold text-white uppercase tracking-tighter">{player.ai_profile?.archetype || player.playstyle || 'Analyzing'}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Aggression</p>
                                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gold shadow-[0_0_10px_rgba(255,215,0,0.5)]" 
                                                            style={{ width: `${player.ai_profile?.aggression_score || player.aggression_score || 50}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Analysis Mode</p>
                                                    <div className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-1.5">
                                                        <Zap className="w-3 h-3" /> GTO-Exploit Hybrid
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* DETAILED STATS GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all">
                                    <h3 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-6 flex items-center justify-between">
                                        Positional Leaks
                                        <Shield className="w-3 h-3 text-gold" />
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
                                            <div className="text-[10px] text-gray-600 italic uppercase">No critical leaks detected in current sample.</div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all">
                                    <h3 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-6 flex items-center justify-between">
                                        Range Adjustments
                                        <Target className="w-3 h-3 text-gold" />
                                    </h3>
                                    <div className="space-y-4">
                                        {(player.ai_profile?.range_adjustments && player.ai_profile.range_adjustments.length > 0) ? (
                                            player.ai_profile.range_adjustments.map((adj, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs group">
                                                    <span className="text-gray-500 uppercase tracking-widest font-black flex items-center gap-2">
                                                        <div className="w-1 h-1 rounded-full bg-gold/50 group-hover:bg-gold transition-colors"></div>
                                                        ADJUSTMENT {idx + 1}
                                                    </span>
                                                    <span className="text-white font-mono font-bold">{adj}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-[10px] text-gray-600 italic uppercase">Neural mapping pending...</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleRunAIAnalyst}
                                disabled={isAnalyzing || cooldown > 0}
                                className="w-full py-5 bg-gold text-black font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-yellow-400 transition-all shadow-[0_10px_30px_rgba(255,215,0,0.1)] active:scale-95 disabled:opacity-50"
                            >
                                {isAnalyzing ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : (cooldown > 0 ? `Analyst Cooldown: ${cooldown}s` : 'Request Neural Profile Update')}
                            </button>
                        </div>

                        {/* RIGHT COLUMN: PLAYER ID & FEED (NARROW 1/3) */}
                        <div className="space-y-8 order-1 lg:order-2">
                            {/* PLAYER IDENTITY CARD */}
                            <div className="bg-gradient-to-b from-card to-black border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>
                                
                                {editingPlayer ? (
                                    <div className="space-y-6 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gold font-black uppercase tracking-widest">Codename</label>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-lg focus:outline-none focus:border-gold transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gold font-black uppercase tracking-widest">Basic Style</label>
                                            <select
                                                value={editPlaystyle}
                                                onChange={e => setEditPlaystyle(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-all"
                                            >
                                                <option value="UNKNOWN">Unknown</option>
                                                <option value="LAG">LAG (Loose Aggressive)</option>
                                                <option value="TAG">TAG (Tight Aggressive)</option>
                                                <option value="NIT">NIT (Super Tight)</option>
                                                <option value="FISH">FISH (Recreational)</option>
                                                <option value="WHALE">WHALE (Donor)</option>
                                                <option value="MANIAC">MANIAC</option>
                                                <option value="CALLING STATION">STATION</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={handleUpdatePlayer} className="flex-1 py-3 bg-gold text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all">Save Changes</button>
                                            <button onClick={() => setEditingPlayer(false)} className="px-4 py-3 bg-white/5 text-gray-500 font-black text-[10px] uppercase tracking-widest rounded-xl border border-white/5">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Target Lock</span>
                                                </div>
                                                <h1 className="text-4xl font-black text-white tracking-tighter mb-1 truncate max-w-[200px]">{player.name}</h1>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                                        {player.platform.name}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => { setEditingPlayer(true); setEditName(player.name); setEditPlaystyle(player.playstyle || 'UNKNOWN'); }}
                                                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group"
                                            >
                                                <Pencil className="w-4 h-4 text-gray-400 group-hover:text-gold transition-colors" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Playstyle</p>
                                                <p className="text-sm font-bold text-white uppercase tracking-tight">{player.playstyle || 'No Data'}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Aggression</p>
                                                <p className="text-sm font-bold text-white tracking-tight">{player.aggression_score}%</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gold/50"></div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="flex items-center gap-2 text-[10px] text-gray-600 hover:text-red-500 transition-colors uppercase tracking-widest font-black"
                                            >
                                                <Trash2 className="w-3 h-3" /> Delete
                                            </button>
                                        </div>
                                    </>
                                )}

                                {showDeleteConfirm && (
                                    <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center rounded-3xl z-20 p-6 text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                                            <Trash2 className="w-6 h-6 text-red-500" />
                                        </div>
                                        <p className="text-white font-black text-sm uppercase tracking-wider mb-1">Confirm Termination</p>
                                        <p className="text-gray-500 text-[10px] mb-6 uppercase tracking-widest font-bold">Wipe all intelligence on {player.name}?</p>
                                        <div className="flex flex-col gap-2 w-full">
                                            <button onClick={handleDeletePlayer} className="w-full py-3 bg-red-500 text-white font-black text-xs uppercase tracking-[.2em] rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">Wipe Data</button>
                                            <button onClick={() => setShowDeleteConfirm(false)} className="w-full py-3 text-[10px] text-gray-500 font-black uppercase tracking-widest">Keep Intel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* INTELLIGENCE FEED (NOTES) (IN COLUMN) */}
                            <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[600px]">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <AlignLeft className="w-4 h-4 text-gold mr-2" />
                                        <h2 className="text-xs font-black text-white tracking-[0.2em] uppercase">Intelligence Feed</h2>
                                    </div>
                                    <button
                                        onClick={() => setShowAddNote(!showAddNote)}
                                        className="w-8 h-8 flex items-center justify-center bg-gold/10 hover:bg-gold/20 text-gold rounded-full border border-gold/20 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                {showAddNote && (
                                    <div className="mb-6 p-4 bg-black/40 border border-gold/20 rounded-2xl space-y-4 animate-in slide-in-from-top duration-300">
                                        <div className="flex flex-wrap gap-1.5">
                                            {['Pre', 'Flop', 'Turn', 'Riv'].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setNewNoteStreet(s === 'Pre' ? 'Preflop' : s === 'Riv' ? 'River' : s)}
                                                    className={`px-2 py-0.5 text-[8px] font-black rounded border transition-all uppercase tracking-widest ${newNoteStreet.startsWith(s)
                                                        ? 'bg-gold text-black border-gold'
                                                        : 'bg-white/5 text-gray-500 border-white/10 hover:text-white'
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
                                            placeholder="Observation..."
                                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold transition-all resize-none placeholder:text-gray-700"
                                        />
                                        <button
                                            onClick={handleAddNote}
                                            disabled={addingNote || !newNoteContent.trim()}
                                            className="w-full py-2 text-[10px] bg-gold text-black font-black uppercase tracking-widest rounded-lg hover:bg-yellow-400 transition-all disabled:opacity-50"
                                        >
                                            {addingNote ? 'Commiting...' : 'Commit Intel'}
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-4 overflow-y-auto pr-2 scrollbar-none">
                                    {player.notes.length === 0 ? (
                                        <div className="text-center py-10 text-gray-600 border border-dashed border-white/5 rounded-2xl bg-black/20">
                                            <p className="text-[10px] font-bold uppercase tracking-widest">No Intelligence Records</p>
                                        </div>
                                    ) : (
                                        player.notes.map((note) => (
                                            <div key={note.id} className="bg-black/40 border border-white/5 rounded-2xl p-4 hover:border-gold/20 transition-all group relative">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[8px] text-gold/80 uppercase tracking-widest font-black bg-gold/5 px-2 py-0.5 rounded border border-gold/10">
                                                            {note.street || 'General'}
                                                        </span>
                                                        {note.is_ai_generated && <Zap className="w-2.5 h-2.5 text-gold animate-pulse" />}
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditingNoteId(note.id); setEditContent(note.content); setEditStreet(note.street); }} className="text-gray-600 hover:text-gold transition-colors"><Pencil className="w-2.5 h-2.5" /></button>
                                                        <button onClick={() => handleDeleteNote(note.id)} className="text-gray-600 hover:text-red-500 transition-colors"><Trash2 className="w-2.5 h-2.5" /></button>
                                                    </div>
                                                </div>
                                                
                                                {editingNoteId === note.id ? (
                                                    <div className="space-y-2">
                                                        <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full bg-black/60 border border-gold/40 rounded-lg p-2 text-[11px] text-white focus:outline-none" />
                                                        <div className="flex gap-1">
                                                            <button onClick={() => handleUpdateNote(note.id)} className="flex-1 bg-gold text-black text-[9px] font-black uppercase py-1 rounded">Save</button>
                                                            <button onClick={() => setEditingNoteId(null)} className="flex-1 bg-white/5 text-gray-500 text-[9px] font-black uppercase py-1 rounded">Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className={`text-[11px] leading-relaxed ${note.is_ai_generated ? 'text-amber-200/80 italic' : 'text-gray-400 font-medium'}`}>
                                                        {note.content}
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
            <Modal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} title="Intelligence Templates" size="xl">
                <TemplateManagerModal onClose={() => setSettingsOpen(false)} />
            </Modal>
        </div>
    );
}
