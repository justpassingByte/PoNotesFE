"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { PlayerHUD } from "@/components/dashboard/PlayerHUD";
import { MetricsBar } from "@/components/dashboard/MetricsBar";
import { DashboardToolbar } from "@/components/dashboard/DashboardToolbar";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { AddPlayerForm } from "@/components/forms/AddPlayerForm";
import { AddNoteForm } from "@/components/forms/AddNoteForm";
import { ImportJsonModal } from "@/components/forms/ImportJsonModal";
import { TemplateManagerModal } from "@/components/forms/TemplateManagerModal";
import { loadMorePlayers, fetchFirstPage } from "@/app/actions";

// Define strict typing for Player matching the Backend return signature
export interface Player {
    id: string;
    name: string;
    playstyle: string;
    aggression_score: number;
    notesCount?: number;
    platform?: { id: string; name: string };
}

export interface PaginationMeta {
    totalCount: number;
    totalNotesCount: number;
    playstyleCounts: Record<string, number>;
    hasMore: boolean;
    nextCursor: string | null;
}

interface PlayerListClientProps {
    initialPlayers: Player[];
    initialMeta: PaginationMeta;
}

export function PlayerListClient({ initialPlayers, initialMeta }: PlayerListClientProps) {
    const [players, setPlayers] = useState<Player[]>(initialPlayers);
    const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
    const [cursor, setCursor] = useState<string | null>(initialMeta.nextCursor);
    const [hasMore, setHasMore] = useState(initialMeta.hasMore);
    const [isLoading, setIsLoading] = useState(false);

    // UI state
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isNoteModalOpen, setNoteModalOpen] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPlaystyle, setFilterPlaystyle] = useState('All');
    const [filterPlatform, setFilterPlatform] = useState('All');
    const [activePlayerForNote, setActivePlayerForNote] = useState<Player | null>(null);

    const sentinelRef = useRef<HTMLDivElement>(null);

    // Load more via Server Action
    const handleLoadMore = useCallback(async () => {
        if (isLoading || !hasMore || !cursor) return;
        setIsLoading(true);

        try {
            const result = await loadMorePlayers(cursor);
            setPlayers(prev => [...prev, ...result.data]);
            setMeta(result.meta);
            setHasMore(result.meta.hasMore);
            setCursor(result.meta.nextCursor);
        } catch (e) {
            console.error("Failed to load more players", e);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, cursor]);

    // Reset and reload from page 1 via Server Action
    const resetAndReload = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await fetchFirstPage();
            setPlayers(result.data);
            setMeta(result.meta);
            setHasMore(result.meta.hasMore);
            setCursor(result.meta.nextCursor);
        } catch (e) {
            console.error("Failed to reload players", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // IntersectionObserver for infinite scroll
    useEffect(() => {
        if (!sentinelRef.current || !hasMore || isLoading) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isLoading && hasMore && cursor) {
                    handleLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, isLoading, cursor, handleLoadMore]);

    // Filter Logic — operates on loaded players
    const filteredPlayers = players.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlaystyle = filterPlaystyle === 'All' || p.playstyle === filterPlaystyle;
        const matchesPlatform = filterPlatform === 'All' || p.platform?.name === filterPlatform;
        return matchesSearch && matchesPlaystyle && matchesPlatform;
    });

    // Extract distinct platforms from loaded data
    const distinctPlatforms = Array.from(new Set(players.map(p => p.platform?.name).filter(Boolean))) as string[];

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f2e1e] via-[#020202] to-black">
            <Header onSettingsClick={() => setSettingsOpen(true)} />

            <div className="flex-1 overflow-y-auto pt-32 p-8 relative scrollbar-thin scrollbar-thumb-felt-light scrollbar-track-transparent">
                {/* Decorative background */}
                <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
                    <div className="w-[500px] h-[500px] rounded-full bg-felt-light blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Metrics Bar */}
                    <MetricsBar
                        totalCount={meta.totalCount}
                        totalNotesCount={meta.totalNotesCount}
                        playstyleCounts={meta.playstyleCounts}
                        onImportClick={() => setImportModalOpen(true)}
                        onAddPlayerClick={() => setAddModalOpen(true)}
                    />

                    {/* Toolbar */}
                    <DashboardToolbar
                        totalCount={meta.totalCount}
                        playstyleCounts={meta.playstyleCounts}
                        searchQuery={searchQuery}
                        filterPlaystyle={filterPlaystyle}
                        filterPlatform={filterPlatform}
                        distinctPlatforms={distinctPlatforms}
                        onSearchChange={setSearchQuery}
                        onFilterChange={setFilterPlaystyle}
                        onPlatformFilterChange={setFilterPlatform}
                    />

                    {/* Player Grid */}
                    <div className="bg-gradient-to-b from-card/20 to-transparent border-x border-b border-white/5 rounded-b-2xl p-8 shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredPlayers.length === 0 && !isLoading ? (
                                <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-500 border border-dashed border-border rounded-lg bg-card/20">
                                    <p>No players found.</p>
                                    {searchQuery && <p className="text-xs mt-1">Try a different search query.</p>}
                                </div>
                            ) : (
                                filteredPlayers.map((player) => (
                                    <PlayerHUD
                                        key={player.id}
                                        id={player.id}
                                        name={player.name}
                                        playstyle={player.playstyle || "UNKNOWN"}
                                        aggressionScore={player.aggression_score}
                                        notesCount={player.notesCount || 0}
                                        platformName={player.platform?.name}
                                        onAddNote={() => {
                                            setActivePlayerForNote(player);
                                            setNoteModalOpen(true);
                                        }}
                                    />
                                ))
                            )}
                        </div>

                        {/* Loading Spinner */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 text-gold animate-spin" />
                                <span className="ml-3 text-sm text-gray-400 font-medium">Loading more players…</span>
                            </div>
                        )}

                        {/* End of List Indicator */}
                        {!hasMore && players.length > 0 && (
                            <div className="flex items-center justify-center py-6">
                                <div className="h-px w-16 bg-white/10"></div>
                                <span className="mx-4 text-xs text-gray-500 uppercase tracking-widest">All players loaded</span>
                                <div className="h-px w-16 bg-white/10"></div>
                            </div>
                        )}

                        {/* Sentinel for IntersectionObserver */}
                        {hasMore && <div ref={sentinelRef} className="h-4" />}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Target">
                <AddPlayerForm
                    onCancel={() => setAddModalOpen(false)}
                    onSuccess={() => { setAddModalOpen(false); resetAndReload(); }}
                />
            </Modal>

            <Modal isOpen={isImportModalOpen} onClose={() => setImportModalOpen(false)} title="Bulk Import Data">
                <ImportJsonModal
                    onCancel={() => setImportModalOpen(false)}
                    onSuccess={() => { setImportModalOpen(false); resetAndReload(); }}
                />
            </Modal>

            <Modal isOpen={isNoteModalOpen && activePlayerForNote !== null} onClose={() => setNoteModalOpen(false)} title={`Add Note: ${activePlayerForNote?.name}`}>
                {activePlayerForNote && (
                    <AddNoteForm
                        playerId={activePlayerForNote.id}
                        onCancel={() => setNoteModalOpen(false)}
                        onSuccess={() => { setNoteModalOpen(false); resetAndReload(); }}
                    />
                )}
            </Modal>

            <Modal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} title="Settings & Tags">
                <TemplateManagerModal onClose={() => setSettingsOpen(false)} />
            </Modal>
        </div>
    );
}
