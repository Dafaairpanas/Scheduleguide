'use client';

import React, { useState, useMemo } from 'react';
import { useScheduleStore } from '@/store/useScheduleStore';
import {
  generateBackupString,
  copyToClipboard,
  parseBackupData,
  exportBackupFile,
} from '@/lib/storage';
import {
  X,
  Copy,
  Check,
  ClipboardPaste,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Download,
  Trash2,
  FileCode2,
  ArrowRight,
  Layers,
} from 'lucide-react';

export const BackupModal: React.FC = () => {
  const isBackupModalOpen = useScheduleStore((state) => state.isBackupModalOpen);
  const setBackupModalOpen = useScheduleStore((state) => state.setBackupModalOpen);
  const schedules = useScheduleStore((state) => state.schedules);
  const tags = useScheduleStore((state) => state.tags);
  const importBackup = useScheduleStore((state) => state.importBackup);
  const resetToDefault = useScheduleStore((state) => state.resetToDefault);

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [inputText, setInputText] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate string export JSON
  const exportJsonString = useMemo(() => {
    return generateBackupString(schedules, tags);
  }, [schedules, tags]);

  // Validasi real-time untuk data import yang ditempel
  const parsedPreview = useMemo(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return null;
    try {
      const result = parseBackupData(trimmed);
      return {
        valid: true,
        schedulesCount: result.schedules.length,
        tagsCount: result.tags.length,
        data: result,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Format JSON tidak valid';
      return { valid: false, error: message };
    }
  }, [inputText]);

  if (!isBackupModalOpen) return null;

  // Handler Salin ke Clipboard (Export)
  const handleCopy = async () => {
    setErrorMsg(null);
    const success = await copyToClipboard(exportJsonString);
    if (success) {
      setCopied(true);
      setSuccessMsg('Data jadwal berhasil disalin ke clipboard! Siap ditempel.');
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg('Gagal menyalin otomatis. Silakan salin teks dari kotak pratinjau secara manual.');
    }
  };

  // Handler Tempel dari Clipboard (Import)
  const handlePasteFromClipboard = async () => {
    setErrorMsg(null);
    try {
      if (!navigator?.clipboard?.readText) {
        setErrorMsg('Browser Anda memerlukan penempelan manual. Silakan tekan lama atau Ctrl+V di kotak input.');
        return;
      }
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        setErrorMsg('Clipboard Anda masih kosong. Salin data jadwal terlebih dahulu.');
        return;
      }
      setInputText(text.trim());
    } catch {
      setErrorMsg('Izin clipboard ditolak. Silakan tempel secara manual (Ctrl+V) pada kotak di bawah.');
    }
  };

  // Handler Terapkan Jadwal (Import)
  const handleApplyImport = () => {
    setErrorMsg(null);
    if (!parsedPreview || !parsedPreview.valid || !parsedPreview.data) {
      setErrorMsg('Data yang ditempel belum valid. Periksa kembali format teks JSON.');
      return;
    }

    const { schedules: importedSchedules, tags: importedTags } = parsedPreview.data;
    importBackup(importedSchedules, importedTags);
    setSuccessMsg(`Sukses! Berhasil memuat ${importedSchedules.length} jadwal dan ${importedTags.length} kategori.`);
    setTimeout(() => {
      setSuccessMsg(null);
      setBackupModalOpen(false);
      setInputText('');
    }, 1200);
  };

  // Handler Reset Default
  const handleReset = () => {
    if (confirm('Kembalikan seluruh jadwal dan kategori ke konfigurasi default bawaan? Data saat ini akan diganti.')) {
      resetToDefault();
      setSuccessMsg('Jadwal berhasil di-reset ke template bawaan.');
      setTimeout(() => setSuccessMsg(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900 animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                Salin & Tempel Jadwal
              </h2>
              <p className="text-xs text-slate-500">
                Export & Import data instan tanpa perlu unduh file
              </p>
            </div>
          </div>
          <button
            onClick={() => setBackupModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Salin (Export) vs Tempel (Import) */}
        <div className="px-4 sm:px-5 pt-3 shrink-0">
          <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => {
                setActiveTab('export');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'export'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin (Export)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                {schedules.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('import');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'import'
                  ? 'bg-white text-purple-600 shadow-sm border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Tempel (Import)</span>
            </button>
          </div>
        </div>

        {/* Notifikasi Global Toast */}
        <div className="px-4 sm:px-5 pt-3">
          {successMsg && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="leading-snug">{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium animate-in fade-in slide-in-from-top-1">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Konten Tab Scrollable */}
        <div className="p-4 sm:p-5 pt-3 overflow-y-auto space-y-4">
          {/* TAB 1: SALIN (EXPORT) */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-slate-700 text-xs leading-relaxed flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600 shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {schedules.length} Jadwal &amp; {tags.length} Kategori Siap Disalin
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tinggal klik tombol di bawah untuk menyalin seluruh data. Anda bisa menyimpannya di Catatan, kirim via WhatsApp, atau tempel di HP/laptop lain.
                  </p>
                </div>
              </div>

              {/* Tombol Utama Salin */}
              <button
                onClick={handleCopy}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-emerald-600/25 ring-2 ring-emerald-300'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25 hover:shadow-indigo-600/35'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Semua Data Jadwal (Copy)</span>
                  </>
                )}
              </button>

              {/* Pratinjau Kode JSON yang Dapat Dilihat/Disalin */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden text-xs">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-100/90 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
                  <span>Data JSON Cadangan ({exportJsonString.length} karakter)</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 font-sans text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
                  </button>
                </div>
                <pre className="p-3 font-mono text-[11px] leading-relaxed text-slate-600 max-h-36 overflow-y-auto whitespace-pre-wrap break-all select-all focus:outline-none">
                  {exportJsonString}
                </pre>
              </div>

              {/* Opsi Opsional Unduh File */}
              <div className="pt-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => exportBackupFile(schedules, tags)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition-colors group"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                  <span className="underline decoration-slate-200 group-hover:decoration-slate-400">
                    Ingin simpan ke file? Unduh file JSON cadangan
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TEMPEL (IMPORT) */}
          {activeTab === 'import' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-600">
                  Tempel data JSON cadangan yang telah Anda salin sebelumnya:
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80 text-[11px] font-bold transition-all shadow-xs"
                    title="Tempel teks otomatis dari clipboard perangkat"
                  >
                    <ClipboardPaste className="w-3 h-3" />
                    <span>Tempel Otomatis</span>
                  </button>
                  {inputText && (
                    <button
                      type="button"
                      onClick={() => setInputText('')}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Bersihkan teks"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Textarea untuk Menempel Data */}
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder={'Tempelkan kode JSON di sini...\nContoh:\n{\n  "version": 1,\n  "schedules": [...],\n  "tags": [...]\n}'}
                  rows={5}
                  className="w-full p-3 font-mono text-[11px] rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-800 placeholder:text-slate-400 resize-none transition-all"
                />
              </div>

              {/* Status Pratinjau Deteksi Data */}
              {parsedPreview && (
                <div
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 transition-all ${
                    parsedPreview.valid
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/80 border-rose-200 text-rose-900'
                  }`}
                >
                  {parsedPreview.valid ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-[11px]">
                        Format valid: Terdeteksi <strong>{parsedPreview.schedulesCount} jadwal</strong> dan <strong>{parsedPreview.tagsCount} kategori</strong>.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="text-[11px] font-medium">{parsedPreview.error}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tombol Terapkan Data Import */}
              <button
                disabled={!parsedPreview?.valid}
                onClick={handleApplyImport}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:hover:bg-purple-600 text-white shadow-md shadow-purple-600/25 transition-all active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Terapkan &amp; Perbarui Jadwal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Modal: Reset ke Bawaan & Tombol Tutup */}
        <div className="p-3.5 sm:px-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:text-amber-700 hover:bg-amber-50 text-[11px] font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            <span>Reset ke Default</span>
          </button>

          <button
            onClick={() => setBackupModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
