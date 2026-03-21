"use client";

import { useState, useRef } from "react";
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

interface HandAnalysis {
    heroMistakes: { street: string; description: string; severity?: string }[];
    villainMistakes: { street: string; playerName?: string; description: string; severity?: string }[];
    betterLine?: string;
    exploitSuggestion?: string;
    summary?: string;
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

// ─── Save Note Button ────────────────────────────────────────────────────────
function SaveNoteButton({ noteData }: { noteData: any }) {
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

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
    const [inputType, setInputType] = useState<"text" | "image">("text");
    const [textInput, setTextInput] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [parsedHand, setParsedHand] = useState<Hand | null>(null);
    const [analysis, setAnalysis] = useState<HandAnalysis | null>(null);
    const [fromCache, setFromCache] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            if (!json.success) throw new Error(json.error || "Parsing failed");

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
            if (!json.success) throw new Error(json.error || "Analysis failed");

            setAnalysis(json.data.analysis);
            setIsReviewing(false);
        } catch (err: any) {
            setError(err.message || "AI Analysis failed");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handData = (parsedHand?.parsed_data as any) || parsedHand;

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
                            <img src={imagePreview} alt="Hand screenshot" className="max-h-36 rounded" />
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-gray-500 group-hover:text-gold/60 mb-2 transition-colors" />
                                <p className="text-sm text-gray-500 group-hover:text-gray-400">Click or drag to upload screenshot</p>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Board & Pot */}
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Community Cards</span>
                                <div className="flex gap-1.5 flex-wrap">
                                    {handData.board.length > 0 ? (
                                        handData.board.map((c: string, i: number) => <CardChip key={i} card={c} />)
                                    ) : (
                                        <span className="text-gray-500 text-sm italic">No cards matched</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Total Pot</span>
                                <div className="text-xl font-bold text-gold flex items-baseline gap-1">
                                    {handData.pot || 0}
                                    <span className="text-xs text-amber-600">BB</span>
                                </div>
                                {handData.winner && (
                                    <div className="mt-1 flex items-center gap-1.5">
                                        <span className="text-xs text-gray-400">Winner:</span>
                                        <span className="text-emerald-400 text-sm font-medium">🏆 {handData.winner}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Players */}
                        <div className="lg:col-span-2">
                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Detected Players</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                                {handData.players?.map((p: any, i: number) => (
                                    <div key={i} className="bg-black/30 rounded-lg px-3 py-2 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                                        <div>
                                            <span className="text-white text-sm font-medium">{p.name}</span>
                                            {p.position && (
                                                <span className="ml-1.5 text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1 py-0.5 rounded uppercase font-bold">{p.position}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {p.hole_cards?.map((c: string, j: number) => <CardChip key={j} card={c} />)}
                                            {p.stack != null && <span className="text-gold text-xs ml-1 font-mono font-bold">{p.stack} BB</span>}
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
                    
                    {/* Summary */}
                    {analysis.summary && (
                        <div className="bg-gradient-to-br from-card to-felt-dark/30 border border-gold/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Sparkles className="w-24 h-24 text-gold" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-gold" />
                                </div>
                                Strategic Tactical Summary
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed sm:text-base">{analysis.summary}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Hero Mistakes */}
                        <div className="bg-card border border-red-500/20 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-red-400 mb-5 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                    <XCircle className="w-4 h-4" />
                                </div>
                                Hero Mistakes ({analysis.heroMistakes.length})
                            </h3>
                            <div className="space-y-4">
                                {analysis.heroMistakes.length > 0 ? (
                                    analysis.heroMistakes.map((m, i) => (
                                        <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 transition-all hover:bg-white/[0.04]">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-gold uppercase font-black bg-gold/10 px-2 py-0.5 rounded tracking-tighter">{m.street}</span>
                                                    <SeverityBadge severity={m.severity} />
                                                </div>
                                                <SaveNoteButton
                                                    noteData={{
                                                        player_name: "Hero", 
                                                        content: m.description,
                                                        street: m.street,
                                                        note_type: "Custom",
                                                        source: "ai",
                                                        hand_id: parsedHand?.id
                                                    }}
                                                />
                                            </div>
                                            <p className="text-sm text-gray-300 leading-snug">{m.description}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-gray-500 italic text-sm">No significant mistakes detected. Perfect play!</div>
                                )}
                            </div>
                        </div>

                        {/* Villain Mistakes */}
                        <div className="bg-card border border-amber-500/20 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-amber-400 mb-5 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                Villain Leaks ({analysis.villainMistakes.length})
                            </h3>
                            <div className="space-y-4">
                                {analysis.villainMistakes.length > 0 ? (
                                    analysis.villainMistakes.map((m, i) => (
                                        <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 transition-all hover:bg-white/[0.04]">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-gold uppercase font-black bg-gold/10 px-2 py-0.5 rounded tracking-tighter">{m.street}</span>
                                                    <SeverityBadge severity={m.severity} />
                                                    {m.playerName && (
                                                        <span className="text-sm text-white font-bold">— {m.playerName}</span>
                                                    )}
                                                </div>
                                                {m.playerName && (
                                                    <SaveNoteButton
                                                        noteData={{
                                                            player_name: m.playerName,
                                                            content: m.description,
                                                            street: m.street,
                                                            note_type: "Custom",
                                                            source: "ai",
                                                            hand_id: parsedHand?.id
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-300 leading-snug">{m.description}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-gray-500 italic text-sm">Villain played a standard balanced range.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Better Line + Exploit */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {analysis.betterLine && (
                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 shadow-xl group">
                                <h3 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <CheckCircle className="w-4 h-4 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    </div>
                                    Optimal Hero Line (GTO)
                                </h3>
                                <p className="text-sm text-gray-300 leading-relaxed sm:text-base italic">"{analysis.betterLine}"</p>
                            </div>
                        )}

                        {analysis.exploitSuggestion && (
                            <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6 shadow-xl group">
                                <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Sparkles className="w-4 h-4 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                    </div>
                                    Exploit Advice
                                </h3>
                                <p className="text-sm text-gray-300 leading-relaxed sm:text-base">{analysis.exploitSuggestion}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
