"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { PlayerHUD } from "@/components/dashboard/PlayerHUD";
import { Users, Upload, Plus, Download } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { AddPlayerForm } from "@/components/forms/AddPlayerForm";
import { AddNoteForm } from "@/components/forms/AddNoteForm";
import { ImportJsonModal } from "@/components/forms/ImportJsonModal";
import { TemplateManagerModal } from "@/components/forms/TemplateManagerModal";
import { OCRSearchInput } from "@/components/layout/OCRSearchInput";
import { API } from "@/lib/api";

// Define strict typing for Player matching the Backend return signature
interface Player {
  id: string;
  name: string;
  playstyle: string;
  aggression_score: number;
  notesCount?: number; // Optional until derived completely from backend notes join
}

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isNoteModalOpen, setNoteModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlaystyle, setFilterPlaystyle] = useState('All');
  const [activePlayerForNote, setActivePlayerForNote] = useState<Player | null>(null);

  // Fetch real players from the backend API
  const fetchPlayers = async () => {
    try {
      const res = await fetch(API.players);
      const json = await res.json();
      if (json.success && json.data) {
        // notesCount is now flattened at the server level
        setPlayers(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch players", e);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Filter Logic
  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlaystyle = filterPlaystyle === 'All' || p.playstyle === filterPlaystyle;
    return matchesSearch && matchesPlaystyle;
  });

  // Extract distinct playstyles for the dropdown
  const distinctPlaystyles = Array.from(new Set(players.map(p => p.playstyle).filter(Boolean)));

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f2e1e] via-[#020202] to-black">
      <Header
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <div className="flex-1 overflow-y-auto pt-32 p-8 relative scrollbar-thin scrollbar-thumb-felt-light scrollbar-track-transparent">
        {/* Decorative background logo/pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
          <div className="w-[500px] h-[500px] rounded-full bg-felt-light blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Metrics Command Bar */}
          <div className="mb-10 p-6 bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Metrics Row */}
              <div className="flex items-center gap-8">
                {/* Total Opponents */}
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold font-mono text-white">{players.length}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Opponents</span>
                </div>

                <div className="w-px h-10 bg-white/10"></div>

                {/* Total Notes */}
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold font-mono text-gold">
                    {players.reduce((acc, curr) => acc + (curr.notesCount || 0), 0)}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Notes</span>
                </div>

                <div className="w-px h-10 bg-white/10"></div>

                {/* Playstyle Breakdown */}
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Playstyle Breakdown</span>
                  <div className="flex flex-wrap gap-2">
                    {distinctPlaystyles.map(style => (
                      <span key={style} className="text-[11px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-300 font-medium">
                        {style} <strong className="text-white ml-1">{players.filter(p => p.playstyle === style).length}</strong>
                      </span>
                    ))}
                    {distinctPlaystyles.length === 0 && (
                      <span className="text-[11px] text-gray-600 italic">No data yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 shrink-0">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(API.playerExport);
                      const json = await res.json();
                      if (json.success && json.data) {
                        const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `villainvault-export-${new Date().toISOString().slice(0, 10)}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    } catch (e) { console.error("Export failed", e); }
                  }}
                  className="flex items-center px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={() => setImportModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </button>
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-gold to-yellow-400 text-black font-bold uppercase tracking-wider rounded-full text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Player
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card/40 backdrop-blur-2xl border border-white/5 rounded-t-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>
            <h2 className="text-xl font-bold text-white flex items-center min-w-[200px] tracking-wide">
              <Users className="w-5 h-5 mr-3 text-gold" />
              OPPONENT HUDS
            </h2>

            {/* Table-like Control Bar */}
            <div className="flex flex-1 items-center justify-end space-x-6 w-full">
              <div className="w-full max-w-md">
                <OCRSearchInput onSearch={(query) => setSearchQuery(query)} />
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Style:</span>
                <select
                  value={filterPlaystyle}
                  onChange={(e) => setFilterPlaystyle(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none cursor-pointer backdrop-blur-md transition-all hover:bg-black/70 appearance-none"
                >
                  <option value="All">All ({players.length})</option>
                  {distinctPlaystyles.map(style => (
                    <option key={style} value={style}>
                      {style} ({players.filter(p => p.playstyle === style).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Render the Grid immediately below the toolbar to look like a connected table body */}
          <div className="bg-gradient-to-b from-card/20 to-transparent border-x border-b border-white/5 rounded-b-2xl p-8 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlayers.length === 0 ? (
                <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-500 border border-dashed border-border rounded-lg bg-card/20">
                  <p>No players found.</p>
                  {searchQuery && <p className="text-xs mt-1">Try a different search query.</p>}
                </div>
              ) : (
                filteredPlayers.map((player) => (
                  <PlayerHUD
                    key={player.id}
                    id={player.id}
                    name={player.name}
                    playstyle={player.playstyle || "UNKNOWN"}
                    aggressionScore={player.aggression_score}
                    notesCount={player.notesCount || 0}
                    onAddNote={() => {
                      setActivePlayerForNote(player);
                      setNoteModalOpen(true);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Target"
      >
        <AddPlayerForm
          onCancel={() => setAddModalOpen(false)}
          onSuccess={() => {
            setAddModalOpen(false);
            fetchPlayers(); // Rehydrate UI
          }}
        />
      </Modal>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Bulk Import Data"
      >
        <ImportJsonModal
          onCancel={() => setImportModalOpen(false)}
          onSuccess={() => {
            setImportModalOpen(false);
            fetchPlayers(); // Refresh the grid
          }}
        />
      </Modal>

      <Modal
        isOpen={isNoteModalOpen && activePlayerForNote !== null}
        onClose={() => setNoteModalOpen(false)}
        title={`Add Note: ${activePlayerForNote?.name}`}
      >
        {activePlayerForNote && (
          <AddNoteForm
            playerId={activePlayerForNote.id}
            onCancel={() => setNoteModalOpen(false)}
            onSuccess={() => {
              setNoteModalOpen(false);
              fetchPlayers(); // Refresh metrics
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Settings & Tags"
      >
        <TemplateManagerModal onClose={() => setSettingsOpen(false)} />
      </Modal>
    </div>
  );
}
