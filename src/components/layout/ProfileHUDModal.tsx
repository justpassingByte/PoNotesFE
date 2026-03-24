"use client";

import { useState } from "react";
import { X, Crown, Zap, ShieldCheck, LogOut, ArrowUpRight, Star, Brain, AlertTriangle, Crosshair, ShieldAlert, FileText, History, CreditCard, Sparkles } from "lucide-react";
import { logout } from "@/app/auth-actions";

interface ProfileHUDModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: { email: string; premium_tier: string } | null;
    stats?: {
        totalCount: number;
        totalNotesCount: number;
        aiUsage?: { remaining: number; limit: number; resetsAt: string };
        ocrUsage?: { remaining: number; limit: number; resetsAt: string };
    };
    topWhales?: any[];
    topRegs?: any[];
}

const PLAN_CONFIG: Record<string, {
    label: string;
    color: string;
    bg: string;
    border: string;
    glow: string;
    icon: React.ReactNode;
    features: string[];
    upgrade?: { label: string; href: string };
}> = {
    FREE: {
        label: "Free Tier",
        color: "text-gray-400",
        bg: "bg-gray-500/10",
        border: "border-gray-500/20",
        glow: "",
        icon: <ShieldCheck className="w-4 h-4 text-gray-400" />,
        features: ["5 AI Scans / month", "10 Hand Analyses / month", "Basic Player HUD"],
        upgrade: { label: "Upgrade to Pro", href: "/pricing" },
    },
    PRO: {
        label: "Pro",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
        icon: <Star className="w-4 h-4 text-blue-400" />,
        features: ["100 AI Scans / month", "50 Hand Analyses / month", "Advanced Player HUD", "AI Neural Tuning"],
        upgrade: { label: "Upgrade to Elite", href: "/pricing" },
    },
    ELITE: {
        label: "Elite",
        color: "text-gold",
        bg: "bg-gold/10",
        border: "border-gold/30",
        glow: "shadow-[0_0_25px_rgba(250,204,21,0.15)]",
        icon: <Crown className="w-4 h-4 text-gold" />,
        features: ["Unlimited AI Scans", "Unlimited Hand Analyses", "Full Poker HUD Suite", "Priority Neural Processing"],
    },
};

function UsageBar({ label, remaining, limit, color = "gold" }: { label: string; remaining: number; limit: number; color?: string }) {
    const pct = limit > 0 ? Math.round(((limit - remaining) / limit) * 100) : 0;
    const barColor = color === "gold" ? "bg-gold" : "bg-blue-400";
    const textColor = color === "gold" ? "text-gold" : "text-blue-400";
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
                <span className={`text-[10px] font-black font-mono ${textColor}`}>{remaining} / {limit}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full ${barColor} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function getPlaystyleColor(style: string) {
    switch (style?.toUpperCase()) {
        case 'LAG': return 'text-red-400 bg-red-500/10 border-red-500/30';
        case 'TAG': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
        case 'NIT': return 'text-green-400 bg-green-500/10 border-green-500/30';
        case 'FISH': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
        case 'WHALE': return 'text-gold bg-gold/10 border-gold/30 animate-pulse';
        case 'MANIAC': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
        default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
}

function MiniPlayerRow({ player, isStrong = false }: { player: any; isStrong?: boolean }) {
    const aggression = player.ai_aggression_score ?? player.aggression_score ?? 0;
    const style = player.ai_playstyle || player.playstyle || 'UNKNOWN';
    return (
        <div className={`flex items-center justify-between px-3 py-2 rounded-xl border bg-black/30 ${isStrong ? 'border-red-500/10' : 'border-gold/10'} hover:border-white/20 transition-all`}>
            <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isStrong ? 'bg-red-400' : 'bg-gold'}`} />
                <span className="text-xs font-bold text-white truncate">{player.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-black uppercase tracking-wide ${getPlaystyleColor(style)}`}>
                    {style}
                </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
                {aggression > 60
                    ? <AlertTriangle className="w-3 h-3 text-red-400" />
                    : aggression > 30
                        ? <Crosshair className="w-3 h-3 text-yellow-400" />
                        : <ShieldAlert className="w-3 h-3 text-green-400" />
                }
                <span className={`text-[10px] font-black font-mono ${isStrong ? 'text-red-400' : 'text-white'}`}>{aggression}%</span>
            </div>
        </div>
    );
}

export function ProfileHUDModal({ isOpen, onClose, user, stats, topWhales = [], topRegs = [] }: ProfileHUDModalProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const tier = user?.premium_tier?.toUpperCase() || "FREE";
    const plan = PLAN_CONFIG[tier] || PLAN_CONFIG.FREE;
    const displayName = user?.email?.split("@")[0] || "HERO";
    const resetsAtDate = stats?.aiUsage?.resetsAt
        ? new Date(stats.aiUsage.resetsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : null;

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-end sm:justify-end sm:pr-6 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Slide-in panel from right */}
            <div className="bg-[#0e0e0e] border border-white/10 w-full sm:w-[360px] max-h-[95vh] rounded-t-2xl sm:rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.8)] flex flex-col animate-in slide-in-from-right-8 sm:slide-in-from-right-8 duration-300 overflow-hidden">
                {/* Gold accent top */}
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gold/60 to-transparent shrink-0" />

                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-white/5 flex items-start justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-amber-700/30 border border-gold/30 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.15)]">
                            <span className="text-sm font-black text-gold">{displayName.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <p className="text-sm font-black text-white uppercase tracking-tight">{displayName}</p>
                            <p className="text-[10px] text-gray-500 font-medium">{user?.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto scrollbar-hide flex-1 p-5 space-y-5">

                    {/* ── Plan Badge ── */}
                    <div className={`p-4 rounded-2xl border ${plan.bg} ${plan.border} ${plan.glow}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                {plan.icon}
                                <span className={`text-xs font-black uppercase tracking-widest ${plan.color}`}>{plan.label}</span>
                            </div>
                            {resetsAtDate && (
                                <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Resets {resetsAtDate}</span>
                            )}
                        </div>
                        <div className="space-y-2">
                            {plan.features.map((f, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-1 h-1 rounded-full ${plan.color.replace('text-', 'bg-')}`} />
                                    <span className="text-[10px] text-gray-400 font-medium">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Usage Bars ── */}
                    {(stats?.aiUsage || stats?.ocrUsage) && (
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                <Zap className="w-3 h-3 text-gold" /> Usage This Cycle
                            </span>
                            {stats?.aiUsage && (
                                <UsageBar label="AI Scans Used" remaining={stats.aiUsage.remaining} limit={stats.aiUsage.limit} color="gold" />
                            )}
                            {stats?.ocrUsage && (
                                <UsageBar label="OCR Hand Analyses" remaining={stats.ocrUsage.remaining} limit={stats.ocrUsage.limit} color="blue" />
                            )}
                        </div>
                    )}

                    {/* ── Upgrade CTA ── */}
                    {plan.upgrade && (
                        <a
                            href={plan.upgrade.href}
                            className="group flex items-center justify-between w-full px-5 py-4 bg-gradient-to-r from-gold/15 to-amber-700/10 border border-gold/30 rounded-2xl hover:from-gold/25 hover:to-amber-600/20 transition-all shadow-[0_0_20px_rgba(250,204,21,0.05)] hover:shadow-[0_0_30px_rgba(250,204,21,0.15)]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gold/20 flex items-center justify-center">
                                    <Crown className="w-4 h-4 text-gold" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-black text-gold uppercase tracking-wider">{plan.upgrade.label}</p>
                                    <p className="text-[9px] text-gray-500 font-medium">Unlock full neural power</p>
                                </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-gold/60 group-hover:text-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </a>
                    )}

                    {/* ── Poker HUD – Top Targets ── */}
                    {(topWhales.length > 0 || topRegs.length > 0) && (
                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                <Brain className="w-3 h-3 text-gold" /> Poker HUD Targets
                            </span>

                            {topWhales.slice(0, 3).length > 0 && (
                                <div className="space-y-1.5">
                                    <p className="text-[9px] text-gold/70 font-black uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
                                        Fish Targets
                                    </p>
                                    {topWhales.slice(0, 3).map((p: any) => (
                                        <MiniPlayerRow key={p.id} player={p} />
                                    ))}
                                </div>
                            )}

                            {topRegs.slice(0, 3).length > 0 && (
                                <div className="space-y-1.5">
                                    <p className="text-[9px] text-red-400/70 font-black uppercase tracking-widest flex items-center gap-1.5 mt-2">
                                        <span className="w-1 h-1 rounded-full bg-red-400" />
                                        Reg Opponents
                                    </p>
                                    {topRegs.slice(0, 3).map((p: any) => (
                                        <MiniPlayerRow key={p.id} player={p} isStrong />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer: Logout ── */}
                <div className="px-5 pb-5 pt-3 border-t border-white/5 shrink-0">
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
                    >
                        <LogOut className="w-4 h-4" />
                        {isLoggingOut ? "Logging out..." : "Log Out"}
                    </button>
                </div>
            </div>
        </div>
    );
}
