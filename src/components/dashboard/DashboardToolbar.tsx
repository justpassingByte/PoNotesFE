"use client";

import { Users, Download, Upload } from "lucide-react";
import { OCRSearchInput } from "@/components/layout/OCRSearchInput";
import { exportPlayersAction } from "@/app/actions";

interface DashboardToolbarProps {
    totalCount: number;
    playstyleCounts: Record<string, number>;
    searchQuery: string;
    filterPlaystyle: string;
    filterPlatform: string;
    distinctPlatforms: string[];
    onSearchChange: (query: string) => void;
    onFilterChange: (style: string) => void;
    onPlatformFilterChange: (platform: string) => void;
    onImportClick: () => void;
}

export function DashboardToolbar({
    totalCount,
    playstyleCounts,
    searchQuery,
    filterPlaystyle,
    filterPlatform,
    distinctPlatforms,
    onSearchChange,
    onFilterChange,
    onPlatformFilterChange,
    onImportClick,
}: DashboardToolbarProps) {
    const distinctPlaystyles = Object.keys(playstyleCounts);

    return (
        <div className="mb-6 sm:mb-8 p-4 sm:p-5 bg-[#111318] border border-gray-800 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>

            {/* Title row */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center tracking-wide">
                    <Users className="w-5 h-5 mr-2 sm:mr-3 text-gold" />
                    OPPONENT HUDS
                </h2>
            </div>

            {/* Controls row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full mt-3 sm:mt-4">
                <div className="w-full sm:flex-1 sm:max-w-md">
                    <OCRSearchInput onSearch={onSearchChange} />
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 sm:gap-3 flex-1 sm:flex-none">
                        <span className="hidden sm:inline text-[10px] text-gray-400 uppercase tracking-widest font-bold shrink-0">Platform:</span>
                        <select
                            value={filterPlatform}
                            onChange={(e) => onPlatformFilterChange(e.target.value)}
                            className="w-full sm:w-auto bg-black/40 border border-gray-800 rounded-full px-3 sm:px-4 py-1.5 min-h-[44px] sm:min-h-0 text-xs font-bold uppercase tracking-widest text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none cursor-pointer transition-all hover:bg-black/60 appearance-none"
                        >
                            <option value="All">All Platforms</option>
                            {distinctPlatforms.map(platform => (
                                <option key={platform} value={platform}>{platform}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-3 flex-1 sm:flex-none">
                        <span className="hidden sm:inline text-[10px] text-gray-400 uppercase tracking-widest font-bold shrink-0">Style:</span>
                        <select
                            value={filterPlaystyle}
                            onChange={(e) => onFilterChange(e.target.value)}
                            className="w-full sm:w-auto bg-black/40 border border-gray-800 rounded-full px-3 sm:px-4 py-1.5 min-h-[44px] sm:min-h-0 text-xs font-bold uppercase tracking-widest text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none cursor-pointer transition-all hover:bg-black/60 appearance-none"
                        >
                            <option value="All">All ({totalCount})</option>
                            {distinctPlaystyles.map(style => (
                                <option key={style} value={style}>
                                    {style} ({playstyleCounts[style] ?? 0})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Export/Import buttons row */}
            <div className="flex gap-2 sm:gap-3 w-full mt-3 sm:mt-4">
                <button
                    onClick={async () => {
                        try {
                            const data = await exportPlayersAction();
                            if (data) {
                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `villainvault-export-${new Date().toISOString().slice(0, 10)}.json`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }
                        } catch (e) {
                            console.error("Export failed", e);
                            alert("Export failed. Please check your session.");
                        }
                    }}
                    className="flex items-center justify-center flex-1 md:flex-none px-3 sm:px-4 py-2 min-h-[44px] bg-white/5 border border-gray-800 rounded-full text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all font-bold uppercase tracking-widest"
                >
                    <Download className="w-3.5 h-3.5 sm:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                </button>
                <button
                    onClick={onImportClick}
                    className="flex items-center justify-center flex-1 md:flex-none px-3 sm:px-4 py-2 min-h-[44px] bg-white/5 border border-gray-800 rounded-full text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all font-bold uppercase tracking-widest"
                >
                    <Upload className="w-3.5 h-3.5 sm:mr-2" />
                    <span className="hidden sm:inline">Import</span>
                </button>
            </div>
        </div>
    );
}
