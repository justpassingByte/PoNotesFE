import Link from 'next/link';
import { Home, Users, Settings, Database, Crosshair } from 'lucide-react';

export function Sidebar() {
    return (
        <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-border">
                <Crosshair className="w-6 h-6 text-gold mr-2" />
                <span className="font-bold text-lg text-gold tracking-wider uppercase">VillainVault</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavItem href="/" icon={<Home />} label="Dashboard" active />
                <NavItem href="/players" icon={<Users />} label="Players" />
                <NavItem href="/database" icon={<Database />} label="Database Insights" />
                <NavItem href="/settings" icon={<Settings />} label="Settings" />
            </nav>

            <div className="p-4 border-t border-border">
                <div className="bg-felt-dark rounded-md p-3 text-sm flex items-center justify-between border border-felt-default">
                    <span className="text-gray-400">Status</span>
                    <span className="flex items-center text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                        Live
                    </span>
                </div>
            </div>
        </aside>
    );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${active
                    ? 'bg-felt-default text-white font-medium border border-felt-light shadow-sm'
                    : 'text-gray-400 hover:bg-card hover:text-white'
                }`}
        >
            <span className="w-5 h-5 mr-3">{icon}</span>
            {label}
        </Link>
    );
}
