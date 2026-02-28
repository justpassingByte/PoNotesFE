import { Suspense } from "react";
import { PlayerListClient } from "@/components/dashboard/PlayerListClient";
import { PlayerListSkeleton } from "@/components/dashboard/PlayerListSkeleton";
import { fetchFirstPage } from "@/app/actions";

export default async function Home() {
  // Fetch first page of players on the server — no client JS needed for initial paint
  const { data: initialPlayers, meta: initialMeta } = await fetchFirstPage();

  return (
    <Suspense fallback={<PlayerListSkeleton />}>
      <PlayerListClient
        initialPlayers={initialPlayers}
        initialMeta={initialMeta}
      />
    </Suspense>
  );
}
