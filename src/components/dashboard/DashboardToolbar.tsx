"use client";

import { Users } from "lucide-react";
import { OCRSearchInput } from "@/components/layout/OCRSearchInput";

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
}: DashboardToolbarProps) {
    const distinctPlaystyles = Object.keys(playstyleCounts);

    return (
        <div className="bg-card/40 backdrop-blur-2xl border border-white/5 rounded-t-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>
            <h2 className="text-xl font-bold text-white flex items-center min-w-[200px] tracking-wide">
                <Users className="w-5 h-5 mr-3 text-gold" />
                OPPONENT HUDS
            </h2>

            {/* Table-like Control Bar */}
            <div className="flex flex-1 items-center justify-end space-x-6 w-full">
                <div className="w-full max-w-md">
                    <OCRSearchInput onSearch={onSearchChange} />
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Platform:</span>
                    <select
                        value={filterPlatform}
                        onChange={(e) => onPlatformFilterChange(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none cursor-pointer backdrop-blur-md transition-all hover:bg-black/70 appearance-none"
                    >
                        <option value="All">All Platforms</option>
                        {distinctPlatforms.map(platform => (
                            <option key={platform} value={platform}>{platform}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Style:</span>
                    <select
                        value={filterPlaystyle}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none cursor-pointer backdrop-blur-md transition-all hover:bg-black/70 appearance-none"
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
    );
}
