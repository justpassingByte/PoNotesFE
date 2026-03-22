import Link from 'next/link';
import { ShieldAlert, Crosshair, AlertTriangle, Trash2, Brain, Plus, History, FileText } from 'lucide-react';

export interface PlayerHUDProps {
    id: string;
    name: string;
    playstyle: string;
    aggressionScore: number;
    notesCount: number;
    platformName?: string;
    ai_playstyle?: string | null;
    ai_aggression_score?: number | null;
    ai_exploit_strategy?: string | null;
    ai_profile?: any;
    onAddNote?: () => void;
    onDelete?: () => void;
}

export function PlayerHUD({ 
    id, name, playstyle, aggressionScore, notesCount, platformName, 
    ai_playstyle, ai_aggression_score, ai_exploit_strategy, ai_profile,
    onAddNote, onDelete 
}: PlayerHUDProps) {

    // Decide color logic based on playstyle
    const getPlaystyleColor = (style: string) => {
        switch (style.toUpperCase()) {
            case 'LAG': return 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
            case 'TAG': return 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
            case 'NIT': return 'bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
            case 'FISH': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
            case 'WHALE': return 'bg-amber-600/30 text-gold border-gold/50 shadow-[0_0_15px_rgba(255,191,0,0.3)] animate-pulse';
            case 'MANIAC': return 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    const getAggressionIcon = (score: number) => {
        if (score > 60) return <AlertTriangle className="w-4 h-4 text-red-500" />;
        if (score > 30) return <Crosshair className="w-4 h-4 text-yellow-500" />;
        return <ShieldAlert className="w-4 h-4 text-green-500" />;
    };

    const strategy = ai_exploit_strategy || ai_profile?.strategy;
    const ai_archetype = ai_playstyle || ai_profile?.archetype;

    return (
        <Link href={`/players/${id}`} className="block bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:bg-card/60 transition-all hover:-translate-y-1 cursor-pointer no-underline min-h-[300px] flex flex-col">
            {/* Decorative Card Background Element */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-felt-light/20 to-transparent opacity-50 rounded-full pointer-events-none group-hover:opacity-80 transition-opacity"></div>

            <div className="flex justify-between items-start mb-4">
                <div className="space-y-0.5">
                    <h3 className="font-black text-xl text-white tracking-tight truncate max-w-[150px]">{name}</h3>
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.1em] block">{platformName || 'Unknown Platform'}</span>
                </div>
                <div className={`px-2 py-1 text-[9px] font-black rounded-lg border ${getPlaystyleColor(playstyle)} transition-all uppercase tracking-tight shadow-sm`}>
                    {playstyle}
                </div>
            </div>

            {/* AI HUD Section - HIGHLIGHTED */}
            {(ai_archetype || (ai_profile?.range_adjustments && ai_profile.range_adjustments.length > 0)) && (
                <div className="bg-gold/5 border border-gold/10 rounded-2xl p-4 mb-6 shadow-inner">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
                            <span className="text-[10px] text-gold font-black uppercase tracking-widest">Range Adjustments</span>
                        </div>
                        {ai_archetype && (
                            <span className={`px-1.5 py-0.5 text-[8px] font-black rounded border ${getPlaystyleColor(ai_archetype)}`}>
                                {ai_archetype}
                            </span>
                        )}
                    </div>

                    {/* Range Adjustments - High Value Info for HUD */}
                    {ai_profile?.range_adjustments && ai_profile.range_adjustments.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                            {ai_profile.range_adjustments.slice(0, 3).map((adj: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-xl px-3 py-2">
                                    <Brain className="w-3 h-3 text-gold/60 flex-shrink-0" />
                                    <span className="text-[11px] text-gray-100 font-bold leading-tight">{adj}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-[10px] text-gray-600 italic uppercase tracking-widest text-center py-2">Calculating exploits...</div>
                    )}
                </div>
            )}

            {/* Reverted Metrics (with Labels) */}
            <div className="space-y-3 mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {getAggressionIcon(ai_aggression_score ?? aggressionScore)}
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Aggression</span>
                    </div>
                    <span className="text-sm font-black font-mono text-white">
                        {ai_aggression_score ?? aggressionScore}%
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Data Depth</span>
                    </div>
                    <span className="text-sm font-black font-mono text-white">{notesCount} Notes</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-gold/50" />
                    <span className="text-[8px] font-black tracking-widest text-gold/70">ARCHIVE</span>
                </div>
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddNote?.(); }}
                    className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-full transition-all border border-white/10 hover:border-white/20"
                    title="Quick Note"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>
        </Link>
    );
}

