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
    onAddNote?: () => void;
    onDelete?: () => void;
}

export function PlayerHUD({ 
    id, name, playstyle, aggressionScore, notesCount, platformName, 
    ai_playstyle, ai_aggression_score, ai_exploit_strategy,
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

    return (
        <Link href={`/players/${id}`} className="block bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:bg-card/60 transition-all hover:-translate-y-1 cursor-pointer no-underline min-h-[280px] flex flex-col">
            {/* Decorative Card Background Element */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-felt-light/20 to-transparent opacity-50 rounded-full pointer-events-none group-hover:opacity-80 transition-opacity"></div>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-xl text-white tracking-wide truncate max-w-[150px]">{name}</h3>
                    <span className="text-xs text-gray-400 font-medium">{platformName || 'Unknown Platform'}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`px-2.5 py-1 text-[10px] font-black rounded border ${getPlaystyleColor(playstyle)} transition-all uppercase tracking-tighter`}>
                        {playstyle}
                    </div>
                </div>
            </div>

            {/* AI HUD Section - HIGHLIGHTED */}
            {ai_playstyle && (
                <div className="bg-gold/5 border border-gold/20 rounded-xl p-3 mb-4 animate-in fade-in slide-in-from-top-2 duration-700">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
                            <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">AI ANALYSIS</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded border ${getPlaystyleColor(ai_playstyle)}`}>
                            {ai_playstyle}
                        </span>
                    </div>
                    {ai_exploit_strategy && (
                        <div className="mt-2 space-y-1">
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter block">Exploit Strategy:</span>
                            <p className="text-[10px] text-gray-300 italic line-clamp-2 leading-relaxed border-l-2 border-gold/30 pl-2">
                                {ai_exploit_strategy}
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Aggression</span>
                    <div className="flex items-center space-x-2">
                        {getAggressionIcon(ai_aggression_score ?? aggressionScore)}
                        <span className="text-xl font-black font-mono text-gray-200">
                            {ai_aggression_score ?? aggressionScore}%
                        </span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Total Notes</span>
                    <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-gold"></span>
                        <span className="text-xl font-black font-mono text-gray-200">{notesCount}</span>
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

