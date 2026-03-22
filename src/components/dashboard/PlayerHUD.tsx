import Link from 'next/link';
import { ShieldAlert, Crosshair, AlertTriangle, Trash2 } from 'lucide-react';

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

            <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                    <h3 className="font-black text-2xl text-white tracking-tight truncate max-w-[200px]">{name}</h3>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] block">{platformName || 'Unknown Platform'}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className={`px-3 py-1.5 text-[11px] font-black rounded-lg border ${getPlaystyleColor(playstyle)} transition-all uppercase tracking-tighter shadow-sm`}>
                        {playstyle}
                    </div>
                </div>
            </div>

            {/* AI HUD Section - HIGHLIGHTED */}
            {(ai_archetype || (ai_profile?.range_adjustments && ai_profile.range_adjustments.length > 0)) && (
                <div className="bg-gold/5 border border-gold/10 rounded-2xl p-4 mb-6 shadow-inner">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gold animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.5)]"></span>
                            <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Neural Intelligence</span>
                        </div>
                        {ai_archetype && (
                            <span className={`px-2 py-0.5 text-[9px] font-black rounded border ${getPlaystyleColor(ai_archetype)}`}>
                                {ai_archetype}
                            </span>
                        )}
                    </div>

                    {/* Range Adjustments - High Value Info for HUD */}
                    {ai_profile?.range_adjustments && ai_profile.range_adjustments.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1.5">
                            {ai_profile.range_adjustments.slice(0, 3).map((adj: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-xl px-3 py-2 hover:border-gold/20 transition-all">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold/80"></div>
                                    <span className="text-[12px] text-gray-100 font-black tracking-tight leading-none">{adj}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-[10px] text-gray-600 italic uppercase tracking-widest text-center py-2">Calibrating Range Strategy...</div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-6 mt-auto">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1.5 ml-1">Aggression</span>
                    <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                        {getAggressionIcon(ai_aggression_score ?? aggressionScore)}
                        <span className="text-2xl font-black font-mono text-white tracking-tighter">
                            {ai_aggression_score ?? aggressionScore}%
                        </span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1.5 ml-1">Data Depth</span>
                    <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_10px_rgba(250,204,21,0.3)]"></div>
                        <span className="text-2xl font-black font-mono text-white tracking-tighter">{notesCount}</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[9px] uppercase font-black tracking-[0.3em] text-gold/70 group-hover:text-gold transition-colors">
                    FULL DATA
                </span>
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddNote?.(); }}
                    className="bg-white/5 hover:bg-white/10 text-white text-[10px] px-3 py-1.5 rounded-full transition-all border border-white/10 hover:border-white/20 font-bold uppercase tracking-tight"
                >
                    Quick Note
                </button>
            </div>
        </Link>
    );
}

