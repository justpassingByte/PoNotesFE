import Link from 'next/link';
import { ShieldAlert, Crosshair, AlertTriangle } from 'lucide-react';

export interface PlayerHUDProps {
    id: string;
    name: string;
    playstyle: string;
    aggressionScore: number;
    notesCount: number;
    platformName?: string;
    onAddNote?: () => void;
}

export function PlayerHUD({ id, name, playstyle, aggressionScore, notesCount, platformName, onAddNote }: PlayerHUDProps) {

    // Decide color logic based on playstyle
    const getPlaystyleColor = (style: string) => {
        switch (style.toUpperCase()) {
            case 'LAG': return 'bg-red-500/20 text-red-500 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
            case 'TAG': return 'bg-blue-500/20 text-blue-500 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
            case 'NIT': return 'bg-green-500/20 text-green-500 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
            case 'FISH': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
            case 'MANIAC': return 'bg-purple-500/20 text-purple-500 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    const getAggressionIcon = (score: number) => {
        if (score > 60) return <AlertTriangle className="w-4 h-4 text-red-500" />;
        if (score > 30) return <Crosshair className="w-4 h-4 text-yellow-500" />;
        return <ShieldAlert className="w-4 h-4 text-green-500" />;
    };

    return (
        <Link href={`/players/${id}`} className="block bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:bg-card/60 transition-all hover:-translate-y-1 cursor-pointer no-underline">
            {/* Decorative Card Background Element */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-felt-light/20 to-transparent opacity-50 rounded-full pointer-events-none group-hover:opacity-80 transition-opacity"></div>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-xl text-white tracking-wide">{name}</h3>
                    <span className="text-xs text-gray-400 font-medium">{platformName || 'Unknown Platform'}</span>
                </div>
                <div className={`px-2.5 py-1 text-xs font-bold rounded border ${getPlaystyleColor(playstyle)} transition-all`}>
                    {playstyle.toUpperCase()}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Aggression</span>
                    <div className="flex items-center space-x-2">
                        {getAggressionIcon(aggressionScore)}
                        <span className="text-xl font-bold font-mono text-gray-200">{aggressionScore}</span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Notes</span>
                    <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-gold"></span>
                        <span className="text-xl font-bold font-mono text-gray-200">{notesCount}</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold/70 group-hover:text-gold transition-colors">
                    VIEW PROFILE
                </span>
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddNote?.(); }}
                    className="bg-white/5 hover:bg-white/10 text-white text-xs px-4 py-1.5 rounded-full transition-all border border-white/10 hover:border-white/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] font-medium"
                >
                    + Add Note
                </button>
            </div>
        </Link>
    );
}
