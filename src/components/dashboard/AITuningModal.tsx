"use client";

import { useState, useEffect } from "react";
import { Brain, Save, RefreshCw, AlertCircle, Info, Zap } from "lucide-react";
import { getAISettings, updateAISettings } from "@/app/actions";

interface AITuningModalProps {
    onClose: () => void;
}

export function AITuningModal({ onClose }: AITuningModalProps) {
    const [settings, setSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'hand'>('profile');

    useEffect(() => {
        async function loadSettings() {
            try {
                const data = await getAISettings();
                setSettings(data);
            } catch (err) {
                setError("Failed to load AI settings");
            } finally {
                setIsLoading(false);
            }
        }
        loadSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await updateAISettings(settings);
            if (res.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(res.error || "Failed to update settings");
            }
        } catch (err) {
            setError("An error occurred while saving");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <RefreshCw className="w-8 h-8 text-gold animate-spin" />
                <p className="text-gray-400 font-medium">Downloading AI Brain Config...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
            {/* Tab Switched */}
            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'profile' ? 'bg-gold text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Brain className="w-3 h-3" />
                        Player Profiling
                    </div>
                </button>
                <button 
                    onClick={() => setActiveTab('hand')}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'hand' ? 'bg-gold text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Zap className="w-3 h-3" />
                        Hand Analysis
                    </div>
                </button>
            </div>

            {/* Warning Banner */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                    <h5 className="text-sm font-bold text-amber-200 uppercase tracking-tight">
                        {activeTab === 'profile' ? "Combat Intelligence Mode" : "High-Stakes Coach Mode"}
                    </h5>
                    <p className="text-xs text-amber-100/60 leading-relaxed mt-1">
                        {activeTab === 'profile' 
                            ? "This prompt controls how AI aggregates player notes into an exploit profile." 
                            : "This prompt controls how AI identifies mistakes and better lines for single hands."}
                    </p>
                </div>
            </div>

            {/* AI Master Switch & Model */}
            <div className="space-y-4 bg-white/5 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${settings?.is_enabled ? 'bg-gold/20 text-gold' : 'bg-gray-500/10 text-gray-500'}`}>
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-tight">AI Master Switch</h4>
                            <p className="text-[10px] text-gray-500 font-medium">Enable or disable deep analysis globally</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSettings({ ...settings, is_enabled: !settings.is_enabled })}
                        className={`w-14 h-7 rounded-full transition-all relative ${settings?.is_enabled ? 'bg-gold' : 'bg-gray-600'}`}
                    >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings?.is_enabled ? 'left-8' : 'left-1'}`} />
                    </button>
                </div>

                <div className="h-px bg-white/5 my-2" />

                {/* BASIC MODEL SETTINGS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">AI Model</label>
                        <select 
                            value={settings?.model_name || "llama-3.3-70b-versatile"}
                            onChange={(e) => setSettings({ ...settings, model_name: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/50 transition-all font-bold"
                        >
                            <optgroup label="Groq (Ultra-Fast)">
                                <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Fast & Precise)</option>
                                <option value="llama-3.1-8b-instant">Llama 3.1 8B (Instant)</option>
                                <option value="mixtral-8x7b-32768">Mixtral 8x7B (Expert)</option>
                            </optgroup>
                            <optgroup label="OpenAI (Premium)">
                                <option value="gpt-4o">GPT-4o (State of the Art)</option>
                                <option value="gpt-4o-mini">GPT-4o Mini (Efficient)</option>
                            </optgroup>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex justify-between">
                            Creativity (Temp)
                            <span className="text-gold">{settings?.temperature || 0.7}</span>
                        </label>
                        <input 
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={settings?.temperature || 0.7}
                            onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
                        />
                    </div>
                </div>

                <div className="h-px bg-white/5 my-2" />

                {/* BEHAVIORAL TUNING (DYNAMICAL PER TAB) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Strategy Style</label>
                        <select 
                            value={activeTab === 'profile' ? (settings?.ai_style || "Balanced") : (settings?.hand_style || "Balanced")}
                            onChange={(e) => setSettings({ 
                                ...settings, 
                                [activeTab === 'profile' ? 'ai_style' : 'hand_style']: e.target.value 
                            })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/50 transition-all font-bold"
                        >
                            <option value="Exploit">Max Exploit</option>
                            <option value="Balanced">Balanced (Default)</option>
                            <option value="GTO">Pure GTO</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex justify-between">
                            Aggression Bias
                            <span className="text-gold">{activeTab === 'profile' ? (settings?.aggression_bias || 50) : (settings?.hand_aggression_bias || 50)}%</span>
                        </label>
                        <input 
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={activeTab === 'profile' ? (settings?.aggression_bias || 50) : (settings?.hand_aggression_bias || 50)}
                            onChange={(e) => setSettings({ 
                                ...settings, 
                                [activeTab === 'profile' ? 'aggression_bias' : 'hand_aggression_bias']: parseInt(e.target.value) 
                            })}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Insight Depth</label>
                        <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 h-[46px]">
                            {['Quick', 'Deep'].map((depth) => {
                                const currentDepth = activeTab === 'profile' ? (settings?.insight_depth || "Deep") : (settings?.hand_insight_depth || "Deep");
                                return (
                                    <button
                                        key={depth}
                                        type="button"
                                        onClick={() => setSettings({ 
                                            ...settings, 
                                            [activeTab === 'profile' ? 'insight_depth' : 'hand_insight_depth']: depth 
                                        })}
                                        className={`flex-1 flex items-center justify-center text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${currentDepth === depth ? 'bg-gold text-black' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        {depth}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="h-px bg-white/5 my-2" />

                {/* TOGGLES */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { key: 'softInference', label: 'Soft Inference', info: 'Allow the model to guess tendencies' },
                        { key: 'forceExploit', label: 'Force Exploit', info: 'Ignore GTO safety checks' },
                        { key: 'highlightLeaks', label: 'Spot Leaks', info: 'Focus on finding weaknesses' }
                    ].map((toggle) => {
                        const togglesKey = activeTab === 'profile' ? 'behavior_toggles' : 'hand_behavior_toggles';
                        const currentToggles = settings?.[togglesKey] || { softInference: true, forceExploit: false, highlightLeaks: true };
                        const isActive = currentToggles[toggle.key];

                        return (
                            <button
                                key={toggle.key}
                                type="button"
                                onClick={() => {
                                    const newToggles = { ...currentToggles, [toggle.key]: !isActive };
                                    setSettings({ ...settings, [togglesKey]: newToggles });
                                }}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isActive ? 'bg-gold/10 border-gold/30' : 'bg-white/5 border-white/5 opacity-50'}`}
                            >
                                <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-all ${isActive ? 'bg-gold border-gold' : 'border-white/20'}`}>
                                    {isActive && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                                </div>
                                <div>
                                    <div className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-gold' : 'text-gray-500'}`}>{toggle.label}</div>
                                    <div className="text-[8px] text-gray-600 font-medium leading-none mt-0.5">{toggle.info}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Prompt Editor */}
            <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {activeTab === 'profile' ? "Player Profile Engine" : "Hand Coach Engine"}
                    </label>
                    <div className="group relative flex items-center gap-3">
                        <button 
                            onClick={() => {
                                if (activeTab === 'profile') {
                                    setSettings({ ...settings, system_prompt: "" });
                                } else {
                                    setSettings({ ...settings, analysis_prompt: "" });
                                }
                            }}
                            className="text-[10px] text-gray-500 hover:text-gold transition-colors font-bold uppercase tracking-wider underline underline-offset-4"
                        >
                            Reset to Default
                        </button>
                        <Info className="w-3.5 h-3.5 text-gray-600 cursor-help hover:text-gold transition-colors" />
                        <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-black border border-white/10 rounded-xl text-[10px] text-gray-400 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                            {activeTab === 'profile' 
                                ? "Instructions for analyzing ALL player notes to find long-term patterns."
                                : "Instructions for analyzing positioning, sizing, and EV for a single hand history."}
                        </div>
                    </div>
                </div>
                <textarea 
                    value={activeTab === 'profile' ? (settings?.system_prompt || "") : (settings?.analysis_prompt || "")}
                    onChange={(e) => {
                        if (activeTab === 'profile') {
                            setSettings({ ...settings, system_prompt: e.target.value });
                        } else {
                            setSettings({ ...settings, analysis_prompt: e.target.value });
                        }
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs text-gray-200 font-mono leading-relaxed min-h-[350px] focus:outline-none focus:border-gold/30 transition-all scrollbar-hide"
                    placeholder="Enter system prompt here..."
                />
            </div>

            {/* Error/Success Feedbacks */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest p-3 rounded-xl flex items-center gap-2 animate-in fade-in duration-300">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest p-3 rounded-xl flex items-center gap-2 animate-in fade-in duration-300">
                    <Save className="w-4 h-4" />
                    Neural configuration updated successfully.
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-white/5">
                <button 
                    onClick={onClose}
                    className="flex-1 py-4 text-xs font-bold text-gray-500 hover:text-white transition-all uppercase tracking-widest"
                >
                    Discard Changes
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-[2] py-4 bg-gold text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-yellow-400 transition-all hover:shadow-[0_0_25px_rgba(250,204,21,0.3)] disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            SYCHRONIZING...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            SAVE BRAIN CONFIG
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
