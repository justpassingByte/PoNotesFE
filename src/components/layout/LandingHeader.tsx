'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Sparkles, User, LayoutDashboard } from 'lucide-react';

export function LandingHeader({ user }: { user?: { email: string; premium_tier: string } | null }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '/#features' },
        { name: 'AI Profiling', href: '/#profiles' },
        { name: 'Pricing', href: '/#pricing' },
        { name: 'Contact', href: '/#contact' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-lg border-b border-white/10 py-3' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="group flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-gold to-yellow-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.3)] group-hover:scale-110 transition-transform">
                        <Sparkles className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-widest font-serif">VILLAINVAULT</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-gray-400 hover:text-gold transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="h-4 w-px bg-white/10 mx-2"></div>
                    {user ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white text-sm font-bold px-6 py-2 rounded-full hover:bg-white/10 hover:border-white/20 transition-all"
                        >
                            <LayoutDashboard className="w-4 h-4 text-gold" />
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 bg-gradient-to-br from-gold to-yellow-600 text-black text-sm font-bold px-6 py-2 rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                        >
                            <User className="w-4 h-4" />
                            Log In
                        </Link>
                    )}
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col space-y-4 animate-in fade-in slide-in-from-top-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-lg font-medium text-gray-300 hover:text-gold"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    {user ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center justify-center gap-2 bg-gold text-black font-bold py-3 rounded-xl"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Go to Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <User className="w-4 h-4" />
                            Log In
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}
