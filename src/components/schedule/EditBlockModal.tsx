'use client';

import React, { useState, useEffect } from 'react';
import { useScheduleStore } from '@/store/useScheduleStore';
import { formatTime, formatDuration, calculateDuration, snapMinutes } from '@/lib/time-utils';
import { X, Trash2, Clock, Tag as TagIcon, AlignLeft } from 'lucide-react';

export const EditBlockModal: React.FC = () => {
  const isEditModalOpen = useScheduleStore((state) => state.isEditModalOpen);
  const setEditModalOpen = useScheduleStore((state) => state.setEditModalOpen);
  const selectedBlockId = useScheduleStore((state) => state.selectedBlockId);
  const schedules = useScheduleStore((state) => state.schedules);
  const tags = useScheduleStore((state) => state.tags);
  const snapStep = useScheduleStore((state) => state.snapStep);
  const updateBlock = useScheduleStore((state) => state.updateBlock);
  const deleteBlock = useScheduleStore((state) => state.deleteBlock);

  const block = schedules.find((b) => b.id === selectedBlockId);

  const [title, setTitle] = useState('');
  const [startMinutes, setStartMinutes] = useState(0);
  const [endMinutes, setEndMinutes] = useState(60);
  const [tagId, setTagId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (block) {
      setTitle(block.title);
      setStartMinutes(block.startMinutes);
      setEndMinutes(block.endMinutes);
      setTagId(block.tagId);
      setNotes(block.notes || '');
    }
  }, [block]);

  if (!isEditModalOpen || !block) return null;

  const duration = calculateDuration(startMinutes, endMinutes);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateBlock(block.id, {
      title: title.trim(),
      startMinutes,
      endMinutes,
      tagId,
      notes: notes.trim(),
    });
    setEditModalOpen(false);
  };

  const handleDelete = () => {
    deleteBlock(block.id);
    setEditModalOpen(false);
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
    return (h || 0) * 60 + (m || 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl flex flex-col gap-5 text-slate-900">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Sunting Detail Jadwal</h2>
              <p className="text-xs text-slate-500">Sesuaikan nama kegiatan, jam, dan kategori</p>
            </div>
          </div>
          <button
            onClick={() => setEditModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Judul Kegiatan */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Nama Jadwal / Kegiatan</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Coding Arsitektur Sistem"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              autoFocus
            />
          </div>

          {/* Kategori / Tag */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-slate-500" />
              Kategori
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {tags.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTagId(t.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs font-semibold transition-all text-left ${
                    tagId === t.id
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs ring-1 ring-indigo-500/30'
                      : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pengaturan Jam Mulai & Selesai */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Jam Mulai</label>
              <input
                type="time"
                value={formatTime(startMinutes)}
                onChange={(e) => {
                  const mins = parseTimeToMinutes(e.target.value);
                  setStartMinutes(snapMinutes(mins, snapStep));
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Jam Selesai</label>
              <input
                type="time"
                value={formatTime(endMinutes)}
                onChange={(e) => {
                  const mins = parseTimeToMinutes(e.target.value);
                  setEndMinutes(snapMinutes(mins, snapStep));
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Info Durasi */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>Total Durasi Kegiatan:</span>
            <span className="font-bold text-indigo-600 font-mono text-sm">
              {formatDuration(duration)}
            </span>
          </div>

          {/* Catatan Tambahan */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-slate-500" />
              Catatan (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan persiapan atau target sesi ini..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all"
              >
                Simpan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
