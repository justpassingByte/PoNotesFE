"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Loader2, ImageIcon, Sparkles, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { API } from "@/lib/api";
import { createNote } from "@/app/actions";

// ─── Types ───────────────────────────────────────────────────────────────────
interface HandAction {
    player: string;
    action: string;
    amount?: number;
    position?: string;
}

interface ParsedHandData {
    hand_id?: string;
    game_type?: string;
    board: string[];
    players: { name: string; position?: string; stack?: number; hole_cards?: string[] }[];
    actions: {
        preflop: HandAction[];
        flop: HandAction[];
        turn: HandAction[];
        river: HandAction[];
    };
    pot?: number;
    winner?: string;
}

interface Hand {
    id?: string;
    hand_hash?: string;
    input_type?: string;
    parsed_data?: ParsedHandData;
}

interface OCRResult {
    confidence: number;
    decision: 'auto_accept' | 'confirm' | 'force_correct';
    decision_reason: string[];
    needs_confirmation?: boolean;
}

interface HandAnalysis {
    summary?: string;
    reasoning_trace: string[];
    mistakes: { 
        street: string; 
        player: string; 
        description: string; 
        better_line?: string;
        gto_deviation_reason?: string;
        severity?: string;
    }[];
    exploit_suggestions: string[];
    final_verdict?: {
        grade: string;
        confidence_score?: number;
        suggestion_type?: 'GTO' | 'Exploit' | 'Balanced';
    };
}

// ─── Card Rendering Helpers ──────────────────────────────────────────────────
const SUIT_SYMBOLS: Record<string, string> = { h: "♥", d: "♦", c: "♣", s: "♠" };
const SUIT_COLORS: Record<string, string> = {
    h: "text-red-500", d: "text-blue-400", c: "text-green-400", s: "text-white"
};

function CardChip({ card }: { card: string }) {
    const rank = card.slice(0, -1).toUpperCase();
    const suit = card.slice(-1).toLowerCase();
    return (
        <span className={`inline-flex items-center gap-0.5 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-sm font-mono font-bold ${SUIT_COLORS[suit] || "text-white"}`}>
            {rank}{SUIT_SYMBOLS[suit] || suit}
        </span>
    );
}

// ─── Action Badge ────────────────────────────────────────────────────────────
const ACTION_STYLES: Record<string, string> = {
    fold: "bg-gray-600/60 text-gray-300",
    call: "bg-emerald-600/40 text-emerald-300 border border-emerald-500/30",
    raise: "bg-amber-600/40 text-amber-300 border border-amber-500/30",
    bet: "bg-orange-600/40 text-orange-300 border border-orange-500/30",
    check: "bg-slate-600/40 text-slate-300",
    "all-in": "bg-red-600/50 text-red-300 border border-red-500/40 font-bold",
};

function ActionBadge({ action }: { action: HandAction }) {
    const style = ACTION_STYLES[action.action] || "bg-gray-500/40 text-gray-300";
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 w-28 truncate">{action.player}</span>
            <span className={`px-2 py-0.5 rounded text-xs uppercase ${style}`}>
                {action.action}
            </span>
            {action.amount != null && (
                <span className="text-gold font-mono text-xs">{action.amount} BB</span>
            )}
        </div>
    );
}

// ─── Severity Badge ──────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity?: string }) {
    const map: Record<string, { color: string; label: string }> = {
        critical: { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Critical" },
        moderate: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "Moderate" },
        minor: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Minor" },
    };
    const s = map[severity || "minor"] || map.minor;
    return (
        <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${s.color}`}>
            {s.label}
        </span>
    );
}

// ─── Phase 4.2: Premium Card Picker ──────────────────────────────────────────
const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUITS = ["h", "d", "c", "s"];

function CardPicker({ onSelect, onCancel, currentVal }: { onSelect: (val: string) => void, onCancel: () => void, currentVal?: string }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a1a] border border-gold/20 rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-gold" />
                        Select Card
                    </h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-6">
                    {SUITS.map(s => (
                        <button
                            key={s}
                            onClick={() => {}} // Suits are selected via common grid
                            className={`h-12 flex items-center justify-center rounded-xl text-2xl border ${SUIT_COLORS[s]} bg-white/5 border-white/5`}
                        >
                            {SUIT_SYMBOLS[s]}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {RANKS.flatMap(r => SUITS.map(s => {
                        const val = `${r}${s}`;
                        const isCurrent = currentVal === val;
                        return (
                            <button
                                key={val}
                                onClick={() => onSelect(val)}
                                className={`h-10 rounded border text-xs font-bold transition-all flex items-center justify-center gap-1
                                    ${isCurrent ? 'bg-gold text-black border-gold shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-white/5 border-white/10 text-gray-400 hover:border-gold/50 hover:text-white'}`}
                            >
                                {r}{SUIT_SYMBOLS[s]}
                            </button>
                        );
                    }))}
                </div>
            </div>
        </div>
    );
}

// ─── OCR Feedback Components ──────────────────────────────────────────────────
function OCRConfidenceBadge({ score }: { score: number }) {
    let color = "text-red-400 bg-red-500/10 border-red-500/20";
    if (score >= 0.9) color = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    else if (score >= 0.7) color = "text-amber-400 bg-amber-500/10 border-amber-500/20";

    return (
        <div className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${color}`}>
            OCP: {(score * 100).toFixed(0)}%
        </div>
    );
}

// ─── Save Note Button ────────────────────────────────────────────────────────
function SaveNoteButton({ noteData, isAutosaved }: { noteData: any; isAutosaved?: boolean }) {
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(isAutosaved || false);

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSaving(true);
        try {
            await createNote(noteData);
            setSaved(true);
        } catch (err) {
            alert("Failed to save note");
        } finally {
            setIsSaving(false);
        }
    };

    if (saved) return <span className="text-[10px] text-emerald-400 font-medium whitespace-nowrap">✓ Saved to Player</span>;

    return (
        <button
            onClick={handleSave}
            disabled={isSaving}
            className="text-[10px] bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-2 py-1 rounded border border-white/10 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
            {isSaving ? "Saving..." : "Save as Note"}
        </button>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function HandAnalyzer() {
    const [inputType, setInputType] = useState<"text" | "image">("image");
    const [textInput, setTextInput] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isPasting, setIsPasting] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [parsedHand, setParsedHand] = useState<Hand | null>(null);
    const [analysis, setAnalysis] = useState<HandAnalysis | null>(null);
    const [fromCache, setFromCache] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Phase 4 UI state
    const [editingCard, setEditingCard] = useState<{ type: 'board' | 'hole', index: number, pIdx?: number } | null>(null);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // clipboard paste support
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                    const blob = items[i].getAsFile();
                    if (!blob) continue;

                    const reader = new FileReader();
                    reader.onload = (event) => {
                        setImagePreview(event.target?.result as string);
                        setInputType("image");
                    };
                    reader.readAsDataURL(blob);
                    break;
                }
            }
        };

        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleParse = async () => {
        setError(null);
        setIsParsing(true);
        setAnalysis(null);
        try {
            const rawInput = inputType === "text" ? textInput : (imagePreview || "");
            if (!rawInput) {
                setError("Please provide a hand to parse.");
                return;
            }

            const res = await fetch(`${API.handAnalyze}/parse`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rawInput, inputType }),
            });

            const json = await res.json();
            if (!json.success) {
                // If quota exceeded, include reset date in error message
                const resetInfo = json.usage?.resetsAt 
                    ? ` · Resets ${new Date(json.usage.resetsAt).toLocaleDateString()}` 
                    : '';
                throw new Error((json.error || "Parsing failed") + resetInfo);
            }

            setParsedHand(json.data.hand || null);
            setFromCache(json.data.fromCache || false);
            setIsReviewing(true);
        } catch (err: any) {
            setError(err.message || "Something went wrong during parsing");
        } finally {
            setIsParsing(false);
        }
    };

    const handleRunAnalysis = async () => {
        if (!parsedHand) return;
        setError(null);
        setIsAnalyzing(true);
        try {
            const res = await fetch(`${API.handAnalyze}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    handId: parsedHand.id,
                    parsedData: parsedHand.parsed_data 
                }),
            });

            const json = await res.json();
            if (!json.success) {
                const resetInfo = json.usage?.resetsAt 
                    ? ` · Resets ${new Date(json.usage.resetsAt).toLocaleDateString()}` 
                    : '';
                throw new Error((json.error || "Analysis failed") + resetInfo);
            }

            setAnalysis(json.data.analysis);
            setIsReviewing(false);
        } catch (err: any) {
            setError(err.message || "AI Analysis failed");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handData = (parsedHand?.parsed_data as any) || parsedHand;

    // ── Logic Helpers ────────────────────────────────────────────────────────
    async function handleFeedback(action: 'confirm' | 'edit' | 'reject', corrected?: { name: string, revised: string }) {
        setIsSubmittingFeedback(true);
        try {
            // Forward to backend which forwards to OCR service
            await fetch(`${API.base}/api/ocr/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageHex: imagePreview, // ideally this would be the crop, but passing preview for now
                    cardName: corrected?.name || 'all_board', 
                    action: action,
                    correctedName: corrected?.revised || ''
                })
            });
            if (action === 'confirm') {
                // visually mark as confirmed
                setParsedHand({ 
                    ...parsedHand!, 
                    parsed_data: { 
                        ...handData, 
                        ocr_result: { ...handData.ocr_result, decision: 'auto_accept' } 
                    } 
                });
            }
        } catch (err) {
            console.error("Feedback failed:", err);
        } finally {
            setIsSubmittingFeedback(false);
        }
    }

    function handleCardEdit(newVal: string) {
        if (!editingCard || !parsedHand) return;

        if (editingCard.type === 'board') {
            const newBoard = [...handData.board];
            const oldName = newBoard[editingCard.index];
            newBoard[editingCard.index] = newVal;
            setParsedHand({ ...parsedHand, parsed_data: { ...handData, board: newBoard } });
            handleFeedback('edit', { name: oldName, revised: newVal });
        } else {
            const newPlayers = [...handData.players];
            const p = newPlayers[editingCard.pIdx!];
            const newCards = [...(p.hole_cards || [])];
            const oldName = newCards[editingCard.index];
            newCards[editingCard.index] = newVal;
            newPlayers[editingCard.pIdx!] = { ...p, hole_cards: newCards };
            setParsedHand({ ...parsedHand, parsed_data: { ...handData, players: newPlayers } });
            handleFeedback('edit', { name: oldName, revised: newVal });
        }
    }

    return (
        <div className="space-y-6 text-foreground">
            {/* ── Input Section ── */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-gold" />
                        Hand Input
                    </h2>
                    <div className="flex bg-black/40 rounded-lg p-0.5 border border-border">
                        <button
                            onClick={() => setInputType("text")}
                            className={`px-3 py-1.5 rounded-md text-sm transition-all ${inputType === "text"
                                ? "bg-felt-default text-white shadow"
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            <FileText className="w-4 h-4 inline mr-1" /> Text
                        </button>
                        <button
                            onClick={() => setInputType("image")}
                            className={`px-3 py-1.5 rounded-md text-sm transition-all ${inputType === "image"
                                ? "bg-felt-default text-white shadow"
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            <ImageIcon className="w-4 h-4 inline mr-1" /> Screenshot
                        </button>
                    </div>
                </div>

                {inputType === "text" ? (
                    <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder={`Paste your hand history here...\n\nExample:\nPokerStars Hand #123456789\nTable 'Nova' 6-max Seat #2 is the button\n...`}
                        className="w-full h-40 bg-black/40 border border-border rounded-lg p-4 text-sm text-gray-300 placeholder-gray-600 font-mono resize-none focus:outline-none focus:ring-1 focus:ring-gold/50"
                    />
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-40 bg-black/40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gold/40 transition-colors group"
                    >
                        {imagePreview ? (
                            <div className="relative group">
                                <img src={imagePreview} alt="Hand screenshot" className="max-h-36 rounded shadow-lg border border-white/10" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">Change Image</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-2xl bg-gold/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6 text-gold/60" />
                                </div>
                                <p className="text-sm text-gray-400 font-medium">Click, Drag, or <span className="text-gold">Paste (Ctrl+V)</span></p>
                                <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-tighter">Support standard poker client screenshots</p>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>
                )}

                <button
                    onClick={handleParse}
                    disabled={isParsing || isAnalyzing}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold/90 to-amber-600 hover:from-gold hover:to-amber-500 text-black font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold/10"
                >
                    {isParsing ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Extracting Data...</>
                    ) : (
                        <><Sparkles className="w-5 h-5" /> {isReviewing ? "Update & Re-Parse" : "Parse Hand"}</>
                    )}
                </button>

                {error && (
                    <div className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                    </div>
                )}
            </div>

            {/* ── Parsed Hand & Review Section ── */}
            {handData && handData.board && (
                <div className="bg-card border border-border rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-semibold text-white">Parsed Hand</h2>
                            <div className="flex items-center gap-1.5 bg-gold/10 border border-gold/20 px-3 py-1 rounded-full">
                                <Sparkles className="w-3.5 h-3.5 text-gold" />
                                <span className="text-[11px] text-gold font-bold uppercase tracking-wider">Review Mode</span>
                            </div>
                        </div>
                        {fromCache && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                                ⚡ Instant Cache Hit
                            </span>
                        )}
                    </div>

                    {/* Phase 4.1: OCR Decision Banner */}
                    {handData.ocr_result && (
                        <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between
                            ${handData.ocr_result.decision === 'auto_accept' 
                                ? 'bg-emerald-500/5 border-emerald-500/20' 
                                : handData.ocr_result.decision === 'confirm'
                                ? 'bg-amber-500/5 border-amber-500/20'
                                : 'bg-red-500/5 border-red-500/20'}`}>
                            <div className="flex items-center gap-4">
                                <OCRConfidenceBadge score={handData.ocr_result.confidence} />
                                <div>
                                    <p className="text-sm font-bold text-white capitalize">
                                        {handData.ocr_result.decision.replace('_', ' ')}
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                        {handData.ocr_result.decision_reason.join(' · ')}
                                    </p>
                                </div>
                            </div>
                            {handData.ocr_result.decision !== 'auto_accept' && (
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleFeedback('confirm')}
                                        disabled={isSubmittingFeedback}
                                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all"
                                    >
                                        Confirm Detection
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Board & Pot */}
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Community Cards (Click to edit)</span>
                                <div className="flex gap-1.5 flex-wrap">
                                    {handData.board.length > 0 ? (
                                        handData.board.map((c: string, i: number) => (
                                            <button 
                                                key={i} 
                                                onClick={() => setEditingCard({ type: 'board', index: i })}
                                            >
                                                <CardChip card={c} />
                                            </button>
                                        ))
                                    ) : (
                                        <button 
                                            onClick={() => setEditingCard({ type: 'board', index: 0 })}
                                            className="text-gold text-xs border border-gold/30 px-2 py-1 rounded bg-gold/5 hover:bg-gold/10 transition-colors"
                                        >
                                            + Add Board
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Total Pot</span>
                                <input 
                                    type="number"
                                    value={handData.pot || 0}
                                    onChange={(e) => setParsedHand({ ...parsedHand!, parsed_data: { ...handData, pot: parseFloat(e.target.value) } })}
                                    className="bg-transparent text-xl font-bold text-gold flex items-baseline gap-1 border-none focus:ring-0 w-24 p-0"
                                />
                                {handData.winner && (
                                    <div className="mt-1 flex items-center gap-1.5 text-xs">
                                        <span className="text-gray-400">Winner:</span>
                                        <input 
                                            value={handData.winner}
                                            onChange={(e) => setParsedHand({ ...parsedHand!, parsed_data: { ...handData, winner: e.target.value } })}
                                            className="bg-transparent text-emerald-400 font-medium border-none focus:ring-0 p-0 text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Players */}
                        <div className="lg:col-span-2">
                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Detected Players (Edit names if wrong)</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                                {handData.players?.map((p: any, i: number) => (
                                    <div key={i} className="bg-black/30 rounded-lg px-3 py-2 border border-white/5 flex items-center justify-between group hover:border-gold/30 transition-colors">
                                        <div className="flex-1">
                                            <input 
                                                value={p.name}
                                                onChange={(e) => {
                                                    const newPlayers = [...handData.players];
                                                    newPlayers[i] = { ...p, name: e.target.value };
                                                    setParsedHand({ ...parsedHand!, parsed_data: { ...handData, players: newPlayers } });
                                                }}
                                                className="bg-transparent text-white text-sm font-medium border-none focus:ring-0 p-0 w-full"
                                            />
                                            {p.position && (
                                                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1 py-0.5 rounded uppercase font-bold">{p.position}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 ml-2">
                                            {p.hole_cards?.map((c: string, j: number) => (
                                                <button 
                                                    key={j}
                                                    onClick={() => setEditingCard({ type: 'hole', index: j, pIdx: i })}
                                                >
                                                    <CardChip card={c} />
                                                </button>
                                            ))}
                                            {p.stack != null && (
                                                <div className="flex items-center gap-0.5">
                                                    <input 
                                                        type="number"
                                                        value={p.stack}
                                                        onChange={(e) => {
                                                            const newPlayers = [...handData.players];
                                                            newPlayers[i] = { ...p, stack: parseFloat(e.target.value) };
                                                            setParsedHand({ ...parsedHand!, parsed_data: { ...handData, players: newPlayers } });
                                                        }}
                                                        className="bg-transparent text-gold text-xs font-mono font-bold border-none focus:ring-0 p-0 w-12 text-right"
                                                    />
                                                    <span className="text-[10px] text-amber-700 font-bold">BB</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actions by Street */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {(["preflop", "flop", "turn", "river"] as const).map((street) => {
                            const actions = handData.actions?.[street];
                            if (!actions || actions.length === 0) return null;
                            return (
                                <div key={street} className="bg-black/20 rounded-xl p-4 border border-white/5 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] text-gold uppercase font-bold tracking-widest">{street}</span>
                                        <span className="text-[10px] text-gray-600">{actions.length} Actions</span>
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        {actions.map((a: any, i: number) => <ActionBadge key={i} action={a} />)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Final Analysis Button */}
                    <div className="flex flex-col items-center pt-6 border-t border-white/5">
                        <button
                            onClick={handleRunAnalysis}
                            disabled={isAnalyzing}
                            className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-3 disabled:opacity-50"
                        >
                            {isAnalyzing ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> AI Analyzing Tactics...</>
                            ) : (
                                <><Sparkles className="w-5 h-5" /> Run AI Leak Analysis</>
                            )}
                        </button>
                        <p className="mt-3 text-xs text-gray-500">Review data above for 100% accuracy before AI analysis.</p>
                    </div>
                </div>
            )}

            {/* ── AI Analysis Results ── */}
            {analysis && (
                <div className="space-y-6 animate-in zoom-in-95 duration-500 pb-12">
                    <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent my-4" />
                    
                    {/* Summary & Reasoning Trace */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-gradient-to-br from-card to-felt-dark/30 border border-gold/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Sparkles className="w-24 h-24 text-gold" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-gold" />
                                </div>
                                Strategic Summary
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed sm:text-base">{analysis.summary}</p>
                            
                            {analysis.final_verdict && (
                                <div className="mt-6 flex items-center gap-4 border-t border-white/5 pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-500 uppercase font-black">Grade</span>
                                        <span className="text-2xl font-black text-gold">{analysis.final_verdict.grade}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-500 uppercase font-black">Confidence</span>
                                        <span className="text-lg font-bold text-white">{((analysis.final_verdict.confidence_score || 0) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-500 uppercase font-black">Strategy Type</span>
                                        <span className={`text-[11px] font-black px-2 py-0.5 rounded uppercase ${
                                            analysis.final_verdict.suggestion_type === 'Exploit' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'
                                        }`}>
                                            {analysis.final_verdict.suggestion_type}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 text-gold/60" />
                                Reasoning Trace
                            </h3>
                            <div className="space-y-3">
                                {analysis.reasoning_trace?.map((step, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gold/40 mt-1.5" />
                                            {i < analysis.reasoning_trace.length - 1 && <div className="w-px h-full bg-white/5 my-1" />}
                                        </div>
                                        <p className="text-[11px] text-gray-400 leading-snug">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Mistakes Array Mapping */}
                        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: "Hero Tactical Errors", filter: "Hero", color: "red", icon: <XCircle className="w-4 h-4" /> },
                                { title: "Villain Detected Leaks", filter: "others", color: "amber", icon: <AlertTriangle className="w-4 h-4" /> }
                            ].map((group) => {
                                const items = analysis.mistakes?.filter(m => {
                                    const isHero = m.player?.toLowerCase() === 'hero';
                                    return group.filter === 'Hero' ? isHero : !isHero;
                                }) || [];

                                return (
                                    <div key={group.title} className={`bg-card border border-${group.color}-500/20 rounded-2xl p-6 shadow-xl`}>
                                        <h3 className={`text-lg font-bold text-${group.color}-400 mb-5 flex items-center gap-3`}>
                                            <div className={`w-8 h-8 rounded-lg bg-${group.color}-500/10 flex items-center justify-center`}>
                                                {group.icon}
                                            </div>
                                            {group.title} ({items.length})
                                        </h3>
                                        <div className="space-y-4">
                                            {items.length > 0 ? (
                                                items.map((m, i) => {
                                                    // Normalize street to TitleCase for Note API validation
                                                    const rawStreet = m.street?.toLowerCase() || 'postflop';
                                                    const normalizedStreet = rawStreet.charAt(0).toUpperCase() + rawStreet.slice(1);
                                                    
                                                    return (
                                                        <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 transition-all hover:bg-white/[0.04] group/item">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] text-gold uppercase font-black bg-gold/10 px-2 py-0.5 rounded tracking-tighter">{m.street}</span>
                                                                    <SeverityBadge severity={m.severity} />
                                                                    {m.player?.toLowerCase() !== 'hero' && (
                                                                        <span className="text-sm text-white font-bold">— {m.player}</span>
                                                                    )}
                                                                </div>
                                                                <SaveNoteButton
                                                                    isAutosaved={m.player?.toLowerCase() !== 'hero'}
                                                                    noteData={{
                                                                        player_name: m.player, 
                                                                        content: m.description,
                                                                        street: normalizedStreet,
                                                                        note_type: "Custom",
                                                                        source: "ai",
                                                                        hand_id: parsedHand?.id
                                                                    }}
                                                                />
                                                            </div>
                                                        <p className="text-sm text-gray-300 leading-snug">{m.description}</p>
                                                        {m.better_line && (
                                                            <div className="mt-3 text-[11px] bg-emerald-500/5 border border-emerald-500/10 p-2 rounded">
                                                                <span className="text-emerald-400 font-bold uppercase tracking-tighter mr-2">Better Line:</span>
                                                                <span className="text-gray-400 italic">{m.better_line}</span>
                                                            </div>
                                                        )}
                                                        {m.gto_deviation_reason && (
                                                            <div className="mt-2 text-[10px] text-purple-400/80 italic leading-tight">
                                                                💡 {m.gto_deviation_reason}
                                                            </div>
                                                        )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-6 text-gray-500 italic text-sm">No significant data points for this category.</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Exploit Suggestions */}
                    {analysis.exploit_suggestions?.length > 0 && (
                        <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6 shadow-xl group">
                            <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-4 h-4 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                </div>
                                Strategic Exploit Plan
                            </h3>
                            <div className="space-y-2">
                                {analysis.exploit_suggestions.map((s, i) => (
                                    <p key={i} className="text-sm text-gray-300 leading-relaxed sm:text-base">• {s}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Premium Card Picker Overlay */}
            {editingCard && (
                <CardPicker 
                    currentVal={
                        editingCard.type === 'board' 
                            ? handData.board[editingCard.index] 
                            : handData.players[editingCard.pIdx!].hole_cards![editingCard.index]
                    }
                    onSelect={(val) => {
                        handleCardEdit(val);
                        setEditingCard(null);
                    }}
                    onCancel={() => setEditingCard(null)}
                />
            )}
        </div>
    );
}
