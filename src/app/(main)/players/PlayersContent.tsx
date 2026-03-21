import { PlayerListClient } from "@/components/dashboard/PlayerListClient";
import type { Player, PaginationMeta } from "@/components/dashboard/PlayerListClient";
import { fetchFirstPage } from "@/app/actions";
import { getAuthUser } from "@/lib/auth";

export async function PlayersContent() {
    const user = await getAuthUser();
    let initialPlayers: Player[] = [];
    let initialMeta: PaginationMeta = { 
        totalCount: 0, 
        totalNotesCount: 0, 
        playstyleCounts: {}, 
        hasMore: false, 
        nextCursor: null 
    };

    try {
        const result = await fetchFirstPage();
        initialPlayers = result.data as Player[];
        initialMeta = result.meta;
    } catch (err) {
        console.error("Players fetch error:", err);
    }

    return (
        <PlayerListClient
            initialPlayers={initialPlayers}
            initialMeta={initialMeta}
            user={user}
        />
    );
}
