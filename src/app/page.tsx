'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useScheduleStore } from '@/store/useScheduleStore';
import { Header } from '@/components/ui/Header';
import { PwaInstallBanner } from '@/components/pwa/PwaInstallBanner';
import { CurrentActiveWidget } from '@/components/schedule/CurrentActiveWidget';
import { CircularClock } from '@/components/clock/CircularClock';
import { TimeBreakdown } from '@/components/analytics/TimeBreakdown';
import { ScheduleList } from '@/components/schedule/ScheduleList';
import { EditBlockModal } from '@/components/schedule/EditBlockModal';
import { TagManagerModal } from '@/components/schedule/TagManagerModal';
import { BackupModal } from '@/components/schedule/BackupModal';
import { Sparkles, MousePointerClick, ShieldCheck, Clock, ListChecks, PieChart } from 'lucide-react';

export default function Home() {
  const initialize = useScheduleStore((state) => state.initialize);
  const undo = useScheduleStore((state) => state.undo);
  const redo = useScheduleStore((state) => state.redo);
  const setSelectedBlockId = useScheduleStore((state) => state.setSelectedBlockId);

  // Mobile Tab Switcher ('clock' | 'list' | 'analytics')
  const [mobileTab, setMobileTab] = useState<'clock' | 'list' | 'analytics'>('clock');

  // Inisialisasi data dari LocalStorage
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Listener shortcut keyboard (Ctrl+Z, Ctrl+Y, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'Escape') {
        setSelectedBlockId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, setSelectedBlockId]);

  const triggerCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#4f46e5', '#059669', '#ea580c', '#e11d48', '#d97706'],
    });
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col p-2.5 sm:p-6 max-w-7xl mx-auto gap-4 sm:gap-5 relative selection:bg-indigo-100 selection:text-indigo-900 w-full overflow-x-hidden">
      {/* Background Soft Pastel Ambient Blurs */}
      <div className="fixed top-12 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-200/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-12 right-1/4 w-96 h-96 bg-rose-200/25 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed top-1/2 right-10 w-80 h-80 bg-sky-200/25 rounded-full blur-[130px] pointer-events-none" />

      {/* 1. PWA Install & Offline Status Banner */}
      <PwaInstallBanner />

      {/* 2. Top Navigation & Controls Bar */}
      <Header />

      {/* 3. FITUR UTAMA: "Saat Ini Waktunya Apa?" (Now & Next Widget) */}
      <CurrentActiveWidget />

      {/* Mobile Tab Switcher Bar (Tampil hanya di layar HP / Tablet kecil < lg) */}
      <div className="flex lg:hidden items-center justify-center p-1 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <button
          onClick={() => setMobileTab('clock')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            mobileTab === 'clock'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Piringan Jam</span>
        </button>

        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            mobileTab === 'list'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ListChecks className="w-3.5 h-3.5" />
          <span>Daftar Jadwal</span>
        </button>

        <button
          onClick={() => setMobileTab('analytics')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            mobileTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Alokasi</span>
        </button>
      </div>

      {/* 4. Workspace Grid (Responsive Desktop & Mobile Tabs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Kanvas Jam Melingkar (7 Cols di Desktop) */}
        <div
          className={`lg:col-span-7 flex flex-col items-center justify-center bg-white p-2.5 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden transition-all w-full min-w-0 ${
            mobileTab !== 'clock' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Header Kanvas */}
          <div className="w-full flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Piringan Visual 24 Jam
              </span>
            </div>

            <button
              onClick={triggerCelebrate}
              title="Rayakan Rencana Hari Ini"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Rayakan Rencana</span>
            </button>
          </div>

          {/* Jam Melingkar SVG */}
          <CircularClock />

          {/* Panduan Interaksi Singkat */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-center text-xs text-slate-500 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                <strong className="text-slate-800">Klik & Tarik:</strong> buat blok jadwal baru
              </span>
            </div>
            <span className="hidden sm:inline text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                <strong className="text-slate-800">Handle Putih:</strong> geser ujung untuk atur durasi
              </span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Analisis Alokasi Waktu & Daftar Jadwal (5 Cols di Desktop) */}
        <div
          className={`lg:col-span-5 flex flex-col gap-6 ${
            mobileTab === 'clock' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Visualizer Persentase Waktu */}
          <div className={mobileTab === 'list' ? 'hidden lg:block' : 'block'}>
            <TimeBreakdown />
          </div>

          {/* Daftar Linear Jadwal */}
          <div className={mobileTab === 'analytics' ? 'hidden lg:block' : 'block'}>
            <ScheduleList />
          </div>
        </div>
      </div>

      {/* Modal Dialogs */}
      <EditBlockModal />
      <TagManagerModal />
      <BackupModal />
    </main>
  );
}
