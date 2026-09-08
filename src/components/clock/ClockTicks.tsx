'use client';

import React from 'react';
import {
  CLOCK_CENTER,
  TICK_OUTER_RADIUS,
  TICK_INNER_RADIUS,
  LABEL_RADIUS,
} from '@/lib/constants';
import { polarToCartesian } from '@/lib/polar-math';
import { minutesToDegree } from '@/lib/time-utils';

export const ClockTicks: React.FC = () => {
  // 24 Jam
  const hours = Array.from({ length: 24 }, (_, i) => i);
  // Sub-ticks setiap 15 menit (96 interval dalam sehari)
  const quarterHours = Array.from({ length: 96 }, (_, i) => i * 15);

  return (
    <g className="clock-ticks pointer-events-none select-none">
      {/* Sub-ticks halus (setiap 15 & 30 menit) */}
      {quarterHours.map((minutes) => {
        // Abaikan jika bertepatan dengan jam penuh
        if (minutes % 60 === 0) return null;

        const isHalfHour = minutes % 30 === 0;
        const deg = minutesToDegree(minutes);

        const innerR = isHalfHour ? TICK_INNER_RADIUS + 3 : TICK_INNER_RADIUS + 6;
        const outerR = TICK_OUTER_RADIUS;

        const pStart = polarToCartesian(CLOCK_CENTER, CLOCK_CENTER, innerR, deg);
        const pEnd = polarToCartesian(CLOCK_CENTER, CLOCK_CENTER, outerR, deg);

        return (
          <line
            key={`subtick-${minutes}`}
            x1={pStart.x}
            y1={pStart.y}
            x2={pEnd.x}
            y2={pEnd.y}
            stroke={isHalfHour ? '#94a3b8' : '#cbd5e1'}
            strokeWidth={isHalfHour ? 1.2 : 0.8}
            strokeLinecap="round"
          />
        );
      })}

      {/* Tick Utama & Angka Jam (00 - 23) */}
      {hours.map((hour) => {
        const minutes = hour * 60;
        const deg = minutesToDegree(minutes);

        const isMajor = hour % 3 === 0; // 00, 03, 06, 09, 12, 15, 18, 21
        const isCardinal = hour % 6 === 0; // 00, 06, 12, 18

        const innerR = isCardinal ? TICK_INNER_RADIUS - 4 : isMajor ? TICK_INNER_RADIUS - 1 : TICK_INNER_RADIUS + 1;
        const outerR = TICK_OUTER_RADIUS + 1;

        const pStart = polarToCartesian(CLOCK_CENTER, CLOCK_CENTER, innerR, deg);
        const pEnd = polarToCartesian(CLOCK_CENTER, CLOCK_CENTER, outerR, deg);
        const pLabel = polarToCartesian(CLOCK_CENTER, CLOCK_CENTER, LABEL_RADIUS, deg);

        // Pewarnaan kontekstual
        const labelColor = isCardinal
          ? '#0f172a'
          : isMajor
          ? '#334155'
          : '#64748b';

        const formattedHour = String(hour).padStart(2, '0');

        return (
          <g key={`hour-${hour}`}>
            {/* Garis Tick Jam */}
            <line
              x1={pStart.x}
              y1={pStart.y}
              x2={pEnd.x}
              y2={pEnd.y}
              stroke={
                isCardinal
                  ? '#4f46e5'
                  : isMajor
                  ? '#64748b'
                  : '#94a3b8'
              }
              strokeWidth={isCardinal ? 2.5 : isMajor ? 1.6 : 1}
              strokeLinecap="round"
            />

            {/* Label Angka Jam */}
            {(isMajor || hour % 2 === 0) && (
              <text
                x={pLabel.x}
                y={pLabel.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={labelColor}
                fontSize={isCardinal ? '12' : isMajor ? '10.5' : '9.5'}
                fontWeight={isCardinal ? '800' : isMajor ? '700' : '600'}
                fontFamily="monospace"
              >
                {formattedHour}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};
