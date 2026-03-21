import { Header } from "@/components/layout/Header";
import { getAuthUser } from "@/lib/auth";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getAuthUser();

    return (
        <div className="flex flex-col min-h-screen">
            <Header user={user} />
            {children}
        </div>
    );
}
