'use client';

import React, { useState } from 'react';
import { useScheduleStore } from '@/store/useScheduleStore';
import { X, Plus, Trash2, Tag as TagIcon, Palette } from 'lucide-react';

const PRESET_MODERN_COLORS = [
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#ea580c', // Orange / Coral
  '#e11d48', // Rose
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#0284c7', // Sky Blue
  '#0d9488', // Teal
  '#475569', // Slate
];

export const TagManagerModal: React.FC = () => {
  const isTagManagerOpen = useScheduleStore((state) => state.isTagManagerOpen);
  const setTagManagerOpen = useScheduleStore((state) => state.setTagManagerOpen);
  const tags = useScheduleStore((state) => state.tags);
  const addTag = useScheduleStore((state) => state.addTag);
  const deleteTag = useScheduleStore((state) => state.deleteTag);

  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_MODERN_COLORS[0]);

  if (!isTagManagerOpen) return null;

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    addTag({
      name: newTagName.trim(),
      color: selectedColor,
    });
    setNewTagName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl flex flex-col gap-5 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TagIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Kelola Kategori & Warna</h2>
              <p className="text-xs text-slate-500">Atur kategori jadwal harian Anda</p>
            </div>
          </div>
          <button
            onClick={() => setTagManagerOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Tambah Tag Baru */}
        <form onSubmit={handleCreateTag} className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            Tambah Kategori Baru
          </span>

          <input
            type="text"
            placeholder="Nama Kategori (misal: Rapat Tim, Membaca)"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium"
          />

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {PRESET_MODERN_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    selectedColor === c ? 'scale-125 ring-2 ring-slate-800 ring-offset-2 ring-offset-white' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={!newTagName.trim()}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs transition-all shadow-xs"
            >
              Tambah
            </button>
          </div>
        </form>

        {/* Daftar Tag yang Ada */}
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Daftar Kategori Aktif ({tags.length})
          </span>

          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-xs"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-xs font-bold text-slate-800">{tag.name}</span>
              </div>

              {tags.length > 1 && (
                <button
                  onClick={() => deleteTag(tag.id)}
                  title="Hapus Kategori"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Tombol Selesai */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setTagManagerOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
