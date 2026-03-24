'use client';

import React from 'react';
import Link from 'next/link';
import { useReveal } from '@/hooks/useReveal';

const COMPARISON = [
    { losing: 'Chơi bằng cảm giác',    winning: 'Quyết định theo tần suất' },
    { losing: 'Donate cho reg mỗi ngày', winning: 'Exploit whale, né reg' },
    { losing: 'Tự hỏi "sao mình xui"', winning: 'Thoải mái tư tưởng' },
    { losing: 'Học GTO xong quên',      winning: 'Vault nhắc bạn mỗi ngày' },
];

export function ContactSection() {
    const head = useReveal();
    const compare = useReveal();
    const finale = useReveal();

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
                                Chốt — hơi ngông nhưng đúng
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                                Bạn có 2 đường.
                            </h2>
                        </div>

                        <div
                            ref={compare.ref as React.RefObject<HTMLDivElement>}
                            className={`reveal grid sm:grid-cols-2 gap-4 ${compare.visible ? 'is-visible' : ''}`}
                        >
                            {/* Losing — màu nhạt/tối hơn, header đỏ nhẹ */}
                            <div className="rounded-xl border border-white/6 bg-white/[0.02] p-7">
                                <h3 className="text-xs font-black text-rose-400/50 uppercase tracking-widest mb-5">
                                    ✕ &nbsp; Đường 1 — Tự Troll Mình
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
                                    ✓ &nbsp; Đường 2 — Đưa Tiền Cho Vault
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
                            Poker vẫn là gamble.
                        </blockquote>
                        <p className="text-base text-white/45 leading-relaxed max-w-lg mx-auto mb-2 relative z-10">
                            Nhưng với <span className="text-white font-bold">Villiant Vault</span>,
                            bạn gamble có <span className="text-yellow-400 font-black">KẾ HOẠCH</span>.
                        </p>
                        <p className="text-sm text-white/25 mb-9 relative z-10">
                            Bạn không phải con bạc — bạn là <span className="text-yellow-400 font-black">DOANH NHÂN</span>.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-black text-black text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                                style={{ background: 'linear-gradient(135deg, #ffc400, #ffdd55)' }}
                            >
                                Mở Vault Ngay
                            </Link>
                            <button
                                onClick={() => {
                                    const el = document.getElementById('pricing');
                                    if (!el) return;
                                    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
                                }}
                                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-white/40 text-sm bg-white/4 border border-white/8 hover:bg-white/8 hover:text-white/60 transition-all duration-200"
                                style={{ background: 'none' }}
                            >
                                Xem Giá
                            </button>
                        </div>
                        <p className="text-xs text-white/15 mt-7 relative z-10">
                            Không cần credit card để bắt đầu. Hủy bất kỳ lúc nào.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
