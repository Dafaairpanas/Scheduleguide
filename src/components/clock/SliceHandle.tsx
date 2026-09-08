'use client';

import React from 'react';
import { CLOCK_CENTER, INNER_RADIUS, OUTER_RADIUS } from '@/lib/constants';
import { polarToCartesian } from '@/lib/polar-math';
import { minutesToDegree } from '@/lib/time-utils';

interface SliceHandleProps {
  minutes: number;
  type: 'START' | 'END';
  color: string;
  isSelected: boolean;
  onPointerDown: (e: React.PointerEvent, type: 'START' | 'END') => void;
}

export const SliceHandle: React.FC<SliceHandleProps> = ({
  minutes,
  type,
  color,
  isSelected,
  onPointerDown,
}) => {
  const deg = minutesToDegree(minutes);
  const midRadius = (INNER_RADIUS + OUTER_RADIUS) / 2;
  const centerPos = polarToCartesian(CLOCK_CENTER, CLOCK_CENTER, midRadius, deg);
  const outerPos = polarToCartesian(CLOCK_CENTER, CLOCK_CENTER, OUTER_RADIUS + 3, deg);
  const innerPos = polarToCartesian(CLOCK_CENTER, CLOCK_CENTER, INNER_RADIUS - 3, deg);

  return (
    <g
      className="cursor-pointer group select-none transition-transform duration-100"
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDown(e, type);
      }}
    >
      {/* Garis Batas Edge Putih Tegas */}
      <line
        x1={innerPos.x}
        y1={innerPos.y}
        x2={outerPos.x}
        y2={outerPos.y}
        stroke="#ffffff"
        strokeWidth={isSelected ? 2.5 : 1.5}
        strokeLinecap="round"
      />

      {/* Titik Handle Tarikan (Knob Putih Berbingkai Warna Kategori) */}
      <circle
        cx={centerPos.x}
        cy={centerPos.y}
        r={isSelected ? 9 : 7}
        fill="#ffffff"
        stroke={color}
        strokeWidth={3}
        className="transition-all duration-150 group-hover:scale-125 filter drop-shadow-[0_2px_6px_rgba(15,23,42,0.25)]"
      />

      {/* Titik Pusat Knob */}
      <circle
        cx={centerPos.x}
        cy={centerPos.y}
        r={3}
        fill={color}
        className="pointer-events-none"
      />
    </g>
  );
};
