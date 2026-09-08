'use client';

import React from 'react';
import {
  CLOCK_CENTER,
  CENTER_CORE_RADIUS,
  TICK_OUTER_RADIUS,
} from '@/lib/constants';
import { polarToCartesian } from '@/lib/polar-math';
import { minutesToDegree } from '@/lib/time-utils';

interface CurrentTimeHandProps {
  currentMinutes: number;
}

export const CurrentTimeHand: React.FC<CurrentTimeHandProps> = ({ currentMinutes }) => {
  const deg = minutesToDegree(currentMinutes);

  const startPoint = polarToCartesian(CLOCK_CENTER, CLOCK_CENTER, CENTER_CORE_RADIUS - 4, deg);
  const endPoint = polarToCartesian(CLOCK_CENTER, CLOCK_CENTER, TICK_OUTER_RADIUS + 4, deg);
  const beaconPoint = polarToCartesian(CLOCK_CENTER, CLOCK_CENTER, TICK_OUTER_RADIUS + 8, deg);

  return (
    <g className="current-time-hand pointer-events-none select-none">
      {/* Garis Bayangan Halus */}
      <line
        x1={startPoint.x}
        y1={startPoint.y}
        x2={endPoint.x}
        y2={endPoint.y}
        stroke="#e11d48"
        strokeWidth="4"
        strokeOpacity="0.15"
        strokeLinecap="round"
      />

      {/* Jarum Penunjuk Utama (Crimson Modern) */}
      <line
        x1={startPoint.x}
        y1={startPoint.y}
        x2={endPoint.x}
        y2={endPoint.y}
        stroke="#e11d48"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Titik Beacon di Tepi Luar Dial */}
      <circle
        cx={beaconPoint.x}
        cy={beaconPoint.y}
        r="4"
        fill="#e11d48"
        className="animate-pulse"
      />
      <circle
        cx={beaconPoint.x}
        cy={beaconPoint.y}
        r="1.5"
        fill="#ffffff"
      />
    </g>
  );
};
