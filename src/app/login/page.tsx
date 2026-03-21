"use client";

import { useState } from "react";
import { Sparkles, Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { login } from "@/app/auth-actions";
import Link from "next/link";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        }
        // Redirect is handled by the server action
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f2e1e] via-[#020202] to-black p-4">
            {/* Decorative background elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold/5 blur-[120px] rounded-full"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-felt-light/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-16 h-16 bg-gradient-to-br from-gold to-yellow-600 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(212,175,55,0.3)] border border-white/10">
                        <Sparkles className="w-8 h-8 text-black" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-[0.2em] font-serif">VILLAINVAULT</h1>
                    <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">Elite AI Poker Intelligence</p>
                </div>

                {/* Login Card */}
                <div className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-500 delay-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl flex items-center gap-2">
                                <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Identity (Email)</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-gold transition-colors" />
                                    <input
                                        required
                                        type="text"
                                        name="email"
                                        placeholder="admin"
                                        className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Access Key (Password)</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-gold transition-colors" />
                                    <input
                                        required
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            type="submit"
                            className="w-full bg-gradient-to-r from-gold to-yellow-500 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_10px_20px_rgba(212,175,55,0.2)]"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>ENTER VAULT</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
                        <Link href="/register" className="text-[10px] text-gray-500 hover:text-white transition-colors uppercase tracking-[0.2em]">
                            New Agent? Register Identity
                        </Link>
                        <button type="button" className="text-[10px] text-gray-600 hover:text-white transition-colors uppercase tracking-[0.2em] mt-2">
                            Forgot Access Key?
                        </button>
                    </div>
                </div>

                <p className="text-center mt-8 text-gray-600 text-[10px] uppercase tracking-widest font-medium opacity-50">
                    &copy; 2024 VillainVault Intelligence. All rights reserved.
                </p>
            </div>
        </div>
    );
}
