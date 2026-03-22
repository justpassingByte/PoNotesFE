"use client";

import { useState, useEffect } from "react";
import { Clock, Search, Tag, ChevronRight, Sparkles, Trophy, Calendar, Trash2 } from "lucide-react";
import { API } from "@/lib/api";

interface HandSummary {
    id: string;
    hand_hash: string;
    input_type: string;
    tags: string[];
    created_at: string;
    parsed_data?: {
        hand_id?: string;
        game_type?: string;
        board?: string[];
        pot?: number;
        winner?: string;
    };
    ai_analysis?: {
        heroMistakes?: any[];
        villainMistakes?: any[];
        summary?: string;
    };
}

const SUIT_SYMBOLS: Record<string, string> = { h: "♥", d: "♦", c: "♣", s: "♠" };
const SUIT_COLORS: Record<string, string> = {
    h: "text-red-500", d: "text-blue-400", c: "text-green-400", s: "text-white"
};

function MiniCard({ card }: { card: string }) {
    const rank = card.slice(0, -1).toUpperCase();
    const suit = card.slice(-1).toLowerCase();
    return (
        <span className={`text-xs font-mono font-bold ${SUIT_COLORS[suit] || "text-white"}`}>
            {rank}{SUIT_SYMBOLS[suit] || suit}
        </span>
    );
}

export function HandHistoryList() {
    const [hands, setHands] = useState<HandSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTag, setSearchTag] = useState("");
    const [gameType, setGameType] = useState("");
    const [minPot, setMinPot] = useState("");
    const [selectedHand, setSelectedHand] = useState<string | null>(null);

    useEffect(() => {
        fetchHands();
    }, []);

    async function fetchHands() {
        setLoading(true);
        try {
            const params = new URLSearchParams({ 
                limit: "50" 
            });
            if (searchTag) params.set("tag", searchTag);
            if (gameType) params.set("gameType", gameType);
            if (minPot) params.set("minPot", minPot);

            const res = await fetch(`${API.handHistory}?${params.toString()}`);
            const json = await res.json();
            if (json.success) {
                setHands(json.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch hands:", err);
        } finally {
            setLoading(false);
        }
    }

    const deleteHand = async (handId: string) => {
        if (!confirm("Are you sure you want to delete this hand history?")) return;
        
        try {
            const res = await fetch(`${API.handHistory}/${handId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });
            const json = await res.json();
            if (json.success) {
                alert("Hand deleted successfully");
                fetchHands();
            }
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Delete failed");
        }
    };

    const clearFilters = () => {
        setSearchTag("");
        setGameType("");
        setMinPot("");
        // Optimization: trigger fetch manually after state updates
        setTimeout(fetchHands, 0);
    };

    if (loading && hands.length === 0) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                        <div className="h-4 bg-white/5 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-white/5 rounded w-2/3" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Advanced Search Bar */}
            <div className="bg-card/50 border border-border rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={searchTag}
                            onChange={(e) => setSearchTag(e.target.value)}
                            placeholder="Tag (e.g. Bluff)"
                            className="w-full bg-black/40 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:ring-1 focus:ring-gold/50"
                        />
                    </div>
                    <div>
                        <select
                            value={gameType}
                            onChange={(e) => setGameType(e.target.value)}
                            className="w-full bg-black/40 border border-border rounded-lg px-4 py-2 text-sm text-gray-300 focus:ring-1 focus:ring-gold/50"
                        >
                            <option value="">All Game Types</option>
                            <option value="NLHE">No Limit Hold'em</option>
                            <option value="PLO">Pot Limit Omaha</option>
                            <option value="SHORT_DECK">6+ Short Deck</option>
                        </select>
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono">Min BB</span>
                        <input
                            type="number"
                            value={minPot}
                            onChange={(e) => setMinPot(e.target.value)}
                            placeholder="Min Pot"
                            className="w-full bg-black/40 border border-border rounded-lg pl-16 pr-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:ring-1 focus:ring-gold/50"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchHands}
                            className="flex-1 bg-gold hover:bg-amber-500 text-black text-sm font-bold py-2 rounded-lg transition-colors"
                        >
                            Filter
                        </button>
                        <button
                            onClick={clearFilters}
                            className="px-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg border border-border"
                            title="Clear All"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {hands.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-400">No Hands Found</h3>
                    <p className="text-sm text-gray-600 mt-1">Try adjusting your filters or analyze a new hand.</p>
                </div>
            ) : (
                hands.map((hand) => {
                    const parsed = hand.parsed_data;
                    const analysis = hand.ai_analysis;
                    const heroCount = analysis?.heroMistakes?.length || 0;
                    const villainCount = analysis?.villainMistakes?.length || 0;
                    const isOpen = selectedHand === hand.id;

                    return (
                        <div
                            key={hand.id}
                            onClick={() => setSelectedHand(isOpen ? null : hand.id)}
                            className={`bg-card border rounded-xl transition-all cursor-pointer hover:border-gold/30 ${isOpen ? "border-gold/40 shadow-lg shadow-gold/5" : "border-border"}`}
                        >
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`p-2 rounded-lg ${hand.input_type === "image" ? "bg-purple-500/10" : "bg-blue-500/10"}`}>
                                        {hand.input_type === "image" ? (
                                            <Sparkles className="w-4 h-4 text-purple-400" />
                                        ) : (
                                            <Clock className="w-4 h-4 text-blue-400" />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-sm font-medium">
                                                {parsed?.hand_id || hand.hand_hash.slice(0, 12)}
                                            </span>
                                            {parsed?.game_type && (
                                                <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{parsed.game_type}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            {parsed?.board && parsed.board.length > 0 && (
                                                <div className="flex gap-1">
                                                    {parsed.board.map((c, i) => <MiniCard key={i} card={c} />)}
                                                </div>
                                            )}
                                            <span className="text-[10px] text-gray-600 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(hand.created_at))}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {parsed?.pot !== undefined && (
                                        <span className="text-xs text-gold font-mono font-bold bg-gold/5 px-2 py-1 rounded border border-gold/10">
                                            {parsed.pot} BB
                                        </span>
                                    )}
                                    <div className="hidden sm:flex items-center gap-2">
                                        {heroCount > 0 && (
                                            <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/10">
                                                {heroCount} Mistake{heroCount > 1 ? "s" : ""}
                                            </span>
                                        )}
                                        {villainCount > 0 && (
                                            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/10">
                                                {villainCount} Leak{villainCount > 1 ? "s" : ""}
                                            </span>
                                        )}
                                    </div>
                                    <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                                </div>
                            </div>

                            {/* Expanded Detail */}
                            {isOpen && (
                                <div className="px-4 pb-4 border-t border-border pt-4 animate-in slide-in-from-top-1 duration-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <h4 className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">AI Analysis Summary</h4>
                                            <p className="text-sm text-gray-300 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5">
                                                {analysis?.summary || "No summary available for this hand."}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {hand.tags.map((t, i) => (
                                                    <span key={i} className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded border border-gold/20 flex items-center gap-1">
                                                        <Tag className="w-2.5 h-2.5" /> {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <h4 className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">Quick Result</h4>
                                            <div className="flex items-center gap-4">
                                                <div className="bg-black/40 rounded-xl p-3 border border-border flex-1">
                                                    <span className="text-[10px] text-gray-500 block mb-1">Final Pot</span>
                                                    <span className="text-lg font-bold text-gold">{parsed?.pot || 0} BB</span>
                                                </div>
                                                <div className="bg-black/40 rounded-xl p-3 border border-border flex-1">
                                                    <span className="text-[10px] text-gray-500 block mb-1">Winner</span>
                                                    <span className="text-sm font-bold text-emerald-400 truncate block">
                                                        {parsed?.winner ? `🏆 ${parsed.winner}` : "Unknown"}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.href = `/analyzer?handId=${hand.id}`;
                                                    }}
                                                    className="flex-1 py-2 bg-felt-default hover:bg-felt-dark text-white text-xs font-bold rounded-lg transition-colors border border-white/10"
                                                >
                                                    Open in Full Analyzer
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteHand(hand.id);
                                                    }}
                                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg transition-all border border-red-500/10"
                                                    title="Delete Hand"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
