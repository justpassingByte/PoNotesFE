'use client';

import React, { useEffect, useState } from 'react';
import { Check, Zap, Rocket, Shield } from 'lucide-react';
import Link from 'next/link';
import { API } from '@/lib/api';

interface Plan {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
    ai_limit: number;
    name_ocr_limit: number;
    hand_ocr_limit: number;
    max_devices: number;
    is_popular: boolean;
    color_theme: string;
}

export function PricingSection({ isDashboard = false }: { isDashboard?: boolean }) {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API.pricingPublic}`)
            .then(res => res.json())
            .then(json => {
                if (json.success) setPlans(json.data);
            })
            .catch(err => console.error("Failed to load plans:", err))
            .finally(() => setLoading(false));
    }, []);

    const getIcon = (theme: string) => {
        switch(theme) {
            case 'gold': return Rocket;
            case 'purple': return Shield;
            default: return Zap;
        }
    };

    const getColorClass = (theme: string) => {
        switch(theme) {
            case 'gold': return 'text-gold';
            case 'purple': return 'text-purple-400';
            case 'blue': return 'text-blue-400';
            default: return 'text-gold';
        }
    };

    const getBgClass = (theme: string) => {
        switch(theme) {
            case 'gold': return 'bg-gold/10';
            case 'purple': return 'bg-purple-500/10';
            case 'blue': return 'bg-blue-500/10';
            default: return 'bg-gold/10';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
        </div>
    );

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
                {plans.map((plan) => {
                    const Icon = getIcon(plan.color_theme);
                    const colorClass = getColorClass(plan.color_theme);
                    const bgClass = getBgClass(plan.color_theme);
                    const popular = plan.is_popular;

                    return (
                        <div
                            key={plan.id}
                            className={`flex flex-col rounded-3xl border p-8 transition-all duration-300 relative group ${popular ? `border-gold/30 bg-white/5 shadow-2xl scale-105 z-10` : `border-white/5 bg-card hover:border-white/10`}`}
                        >
                            {popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                    Recommended
                                </div>
                            )}
                            <div className="mb-8">
                                <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                    <Icon className={`w-5 h-5 ${colorClass}`} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-white">${plan.price}</span>
                                    <span className="text-gray-500 text-sm font-medium">/month</span>
                                </div>
                                <p className="text-gray-500 text-xs mt-2 italic">{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {/* Auto-generated features from limits */}
                                <li className="flex items-start gap-3">
                                    <Check className={`w-4 h-4 mt-0.5 ${colorClass}`} />
                                    <span className="text-sm text-gray-400">{plan.ai_limit} AI Analysis / Day</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className={`w-4 h-4 mt-0.5 ${colorClass}`} />
                                    <span className="text-sm text-gray-400">{plan.name_ocr_limit} Name OCRs / Day</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className={`w-4 h-4 mt-0.5 ${colorClass}`} />
                                    <span className="text-sm text-gray-400">{plan.hand_ocr_limit} Hand OCRs / Day</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className={`w-4 h-4 mt-0.5 ${colorClass}`} />
                                    <span className="text-sm text-gray-400">{plan.max_devices} Concurrent Devices</span>
                                </li>
                                
                                {/* Toggled Features */}
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check className={`w-4 h-4 mt-0.5 ${colorClass}`} />
                                        <span className="text-sm text-gray-400">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/pricing"
                                className={`w-full py-4 rounded-2xl font-bold text-center transition-all ${popular ? "bg-gold text-black hover:bg-yellow-400" : "bg-white/5 text-white hover:bg-white/10"}`}
                            >
                                {plan.price === 0 ? 'Try for Free' : 'Join Membership'}
                            </Link>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
