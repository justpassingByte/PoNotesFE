'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Zap } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: 29,
        tagline: 'Bắt đầu cắt lỗ',
        popular: false,
        features: [
            '500 hand phân tích',
            'Strategy cơ bản (call/fold)',
            'HUD basic',
            'Player memory',
            '1 thiết bị',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 59,
        tagline: 'Được chọn nhiều nhất',
        popular: true,
        features: [
            '2.000 hand phân tích',
            'Strategy full: frequency + sizing + plan',
            'HUD exploit + leak detect',
            'Player modeling',
            '2 thiết bị',
            'Priority support',
        ],
    },
    {
        id: 'elite',
        name: 'Elite',
        price: 99,
        tagline: 'Hổ mọc thêm cánh',
        popular: false,
        features: [
            '5.000+ hand không giới hạn',
            'Exploit sâu theo từng spot',
            'Player modeling cực mạnh',
            'GTO + Population reads',
            '3 thiết bị',
            'Onboarding 1-on-1',
        ],
    },
];

const ADDON = { price: 10, hands: 150 };

export function PricingSection({ isDashboard = false }: { isDashboard?: boolean }) {
    const head = useReveal();
    const cards = useReveal();
    const faq = useReveal();

    return (
        <section id="pricing" className={`relative overflow-hidden ${isDashboard ? '' : 'py-24'}`}>
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {!isDashboard && (
                    <div
                        ref={head.ref as React.RefObject<HTMLDivElement>}
                        className={`reveal mb-16 ${head.visible ? 'is-visible' : ''}`}
                    >
                        <p className="text-white/25 text-xs font-bold uppercase tracking-[0.28em] mb-3">Giá — Rõ, Không Úp Mở</p>
                        <h2 className="text-3xl sm:text-5xl font-black text-white mb-3">
                            Chọn Edge Của Bạn
                        </h2>
                        <p className="text-white/30 max-w-xl text-sm">
                            Flexible plans cho mọi stage trong poker career của bạn.
                        </p>
                    </div>
                )}

                {/* Plans */}
                <div
                    ref={cards.ref as React.RefObject<HTMLDivElement>}
                    className={`reveal grid grid-cols-1 md:grid-cols-3 gap-5 items-start mb-8 ${cards.visible ? 'is-visible' : ''}`}
                >
                    {PLANS.map((plan, i) => {
                        const isPopular = plan.popular;
                        return (
                        <div
                            key={plan.id}
                            className={`group relative flex flex-col rounded-2xl border p-7 transition-all duration-300 ${
                                isPopular
                                    ? 'border-yellow-500/30 bg-white/[0.04] scale-[1.02] z-10 hover:shadow-[0_0_60px_rgba(255,196,0,0.12)] hover:-translate-y-1'
                                    : 'border-white/6 bg-white/[0.02] hover:bg-white/[0.03] hover:border-white/12 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)]'
                            }`}
                            style={{ transitionDelay: `${i * 80}ms` }}
                        >
                            {isPopular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-1 rounded-full bg-yellow-500 text-black uppercase tracking-widest whitespace-nowrap">
                                    Được Chọn Nhiều Nhất
                                </div>
                            )}

                            <div className="mb-7">
                                <h3 className={`text-base font-black mb-0.5 ${isPopular ? 'text-yellow-400' : 'text-white/60 group-hover:text-white/80 transition-colors duration-200'}`}>
                                    {plan.name}
                                </h3>
                                <p className="text-xs text-white/20 italic mb-4">{plan.tagline}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white">${plan.price}</span>
                                    <span className="text-white/25 text-sm">/tháng</span>
                                </div>
                            </div>

                            <ul className="space-y-2.5 flex-1 mb-7">
                                {plan.features.map((f, j) => (
                                    <li key={j} className="flex items-start gap-3">
                                        <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isPopular ? 'text-yellow-400/60' : 'text-white/20 group-hover:text-white/35 transition-colors duration-200'}`} />
                                        <span className="text-sm text-white/45">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/register"
                                className={`w-full py-3 rounded-xl font-black text-center transition-all duration-200 text-sm ${
                                    isPopular
                                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:opacity-92 hover:shadow-[0_0_20px_rgba(255,196,0,0.3)]'
                                        : 'bg-white/5 text-white/50 border border-white/8 hover:bg-white/8 hover:text-white/75 hover:border-white/15'
                                }`}
                            >
                                {isPopular ? 'Mở Vault Pro' : `Bắt đầu ${plan.name}`}
                            </Link>
                        </div>
                        );
                    })}

                </div>

                {/* Add-on */}
                <div className="max-w-md mx-auto rounded-xl border border-white/6 bg-white/[0.02] p-5 flex items-center justify-between gap-4 mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/4 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white/30" />
                        </div>
                        <div>
                            <p className="text-white/60 font-bold text-sm">Nạp Lẻ</p>
                            <p className="text-white/25 text-xs">{ADDON.hands} hand · Không cần subscribe</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-white font-black text-xl">${ADDON.price}</p>
                        <Link href="/register" className="text-xs text-yellow-400/60 font-bold hover:text-yellow-400 transition-colors">Nạp ngay →</Link>
                    </div>
                </div>

                {/* FAQ */}
                {!isDashboard && (
                    <div
                        ref={faq.ref as React.RefObject<HTMLDivElement>}
                        className={`reveal grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto ${faq.visible ? 'is-visible' : ''}`}
                    >
                        {[
                            { q: 'Có mệt không?', a: 'Không — để Vault nghĩ hộ, bạn bấm theo.' },
                            { q: 'Có tilt không?', a: 'Vault không biết "thua 3 hand liền là cay".' },
                            { q: 'Không rành poker?', a: 'Biết luật là đủ. Vault kéo bạn lên dần.' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-white/6 bg-white/[0.02] p-4"
                                style={{ transitionDelay: `${i * 80}ms` }}
                            >
                                <p className="text-white/50 font-bold text-xs mb-1">{item.q}</p>
                                <p className="text-white/25 text-xs leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
