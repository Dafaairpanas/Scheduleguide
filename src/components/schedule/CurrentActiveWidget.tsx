'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useScheduleStore } from '@/store/useScheduleStore';
import { formatTime, formatDuration, calculateDuration, isMinutesInsideRange } from '@/lib/time-utils';
import { sound, requestNotificationPermission, sendScheduleNotification } from '@/lib/notification';
import {
  Sparkles,
  Clock,
  ArrowRight,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Target,
  Edit3,
  Coffee,
  CheckCircle2,
  Hourglass,
  Activity,
  ChevronRight
} from 'lucide-react';

export const CurrentActiveWidget: React.FC = () => {
  const schedules = useScheduleStore((state) => state.schedules);
  const tags = useScheduleStore((state) => state.tags);
  const setSelectedBlockId = useScheduleStore((state) => state.setSelectedBlockId);
  const setEditModalOpen = useScheduleStore((state) => state.setEditModalOpen);

  const [currentMinutes, setCurrentMinutes] = useState(() => {
    if (typeof window !== 'undefined') {
      const d = new Date();
      return d.getHours() * 60 + d.getMinutes();
    }
    return 0;
  });
  const [currentSeconds, setCurrentSeconds] = useState(() => {
    if (typeof window !== 'undefined') {
      return new Date().getSeconds();
    }
    return 0;
  });
  const [chimeEnabled, setChimeEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(false);

  const lastBlockIdRef = useRef<string | null>(null);

  // Update timer setiap detik
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      const secs = now.getSeconds();
      setCurrentMinutes(mins);
      setCurrentSeconds(secs);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cek apakah notifikasi diizinkan
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotifEnabled(true);
      }
    }
  }, []);

  // Temukan blok yang sedang aktif saat ini
  const activeBlock = schedules.find((b) =>
    isMinutesInsideRange(currentMinutes, b.startMinutes, b.endMinutes)
  );

  const activeTag = activeBlock ? tags.find((t) => t.id === activeBlock.tagId) : null;

  // Temukan blok berikutnya (Up Next)
  const upcomingBlocks = schedules
    .map((b) => {
      // Hitung selisih menit menuju startMinutes
      let diff = b.startMinutes - currentMinutes;
      if (diff < 0) diff += 1440;
      return { block: b, diff };
    })
    .filter((item) => item.diff > 0 && item.block.id !== activeBlock?.id)
    .sort((a, b) => a.diff - b.diff);

  const nextSchedule = upcomingBlocks.length > 0 ? upcomingBlocks[0] : null;
  const nextTag = nextSchedule ? tags.find((t) => t.id === nextSchedule.block.tagId) : null;

  // Deteksi pergantian jadwal -> Audio Chime & Browser Notification
  useEffect(() => {
    const currentId = activeBlock ? activeBlock.id : 'free-time';
    if (lastBlockIdRef.current === null) {
      // Rekam status awal tanpa memicu notifikasi pembukaan
      lastBlockIdRef.current = currentId;
      return;
    }

    if (lastBlockIdRef.current !== currentId) {
      // Jadwal benar-benar berubah saat aplikasi sedang dibuka
      if (chimeEnabled) {
        sound.playTransitionChime();
      }
      if (notifEnabled) {
        if (activeBlock) {
          sendScheduleNotification(
            `Waktunya: ${activeBlock.title}`,
            `Sesi baru dimulai sekarang (${formatTime(activeBlock.startMinutes)} - ${formatTime(activeBlock.endMinutes)})`
          );
        } else {
          sendScheduleNotification(
            'Waktu Luang / Istirahat Bebas',
            'Tidak ada jadwal khusus saat ini. Nikmati waktu istirahat Anda!'
          );
        }
      }
      lastBlockIdRef.current = currentId;
    }
  }, [activeBlock, chimeEnabled, notifEnabled]);

  // Kalkulasi durasi, waktu terlewat, sisa waktu, dan progress %
  let totalDurationMinutes = 0;
  let elapsedMinutes = 0;
  let remainingMinutes = 0;
  let progressPercent = 0;

  if (activeBlock) {
    totalDurationMinutes = calculateDuration(activeBlock.startMinutes, activeBlock.endMinutes);

    if (currentMinutes >= activeBlock.startMinutes) {
      elapsedMinutes = currentMinutes - activeBlock.startMinutes;
    } else {
      // Lewat tengah malam
      elapsedMinutes = 1440 - activeBlock.startMinutes + currentMinutes;
    }

    remainingMinutes = Math.max(0, totalDurationMinutes - elapsedMinutes);
    const exactElapsedSeconds = elapsedMinutes * 60 + currentSeconds;
    const exactTotalSeconds = totalDurationMinutes * 60;
    progressPercent = Math.min(100, Math.max(0, (exactElapsedSeconds / exactTotalSeconds) * 100));
  }

  // Toggle audio
  const handleToggleChime = () => {
    const next = !chimeEnabled;
    setChimeEnabled(next);
    if (next) sound.playTransitionChime();
  };

  // Toggle notifikasi
  const handleToggleNotif = async () => {
    if (!notifEnabled) {
      const granted = await requestNotificationPermission();
      setNotifEnabled(granted);
      if (granted) {
        sendScheduleNotification('ChronoCircle Siap', 'Notifikasi pergantian jadwal diaktifkan.');
      }
    } else {
      setNotifEnabled(false);
    }
  };

  // Dynamic Theme Colors
  const themeColor = activeTag?.color || '#4f46e5';
  const isFreeTime = !activeBlock;

  return (
    <div 
      className="w-full rounded-[2rem] p-5 sm:p-7 flex flex-col gap-5 relative overflow-hidden transition-all duration-500 shadow-xl group border border-white/50"
      style={{
        background: `linear-gradient(135deg, white 0%, ${themeColor}08 100%)`,
        boxShadow: `0 10px 40px -10px ${themeColor}25, inset 0 0 0 1px ${themeColor}15`,
      }}
    >
      {/* Dynamic Background Mesh / Orbs */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[80px] pointer-events-none opacity-40 transition-colors duration-1000"
        style={{ backgroundColor: themeColor }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-[80px] pointer-events-none opacity-20 transition-colors duration-1000"
        style={{ backgroundColor: isFreeTime ? '#10b981' : themeColor }}
      />

      {/* Baris Atas: Badge Status & Action Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-slate-200/50">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-2.5 h-2.5 rounded-full animate-ping opacity-75" style={{ backgroundColor: isFreeTime ? '#10b981' : themeColor }} />
              <span className="relative w-2 h-2 rounded-full" style={{ backgroundColor: isFreeTime ? '#10b981' : themeColor }} />
            </div>
            <span className="font-mono text-slate-800 text-sm font-bold tracking-tight" suppressHydrationWarning>
              {formatTime(currentMinutes)}
              <span className="text-[10px] text-slate-400 font-medium ml-0.5 animate-pulse">:{currentSeconds.toString().padStart(2, '0')}</span>
            </span>
            <span className="text-slate-300 mx-1">|</span>
            <span className="uppercase tracking-widest text-[10px] font-bold" style={{ color: isFreeTime ? '#059669' : themeColor }}>
              {isFreeTime ? 'Waktu Luang' : 'Berlangsung'}
            </span>
          </div>

          {activeTag && (
            <span
              className="px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-sm border border-white/50 backdrop-blur-md"
              style={{
                backgroundColor: `${activeTag.color}15`,
                color: activeTag.textColor || activeTag.color,
              }}
            >
              {activeTag.name}
            </span>
          )}
        </div>

        {/* Toggles Suara & Notifikasi */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleChime}
            title={chimeEnabled ? 'Audio Chime Aktif' : 'Audio Chime Mati'}
            className={`p-2 sm:px-3 sm:py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md ${
              chimeEnabled
                ? 'bg-white border-white shadow-md text-indigo-600 hover:shadow-lg hover:-translate-y-0.5'
                : 'bg-white/50 border-white/40 text-slate-400 hover:text-slate-600'
            }`}
          >
            {chimeEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">Suara</span>
          </button>

          <button
            onClick={handleToggleNotif}
            title={notifEnabled ? 'Notifikasi Aktif' : 'Aktifkan Notifikasi'}
            className={`p-2 sm:px-3 sm:py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md ${
              notifEnabled
                ? 'bg-white border-white shadow-md text-emerald-600 hover:shadow-lg hover:-translate-y-0.5'
                : 'bg-white/50 border-white/40 text-slate-400 hover:text-slate-600'
            }`}
          >
            {notifEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            <span className="hidden sm:inline">Notif</span>
          </button>
        </div>
      </div>

      {/* Konten Utama: Nama Kegiatan & Info Waktu */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-2">
        {activeBlock ? (
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 opacity-80" style={{ color: themeColor }}>
              <Activity className="w-3.5 h-3.5" />
              Fokus Utama Saat Ini
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none drop-shadow-sm break-words">
              {activeBlock.title}
            </h2>
            {activeBlock.notes && (
              <p className="text-sm text-slate-600 font-medium bg-white/40 py-1.5 px-3 rounded-lg w-fit max-w-full mt-2 shadow-sm border border-white/60 break-words">
                {activeBlock.notes}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-medium text-slate-500 mt-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/50 shadow-sm">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono text-slate-700">
                  {formatTime(activeBlock.startMinutes)} <ChevronRight className="w-3 h-3 inline text-slate-400" /> {formatTime(activeBlock.endMinutes)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/50 shadow-sm">
                <Hourglass className="w-3.5 h-3.5" />
                <span className="text-slate-700">
                  {formatDuration(totalDurationMinutes)} Total
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 opacity-80">
              <Coffee className="w-3.5 h-3.5" />
              Waktu Fleksibel
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight drop-shadow-sm">
              Sedang Kosong
            </h2>
            <p className="text-sm text-slate-600 font-medium mt-2 max-w-md leading-relaxed">
              Anda sedang berada di luar jadwal. Gunakan waktu ini untuk istirahat atau bersiap untuk aktivitas selanjutnya.
            </p>
          </div>
        )}

        {/* Countdown & Quick Action Buttons */}
        <div className="flex flex-col items-start sm:items-end gap-4 shrink-0">
          {activeBlock ? (
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Sisa Waktu
              </span>
              <div className="flex items-baseline gap-1 bg-white shadow-lg shadow-indigo-100/50 px-4 py-2 rounded-2xl border border-indigo-50">
                <span className="text-3xl font-black font-mono tracking-tighter" style={{ color: themeColor }}>
                  {remainingMinutes}
                </span>
                <span className="text-sm font-bold text-slate-500 ml-1">menit</span>
              </div>
            </div>
          ) : nextSchedule ? (
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Mulai Dalam
              </span>
              <div className="flex items-baseline gap-1 bg-white shadow-lg shadow-emerald-100/50 px-4 py-2 rounded-2xl border border-emerald-50">
                <span className="text-3xl font-black font-mono tracking-tighter text-emerald-600">
                  {nextSchedule.diff > 60 ? Math.floor(nextSchedule.diff / 60) : nextSchedule.diff}
                </span>
                <span className="text-sm font-bold text-slate-500 ml-1">
                  {nextSchedule.diff > 60 ? 'jam' : 'menit'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100/50 shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold text-sm">Semua Selesai</span>
            </div>
          )}

          {activeBlock && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedBlockId(activeBlock.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Target className="w-4 h-4 text-indigo-300" />
                Sorot di Jam
              </button>

              <button
                onClick={() => {
                  setSelectedBlockId(activeBlock.id);
                  setEditModalOpen(true);
                }}
                className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-all shadow-sm border border-slate-200"
                title="Sunting Jadwal Ini"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Premium Progress Bar Dinamis Saat Ada Blok Aktif */}
      {activeBlock && (
        <div className="relative z-10 flex flex-col gap-2 mt-2">
          <div className="w-full h-3 sm:h-4 rounded-full bg-slate-200/50 overflow-hidden shadow-inner backdrop-blur-sm relative">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear relative"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, ${themeColor}99 0%, ${themeColor} 100%)`,
                boxShadow: `0 0 10px ${themeColor}80`
              }}
            >
              {/* Highlight / Shine effect inside bar */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-full" />
              {/* Glimmer animation at the tip */}
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/40 blur-[2px] animate-pulse" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span className="opacity-80">Berjalan: {progressPercent.toFixed(1)}%</span>
            <span className="opacity-80">Sisa: {formatDuration(remainingMinutes)}</span>
          </div>
        </div>
      )}

      {/* Baris Bawah: Pratinjau 'Up Next' (Aktivitas Selanjutnya) */}
      {nextSchedule && (
        <div className="relative z-10 mt-3 pt-4 border-t border-slate-900/5 flex flex-wrap items-center justify-between gap-3 bg-white/40 -mx-5 -mb-5 px-5 py-4 sm:-mx-7 sm:-mb-7 sm:px-7 sm:py-5 backdrop-blur-md rounded-b-[2rem]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100">
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Up Next
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: nextTag?.color || '#94a3b8' }}
                />
                <span className="font-bold text-slate-900 truncate text-sm">
                  {nextSchedule.block.title}
                </span>
                <span className="text-slate-500 font-mono text-xs font-medium bg-white/60 px-1.5 py-0.5 rounded">
                  {formatTime(nextSchedule.block.startMinutes)}
                </span>
              </div>
            </div>
          </div>

          <span className="text-slate-600 font-bold text-xs bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-100">
            Mulai dalam{' '}
            <span className="text-indigo-600">
              {formatDuration(nextSchedule.diff)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

