import { Header } from "@/components/layout/Header";
import { getAuthUser } from "@/lib/auth";
import { fetchDashboard } from "@/app/actions";
import { LoginModalProvider } from "@/context/LoginModalContext";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getAuthUser();

    // Fetch dashboard data so Header ProfileHUD can show live stats + targets
    let stats: any = undefined;
    let topWhales: any[] = [];
    let topRegs: any[] = [];

    if (user) {
        try {
            const dashboardData = await fetchDashboard();
            if (dashboardData.stats) stats = dashboardData.stats;
            topWhales = (dashboardData.topWhales || []).slice(0, 3);
            topRegs = (dashboardData.topRegs || []).slice(0, 3);
        } catch (_) { /* silent */ }
    }

    return (
        <LoginModalProvider>
            <div className="flex flex-col min-h-screen">
                <Header user={user} stats={stats} topWhales={topWhales} topRegs={topRegs} />
                {children}
            </div>
        </LoginModalProvider>
    );
}
