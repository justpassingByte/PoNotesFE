"use client";

import { useState, useEffect } from "react";
import { Check, Zap, Shield, Rocket, Loader2 } from "lucide-react";
import { API } from "@/lib/api";

interface Plan {
    id: string;
    name: string;
    price: number;
    period: string;
    description: string;
    features: string[];
    ai_limit: number;
    ocr_limit: number;
    is_popular: boolean;
    color_theme: string;
}

const ICON_MAP: Record<string, any> = {
    gold: Rocket,
    purple: Zap,
    blue: Zap,
    emerald: Shield
};

const COLOR_MAP: Record<string, string> = {
    gold: "text-gold",
    purple: "text-purple-400",
    blue: "text-blue-400",
    emerald: "text-emerald-400"
};

const BG_MAP: Record<string, string> = {
    gold: "bg-gold/10",
    purple: "bg-purple-500/10",
    blue: "bg-blue-500/10",
    emerald: "bg-emerald-500/10"
};

export function PricingClient({ userEmail, currentTier = "FREE" }: { userEmail?: string, currentTier?: string }) {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                // Using the new admin pricing endpoint (or create a public one)
                // For now, using a fallback to the static logic if API fails
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/pricing`, { credentials: "include" });
                const json = await res.json();
                if (json.success) {
                    setPlans(json.data);
                }
            } catch (err) {
                console.error("Failed to fetch plans:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleUpgrade = async (tierId: string) => {
        if (tierId === currentTier) return;
        setLoadingTier(tierId);
        try {
            const plan = plans.find(p => p.id === tierId);
            const res = await fetch(API.paymentCreateInvoice, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userEmail || "demo-user",
                    tier: tierId,
                    amount: plan?.price
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

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-gold" /></div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
                const isCurrent = plan.id === currentTier;
                const Icon = ICON_MAP[plan.color_theme] || Rocket;
                const textColor = COLOR_MAP[plan.color_theme] || "text-gold";
                const bgColor = BG_MAP[plan.color_theme] || "bg-gold/10";
                
                return (
                    <div
                        key={plan.id}
                        className={`flex flex-col rounded-2xl border transition-all duration-300 relative ${isCurrent ? "border-gold bg-gold/5 shadow-[0_0_30px_rgba(250,204,21,0.1)]" : plan.is_popular ? `border-gold/30 shadow-2xl shadow-gold/5 bg-gradient-to-b from-card to-amber-900/5` : `border-border bg-card`}`}
                    >
                        {plan.is_popular && !isCurrent && (
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
                            <div className={`p-3 rounded-xl ${bgColor} w-fit mb-4`}>
                                <Icon className={`w-6 h-6 ${textColor}`} />
                            </div>
                            <h3 className="text-xl font-bold text-white leading-none">{plan.name}</h3>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white">${plan.price}</span>
                                <span className="text-gray-500 text-sm font-medium">{plan.period}</span>
                            </div>
                            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
                                {plan.description}
                            </p>

                            <ul className="mt-8 space-y-4">
                                {plan.features.map((feature: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className={`mt-1 p-0.5 rounded-full ${bgColor}`}>
                                            <Check className={`w-3 h-3 ${textColor}`} />
                                        </div>
                                        <span className="text-sm text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-6 pt-0 mt-auto">
                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={isCurrent || loadingTier !== null}
                                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isCurrent
                                    ? "bg-white/5 text-gray-400 cursor-default border border-white/10"
                                    : plan.is_popular
                                        ? "bg-gradient-to-r from-gold to-amber-600 hover:from-gold hover:to-amber-500 text-black shadow-lg shadow-gold/10"
                                        : "bg-white/10 hover:bg-white/20 text-white"
                                    }`}
                            >
                                {loadingTier === plan.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : isCurrent ? "Active Plan" : (plan.price === 0 ? "Current Plan" : "Upgrade")}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
