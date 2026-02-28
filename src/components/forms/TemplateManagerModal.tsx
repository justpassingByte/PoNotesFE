import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, X, Globe } from 'lucide-react';
import { API } from '@/lib/api';

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
    const [activeTab, setActiveTab] = useState<'tags' | 'platforms'>('tags');

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

    useEffect(() => {
        fetchTemplates();
        fetchPlatforms();
    }, []);

    // --- Templates ---
    const fetchTemplates = async () => {
        try {
            const res = await fetch(API.templates);
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
            const res = await fetch(API.template(id), { method: 'DELETE' });
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
                body: JSON.stringify({ ...formData, weight: Number(formData.weight) })
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
            const res = await fetch(API.platforms);
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
                body: JSON.stringify({ name: newPlatformName.trim() })
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
            const res = await fetch(API.platform(id), { method: 'DELETE' });
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
                        <div className="text-center text-gray-500 py-4 text-sm">Loading templates...</div>
                    ) : (
                        <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
                            {templates.length === 0 && <p className="text-xs text-gray-500 text-center">No templates exist yet.</p>}
                            {templates.map(t => (
                                <div key={t.id} className="flex items-center justify-between p-2 bg-card border border-border rounded group hover:border-gray-500 transition-colors">
                                    <div>
                                        <span className="text-sm font-medium text-white block">{t.label}</span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{t.category}</span>
                                    </div>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEditTemplate(t)} className="p-1.5 text-gray-400 hover:text-white hover:bg-background rounded">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleDeleteTemplate(t.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-background rounded">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                        <div className="text-center text-gray-500 py-4 text-sm">Loading platforms...</div>
                    ) : (
                        <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
                            {platforms.length === 0 && <p className="text-xs text-gray-500 text-center">No platforms exist yet.</p>}
                            {platforms.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-2 bg-card border border-border rounded group hover:border-gray-500 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-3.5 h-3.5 text-felt-light" />
                                        <span className="text-sm font-medium text-white">{p.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeletePlatform(p.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-background rounded opacity-0 group-hover:opacity-100 transition-all"
                                        title="Delete platform"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <div className="pt-4 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 bg-card border border-border text-sm text-white rounded hover:bg-background transition-colors">
                    Done
                </button>
            </div>
        </div>
    );
}
