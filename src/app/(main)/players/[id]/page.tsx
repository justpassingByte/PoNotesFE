import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PlayerProfileClient } from "@/components/dashboard/PlayerProfileClient";
import { PlayerProfileSkeleton } from "@/components/dashboard/PlayerProfileSkeleton";
import { fetchPlayerProfile } from "@/app/actions";
import { getAuthUser } from "@/lib/auth";

interface PlayerProfilePageProps {
    params: Promise<{ id: string }>;
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
    const { id } = await params;
    const [player, user] = await Promise.all([
        fetchPlayerProfile(id),
        getAuthUser()
    ]);

    if (!player) {
        notFound();
    }

    return (
        <Suspense fallback={<PlayerProfileSkeleton />}>
            <PlayerProfileClient initialPlayer={player} user={user} />
        </Suspense>
    );
}
