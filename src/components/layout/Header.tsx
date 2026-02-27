import { Bell, User, Settings } from 'lucide-react';

export function Header({
    onSettingsClick
}: {
    onSettingsClick?: () => void;
}) {
    return (
        <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-6xl bg-card/40 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <div className="flex items-center">
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200 tracking-widest font-serif drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]">
                    VILLAINVAULT
                </h1>
            </div>

            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm text-gray-300 bg-background/50 px-4 py-1.5 rounded-full border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-felt-light shadow-[0_0_8px_#10b981] animate-pulse"></span>
                    <span className="font-mono tracking-wider text-xs">WPT POKER</span>
                </div>

                <button
                    onClick={onSettingsClick}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
                    title="Manage Quick Tags"
                >
                    <Settings className="w-5 h-5" />
                </button>

                <button className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-b from-felt-light to-felt-dark text-white border border-felt-light shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform">
                    <User className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
}
