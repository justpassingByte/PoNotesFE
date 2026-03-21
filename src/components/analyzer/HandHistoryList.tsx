"use client";

import { useState, useEffect } from "react";
import { Clock, Search, Tag, ChevronRight, Sparkles, Trophy, Calendar } from "lucide-react";
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
    const [selectedHand, setSelectedHand] = useState<string | null>(null);

    useEffect(() => {
        fetchHands();
    }, []);

    async function fetchHands() {
        setLoading(true);
        try {
            const params = new URLSearchParams({ 
                userId: "00000000-0000-0000-0000-000000000001", 
                limit: "20" 
            });
            if (searchTag) params.set("tag", searchTag);
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

    if (loading) {
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

    if (hands.length === 0) {
        return (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-400">No Hands Analyzed Yet</h3>
                <p className="text-sm text-gray-600 mt-1">
                    Go to the <a href="/analyzer" className="text-gold hover:underline">Hand Analyzer</a> to analyze your first hand.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={searchTag}
                        onChange={(e) => setSearchTag(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fetchHands()}
                        placeholder="Search by tag..."
                        className="w-full bg-black/40 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gold/50"
                    />
                </div>
            </div>

            {/* Hand Cards */}
            {hands.map((hand) => {
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
                                            {new Date(hand.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {parsed?.pot && (
                                    <span className="text-xs text-gold font-mono">{parsed.pot} BB</span>
                                )}
                                {heroCount > 0 && (
                                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                                        {heroCount} mistake{heroCount > 1 ? "s" : ""}
                                    </span>
                                )}
                                {villainCount > 0 && (
                                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                                        {villainCount} leak{villainCount > 1 ? "s" : ""}
                                    </span>
                                )}
                                {hand.tags.length > 0 && (
                                    <div className="flex gap-1">
                                        {hand.tags.slice(0, 2).map((t, i) => (
                                            <span key={i} className="text-[10px] bg-felt-default/30 text-green-300 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                <Tag className="w-2.5 h-2.5" /> {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                            </div>
                        </div>

                        {/* Expanded Detail */}
                        {isOpen && analysis?.summary && (
                            <div className="px-4 pb-4 border-t border-border pt-3">
                                <p className="text-sm text-gray-300 leading-relaxed">{analysis.summary}</p>
                                {parsed?.winner && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                                        <Trophy className="w-3.5 h-3.5" /> Winner: {parsed.winner}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
