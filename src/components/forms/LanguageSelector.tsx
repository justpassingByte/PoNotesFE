"use client";

import { useLanguage } from "@/i18n/LanguageContext";
import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";

export function LanguageSelector({ className = "" }: { className?: string }) {
    const { language, setLanguage, t, isLoaded } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isLoaded) return null;

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center p-2.5 min-w-[44px] min-h-[44px] text-gray-400 hover:text-gold hover:bg-gold/5 rounded-full transition-all"
                aria-label="Change Language"
            >
                {language === "en" ? <span className="text-xl leading-none">🇺🇸</span> : <span className="text-xl leading-none">🇻🇳</span>}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-[120%] mt-2 w-48 bg-card border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 space-y-1">
                        <button
                            onClick={() => { setLanguage("en"); setIsOpen(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${language === 'en' ? 'bg-gold/20 text-gold font-bold' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                        >
                            <span className="flex items-center gap-2">🇺🇸 {t("settings.language_en")}</span>
                            {language === "en" && <div className="w-2 h-2 rounded-full bg-gold"></div>}
                        </button>
                        <button
                            onClick={() => { setLanguage("vi"); setIsOpen(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${language === 'vi' ? 'bg-gold/20 text-gold font-bold' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                        >
                            <span className="flex items-center gap-2">🇻🇳 {t("settings.language_vi")}</span>
                            {language === "vi" && <div className="w-2 h-2 rounded-full bg-gold"></div>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
