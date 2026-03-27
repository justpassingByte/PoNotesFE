'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

export function LandingFooter() {
    const { t } = useLanguage();
    
    return (
        <footer className="relative z-10 border-t border-white/5 py-10 px-6 mt-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <span className="font-bold tracking-widest text-sm text-white/50">VILLIANT VAULT &copy; 2026</span>
                <div className="flex gap-6 text-xs text-gray-700">
                    <a href="#" className="hover:text-gray-400 transition-colors">{t('landing.footer.privacy') || 'Chính Sách Bảo Mật'}</a>
                    <a href="#" className="hover:text-gray-400 transition-colors">{t('landing.footer.terms') || 'Điều Khoản'}</a>
                    <a href="#" className="hover:text-gray-400 transition-colors">Cookies</a>
                </div>
                <div className="text-xs text-gray-700">
                    {t('landing.footer.tagline') || 'Két sắt AI đầu tiên cho poker Việt Nam.'}
                </div>
            </div>
        </footer>
    );
}
