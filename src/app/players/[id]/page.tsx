"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, AlignLeft, Plus, Pencil, Trash2, Check, X, Settings } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StrategyGuide } from "@/components/dashboard/StrategyGuide";
import { API } from "@/lib/api";

interface Note {
    id: string;
    content: string;
    street: string;
    note_type: string;
    created_at: string;
}

interface PlayerDetails {
    id: string;
    name: string;
    playstyle: string;
    aggression_score: number;
    notes: Note[];
}

export default function PlayerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [player, setPlayer] = useState<PlayerDetails | null>(null);
    const [loading, setLoading] = useState(true);

    // Add Note state
    const [showAddNote, setShowAddNote] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newNoteStreet, setNewNoteStreet] = useState('Preflop');
    const [addingNote, setAddingNote] = useState(false);

    // Edit Note state
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    // Edit Player state
    const [editingPlayer, setEditingPlayer] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPlaystyle, setEditPlaystyle] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const fetchPlayer = async () => {
        try {
            const res = await fetch(API.player(params.id as string));
            const json = await res.json();
            if (json.success && json.data) {
                setPlayer(json.data);
            }
        } catch (err) {
            console.error("Failed to fetch player details", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchPlayer();
        }
    }, [params.id]);

    // CREATE Note
    const handleAddNote = async () => {
        if (!newNoteContent.trim() || !player) return;
        setAddingNote(true);
        try {
            const res = await fetch(API.notes, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player_id: player.id,
                    street: newNoteStreet,
                    note_type: 'Custom',
                    content: newNoteContent.trim()
                })
            });
            if (res.ok) {
                setNewNoteContent('');
                setShowAddNote(false);
                await fetchPlayer(); // Refresh
            }
        } catch (err) {
            console.error("Failed to add note", err);
        } finally {
            setAddingNote(false);
        }
    };

    // UPDATE Note
    const handleUpdateNote = async (noteId: string) => {
        if (!editContent.trim()) return;
        try {
            const res = await fetch(API.note(noteId), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editContent.trim() })
            });
            if (res.ok) {
                setEditingNoteId(null);
                setEditContent('');
                await fetchPlayer(); // Refresh
            }
        } catch (err) {
            console.error("Failed to update note", err);
        }
    };

    // DELETE Note
    const handleDeleteNote = async (noteId: string) => {
        try {
            const res = await fetch(API.note(noteId), {
                method: 'DELETE'
            });
            if (res.ok) {
                await fetchPlayer(); // Refresh
            }
        } catch (err) {
            console.error("Failed to delete note", err);
        }
    };

    // UPDATE Player
    const handleUpdatePlayer = async () => {
        if (!player || !editName.trim()) return;
        try {
            const res = await fetch(API.player(player.id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName.trim(), playstyle: editPlaystyle })
            });
            if (res.ok) {
                setEditingPlayer(false);
                await fetchPlayer();
            }
        } catch (err) {
            console.error("Failed to update player", err);
        }
    };

    // DELETE Player
    const handleDeletePlayer = async () => {
        if (!player) return;
        try {
            const res = await fetch(API.player(player.id), {
                method: 'DELETE'
            });
            if (res.ok) {
                router.push('/'); // Navigate back to dashboard
            }
        } catch (err) {
            console.error("Failed to delete player", err);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f2e1e] via-[#020202] to-black items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="flex-1 flex flex-col h-screen bg-black items-center justify-center text-white">
                Player not found.
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f2e1e] via-[#020202] to-black">
            <Header />

            <div className="flex-1 overflow-y-auto pt-32 p-8 relative scrollbar-thin scrollbar-thumb-felt-light scrollbar-track-transparent">
                <div className="max-w-7xl mx-auto relative z-10">

                    {/* Back Navigation Bar */}
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center text-gray-400 hover:text-white transition-colors group mb-8"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT COLUMN: IDENTIFICATION & STRATEGY */}
                        <div className="lg:col-span-1 space-y-8">

                            {/* Player ID Card */}
                            <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
                                {/* Top accent line */}
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>

                                {editingPlayer ? (
                                    /* EDIT MODE */
                                    <div className="p-8 space-y-4">
                                        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Edit Profile</h2>
                                        <div>
                                            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Playstyle</label>
                                            <select
                                                value={editPlaystyle}
                                                onChange={e => setEditPlaystyle(e.target.value)}
                                                className="w-full bg-background border border-border text-sm rounded-md px-3 py-2 text-white focus:outline-none focus:border-gold"
                                            >
                                                <option value="UNKNOWN">Unknown</option>
                                                <option value="LAG">LAG</option>
                                                <option value="TAG">TAG</option>
                                                <option value="NIT">NIT</option>
                                                <option value="FISH">FISH</option>
                                                <option value="MANIAC">MANIAC</option>
                                                <option value="CALLING STATION">CALLING STATION</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button onClick={() => setEditingPlayer(false)} className="flex-1 text-xs text-gray-400 hover:text-white py-2 border border-border rounded-md transition-colors">Cancel</button>
                                            <button onClick={handleUpdatePlayer} className="flex-1 text-xs text-white bg-felt-light py-2 rounded-md font-semibold hover:bg-felt-default transition-colors">Save Changes</button>
                                        </div>
                                    </div>
                                ) : (
                                    /* VIEW MODE */
                                    <>
                                        {/* Hero Section */}
                                        <div className="relative px-8 pt-8 pb-6">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-felt-light/15 to-transparent rounded-bl-full pointer-events-none"></div>

                                            {/* Avatar + Name */}
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold/30 to-gold/5 border-2 border-gold/40 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                                                    <span className="text-xl font-bold text-gold">{player.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h1 className="text-2xl font-bold text-white truncate">{player.name}</h1>
                                                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-[0.2em]">Opponent Profile</span>
                                                </div>
                                            </div>

                                            {/* Playstyle Badge — Full Width */}
                                            <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Classified As</span>
                                                <span className="px-4 py-1.5 bg-gold/10 text-gold font-black text-xs rounded-full border border-gold/30 tracking-wider shadow-[0_0_12px_rgba(212,175,55,0.1)]">
                                                    {player.playstyle || "UNKNOWN"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="px-8 pb-6 space-y-4">
                                            {/* Aggression Gauge */}
                                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Aggression Level</span>
                                                    <span className="text-lg font-mono text-white font-bold">{player.aggression_score}<span className="text-gray-600 text-xs">/100</span></span>
                                                </div>
                                                {/* Visual Gauge Bar */}
                                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${player.aggression_score > 70 ? 'bg-gradient-to-r from-red-500 to-orange-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                                                            : player.aggression_score > 40 ? 'bg-gradient-to-r from-yellow-500 to-amber-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]'
                                                                : 'bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                                                            }`}
                                                        style={{ width: `${Math.min(player.aggression_score, 100)}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between mt-1.5">
                                                    <span className="text-[9px] text-gray-600">PASSIVE</span>
                                                    <span className="text-[9px] text-gray-600">AGGRESSIVE</span>
                                                </div>
                                            </div>

                                            {/* Notes Counter */}
                                            <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Intel Records</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
                                                    <span className="text-lg font-mono text-gold font-bold">{player.notes.length}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Toolbar */}
                                        <div className="border-t border-white/5 px-8 py-3 flex justify-end gap-1">
                                            <button
                                                onClick={() => { setEditingPlayer(true); setEditName(player.name); setEditPlaystyle(player.playstyle || 'UNKNOWN'); }}
                                                className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gold px-3 py-1.5 rounded-md hover:bg-white/5 transition-all uppercase tracking-wider font-semibold"
                                            >
                                                <Pencil className="w-3 h-3" /> Edit
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-red-400 px-3 py-1.5 rounded-md hover:bg-white/5 transition-all uppercase tracking-wider font-semibold"
                                            >
                                                <Trash2 className="w-3 h-3" /> Remove
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Delete Confirmation Overlay */}
                                {showDeleteConfirm && (
                                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-20 p-6">
                                        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
                                            <Trash2 className="w-5 h-5 text-red-400" />
                                        </div>
                                        <p className="text-white font-semibold text-sm mb-1">Delete {player.name}?</p>
                                        <p className="text-gray-400 text-xs mb-5 text-center">All notes and intel will be permanently removed.</p>
                                        <div className="flex gap-2 w-full max-w-xs">
                                            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 text-xs text-gray-300 py-2.5 border border-border rounded-lg hover:bg-white/5 transition-colors font-medium">Cancel</button>
                                            <button onClick={handleDeletePlayer} className="flex-1 text-xs text-white bg-red-500/80 py-2.5 rounded-lg font-semibold hover:bg-red-500 transition-colors">Confirm Delete</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* EXPLOITATIVE STRATEGY ENGINE */}
                            <StrategyGuide playstyle={player.playstyle} />
                        </div>

                        {/* RIGHT COLUMN: INTELLIGENCE FEED */}
                        <div className="lg:col-span-2">
                            <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 h-full shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                                    <div className="flex items-center">
                                        <AlignLeft className="w-5 h-5 text-felt-light mr-3" />
                                        <h2 className="text-lg font-bold text-white tracking-wide">INTELLIGENCE LOG</h2>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-mono text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                                            {player.notes.length} RECORDS
                                        </span>
                                        <button
                                            onClick={() => setShowAddNote(!showAddNote)}
                                            className="flex items-center text-xs px-3 py-1.5 bg-felt-light/20 hover:bg-felt-light/30 text-felt-light border border-felt-light/30 rounded-full transition-all font-bold uppercase tracking-wider"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                                            Add Note
                                        </button>
                                    </div>
                                </div>

                                {/* Inline Add Note Form */}
                                {showAddNote && (
                                    <div className="mb-6 p-5 bg-black/40 border border-felt-light/20 rounded-xl space-y-3">
                                        <div className="flex space-x-2">
                                            {['Preflop', 'Flop', 'Turn', 'River'].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setNewNoteStreet(s)}
                                                    className={`px-3 py-1 text-[10px] font-bold rounded uppercase transition-colors border ${newNoteStreet === s
                                                        ? 'bg-felt-default text-white border-felt-light'
                                                        : 'bg-card text-gray-400 border-border hover:text-gray-200'
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={newNoteContent}
                                            onChange={e => setNewNoteContent(e.target.value)}
                                            rows={2}
                                            placeholder="e.g. 3-bet light from BB with suited connectors..."
                                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => { setShowAddNote(false); setNewNoteContent(''); }}
                                                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white border border-border rounded-md transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddNote}
                                                disabled={addingNote || !newNoteContent.trim()}
                                                className="px-4 py-1.5 text-xs bg-felt-light text-white font-semibold rounded-md hover:bg-felt-default transition-colors disabled:opacity-50"
                                            >
                                                {addingNote ? 'Saving...' : 'Save Note'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {player.notes.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl bg-black/30">
                                            No intelligence records available yet. Click &quot;Add Note&quot; to start.
                                        </div>
                                    ) : (
                                        player.notes.map((note) => (
                                            <div key={note.id} className="bg-black/40 border border-white/5 rounded-xl p-5 hover:border-felt-light/30 transition-colors group relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-felt-light to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                                {editingNoteId === note.id ? (
                                                    /* EDIT MODE */
                                                    <div className="space-y-3">
                                                        <textarea
                                                            value={editContent}
                                                            onChange={e => setEditContent(e.target.value)}
                                                            rows={3}
                                                            className="w-full bg-background border border-gold/30 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => { setEditingNoteId(null); setEditContent(''); }}
                                                                className="flex items-center text-xs text-gray-400 hover:text-white px-2 py-1 border border-border rounded transition-colors"
                                                            >
                                                                <X className="w-3 h-3 mr-1" /> Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateNote(note.id)}
                                                                className="flex items-center text-xs text-white bg-felt-light px-3 py-1 rounded font-semibold hover:bg-felt-default transition-colors"
                                                            >
                                                                <Check className="w-3 h-3 mr-1" /> Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* VIEW MODE */
                                                    <>
                                                        <div className="flex justify-between items-start mb-3">
                                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded border border-white/10 font-mono">
                                                                {note.street || 'General'}
                                                            </span>
                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => { setEditingNoteId(note.id); setEditContent(note.content); }}
                                                                    className="p-1.5 text-gray-500 hover:text-gold hover:bg-white/5 rounded transition-all"
                                                                    title="Edit note"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteNote(note.id)}
                                                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded transition-all"
                                                                    title="Delete note"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-300 leading-relaxed mb-3">{note.content}</p>
                                                        <div className="text-[10px] text-gray-500 font-mono flex items-center">
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            Logged: {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString()}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
