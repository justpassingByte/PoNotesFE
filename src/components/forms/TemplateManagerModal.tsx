import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, X, Globe, Zap, Scissors, Activity, Flame, LayoutList, ChevronDown, ChevronUp, Target } from 'lucide-react';
import { API } from '@/lib/api';
import { getAppSettings, updateAppSettings } from '@/app/actions';

interface Template {
    id: string;
    label: string;
    category: string;
    weight: number;
}

interface Platform {
    id: string;
    name: string;
}

export function TemplateManagerModal({ onClose }: { onClose: () => void }) {
    // Tab state
    const [activeTab, setActiveTab] = useState<'tags' | 'platforms' | 'ai'>('tags');

    // Template state
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [isAddingTemplate, setIsAddingTemplate] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ label: '', category: 'Preflop', weight: 0 });

    // Platform state
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [loadingPlatforms, setLoadingPlatforms] = useState(true);
    const [newPlatformName, setNewPlatformName] = useState('');
    const [isAddingPlatform, setIsAddingPlatform] = useState(false);
    const [platformError, setPlatformError] = useState('');

    // AI Settings state (Behavioral)
    const [aiStyle, setAiStyle] = useState<'GTO' | 'Balanced' | 'Exploit'>('Balanced');
    const [aggressionBias, setAggressionBias] = useState(50);
    const [insightDepth, setInsightDepth] = useState<'Quick' | 'Deep'>('Deep');
    const [behaviorToggles, setBehaviorToggles] = useState({
        softInference: true,
        forceExploit: false,
        highlightLeaks: true
    });

    // New: Hand Analysis Behavioral State
    const [activeTuningTab, setActiveTuningTab] = useState<'profiling' | 'hand'>('profiling');
    const [handStyle, setHandStyle] = useState<'GTO' | 'Balanced' | 'Exploit'>('Balanced');
    const [handAggressionBias, setHandAggressionBias] = useState(50);
    const [handInsightDepth, setHandInsightDepth] = useState<'Quick' | 'Deep'>('Deep');
    const [handBehaviorToggles, setHandBehaviorToggles] = useState({
        softInference: true,
        forceExploit: false,
        highlightLeaks: true
    });

    // AI Settings state (Technical - Hidden under Advanced)
    const [aiEnabled, setAiEnabled] = useState(false);
    const [aiModel, setAiModel] = useState('gpt-4o');
    const [creativity, setCreativity] = useState(0.7);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [analysisPrompt, setAnalysisPrompt] = useState(''); // Correctly adding analysis_prompt
    const [showAdvanced, setShowAdvanced] = useState(false);
    
    const [loadingAI, setLoadingAI] = useState(true);
    const [aiSaving, setAiSaving] = useState(false);

    useEffect(() => {
        fetchTemplates();
        fetchPlatforms();
        fetchAISettings();
    }, []);

    // --- Templates ---
    const fetchTemplates = async () => {
        try {
            const res = await fetch(API.templates, { credentials: 'include' });
            if (res.ok) {
                const json = await res.json();
                setTemplates(json.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            const res = await fetch(API.template(id), { 
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) fetchTemplates();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmitTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editId ? API.template(editId) : API.templates;
        const method = editId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, weight: Number(formData.weight) }),
                credentials: 'include'
            });
            if (res.ok) {
                setIsAddingTemplate(false);
                setEditId(null);
                setFormData({ label: '', category: 'Preflop', weight: 0 });
                fetchTemplates();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const startEditTemplate = (t: Template) => {
        setEditId(t.id);
        setFormData({ label: t.label, category: t.category, weight: t.weight });
        setIsAddingTemplate(true);
    };

    // --- Platforms ---
    const fetchPlatforms = async () => {
        try {
            const res = await fetch(API.platforms, { credentials: 'include' });
            if (res.ok) {
                const json = await res.json();
                setPlatforms(json.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingPlatforms(false);
        }
    };

    const handleAddPlatform = async (e: React.FormEvent) => {
        e.preventDefault();
        setPlatformError('');
        if (!newPlatformName.trim()) return;

        try {
            const res = await fetch(API.platforms, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newPlatformName.trim() }),
                credentials: 'include'
            });
            const json = await res.json();
            if (res.ok) {
                setNewPlatformName('');
                setIsAddingPlatform(false);
                fetchPlatforms();
            } else {
                setPlatformError(json.error || 'Failed to add platform');
            }
        } catch (err) {
            console.error(err);
            setPlatformError('Network error');
        }
    };

    const handleDeletePlatform = async (id: string) => {
        setPlatformError('');
        try {
            const res = await fetch(API.platform(id), { 
                method: 'DELETE',
                credentials: 'include'
            });
            const json = await res.json();
            if (res.ok) {
                fetchPlatforms();
            } else {
                setPlatformError(json.error || 'Failed to delete platform');
            }
        } catch (err) {
            console.error(err);
            setPlatformError('Network error');
        }
    };

    // --- AI Settings ---
    const fetchAISettings = async () => {
        try {
            const res = await fetch(`${API.settings}/ai`, { credentials: 'include' });
            if (res.ok) {
                const json = await res.json();
                if (json.success && json.data) {
                    const d = json.data;
                    setAiEnabled(d.ai_enabled ?? false);
                    setAiModel(d.model ?? 'gpt-4o');
                    setCreativity(d.creativity ?? 0.7);
                    setSystemPrompt(d.system_prompt ?? '');
                    
                    // Behavioral mappings
                    setAiStyle(d.ai_style ?? 'Balanced');
                    setAggressionBias(d.aggression_bias ?? 50);
                    setInsightDepth(d.insight_depth ?? 'Deep');
                    setBehaviorToggles(d.behavior_toggles ?? {
                        softInference: true,
                        forceExploit: false,
                        highlightLeaks: true
                    });

                    // Sync Hand Settings
                    setHandStyle(d.hand_style ?? 'Balanced');
                    setHandAggressionBias(d.hand_aggression_bias ?? 50);
                    setHandInsightDepth(d.hand_insight_depth ?? 'Deep');
                    setHandBehaviorToggles(d.hand_behavior_toggles ?? {
                        softInference: true,
                        forceExploit: false,
                        highlightLeaks: true
                    });
                    setAnalysisPrompt(d.analysis_prompt ?? '');
                }
            }
        } catch (err) {
            console.error("fetchAISettings failed:", err);
        } finally {
            setLoadingAI(false);
        }
    };

    const saveAISettings = async (updates: any) => {
        setAiSaving(true);
        try {
            const res = await fetch(`${API.settings}/ai`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
                credentials: 'include'
            });
            if (res.ok) {
                const json = await res.json();
                if (json.success && json.data) {
                    const d = json.data;
                    setAiEnabled(d.ai_enabled);
                    setAiModel(d.model);
                    setCreativity(d.creativity);
                    setSystemPrompt(d.system_prompt);
                    setAiStyle(d.ai_style);
                    setAggressionBias(d.aggression_bias);
                    setInsightDepth(d.insight_depth);
                    setBehaviorToggles(d.behavior_toggles);
                    
                    // Sync Hand Settings
                    if (d.hand_style) setHandStyle(d.hand_style);
                    if (d.hand_aggression_bias !== undefined) setHandAggressionBias(d.hand_aggression_bias);
                    if (d.hand_insight_depth) setHandInsightDepth(d.hand_insight_depth);
                    if (d.hand_behavior_toggles) setHandBehaviorToggles(d.hand_behavior_toggles);
                    if (d.analysis_prompt !== undefined) setAnalysisPrompt(d.analysis_prompt);
                }
            }
        } catch (err) {
            console.error("saveAISettings failed:", err);
        } finally {
            setAiSaving(false);
        }
    };

    const handleResetAI = () => {
        setAiStyle('Balanced');
        setAggressionBias(50);
        setInsightDepth('Deep');
        setBehaviorToggles({ softInference: true, forceExploit: false, highlightLeaks: true });
        setAiModel('gpt-4o');
        setCreativity(0.7);
        setSystemPrompt('You are a Tier-1 Poker Data Scientist...');
    };

    return (
        <div className="space-y-4">
            {/* Tab Switcher */}
            <div className="flex border-b border-white/10 mb-4">
                <button
                    onClick={() => setActiveTab('tags')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'tags'
                        ? 'text-gold border-gold'
                        : 'text-gray-500 border-transparent hover:text-gray-300'
                        }`}
                >
                    Quick Tags
                </button>
                <button
                    onClick={() => setActiveTab('platforms')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${activeTab === 'platforms'
                        ? 'text-gold border-gold'
                        : 'text-gray-500 border-transparent hover:text-gray-300'
                        }`}
                >
                    <Globe className="w-3.5 h-3.5" />
                    Platforms
                </button>
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${activeTab === 'ai'
                        ? 'text-gold border-gold'
                        : 'text-gray-500 border-transparent hover:text-gray-300'
                        }`}
                >
                    <Zap className="w-3.5 h-3.5" />
                    AI Tuning
                </button>
            </div>

            {/* ============ TAGS TAB ============ */}
            {activeTab === 'tags' && (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-gray-200">Manage Quick Tags</h3>
                        {!isAddingTemplate && (
                            <button
                                onClick={() => { setIsAddingTemplate(true); setEditId(null); setFormData({ label: '', category: 'Preflop', weight: 0 }); }}
                                className="flex items-center text-xs bg-gold/20 text-gold px-2 py-1 rounded hover:bg-gold/30 transition-colors"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Add New
                            </button>
                        )}
                    </div>

                    {isAddingTemplate && (
                        <form onSubmit={handleSubmitTemplate} className="bg-background/50 p-3 rounded-md border border-border mb-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Label</label>
                                    <input
                                        autoFocus
                                        required
                                        value={formData.label}
                                        onChange={e => setFormData({ ...formData, label: e.target.value })}
                                        className="w-full bg-card border border-border rounded px-2 py-1 text-sm text-white focus:border-gold outline-none"
                                        placeholder="e.g. 3-bet light"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-card border border-border rounded px-2 py-1 text-sm text-white focus:border-gold outline-none"
                                    >
                                        <option>Preflop</option>
                                        <option>Flop</option>
                                        <option>Turn</option>
                                        <option>River</option>
                                        <option>Postflop</option>
                                        <option>General</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-2">
                                <button type="button" onClick={() => setIsAddingTemplate(false)} className="text-xs text-gray-400 hover:text-white px-2 py-1">Cancel</button>
                                <button type="submit" className="text-xs bg-felt-light text-white px-3 py-1 rounded hover:bg-felt-default">
                                    {editId ? 'Save Changes' : 'Create Tag'}
                                </button>
                            </div>
                        </form>
                    )}

                    {loadingTemplates ? (
                        <div className="text-center text-gray-500 py-12 text-sm animate-pulse">Loading intelligence templates...</div>
                    ) : (
                        <div className="space-y-8">
                            {templates.length === 0 && (
                                <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl bg-white/5">
                                    <p className="text-xs text-gray-500">No quick tags configured yet.</p>
                                </div>
                            )}

                            {/* Grouping by category */}
                            {['Preflop', 'Flop', 'Turn', 'River', 'Postflop', 'General'].map(cat => {
                                const catTemplates = templates.filter((t: Template) => t.category === cat);
                                if (catTemplates.length === 0) return null;

                                return (
                                    <div key={cat} className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/5"></div>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{cat}</span>
                                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/5"></div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {catTemplates.map((t: Template) => (
                                                <div key={t.id} className="group flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-xl hover:border-white/20 hover:bg-white/[0.05] transition-all">
                                                    <span className="text-sm font-medium text-white/90">{t.label}</span>
                                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => startEditTemplate(t)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg">
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={() => handleDeleteTemplate(t.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* ============ PLATFORMS TAB ============ */}
            {activeTab === 'platforms' && (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-gray-200">Manage Platforms</h3>
                        {!isAddingPlatform && (
                            <button
                                onClick={() => { setIsAddingPlatform(true); setNewPlatformName(''); setPlatformError(''); }}
                                className="flex items-center text-xs bg-gold/20 text-gold px-2 py-1 rounded hover:bg-gold/30 transition-colors"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Add Platform
                            </button>
                        )}
                    </div>

                    {platformError && (
                        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2 mb-3">
                            {platformError}
                        </div>
                    )}

                    {isAddingPlatform && (
                        <form onSubmit={handleAddPlatform} className="bg-background/50 p-3 rounded-md border border-border mb-4 space-y-3">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Platform Name</label>
                                <input
                                    autoFocus
                                    required
                                    value={newPlatformName}
                                    onChange={e => setNewPlatformName(e.target.value)}
                                    className="w-full bg-card border border-border rounded px-2 py-1 text-sm text-white focus:border-gold outline-none"
                                    placeholder="e.g. GG Poker"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setIsAddingPlatform(false)} className="text-xs text-gray-400 hover:text-white px-2 py-1">Cancel</button>
                                <button type="submit" className="text-xs bg-felt-light text-white px-3 py-1 rounded hover:bg-felt-default">Create</button>
                            </div>
                        </form>
                    )}

                    {loadingPlatforms ? (
                        <div className="text-center text-gray-500 py-12 text-sm animate-pulse">Loading networks...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {platforms.length === 0 && (
                                <div className="col-span-full text-center py-12 border border-dashed border-white/5 rounded-2xl bg-white/5">
                                    <p className="text-xs text-gray-500">No platforms registered.</p>
                                </div>
                            )}
                            {platforms.map((p: Platform) => (
                                <div key={p.id} className="flex flex-col p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-gold/30 hover:bg-gold/[0.02] transition-all relative overflow-hidden">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center text-gold">
                                            <Globe className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold text-white/90">{p.name}</span>
                                    </div>
                                    <div className="flex justify-end pt-2 mt-auto border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDeletePlatform(p.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete platform"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ============ AI TUNING TAB ============ */}
            {activeTab === 'ai' && (
                <div className="space-y-8 animate-in fade-in duration-500 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide pb-4">
                    {/* Header Info - AI Status */}
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gold/10 to-transparent border border-gold/10 rounded-[2rem]">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl border transition-all ${aiEnabled ? 'bg-gold/20 border-gold shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'bg-white/5 border-white/10'}`}>
                                <Zap className={`w-6 h-6 ${aiEnabled ? 'text-gold' : 'text-gray-500'}`} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-1">AI Tactical Brain</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                    {aiEnabled ? 'Neural Analysis Active' : 'Neural Analysis Offline'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => saveAISettings({ ai_enabled: !aiEnabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${aiEnabled ? 'bg-gold' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${aiEnabled ? 'left-8' : 'left-1'}`}></div>
                        </button>
                    </div>

                    {/* BEHAVIOR CONTROL SECTION */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-1 bg-black/40 rounded-2xl border border-white/5 mb-6">
                            <button 
                                onClick={() => setActiveTuningTab('profiling')}
                                className={`flex-1 py-2 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center ${activeTuningTab === 'profiling' ? 'bg-gold text-black' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Activity className="w-3.5 h-3.5" />
                                Player Profiling
                            </button>
                            <button 
                                onClick={() => setActiveTuningTab('hand')}
                                className={`flex-1 py-2 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center ${activeTuningTab === 'hand' ? 'bg-gold text-black' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Target className="w-3.5 h-3.5" />
                                Hand Combat
                            </button>
                        </div>

                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] px-1">
                            {activeTuningTab === 'profiling' ? 'Profiling behavior' : 'Combat behavior'}
                        </label>
                        <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 space-y-10">
                            
                            {/* Strategy Style Selector */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Activity className="w-3.5 h-3.5 text-gold" />
                                        {activeTuningTab === 'profiling' ? 'AI Strategic Style' : 'Hand Tactical Style'}
                                    </h4>
                                    <span className="text-[10px] text-gold font-bold uppercase tracking-widest">
                                        {activeTuningTab === 'profiling' ? aiStyle : handStyle}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                                    {['GTO', 'Balanced', 'Exploit'].map((style) => (
                                        <button
                                            key={style}
                                            onClick={() => {
                                                if (activeTuningTab === 'profiling') saveAISettings({ ai_style: style });
                                                else saveAISettings({ hand_style: style });
                                            }}
                                            className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                (activeTuningTab === 'profiling' ? aiStyle : handStyle) === style 
                                                ? 'bg-gold text-black shadow-lg shadow-gold/10' 
                                                : 'text-gray-500 hover:text-white'}`}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[9px] text-gray-500 font-medium px-1 leading-relaxed border-l-2 border-gold/20 pl-3 mt-4">
                                    {activeTuningTab === 'profiling' ? (
                                        <>
                                            {aiStyle === 'GTO' && "EQUILIBRIUM: Analyzes ranges vs balanced baselines. Best for high-stakes theory study."}
                                            {aiStyle === 'Balanced' && "HYBRID: Uses GTO fundamentals while pivoting to clear observational exploits."}
                                            {aiStyle === 'Exploit' && "MAX EV: Prioritizes attacking detected leaks above all else. Ignores Hero's own balance."}
                                        </>
                                    ) : (
                                        <>
                                            {handStyle === 'GTO' && "SOLVER MODE: Identifies mathematical errors in ranges. Ignores situational player reads."}
                                            {handStyle === 'Balanced' && "STANDARD: Mixed strategy approach using SPR, Pot Geometry, and situational theory."}
                                            {handStyle === 'Exploit' && "UNTOUCHABLE ENGINE: If a player profile is provided, AI will ignore GTO to maximize exploit EV."}
                                        </>
                                    )}
                                </p>
                            </div>

                            {/* Aggression Bias Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Flame className="w-3.5 h-3.5 text-gold" />
                                        Aggression Bias
                                    </h4>
                                    <span className="text-[10px] font-black text-gold font-mono">
                                        {activeTuningTab === 'profiling' ? aggressionBias : handAggressionBias}%
                                    </span>
                                </div>
                                <div className="relative pt-2">
                                    <input 
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="5"
                                        value={activeTuningTab === 'profiling' ? aggressionBias : handAggressionBias}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (activeTuningTab === 'profiling') setAggressionBias(val);
                                            else setHandAggressionBias(val);
                                        }}
                                        onMouseUp={() => {
                                            if (activeTuningTab === 'profiling') saveAISettings({ aggression_bias: aggressionBias });
                                            else saveAISettings({ hand_aggression_bias: handAggressionBias });
                                        }}
                                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-gold cursor-pointer"
                                    />
                                    <div className="flex justify-between mt-3 text-[8px] text-gray-600 font-black uppercase tracking-widest">
                                        <span>Passive</span>
                                        <span>Default</span>
                                        <span>Aggressive</span>
                                    </div>
                                    <p className="text-[8px] text-gold/50 font-black uppercase tracking-[0.2em] mt-3 text-center">
                                        {(activeTuningTab === 'profiling' ? aggressionBias : handAggressionBias) > 65 ? "Tactical Focus: Polarized Overbets" : 
                                         (activeTuningTab === 'profiling' ? aggressionBias : handAggressionBias) < 35 ? "Tactical Focus: Pot-Control / Defense" : 
                                         "Tactical Focus: GTO Mixed Frequencies"}
                                    </p>
                                </div>
                            </div>

                            {/* Insight Depth */}
                            <div className="space-y-4 pt-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <LayoutList className="w-3.5 h-3.5 text-gold" />
                                        {activeTuningTab === 'profiling' ? 'Intelligence Depth' : 'Analysis Depth'}
                                    </h4>
                                    <div className="flex bg-black/40 rounded-full p-1 border border-white/5">
                                        {['Quick', 'Deep'].map((depth) => (
                                            <button
                                                key={depth}
                                                onClick={() => {
                                                    if (activeTuningTab === 'profiling') saveAISettings({ insight_depth: depth });
                                                    else saveAISettings({ hand_insight_depth: depth });
                                                }}
                                                className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                                                    (activeTuningTab === 'profiling' ? insightDepth : handInsightDepth) === depth 
                                                    ? 'bg-white/10 text-white' 
                                                    : 'text-gray-600 hover:text-gray-400'}`}
                                            >
                                                {depth}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TACTICAL PREFERENCES SECTION */}
                    <div className="space-y-3">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] px-1">
                            {activeTuningTab === 'profiling' ? 'Profiling Overrides' : 'Combat Overrides'}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { id: 'softInference', label: 'Allow Soft Inference', desc: 'Predict styles with limited data', icon: <Scissors className="w-3 h-3" /> },
                                { id: 'forceExploit', label: 'Force Exploit Advice', desc: 'Always prioritize attacking leaks', icon: <Target className="w-3 h-3" /> },
                                { id: 'highlightLeaks', label: 'Auto-Highlight Leaks', desc: 'Alert when a leak is detected', icon: <Activity className="w-3 h-3" /> },
                            ].map((item) => {
                                const toggles = activeTuningTab === 'profiling' ? behaviorToggles : handBehaviorToggles;
                                const isActive = toggles[item.id as keyof typeof toggles];
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            const next = { ...toggles, [item.id]: !isActive };
                                            if (activeTuningTab === 'profiling') {
                                                setBehaviorToggles(next);
                                                saveAISettings({ behavior_toggles: next });
                                            } else {
                                                setHandBehaviorToggles(next);
                                                saveAISettings({ hand_behavior_toggles: next });
                                            }
                                        }}
                                        className={`flex items-start gap-4 p-5 rounded-3xl border transition-all text-left group ${isActive
                                            ? 'bg-gold/5 border-gold/20'
                                            : 'bg-white/[0.03] border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className={`mt-0.5 p-2 rounded-xl transition-colors ${isActive ? 'bg-gold/20 text-gold' : 'bg-white/5 text-gray-600 group-hover:text-gray-400'}`}>
                                            {item.icon}
                                        </div>
                                        <div className="space-y-1">
                                            <p className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-400 font-bold'}`}>{item.label}</p>
                                            <p className="text-[9px] text-gray-600 font-medium leading-tight">{item.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ADVANCED SECTION (COLLAPSIBLE) */}
                    <div className="pt-4">
                        <button 
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all"
                        >
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Neural Override Controls</span>
                            {showAdvanced ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                        </button>

                        {showAdvanced && (
                            <div className="mt-4 space-y-6 animate-in slide-in-from-top-2 duration-300 px-1">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Neural Model</label>
                                        <select 
                                            value={aiModel}
                                            onChange={(e) => saveAISettings({ model: e.target.value })}
                                            className="w-full bg-background border border-white/5 rounded-xl px-4 py-2 text-[11px] text-white font-bold outline-none focus:border-gold/30"
                                        >
                                            <option value="gpt-4o">GPT-4o (State of the Art)</option>
                                            <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                                            <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Temperature</label>
                                        <input 
                                            type="range" min="0" max="1" step="0.1" value={creativity}
                                            onChange={(e) => setCreativity(parseFloat(e.target.value))}
                                            onMouseUp={() => saveAISettings({ creativity })}
                                            className="w-full h-1 bg-white/10 rounded-full appearance-none accent-gray-500 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Player Engine Prompt</label>
                                            <button onClick={handleResetAI} className="text-[9px] text-red-400/50 hover:text-red-400 font-black uppercase tracking-widest">Reset</button>
                                        </div>
                                        <textarea 
                                            value={systemPrompt}
                                            onChange={(e) => setSystemPrompt(e.target.value)}
                                            onBlur={() => saveAISettings({ system_prompt: systemPrompt })}
                                            rows={5}
                                            className="w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-[10px] text-gray-500 font-mono leading-relaxed outline-none focus:border-gold/20 resize-none"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Analysis Engine Prompt</label>
                                            <button onClick={() => setAnalysisPrompt('')} className="text-[9px] text-red-400/50 hover:text-red-400 font-black uppercase tracking-widest">Clear</button>
                                        </div>
                                        <textarea 
                                            value={analysisPrompt}
                                            onChange={(e) => setAnalysisPrompt(e.target.value)}
                                            onBlur={() => saveAISettings({ analysis_prompt: analysisPrompt })}
                                            rows={5}
                                            className="w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-[10px] text-gray-500 font-mono leading-relaxed outline-none focus:border-gold/20 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {aiSaving && (
                        <div className="flex justify-center animate-in fade-in">
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-gold/10 border border-gold/20 rounded-full">
                                <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse shadow-[0_0_8px_rgba(255,215,0,0.5)]"></div>
                                <span className="text-[10px] text-gold font-black uppercase tracking-[0.2em]">Recalibrating Neural Style...</span>
                            </div>
                        </div>
                    )}
                </div>
            )}


            <div className="pt-4 flex justify-end border-t border-white/5">
                <button onClick={onClose} className="px-4 py-2 bg-card border border-white/5 text-sm text-white rounded-full hover:bg-white/5 transition-colors">
                    Close
                </button>
            </div>
        </div>
    );
}
