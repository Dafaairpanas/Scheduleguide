'use client';

import React, { useRef, useState, useEffect } from 'react';
import { CLOCK_SIZE } from '@/lib/constants';
import { getCurrentSystemMinutes } from '@/lib/time-utils';
import { useScheduleStore } from '@/store/useScheduleStore';
import { ClockDial } from './ClockDial';
import { ClockTicks } from './ClockTicks';
import { ScheduleSlices } from './ScheduleSlices';
import { CurrentTimeHand } from './CurrentTimeHand';
import { InteractionOverlay } from './InteractionOverlay';

export const CircularClock: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentMinutes, setCurrentMinutes] = useState<number>(() =>
    typeof window !== 'undefined' ? getCurrentSystemMinutes() : 0
  );
  const setActiveDrag = useScheduleStore((state) => state.setActiveDrag);
  const activeTagId = useScheduleStore((state) => state.activeTagId);

  // Update jarum waktu sistem setiap detik
  useEffect(() => {
    setCurrentMinutes(getCurrentSystemMinutes());
    const timer = setInterval(() => {
      setCurrentMinutes(getCurrentSystemMinutes());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handler saat titik handle resize ditekan
  const handleHandlePointerDown = (
    e: React.PointerEvent,
    blockId: string,
    type: 'START' | 'END'
  ) => {
    const storeState = useScheduleStore.getState();
    const block = storeState.schedules.find((b) => b.id === blockId);
    if (!block) return;

    setActiveDrag({
      mode: type === 'START' ? 'RESIZE_START' : 'RESIZE_END',
      blockId,
      originMinutes: type === 'START' ? block.startMinutes : block.endMinutes,
      initialStart: block.startMinutes,
      initialEnd: block.endMinutes,
      currentMinutes: type === 'START' ? block.startMinutes : block.endMinutes,
      activeTagId: block.tagId || activeTagId,
    });
  };

  return (
    <div className="relative w-full max-w-[560px] aspect-square mx-auto flex items-center justify-center select-none">
      {/* Glow Ambient Lembut di Belakang Jam */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-indigo-100/50 via-sky-100/30 to-rose-100/40 blur-2xl pointer-events-none" />

      <svg
        ref={svgRef}
        viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full drop-shadow-sm overflow-visible relative z-10"
        style={{ touchAction: 'none' }}
      >
        {/* Layer 1: Piringan Dasar Jam & Jam Digital Tengah */}
        <ClockDial currentTimeMinutes={currentMinutes} />

        {/* Layer 2: Penanda Ticks 24 Jam & Angka */}
        <ClockTicks />

        {/* Layer 3: Potongan Busur Jadwal & Handle Tarikan */}
        <ScheduleSlices onHandlePointerDown={handleHandlePointerDown} />

        {/* Layer 4: Jarum Penunjuk Waktu Real-Time Saat Ini */}
        <CurrentTimeHand currentMinutes={currentMinutes} />

        {/* Layer 5: Lapisan Transparan Penangkap Interaksi Pointer */}
        <InteractionOverlay
          svgRef={svgRef}
          onHandlePointerDown={handleHandlePointerDown}
        />
      </svg>
    </div>
  );
};
