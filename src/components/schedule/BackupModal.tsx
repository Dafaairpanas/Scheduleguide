'use client';

import React, { useRef, useState } from 'react';
import { useScheduleStore } from '@/store/useScheduleStore';
import { exportBackupFile, parseBackupFile } from '@/lib/storage';
import { X, Download, Upload, RotateCcw, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

export const BackupModal: React.FC = () => {
  const isBackupModalOpen = useScheduleStore((state) => state.isBackupModalOpen);
  const setBackupModalOpen = useScheduleStore((state) => state.setBackupModalOpen);
  const schedules = useScheduleStore((state) => state.schedules);
  const tags = useScheduleStore((state) => state.tags);
  const importBackup = useScheduleStore((state) => state.importBackup);
  const resetToDefault = useScheduleStore((state) => state.resetToDefault);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isBackupModalOpen) return null;

  const handleExport = () => {
    exportBackupFile(schedules, tags);
    setSuccessMsg('Data jadwal berhasil diunduh dalam file JSON!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const { schedules: importedSchedules, tags: importedTags } = parseBackupFile(text);
        importBackup(importedSchedules, importedTags);
        setSuccessMsg(`Berhasil mengimpor ${importedSchedules.length} jadwal!`);
        setErrorMsg(null);
        setTimeout(() => {
          setSuccessMsg(null);
          setBackupModalOpen(false);
        }, 1500);
      } catch {
        setErrorMsg('Gagal mengimpor file! Pastikan file adalah format JSON backup valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Kembalikan seluruh jadwal dan kategori ke konfigurasi default bawaan?')) {
      resetToDefault();
      setSuccessMsg('Jadwal berhasil di-reset ke template awal.');
      setTimeout(() => setSuccessMsg(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl flex flex-col gap-5 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Backup & Sinkronisasi Lokal</h2>
              <p className="text-xs text-slate-500">100% tersimpan aman di perangkat Anda</p>
            </div>
          </div>
          <button
            onClick={() => setBackupModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          ChronoCircle beroperasi 100% di browser Anda (*hostless & offline*). Anda dapat mengekspor seluruh jadwal ke file JSON untuk dipindahkan antar-HP atau dicadangkan.
        </p>

        {/* Notifikasi Sukses / Error */}
        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tombol Export / Import */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-100/80 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Download className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">Export Backup (JSON)</span>
                <span className="text-[11px] text-slate-500">Unduh data jadwal ke file cadangan</span>
              </div>
            </div>
          </button>

          {/* Tombol Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100/80 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Upload className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">Import Backup (JSON)</span>
                <span className="text-[11px] text-slate-500">Pulihkan jadwal dari file cadangan</span>
              </div>
            </div>
          </button>

          {/* Reset Template */}
          <button
            onClick={handleReset}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/40 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100/80 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700">Reset ke Jadwal Bawaan</span>
                <span className="text-[11px] text-slate-400">Muat ulang template jadwal awal</span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setBackupModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
