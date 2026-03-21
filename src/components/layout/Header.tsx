'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Settings, Menu, X, Sparkles, Activity, History, CreditCard, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { TemplateManagerModal } from '@/components/forms/TemplateManagerModal';
import { logout } from '@/app/auth-actions';

export function Header({
    onSettingsClick: externalSettingsClick,
    user: user
}: {
    onSettingsClick?: () => void;
    user?: { email: string; premium_tier: string } | null;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Players', href: '/players', icon: User },
        { name: 'Hand Analyzer', href: '/analyzer', icon: Activity },
        { name: 'History', href: '/history', icon: History },
        { name: 'Pricing', href: '/pricing', icon: CreditCard },
    ];

    const isActive = (href: string) => pathname === href;

    const handleSettingsClick = () => {
        if (externalSettingsClick) {
            externalSettingsClick();
        } else {
            setIsSettingsOpen(true);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <>
            <header className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-11/12 max-w-6xl bg-card/40 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-full px-4 sm:px-8 py-2.5 sm:py-2 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center group">
                        <div className="w-8 h-8 bg-gradient-to-br from-gold to-yellow-600 rounded flex items-center justify-center mr-2 group-hover:scale-105 transition-transform">
                            <Sparkles className="w-4 h-4 text-black" />
                        </div>
                        <div className="hidden md:block text-base sm:text-lg font-bold text-white tracking-widest font-serif">
                            VILLAINVAULT
                        </div>
                    </Link>

                    {/* Desktop nav links */}
                    <nav className="hidden lg:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive(link.href) 
                                    ? "bg-gold text-black shadow-[0_0_15px_rgba(250,204,21,0.3)]" 
                                    : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                            >
                                <link.icon className="w-4 h-4" />
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center space-x-2 md:space-x-4">
                    {/* User Profile / Status */}
                    {user && (
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                            <span className="text-[10px] text-gold font-bold uppercase tracking-widest">{user.premium_tier}</span>
                        </div>
                    )}

                    <button
                        onClick={handleSettingsClick}
                        className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
                        title="Manage Quick Tags"
                    >
                        <Settings className="w-5 h-5" />
                    </button>

                    {user ? (
                        <button 
                            onClick={handleLogout}
                            className="flex items-center justify-center w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10 group"
                            title="Log Out"
                        >
                            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                    ) : (
                        <Link 
                            href="/login"
                            className="flex items-center justify-center w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-gradient-to-b from-felt-light to-felt-dark text-white border border-felt-light shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform"
                        >
                            <User className="w-4 h-4" />
                        </Link>
                    )}

                    {/* Mobile hamburger */}
                    <button
                        className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-white rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </header>

            {/* Mobile slide-down menu */}
            {mobileMenuOpen && (
                <div className="fixed top-[70px] sm:top-[90px] left-1/2 -translate-x-1/2 z-40 w-[95%] bg-card/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.8)] lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col gap-1.5">
                        {user && (
                            <div className="flex items-center justify-between px-4 py-3 mb-2 bg-white/5 rounded-xl border border-white/10">
                                <span className="text-xs text-gray-400">{user.email}</span>
                                <span className="text-[10px] text-gold font-bold uppercase tracking-widest">{user.premium_tier}</span>
                            </div>
                        )}
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm rounded-xl transition-all ${isActive(link.href) 
                                    ? "bg-gold text-black font-bold" 
                                    : "text-gray-300 hover:text-white hover:bg-white/5"}`}
                            >
                                <link.icon className={`w-5 h-5 ${isActive(link.href) ? "text-black" : "text-gold"}`} />
                                {link.name}
                            </Link>
                        ))}
                        <button
                            onClick={() => { handleSettingsClick(); setMobileMenuOpen(false); }}
                            className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all border-t border-white/5 mt-2 pt-4"
                        >
                            <Settings className="w-5 h-5 text-gray-400" />
                            Manage Quick Tags
                        </button>
                        {user && (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-all mt-1"
                            >
                                <LogOut className="w-5 h-5" />
                                Log Out
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Global Settings Modal */}
            <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Settings & Tags" size="xl">
                <TemplateManagerModal onClose={() => setIsSettingsOpen(false)} />
            </Modal>
        </>
    );
}
