'use client';

import React from 'react';
import { useScheduleStore } from '@/store/useScheduleStore';
import { formatTime, formatDuration, calculateDuration, isMinutesInsideRange, getCurrentSystemMinutes } from '@/lib/time-utils';
import { Clock, Edit3, Trash2, Copy, Plus, Sparkles } from 'lucide-react';

export const ScheduleList: React.FC = () => {
  const schedules = useScheduleStore((state) => state.schedules);
  const tags = useScheduleStore((state) => state.tags);
  const selectedBlockId = useScheduleStore((state) => state.selectedBlockId);
  const setSelectedBlockId = useScheduleStore((state) => state.setSelectedBlockId);
  const setEditModalOpen = useScheduleStore((state) => state.setEditModalOpen);
  const deleteBlock = useScheduleStore((state) => state.deleteBlock);
  const duplicateBlock = useScheduleStore((state) => state.duplicateBlock);
  const addBlock = useScheduleStore((state) => state.addBlock);
  const activeTagId = useScheduleStore((state) => state.activeTagId);

  // Waktu saat ini untuk mendeteksi blok aktif
  const currentMinutes = getCurrentSystemMinutes();

  // Urutkan jadwal secara kronologis berdasarkan startMinutes
  const sortedSchedules = [...schedules].sort((a, b) => a.startMinutes - b.startMinutes);

  const handleCreateNew = () => {
    const activeTag = tags.find((t) => t.id === activeTagId) || tags[0];
    const newId = addBlock({
      title: activeTag.name,
      startMinutes: 8 * 60, // 08:00
      endMinutes: 9 * 60,   // 09:00
      tagId: activeTag.id,
      notes: '',
    });
    setSelectedBlockId(newId);
    setEditModalOpen(true);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold tracking-wider text-slate-700 uppercase">
            Rangkaian Jadwal ({sortedSchedules.length})
          </h3>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Jadwal</span>
        </button>
      </div>

      {sortedSchedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
          <Clock className="w-10 h-10 mb-2 stroke-[1.2] opacity-40 text-slate-300" />
          <p className="text-xs font-semibold text-slate-600">Belum ada jadwal tersimpan.</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Klik dan tarik pada lingkaran jam untuk membuat blok waktu baru.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[460px] pr-1">
          {sortedSchedules.map((block) => {
            const tag = tags.find((t) => t.id === block.tagId) || tags[0];
            const isSelected = selectedBlockId === block.id;
            const duration = calculateDuration(block.startMinutes, block.endMinutes);
            const isCurrentlyActive = isMinutesInsideRange(
              currentMinutes,
              block.startMinutes,
              block.endMinutes
            );

            return (
              <div
                key={block.id}
                onClick={() => setSelectedBlockId(block.id)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-300 shadow-sm ring-2 ring-indigo-500/20'
                    : isCurrentlyActive
                    ? 'bg-emerald-50/60 border-emerald-300/80 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300 hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Indikator Warna Tag */}
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: tag?.color || '#4f46e5' }}
                  />

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {block.title}
                      </span>
                      {isCurrentlyActive && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 animate-pulse shrink-0">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Aktif Sekarang</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                      <span>
                        {formatTime(block.startMinutes)} – {formatTime(block.endMinutes)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 font-sans font-medium">
                        {formatDuration(duration)}
                      </span>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span
                        className="text-[11px] font-sans font-medium truncate max-w-[100px] hidden sm:inline"
                        style={{ color: tag?.textColor || tag?.color }}
                      >
                        {tag?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi Cepat */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    title="Gandakan Blok"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateBlock(block.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    title="Sunting Rincian"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBlockId(block.id);
                      setEditModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100/70 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    title="Hapus Jadwal"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBlock(block.id);
                    }}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100/70 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
