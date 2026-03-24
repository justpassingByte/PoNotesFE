import { Header } from "@/components/layout/Header";
import { getAuthUser } from "@/lib/auth";
import { LoginModalProvider } from "@/context/LoginModalContext";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getAuthUser();

    return (
        <LoginModalProvider>
            <div className="flex flex-col min-h-screen">
                <Header user={user} />
                {children}
            </div>
        </LoginModalProvider>
    );
}
