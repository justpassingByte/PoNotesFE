"use client";

import { Upload, Plus, Download } from "lucide-react";
import { API } from "@/lib/api";

interface MetricsBarProps {
    totalCount: number;
    totalNotesCount: number;
    playstyleCounts: Record<string, number>;
    onImportClick: () => void;
    onAddPlayerClick: () => void;
}

export function MetricsBar({
    totalCount,
    totalNotesCount,
    playstyleCounts,
    onImportClick,
    onAddPlayerClick,
}: MetricsBarProps) {
    const playstyleEntries = Object.entries(playstyleCounts);

    return (
        <div className="mb-10 p-6 bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* Metrics Row */}
                <div className="flex items-center gap-8">
                    {/* Total Opponents */}
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold font-mono text-white">{totalCount}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Opponents</span>
                    </div>

                    <div className="w-px h-10 bg-white/10"></div>

                    {/* Total Notes */}
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold font-mono text-gold">{totalNotesCount}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Notes</span>
                    </div>

                    <div className="w-px h-10 bg-white/10"></div>

                    {/* Playstyle Breakdown */}
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Playstyle Breakdown</span>
                        <div className="flex flex-wrap gap-2">
                            {playstyleEntries.length > 0 ? (
                                playstyleEntries.map(([style, count]) => (
                                    <span key={style} className="text-[11px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-300 font-medium">
                                        {style} <strong className="text-white ml-1">{count}</strong>
                                    </span>
                                ))
                            ) : (
                                <span className="text-[11px] text-gray-600 italic">No data yet</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 shrink-0">
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch(API.playerExport);
                                const json = await res.json();
                                if (json.success && json.data) {
                                    const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `villainvault-export-${new Date().toISOString().slice(0, 10)}.json`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }
                            } catch (e) { console.error("Export failed", e); }
                        }}
                        className="flex items-center px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <button
                        onClick={onImportClick}
                        className="flex items-center px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </button>
                    <button
                        onClick={onAddPlayerClick}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-gold to-yellow-400 text-black font-bold uppercase tracking-wider rounded-full text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Player
                    </button>
                </div>
            </div>
        </div>
    );
}
