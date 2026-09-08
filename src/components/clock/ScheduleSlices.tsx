'use client';

import React from 'react';
import { CLOCK_CENTER, INNER_RADIUS, OUTER_RADIUS } from '@/lib/constants';
import { createDonutArcPath, getArcCenterPoint } from '@/lib/svg-arc';
import { calculateDuration, formatDuration } from '@/lib/time-utils';
import { useScheduleStore } from '@/store/useScheduleStore';
import { SliceHandle } from './SliceHandle';

interface ScheduleSlicesProps {
  onHandlePointerDown: (e: React.PointerEvent, blockId: string, type: 'START' | 'END') => void;
}

export const ScheduleSlices: React.FC<ScheduleSlicesProps> = ({ onHandlePointerDown }) => {
  const schedules = useScheduleStore((state) => state.schedules);
  const tags = useScheduleStore((state) => state.tags);
  const selectedBlockId = useScheduleStore((state) => state.selectedBlockId);
  const activeDrag = useScheduleStore((state) => state.activeDrag);
  const setSelectedBlockId = useScheduleStore((state) => state.setSelectedBlockId);
  const setEditModalOpen = useScheduleStore((state) => state.setEditModalOpen);
  const hoveredBlockId = useScheduleStore((state) => state.hoveredBlockId);
  const setHoveredBlockId = useScheduleStore((state) => state.setHoveredBlockId);

  return (
    <g className="schedule-slices">
      <defs>
        {/* Filter Elevasi Halus untuk Light Theme */}
        <filter id="sliceElevation" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.12" />
        </filter>
        <filter id="sliceSelectedElevation" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#4f46e5" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Render Setiap Potongan Jadwal */}
      {schedules.map((block) => {
        const isThisBlockDragging =
          activeDrag?.blockId === block.id &&
          (activeDrag.mode === 'RESIZE_START' || activeDrag.mode === 'RESIZE_END' || activeDrag.mode === 'MOVE');

        const startMin = isThisBlockDragging ? activeDrag.initialStart : block.startMinutes;
        const endMin = isThisBlockDragging ? activeDrag.initialEnd : block.endMinutes;

        const tag = tags.find((t) => t.id === block.tagId) || tags[0];
        const isSelected = selectedBlockId === block.id;
        const duration = calculateDuration(startMin, endMin);

        const pathD = createDonutArcPath({
          cx: CLOCK_CENTER,
          cy: CLOCK_CENTER,
          innerRadius: INNER_RADIUS,
          outerRadius: OUTER_RADIUS,
          startMinutes: startMin,
          endMinutes: endMin,
        });

        if (!pathD) return null;

        const centerPoint = getArcCenterPoint(
          CLOCK_CENTER,
          CLOCK_CENTER,
          INNER_RADIUS,
          OUTER_RADIUS,
          startMin,
          endMin
        );

        const delta = centerPoint.deltaDegrees;
        const isWide = delta >= 18; // >= 72 menit
        const isMedium = delta >= 4.5 && delta < 18; // 18 - 72 menit
        const showDuration = delta >= 26;

        const isRightHemisphere = centerPoint.midAngle >= 0 && centerPoint.midAngle < 180;
        const radialRotation = isRightHemisphere
          ? centerPoint.midAngle - 90
          : (centerPoint.midAngle + 90) % 360;

        const isHovered = hoveredBlockId === block.id;

        return (
          <g
            key={block.id}
            className="group cursor-pointer transition-all duration-150"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBlockId(block.id);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setSelectedBlockId(block.id);
              setEditModalOpen(true);
            }}
            onPointerEnter={() => setHoveredBlockId(block.id)}
            onPointerLeave={() => setHoveredBlockId(null)}
          >
            {/* Busur Jadwal (Arc Slice) */}
            <path
              d={pathD}
              fill={tag?.color || '#4f46e5'}
              fillOpacity={isSelected ? 1 : isHovered ? 0.95 : 0.88}
              stroke="#ffffff"
              strokeWidth={isSelected ? 3 : 2}
              strokeLinejoin="round"
              className="transition-all duration-150"
              filter={isSelected ? 'url(#sliceSelectedElevation)' : 'url(#sliceElevation)'}
            />

            {/* 1. Label Horizontal untuk Blok Waktu Lebar (>= 72 Menit) */}
            {isWide && (
              <g
                transform={`translate(${centerPoint.x}, ${centerPoint.y})`}
                className="pointer-events-none select-none"
              >
                <text
                  x="0"
                  y={showDuration ? -4 : 3}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11.5"
                  fontWeight="700"
                  className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                >
                  {block.title.length > 15 ? block.title.slice(0, 13) + '…' : block.title}
                </text>
                {showDuration && (
                  <text
                    x="0"
                    y="11"
                    textAnchor="middle"
                    fill="rgba(255, 255, 255, 0.95)"
                    fontSize="9.5"
                    fontWeight="600"
                    className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                  >
                    {formatDuration(duration)}
                  </text>
                )}
              </g>
            )}

            {/* 2. Label Radial untuk Blok Waktu Sedang (18 - 72 Menit) */}
            {isMedium && (
              <g
                transform={`translate(${centerPoint.x}, ${centerPoint.y}) rotate(${radialRotation})`}
                className="pointer-events-none select-none"
              >
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  fontSize={delta < 7 ? '9' : '10'}
                  fontWeight="700"
                  letterSpacing="0.2"
                  className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
                >
                  {block.title.length > 13 ? block.title.slice(0, 11) + '…' : block.title}
                </text>
              </g>
            )}

            {/* Handle Resize di Kedua Ujung (Hanya untuk blok yang terpilih) */}
            {isSelected && (
              <>
                <SliceHandle
                  minutes={startMin}
                  type="START"
                  color={tag?.color || '#4f46e5'}
                  isSelected={true}
                  onPointerDown={(e) => onHandlePointerDown(e, block.id, 'START')}
                />
                <SliceHandle
                  minutes={endMin}
                  type="END"
                  color={tag?.color || '#4f46e5'}
                  isSelected={true}
                  onPointerDown={(e) => onHandlePointerDown(e, block.id, 'END')}
                />
              </>
            )}
          </g>
        );
      })}

      {/* Preview Potongan Baru Saat Dragging (CREATE MODE) */}
      {activeDrag?.mode === 'CREATE' && (
        (() => {
          const draftTag = tags.find((t) => t.id === activeDrag.activeTagId) || tags[0];
          const draftPath = createDonutArcPath({
            cx: CLOCK_CENTER,
            cy: CLOCK_CENTER,
            innerRadius: INNER_RADIUS,
            outerRadius: OUTER_RADIUS,
            startMinutes: activeDrag.originMinutes,
            endMinutes: activeDrag.currentMinutes,
          });

          if (!draftPath) return null;

          return (
            <path
              d={draftPath}
              fill={draftTag.color}
              fillOpacity={0.75}
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              className="pointer-events-none animate-pulse"
            />
          );
        })()
      )}
    </g>
  );
};
