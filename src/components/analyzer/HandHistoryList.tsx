"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, Search, Tag, ChevronRight, Sparkles, Trophy, Calendar, Trash2, Image as ImageIcon, Loader2, FileText, AlertCircle } from "lucide-react";
import Tesseract from 'tesseract.js';
import { API, apiFetch, apiDelete } from "@/lib/api";

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
        players?: any[];
    };
    ai_analysis?: {
        mistakes?: {
            player: string;
            description: string;
            better_line?: string;
            severity?: string;
            street?: string;
        }[];
        summary?: string;
        exploit?: string;
    };
    system_logs?: {
        id: string;
        event_type: string;
        message: string;
        metadata?: any;
        created_at: string;
    }[];
}

// ─── Suit symbols ────────────────────────────────────────────────────────────
const SUIT_SYM: Record<string, string> = { h: "♥", d: "♦", c: "♣", s: "♠" };
function getSuit(card: string): string {
    if (!card || card === '??' || card.includes('?')) return '?';
    return card.slice(-1).toLowerCase();
}
function toDisplay(card: string) {
    if (!card || card === '??') return '??';
    if (card.endsWith('?')) return `${card.slice(0, -1).toUpperCase()}?`;
    const rank = card.slice(0, -1).toUpperCase();
    const suit = card.slice(-1).toLowerCase();
    return `${rank}${SUIT_SYM[suit] || suit}`;
}

// ─── CardBadge ───────────────────────────────────────────────────────────────
function CardBadge({ card, onClick }: { card: string; onClick?: () => void }) {
    const suit = getSuit(card);
    const isUnknown = !card || card === '??' || card.includes('?');
    const Tag = onClick ? "button" : "span";

    const displayStr = toDisplay(card);
    const displayRank = isUnknown ? '?' : displayStr.slice(0, -1);
    const displaySuit = isUnknown ? '?' : displayStr.slice(-1);
    const isRed = suit === 'h' || suit === 'd';

    return (
        <Tag
            onClick={onClick}
            className={`flex flex-col justify-between w-9 h-14 shrink-0 rounded-lg shadow-lg px-2 py-1.5 text-xs font-black leading-none transition-all
                ${isUnknown ? 'border-2 border-dashed border-gray-700 bg-black/40 text-gray-600' : 'border-2 border-gray-300 bg-white text-black'}
                ${onClick ? 'hover:-translate-y-1 hover:border-gold cursor-pointer' : ''}`}
        >
            {/* TOP RANK */}
            <div className={`text-left tracking-tighter ${isUnknown ? "text-gray-600" : isRed ? "text-red-600" : "text-black"}`}>
                {isUnknown ? '?' : displayRank}
            </div>

            {/* CENTER SUIT */}
            <div className={`text-center text-xl ${isUnknown ? "text-gray-600" : isRed ? "text-red-600" : "text-black"}`}>
                {isUnknown ? '?' : displaySuit}
            </div>
        </Tag>
    );
}

export function HandHistoryList() {
    const [hands, setHands] = useState<HandSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTag, setSearchTag] = useState("");
    const [gameType, setGameType] = useState("");
    const [minPot, setMinPot] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [selectedHand, setSelectedHand] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            if (playerName) params.set("playerName", playerName);

            const res = await apiFetch(`${API.handHistory}?${params.toString()}`);
            const json = await res.json();
            if (json.success && json.data && json.data.length > 0) {
                setHands(json.data);
            } else {
                throw new Error("Empty hand history or invalid response");
            }
        } catch (err: any) {
            console.warn("Using mock data. API fetch failed:", err?.message || err);
            // INJECT MOCK HAND FOR UI DEMO WHEN DB IS EMPTY OR BACKEND IS UNREACHABLE
            setHands([{
                id: "mock-demo-hand",
                hand_hash: "mock_hand_8888",
                input_type: "image",
                tags: ["Demo", "Preview"],
                created_at: new Date().toISOString(),
                parsed_data: {
                    hand_id: "PREVIEW HAND",
                    game_type: "NLHE",
                    board: ["9d", "3c", "6h", "4c", "Kc"],
                    pot: 1947,
                    winner: "TomDwan",
                    players: [{ name: "Isildur1", hole_cards: ["Ah", "As"] }, { name: "TomDwan" }]
                },
                ai_analysis: {
                    summary: "TURN | BTN vs BB check: Range = AQ, KQ, sets. Action = Bet. Sizing = 75%. Frequency = 70%.",
                    mistakes: [
                        {
                            player: "Isildur1",
                            description: "Overfolded river vs polarizing overbet. Needs to call with top 15% bluffcatchers.",
                            better_line: "Call with two pair+",
                            severity: "moderate",
                            street: "river"
                        }
                    ]
                },
                system_logs: [
                    { id: "log1", event_type: "OCR_SCAN", message: "Parsed snapshot with 98% confidence", created_at: new Date().toISOString() },
                    { id: "log2", event_type: "AI_LEARNING", message: "Adjusted TomDwan profile (LAG tendencies applied)", created_at: new Date().toISOString() }
                ]
            }]);
        } finally {
            setLoading(false);
        }
    }

    const deleteHand = async (handId: string) => {
        if (handId === "mock-demo-hand") {
            alert("This is a mock hand, it cannot be deleted.");
            return;
        }
        if (!confirm("Are you sure you want to delete this hand history?")) return;

        try {
            const res = await apiDelete(API.hand(handId));
            const json = await res.json();
            if (json.success) {
                alert("Hand deleted successfully");
                fetchHands();
            } else {
                alert("Delete failed: " + (json.error || "Unknown error"));
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
        setPlayerName("");
        setTimeout(fetchHands, 0);
    };

    const runOCR = async (source: File | Blob) => {
        setScanning(true);
        try {
            const worker = await Tesseract.createWorker('eng');
            const { data: { text } } = await worker.recognize(source);
            await worker.terminate();

            const firstLine = text.trim().split('\n')[0].trim();
            if (firstLine) {
                setPlayerName(firstLine);
            }
        } catch (error) {
            console.error('OCR Error:', error);
        } finally {
            setScanning(false);
        }
    };

    const handleOCRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await runOCR(file);
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                if (blob) await runOCR(blob);
                return;
            }
        }
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            onPaste={handlePaste}
                            placeholder={scanning ? "Scanning..." : "Player Name (or Paste Snapshot)"}
                            className={`w-full bg-black/40 border border-border rounded-lg pl-10 pr-10 py-2 text-sm text-gray-300 placeholder-gray-600 focus:ring-1 focus:ring-gold/50 ${scanning ? 'animate-pulse border-gold/40' : ''}`}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors"
                            title="OCR Scan Name"
                        >
                            {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleOCRUpload}
                            className="hidden"
                            accept="image/*"
                        />
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
                    const rawMistakes = Array.isArray(analysis?.mistakes) ? analysis.mistakes : [];

                    const mistakesByPlayer = rawMistakes.reduce((acc: Record<string, any[]>, m: any) => {
                        const pName = m.player || "Unknown";
                        if (!acc[pName]) acc[pName] = [];
                        acc[pName].push(m);
                        return acc;
                    }, {});

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
                                        <div className="flex items-center gap-2 mt-2">
                                            {parsed?.board && parsed.board.length > 0 && (
                                                <div className="flex gap-1.5 border-r border-white/10 pr-3 mr-1">
                                                    {parsed.board.map((c, i) => <CardBadge key={i} card={c} />)}
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
                                        {Object.entries(mistakesByPlayer).map(([pName, mArr]: any) => (
                                            <span key={pName} className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/10">
                                                {pName}: {mArr.length} Leak{mArr.length > 1 ? "s" : ""}
                                            </span>
                                        ))}
                                    </div>
                                    <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                                </div>
                            </div>

                            {/* Expanded Detail */}
                            {isOpen && (
                                <div className="px-5 pb-6 border-t border-border pt-5 animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">

                                        {/* ═══ LEFT: Timeline & Analysis (70%) ═══ */}
                                        <div className="lg:col-span-7 space-y-4">

                                            {/* 1. HAND TIMELINE */}
                                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-md p-4 flex flex-col gap-3 font-mono">
                                                <h4 className="text-[10px] uppercase font-black text-gray-400 tracking-widest flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-gold" />
                                                    Hand Timeline
                                                </h4>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {/* PRE-FLOP */}
                                                    <div className="bg-black/40 border border-white/5 rounded p-3 h-full flex flex-col">
                                                        <div className="text-yellow-500 font-bold text-[10px] mb-2 border-b border-gray-800 pb-1">
                                                            PRE-FLOP <span className="text-gray-500">({parsed?.pot ? (parsed.pot * 0.1).toFixed(1) : '7.5'} BB)</span>
                                                        </div>
                                                        <div className="space-y-1 text-xs flex-1">
                                                            <div className="flex justify-between items-center text-gray-400 hover:bg-white/5 px-1 py-0.5 rounded"><div className="flex items-center gap-2 w-32"><span className="w-8 font-bold">UTG</span><span className="text-gray-500 truncate text-[10px] uppercase">PhilIvey</span></div><span>Fold</span></div>
                                                            <div className="flex justify-between items-center text-gray-400 hover:bg-white/5 px-1 py-0.5 rounded"><div className="flex items-center gap-2 w-32"><span className="w-8 font-bold">MP</span><span className="text-gray-500 truncate text-[10px] uppercase">Durrrr</span></div><span>Fold</span></div>
                                                            <div className="flex justify-between items-center text-gray-300 hover:bg-white/5 px-1 py-0.5 rounded"><div className="flex items-center gap-2 w-32"><span className="w-8 font-bold">CO</span><span className="text-white truncate text-[10px] uppercase">TomDwan</span></div><span className="text-orange-400 font-bold">RAISE <span className="text-gray-500 font-normal">to 2.5 BB</span></span></div>
                                                            <div className="flex justify-between items-center text-gray-300 hover:bg-white/5 px-1 py-0.5 rounded"><div className="flex items-center gap-2 w-32"><span className="w-8 font-bold">BTN</span><span className="text-white truncate text-[10px] uppercase">PatrikA</span></div><span className="text-blue-400">CALL <span className="text-gray-500 font-normal">2.5 BB</span></span></div>
                                                            <div className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/30 px-1 py-0.5 rounded -mx-1 text-gray-200">
                                                                <div className="flex items-center gap-2 w-32"><span className="w-8 text-yellow-500 font-bold">BB</span><span className="text-yellow-500 truncate text-[10px] uppercase">Isildur1</span></div><span className="text-blue-400">CALL <span className="text-gray-500 font-normal">1.5 BB</span></span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* FLOP */}
                                                    <div className="bg-black/40 border border-white/5 rounded p-3 h-full flex flex-col">
                                                        <div className="flex justify-between items-center text-yellow-500 font-bold text-[10px] mb-3 border-b border-gray-800 pb-1">
                                                            <span>FLOP <span className="text-gray-500">({parsed?.pot ? (parsed.pot * 0.4).toFixed(1) : '11.5'} BB)</span></span>
                                                            <div className="flex gap-1.5 mt-1 relative -top-1">
                                                                {parsed?.board && parsed.board.length >= 3 ? parsed.board.slice(0, 3).map((c, i) => <CardBadge key={i} card={c} />) : <><CardBadge card="9d" /><CardBadge card="3c" /><CardBadge card="6h" /></>}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1 text-xs flex-1">
                                                            <div className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/30 px-1 py-0.5 rounded -mx-1 text-gray-200">
                                                                <div className="flex items-center gap-2 w-32"><span className="w-8 text-yellow-500 font-bold">BB</span><span className="text-yellow-500 truncate text-[10px] uppercase">Isildur1</span></div><span className="text-gray-400">CHECK</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-gray-300 hover:bg-white/5 px-1 py-0.5 rounded"><div className="flex items-center gap-2 w-32"><span className="w-8 font-bold">CO</span><span className="text-white truncate text-[10px] uppercase">TomDwan</span></div><span className="text-orange-400 font-bold">BET <span className="text-gray-500 font-normal">5.5 BB</span></span></div>
                                                            <div className="flex justify-between items-center text-gray-300 hover:bg-white/5 px-1 py-0.5 rounded"><div className="flex items-center gap-2 w-32"><span className="w-8 font-bold">BTN</span><span className="text-white truncate text-[10px] uppercase">PatrikA</span></div><span className="text-gray-500">FOLD</span></div>
                                                            <div className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/30 px-1 py-0.5 rounded -mx-1 text-gray-200">
                                                                <div className="flex items-center gap-2 w-32"><span className="w-8 text-yellow-500 font-bold">BB</span><span className="text-yellow-500 truncate text-[10px] uppercase">Isildur1</span></div><span className="text-blue-400">CALL <span className="text-gray-500 font-normal">5.5 BB</span></span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* TURN */}
                                                    <div className="bg-black/40 border border-white/5 rounded p-3 h-full flex flex-col">
                                                        <div className="flex justify-between items-center text-yellow-500 font-bold text-[10px] mb-3 border-b border-gray-800 pb-1">
                                                            <span>TURN <span className="text-gray-500">({parsed?.pot ? (parsed.pot * 0.7).toFixed(1) : '22.5'} BB)</span></span>
                                                            <div className="flex gap-1.5 mt-1 relative -top-1">
                                                                {parsed?.board && parsed.board.length >= 4 ? <CardBadge card={parsed.board[3]} /> : <CardBadge card="4c" />}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1 text-xs flex-1">
                                                            <div className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/30 px-1 py-0.5 rounded -mx-1 text-gray-200">
                                                                <div className="flex items-center gap-2 w-32"><span className="w-8 text-yellow-500 font-bold">BB</span><span className="text-yellow-500 truncate text-[10px] uppercase">Isildur1</span></div><span className="text-gray-400">CHECK</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-gray-300 hover:bg-white/5 px-1 py-0.5 rounded"><div className="flex items-center gap-2 w-32"><span className="w-8 font-bold">CO</span><span className="text-white truncate text-[10px] uppercase">TomDwan</span></div><span className="text-orange-400 font-bold">BET <span className="text-gray-500 font-normal">15 BB</span></span></div>
                                                            <div className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/30 px-1 py-0.5 rounded -mx-1 text-gray-200">
                                                                <div className="flex items-center gap-2 w-32"><span className="w-8 text-yellow-500 font-bold">BB</span><span className="text-yellow-500 truncate text-[10px] uppercase">Isildur1</span></div><span className="text-blue-400">CALL <span className="text-gray-500 font-normal">15 BB</span></span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* RIVER */}
                                                    <div className="bg-black/40 border border-white/5 rounded p-3 h-full flex flex-col">
                                                        <div className="flex justify-between items-center text-yellow-500 font-bold text-[10px] mb-3 border-b border-gray-800 pb-1">
                                                            <span>RIVER <span className="text-gray-500">({parsed?.pot || '1947'} BB)</span></span>
                                                            <div className="flex gap-1.5 mt-1 relative -top-1">
                                                                {parsed?.board && parsed.board.length >= 5 ? <CardBadge card={parsed.board[4]} /> : <CardBadge card="Kc" />}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1 text-xs flex-1">
                                                            <div className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/30 px-1 py-0.5 rounded -mx-1 text-gray-200">
                                                                <div className="flex items-center gap-2 w-32"><span className="w-8 text-yellow-500 font-bold">BB</span><span className="text-yellow-500 truncate text-[10px] uppercase">Isildur1</span></div><span className="text-gray-400">CHECK</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-gray-300 hover:bg-white/5 px-1 py-0.5 rounded"><div className="flex items-center gap-2 w-32"><span className="w-8 font-bold">CO</span><span className="text-white truncate text-[10px] uppercase">TomDwan</span></div><span className="text-red-500 font-bold">ALL-IN <span className="text-gray-500 font-normal">1128 BB</span></span></div>
                                                            <div className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/30 px-1 py-0.5 rounded -mx-1 text-gray-200">
                                                                <div className="flex items-center gap-2 w-32"><span className="w-8 text-yellow-500 font-bold">BB</span><span className="text-yellow-500 truncate text-[10px] uppercase">Isildur1</span></div><span className="text-gray-500">FOLD</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 2. AI ANALYSIS */}
                                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-md p-4 space-y-4">
                                                <h4 className="text-[10px] uppercase font-black text-gray-400 tracking-widest flex items-center gap-2">
                                                    <Sparkles className="w-3 h-3 text-purple-400" />
                                                    AI Analysis
                                                </h4>

                                                {/* Strategy Main */}
                                                <div>
                                                    <div className="text-[10px] font-bold text-blue-400 uppercase flex items-center gap-1.5 mb-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                                                        Strategy (Main)
                                                    </div>
                                                    <div className="bg-black/40 border border-white/5 p-3 rounded text-xs text-gray-300 font-mono leading-relaxed">
                                                        {analysis?.summary ? (
                                                            <div className="whitespace-pre-line">{analysis.summary}</div>
                                                        ) : (
                                                            <ul className="space-y-1">
                                                                <li className="text-yellow-500 font-bold mb-1">TURN | BTN vs BB check:</li>
                                                                <li className="flex gap-2"><span className="text-gray-500 w-20">• Range</span><span>AQ, KQ, sets</span></li>
                                                                <li className="flex gap-2"><span className="text-gray-500 w-20">• Action</span><span>Bet</span></li>
                                                                <li className="flex gap-2"><span className="text-gray-500 w-20">• Sizing</span><span>75%</span></li>
                                                                <li className="flex gap-2"><span className="text-gray-500 w-20">• Frequency</span><span>70%</span></li>
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Exploit */}
                                                <div>
                                                    <div className="text-[10px] font-bold text-purple-400 uppercase flex items-center gap-1.5 mb-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
                                                        Exploit
                                                    </div>
                                                    <div className="bg-black/40 border border-white/5 p-3 rounded text-xs text-gray-300 font-mono leading-relaxed">
                                                        {analysis?.exploit ? analysis.exploit : (
                                                            <>
                                                                • Opponents overfold vs turn aggression<br />
                                                                <span className="text-purple-400">→ Increase bluff frequency (A5s, KJs)</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Leaks / Mistakes grouped by player */}
                                                {Object.keys(mistakesByPlayer).length > 0 ? (
                                                    Object.entries(mistakesByPlayer).map(([pName, mArr]: any) => (
                                                        <div key={pName} className="mt-4">
                                                            <div className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1.5 mb-1.5">
                                                                <AlertCircle className="w-3 h-3 text-red-500" />
                                                                {pName} Leak{mArr.length > 1 ? "s" : ""}
                                                            </div>
                                                            <div className="space-y-2">
                                                                {mArr.map((mistake: any, idx: number) => (
                                                                    <div key={idx} className="bg-black/40 border border-red-500/20 p-3 rounded text-xs text-gray-300 font-mono leading-relaxed">
                                                                        <span className="text-gray-500">• Error:</span><br />
                                                                        {mistake.description}<br /><br />
                                                                        <span className="text-gray-500">• Fix / Exploit:</span><br />
                                                                        <span className="text-green-400 font-bold">{mistake.better_line || "Play more optimally"}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div>
                                                        <div className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-1.5 mb-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                                            Flawless Play
                                                        </div>
                                                        <div className="bg-black/40 border border-green-500/20 p-3 rounded text-xs text-green-400 font-mono">
                                                            No significant errors detected in this hand. Well played by all.
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 3. COLLAPSIBLE SYSTEM LOGS */}
                                            {hand.system_logs && hand.system_logs.length > 0 && (
                                                <details className="group">
                                                    <summary className="cursor-pointer text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors list-none flex items-center gap-2 select-none">
                                                        <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                                                        System Logs
                                                    </summary>
                                                    <div className="bg-black/40 rounded-md p-3 border border-white/5 overflow-hidden ml-5 mt-2">
                                                        <div className="space-y-1.5 font-mono text-[10px]">
                                                            {hand.system_logs.map((log) => (
                                                                <div key={log.id} className="flex gap-2 text-gray-400">
                                                                    <span className="text-gray-600 flex-shrink-0">[{new Date(log.created_at).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}]</span>
                                                                    <div className="flex-1">
                                                                        <span className="text-gray-500 uppercase">{log.event_type}:</span>{' '}
                                                                        <span>{log.message}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </details>
                                            )}
                                        </div>

                                        {/* ═══ RIGHT: Quick Stats & Actions (30%) ═══ */}
                                        <div className="lg:col-span-3 space-y-4">

                                            {/* SUMMARY BOX */}
                                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-md p-4 space-y-4">
                                                <h4 className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Summary</h4>

                                                <div>
                                                    <span className="text-[10px] text-gray-500 block mb-0.5 uppercase tracking-tighter">Final Pot</span>
                                                    <span className="text-xl font-bold text-gold">{parsed?.pot || 1947} <span className="text-xs text-amber-700">BB</span></span>
                                                </div>
                                                <div className="h-[1px] bg-white/5"></div>
                                                <div>
                                                    <span className="text-[10px] text-gray-500 block mb-0.5 uppercase tracking-tighter">Winner</span>
                                                    <span className="text-sm font-bold text-emerald-400 truncate block">
                                                        {parsed?.winner ? `🏆 ${parsed.winner}` : "🏆 PlayerX"}
                                                    </span>
                                                </div>
                                                <div className="h-[1px] bg-white/5"></div>
                                                
                                                <div>
                                                    <span className="text-[10px] text-gray-500 block mb-1 uppercase tracking-tighter">Results</span>
                                                    <div className="flex justify-between items-center bg-black/40 px-2 py-1.5 rounded border border-white/5 mb-1">
                                                        <span className="text-xs text-gray-300">TomDwan</span>
                                                        <span className="text-xs font-bold text-emerald-400 font-mono">+818 BB</span>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-black/40 px-2 py-1.5 rounded border border-white/5">
                                                        <span className="text-xs text-gray-300">Isildur1</span>
                                                        <span className="text-xs font-bold text-red-400 font-mono">-818 BB</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* EXPLOIT QUICK VIEW */}
                                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-md p-4">
                                                <h4 className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-3 flex items-center gap-2">
                                                    <Tag className="w-3 h-3 text-purple-400" />
                                                    Exploit Quick View
                                                </h4>
                                                <div className="space-y-3">
                                                    <div className="text-xs">
                                                        <span className="text-gray-500">Target Player: </span>
                                                        <span className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded ml-1">TomDwan</span>
                                                    </div>
                                                    <div className="text-xs text-gray-300">
                                                        <span className="text-gray-500 block mb-1">Exploit:</span>
                                                        <ul className="space-y-1.5 pl-3 border-l-2 border-purple-500/50">
                                                            <li>Trap more preflop</li>
                                                            <li>Call wider vs XR</li>
                                                            <li>Overbet river thin value</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CTA */}
                                            <div className="flex flex-col gap-2 pt-2">

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteHand(hand.id);
                                                    }}
                                                    className="w-full py-2 bg-transparent hover:bg-white/5 text-gray-500 hover:text-red-400 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-2 mt-2"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Erase History
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
