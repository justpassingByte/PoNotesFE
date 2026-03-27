'use client';

import React from 'react';
import Link from 'next/link';
import { useReveal } from '@/hooks/useReveal';
import { useLanguage } from '@/i18n/LanguageContext';

export function ContactSection() {
    const head = useReveal();
    const compare = useReveal();
    const finale = useReveal();
    const { t } = useLanguage();

    const COMPARISON = [
        { losing: t('landing.contact.losing1') || 'Chơi bằng cảm giác',    winning: t('landing.contact.winning1') || 'Quyết định theo tần suất' },
        { losing: t('landing.contact.losing2') || 'Donate cho reg mỗi ngày', winning: t('landing.contact.winning2') || 'Exploit whale, né reg' },
        { losing: t('landing.contact.losing3') || 'Tự hỏi "sao mình xui"', winning: t('landing.contact.winning3') || 'Thoải mái tư tưởng' },
        { losing: t('landing.contact.losing4') || 'Học GTO xong quên',      winning: t('landing.contact.winning4') || 'Vault nhắc bạn mỗi ngày' },
    ];

    return (
        <>
            <section id="contact" className="relative py-20">
                <div className="max-w-5xl mx-auto px-6">

                    {/* Comparison */}
                    <div className="mb-16">
                        <div
                            ref={head.ref as React.RefObject<HTMLDivElement>}
                            className={`reveal mb-10 ${head.visible ? 'is-visible' : ''}`}
                        >
                            <p className="text-white/25 text-xs font-bold uppercase tracking-[0.28em] mb-3">
                                {t('landing.contact.compare_overline') || "Chốt — hơi ngông nhưng đúng"}
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                                {t('landing.contact.compare_h2') || "Bạn có 2 đường."}
                            </h2>
                        </div>

                        <div
                            ref={compare.ref as React.RefObject<HTMLDivElement>}
                            className={`reveal grid sm:grid-cols-2 gap-4 ${compare.visible ? 'is-visible' : ''}`}
                        >
                            {/* Losing — màu nhạt/tối hơn, header đỏ nhẹ */}
                            <div className="rounded-xl border border-white/6 bg-white/[0.02] p-7">
                                <h3 className="text-xs font-black text-rose-400/50 uppercase tracking-widest mb-5">
                                    ✕ &nbsp; {t('landing.contact.path1') || "Đường 1 — Tự Troll Mình"}
                                </h3>
                                <ul className="space-y-3">
                                    {COMPARISON.map((c, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="text-rose-500/30 mt-0.5 shrink-0 text-xs font-bold">—</span>
                                            <span className="text-white/30 text-sm line-through decoration-white/15">{c.losing}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Winning — xanh lá = giải pháp */}
                            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] p-7">
                                <h3 className="text-xs font-black text-emerald-400/60 uppercase tracking-widest mb-5">
                                    ✓ &nbsp; {t('landing.contact.path2') || "Đường 2 — Đưa Tiền Cho Vault"}
                                </h3>
                                <ul className="space-y-3">
                                    {COMPARISON.map((c, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="text-emerald-400/50 mt-0.5 shrink-0 text-xs font-bold">✓</span>
                                            <span className="text-white/65 text-sm font-medium">{c.winning}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div
                        ref={finale.ref as React.RefObject<HTMLDivElement>}
                        className={`reveal text-center rounded-2xl border border-white/6 bg-white/[0.02] p-12 sm:p-16 relative overflow-hidden ${finale.visible ? 'is-visible' : ''}`}
                    >
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,196,0,0.04) 0%, transparent 60%)' }}
                        />
                        <blockquote className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3 relative z-10">
                            {t('landing.contact.bigquote') || "Poker vẫn là gamble."}
                        </blockquote>
                        <p className="text-base text-white/45 leading-relaxed max-w-lg mx-auto mb-2 relative z-10"
                           dangerouslySetInnerHTML={{ __html: t('landing.contact.bigsub') || "Nhưng với <span class=\"text-white font-bold\">Villiant Vault</span>, bạn gamble có <span class=\"text-yellow-400 font-black\">KẾ HOẠCH</span>." }}
                        />
                        <p className="text-sm text-white/25 mb-9 relative z-10"
                           dangerouslySetInnerHTML={{ __html: t('landing.contact.h2') || "Bạn không phải con bạc — bạn là <span class=\"text-yellow-400 font-black\">DOANH NHÂN</span>." }}
                        />
                        <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-black text-black text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                                style={{ background: 'linear-gradient(135deg, #ffc400, #ffdd55)' }}
                            >
                                {t('landing.contact.btn') || "Mở Vault Ngay"}
                            </Link>
                            <button
                                onClick={() => {
                                    const el = document.getElementById('pricing');
                                    if (!el) return;
                                    window.scrollTo({ top: el.getBoundingClientRect().top - 80, behavior: 'smooth' });
                                }}
                                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-white/40 text-sm bg-white/4 border border-white/8 hover:bg-white/8 hover:text-white/60 transition-all duration-200"
                                style={{ background: 'none' }}
                            >
                                {t('landing.hero.cta_sub') || "Xem Giá"}
                            </button>
                        </div>
                        <p className="text-xs text-white/15 mt-7 relative z-10">
                            {t('landing.contact.note') || "Không cần credit card để bắt đầu. Hủy bất kỳ lúc nào."}
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
