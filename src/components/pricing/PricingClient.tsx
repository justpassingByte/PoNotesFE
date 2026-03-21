"use client";

import { useState } from "react";
import { Check, Zap, Shield, Rocket, Loader2 } from "lucide-react";
import { API } from "@/lib/api";

const TIERS = [
    {
        id: "FREE",
        name: "Trial",
        price: "$0",
        period: "/forever",
        description: "Perfect for casual players wanting to see what AI can do.",
        features: [
            "2 AI Analysis / Day",
            "5 Name OCR / Day",
            "2 Full Hand OCR / Day",
            "Basic Player Profiles",
            "GPT-4o Mini Intelligence"
        ],
        cta: "Current Plan",
        popular: false,
        icon: Zap,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    {
        id: "PRO",
        name: "Pro",
        price: "$29",
        period: "/month",
        description: "For serious grinders playing multiple sessions per week.",
        features: [
            "100 AI Analysis / Month",
            "100 Full OCR / Month",
            "Advanced Leak Detection",
            "Exploit Strategy Suggestions",
            "Priority Support",
            "Full Hand History Search"
        ],
        cta: "Upgrade to Pro",
        popular: true,
        icon: Rocket,
        color: "text-gold",
        bg: "bg-gold/10",
        border: "border-gold/30"
    },
    {
        id: "PRO_PLUS",
        name: "Elite",
        price: "$59",
        period: "/month",
        description: "Unleash the full power of Claude 3.5 Sonnet logic.",
        features: [
            "500 AI Analysis / Month",
            "300 Full OCR / Month",
            "GTO Baseline Comparison",
            "Multi-Player Profile Synthesis",
            "VGG-Vision Specialized OCR",
            "Early Access to Features"
        ],
        cta: "Go Elite",
        popular: false,
        icon: Zap,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/30"
    },
    {
        id: "ENTERPRISE",
        name: "Enterprise",
        price: "$199",
        period: "/month",
        description: "High-volume analysis for coaching groups or stable owners.",
        features: [
            "2000+ AI Analysis (Soft Cap)",
            "Unlimited OCR",
            "Custom Prompting API",
            "Team Management",
            "Dedicated Support Manager",
            "White-label Reports"
        ],
        cta: "Contact Sales",
        popular: false,
        icon: Shield,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20"
    }
];

export function PricingClient({ userEmail, currentTier = "FREE" }: { userEmail?: string, currentTier?: string }) {
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    const handleUpgrade = async (tierId: string) => {
        if (tierId === currentTier) return;
        setLoadingTier(tierId);
        try {
            const res = await fetch(API.paymentCreateInvoice, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userEmail || "demo-user",
                    tier: tierId,
                    amount: TIERS.find(t => t.id === tierId)?.price.replace('$', '')
                }),
                credentials: 'include'
            });

            const json = await res.json();
            if (json.success && json.data.invoice_url) {
                window.location.href = json.data.invoice_url;
            } else {
                throw new Error(json.error || "Failed to create invoice");
            }
        } catch (err) {
            console.error("Payment error:", err);
            alert("Payment system is currently in sandbox / maintenance.");
        } finally {
            setLoadingTier(null);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((tier) => {
                const isCurrent = tier.id === currentTier;
                
                return (
                    <div
                        key={tier.id}
                        className={`flex flex-col rounded-2xl border transition-all duration-300 relative ${isCurrent ? "border-gold bg-gold/5 shadow-[0_0_30px_rgba(250,204,21,0.1)]" : tier.popular ? `${tier.border} shadow-2xl shadow-gold/5 bg-gradient-to-b from-card to-amber-900/5` : `border-border bg-card`}`}
                    >
                        {tier.popular && !isCurrent && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold to-amber-600 text-black text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-lg">
                                Best Value
                            </div>
                        )}
                        
                        {isCurrent && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-black text-[10px] uppercase font-bold px-4 py-1 rounded-full shadow-lg z-10 flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Your Active Plan
                            </div>
                        )}

                        <div className="p-6 flex-1">
                            <div className={`p-3 rounded-xl ${tier.bg} w-fit mb-4`}>
                                <tier.icon className={`w-6 h-6 ${tier.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-white leading-none">{tier.name}</h3>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white">{tier.price}</span>
                                <span className="text-gray-500 text-sm font-medium">{tier.period}</span>
                            </div>
                            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
                                {tier.description}
                            </p>

                            <ul className="mt-8 space-y-4">
                                {tier.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className={`mt-1 p-0.5 rounded-full ${tier.bg}`}>
                                            <Check className={`w-3 h-3 ${tier.color}`} />
                                        </div>
                                        <span className="text-sm text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-6 pt-0 mt-auto">
                            <button
                                onClick={() => handleUpgrade(tier.id)}
                                disabled={isCurrent || loadingTier !== null}
                                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isCurrent
                                    ? "bg-white/5 text-gray-400 cursor-default border border-white/10"
                                    : tier.popular
                                        ? "bg-gradient-to-r from-gold to-amber-600 hover:from-gold hover:to-amber-500 text-black shadow-lg shadow-gold/10"
                                        : "bg-white/10 hover:bg-white/20 text-white"
                                    }`}
                            >
                                {loadingTier === tier.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : isCurrent ? "Active Plan" : tier.cta}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
