'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, WifiOff, X, CheckCircle2, Zap } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    // 1. Deteksi status standalone (sudah terinstall sebagai PWA di HP atau Desktop)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true);
    }

    // 2. Tangkap event instalasi browser (beforeinstallprompt)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // 3. Deteksi koneksi internet
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 3500);
    };

    setIsOffline(!navigator.onLine);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 transition-all">
      {/* Banner Mode Offline - Menjelaskan bahwa sistem tetap aktif 100% lokal & instan */}
      {isOffline && (
        <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <span className="p-1 rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <WifiOff className="w-4 h-4" />
            </span>
            <span>
              <strong>Mode Offline Aktif:</strong> Semua fitur jadwal, visual jam, dan data Anda tetap berjalan instan 100% dari memori perangkat.
            </span>
          </div>
          <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
            <Zap className="w-3 h-3" /> Instan
          </span>
        </div>
      )}

      {/* Toast Kembali Online */}
      {showOnlineToast && (
        <div className="w-full flex items-center justify-between px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Koneksi internet tersambung kembali.</span>
          </div>
        </div>
      )}

      {/* Banner Promosi Install PWA di HP / Desktop */}
      {!isInstalled && deferredPrompt && !isDismissed && (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between p-3.5 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-sky-50/80 to-white border border-indigo-100 shadow-sm gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 tracking-tight">
                  Pasang ChronoCircle di HP
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Buka Seketika • 100% Offline
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Akses cepat langsung dari layar utama ponsel Anda, tanpa bilah browser dan siap dipakai kapan pun.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pasang Sekarang</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
