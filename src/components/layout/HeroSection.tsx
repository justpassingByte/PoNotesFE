'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useReveal } from '@/hooks/useReveal';
import { useLanguage } from '@/i18n/LanguageContext';

export function HeroSection() {
    const badge = useReveal();
    const headline = useReveal();
    const sub = useReveal();
    const ctas = useReveal();
    const img = useReveal();
    const { t } = useLanguage();

    return (

        <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20 overflow-hidden">

            <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 w-full">

                <div className="flex-1 text-center lg:text-left">

                    {/* Overline — chìm */}
                    <p
                        ref={badge.ref as React.RefObject<HTMLParagraphElement>}
                        className={`reveal text-white/30 text-xs font-bold uppercase tracking-[0.28em] mb-7 ${badge.visible ? 'is-visible' : ''}`}
                    >
                        {t('landing.hero.badge') || "Két Sắt Poker Đầu Tiên của Bạn"}
                    </p>

                    {/* Headline — nổi nhất */}
                    <h1
                        ref={headline.ref as React.RefObject<HTMLHeadingElement>}
                        className={`reveal text-5xl sm:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6 ${headline.visible ? 'is-visible' : ''}`}
                        style={{ transitionDelay: '80ms' }}
                    >
                        {t('landing.hero.h1_prefix') || "Giữ Tiền."}{' '}
                        <br className="hidden sm:block" />
                        <span style={{
                            background: 'linear-gradient(95deg, #ffc400 0%, #ffe680 50%, #ffc400 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            {t('landing.hero.h1_highlight') || "Tạo Tiền."}
                        </span>
                        <br />
                        {t('landing.hero.h1_suffix') || "Không Tilt."}
                    </h1>

                    <div
                        ref={sub.ref as React.RefObject<HTMLDivElement>}
                        className={`reveal ${sub.visible ? 'is-visible' : ''}`}
                        style={{ transitionDelay: '160ms' }}
                    >
                        {/* Sub-headline — đọc được */}
                        <p className="text-base sm:text-lg text-white/55 max-w-lg leading-relaxed mb-3 mx-auto lg:mx-0"
                           dangerouslySetInnerHTML={{ __html: t('landing.hero.subtitle') || "Villiant Vault là <span className=\"text-white font-semibold\">bộ não AI</span> tại bàn — không phải solver, lối chơi linh hoạt, <span className=\"text-white/80 font-semibold\">bạn hôm sau ≠ bạn hôm nay</span>." }}
                        />
                        {/* Tagline — chìm hẳn */}
                        <p className="text-sm text-white/25 italic mb-10 mx-auto lg:mx-0">
                            {t('landing.hero.quote') || "\"Nắm giữ điểm yếu + kho kiến thức và bảo vệ chén cơm của bạn khỏi kẻ xấu\""}
                        </p>
                    </div>

                    {/* CTAs */}
                    <div
                        ref={ctas.ref as React.RefObject<HTMLDivElement>}
                        className={`reveal flex flex-col sm:flex-row gap-3 justify-center lg:justify-start ${ctas.visible ? 'is-visible' : ''}`}
                        style={{ transitionDelay: '240ms' }}
                    >
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-black text-black text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                            style={{ background: 'linear-gradient(135deg, #ffc400, #ffdd55)' }}
                        >
                            {t('landing.hero.cta_main') || "Vào Dashboard"}
                        </Link>
                        <Link
                            href="#pricing"
                            onClick={(e) => {
                                e.preventDefault();
                                const el = document.getElementById('pricing');
                                if (!el) return;
                                window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
                            }}
                            className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-bold text-white/50 text-sm bg-white/4 border border-white/10 hover:bg-white/8 hover:text-white/80 transition-all duration-200"
                        >
                            {t('landing.hero.cta_sub') || "Xem Giá"}
                        </Link>
                    </div>

                    {/* Trust line — chìm */}
                    <div
                        className={`reveal flex flex-wrap gap-6 mt-9 justify-center lg:justify-start text-[11px] font-bold text-white/20 uppercase tracking-widest ${ctas.visible ? 'is-visible' : ''}`}
                        style={{ transitionDelay: '320ms' }}
                        dangerouslySetInnerHTML={{ __html: t('landing.hero.trust')?.replace(' · ', ' <span class="text-white/10">·</span> ') || "Không cần căng não <span class=\"text-white/10\">·</span> Lên trình nhanh như HT2" }}
                    />
                </div>

                {/* Right image */}
                <div
                    ref={img.ref as React.RefObject<HTMLDivElement>}
                    className={`reveal-fade flex-1 flex items-center justify-center ${img.visible ? 'is-visible' : ''}`}
                    style={{ transitionDelay: '200ms' }}
                >
                    <div className="relative w-full max-w-md">
                        <div
                            className="absolute inset-0 rounded-3xl blur-3xl opacity-30"
                            style={{ background: 'radial-gradient(ellipse at center, rgba(255,196,0,0.3) 0%, transparent 70%)' }}
                        />
                        <div className="relative z-10 w-full aspect-square md:aspect-auto md:h-[520px] rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden shadow-2xl flex flex-col">
                            {/* Mac window header */}
                            <div className="h-10 w-full shrink-0 flex items-center gap-2 border-b border-white/5 px-4 bg-white/5">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-400 transition-colors cursor-pointer"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 hover:bg-amber-400 transition-colors cursor-pointer"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 hover:bg-emerald-400 transition-colors cursor-pointer"></div>
                                <div className="ml-4 h-3 w-32 bg-white/10 rounded-full"></div>
                            </div>
                            {/* Body */}
                            <div className="flex-1 p-6 flex flex-col gap-4 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-400/20 blur-[60px] rounded-full"></div>
                                {/* Header */}
                                <div className="flex justify-between items-center z-10">
                                    <div className="h-6 w-32 bg-white/10 rounded-md"></div>
                                    <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-white/50 text-[10px]">AI</div>
                                </div>
                                {/* Cards */}
                                <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-5 mt-2 flex flex-col gap-5 z-10 backdrop-blur-sm">
                                    <div className="h-5 w-40 bg-white/10 rounded flex items-center px-2 shadow-inner"></div>
                                    <div className="h-32 w-full bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl relative overflow-hidden group">
                                         <div className="absolute top-4 left-4 h-10 w-10 bg-emerald-500/20 rounded-lg border border-emerald-500/30"></div>
                                         <div className="absolute top-5 left-16 h-3 w-32 bg-emerald-400/50 rounded"></div>
                                         <div className="absolute top-9 left-16 h-2 w-20 bg-emerald-400/30 rounded"></div>
                                         <div className="absolute bottom-4 left-4 right-4 h-8 border border-emerald-500/30 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400/70 text-[10px] font-bold tracking-widest text-shadow">GTO ALIGNED 100%</div>
                                    </div>
                                    <div className="flex gap-3 mt-auto">
                                        <div className="h-10 flex-1 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[10px] text-white/30 font-bold">FOLD</div>
                                        <div className="h-10 flex-[2] bg-yellow-400/20 rounded-lg border border-yellow-400/30 flex items-center justify-center text-[10px] text-yellow-500 font-bold tracking-widest shadow-[0_0_15px_rgba(255,196,0,0.1)]">DOMINATE CALL</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Badge bên dưới ảnh — chìm */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 border border-white/8 text-[11px] font-bold text-white/25 whitespace-nowrap z-20 backdrop-blur">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/50 animate-pulse" />
                            {t('landing.hero.badge_ai') || "AI đang canh gác tiền của bạn"}
                        </div>
                    </div>
                </div>
            </div>
            {/* Scroll-down button — always centered */}
            <button
                onClick={() => {
                    const el = document.getElementById('features');
                    if (!el) return;
                    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
                }}
                className={`reveal mt-12 mx-auto flex flex-col items-center gap-1.5 group cursor-pointer ${ctas.visible ? 'is-visible' : ''}`}
                style={{ transitionDelay: '400ms', background: 'none', border: 'none', padding: 0 }}
                aria-label="Scroll down"
            >
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.25em] group-hover:text-white/50 transition-colors duration-200">
                    {t('landing.hero.scroll') || "Khám phá"}
                </span>
                <div className="w-6 h-10 rounded-full border border-white/12 flex items-start justify-center pt-2 group-hover:border-white/30 transition-colors duration-200">
                    <div className="w-1 h-2 rounded-full bg-white/25 group-hover:bg-yellow-400/60 animate-bounce transition-colors duration-200" />
                </div>
            </button>
        </section>
    );
}
