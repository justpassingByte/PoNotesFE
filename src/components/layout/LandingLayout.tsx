import React from 'react';
import { LandingHeader } from './LandingHeader';
import { getAuthUser } from '@/lib/auth';

export async function LandingLayout({ children }: { children: React.ReactNode }) {
    const user = await getAuthUser();

    return (
        <div className="min-h-screen bg-black text-white selection:bg-gold selection:text-black">
            {/* Background image — fixed, very subtle */}
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: "url('/landing_bg.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.18,
                }}
            />
            {/* Subtle vignette over the bg */}
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
                }}
            />

            <LandingHeader user={user} />
            <main className="relative z-10">
                {children}
            </main>

            <footer className="relative z-10 border-t border-white/5 py-10 px-6 mt-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <span className="font-bold tracking-widest text-sm text-white/50">VILLIANT VAULT &copy; 2026</span>
                    <div className="flex gap-6 text-xs text-gray-700">
                        <a href="#" className="hover:text-gray-400 transition-colors">Chính Sách Bảo Mật</a>
                        <a href="#" className="hover:text-gray-400 transition-colors">Điều Khoản</a>
                        <a href="#" className="hover:text-gray-400 transition-colors">Cookies</a>
                    </div>
                    <div className="text-xs text-gray-700">
                        Két sắt AI đầu tiên cho poker Việt Nam.
                    </div>
                </div>
            </footer>
        </div>
    );
}
