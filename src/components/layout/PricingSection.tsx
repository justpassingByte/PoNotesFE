'use client';

import React from 'react';
import { Check, Zap, Rocket, Shield } from 'lucide-react';
import Link from 'next/link';

const TIERS = [
    {
        name: "Trial",
        price: "$0",
        period: "/forever",
        description: "See what AI can do.",
        features: [
            "2 AI Analysis / Day",
            "5 Name OCR / Day",
            "Basic Profiles",
            "GPT-4o Mini Intelligence"
        ],
        cta: "Try for Free",
        popular: false,
        icon: Zap,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-border"
    },
    {
        name: "Pro",
        price: "$29",
        period: "/month",
        description: "For serious grinders.",
        features: [
            "100 AI Analysis / Month",
            "100 Full OCR / Month",
            "Leak Detection",
            "Exploit Suggestions",
            "Priority Support"
        ],
        cta: "Go Pro",
        popular: true,
        icon: Rocket,
        color: "text-gold",
        bg: "bg-gold/10",
        border: "border-gold/30"
    },
    {
        name: "Elite",
        price: "$59",
        period: "/month",
        description: "Claude 3.5 Sonnet logic.",
        features: [
            "500 AI Analysis / Month",
            "300 Full OCR / Month",
            "GTO Baseline Comparison",
            "Synthesis Profiling",
            "Vision OCR+"
        ],
        cta: "Join Elite",
        popular: false,
        icon: Zap,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-border"
    }
];

export function PricingSection({ isDashboard = false }: { isDashboard?: boolean }) {
    return (
        <section id="pricing" className={`${isDashboard ? '' : 'max-w-7xl mx-auto px-6 py-24 sm:py-32'}`}>
            {!isDashboard && (
                <div className="text-center space-y-4 mb-20">
                    <span className="text-gold font-bold tracking-widest text-sm uppercase text-glow">Pricing Plans</span>
                    <h2 className="text-4xl sm:text-6xl font-bold text-white">Choose Your Edge</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Flexible plans for every stage of your poker career.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {TIERS.map((tier) => (
                    <div
                        key={tier.name}
                        className={`flex flex-col rounded-3xl border p-8 transition-all duration-300 relative group ${tier.popular ? `${tier.border} bg-white/5 shadow-2xl` : `border-white/5 bg-card hover:border-white/10`}`}
                    >
                        {tier.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                Recommended
                            </div>
                        )}
                        <div className="mb-8">
                            <div className={`w-10 h-10 rounded-xl ${tier.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                <tier.icon className={`w-5 h-5 ${tier.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white">{tier.price}</span>
                                <span className="text-gray-500 text-sm font-medium">{tier.period}</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {tier.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3">
                                    <Check className={`w-4 h-4 mt-0.5 ${tier.color}`} />
                                    <span className="text-sm text-gray-400">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/pricing"
                            className={`w-full py-4 rounded-2xl font-bold text-center transition-all ${tier.popular ? "bg-gold text-black hover:bg-yellow-400" : "bg-white/5 text-white hover:bg-white/10"}`}
                        >
                            {tier.cta}
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}
