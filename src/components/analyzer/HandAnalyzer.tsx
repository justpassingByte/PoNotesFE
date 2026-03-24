"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Loader2, ImageIcon, Sparkles, AlertTriangle, CheckCircle, XCircle, ShieldAlert, ArrowUpRight } from "lucide-react";
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

// ─── Card Badge (inline, compact) ────────────────────────────────────────────
const SUIT_MAP: Record<string, { sym: string; color: string }> = {
    h: { sym: "♥", color: "text-red-400" },
    d: { sym: "♦", color: "text-blue-400" },
    c: { sym: "♣", color: "text-emerald-400" },
    s: { sym: "♠", color: "text-zinc-300" },
};

function CardBadge({ card, onClick }: { card: string; onClick?: () => void }) {
    const rank = card.slice(0, -1).toUpperCase();
    const suit = card.slice(-1).toLowerCase();
    const s = SUIT_MAP[suit] || { sym: suit, color: "text-zinc-400" };
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center font-mono font-black text-[11px] leading-none px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] hover:border-gold/40 transition-colors ${s.color}`}
        >
            {rank}{s.sym}
        </button>
    );
}

// ─── Card Picker ─────────────────────────────────────────────────────────────
const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUITS = ["h", "d", "c", "s"];

function CardPicker({ onSelect, onCancel, currentVal }: { onSelect: (val: string) => void; onCancel: () => void; currentVal?: string }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#141414] border border-white/10 rounded-xl p-5 shadow-2xl max-w-xs w-full">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-white uppercase tracking-wider">Select Card</span>
                    <button onClick={onCancel} className="text-zinc-600 hover:text-white"><XCircle className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-4 gap-1">
                    {RANKS.flatMap(r => SUITS.map(s => {
                        const val = `${r}${s}`;
                        const isCurrent = currentVal === val;
                        const sm = SUIT_MAP[s];
                        return (
                            <button key={val} onClick={() => onSelect(val)}
                                className={`h-7 rounded text-[10px] font-black transition-all flex items-center justify-center gap-0.5
                                    ${isCurrent ? 'bg-gold text-black' : `bg-white/5 border border-white/[0.06] ${sm.color} hover:bg-white/10`}`}>
                                {r}{sm.sym}
                            </button>
                        );
                    }))}
                </div>
            </div>
        </div>
    );
}

// ─── Action Row (compact text row) ───────────────────────────────────────────
const ACTION_COLOR: Record<string, string> = {
    fold:    "text-zinc-500",
    check:   "text-zinc-400",
    call:    "text-blue-400",
    bet:     "text-orange-400",
    raise:   "text-orange-400",
    "all-in":"text-red-400 font-black",
    post:    "text-zinc-600",
};

const ACTION_LABEL: Record<string, string> = {
    fold: "Fold", check: "Check", call: "Call", bet: "Bet",
    raise: "Raise", "all-in": "ALL-IN", post: "Post",
};

function ActionRow({
    action, index, street, handData, parsedHand, setParsedHand, editable,
}: {
    action: HandAction;
    index: number;
    street: string;
    handData: any;
    parsedHand: Hand | null;
    setParsedHand: (h: Hand) => void;
    editable: boolean;
}) {
    const color = ACTION_COLOR[action.action] || "text-zinc-400";
    const label = ACTION_LABEL[action.action] || action.action;

    if (!editable) {
        return (
            <div className={`grid grid-cols-[2rem_1fr_3.5rem_3.5rem] items-center gap-1 py-[3px] border-b border-white/[0.03] last:border-0 text-[11px] leading-tight font-mono ${action.action === 'fold' ? 'opacity-50' : ''}`}>
                <span className="text-[9px] font-black text-emerald-500/70 uppercase text-center">{action.position || ''}</span>
                <span className="text-zinc-300 truncate text-[11px]">{action.player}</span>
                <span className={`${color} font-bold text-right text-[10px]`}>{label}</span>
                <span className="text-right text-gold/80 text-[10px]">{action.amount != null ? `${action.amount}BB` : ''}</span>
            </div>
        );
    }

    const updateAction = (key: string, value: any) => {
        const newActions = { ...handData.actions };
        newActions[street] = [...(newActions[street] || [])];
        newActions[street][index] = { ...action, [key]: value };
        setParsedHand({ ...parsedHand!, parsed_data: { ...handData, actions: newActions } });
    };

    const removeAction = () => {
        const newActions = { ...handData.actions };
        newActions[street] = [...(newActions[street] || [])];
        newActions[street].splice(index, 1);
        setParsedHand({ ...parsedHand!, parsed_data: { ...handData, actions: newActions } });
    };

    return (
        <div className={`group grid grid-cols-[2rem_1fr_auto_3rem_1rem] items-center gap-1 py-[3px] border-b border-white/[0.03] last:border-0 text-[11px] font-mono ${action.action === 'fold' ? 'opacity-60' : ''}`}>
            <input
                value={action.position || ''}
                placeholder="—"
                maxLength={4}
                onChange={(e) => updateAction('position', e.target.value.toUpperCase())}
                className="bg-transparent text-[9px] font-black text-emerald-500/70 uppercase text-center w-full focus:outline-none focus:text-emerald-400 placeholder-zinc-700"
            />
            <input
                value={action.player}
                placeholder="Player"
                onChange={(e) => updateAction('player', e.target.value)}
                className="bg-transparent text-zinc-300 text-[11px] w-full min-w-0 focus:outline-none truncate"
            />
            <select
                value={action.action}
                onChange={(e) => updateAction('action', e.target.value)}
                className={`bg-transparent ${color} text-[10px] font-bold focus:outline-none cursor-pointer pr-1`}
            >
                <option value="fold">Fold</option>
                <option value="check">Check</option>
                <option value="call">Call</option>
                <option value="bet">Bet</option>
                <option value="raise">Raise</option>
                <option value="all-in">ALL-IN</option>
                <option value="post">Post</option>
            </select>
            <div className="flex items-center gap-0">
                <input
                    type="number"
                    value={action.amount === undefined || action.amount === null ? '' : action.amount}
                    onChange={(e) => updateAction('amount', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    placeholder="—"
                    className="bg-transparent text-gold/80 text-[10px] w-full focus:outline-none font-mono text-right placeholder-zinc-800"
                />
                <span className="text-[7px] text-zinc-600 font-black ml-0.5">BB</span>
            </div>
            <button onClick={removeAction} className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-opacity">
                <XCircle className="w-2.5 h-2.5" />
            </button>
        </div>
    );
}

// ─── Street Header ───────────────────────────────────────────────────────────
type StreetKey = 'blinds_ante' | 'preflop' | 'flop' | 'turn' | 'river';

const STREET_LABEL: Record<StreetKey, string> = {
    blinds_ante: 'BLINDS & ANTE',
    preflop: 'PRE-FLOP',
    flop: 'FLOP',
    turn: 'TURN',
    river: 'RIVER',
};

const STREET_ACCENT: Record<StreetKey, string> = {
    blinds_ante: 'text-zinc-500 border-zinc-700/50',
    preflop: 'text-blue-400 border-blue-500/20',
    flop: 'text-emerald-400 border-emerald-500/20',
    turn: 'text-amber-400 border-amber-500/20',
    river: 'text-red-400 border-red-500/20',
};

function StreetHeader({ street, boardCards, potAmount, setEditingCard, handData }: {
    street: StreetKey;
    boardCards: string[];
    potAmount?: number;
    setEditingCard: (v: any) => void;
    handData: any;
}) {
    const accent = STREET_ACCENT[street];
    return (
        <div className={`flex items-center gap-2 px-2 py-1.5 border-b ${accent} bg-white/[0.015]`}>
            <span className={`text-[10px] font-black uppercase tracking-wider ${accent.split(' ')[0]} shrink-0`}>
                {STREET_LABEL[street]}
            </span>
            {potAmount != null && potAmount > 0 && (
                <span className="text-[10px] font-mono font-bold text-zinc-500 shrink-0">
                    ({potAmount.toLocaleString()} BB)
                </span>
            )}
            {boardCards.length > 0 && (
                <div className="flex gap-0.5 ml-auto shrink-0">
                    {boardCards.map((c, i) => (
                        <CardBadge key={i} card={c} onClick={() => setEditingCard({ type: 'board', index: handData.board.indexOf(c) })} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Street Column ───────────────────────────────────────────────────────────
function StreetColumn({
    street, boardCards, actions, potAmount, parsedHand, handData, setParsedHand, setEditingCard, editable,
}: {
    street: StreetKey;
    boardCards: string[];
    actions: HandAction[];
    potAmount?: number;
    parsedHand: Hand | null;
    handData: any;
    setParsedHand: (h: Hand) => void;
    setEditingCard: (v: any) => void;
    editable: boolean;
}) {
    return (
        <div className="flex flex-col min-w-0 border-r border-white/[0.04] last:border-r-0">
            <StreetHeader
                street={street}
                boardCards={boardCards}
                potAmount={potAmount}
                setEditingCard={setEditingCard}
                handData={handData}
            />
            <div className="px-1.5 py-1 flex-1">
                {actions.length > 0 ? actions.map((a, i) => (
                    <ActionRow
                        key={i}
                        action={a}
                        index={i}
                        street={street}
                        handData={handData}
                        parsedHand={parsedHand}
                        setParsedHand={setParsedHand}
                        editable={editable}
                    />
                )) : (
                    <p className="text-[9px] text-zinc-700 py-2 text-center italic">—</p>
                )}
                {editable && (
                    <button
                        onClick={() => {
                            const newActions = { ...handData.actions };
                            if (!newActions[street]) newActions[street] = [];
                            else newActions[street] = [...newActions[street]];
                            newActions[street].push({ player: 'Player', action: 'fold' });
                            setParsedHand({ ...parsedHand!, parsed_data: { ...handData, actions: newActions } });
                        }}
                        className="w-full py-0.5 text-[8px] text-zinc-700 hover:text-gold transition-colors uppercase tracking-widest font-bold"
                    >+ add</button>
                )}
            </div>
        </div>
    );
}

// ─── Hand Header ─────────────────────────────────────────────────────────────
function HandHeader({ handData, parsedHand, setParsedHand, setEditingCard }: {
    handData: any;
    parsedHand: Hand | null;
    setParsedHand: (h: Hand) => void;
    setEditingCard: (v: any) => void;
}) {
    const playersWithCards = handData.players?.filter((p: any) => p.hole_cards && p.hole_cards.length > 0) || [];
    return (
        <div className="flex items-center justify-between gap-3 px-3 py-2 bg-white/[0.02] border-b border-white/[0.06]">
            {/* Left: players + hole cards */}
            <div className="flex items-center gap-4 flex-wrap min-w-0">
                {playersWithCards.map((p: any, pIdx: number) => (
                    <div key={pIdx} className="flex items-center gap-1.5">
                        {p.position && <span className="text-[8px] font-black text-emerald-500/60 uppercase">{p.position}</span>}
                        <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[80px]">{p.name}</span>
                        <div className="flex gap-0.5">
                            {p.hole_cards.map((c: string, ci: number) => (
                                <CardBadge key={ci} card={c} onClick={() => setEditingCard({ type: 'hole', index: ci, pIdx: handData.players.indexOf(p) })} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {/* Right: pot + winner */}
            <div className="flex items-center gap-4 shrink-0">
                {handData.pot != null && (
                    <div className="flex items-center gap-1">
                        <span className="text-[8px] text-zinc-600 font-black uppercase">Final Pot</span>
                        <input
                            type="number"
                            value={handData.pot || 0}
                            onChange={(e) => setParsedHand({ ...parsedHand!, parsed_data: { ...handData, pot: parseFloat(e.target.value) } })}
                            className="bg-transparent text-sm font-black text-gold w-16 text-right focus:outline-none font-mono"
                        />
                        <span className="text-[8px] text-zinc-600 font-black">BB</span>
                    </div>
                )}
                {handData.winner && (
                    <span className="text-[10px] text-emerald-400 font-bold">🏆 {handData.winner}</span>
                )}
            </div>
        </div>
    );
}

// ─── OCR Confidence ──────────────────────────────────────────────────────────
function OCRBanner({ ocrResult, onConfirm, isSubmitting }: {
    ocrResult: OCRResult;
    onConfirm: () => void;
    isSubmitting: boolean;
}) {
    let barColor = "bg-red-500";
    if (ocrResult.confidence >= 0.9) barColor = "bg-emerald-500";
    else if (ocrResult.confidence >= 0.7) barColor = "bg-amber-500";

    return (
        <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.06] gap-3">
            <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1">
                    <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${ocrResult.confidence * 100}%` }} />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-zinc-500">{(ocrResult.confidence * 100).toFixed(0)}%</span>
                </div>
                <span className="text-[9px] text-zinc-600 truncate">{ocrResult.decision_reason?.join(' · ')}</span>
            </div>
            {ocrResult.decision !== 'auto_accept' && (
                <button
                    onClick={onConfirm}
                    disabled={isSubmitting}
                    className="text-[9px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider shrink-0"
                >
                    {isSubmitting ? "..." : "✓ Confirm"}
                </button>
            )}
        </div>
    );
}

// ─── Severity Badge ──────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity?: string }) {
    const map: Record<string, { color: string; label: string }> = {
        critical: { color: "text-red-400 bg-red-500/10", label: "CRITICAL" },
        moderate: { color: "text-amber-400 bg-amber-500/10", label: "MODERATE" },
        minor: { color: "text-blue-400 bg-blue-500/10", label: "MINOR" },
    };
    const s = map[severity || "minor"] || map.minor;
    return <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-black tracking-wider ${s.color}`}>{s.label}</span>;
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
    if (saved) return <span className="text-[9px] text-emerald-500 font-mono">✓</span>;
    return (
        <button onClick={handleSave} disabled={isSaving}
            className="text-[9px] text-zinc-600 hover:text-gold transition-colors font-mono">
            {isSaving ? "..." : "save"}
        </button>
    );
}


// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
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
    const [editingCard, setEditingCard] = useState<{ type: 'board' | 'hole'; index: number; pIdx?: number } | null>(null);
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
            if (res.status === 401 || res.status === 440) {
                openLogin('Sign in to use the AI Hand Analyzer — parse screenshots and get instant leak detection.');
                return;
            }
            const json = await res.json();
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
            if (res.status === 401 || res.status === 440) {
                openLogin('Sign in to run the AI Leak Scan — deep analysis of your poker decisions and mistakes.');
                return;
            }
            const json = await res.json();
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

    async function handleFeedback(action: 'confirm' | 'edit' | 'reject', corrected?: { name: string; revised: string; index?: number }) {
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

    // Board cards per street
    const board = handData?.board || [];
    const flopCards = board.slice(0, 3);
    const turnCards = board.slice(3, 4);
    const riverCards = board.slice(4, 5);

    const streets: { street: StreetKey; boardCards: string[] }[] = [
        { street: 'blinds_ante', boardCards: [] },
        { street: 'preflop', boardCards: [] },
        { street: 'flop', boardCards: flopCards },
        { street: 'turn', boardCards: turnCards },
        { street: 'river', boardCards: riverCards },
    ];

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start text-foreground">

            {/* ── LEFT: Input Panel (3 cols, sticky) ── */}
            <div className={`xl:col-span-3 space-y-3 ${handData ? 'xl:sticky xl:top-24' : ''}`}>
                <div className="bg-[#111] border border-white/[0.06] rounded-lg overflow-hidden">
                    {/* Input header */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Input</span>
                        <div className="flex bg-black/60 rounded p-0.5 border border-white/[0.06]">
                            <button onClick={() => setInputType("text")}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${inputType === "text" ? "bg-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-400"}`}>
                                <FileText className="w-3 h-3 inline mr-1" />Text
                            </button>
                            <button onClick={() => setInputType("image")}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${inputType === "image" ? "bg-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-400"}`}>
                                <ImageIcon className="w-3 h-3 inline mr-1" />IMG
                            </button>
                        </div>
                    </div>

                    {/* Input body */}
                    <div className="p-3">
                        {inputType === "text" ? (
                            <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Paste hand history..."
                                className="w-full h-20 bg-black/40 border border-white/[0.06] rounded p-2.5 text-[11px] text-zinc-300 placeholder-zinc-700 font-mono resize-none focus:outline-none focus:border-gold/30"
                            />
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-20 bg-black/30 border border-dashed border-white/[0.08] rounded flex items-center justify-center cursor-pointer hover:border-gold/30 transition-colors"
                            >
                                {imagePreview ? (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[10px] text-emerald-400 font-bold">Loaded</span>
                                        <span className="text-[9px] text-zinc-600">· Click to change</span>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="w-5 h-5 text-zinc-600 mx-auto mb-1" />
                                        <p className="text-[10px] text-zinc-600">Drop / Paste / Click</p>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </div>
                        )}

                        <button
                            onClick={handleParse}
                            disabled={isParsing || isAnalyzing}
                            className="mt-3 w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold/90 text-black font-black py-2.5 rounded transition-all disabled:opacity-40 uppercase tracking-wider text-[11px]"
                        >
                            {isParsing ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                            ) : (
                                <><Sparkles className="w-3.5 h-3.5" /> {isReviewing ? "RE-PARSE" : "PARSE"}</>
                            )}
                        </button>
                    </div>

                    {/* Quota Error */}
                    {quotaError && (
                        <div className="px-3 pb-3">
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span className="text-[10px] font-black text-amber-300 uppercase tracking-wide">
                                        {quotaError.type === 'ocr' ? 'OCR' : 'AI'} Limit
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${quotaError.limit > 0 ? Math.min((quotaError.used / quotaError.limit) * 100, 100) : 100}%` }} />
                                    </div>
                                    <span className="text-[9px] font-mono text-amber-400">{quotaError.used}/{quotaError.limit}</span>
                                </div>
                                {quotaError.resetsAt && (
                                    <p className="text-[9px] text-zinc-600 mb-2">
                                        Resets {new Date(quotaError.resetsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                )}
                                <a href="/pricing"
                                    className="flex items-center justify-center gap-1 w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider rounded transition-colors">
                                    Upgrade <ArrowUpRight className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && !quotaError && (
                        <div className="px-3 pb-3">
                            <div className="flex items-center gap-2 text-red-400 text-[10px] bg-red-500/5 border border-red-500/10 rounded p-2">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />{error}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── RIGHT: Results (9 cols) ── */}
            <div className="xl:col-span-9 space-y-3">

                {/* Empty state */}
                {!handData && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] border border-dashed border-white/[0.06] rounded-lg bg-black/20">
                        <Sparkles className="w-8 h-8 text-zinc-800 mb-3" />
                        <p className="text-sm font-black text-zinc-700 uppercase tracking-wider">Awaiting Input</p>
                        <p className="text-[11px] text-zinc-800 mt-1">Upload a screenshot or paste hand history</p>
                    </div>
                )}

                {/* ── HAND TIMELINE ── */}
                {handData && handData.board && (
                    <div className="space-y-3 animate-in fade-in duration-200">

                        {/* Main timeline card */}
                        <div className="bg-[#0e0e0e] border border-white/[0.06] rounded-lg overflow-hidden">

                            {/* OCR Banner */}
                            {handData.ocr_result && (
                                <OCRBanner
                                    ocrResult={handData.ocr_result}
                                    onConfirm={() => handleFeedback('confirm')}
                                    isSubmitting={isSubmittingFeedback}
                                />
                            )}

                            {/* Hand Header: players + hole cards + final pot */}
                            <HandHeader
                                handData={handData}
                                parsedHand={parsedHand}
                                setParsedHand={setParsedHand}
                                setEditingCard={setEditingCard}
                            />

                            {/* 5-column street timeline */}
                            <div className="grid grid-cols-5 min-w-0 overflow-x-auto">
                                {streets.map(({ street, boardCards }) => (
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
                                        editable={!analysis}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Run AI Analysis CTA */}
                        {!analysis && (
                            <button
                                onClick={handleRunAnalysis}
                                disabled={isAnalyzing}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg transition-all disabled:opacity-40 uppercase tracking-wider text-[11px]"
                            >
                                {isAnalyzing
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                                    : <><CheckCircle className="w-4 h-4" /> Run AI Leak Scan</>
                                }
                            </button>
                        )}
                    </div>
                )}

                {/* ── AI Analysis Results ── */}
                {analysis && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                        {/* Summary + Grade */}
                        <div className="bg-[#0e0e0e] border border-white/[0.06] rounded-lg overflow-hidden">
                            <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Analysis</span>
                                {analysis.final_verdict && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-black text-gold leading-none">{analysis.final_verdict.grade}</span>
                                        <span className="text-[9px] font-mono text-zinc-500">{((analysis.final_verdict.confidence_score || 0) * 100).toFixed(0)}%</span>
                                        {analysis.final_verdict.suggestion_type && (
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${analysis.final_verdict.suggestion_type === 'Exploit' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                {analysis.final_verdict.suggestion_type}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <p className="text-[12px] text-zinc-300 leading-relaxed">{analysis.summary}</p>
                            </div>
                        </div>

                        {/* Reasoning Trace */}
                        {analysis.reasoning_trace?.length > 0 && (
                            <div className="bg-[#0e0e0e] border border-white/[0.06] rounded-lg overflow-hidden">
                                <div className="px-3 py-2 border-b border-white/[0.06]">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Reasoning</span>
                                </div>
                                <div className="p-3 space-y-1.5">
                                    {analysis.reasoning_trace.map((step, i) => (
                                        <div key={i} className="flex gap-2">
                                            <span className="text-[9px] font-mono text-zinc-700 shrink-0 w-4 text-right">{i + 1}.</span>
                                            <p className="text-[11px] text-zinc-400 leading-snug">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mistakes */}
                        <div className="bg-[#0e0e0e] border border-amber-500/10 rounded-lg overflow-hidden">
                            <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Mistakes & Leaks</span>
                                </div>
                                <span className="text-[9px] font-mono text-zinc-600">{analysis.mistakes?.length || 0}</span>
                            </div>
                            <div className="divide-y divide-white/[0.04]">
                                {analysis.mistakes?.length > 0 ? (
                                    analysis.mistakes.map((m, i) => {
                                        const normalizedStreet = m.street
                                            ? m.street.charAt(0).toUpperCase() + m.street.slice(1).toLowerCase()
                                            : 'Postflop';
                                        return (
                                            <div key={i} className="px-3 py-2.5">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="text-[9px] text-gold font-black uppercase bg-gold/5 px-1.5 py-0.5 rounded">{m.street}</span>
                                                    {m.position && <span className="text-[9px] text-emerald-400 font-black uppercase">{m.position}</span>}
                                                    <SeverityBadge severity={m.severity} />
                                                    <span className="text-[11px] text-white font-bold">{m.player}</span>
                                                    <div className="ml-auto">
                                                        <SaveNoteButton noteData={{ player_name: m.player, content: m.description, street: normalizedStreet, note_type: "Custom", source: "ai", hand_id: parsedHand?.id }} />
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-zinc-400 leading-snug">{m.description}</p>
                                                {m.better_line && (
                                                    <div className="mt-1.5 text-[10px] bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded">
                                                        <span className="text-emerald-400 font-bold mr-1">Better:</span>
                                                        <span className="text-zinc-500 italic">{m.better_line}</span>
                                                    </div>
                                                )}
                                                {m.gto_deviation_reason && (
                                                    <p className="mt-1 text-[9px] text-purple-400/70 italic">💡 {m.gto_deviation_reason}</p>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-4 text-[11px] text-zinc-700 italic">No mistakes detected.</div>
                                )}
                            </div>
                        </div>

                        {/* Exploit Suggestions */}
                        {analysis.exploit_suggestions?.length > 0 && (
                            <div className="bg-[#0e0e0e] border border-purple-500/10 rounded-lg overflow-hidden">
                                <div className="px-3 py-2 border-b border-white/[0.06] flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">Exploit Plan</span>
                                </div>
                                <div className="p-3 space-y-1">
                                    {analysis.exploit_suggestions.map((s, i) => (
                                        <p key={i} className="text-[11px] text-zinc-400 leading-snug">• {s}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New scan */}
                        <button
                            onClick={() => { setAnalysis(null); setParsedHand(null); setIsReviewing(false); setError(null); }}
                            className="w-full py-2 border border-dashed border-white/[0.06] rounded-lg text-[9px] text-zinc-600 hover:text-gold hover:border-gold/20 transition-all uppercase tracking-widest font-bold"
                        >
                            ↺ New Hand
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