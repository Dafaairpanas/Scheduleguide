'use client';

import React from 'react';
import { useScheduleStore } from '@/store/useScheduleStore';
import { SnapInterval } from '@/types/schedule';
import {
  Undo2,
  Redo2,
  Magnet,
  Tag as TagIcon,
  ArrowLeftRight,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const snapStep = useScheduleStore((state) => state.snapStep);
  const setSnapStep = useScheduleStore((state) => state.setSnapStep);
  const historyPast = useScheduleStore((state) => state.historyPast);
  const historyFuture = useScheduleStore((state) => state.historyFuture);
  const undo = useScheduleStore((state) => state.undo);
  const redo = useScheduleStore((state) => state.redo);
  const setTagManagerOpen = useScheduleStore((state) => state.setTagManagerOpen);
  const setBackupModalOpen = useScheduleStore((state) => state.setBackupModalOpen);
  const tags = useScheduleStore((state) => state.tags);
  const activeTagId = useScheduleStore((state) => state.activeTagId);
  const setActiveTagId = useScheduleStore((state) => state.setActiveTagId);

  const snapOptions: SnapInterval[] = [5, 10, 15, 30, 60];

  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="w-full bg-white/70 backdrop-blur-xl p-3 sm:px-6 sm:py-3.5 rounded-3xl flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 shadow-sm border border-white transition-all relative overflow-hidden">
      {/* Subtle shine effect on top border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />

      {/* Baris Atas Mobile / Bagian Kiri & Kanan Desktop */}
      <div className="flex items-center justify-between gap-2 w-full xl:w-auto min-w-0">
        {/* Brand Logo & Tanggal */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[1.15rem] sm:rounded-[1.25rem] bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white shrink-0 ring-1 ring-white/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1 sm:gap-1.5 drop-shadow-sm">
                <span>ChronoCircle</span>
                <span className="text-[8px] sm:text-[9px] uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 text-indigo-700 font-bold tracking-widest shadow-inner shrink-0">
                  Offline PWA
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-wide uppercase mt-0.5 truncate">
              <Calendar className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="truncate">{todayFormatted}</span>
            </div>
          </div>
        </div>

        {/* Kontrol Tools (Undo/Redo, Snap, Tag Manager, Backup) */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-50/90 p-1 sm:p-1.5 rounded-2xl border border-slate-100 shrink-0">
          {/* Undo & Redo */}
          <div className="flex items-center rounded-xl bg-white border border-slate-200/60 p-0.5 shadow-xs">
            <button
              title="Undo Perubahan (Ctrl+Z)"
              disabled={historyPast.length === 0}
              onClick={undo}
              className="p-1 sm:p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <div className="w-[1px] h-3.5 sm:h-4 bg-slate-200 mx-0.5" />
            <button
              title="Redo Perubahan (Ctrl+Y)"
              disabled={historyFuture.length === 0}
              onClick={redo}
              className="p-1 sm:p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Magnetic Snap Selector */}
          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white border border-slate-200/60 text-xs shadow-xs hover:border-indigo-200 transition-colors group">
            <Magnet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-500 group-hover:text-indigo-600" />
            <select
              value={snapStep}
              onChange={(e) => setSnapStep(Number(e.target.value) as SnapInterval)}
              className="bg-transparent text-[11px] sm:text-xs font-mono font-bold text-slate-700 focus:outline-none cursor-pointer appearance-none pl-0.5"
            >
              {snapOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-white text-slate-800 font-sans">
                  {opt}m
                </option>
              ))}
            </select>
          </div>

          <div className="w-[1px] h-4 sm:h-6 bg-slate-200 mx-0.5 hidden xs:block" />

          {/* Tag Manager Button */}
          <button
            onClick={() => setTagManagerOpen(true)}
            title="Kelola Kategori & Tag"
            className="p-1.5 sm:p-2 rounded-xl bg-white border border-slate-200/60 text-slate-500 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200 transition-all shadow-xs"
          >
            <TagIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Backup / Export Button */}
          <button
            onClick={() => setBackupModalOpen(true)}
            title="Salin & Tempel Jadwal (Export / Import)"
            className="p-1.5 sm:p-2 rounded-xl bg-white border border-slate-200/60 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-xs"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Selector Kategori Aktif untuk Blok Baru (Scrollable Row) */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 w-full xl:w-auto xl:flex-1 max-w-full xl:max-w-xl no-scrollbar px-1 min-w-0 border-t xl:border-t-0 border-slate-100 pt-2 xl:pt-1">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">
            Fokus:
          </span>
          {tags.map((tag) => {
            const isActive = activeTagId === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => setActiveTagId(tag.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-800 shadow-md transform scale-105'
                    : 'bg-white/70 text-slate-600 border-slate-200/60 hover:bg-white hover:text-slate-900 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs ring-1 ring-white/50"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="truncate max-w-[110px]">{tag.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
