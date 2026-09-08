'use client';

import React from 'react';
import {
  CLOCK_CENTER,
  OUTER_RADIUS,
  INNER_RADIUS,
  CENTER_CORE_RADIUS,
} from '@/lib/constants';
import { formatTime, formatDuration, calculateDuration } from '@/lib/time-utils';
import { useScheduleStore } from '@/store/useScheduleStore';

interface ClockDialProps {
  currentTimeMinutes: number;
}

export const ClockDial: React.FC<ClockDialProps> = ({ currentTimeMinutes }) => {
  const hoveredTimeMinutes = useScheduleStore((state) => state.hoveredTimeMinutes);
  const hoveredBlockId = useScheduleStore((state) => state.hoveredBlockId);
  const selectedBlockId = useScheduleStore((state) => state.selectedBlockId);
  const schedules = useScheduleStore((state) => state.schedules);
  const tags = useScheduleStore((state) => state.tags);
  const activeDrag = useScheduleStore((state) => state.activeDrag);

  // Prioritaskan blok yang sedang di-hover, jika tidak ada baru gunakan selected
  const activeBlock = schedules.find((b) => b.id === (hoveredBlockId || selectedBlockId));
  const activeTag = activeBlock ? tags.find((t) => t.id === activeBlock.tagId) : null;

  // Nilai waktu yang diprioritaskan untuk ditampilkan di layar tengah
  const displayTime = activeDrag
    ? activeDrag.currentMinutes
    : hoveredTimeMinutes !== null
    ? hoveredTimeMinutes
    : currentTimeMinutes;

  const isDragging = activeDrag !== null;

  return (
    <g className="clock-dial pointer-events-none select-none">
      <defs>
        {/* Gradien Dial Luar Terang & Bersih */}
        <radialGradient id="dialBgGradientLight" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="80%" stopColor="#f8fafc" stopOpacity="1" />
          <stop offset="100%" stopColor="#f1f5f9" stopOpacity="1" />
        </radialGradient>

        {/* Gradien Core Tengah Elegan */}
        <radialGradient id="centerCoreGradientLight" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="90%" stopColor="#f8fafc" stopOpacity="1" />
          <stop offset="100%" stopColor="#e2e8f0" stopOpacity="1" />
        </radialGradient>

        {/* Gradien Track Donut Tempat Jadwal */}
        <radialGradient id="donutTrackGradientLight" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.6" />
        </radialGradient>

        {/* Bayangan halus Core Tengah */}
        <filter id="coreDropShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.06" />
        </filter>
      </defs>

      {/* Background Piringan Jam Luar */}
      <circle
        cx={CLOCK_CENTER}
        cy={CLOCK_CENTER}
        r={OUTER_RADIUS + 34}
        fill="url(#dialBgGradientLight)"
        stroke="#e2e8f0"
        strokeWidth="1.5"
      />

      {/* Jalur Donut Dasar Tempat Busur Jadwal Berada */}
      <circle
        cx={CLOCK_CENTER}
        cy={CLOCK_CENTER}
        r={(OUTER_RADIUS + INNER_RADIUS) / 2}
        fill="none"
        stroke="url(#donutTrackGradientLight)"
        strokeWidth={OUTER_RADIUS - INNER_RADIUS}
      />

      {/* Ring Batas Luar Donut */}
      <circle
        cx={CLOCK_CENTER}
        cy={CLOCK_CENTER}
        r={OUTER_RADIUS}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="1.2"
        strokeDasharray="3 3"
      />

      {/* Ring Batas Dalam Donut */}
      <circle
        cx={CLOCK_CENTER}
        cy={CLOCK_CENTER}
        r={INNER_RADIUS}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="1.2"
      />

      {/* Lingkaran Core Tengah (Display Jam Digital & Detail) */}
      <circle
        cx={CLOCK_CENTER}
        cy={CLOCK_CENTER}
        r={CENTER_CORE_RADIUS}
        fill="url(#centerCoreGradientLight)"
        stroke="#e2e8f0"
        strokeWidth="1.5"
        filter="url(#coreDropShadow)"
      />

      {/* Lingkaran Aksen Halus di Dalam Core */}
      <circle
        cx={CLOCK_CENTER}
        cy={CLOCK_CENTER}
        r={CENTER_CORE_RADIUS - 10}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth="1"
      />

      {/* Tampilan Konten di Tengah Core */}
      <g transform={`translate(${CLOCK_CENTER}, ${CLOCK_CENTER})`}>
        {/* Label Status Atas */}
        <text
          x="0"
          y="-42"
          textAnchor="middle"
          fill={isDragging ? '#4f46e5' : activeBlock ? (activeTag?.color || '#4f46e5') : '#64748b'}
          fontSize="11"
          fontWeight="700"
          letterSpacing="1.5"
          className="uppercase transition-colors duration-200"
        >
          {isDragging
            ? 'Menyesuaikan Jadwal'
            : hoveredBlockId
            ? 'Detail Jadwal'
            : selectedBlockId
            ? 'Blok Terpilih'
            : hoveredTimeMinutes !== null
            ? 'Kursor Waktu'
            : 'Waktu Sekarang'}
        </text>

        {/* Jam Digital Utama */}
        <text
          x="0"
          y={activeBlock && !isDragging ? "2" : "6"}
          textAnchor="middle"
          fill="#0f172a"
          fontSize={activeBlock && !isDragging ? "34" : "40"}
          fontWeight="800"
          letterSpacing="-1"
          fontFamily="monospace"
          suppressHydrationWarning
        >
          {activeBlock && !isDragging
            ? `${formatTime(activeBlock.startMinutes)} – ${formatTime(activeBlock.endMinutes)}`
            : formatTime(displayTime)}
        </text>

        {/* Info Tambahan di Bawah Jam */}
        {activeBlock && !isDragging ? (
          <g>
            <text
              x="0"
              y="28"
              textAnchor="middle"
              fill={activeTag?.color || '#334155'}
              fontSize="13"
              fontWeight="700"
            >
              {activeBlock.title.length > 22
                ? activeBlock.title.slice(0, 20) + '…'
                : activeBlock.title}
            </text>
            <text
              x="0"
              y="46"
              textAnchor="middle"
              fill="#64748b"
              fontSize="11"
              fontWeight="600"
            >
              Durasi: {formatDuration(calculateDuration(activeBlock.startMinutes, activeBlock.endMinutes))}
            </text>
          </g>
        ) : (
          <text
            x="0"
            y="36"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11"
            fontWeight="500"
          >
            {isDragging
              ? 'Lepas kursor untuk menyimpan'
              : 'Klik & tarik untuk membuat jadwal'}
          </text>
        )}
      </g>
    </g>
  );
};
