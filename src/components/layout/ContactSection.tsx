'use client';

import React, { useState } from 'react';
import { Send, Mail, MessageSquare, User } from 'lucide-react';

export function ContactSection() {
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setTimeout(() => setStatus('sent'), 1500);
    };

    return (
        <section id="contact" className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 sm:p-16 flex flex-col md:flex-row gap-16 items-center overflow-hidden relative shadow-2xl">
                {/* Decorative background */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gold/10 blur-[80px] rounded-full"></div>

                <div className="flex-1 space-y-6">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white">Get in touch.</h2>
                    <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                        Have questions about the Pro features or need custom platform support?
                        Our team of developers and high-stakes players are here to help.
                    </p>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-4 text-gray-500">
                            <Mail className="w-5 h-5 text-gold" />
                            <span>support@villainvault.ai</span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-500">
                            <MessageSquare className="w-5 h-5 text-gold" />
                            <span>Live Chat (Coming Soon)</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full max-w-md">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                required
                                type="text"
                                placeholder="Your Name"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-gold outline-none transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                required
                                type="email"
                                placeholder="Your Email"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-gold outline-none transition-all"
                            />
                        </div>
                        <textarea
                            required
                            placeholder="How can we help?"
                            rows={4}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-600 focus:border-gold outline-none transition-all resize-none"
                        ></textarea>

                        <button
                            disabled={status !== 'idle'}
                            type="submit"
                            className={`w-full py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2 ${status === 'sent'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gold text-black hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]'
                                }`}
                        >
                            {status === 'idle' && <><Send className="w-4 h-4" /> Send Message</>}
                            {status === 'sending' && <span className="animate-pulse">Sending...</span>}
                            {status === 'sent' && 'Message Sent!'}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
