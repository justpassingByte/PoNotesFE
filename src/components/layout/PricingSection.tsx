'use client';

import React from 'react';
import { Check, Sparkles } from 'lucide-react';

export function PricingSection({ isDashboard = false }: { isDashboard?: boolean }) {
    return (
        <section id="pricing" className={`${isDashboard ? '' : 'max-w-7xl mx-auto px-6 py-24 sm:py-32'}`}>
            {!isDashboard && (
                <div className="text-center space-y-4 mb-20">
                    <span className="text-gold font-bold tracking-widest text-sm uppercase">Transparent Pricing</span>
                    <h2 className="text-4xl sm:text-6xl font-bold text-white">Choose Your Edge</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Whether you are a casual crusher or a high-stakes professional, there is a vault for you.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {/* Basic Tier */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col hover:bg-white/10 transition-colors">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-white mb-2">Basic</h3>
                        <p className="text-gray-500 text-xs">For hobbyists.</p>
                    </div>
                    <div className="mb-6">
                        <span className="text-3xl font-bold text-white">$0</span>
                        <span className="text-gray-500 text-xs ml-1">/mo</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                        {[
                            'Manual Notes',
                            'Local Dashboard',
                            'Basic Player Stats'
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-2 text-xs text-gray-400">
                                <Check className="w-3 h-3 text-green-500" /> {item}
                            </li>
                        ))}
                    </ul>
                    <button className="w-full py-3 rounded-xl bg-white/5 text-white text-sm font-bold border border-white/10 opacity-50 cursor-not-allowed">
                        Current
                    </button>
                </div>

                {/* Trial Tier */}
                <div className="bg-white/5 border border-felt-light/30 rounded-3xl p-6 flex flex-col hover:bg-white/10 transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-felt-light text-white text-[9px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-widest">
                        7 Days Free
                    </div>
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-white mb-2">Pro Trial</h3>
                        <p className="text-gray-500 text-xs">Test the full power.</p>
                    </div>
                    <div className="mb-6">
                        <span className="text-3xl font-bold text-white">$0</span>
                        <span className="text-felt-light text-xs font-bold ml-1">Trial</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                        {[
                            'Full AI Analysis',
                            'OCR Imports (5/day)',
                            'GTO Lite Access',
                            'No Credit Card Required'
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-2 text-xs text-gray-300">
                                <Check className="w-3 h-3 text-felt-light" /> {item}
                            </li>
                        ))}
                    </ul>
                    <button className="w-full py-3 rounded-xl bg-felt-light text-white text-sm font-bold hover:bg-felt-default transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)]">
                        Start Free Trial
                    </button>
                </div>

                {/* Pro Tier */}
                <div className="bg-gradient-to-b from-gold/10 to-transparent border border-gold/40 rounded-3xl p-6 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(250,204,21,0.05)]">
                    <div className="absolute top-0 right-0 bg-gold text-black text-[9px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-widest">
                        Unlimited
                    </div>
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-white mb-2">Pro</h3>
                        <p className="text-gold/60 text-xs">For high-stakes pros.</p>
                    </div>
                    <div className="mb-6">
                        <span className="text-3xl font-bold text-white">$19.99</span>
                        <span className="text-gray-500 text-xs ml-1">/mo</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                        {[
                            'Unlimited AI Analysis',
                            'Unlimited OCR Imports',
                            'Full GTO Lite Access',
                            'Priority Solver Queue',
                            'Cloud Backups'
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-2 text-xs text-white">
                                <Check className="w-3 h-3 text-gold" /> {item}
                            </li>
                        ))}
                    </ul>
                    <button className="w-full py-3 rounded-xl bg-gold text-black text-sm font-bold hover:bg-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all">
                        Upgrade Now
                    </button>
                </div>
            </div>
        </section>
    );
}
