'use client';

import React from 'react';
import { Brain, Camera, Target, Rocket } from 'lucide-react';
import Image from 'next/image';

interface FeatureProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    imagePath?: string;
    reverse?: boolean;
}

function FeatureItem({ title, description, icon, imagePath, reverse }: FeatureProps) {
    return (
        <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 py-16 sm:py-24`}>
            <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center text-gold">
                    {icon}
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{title}</h3>
                <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
                    {description}
                </p>
                <div className="flex items-center gap-4 pt-4">
                    <button className="text-gold font-bold flex items-center gap-2 hover:gap-3 transition-all">
                        Learn more <Rocket className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="flex-1 w-full bg-gradient-to-br from-white/10 to-transparent p-1 rounded-3xl border border-white/10 shadow-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {imagePath ? (
                    <div className="relative aspect-video rounded-[calc(1.5rem-4px)] overflow-hidden">
                        <Image
                            src={imagePath}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                ) : (
                    <div className="aspect-video bg-gray-900 rounded-[calc(1.5rem-4px)] flex items-center justify-center">
                        <span className="text-gray-700 font-mono">PREVIEW_NOT_FOUND</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export function FeatureSection({ isDashboard = false }: { isDashboard?: boolean }) {
    return (
        <section id="features" className={`${isDashboard ? '' : 'max-w-7xl mx-auto px-6'}`}>
            {!isDashboard && (
                <div className="text-center space-y-4 mb-20">
                    <span className="text-gold font-bold tracking-widest text-sm uppercase">Unfair Advantage</span>
                    <h2 className="text-4xl sm:text-6xl font-bold text-white">Advanced Poker Intel</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        We leverage cutting-edge AI and computer vision to turn your messy notes into a structured, exploitative strategy.
                    </p>
                </div>
            )}

            <FeatureItem
                title="Gemini-Powered Analysis"
                description="Our AI doesn't just store notes—it analyzes them. Gemini automatically identifies player archetypes (LAG, TAG, Fish) and suggests specific exploitative lines based on your history."
                icon={<Brain className="w-6 h-6" />}
                imagePath="/hero_poker_ai_1772732965411.png"
            />

            <FeatureItem
                title="Screenshot OCR Import"
                description="Stop typing and start playing. Snap a screenshot of your HUD or note popup, and VillainVault automatically extracts player names, stats, and text to your database."
                icon={<Camera className="w-6 h-6" />}
                imagePath="/ocr_feature_visualization_1772732984845.png"
                reverse
            />

            <FeatureItem
                title="GTO Lite Strategies"
                description="Interactive 13x13 grids provide immediate tactical guidance. See exactly how a balanced range should play on any board, then adjust based on our AI's exploit recommendations."
                icon={<Target className="w-6 h-6" />}
                imagePath="/gto_strategy_grid_1772733004755.png"
            />
        </section>
    );
}
