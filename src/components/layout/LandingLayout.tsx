'use client';

import React from 'react';
import { LandingHeader } from './LandingHeader';

export function LandingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-gold selection:text-black">
            {/* Custom background pattern */}
            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

            <LandingHeader />
            <main className="relative z-10">
                {children}
            </main>

            <footer className="relative z-10 border-t border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gold rounded flex items-center justify-center text-[10px] font-bold text-black">VV</div>
                        <span className="font-bold tracking-widest text-sm">VILLAINVAULT &copy; 2026</span>
                    </div>
                    <div className="flex gap-8 text-xs text-gray-600">
                        <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-gold transition-colors">Cookies</a>
                    </div>
                    <div className="text-xs text-gray-500">
                        The AI edge in professional poker.
                    </div>
                </div>
            </footer>
        </div>
    );
}
