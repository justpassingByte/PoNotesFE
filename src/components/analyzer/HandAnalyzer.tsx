"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Loader2, ImageIcon, Sparkles, AlertTriangle, CheckCircle, XCircle, Spade, ShieldAlert, ArrowUpRight } from "lucide-react";
import { API } from "@/lib/api";
import { createNote } from "@/app/actions";
import { useLoginModal } from "@/context/LoginModalContext";

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
        position?: string;
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

// ─── Card Rendering ──────────────────────────────────────────────────────────
const SUIT_SYMBOLS: Record<string, string> = { h: "♥", d: "♦", c: "♣", s: "♠" };
const SUIT_BG: Record<string, string> = {
    h: "bg-red-950/80 border-red-700/60 text-red-300",
    d: "bg-blue-950/80 border-blue-700/60 text-blue-300",
    c: "bg-emerald-950/80 border-emerald-700/60 text-emerald-300",
    s: "bg-zinc-900 border-zinc-600/80 text-zinc-200",
};

function PokerCard({ card, small = false }: { card: string; small?: boolean }) {
    const rank = card.slice(0, -1).toUpperCase();
    const suit = card.slice(-1).toLowerCase();
    const colorClass = SUIT_BG[suit] || "bg-zinc-900 border-zinc-600 text-zinc-200";
    if (small) {
        return (
            <span className={`inline-flex items-center justify-center gap-0.5 border rounded font-mono font-black text-[11px] px-1.5 py-0.5 ${colorClass}`}>
                {rank}{SUIT_SYMBOLS[suit] || suit}
            </span>
        );
    }
    return (
        <div className={`flex flex-col items-center justify-center w-10 h-14 border-2 rounded-lg font-mono shadow-lg ${colorClass} shrink-0`}>
            <span className="text-sm font-black leading-none">{rank}</span>
            <span className="text-base leading-none mt-0.5">{SUIT_SYMBOLS[suit] || suit}</span>
        </div>
    );
}

// ─── Action Badge ────────────────────────────────────────────────────────────
const ACTION_STYLES: Record<string, string> = {
    fold: "bg-zinc-700/50 text-zinc-400",
    call: "bg-emerald-700/40 text-emerald-300 border border-emerald-600/30",
    raise: "bg-amber-700/40 text-amber-300 border border-amber-600/30",
    bet: "bg-orange-700/40 text-orange-300 border border-orange-600/30",
    check: "bg-slate-700/40 text-slate-300",
    "all-in": "bg-red-700/50 text-red-300 border border-red-600/40 font-bold",
    post: "bg-zinc-700/40 text-zinc-400",
};

function ActionLine({ action }: { action: HandAction }) {
    const style = ACTION_STYLES[action.action] || "bg-gray-600/40 text-gray-300";
    return (
        <div className="flex items-center gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
            {action.position && (
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wide w-8 text-center shrink-0">{action.position}</span>
            )}
            <span className="text-xs text-gray-300 font-medium flex-1 truncate">{action.player}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold shrink-0 ${style}`}>{action.action}</span>
            {action.amount != null && (
                <span className="text-[10px] text-gold font-mono font-black shrink-0">{action.amount}BB</span>
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
    return <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${s.color}`}>{s.label}</span>;
}

// ─── Card Picker ─────────────────────────────────────────────────────────────
const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUITS = ["h", "d", "c", "s"];

function CardPicker({ onSelect, onCancel, currentVal }: { onSelect: (val: string) => void, onCancel: () => void, currentVal?: string }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a1a] border border-gold/20 rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold" /> Select Card</h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-white"><XCircle className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                    {RANKS.flatMap(r => SUITS.map(s => {
                        const val = `${r}${s}`;
                        const isCurrent = currentVal === val;
                        return (
                            <button key={val} onClick={() => onSelect(val)}
                                className={`h-9 rounded border text-[10px] font-bold transition-all flex items-center justify-center gap-0.5
                                    ${isCurrent ? 'bg-gold text-black border-gold' : `bg-white/5 border-white/10 ${SUIT_BG[s]?.split(' ')[2] || 'text-gray-400'} hover:border-gold/50`}`}>
                                {r}{SUIT_SYMBOLS[s]}
                            </button>
                        );
                    }))}
                </div>
            </div>
        </div>
    );
}

// ─── OCR Confidence Badge ────────────────────────────────────────────────────
function OCRConfidenceBadge({ score }: { score: number }) {
    let color = "text-red-400 bg-red-500/10 border-red-500/20";
    if (score >= 0.9) color = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    else if (score >= 0.7) color = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return <div className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${color}`}>OCP: {(score * 100).toFixed(0)}%</div>;
}

// ─── Save Note Button ────────────────────────────────────────────────────────
function SaveNoteButton({ noteData, isAutosaved }: { noteData: any; isAutosaved?: boolean }) {
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(isAutosaved || false);
    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSaving(true);
        try { await createNote(noteData); setSaved(true); }
        catch { alert("Failed to save note"); }
        finally { setIsSaving(false); }
    };
    if (saved) return <span className="text-[10px] text-emerald-400 font-medium">✓ Saved</span>;
    return (
        <button onClick={handleSave} disabled={isSaving}
            className="text-[10px] bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-2 py-1 rounded border border-white/10 transition-colors disabled:opacity-50">
            {isSaving ? "Saving..." : "Save Note"}
        </button>
    );
}

// ─── Street Column (5-column layout) ────────────────────────────────────────
type StreetKey = 'blinds_ante' | 'preflop' | 'flop' | 'turn' | 'river';

const STREET_CONFIG: Record<StreetKey, { label: string; shortLabel: string; headerColor: string; borderColor: string; textColor: string; badgeBg: string }> = {
    blinds_ante: { label: 'BLINDS & ANTE', shortLabel: 'BL', headerColor: 'bg-zinc-800/80', borderColor: 'border-zinc-600/30', textColor: 'text-zinc-400', badgeBg: 'bg-zinc-600/20' },
    preflop:     { label: 'PRE-FLOP',      shortLabel: 'PF', headerColor: 'bg-blue-950/60',  borderColor: 'border-blue-500/20',  textColor: 'text-blue-400',  badgeBg: 'bg-blue-500/10' },
    flop:        { label: 'FLOP',          shortLabel: 'FL', headerColor: 'bg-emerald-950/60', borderColor: 'border-emerald-500/20', textColor: 'text-emerald-400', badgeBg: 'bg-emerald-500/10' },
    turn:        { label: 'TURN',          shortLabel: 'TU', headerColor: 'bg-amber-950/60',  borderColor: 'border-amber-500/20',  textColor: 'text-amber-400',  badgeBg: 'bg-amber-500/10' },
    river:       { label: 'RIVER',         shortLabel: 'RI', headerColor: 'bg-red-950/60',    borderColor: 'border-red-500/20',    textColor: 'text-red-400',    badgeBg: 'bg-red-500/10' },
};

const ACTION_BADGE: Record<string, string> = {
    fold:    'bg-zinc-700/60 text-zinc-400',
    check:   'bg-slate-700/50 text-slate-300',
    call:    'bg-emerald-700/50 text-emerald-300',
    bet:     'bg-orange-700/50 text-orange-300',
    raise:   'bg-amber-700/50 text-amber-200',
    'all-in':'bg-red-700/60 text-red-200',
    post:    'bg-zinc-700/40 text-zinc-500',
};

function StreetColumn({
    street, boardCards, actions, potAmount, parsedHand, handData, setParsedHand, setEditingCard,
}: {
    street: StreetKey;
    boardCards?: string[];
    actions: HandAction[];
    potAmount?: number;
    parsedHand: Hand | null;
    handData: any;
    setParsedHand: (h: Hand) => void;
    setEditingCard: (v: any) => void;
}) {
    const cfg = STREET_CONFIG[street];
    return (
        <div className={`flex flex-col border-r border-white/5 last:border-r-0 min-w-0`}>
            {/* Column Header */}
            <div className={`${cfg.headerColor} ${cfg.borderColor} border-b px-2.5 py-3 flex flex-col gap-1 min-h-[80px] justify-between`}>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${cfg.textColor}`}>{cfg.label}</span>
                {/* Board cards for flop/turn/river */}
                {boardCards && boardCards.length > 0 && (
                    <div className="flex gap-0.5 flex-wrap">
                        {boardCards.map((c, i) => (
                            <button key={i} onClick={() => setEditingCard({ type: 'board', index: handData.board.indexOf(c) })}
                                className="hover:scale-110 transition-transform">
                                <PokerCard card={c} small />
                            </button>
                        ))}
                    </div>
                )}
                {/* Pot amount */}
                {potAmount != null && potAmount > 0 && (
                    <span className={`text-[11px] font-black font-mono ${cfg.textColor}`}>{potAmount} BB</span>
                )}
                {/* Action count */}
                <span className="text-[8px] text-gray-700 font-bold">{actions.length} action{actions.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Actions list */}
            <div className="flex-1 px-2 py-1.5 space-y-1 overflow-y-auto max-h-[400px]">
                {actions.length > 0 ? actions.map((a: any, i: number) => (
                    <div key={i} className="group bg-black/30 hover:bg-black/50 border border-white/5 rounded-lg p-1.5 transition-all">
                        {/* Row 1: position badge + player name */}
                        <div className="flex items-center gap-1 mb-1">
                            <input
                                value={a.position || ''}
                                placeholder="POS"
                                maxLength={4}
                                onChange={(e) => {
                                    const newActions = { ...handData.actions };
                                    newActions[street] = [...(newActions[street] || [])];
                                    newActions[street][i] = { ...a, position: e.target.value.toUpperCase() };
                                    setParsedHand({ ...parsedHand!, parsed_data: { ...handData, actions: newActions } });
                                }}
                                className={`${cfg.badgeBg} ${cfg.textColor} text-[8px] font-black px-1 py-0.5 rounded border ${cfg.borderColor} w-8 text-center uppercase shrink-0 focus:outline-none focus:border-gold/50 placeholder-current/40`}
                            />
                            <input
                                value={a.player}
                                placeholder="Player"
                                onChange={(e) => {
                                    const newActions = { ...handData.actions };
                                    newActions[street] = [...(newActions[street] || [])];
                                    newActions[street][i] = { ...a, player: e.target.value };
                                    setParsedHand({ ...parsedHand!, parsed_data: { ...handData, actions: newActions } });
                                }}
                                className="bg-transparent text-gray-300 text-[9px] px-0.5 flex-1 min-w-0 focus:outline-none truncate font-medium"
                            />
                            <button
                                onClick={() => {
                                    const newActions = { ...handData.actions };
                                    newActions[street] = [...(newActions[street] || [])];
                                    newActions[street].splice(i, 1);
                                    setParsedHand({ ...parsedHand!, parsed_data: { ...handData, actions: newActions } });
                                }}
                                className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-400 transition-all shrink-0"
                            >
                                <XCircle className="w-2.5 h-2.5" />
                            </button>
                        </div>
                        {/* Row 2: action select + amount */}
                        <div className="flex items-center gap-1">
                            <select
                                value={a.action}
                                onChange={(e) => {
                                    const newActions = { ...handData.actions };
                                    newActions[street] = [...(newActions[street] || [])];
                                    newActions[street][i] = { ...a, action: e.target.value };
                                    setParsedHand({ ...parsedHand!, parsed_data: { ...handData, actions: newActions } });
                                }}
                                className={`text-[8px] font-black px-1 py-0.5 rounded border focus:outline-none focus:border-gold/50 flex-1 min-w-0 ${ACTION_BADGE[a.action] || 'bg-gray-700/40 text-gray-400'} border-white/5`}
                            >
                                <option value="fold">Fold</option>
                                <option value="check">Check</option>
                                <option value="call">Call</option>
                                <option value="bet">Bet</option>
                                <option value="raise">Raise</option>
                                <option value="all-in">All-in</option>
                                <option value="post">Post</option>
                            </select>
                            <div className="flex items-center gap-0.5 bg-black/40 rounded border border-white/5 px-1 py-0.5 shrink-0">
                                <input
                                    type="number"
                                    value={a.amount === undefined || a.amount === null ? '' : a.amount}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const newActions = { ...handData.actions };
                                        newActions[street] = [...(newActions[street] || [])];
                                        newActions[street][i] = { ...a, amount: val === '' ? undefined : parseFloat(val) };
                                        setParsedHand({ ...parsedHand!, parsed_data: { ...handData, actions: newActions } });
                                    }}
                                    placeholder="0"
                                    className="bg-transparent text-gold text-[8px] w-8 focus:outline-none font-mono text-right"
                                />
                                <span className="text-[7px] text-amber-700 font-black">BB</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="text-[9px] text-gray-700 italic py-3 text-center">No actions</p>
                )}
            </div>

            {/* Add action */}
            <button
                onClick={() => {
                    const newActions = { ...handData.actions };
                    if (!newActions[street]) newActions[street] = [];
                    else newActions[street] = [...newActions[street]];
                    newActions[street].push({ player: 'Player', action: 'fold' });
                    setParsedHand({ ...parsedHand!, parsed_data: { ...handData, actions: newActions } });
                }}
                className="mx-2 mb-2 py-1 border border-dashed border-white/8 rounded text-[8px] text-gray-700 hover:text-gold hover:border-gold/30 transition-all uppercase tracking-widest font-bold"
            >+ Add</button>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function HandAnalyzer() {
    const [inputType, setInputType] = useState<"text" | "image">("image");
    const [textInput, setTextInput] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [parsedHand, setParsedHand] = useState<Hand | null>(null);
    const [analysis, setAnalysis] = useState<HandAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [quotaError, setQuotaError] = useState<{ error: string; used: number; limit: number; remaining: number; resetsAt: string; type: 'ocr' | 'ai' } | null>(null);
    const [editingCard, setEditingCard] = useState<{ type: 'board' | 'hole', index: number, pIdx?: number } | null>(null);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { openLogin } = useLoginModal();

    // Clipboard paste
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                    const blob = items[i].getAsFile();
                    if (!blob) continue;
                    const reader = new FileReader();
                    reader.onload = (event) => { setImagePreview(event.target?.result as string); setInputType("image"); };
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
        setQuotaError(null);
        setIsParsing(true);
        setAnalysis(null);
        try {
            const rawInput = inputType === "text" ? textInput : (imagePreview || "");
            if (!rawInput) { setError("Please provide a hand to parse."); return; }
            const res = await fetch(`${API.handAnalyze}/parse`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rawInput, inputType }),
            });
            // Only open login for true auth failures (401/440)
            if (res.status === 401 || res.status === 440) {
                openLogin('Sign in to use the AI Hand Analyzer — parse screenshots and get instant leak detection.');
                return;
            }
            const json = await res.json();
            // For 403: check if it's a quota error (show rich notification) vs auth error (show login)
            if (res.status === 403) {
                if (json.usage || json.error?.toLowerCase().includes('limit') || json.error?.toLowerCase().includes('quota')) {
                    setQuotaError({
                        error: json.error || 'Limit reached',
                        used: json.usage?.used ?? 0,
                        limit: json.usage?.limit ?? 0,
                        remaining: json.usage?.remaining ?? 0,
                        resetsAt: json.usage?.resetsAt || '',
                        type: 'ocr',
                    });
                    return;
                }
                openLogin('Sign in to use the AI Hand Analyzer — parse screenshots and get instant leak detection.');
                return;
            }
            if (!json.success) {
                if (json.error?.toLowerCase().includes('auth') || json.error?.toLowerCase().includes('login') || json.error?.toLowerCase().includes('token') || json.error?.toLowerCase().includes('session') || json.error?.toLowerCase().includes('expired')) {
                    openLogin('Sign in to use the AI Hand Analyzer — parse screenshots and get instant leak detection.');
                    return;
                }
                const resetInfo = json.usage?.resetsAt ? ` · Resets ${new Date(json.usage.resetsAt).toLocaleDateString()}` : '';
                throw new Error((json.error || "Parsing failed") + resetInfo);
            }
            setParsedHand(json.data.hand || null);
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
        setQuotaError(null);
        setIsAnalyzing(true);
        try {
            const res = await fetch(`${API.handAnalyze}/analyze`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ handId: parsedHand.id, parsedData: parsedHand.parsed_data }),
            });
            // Only open login for true auth failures (401/440)
            if (res.status === 401 || res.status === 440) {
                openLogin('Sign in to run the AI Leak Scan — deep analysis of your poker decisions and mistakes.');
                return;
            }
            const json = await res.json();
            // For 403: check if it's a quota error (show rich notification) vs auth error (show login)
            if (res.status === 403) {
                if (json.usage || json.error?.toLowerCase().includes('limit') || json.error?.toLowerCase().includes('quota')) {
                    setQuotaError({
                        error: json.error || 'Limit reached',
                        used: json.usage?.used ?? 0,
                        limit: json.usage?.limit ?? 0,
                        remaining: json.usage?.remaining ?? 0,
                        resetsAt: json.usage?.resetsAt || '',
                        type: 'ai',
                    });
                    return;
                }
                openLogin('Sign in to run the AI Leak Scan — deep analysis of your poker decisions and mistakes.');
                return;
            }
            if (!json.success) {
                if (json.error?.toLowerCase().includes('auth') || json.error?.toLowerCase().includes('login') || json.error?.toLowerCase().includes('token') || json.error?.toLowerCase().includes('session') || json.error?.toLowerCase().includes('expired')) {
                    openLogin('Sign in to run the AI Leak Scan — deep analysis of your poker decisions and mistakes.');
                    return;
                }
                const resetInfo = json.usage?.resetsAt ? ` · Resets ${new Date(json.usage.resetsAt).toLocaleDateString()}` : '';
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

    async function handleFeedback(action: 'confirm' | 'edit' | 'reject', corrected?: { name: string, revised: string, index?: number }) {
        setIsSubmittingFeedback(true);
        try {
            await fetch(`${API.base}/api/ocr/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageHex: imagePreview,
                    cardName: corrected?.name || 'all_board',
                    action,
                    correctedName: corrected?.revised || '',
                    cardIndex: corrected?.index
                })
            });
            if (action === 'confirm') {
                setParsedHand({ ...parsedHand!, parsed_data: { ...handData, ocr_result: { ...handData.ocr_result, decision: 'auto_accept' } } });
            }
        } catch (err) { console.error("Feedback failed:", err); }
        finally { setIsSubmittingFeedback(false); }
    }

    function handleCardEdit(newVal: string) {
        if (!editingCard || !parsedHand) return;
        if (editingCard.type === 'board') {
            const newBoard = [...handData.board];
            const oldName = newBoard[editingCard.index];
            newBoard[editingCard.index] = newVal;
            setParsedHand({ ...parsedHand, parsed_data: { ...handData, board: newBoard } });
            handleFeedback('edit', { name: oldName, revised: newVal, index: editingCard.index });
        } else {
            const newPlayers = [...handData.players];
            const p = newPlayers[editingCard.pIdx!];
            const newCards = [...(p.hole_cards || [])];
            const oldName = newCards[editingCard.index];
            newCards[editingCard.index] = newVal;
            newPlayers[editingCard.pIdx!] = { ...p, hole_cards: newCards };
            setParsedHand({ ...parsedHand, parsed_data: { ...handData, players: newPlayers } });
            handleFeedback('edit', { name: oldName, revised: newVal, index: editingCard.index });
        }
    }

    // Compute board cards per street
    const board = handData?.board || [];
    const flopCards = board.slice(0, 3);
    const turnCards = board.slice(3, 4);
    const riverCards = board.slice(4, 5);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start text-foreground">

            {/* ── LEFT COLUMN: Input (3 cols, sticky) ── */}
            <div className={`xl:col-span-3 space-y-4 ${handData ? 'xl:sticky xl:top-24' : ''}`}>
                <div className="bg-card border border-border rounded-xl p-4 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-semibold text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-gold" />
                            Hand Input
                        </h2>
                        <div className="flex bg-black/40 rounded-lg p-0.5 border border-border">
                            <button
                                onClick={() => setInputType("text")}
                                className={`px-3 py-1 rounded-md text-xs transition-all ${inputType === "text" ? "bg-felt-default text-white shadow" : "text-gray-400 hover:text-white"}`}
                            >
                                <FileText className="w-3.5 h-3.5 inline mr-1" /> Text
                            </button>
                            <button
                                onClick={() => setInputType("image")}
                                className={`px-3 py-1 rounded-md text-xs transition-all ${inputType === "image" ? "bg-felt-default text-white shadow" : "text-gray-400 hover:text-white"}`}
                            >
                                <ImageIcon className="w-3.5 h-3.5 inline mr-1" /> Screenshot
                            </button>
                        </div>
                    </div>

                    {inputType === "text" ? (
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder={`Paste your hand history here...\n\nExample:\nPokerStars Hand #123456789...`}
                            className="w-full h-24 bg-black/40 border border-border rounded-lg p-3 text-sm text-gray-300 placeholder-gray-600 font-mono resize-none focus:outline-none focus:ring-1 focus:ring-gold/50"
                        />
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full min-h-[100px] bg-black/40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-gold/40 transition-all group p-3"
                        >
                            {imagePreview ? (
                                <div className="flex items-center justify-center gap-4 py-1">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-emerald-400 font-bold">Successfully Loaded</p>
                                        <p className="text-[10px] text-gray-500 font-medium group-hover:text-gold transition-colors">Click, Drag, or Paste to change</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-2xl bg-gold/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-gold/10">
                                        <Upload className="w-8 h-8 text-gold" />
                                    </div>
                                    <p className="text-base text-gray-300 font-bold mb-1">Upload Poker Screenshot</p>
                                    <p className="text-sm text-gray-500 font-medium">Click, Drag, or <span className="text-gold">Paste (Ctrl+V)</span></p>
                                    <p className="text-[10px] text-gray-600 mt-4 uppercase tracking-[0.2em] font-black">Support WPT, GG, PokerStars & more</p>
                                </>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </div>
                    )}

                    <button
                        onClick={handleParse}
                        disabled={isParsing || isAnalyzing}
                        className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold/90 to-amber-600 hover:from-gold hover:to-amber-500 text-black font-black py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gold/10 uppercase tracking-wider text-sm"
                    >
                        {isParsing ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Neural OCR Engine Processing...</>
                        ) : (
                            <><Sparkles className="w-5 h-5" /> {isReviewing ? "RE-PROCESS DATA" : "ANALYZE SCREENSHOT"}</>
                        )}
                    </button>

                    {/* Quota Limit Notification */}
                    {quotaError && (
                        <div className="mt-4 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 border border-amber-500/30 rounded-2xl p-5 shadow-lg shadow-amber-900/10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-amber-300 uppercase tracking-wide">
                                        {quotaError.type === 'ocr' ? 'OCR Scan' : 'AI Analysis'} Limit Reached
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        You&apos;ve used all your {quotaError.type === 'ocr' ? 'screenshot scans' : 'AI analyses'} for this period.
                                    </p>
                                </div>
                            </div>
                            {/* Usage bar */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between text-[10px] mb-1.5">
                                    <span className="text-gray-500 font-bold uppercase tracking-widest">Usage</span>
                                    <span className="text-amber-400 font-black">{quotaError.used} / {quotaError.limit}</span>
                                </div>
                                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all" style={{ width: `${quotaError.limit > 0 ? Math.min((quotaError.used / quotaError.limit) * 100, 100) : 100}%` }} />
                                </div>
                            </div>
                            {/* Reset date */}
                            {quotaError.resetsAt && (
                                <p className="text-[10px] text-gray-500 mb-3">
                                    ⏳ Resets on <span className="text-white font-bold">{new Date(quotaError.resetsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </p>
                            )}
                            {/* Upgrade CTA */}
                            <a
                                href="/pricing"
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-900/20"
                            >
                                Upgrade Plan for More <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    )}

                    {error && !quotaError && (
                        <div className="mt-4 flex items-center gap-3 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {error}
                        </div>
                    )}
                </div>
            </div>

            {/* ── RIGHT COLUMN: Results (9 cols) ── */}
            <div className="xl:col-span-9 space-y-5">

                {/* Empty state */}
                {!handData && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] border border-dashed border-white/10 rounded-3xl bg-black/20">
                        <div className="w-20 h-20 rounded-2xl bg-gold/5 flex items-center justify-center mb-6">
                            <Sparkles className="w-10 h-10 text-gold/40" />
                        </div>
                        <h3 className="text-xl font-black text-gray-500 uppercase tracking-widest mb-2">Awaiting Neural Input</h3>
                        <p className="text-sm text-gray-600 font-medium text-center max-w-sm">Upload a hand screenshot on the left or paste your text to begin analysis.</p>
                    </div>
                )}

                {/* ── HAND REVIEW: Portrait Poker Layout ── */}
                {handData && handData.board && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">

                        {/* OCR Confidence Banner */}
                        {handData.ocr_result && (
                            <div className={`flex items-center justify-between px-4 py-3 rounded-xl border
                                ${handData.ocr_result.decision === 'auto_accept' ? 'bg-emerald-500/5 border-emerald-500/10'
                                    : handData.ocr_result.decision === 'confirm' ? 'bg-amber-500/5 border-amber-500/10'
                                        : 'bg-red-500/5 border-red-500/10'}`}>
                                <div className="flex items-center gap-4">
                                    <OCRConfidenceBadge score={handData.ocr_result.confidence} />
                                    <div>
                                        <p className="text-sm font-black text-white uppercase tracking-tight">
                                            {handData.ocr_result.decision.replace('_', ' ')}
                                        </p>
                                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">
                                            {handData.ocr_result.decision_reason?.join(' · ')}
                                        </p>
                                    </div>
                                </div>
                                {handData.ocr_result.decision !== 'auto_accept' && (
                                    <button
                                        onClick={() => handleFeedback('confirm')}
                                        disabled={isSubmittingFeedback}
                                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                                    >
                                        {isSubmittingFeedback ? "Saving..." : "CONFIRM DETECTION"}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* ═══ BOARD PANEL — Felt-style poker table ═══ */}
                        <div className="bg-gradient-to-b from-[#0b1f17] to-[#091510] border border-emerald-900/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
                            {/* Pot */}
                            <div className="flex items-center justify-between px-6 py-3 border-b border-emerald-900/30">
                                <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.25em]">Total Pot</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={handData.pot || 0}
                                        onChange={(e) => setParsedHand({ ...parsedHand!, parsed_data: { ...handData, pot: parseFloat(e.target.value) } })}
                                        className="bg-transparent text-lg font-black text-gold border-0 w-20 text-right focus:outline-none focus:ring-1 focus:ring-gold/30 rounded"
                                    />
                                    <span className="text-[10px] text-amber-700/80 font-black uppercase">BB</span>
                                </div>
                            </div>

                            {/* Community Board + Winner */}
                            <div className="flex items-center justify-between px-6 py-5 bg-felt-default/10">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Community Cards</span>
                                    <div className="flex gap-2">
                                        {board.length > 0 ? board.map((c: string, i: number) => (
                                            <button key={i} onClick={() => setEditingCard({ type: 'board', index: i })}
                                                className="hover:scale-110 transition-transform active:scale-95">
                                                <PokerCard card={c} />
                                            </button>
                                        )) : (
                                            <button onClick={() => setEditingCard({ type: 'board', index: 0 })}
                                                className="h-14 px-4 border border-dashed border-gold/30 rounded-lg text-[10px] text-gold/50 hover:border-gold/60 hover:text-gold transition-all font-black uppercase tracking-widest">
                                                + Add Board
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {handData.winner && (
                                    <div className="text-right">
                                        <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest block mb-1">Winner</span>
                                        <span className="text-sm text-emerald-400 font-black">🏆 {handData.winner}</span>
                                    </div>
                                )}
                            </div>

                            {/* Player Hands */}
                            {handData.players?.some((p: any) => p.hole_cards && p.hole_cards.length > 0) && (
                                <div className="px-6 py-3 border-t border-emerald-900/20 flex flex-wrap items-center gap-4">
                                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] w-full">Player Hands</span>
                                    {handData.players
                                        .filter((p: any) => p.hole_cards && p.hole_cards.length > 0)
                                        .map((p: any, pIdx: number) => (
                                            <div key={pIdx} className="flex items-center gap-2">
                                                <span className="text-[10px] text-gray-400 font-bold truncate max-w-[90px]">{p.name}</span>
                                                <div className="flex gap-1">
                                                    {p.hole_cards.map((c: string, ci: number) => (
                                                        <button key={ci}
                                                            onClick={() => setEditingCard({ type: 'hole', index: ci, pIdx: handData.players.indexOf(p) })}
                                                            className="hover:scale-110 transition-transform">
                                                            <PokerCard card={c} small />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

                        {/* ═══ 5-COLUMN STREET ACTION LOG ═══ */}
                        <div className="bg-card/40 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/20">
                                <span className="text-[10px] text-white font-black uppercase tracking-[0.2em]">Tactical Log — Review & Edit</span>
                                <span className="text-[9px] text-amber-500/50 border border-amber-500/10 bg-amber-500/5 px-2 py-0.5 rounded font-bold uppercase">OCR Context-Aware</span>
                            </div>
                            {/* 5-Column grid — one col per street */}
                            <div className="grid grid-cols-5 divide-x divide-white/5 overflow-x-auto">
                                {([
                                    { street: 'blinds_ante' as const, boardCards: [] },
                                    { street: 'preflop'     as const, boardCards: [] },
                                    { street: 'flop'        as const, boardCards: flopCards },
                                    { street: 'turn'        as const, boardCards: turnCards },
                                    { street: 'river'       as const, boardCards: riverCards },
                                ]).map(({ street, boardCards }) => (
                                    <StreetColumn
                                        key={street}
                                        street={street}
                                        boardCards={boardCards}
                                        actions={handData.actions?.[street] || []}
                                        potAmount={handData.street_pots?.[street]}
                                        parsedHand={parsedHand}
                                        handData={handData}
                                        setParsedHand={setParsedHand}
                                        setEditingCard={setEditingCard}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Run AI Analysis CTA */}
                        {!analysis && (
                            <button
                                onClick={handleRunAnalysis}
                                disabled={isAnalyzing}
                                className="w-full flex items-center justify-center gap-3 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/30 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-sm"
                            >
                                {isAnalyzing
                                    ? <><Loader2 className="w-5 h-5 animate-spin" /> NEURAL PROCESSING...</>
                                    : <><CheckCircle className="w-6 h-6" /> EXECUTE AI LEAK SCAN</>
                                }
                            </button>
                        )}
                    </div>
                )}

                {/* ── AI Analysis Results ── */}
                {analysis && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-500 pb-12">
                        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent my-2" />

                        {/* Summary & Grade */}
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
                                            <span className={`text-[11px] font-black px-2 py-0.5 rounded uppercase ${analysis.final_verdict.suggestion_type === 'Exploit' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                {analysis.final_verdict.suggestion_type}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 shadow-xl">
                                <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                                    <Loader2 className="w-3.5 h-3.5 text-gold/60" /> Reasoning Trace
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

                        {/* Mistakes */}
                        <div className="bg-card border border-amber-500/20 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-amber-400 mb-5 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                Player Mistakes & Leaks ({analysis.mistakes?.length || 0})
                            </h3>
                            <div className="space-y-4">
                                {analysis.mistakes?.length > 0 ? (
                                    analysis.mistakes.map((m, i) => {
                                        const normalizedStreet = m.street
                                            ? m.street.charAt(0).toUpperCase() + m.street.slice(1).toLowerCase()
                                            : 'Postflop';
                                        return (
                                            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] transition-all">
                                                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-[10px] text-gold uppercase font-black bg-gold/10 px-2 py-0.5 rounded">{m.street}</span>
                                                        {m.position && <span className="text-[10px] text-emerald-400 uppercase font-black bg-emerald-500/10 px-2 py-0.5 rounded">{m.position}</span>}
                                                        <SeverityBadge severity={m.severity} />
                                                        <span className="text-sm text-white font-bold">— {m.player}</span>
                                                    </div>
                                                    <SaveNoteButton noteData={{ player_name: m.player, content: m.description, street: normalizedStreet, note_type: "Custom", source: "ai", hand_id: parsedHand?.id }} />
                                                </div>
                                                <p className="text-sm text-gray-300 leading-snug">{m.description}</p>
                                                {m.better_line && (
                                                    <div className="mt-3 text-[11px] bg-emerald-500/5 border border-emerald-500/10 p-2 rounded">
                                                        <span className="text-emerald-400 font-bold uppercase tracking-tighter mr-2">Better Line:</span>
                                                        <span className="text-gray-400 italic">{m.better_line}</span>
                                                    </div>
                                                )}
                                                {m.gto_deviation_reason && (
                                                    <div className="mt-2 text-[10px] text-purple-400/80 italic leading-tight">💡 {m.gto_deviation_reason}</div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-6 text-gray-500 italic text-sm">No mistakes detected in this hand.</div>
                                )}
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

                        {/* New scan */}
                        <button
                            onClick={() => { setAnalysis(null); setParsedHand(null); setIsReviewing(false); setError(null); }}
                            className="w-full py-3 border border-dashed border-white/10 rounded-xl text-[10px] text-gray-500 hover:text-gold hover:border-gold/30 transition-all uppercase tracking-widest font-bold"
                        >
                            ↺ Analyze New Hand
                        </button>
                    </div>
                )}
            </div>

            {/* Card Picker Overlay */}
            {editingCard && (
                <CardPicker
                    currentVal={
                        editingCard.type === 'board'
                            ? handData.board[editingCard.index]
                            : handData.players[editingCard.pIdx!]?.hole_cards?.[editingCard.index]
                    }
                    onSelect={(val) => { handleCardEdit(val); setEditingCard(null); }}
                    onCancel={() => setEditingCard(null)}
                />
            )}
        </div>
    );
}