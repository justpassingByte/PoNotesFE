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
    ai_playstyle?: string | null;
    ai_aggression_score?: number | null;
    ai_exploit_strategy?: string | null;
    ai_stats_used?: string | null;
    ai_range_matrix?: any;
    ai_action_breakdown?: any;
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
        ai_playstyle: p.ai_playstyle || null,
        ai_aggression_score: p.ai_aggression_score ?? null,
        ai_exploit_strategy: p.ai_exploit_strategy || null,
        ai_stats_used: p.ai_stats_used || null,
        ai_range_matrix: p.ai_range_matrix || null,
        ai_action_breakdown: p.ai_action_breakdown || null,
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
        ai_playstyle: p.ai_playstyle || null,
        ai_aggression_score: p.ai_aggression_score ?? null,
        ai_exploit_strategy: p.ai_exploit_strategy || null,
        ai_stats_used: p.ai_stats_used || null,
        ai_range_matrix: p.ai_range_matrix || null,
        ai_action_breakdown: p.ai_action_breakdown || null,
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
    ai_playstyle?: string | null;
    ai_aggression_level?: string | null;
    ai_aggression_score?: number | null;
    ai_gto_baseline?: string | null;
    ai_exploit_strategy?: string | null;
    ai_analysis_mode?: string | null;
    ai_stats_used?: string | null;
    ai_range_matrix?: any;
    ai_action_breakdown?: any;
    notes: { id: string; content: string; street: string; note_type: string; source?: string; created_at: string }[];
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
        ai_playstyle: p.ai_playstyle || null,
        ai_aggression_score: p.ai_aggression_score ?? null,
        ai_exploit_strategy: p.ai_exploit_strategy || null,
        ai_stats_used: p.ai_stats_used || null,
        ai_range_matrix: p.ai_range_matrix || null,
        ai_action_breakdown: p.ai_action_breakdown || null,
        notes: (p.notes || []).map((n: any) => ({
            id: n.id,
            content: n.content,
            street: n.street || "General",
            note_type: n.note_type || "Custom",
            source: n.source || "custom",
            created_at: typeof n.created_at === "string" ? n.created_at : new Date(n.created_at).toISOString(),
        })),
    };
}

/**
 * Server Action: fetch app settings
 */
export async function getAppSettings() {
    try {
        const res = await fetch(API.settings, { cache: "no-store" });
        const json = await res.json();
        if (json.success) return json.data;
        return null;
    } catch (err) {
        console.error("Failed to fetch app settings", err);
        return null;
    }
}

/**
 * Server Action: update app settings
 */
export async function updateAppSettings(data: { ai_enabled?: boolean; analysis_mode?: string }) {
    console.log("Updating app settings:", data);
    try {
        const res = await fetch(API.settings, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            cache: "no-store",
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Backend returned ${res.status}: ${errorText}`);
            throw new Error(`Failed to update settings: ${res.statusText}`);
        }

        const json = await res.json();
        if (json.success) {
            // Return a plain object to avoid serialization issues with Next.js Server Actions
            return JSON.parse(JSON.stringify(json.data));
        }

        console.error("Backend error:", json.error);
        throw new Error(json.error || "Failed to update settings");
    } catch (err) {
        console.error("Server Action Error (updateAppSettings):", err);
        throw err;
    }
}
