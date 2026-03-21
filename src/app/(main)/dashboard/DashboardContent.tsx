import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { fetchDashboard } from "@/app/actions";
import { getAuthUser } from "@/lib/auth";

export async function DashboardContent() {
    const user = await getAuthUser();
    let stats = {
        totalCount: 0,
        totalNotesCount: 0,
        playstyleCounts: {} as Record<string, number>
    };
    let topFish = [];

    try {
        const dashboardData = await fetchDashboard();
        stats = dashboardData.stats;
        topFish = dashboardData.topFish;
    } catch (err) {
        console.error("Dashboard fetch error:", err);
    }

    return <DashboardHome user={user} stats={stats} topFish={topFish} />;
}
