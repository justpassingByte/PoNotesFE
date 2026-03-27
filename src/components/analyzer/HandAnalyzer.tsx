"use client";

import { useState, useRef, useEffect } from "react";

import { Loader2, AlertTriangle, ShieldAlert, ArrowUpRight } from "lucide-react";

import { API } from "@/lib/api";

import { createNote } from "@/app/actions";

import { useLoginModal } from "@/context/LoginModalContext";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HandAction { player: string; action: string; amount?: number; position?: string; }

interface ParsedHandData {

    hand_id?: string; game_type?: string; board: string[];

    players: { name: string; position?: string; stack?: number; hole_cards?: string[] }[];

    actions: { preflop: HandAction[]; flop: HandAction[]; turn: HandAction[]; river: HandAction[]; };

    pot?: number; winner?: string;

}

interface Hand { id?: string; hand_hash?: string; input_type?: string; parsed_data?: ParsedHandData; }

interface HandAnalysis {

    summary?: string; reasoning_trace: string[];

    mistakes: { street: string; player: string; position?: string; description: string; better_line?: string; gto_deviation_reason?: string; severity?: string; }[];

    exploit_suggestions: string[];

    final_verdict?: { grade: string; confidence_score?: number; suggestion_type?: 'GTO' | 'Exploit' | 'Balanced'; };

}

// ─── Image Compression ──────────────────────────────────────────────────────

const MAX_DIM = 1920;
const JPEG_QUALITY = 0.7;

function compressImage(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            let { width, height } = img;
            // Cap max dimension to reduce payload
            if (width > MAX_DIM || height > MAX_DIM) {
                const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('Canvas not supported')); return; }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
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

// ─── Suit color maps ─────────────────────────────────────────────────────────

const SUIT_STYLES: Record<string, { bg: string; border: string; text: string; glow: string }> = {

    h: { bg: 'bg-red-950/60', border: 'border-red-700/80', text: 'text-red-400', glow: 'shadow-red-900/40' },

    d: { bg: 'bg-blue-950/60', border: 'border-blue-700/80', text: 'text-blue-400', glow: 'shadow-blue-900/40' },

    c: { bg: 'bg-emerald-950/60', border: 'border-emerald-700/80', text: 'text-emerald-400', glow: 'shadow-emerald-900/40' },

    s: { bg: 'bg-gray-800/80', border: 'border-gray-500/60', text: 'text-gray-200', glow: 'shadow-gray-700/30' },

    '?': { bg: 'bg-yellow-950/40', border: 'border-yellow-600/60 border-dashed', text: 'text-yellow-400', glow: '' },

};

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

// ─── Action color ────────────────────────────────────────────────────────────

function getActionColor(action: string) {

    switch (action) {

        case "fold": return "text-gray-500";

        case "call": return "text-blue-400";

        case "check": return "text-gray-400";

        case "bet": case "raise": return "text-orange-400";

        case "all-in": return "text-red-500 font-bold";

        default: return "text-white";

    }

}

function formatAction(action: string) {

    if (action === "all-in") return "ALL-IN";

    return action.toUpperCase();

}

// ─── ActionRow ───────────────────────────────────────────────────────────────

function ActionRow({ action, currency = 'BB' }: { action: HandAction; currency?: string }) {

    const color = getActionColor(action.action);

    return (

        <div className="grid grid-cols-[140px_80px_1fr] items-center hover:bg-white/5 transition-colors rounded px-1 -mx-1 py-0.5">

            <div className="flex items-center gap-2 truncate pr-2">

                <span className="text-gray-600 text-[10px] font-bold w-6">{action.position ?? ""}</span>

                <span className="text-gray-300 truncate">{action.player}</span>

            </div>

            <div className={`${color} text-left`}>{formatAction(action.action)}</div>

            <div className="text-right text-gray-400 tabular-nums">

                {action.amount != null && (

                    <>

                        {currency !== 'BB' && <span className="text-[10px] text-gray-600 font-bold">{currency}</span>}

                        {action.amount}

                        {currency === 'BB' && <span className="text-[10px] text-gray-600 font-bold ml-0.5">BB</span>}

                    </>

                )}

            </div>

        </div>

    );

}

// ─── Editable ActionRow ──────────────────────────────────────────────────────

const ACT_CYCLE = ["fold", "check", "call", "bet", "raise", "all-in", "post"];

function EditableActionRow({ action, onUpdate, onRemove, currency = 'BB' }: {

    action: HandAction;

    onUpdate: (key: string, val: any) => void;

    onRemove: () => void;

    currency?: string;

}) {

    const color = getActionColor(action.action);

    const cycleAction = () => {

        const next = ACT_CYCLE[(ACT_CYCLE.indexOf(action.action) + 1) % ACT_CYCLE.length];

        onUpdate("action", next);

    };

    return (

        <div className="group grid grid-cols-[140px_80px_1fr_1rem] items-center hover:bg-white/5 transition-colors rounded px-1 -mx-1 py-0.5">

            <div className="flex items-center gap-2 truncate pr-2">

                <input value={action.position ?? ""} placeholder="POS"

                    onChange={e => onUpdate("position", e.target.value)}

                    className="bg-transparent text-gray-600 text-[10px] font-bold w-6 focus:outline-none uppercase" />

                <input value={action.player} placeholder="Player"

                    onChange={e => onUpdate("player", e.target.value)}

                    className="bg-transparent text-gray-300 truncate focus:outline-none min-w-0 flex-1" />

            </div>

            <button onClick={cycleAction} className={`${color} text-left hover:underline`}>

                {formatAction(action.action)}

            </button>

            <div className="flex items-center justify-end text-right text-gray-400 tabular-nums">

                <input type="number" value={action.amount ?? ""} placeholder="—"

                    onChange={e => onUpdate("amount", e.target.value === "" ? undefined : parseFloat(e.target.value))}

                    onWheel={e => {

                        e.currentTarget.blur();

                        const current = action.amount ?? 0;

                        const step = 0.5;

                        if (e.deltaY < 0) onUpdate("amount", parseFloat((current + step).toFixed(1)));

                        else if (e.deltaY > 0) onUpdate("amount", Math.max(0, parseFloat((current - step).toFixed(1))));

                    }}

                    className="bg-transparent text-right focus:outline-none w-full tabular-nums" />

                {action.amount != null && <span className="text-[10px] text-gray-600 font-bold ml-1">{currency}</span>}

            </div>

            <button onClick={onRemove}

                className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-500 transition-opacity text-right">✕</button>

        </div>

    );

}

// ─── StreetBlock ─────────────────────────────────────────────────────────────

function StreetBlock({ label, pot, boardCards, actions, editable, onSetEditingCard, boardStartIndex, handData, parsedHand, setParsedHand, streetKey, currency = 'BB' }: {

    label: string;

    pot?: number;

    boardCards: string[];

    actions: HandAction[];

    editable: boolean;

    onSetEditingCard: (v: any) => void;

    boardStartIndex: number;

    handData: any;

    parsedHand: Hand | null;

    setParsedHand: (h: Hand) => void;

    streetKey: string;

    currency?: string;

}) {

    const updateAction = (idx: number, key: string, val: any) => {

        const newActions = { ...handData.actions };

        newActions[streetKey] = [...(newActions[streetKey] || [])];

        newActions[streetKey][idx] = { ...newActions[streetKey][idx], [key]: val };

        setParsedHand({ ...parsedHand!, parsed_data: { ...handData, actions: newActions } });

    };

    const removeAction = (idx: number) => {

        const newActions = { ...handData.actions };

        newActions[streetKey] = [...(newActions[streetKey] || [])];

        newActions[streetKey].splice(idx, 1);

        setParsedHand({ ...parsedHand!, parsed_data: { ...handData, actions: newActions } });

    };

    const addAction = () => {

        const newActions = { ...handData.actions };

        newActions[streetKey] = [...(newActions[streetKey] || []), { player: "Player", action: "fold" }];

        setParsedHand({ ...parsedHand!, parsed_data: { ...handData, actions: newActions } });

    };

    if (actions.length === 0 && !editable) return null;

    return (

        <div className="bg-black/40 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors rounded-md px-3 py-2 min-h-[120px]">

            {/* HEADER */}

            <div className="flex items-center gap-2 border-b border-gray-800 pb-1 mb-1 text-yellow-400">

                <span className="font-bold text-xs">{label}</span>

                {pot != null && String(pot).replace(/ ?BB/i, '').trim() !== '0' && (

                    <span className="text-gray-400 text-xs">({String(pot).replace(/[^\d.,]/g, '').trim()}{currency === 'BB' || !currency ? ' BB' : ` ${currency}`}))</span>

                )}

                {boardCards.length > 0 && (

                    <div className="flex gap-1 ml-auto">

                        {boardCards.map((c, i) => (

                            <CardBadge key={i} card={c} onClick={editable ? () => onSetEditingCard({ type: "board", index: boardStartIndex + i }) : undefined} />

                        ))}

                    </div>

                )}

            </div>

            {/* ACTION LIST */}

            <div className="mt-1 space-y-[2px]">

                {actions.map((a, i) =>

                    editable ? (

                        <EditableActionRow key={i} action={a}

                            onUpdate={(k, v) => updateAction(i, k, v)}

                            onRemove={() => removeAction(i)} currency={currency} />

                    ) : (

                        <ActionRow key={i} action={a} currency={currency} />

                    )

                )}

                {editable && (

                    <button onClick={addAction} className="text-gray-700 hover:text-gray-500 text-xs">+ add</button>

                )}

            </div>

        </div>

    );

}

// ─── Card Picker ─────────────────────────────────────────────────────────────

const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

const SUITS = ["h", "d", "c", "s"];

function CardPicker({ onSelect, onCancel, currentVal }: { onSelect: (v: string) => void; onCancel: () => void; currentVal?: string }) {

    return (

        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onCancel}>

            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-lg p-4 max-w-sm w-full font-mono shadow-2xl" onClick={e => e.stopPropagation()}>

                <div className="flex justify-between mb-3">

                    <span className="text-xs text-gray-400 uppercase font-bold">Pick card</span>

                    <button onClick={onCancel} className="text-gray-400 hover:text-white text-xs">✕</button>

                </div>

                <div className="grid grid-cols-4 gap-2">

                    {RANKS.flatMap(r => SUITS.map(s => {

                        const v = `${r}${s}`;

                        const isRed = s === 'h' || s === 'd';

                        const isSelected = currentVal === v;

                        const displayStr = toDisplay(v);

                        const displayRank = displayStr.slice(0, -1);

                        const displaySuit = displayStr.slice(-1);

                        return (

                            <button key={v} onClick={() => onSelect(v)}

                                className={`flex flex-col justify-between w-8 h-12 mx-auto rounded-md shadow-sm px-[3px] py-[2px] text-[11px] font-bold leading-none transition-all

                                    ${isSelected

                                        ? "bg-yellow-400 border-2 border-yellow-600 scale-105"

                                        : "bg-white border border-gray-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"}`}>

                                {/* TOP */}

                                <div className={`text-left tracking-tighter ${isRed ? "text-red-600" : "text-black"}`}>

                                    {displayRank}<span className="text-[9px]">{displaySuit}</span>

                                </div>

                                {/* CENTER */}

                                <div className={`text-center text-lg ${isRed ? "text-red-600" : "text-black"}`}>

                                    {displaySuit}

                                </div>

                            </button>

                        );

                    }))}

                </div>

            </div>

        </div>

    );

}

// ─── ShowdownBlock ───────────────────────────────────────────────────────────────

function ShowdownBlock({ players, currency = 'BB' }: { players: any[]; currency?: string }) {

    if (!players || players.length === 0) return null;

    return (

        <div className="bg-black/40 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors rounded-md px-3 py-2">

            <div className="flex items-center gap-2 border-b border-gray-800 pb-1 mb-1 text-yellow-400">

                <span className="font-bold text-xs">SHOWDOWN</span>

            </div>

            <div className="mt-1 space-y-2">

                {players.map((p: any, i: number) => {

                    const isWinner = p.result === 'winner';

                    const cards = p.hole_cards || [];

                    return (

                        <div key={i} className={`flex items-center gap-3 rounded-md px-2 py-1.5 ${isWinner ? 'bg-green-950/30 border border-green-800/40' : 'bg-red-950/20 border border-red-900/30'}`}>

                            <div className="flex items-center gap-1.5 min-w-0 flex-1">

                                <span className={`text-xs font-bold ${isWinner ? 'text-green-400' : 'text-red-400'}`}>

                                    {isWinner ? '🏆' : '✗'}

                                </span>

                                <span className="text-gray-600 text-[10px] font-bold w-6">{p.position || ''}</span>

                                <span className="text-gray-300 text-xs font-bold truncate">{p.name}</span>

                            </div>

                            <div className="flex gap-1 shrink-0">

                                {cards.length > 0 ? cards.map((c: string, ci: number) => (

                                    <CardBadge key={ci} card={c} />

                                )) : <span className="text-gray-700 text-xs italic">no cards</span>}

                            </div>

                            {p.resultAmount && (

                                <span className={`text-xs font-bold tabular-nums shrink-0 ${isWinner ? 'text-green-400' : 'text-red-400'}`}>

                                    {p.resultAmount.startsWith('+') || p.resultAmount.startsWith('-') ? '' : isWinner ? '+' : '-'}

                                    {currency && currency !== 'BB' ? currency : ''}{p.resultAmount.replace(/^[+-]/, '')}

                                    {(!currency || currency === 'BB') && <span className="text-[10px] text-gray-600 ml-0.5">BB</span>}

                                </span>

                            )}

                        </div>

                    );

                })}

            </div>

        </div>

    );

}

// ─── SaveNoteButton ──────────────────────────────────────────────────────────────

function SaveNoteButton({ noteData }: { noteData: { player_name: string; content: string; street: string; note_type: string; source: string; hand_id?: string } }) {

    const [saving, setSaving] = useState(false);

    const [saved, setSaved] = useState(false);

    const handleSave = async () => {

        setSaving(true);

        try {

            await createNote(noteData);

            setSaved(true);

            setTimeout(() => setSaved(false), 2000);

        } catch (err) {

            console.error("Failed to save note:", err);

        } finally {

            setSaving(false);

        }

    };

    return (

        <button onClick={handleSave} disabled={saving || saved}

            className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${saved ? 'text-green-500 bg-green-900/20' : 'text-gray-600 hover:text-yellow-400 hover:bg-yellow-900/10'}`}>

            {saving ? '...' : saved ? '✓ saved' : '+ note'}

        </button>

    );

}

export function HandAnalyzer() {
    const [parsedHand, setParsedHand] = useState<Hand | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [inputType, setInputType] = useState<"text" | "image">("image");
    const [textInput, setTextInput] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<HandAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [quotaError, setQuotaError] = useState<{ error: string; used: number; limit: number; remaining: number; resetsAt: string; type: "ocr" | "ai" } | null>(null);
    const [editingCard, setEditingCard] = useState<{ type: "board" | "hole"; index: number; pIdx?: number } | null>(null);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { openLogin } = useLoginModal();
useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const blob = items[i].getAsFile();
                if (!blob) continue;
                compressImage(blob).then(dataUrl => { setImagePreview(dataUrl); setInputType("image"); });
                break;
            }
        }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
}, []);

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    compressImage(file).then(dataUrl => setImagePreview(dataUrl));
};

const handleParse = async () => {
    setError(null); setQuotaError(null); setIsParsing(true); setAnalysis(null);
    try {
        const rawInput = inputType === "text" ? textInput : (imagePreview || "");
        if (!rawInput) { setError("No input."); return; }
        const res = await fetch(`${API.handAnalyze}/parse`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rawInput, inputType }) });
        if (res.status === 401 || res.status === 440) { openLogin("Sign in to use the Hand Analyzer."); return; }
        const json = await res.json();
        if (res.status === 403) {

            if (json.usage || json.error?.toLowerCase().includes("limit") || json.error?.toLowerCase().includes("quota")) { setQuotaError({ error: json.error || "Limit", used: json.usage?.used ?? 0, limit: json.usage?.limit ?? 0, remaining: json.usage?.remaining ?? 0, resetsAt: json.usage?.resetsAt || "", type: "ocr" }); return; }

            openLogin("Sign in to use the Hand Analyzer."); return;
        }
        if (!json.success) {
            if (["auth", "login", "token", "session", "expired"].some(k => json.error?.toLowerCase().includes(k))) { openLogin("Sign in."); return; }

            throw new Error(json.error || "Parsing failed");
        }
        setParsedHand(json.data.hand || null); setIsReviewing(true);
    } catch (err: any) { setError(err.message || "Parsing failed"); }
    finally { setIsParsing(false); }
};

const handleRunAnalysis = async () => {
    if (!parsedHand) return;
    setError(null); setQuotaError(null); setIsAnalyzing(true);
    try {
        const res = await fetch(`${API.handAnalyze}/analyze`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ handId: parsedHand.id, parsedData: parsedHand.parsed_data }) });
        if (res.status === 401 || res.status === 440) { openLogin("Sign in for AI analysis."); return; }
        const json = await res.json();
        if (res.status === 403) {
            if (json.usage || json.error?.toLowerCase().includes("limit") || json.error?.toLowerCase().includes("quota")) { setQuotaError({ error: json.error || "Limit", used: json.usage?.used ?? 0, limit: json.usage?.limit ?? 0, remaining: json.usage?.remaining ?? 0, resetsAt: json.usage?.resetsAt || "", type: "ai" }); return; }
            openLogin("Sign in for AI analysis."); return;
        }
        if (!json.success) {
            if (["auth", "login", "token", "session", "expired"].some(k => json.error?.toLowerCase().includes(k))) { openLogin("Sign in."); return; }
            throw new Error(json.error || "Analysis failed");
        }
        setAnalysis(json.data.analysis); setIsReviewing(false);
    } catch (err: any) { setError(err.message || "Analysis failed"); }
    finally { setIsAnalyzing(false); }
};
const handData = (parsedHand?.parsed_data as any) || parsedHand;
async function handleFeedback(action: "confirm" | "edit" | "reject", corrected?: { name: string; revised: string; index?: number }) {
    setIsSubmittingFeedback(true);
    try {
        await fetch(`${API.base}/api/ocr/feedback`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageHex: imagePreview, cardName: corrected?.name || "all_board", action, correctedName: corrected?.revised || "", cardIndex: corrected?.index }) });
        if (action === "confirm") setParsedHand({ ...parsedHand!, parsed_data: { ...handData, ocr_result: { ...handData.ocr_result, decision: "auto_accept" } } });
    } catch (err) { console.error("Feedback failed:", err); }
    finally { setIsSubmittingFeedback(false); }
}
function handleCardEdit(newVal: string) {
    if (!editingCard || !parsedHand) return;
    if (editingCard.type === "board") {
        const nb = [...handData.board]; const old = nb[editingCard.index]; nb[editingCard.index] = newVal;
        setParsedHand({ ...parsedHand, parsed_data: { ...handData, board: nb } });
        handleFeedback("edit", { name: old, revised: newVal, index: editingCard.index });
    } else {
        const np = [...handData.players]; const p = np[editingCard.pIdx!]; const nc = [...(p.hole_cards || [])]; const old = nc[editingCard.index] || "??";
        nc[editingCard.index] = newVal; np[editingCard.pIdx!] = { ...p, hole_cards: nc };
        setParsedHand({ ...parsedHand, parsed_data: { ...handData, players: np } });

        handleFeedback("edit", { name: old, revised: newVal, index: editingCard.index });

    }

}

const editable = !analysis;

const board: string[] = handData?.board || [];

const streetDefs: { key: string; label: string; cards: string[]; boardStart: number }[] = [

    { key: "blinds_ante", label: "BLINDS & ANTE", cards: [], boardStart: 0 },

    { key: "preflop", label: "PRE-FLOP", cards: [], boardStart: 0 },

    { key: "flop", label: "FLOP", cards: board.slice(0, 3), boardStart: 0 },

    { key: "turn", label: "TURN", cards: board.slice(3, 4), boardStart: 3 },

    { key: "river", label: "RIVER", cards: board.slice(4, 5), boardStart: 4 },

];

// ─── RENDER ──────────────────────────────────────────────────────────────

return (

    <>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start bg-black/40 shadow-2xl backdrop-blur-sm border border-white/10 text-gray-200 p-4 rounded-xl" style={{ fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: "tabular-nums" }}>

            {/* ═══ LEFT: Input ═══ */}

            <div className={`xl:col-span-3 ${handData ? "xl:sticky xl:top-20" : ""}`}>

                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-3 text-sm shadow-xl">

                    <div className="flex gap-2 mb-2">

                        <button onClick={() => setInputType("text")} className={`text-xs px-2 py-1 rounded ${inputType === "text" ? "bg-gray-800 text-white" : "text-gray-600"}`}>TXT</button>

                        <button onClick={() => setInputType("image")} className={`text-xs px-2 py-1 rounded ${inputType === "image" ? "bg-gray-800 text-white" : "text-gray-600"}`}>IMG</button>

                    </div>

                    {inputType === "text" ? (

                        <textarea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Paste hand history..."

                            className="w-full h-20 bg-transparent border border-gray-800 rounded p-2 text-xs text-gray-400 placeholder-gray-700 resize-none focus:outline-none" />

                    ) : (

                        <div className="space-y-2">

                            <div onClick={() => fileInputRef.current?.click()} className="h-16 border border-dashed border-gray-800 rounded flex items-center justify-center cursor-pointer hover:border-gray-600 text-xs text-gray-600 transition-colors">

                                {imagePreview ? "✓ loaded — click to change" : "Drop / Paste / Click"}

                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                            </div>

                            {imagePreview && (

                                <div className="rounded-lg overflow-hidden border border-gray-800 relative group bg-black mt-2 shadow-inner">

                                    <img src={imagePreview} alt="Hand preview" className="w-full h-auto block" />

                                    <button onClick={(e) => { e.stopPropagation(); setImagePreview(null); }} className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white w-7 h-7 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md backdrop-blur-md border border-white/10">✕</button>

                                </div>

                            )}

                        </div>

                    )}

                    <button onClick={handleParse} disabled={isParsing || isAnalyzing}

                        className="mt-2 w-full py-2 bg-yellow-400 text-black text-xs font-bold uppercase rounded disabled:opacity-30">

                        {isParsing ? "PROCESSING..." : isReviewing ? "RE-PARSE" : "PARSE"}

                    </button>

                    {quotaError && (

                        <div className="mt-2 text-xs text-yellow-500 border-t border-gray-800 pt-2">

                            <p className="font-bold uppercase">{quotaError.type} limit: {quotaError.used}/{quotaError.limit}</p>

                            {quotaError.resetsAt && <p className="text-gray-600">Resets {new Date(quotaError.resetsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>}

                            <a href="/pricing" className="text-yellow-400 hover:underline">Upgrade →</a>

                        </div>

                    )}

                    {error && !quotaError && <p className="mt-2 text-xs text-red-500">{error}</p>}

                </div>

            </div>

            {/* ═══ RIGHT: Timeline ═══ */}

            <div className="xl:col-span-9">

                {!handData && (

                    <div className="flex items-center justify-center min-h-[40vh] text-gray-700 text-sm">

                        Awaiting input

                    </div>

                )}

                {/* ═══ THE TIMELINE ═══ */}

                {handData && handData.board && (

                    <div className="bg-transparent text-sm max-w-[1200px] mx-auto w-full">

                        {/* OCR line */}

                        {handData.ocr_result && (

                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">

                                <span>OCR {(handData.ocr_result.confidence * 100).toFixed(0)}%</span>

                                <span>·</span>

                                <span>{handData.ocr_result.decision_reason?.join(" · ")}</span>

                                {handData.ocr_result.decision !== "auto_accept" && (

                                    <button onClick={() => handleFeedback("confirm")} disabled={isSubmittingFeedback}

                                        className="text-green-500 hover:underline font-bold">{isSubmittingFeedback ? "..." : "✓ confirm"}</button>

                                )}

                            </div>

                        )}

                        {/* Hole cards line */}

                        {handData.players?.some((p: any) => p.hole_cards?.length > 0) && (

                            <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">

                                {handData.players.filter((p: any) => p.hole_cards?.length > 0).map((p: any, i: number) => {

                                    const paddedHoleCards = p.hole_cards.length === 1 ? [...p.hole_cards, "??"] : p.hole_cards;

                                    return (

                                        <span key={i} className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm shadow-sm rounded-md px-2 py-2 border border-white/10">

                                            <span className="text-gray-300 font-bold">{p.name}</span>

                                            {paddedHoleCards.map((c: string, ci: number) => (

                                                <CardBadge key={ci} card={c} onClick={editable ? () => setEditingCard({ type: "hole", index: ci, pIdx: handData.players.indexOf(p) }) : undefined} />

                                            ))}

                                        </span>

                                    )
                                })}

                                {handData.winner && <span className="text-green-500 ml-auto font-bold">🏆 {handData.winner}</span>}

                                {handData.pot != null && <span className="text-gray-500">Pot: {handData.currency && handData.currency !== 'BB' ? handData.currency : ''}{handData.pot}{handData.currency === 'BB' || !handData.currency ? ' BB' : ''}</span>}

                            </div>

                        )}

                        {/* Street blocks — 3-col grid (Vertical flow order) */}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

                            {/* Column 1: Blinds + Pre-Flop */}

                            <div className="flex flex-col gap-3">

                                {streetDefs.slice(0, 2).map(({ key, label, cards, boardStart }) => (

                                    <StreetBlock key={key} streetKey={key} label={label} pot={handData.street_pots?.[key]} boardCards={cards} actions={handData.actions?.[key] || []} editable={editable} onSetEditingCard={setEditingCard} boardStartIndex={boardStart} handData={handData} parsedHand={parsedHand} setParsedHand={setParsedHand} currency={handData.currency} />

                                ))}

                            </div>

                            {/* Column 2: Flop + Turn */}

                            <div className="flex flex-col gap-3">

                                {streetDefs.slice(2, 4).map(({ key, label, cards, boardStart }) => (

                                    <StreetBlock key={key} streetKey={key} label={label} pot={handData.street_pots?.[key]} boardCards={cards} actions={handData.actions?.[key] || []} editable={editable} onSetEditingCard={setEditingCard} boardStartIndex={boardStart} handData={handData} parsedHand={parsedHand} setParsedHand={setParsedHand} currency={handData.currency} />

                                ))}

                            </div>

                            {/* Column 3: River + Showdown */}

                            <div className="flex flex-col gap-3">

                                {streetDefs.slice(4).map(({ key, label, cards, boardStart }) => (

                                    <StreetBlock key={key} streetKey={key} label={label} pot={handData.street_pots?.[key]} boardCards={cards} actions={handData.actions?.[key] || []} editable={editable} onSetEditingCard={setEditingCard} boardStartIndex={boardStart} handData={handData} parsedHand={parsedHand} setParsedHand={setParsedHand} currency={handData.currency} />

                                ))}

                                <ShowdownBlock players={handData.showdown_players || []} currency={handData.currency} />

                            </div>

                        </div>

                        {/* Run analysis */}

                        {!analysis && (

                            <button onClick={handleRunAnalysis} disabled={isAnalyzing}

                                className="mt-2 w-full py-2 bg-green-700 hover:bg-green-600 text-white text-xs font-bold uppercase rounded disabled:opacity-30">

                                {isAnalyzing ? "ANALYZING..." : "RUN AI LEAK SCAN"}

                            </button>

                        )}

                    </div>

                )}

                {/* ═══ ANALYSIS ═══ */}

                {analysis && (

                    <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg shadow-xl text-sm p-5 mt-2 space-y-4">

                        {/* Grade + Summary */}

                        <div>

                            <div className="flex items-center gap-3 mb-2">

                                <span className="text-xs text-gray-600 uppercase font-bold">Analysis</span>

                                {analysis.final_verdict && (

                                    <>

                                        <span className="text-yellow-400 font-bold text-lg">{analysis.final_verdict.grade}</span>

                                        <span className="text-gray-600 text-xs">{((analysis.final_verdict.confidence_score || 0) * 100).toFixed(0)}%</span>

                                        {analysis.final_verdict.suggestion_type && (

                                            <span className={`text-xs font-bold uppercase ${analysis.final_verdict.suggestion_type === "Exploit" ? "text-purple-400" : "text-green-500"}`}>

                                                {analysis.final_verdict.suggestion_type}

                                            </span>

                                        )}

                                    </>

                                )}

                            </div>

                            <p className="text-gray-400">{analysis.summary}</p>

                        </div>

                        {/* Reasoning */}

                        {analysis.reasoning_trace?.length > 0 && (

                            <div>

                                <span className="text-xs text-gray-600 uppercase font-bold block mb-1">Reasoning</span>

                                {analysis.reasoning_trace.map((s, i) => (

                                    <div key={i} className="flex gap-2 py-0.5">

                                        <span className="text-gray-700 w-4 text-right">{i + 1}.</span>

                                        <span className="text-gray-500">{s}</span>

                                    </div>

                                ))}

                            </div>

                        )}

                        {/* Mistakes */}

                        <div>

                            <span className="text-xs text-orange-400 uppercase font-bold block mb-1">Mistakes ({analysis.mistakes?.length || 0})</span>

                            {analysis.mistakes?.length > 0 ? analysis.mistakes.map((m, i) => {

                                const sevColor: Record<string, string> = { critical: "text-red-500", moderate: "text-orange-400", minor: "text-blue-400" };

                                return (

                                    <div key={i} className="py-1 border-b border-gray-900 last:border-0">

                                        <div className="flex items-center gap-2 text-xs mb-0.5">

                                            <span className="text-yellow-400 font-bold uppercase">{m.street}</span>

                                            {m.position && <span className="text-green-500 font-bold">{m.position}</span>}

                                            <span className={`font-bold uppercase ${sevColor[m.severity || "minor"] || "text-blue-400"}`}>{m.severity || "minor"}</span>

                                            <span className="text-white font-bold">{m.player}</span>

                                            <span className="ml-auto"><SaveNoteButton noteData={{ player_name: m.player, content: m.description, street: m.street, note_type: "Custom", source: "ai", hand_id: parsedHand?.id }} /></span>

                                        </div>

                                        <p className="text-gray-500">{m.description}</p>

                                        {m.better_line && <p className="text-green-500 text-xs mt-0.5">Better: <span className="text-gray-500 italic">{m.better_line}</span></p>}

                                        {m.gto_deviation_reason && <p className="text-purple-400 text-xs italic mt-0.5">💡 {m.gto_deviation_reason}</p>}

                                    </div>

                                );

                            }) : <p className="text-gray-700 italic">No mistakes detected.</p>}

                        </div>

                        {/* Exploits */}

                        {analysis.exploit_suggestions?.length > 0 && (

                            <div>

                                <span className="text-xs text-purple-400 uppercase font-bold block mb-1">Exploit Plan</span>

                                {analysis.exploit_suggestions.map((s, i) => (

                                    <p key={i} className="text-gray-500 py-0.5">• {s}</p>

                                ))}

                            </div>

                        )}

                        <button onClick={() => { setAnalysis(null); setParsedHand(null); setIsReviewing(false); setError(null); }}

                            className="text-xs text-gray-600 hover:text-yellow-400 uppercase font-bold">↺ new hand</button>

                    </div>

                )}

            </div>

        </div>

        {/* Card picker */}

        {editingCard && (

            <CardPicker

                currentVal={editingCard.type === "board" ? handData.board[editingCard.index] : handData.players[editingCard.pIdx!]?.hole_cards?.[editingCard.index]}

                onSelect={v => { handleCardEdit(v); setEditingCard(null); }}

                onCancel={() => setEditingCard(null)}

            />

        )}

    </>

);

}