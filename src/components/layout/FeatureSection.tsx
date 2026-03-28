'use client';

import React, { useState } from 'react';
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
    const [lightbox, setLightbox] = useState<string | null>(null);

    const PAIN_POINTS = [
        { text: t('landing.features.p1_text') || '"Chắc nó bluff" → call → mất tiền', fix: t('landing.features.p1_fix') || 'Vault tính xác suất cho bạn' },
        { text: t('landing.features.p2_text') || 'Học GTO xong vào bàn vẫn đánh tâm linh', fix: t('landing.features.p2_fix') || 'Review tự động sau mỗi hand' },
        { text: t('landing.features.p3_text') || 'Không biết thằng nào là ATM, thằng nào là CHỐT', fix: t('landing.features.p3_fix') || 'Phân loại đối thủ tức thì (Whale/Reg)' },
        { text: t('landing.features.p4_text') || 'Thấy đánh "sai sai" nhưng không biết note thế nào', fix: t('landing.features.p4_fix') || 'Viết tự do, AI tự động tóm tắt' },
        { text: t('landing.features.p5_text') || 'Ghi chú đống lúc vào trận không kịp dùng', fix: t('landing.features.p5_fix') || 'Tự động gắn note vào kế hoạch đánh Real-time' },
        { text: t('landing.features.p6_text') || 'HUD tung rổ số liệu bắt tự suy nghĩ', fix: t('landing.features.p6_fix') || 'Điểm mặt ĐIỂM YẾU thẳng luôn' },
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
                                {/* Overline */}
                                <p className="text-white/25 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                                    {t('landing.features.ux_overline') || "Hand Analyzer — Review như Pro"}
                                </p>
                                {/* H3 */}
                                <h3 className="text-2xl sm:text-3xl font-black text-white mb-6 leading-tight"
                                    dangerouslySetInnerHTML={{ __html: t('landing.features.ux_h3') || "Upload hand.<br/><span class=\"text-yellow-400\">AI mổ xẻ từng sai lầm.</span>" }}
                                />
                                {/* Steps */}
                                <div className="space-y-3 mb-8">
                                    {[
                                        t('landing.ux_steps.step1') || 'Paste / upload hand history hoặc ảnh bàn chơi',
                                        t('landing.ux_steps.step2') || 'AI phân tích từng street — chỉ ra leak & mistake',
                                        t('landing.ux_steps.step3') || 'Nhận chiến thuật exploit cụ thể cho lần sau'
                                    ].map((action, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <span className="text-base font-black text-white/15 w-8 shrink-0 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                                            <p className="text-white/60 text-sm">{action}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Terminal — AI analysis output preview */}
                                <div className="rounded-xl border border-white/8 bg-black/60 p-4 font-mono text-xs space-y-1.5">
                                    <div className="text-white/30 font-semibold mb-1">{t('landing.terminal.header') || 'AI ANALYSIS OUTPUT:'}</div>
                                    <div className="text-amber-400/70 font-semibold">{t('landing.terminal.mistake') || '⚠ TURN — BB check → fold to small bet'}</div>
                                    <div className="text-white/40">{t('landing.terminal.desc') || 'Quá passive, bỏ lỡ cơ hội value bet river'}</div>
                                    <div className="text-white/20 pt-1">{t('landing.terminal.exploit_label') || 'Exploit Strategy:'}</div>
                                    <div className="text-emerald-400/60">– {t('landing.terminal.exploit_1') || 'BET river 75% pot | range: TT+, AQs+ | freq: 80%'}</div>
                                    <div className="text-sky-400/50">– {t('landing.terminal.exploit_2') || 'FOLD turn vs 3x raise | range: weak pairs | freq: 100%'}</div>
                                    <div className="text-white/20 pt-1">{t('landing.terminal.leak_label') || 'Leak Detected:'}</div>
                                    <div className="text-rose-400/50">– {t('landing.terminal.leak_1') || 'Passive river play — trigger: check + fold to small bet'}</div>
                                </div>
                            </div>
                        </div>

                        <RevealBlock delay={100}>
                            <div className="flex-1 order-1 lg:order-2 flex justify-center">
                                <div className="relative w-full">
                                    <div
                                        className="absolute inset-0 rounded-2xl blur-2xl opacity-20"
                                        style={{ background: 'radial-gradient(ellipse at center, rgba(255,196,0,0.4) 0%, transparent 70%)' }}
                                    />
                                    <div className="relative z-10 group/img cursor-pointer" onClick={() => setLightbox('/real_hand_analyzer.jpeg')}>
                                        <Image
                                            src="/real_hand_analyzer.jpeg"
                                            alt="Hand Analyzer Overview"
                                            width={800}
                                            height={800}
                                            className="w-full h-auto rounded-2xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover/img:scale-[1.02]"
                                        />
                                        <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover/img:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                            <span className="text-white/0 group-hover/img:text-white/90 text-xs font-bold uppercase tracking-widest transition-all duration-300 bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 scale-90 group-hover/img:scale-100">🔍 Click to expand</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </RevealBlock>
                    </div>
                </div>
            </section>

            {/* ─── HUD Detail Section ─── */}
            <section id="profiles" className="relative py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div
                        ref={hudHead.ref as React.RefObject<HTMLDivElement>}
                        className={`reveal text-center mb-14 ${hudHead.visible ? 'is-visible' : ''}`}
                    >
                        <p className="text-white/25 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                            {t('landing.hud.overline') || "HUD — Bảng vàng \"bóc bài\""}
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4"
                            dangerouslySetInnerHTML={{ __html: t('landing.hud.h3') || "Không nằm trên bàn.<br/><span class=\"text-yellow-400\">Panel riêng, nhìn cái hiểu luôn.</span>" }}
                        />
                        <p className="text-white/50 text-sm max-w-2xl mx-auto leading-relaxed">
                            {t('landing.hud.detail_sub') || "Mỗi đối thủ một hồ sơ riêng — AI phân tích Exploit Strategy, Positional Leaks, Range Adjustments và ghi chú tự động. Bạn chỉ cần nhìn và ra quyết định."}
                        </p>
                    </div>

                    {/* HUD Detail Screenshot — medium size */}
                    <RevealBlock delay={100}>
                        <div className="max-w-5xl mx-auto mb-12">
                            <div className="relative w-full rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden group/img cursor-pointer" onClick={() => setLightbox('/hud_detail.jpeg')}>
                                <div className="absolute inset-0 bg-yellow-400/5 group-hover/img:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
                                <Image
                                    src="/hud_detail.jpeg"
                                    alt="HUD Player Detail — Exploit Strategy, Leaks, AI Notes"
                                    width={1200}
                                    height={675}
                                    className="w-full h-auto opacity-90 group-hover/img:opacity-100 transition-all duration-500 group-hover/img:scale-[1.02]"
                                />
                                <div className="absolute inset-0 z-20 bg-black/0 group-hover/img:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                    <span className="text-white/0 group-hover/img:text-white/90 text-xs font-bold uppercase tracking-widest transition-all duration-300 bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 scale-90 group-hover/img:scale-100">🔍 Click to expand</span>
                                </div>
                            </div>
                        </div>
                    </RevealBlock>

                    {/* Feature highlights below the screenshot */}
                    <RevealBlock delay={200}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                {
                                    title: t('landing.hud.feat1_title') || 'Exploit Strategy',
                                    desc: t('landing.hud.feat1_desc') || 'AI tự động sinh chiến thuật exploit theo từng street, position, và tình huống cụ thể. Có sizing, range, frequency.',
                                    color: 'text-amber-400',
                                    borderColor: 'border-amber-500/20 hover:border-amber-500/40',
                                },
                                {
                                    title: t('landing.hud.feat2_title') || 'Positional Leaks',
                                    desc: t('landing.hud.feat2_desc') || 'Phát hiện leak theo node — passive river, loose turn call, overbet bluff... Mỗi leak kèm trigger cụ thể.',
                                    color: 'text-red-400',
                                    borderColor: 'border-red-500/20 hover:border-red-500/40',
                                },
                                {
                                    title: t('landing.hud.feat3_title') || 'AI Notes',
                                    desc: t('landing.hud.feat3_desc') || 'Ghi chú tự động từ mỗi ván đã phân tích. Kèm board texture, pot type, action line và mức độ nghiêm trọng.',
                                    color: 'text-emerald-400',
                                    borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
                                },
                                {
                                    title: t('landing.hud.feat4_title') || 'Range Adjustments',
                                    desc: t('landing.hud.feat4_desc') || 'Gợi ý thay đổi range cụ thể theo từng đối thủ — tighten, widen, overbet, trap — không chung chung.',
                                    color: 'text-sky-400',
                                    borderColor: 'border-sky-500/20 hover:border-sky-500/40',
                                },
                            ].map((feat, i) => (
                                <div
                                    key={i}
                                    className={`rounded-xl border bg-white/[0.02] p-5 transition-all duration-300 ${feat.borderColor}`}
                                    style={{ transitionDelay: `${i * 80}ms` }}
                                >
                                    <h4 className={`text-sm font-black mb-2 ${feat.color}`}>{feat.title}</h4>
                                    <p className="text-xs text-white/40 leading-relaxed">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </RevealBlock>
                </div>
            </section>

            {/* ─── Dashboard Overview Section ─── */}
            <section className="relative py-20 bg-black/40 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <RevealBlock delay={0}>
                        <p className="text-white/25 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                            {t('landing.dashboard.overline') || "Hệ Thống Quản Lý Mục Tiêu"}
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-6">
                            {t('landing.dashboard.h2') || "Dashboard Điều Khiển Sát Thủ"}
                        </h2>
                        <p className="text-white/50 text-sm max-w-2xl mx-auto leading-relaxed mb-12">
                            {t('landing.dashboard.sub') || "Không còn mù mờ về kẻ thù. Bảng điều khiển tập trung Priority Targets và Elite Regs, giúp bạn biết rõ bàn nào đáng đánh và ai đang tìm cách rút tiền của bạn."}
                        </p>
                    </RevealBlock>
                    
                    <RevealBlock delay={100}>
                        <div className="max-w-5xl mx-auto">
                            <div className="relative w-full rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden group/img cursor-pointer" onClick={() => setLightbox('/real_dashboard.png')}>
                                <div className="absolute inset-0 bg-yellow-400/5 group-hover/img:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
                                <Image
                                    src="/real_dashboard.png"
                                    alt="Villain Vault Dashboard Overview"
                                    width={1200}
                                    height={675}
                                    className="w-full h-auto opacity-90 group-hover/img:opacity-100 transition-all duration-500 group-hover/img:scale-[1.02]"
                                    priority
                                />
                                <div className="absolute inset-0 z-20 bg-black/0 group-hover/img:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                    <span className="text-white/0 group-hover/img:text-white/90 text-xs font-bold uppercase tracking-widest transition-all duration-300 bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 scale-90 group-hover/img:scale-100">🔍 Click to expand</span>
                                </div>
                            </div>
                        </div>
                    </RevealBlock>
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



            {/* Lightbox Modal */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/60 hover:text-white text-3xl font-bold z-10 w-10 h-10 flex items-center justify-center"
                        onClick={() => setLightbox(null)}
                    >
                        ✕
                    </button>
                    <Image
                        src={lightbox}
                        alt="Full size preview"
                        width={1920}
                        height={1080}
                        className="max-w-full max-h-[90vh] w-auto h-auto rounded-xl shadow-2xl object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
