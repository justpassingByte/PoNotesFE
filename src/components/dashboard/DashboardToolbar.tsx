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
        <div className="bg-card/40 backdrop-blur-2xl border border-white/5 rounded-t-2xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 mt-6 sm:mt-8 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>

            {/* Title row */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center tracking-wide">
                    <Users className="w-5 h-5 mr-2 sm:mr-3 text-gold" />
                    OPPONENT HUDS
                </h2>
            </div>

            {/* Controls row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                <div className="w-full sm:flex-1 sm:max-w-md">
                    <OCRSearchInput onSearch={onSearchChange} />
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 sm:gap-3 flex-1 sm:flex-none">
                        <span className="hidden sm:inline text-[10px] text-gray-400 uppercase tracking-widest font-bold shrink-0">Platform:</span>
                        <select
                            value={filterPlatform}
                            onChange={(e) => onPlatformFilterChange(e.target.value)}
                            className="w-full sm:w-auto bg-black/50 border border-white/10 rounded-full px-3 sm:px-4 py-1.5 min-h-[44px] sm:min-h-0 text-sm text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none cursor-pointer backdrop-blur-md transition-all hover:bg-black/70 appearance-none"
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
                            className="w-full sm:w-auto bg-black/50 border border-white/10 rounded-full px-3 sm:px-4 py-1.5 min-h-[44px] sm:min-h-0 text-sm text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none cursor-pointer backdrop-blur-md transition-all hover:bg-black/70 appearance-none"
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
        </div>
    );
}
