'use client';

import { useState } from 'react';
import { User, Settings, Menu, X } from 'lucide-react';

export function Header({
    onSettingsClick
}: {
    onSettingsClick?: () => void;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <header className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-11/12 max-w-6xl bg-card/40 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-full px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                <div className="flex items-center">
                    <h1 className="text-base sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200 tracking-widest font-serif drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]">
                        VILLAINVAULT
                    </h1>
                </div>

                {/* Desktop nav */}
                <div className="hidden sm:flex items-center space-x-4 md:space-x-6">
                    <button
                        onClick={onSettingsClick}
                        className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
                        title="Manage Quick Tags"
                    >
                        <Settings className="w-5 h-5" />
                    </button>

                    <button className="flex items-center justify-center w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-gradient-to-b from-felt-light to-felt-dark text-white border border-felt-light shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform">
                        <User className="w-4 h-4" />
                    </button>
                </div>

                {/* Mobile hamburger */}
                <button
                    className="sm:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </header>

            {/* Mobile slide-down menu */}
            {mobileMenuOpen && (
                <div className="fixed top-[60px] left-1/2 -translate-x-1/2 z-40 w-[95%] bg-card/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.7)] sm:hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => { onSettingsClick?.(); setMobileMenuOpen(false); }}
                            className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <Settings className="w-5 h-5" />
                            Manage Quick Tags
                        </button>
                        <button className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <User className="w-5 h-5" />
                            Profile
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
