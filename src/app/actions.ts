"use server";

import { API } from "@/lib/api";

const PAGE_SIZE = 10;

interface PlayerData {
    id: string;
    name: string;
    playstyle: string;
    aggression_score: number;
    notesCount?: number;
    platform?: { id: string; name: string };
}

interface PaginationMeta {
    totalCount: number;
    totalNotesCount: number;
    playstyleCounts: Record<string, number>;
    hasMore: boolean;
    nextCursor: string | null;
}

interface PaginatedResult {
    data: PlayerData[];
    meta: PaginationMeta;
}

/**
 * Server Action: fetch the first page of players.
 * Used for initial SSR load and reset-after-mutation.
 */
export async function fetchFirstPage(): Promise<PaginatedResult> {
    const res = await fetch(`${API.players}?limit=${PAGE_SIZE}`, { cache: "no-store" });
    const json = await res.json();

    if (!json.success) {
        throw new Error("Failed to fetch players");
    }

    // Serialize dates for RSC boundary safety
    const data = (json.data as any[]).map((p: any) => ({
        id: p.id,
        name: p.name,
        playstyle: p.playstyle || "UNKNOWN",
        aggression_score: p.aggression_score ?? 0,
        notesCount: p.notesCount ?? p._count?.notes ?? 0,
        platform: p.platform ? { id: p.platform.id, name: p.platform.name } : undefined,
    }));

    return { data, meta: json.meta };
}

/**
 * Server Action: fetch the next page of players using cursor-based pagination.
 * Called from the client when the IntersectionObserver triggers.
 */
export async function loadMorePlayers(cursor: string): Promise<PaginatedResult> {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), cursor });
    const res = await fetch(`${API.players}?${params.toString()}`, { cache: "no-store" });
    const json = await res.json();

    if (!json.success) {
        throw new Error("Failed to fetch more players");
    }

    // Serialize to plain objects — no Date instances, no class instances
    const data = (json.data as any[]).map((p: any) => ({
        id: p.id,
        name: p.name,
        playstyle: p.playstyle || "UNKNOWN",
        aggression_score: p.aggression_score ?? 0,
        notesCount: p.notesCount ?? p._count?.notes ?? 0,
        platform: p.platform ? { id: p.platform.id, name: p.platform.name } : undefined,
    }));

    return { data, meta: json.meta };
}

/**
 * Server Action: fetch a single player profile with notes.
 * Used for SSR in the player profile page.
 */
export async function fetchPlayerProfile(playerId: string): Promise<{
    id: string;
    name: string;
    playstyle: string;
    aggression_score: number;
    notes: { id: string; content: string; street: string; note_type: string; created_at: string }[];
} | null> {
    const res = await fetch(`${API.players}/${playerId}`, { cache: "no-store" });
    const json = await res.json();

    if (!json.success || !json.data) {
        return null;
    }

    const p = json.data;
    return {
        id: p.id,
        name: p.name,
        playstyle: p.playstyle || "UNKNOWN",
        aggression_score: p.aggression_score ?? 0,
        notes: (p.notes || []).map((n: any) => ({
            id: n.id,
            content: n.content,
            street: n.street || "General",
            note_type: n.note_type || "Custom",
            created_at: typeof n.created_at === "string" ? n.created_at : new Date(n.created_at).toISOString(),
        })),
    };
}
