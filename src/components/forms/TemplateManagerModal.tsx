import React, { useState, useEffect } from 'react';
import { Settings, Trash2, Edit2, Plus, X } from 'lucide-react';
import { API } from '@/lib/api';

interface Template {
    id: string;
    label: string;
    category: string;
    weight: number;
}

export function TemplateManagerModal({ onClose }: { onClose: () => void }) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ label: '', category: 'Preflop', weight: 0 });

    useEffect(() => {
        fetchTemplates();
    }, []);

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
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            const res = await fetch(API.template(id), { method: 'DELETE' });
            if (res.ok) fetchTemplates();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editId
            ? API.template(editId)
            : API.templates;

        const method = editId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    weight: Number(formData.weight)
                })
            });

            if (res.ok) {
                setIsAdding(false);
                setEditId(null);
                setFormData({ label: '', category: 'Preflop', weight: 0 });
                fetchTemplates();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const startEdit = (t: Template) => {
        setEditId(t.id);
        setFormData({ label: t.label, category: t.category, weight: t.weight });
        setIsAdding(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-200">Manage Quick Tags</h3>
                {!isAdding && (
                    <button
                        onClick={() => { setIsAdding(true); setEditId(null); setFormData({ label: '', category: 'Preflop', weight: 0 }); }}
                        className="flex items-center text-xs bg-gold/20 text-gold px-2 py-1 rounded hover:bg-gold/30 transition-colors"
                    >
                        <Plus className="w-3 h-3 mr-1" /> Add New
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-background/50 p-3 rounded-md border border-border mb-4 space-y-3">
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
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="text-xs text-gray-400 hover:text-white px-2 py-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="text-xs bg-felt-light text-white px-3 py-1 rounded hover:bg-felt-default"
                        >
                            {editId ? 'Save Changes' : 'Create Tag'}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
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
                                <button onClick={() => startEdit(t)} className="p-1.5 text-gray-400 hover:text-white hover:bg-background rounded">
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-background rounded">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="pt-4 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 bg-card border border-border text-sm text-white rounded hover:bg-background transition-colors">
                    Done
                </button>
            </div>
        </div>
    );
}
