'use client';

import React, { useRef } from 'react';
import {
  CLOCK_CENTER,
  CLOCK_SIZE,
  INNER_RADIUS,
  OUTER_RADIUS,
} from '@/lib/constants';
import { cartesianToPolar } from '@/lib/polar-math';
import { degreeToMinutes, snapMinutes } from '@/lib/time-utils';
import { useScheduleStore } from '@/store/useScheduleStore';

interface InteractionOverlayProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  onHandlePointerDown: (e: React.PointerEvent, blockId: string, type: 'START' | 'END') => void;
}

export const InteractionOverlay: React.FC<InteractionOverlayProps> = ({
  svgRef,
}) => {
  const snapStep = useScheduleStore((state) => state.snapStep);
  const activeTagId = useScheduleStore((state) => state.activeTagId);
  const activeDrag = useScheduleStore((state) => state.activeDrag);
  const setActiveDrag = useScheduleStore((state) => state.setActiveDrag);
  const setHoveredTimeMinutes = useScheduleStore((state) => state.setHoveredTimeMinutes);
  const setSelectedBlockId = useScheduleStore((state) => state.setSelectedBlockId);
  const setHoveredBlockId = useScheduleStore((state) => state.setHoveredBlockId);
  const schedules = useScheduleStore((state) => state.schedules);
  const addBlock = useScheduleStore((state) => state.addBlock);
  const updateBlock = useScheduleStore((state) => state.updateBlock);
  const tags = useScheduleStore((state) => state.tags);

  const isDraggingRef = useRef(false);

  // Helper mencari blok yang ada di menit tertentu
  const findBlockAtMinutes = (minutes: number) => {
    return schedules.find((b) => {
      if (b.startMinutes === b.endMinutes) return true;
      if (b.endMinutes > b.startMinutes) {
        return minutes >= b.startMinutes && minutes < b.endMinutes;
      }
      return minutes >= b.startMinutes || minutes < b.endMinutes;
    });
  };

  // Helper untuk mendapatkan koordinat pointer terhadap pusat SVG
  const getMinutesFromPointer = (e: React.PointerEvent): { minutes: number; radius: number } | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    // Normalisasi koordinat ke viewBox (0 0 CLOCK_SIZE CLOCK_SIZE)
    const scaleX = CLOCK_SIZE / rect.width;
    const scaleY = CLOCK_SIZE / rect.height;
    const svgX = (clientX - rect.left) * scaleX;
    const svgY = (clientY - rect.top) * scaleY;

    const polar = cartesianToPolar(CLOCK_CENTER, CLOCK_CENTER, svgX, svgY);
    const rawMinutes = degreeToMinutes(polar.angleInDegrees);
    const snapped = snapMinutes(rawMinutes, snapStep);

    return { minutes: snapped, radius: polar.radius };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Hanya tangani klik kiri
    if (e.button !== 0) return;

    const info = getMinutesFromPointer(e);
    if (!info) return;

    // Pastikan klik berada di dalam area aktif cincin jam
    if (info.radius < INNER_RADIUS - 20 || info.radius > OUTER_RADIUS + 30) {
      setSelectedBlockId(null);
      setHoveredBlockId(null);
      return;
    }

    const clickedBlock = findBlockAtMinutes(info.minutes);

    if (clickedBlock) {
      // Jika klik di atas blok yang sudah ada: pilih blok tersebut
      setSelectedBlockId(clickedBlock.id);
      return;
    }

    // Jika klik di area kosong cincin donat: mulai mode pembuatan jadwal baru (CREATE)
    setSelectedBlockId(null);
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;

    setActiveDrag({
      mode: 'CREATE',
      originMinutes: info.minutes,
      initialStart: info.minutes,
      initialEnd: (info.minutes + snapStep) % 1440,
      currentMinutes: (info.minutes + snapStep) % 1440,
      activeTagId,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const info = getMinutesFromPointer(e);
    if (!info) return;

    // Update waktu yang sedang di-hover untuk feedback jam digital tengah
    setHoveredTimeMinutes(info.minutes);

    if (!isDraggingRef.current) {
      // Deteksi blok waktu di bawah pointer untuk tampilan hover
      if (info.radius >= INNER_RADIUS - 10 && info.radius <= OUTER_RADIUS + 15) {
        const found = findBlockAtMinutes(info.minutes);
        setHoveredBlockId(found ? found.id : null);
      } else {
        setHoveredBlockId(null);
      }
      return;
    }

    if (!activeDrag) return;

    // Sedang dalam mode CREATE (membuat blok baru)
    if (activeDrag.mode === 'CREATE') {
      let targetMinutes = info.minutes;
      // Jangan biarkan start dan end sama persis
      if (targetMinutes === activeDrag.originMinutes) {
        targetMinutes = (activeDrag.originMinutes + snapStep) % 1440;
      }
      setActiveDrag({
        ...activeDrag,
        currentMinutes: targetMinutes,
      });
      return;
    }

    // Sedang dalam mode RESIZE_START
    if (activeDrag.mode === 'RESIZE_START' && activeDrag.blockId) {
      updateBlock(
        activeDrag.blockId,
        { startMinutes: info.minutes },
        false // belum commit ke riwayat sampai pointer dilepas
      );
      return;
    }

    // Sedang dalam mode RESIZE_END
    if (activeDrag.mode === 'RESIZE_END' && activeDrag.blockId) {
      updateBlock(
        activeDrag.blockId,
        { endMinutes: info.minutes },
        false
      );
      return;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (!activeDrag) return;

    // Eksekusi pembuatan blok waktu baru
    if (activeDrag.mode === 'CREATE') {
      const start = activeDrag.originMinutes;
      const end = activeDrag.currentMinutes;

      // Jika durasi valid (tidak sama dengan 0)
      if (start !== end) {
        const currentTag = tags.find((t) => t.id === activeTagId) || tags[0];
        addBlock({
          title: currentTag.name,
          startMinutes: start,
          endMinutes: end,
          tagId: activeTagId,
          notes: '',
        });
      }
    }

    // Jika resize selesai, commit ke history undo/redo
    if (
      (activeDrag.mode === 'RESIZE_START' || activeDrag.mode === 'RESIZE_END') &&
      activeDrag.blockId
    ) {
      const storeState = useScheduleStore.getState();
      const block = storeState.schedules.find((b) => b.id === activeDrag.blockId);
      if (block) {
        updateBlock(activeDrag.blockId, {}, true); // commit history
      }
    }

    setActiveDrag(null);
  };

  const handlePointerLeave = () => {
    if (!isDraggingRef.current) {
      setHoveredTimeMinutes(null);
      setHoveredBlockId(null);
    }
  };

  return (
    <circle
      cx={CLOCK_CENTER}
      cy={CLOCK_CENTER}
      r={OUTER_RADIUS + 35}
      fill="transparent"
      className="cursor-crosshair touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    />
  );
};
