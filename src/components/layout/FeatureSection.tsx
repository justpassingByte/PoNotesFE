'use client';

import React from 'react';
import Image from 'next/image';
import { useReveal } from '@/hooks/useReveal';
import { useLanguage } from '@/i18n/LanguageContext';

function RevealBlock({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const { ref, visible } = useReveal();
    return (
        <div
            ref={ref as React.RefObject<HTMLDivElement>}
            className={`reveal ${visible ? 'is-visible' : ''}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

export function FeatureSection() {
    const painHead = useReveal();
    const painGrid = useReveal();
    const uxHead = useReveal();
    const hudHead = useReveal();
    const featureHead = useReveal();
    const featureGrid = useReveal();
    const { t } = useLanguage();

    const PAIN_POINTS = [
        { text: '"Chắc nó bluff" → call → mất tiền', fix: 'Vault tính xác suất cho bạn' },
        { text: 'Học GTO xong vào bàn vẫn đánh tâm linh', fix: 'Review tự động sau mỗi hand' },
        { text: 'Không biết thằng nào là ATM, thằng nào là CHỐT', fix: 'HUD Player Profiling tức thì' },
    ];
    
    const FEATURES = [
        { title: t('landing.features.f1_title') || 'Quyết Định < 100ms',          desc: t('landing.features.f1_desc') || 'Crop ảnh bàn chơi → paste → nhận Call/Fold + range + plan chi tiết. Không cần căng não.' },
        { title: t('landing.features.f2_title') || 'HUD "Bóc Bài" Đối Thủ',        desc: t('landing.features.f2_desc') || 'Panel riêng: Whale, Reg, hay bạn tự troll mình. Gợi ý exploit cụ thể, không "tùy tình huống".' },
        { title: t('landing.features.f3_title') || 'AI Tuning (Tính Năng Mới)',      desc: t('landing.features.f3_desc') || 'Tùy biến AI hoàn toàn. Ép AI trả lời kiểu bảo thủ (GTO) hay điên cuồng (Max Exploit) theo ý bạn bằng các prompt cực mạnh.' },
        { title: t('landing.features.f4_title') || 'Team AI Có Cá Tính Riêng',      desc: t('landing.features.f4_desc') || 'Không phải 1 AI nhàm chán. Là team pro mỗi thằng mỗi tính cách — không biết tilt, không biết mệt.' },
        { title: t('landing.features.f5_title') || 'Giảm Leak, Không Đốt Chip Ngu', desc: t('landing.features.f5_desc') || 'System sửa bạn mỗi ngày — không toxic nhưng cũng không nương tay.' },
        { title: t('landing.features.f6_title') || 'GTO Baseline + Exploit HYBRID', desc: t('landing.features.f6_desc') || 'GTO cho khung, exploit để hốt tiền, memory để không quên thằng nào ngu.' },
    ];

    return (
        <>
            {/* ─── Pain Point ─── */}
            <section id="features" className="relative py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div
                        ref={painHead.ref as React.RefObject<HTMLDivElement>}
                        className={`reveal mb-12 ${painHead.visible ? 'is-visible' : ''}`}
                    >
                        {/* Overline — chìm */}
                        <p className="text-white/25 text-xs font-bold uppercase tracking-[0.28em] mb-3">
                            {t('landing.features.pain_overline') || "Pain Point — Nói thẳng, hơi đau nhưng thật"}
                        </p>
                        {/* H2 — nổi */}
                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight"
                            dangerouslySetInnerHTML={{ __html: t('landing.features.pain_h2') || "Bạn đang gamble mà <span className=\"text-yellow-400\">không có edge</span>." }}
                        />
                        {/* Sub — đọc được */}
                        <p className="text-white/50 mt-3 max-w-lg text-sm leading-relaxed">
                            {t('landing.features.pain_sub') || "Donate đều mỗi ngày, đuối dần và tilt. Thay vì ném tiền cho cá, hãy đưa vào két sắt này."}
                        </p>
                    </div>

                    <div
                        ref={painGrid.ref as React.RefObject<HTMLDivElement>}
                        className={`reveal grid gap-3 sm:grid-cols-3 mb-20 ${painGrid.visible ? 'is-visible' : ''}`}
                    >
                        {PAIN_POINTS.map((p, i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-white/6 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors duration-300"
                                style={{ transitionDelay: `${i * 80}ms` }}
                            >
                                {/* Mistake — màu amber nhẹ để gợi cảm giác "sai" */}
                                <p className="text-amber-200/70 text-sm mb-3 leading-snug">{p.text}</p>
                                <div className="flex items-center gap-2 text-xs font-semibold pt-3 border-t border-white/5">
                                    {/* Fix — xanh lá = giải pháp */}
                                    <span className="text-emerald-400/70">+</span>
                                    <span className="text-emerald-400/60">{p.fix}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ─── UX Demo ─── */}
                    <div className="flex flex-col lg:flex-row items-center gap-14 py-4">
                        <div className="flex-1 order-2 lg:order-1">
                            <div
                                ref={uxHead.ref as React.RefObject<HTMLDivElement>}
                                className={`reveal ${uxHead.visible ? 'is-visible' : ''}`}
                            >
                                {/* Overline — chìm */}
                                <p className="text-white/25 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                                    {t('landing.features.ux_overline') || "UX — Lười vẫn chơi như pro"}
                                </p>
                                {/* H3 — nổi */}
                                <h3 className="text-2xl sm:text-3xl font-black text-white mb-6 leading-tight"
                                    dangerouslySetInnerHTML={{ __html: t('landing.features.ux_h3') || "Bạn làm 3 thứ.<br/><span className=\"text-yellow-400\">Vault làm phần còn lại.</span>" }}
                                />
                                {/* Steps: số chìm, text đọc được */}
                                <div className="space-y-3 mb-8">
                                    {[
                                        t('landing.ux_steps.step1') || 'Crop ảnh bàn chơi (flop / turn / action)',
                                        t('landing.ux_steps.step2') || 'Paste vào app',
                                        t('landing.ux_steps.step3') || 'Liếc màn hình phụ'
                                    ].map((action, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <span className="text-base font-black text-white/15 w-8 shrink-0 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                                            <p className="text-white/60 text-sm">{action}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Terminal — màu theo loại thông tin */}
                                <div className="rounded-xl border border-white/8 bg-black/60 p-4 font-mono text-xs space-y-1.5">
                                    <div className="text-white/30 font-semibold mb-1">TURN (vs raise):</div>
                                    <div className="flex gap-5">
                                        {/* Call = gold = action quan trọng */}
                                        <span className="text-white/50">Call: <strong className="text-yellow-400 font-black">%</strong></span>
                                        {/* Fold = muted */}
                                        <span className="text-white/35">Fold: <strong className="text-white/45">%</strong></span>
                                    </div>
                                    <div className="text-white/20 pt-1">Range:</div>
                                    {/* Call range = xanh lá */}
                                    <div className="text-emerald-400/60">– Call: {t('landing.term.call') || 'KQ, KJ, draw tốt'}</div>
                                    {/* Fold range = đỏ nhạt */}
                                    <div className="text-rose-400/50">– Fold: {t('landing.term.fold') || 'air, weak pair'}</div>
                                    <div className="text-white/20 pt-1">Plan:</div>
                                    <div className="text-white/40">– XR strong  •  Brick → call ~%</div>
                                    <div className="text-white/40">– Scare → fold ~%  •  Improve → value ~% pot</div>
                                </div>
                            </div>
                        </div>

                        <RevealBlock delay={100}>
                            <div className="flex-1 order-1 lg:order-2 flex justify-center">
                                <div className="relative w-full max-w-xs">
                                    <div
                                        className="absolute inset-0 rounded-2xl blur-2xl opacity-20"
                                        style={{ background: 'radial-gradient(ellipse at center, rgba(255,196,0,0.4) 0%, transparent 70%)' }}
                                    />
                                    <Image
                                        src="/ux_preview.png"
                                        alt="Villiant Vault — Analysis Panel"
                                        width={380}
                                        height={380}
                                        className="relative z-10 w-full h-auto rounded-2xl"
                                    />
                                </div>
                            </div>
                        </RevealBlock>
                    </div>
                </div>
            </section>

            {/* ─── HUD Section ─── */}
            <section id="profiles" className="relative py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-14">
                        <RevealBlock delay={0}>
                            <div className="flex-1 flex justify-center">
                                <div className="relative w-full max-w-xs">
                                    <div
                                        className="absolute inset-0 rounded-2xl blur-2xl opacity-15"
                                        style={{ background: 'radial-gradient(ellipse at center, rgba(255,196,0,0.3) 0%, transparent 70%)' }}
                                    />
                                    <Image
                                        src="/hud_preview.png"
                                        alt="HUD Player Profiling — Villiant Vault"
                                        width={380}
                                        height={380}
                                        className="relative z-10 w-full h-auto rounded-2xl"
                                    />
                                </div>
                            </div>
                        </RevealBlock>

                        <div className="flex-1">
                            <div
                                ref={hudHead.ref as React.RefObject<HTMLDivElement>}
                                className={`reveal ${hudHead.visible ? 'is-visible' : ''}`}
                            >
                                {/* Overline — chìm */}
                                <p className="text-white/25 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                                    {t('landing.hud.overline') || "HUD — Bảng vàng \"bóc bài\""}
                                </p>
                                {/* H3 — nổi */}
                                <h3 className="text-2xl sm:text-3xl font-black text-white mb-6 leading-tight"
                                    dangerouslySetInnerHTML={{ __html: t('landing.hud.h3') || "Không nằm trên bàn.<br/><span class=\"text-yellow-400\">Panel riêng, nhìn cái hiểu luôn.</span>" }}
                                />
                                <div className="space-y-3">
                                    {[
                                        {
                                            label: t('landing.hud.whales_label') || 'Top Whales', sub: t('landing.hud.whales_sub') || 'Máy ATM di động',
                                            stats: [t('landing.hud.whales_s1') || 'Overfold turn: VERY HIGH', t('landing.hud.whales_s2') || 'Call river: TOO MUCH'],
                                            tip: t('landing.hud.whales_tip') || 'Bluff turn nhiều hơn  •  Value bet mỏng river',
                                            statColor: 'text-rose-400/70',
                                            labelColor: 'text-amber-300',
                                        },
                                        {
                                            label: t('landing.hud.regs_label') || 'Top Regs', sub: t('landing.hud.regs_sub') || 'Ăn cơm bằng edge',
                                            stats: [t('landing.hud.regs_s1') || 'Underbluff river: HIGH', t('landing.hud.regs_s2') || 'Overfold vs pressure: HIGH'],
                                            tip: t('landing.hud.regs_tip') || 'Overbluff river  •  Đè turn mạnh',
                                            statColor: 'text-sky-400/60',
                                            labelColor: 'text-sky-300',
                                        },
                                        {
                                            label: t('landing.hud.you_label') || 'Bạn', sub: t('landing.hud.you_sub') || 'Đừng tự troll mình',
                                            stats: [t('landing.hud.you_s1') || 'Overcall river: DETECTED', t('landing.hud.you_s2') || 'Underbluff: CONFIRMED'],
                                            tip: t('landing.hud.you_tip') || 'System sửa bạn mỗi ngày — không nương tay 😄',
                                            statColor: 'text-emerald-400/60',
                                            labelColor: 'text-emerald-300',
                                        },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className="rounded-xl border border-white/6 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors duration-300"
                                        >
                                            <div className="flex items-baseline gap-2 mb-1.5">
                                                <span className={`font-black text-sm ${item.labelColor}`}>{item.label}</span>
                                                <span className="text-white/25 text-xs">{item.sub}</span>
                                            </div>
                                            <div className="flex gap-4 text-xs mb-1.5">
                                                {item.stats.map((s, j) => (
                                                    <span key={j} className={`font-semibold ${item.statColor}`}>{s}</span>
                                                ))}
                                            </div>
                                            <p className="text-xs text-white/30 italic">{item.tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Feature Grid ─── */}
            <section className="relative py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div
                        ref={featureHead.ref as React.RefObject<HTMLDivElement>}
                        className={`reveal mb-12 ${featureHead.visible ? 'is-visible' : ''}`}
                    >
                        {/* Overline — chìm */}
                        <p className="text-white/25 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                            {t('landing.what_is.overline') || "Kho Kiến Thức"}
                        </p>
                        {/* H2 — nổi */}
                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                            {t('landing.what_is.h2') || "Villiant Vault là gì?"}
                        </h2>
                        {/* Sub — đọc được */}
                        <p className="text-white/50 mt-3 max-w-lg text-sm leading-relaxed"
                           dangerouslySetInnerHTML={{ __html: t('landing.what_is.sub') || "Không phải tool. Không phải solver. Không phải HUD VPIP/PFR rối não. <span class=\"text-white font-semibold\">2026 rồi</span> — là két sắt + bộ não + team toàn pro không biết tilt." }}
                        />
                    </div>
                    <div
                        ref={featureGrid.ref as React.RefObject<HTMLDivElement>}
                        className={`reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${featureGrid.visible ? 'is-visible' : ''}`}
                    >
                        {FEATURES.map((f, i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-white/6 bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-yellow-500/15 transition-all duration-300 group"
                                style={{ transitionDelay: `${i * 60}ms` }}
                            >
                                {/* Số thứ tự mờ — đạo cụ */}
                                <span className="text-[10px] font-black text-white/15 mb-2 block tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                                {/* Title — vàng nhẹ khi hover */}
                                <h3 className="text-sm font-black mb-1.5 text-white/80 group-hover:text-yellow-300 transition-colors duration-200">{f.title}</h3>
                                {/* Desc — đọc được */}
                                <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
