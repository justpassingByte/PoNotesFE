'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import Image from 'next/image';

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gold/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gold text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Sparkles className="w-3 h-3" />
                    Now with AI Analysis
                </div>

                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-8 leading-[1.1]">
                    Stop Guessing. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-gold bg-[length:200%_auto] animate-gradient whitespace-nowrap">
                        Start Exploiting.
                    </span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                    The ultimate AI command center for professional poker.
                    Upload screenshots for <span className="text-white font-medium">instant hand analysis</span>,
                    automate your notes with <span className="text-white font-medium">Vision OCR</span>,
                    and build <span className="text-white font-medium">AI Player Profiles</span> that reveal every leak.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <Link
                        href="/analyzer"
                        className="w-full sm:w-auto px-8 py-4 bg-gold text-black font-bold rounded-2xl hover:bg-yellow-400 hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all flex items-center justify-center gap-2 text-lg"
                    >
                        Analyze a Hand <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                        href="/dashboard"
                        className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-lg"
                    >
                        Launch Dashboard
                    </Link>
                </div>

                {/* Trust bar */}
                <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-30 grayscale hover:opacity-100 transition-all duration-500">
                    <div className="flex items-center gap-2 font-bold text-lg text-white">
                        <ShieldCheck className="w-6 h-6" /> SECURE
                    </div>
                    <div className="flex items-center gap-2 font-bold text-lg text-white">
                        <Zap className="w-6 h-6" /> INSTANT AI
                    </div>
                    <div className="flex items-center gap-2 font-bold text-lg text-white">
                        <Globe className="w-6 h-6" /> CROSS-PLATFORM
                    </div>
                </div>
            </div>
        </section>
    );
}
