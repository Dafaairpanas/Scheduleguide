'use client';

import React from 'react';
import { useScheduleStore } from '@/store/useScheduleStore';
import { calculateDuration, formatDuration, MINUTES_IN_DAY } from '@/lib/time-utils';
import { PieChart } from 'lucide-react';

export const TimeBreakdown: React.FC = () => {
  const schedules = useScheduleStore((state) => state.schedules);
  const tags = useScheduleStore((state) => state.tags);

  // Hitung total durasi per tag
  const tagMinutesMap: Record<string, number> = {};
  let totalScheduledMinutes = 0;

  tags.forEach((t) => {
    tagMinutesMap[t.id] = 0;
  });

  schedules.forEach((b) => {
    const dur = calculateDuration(b.startMinutes, b.endMinutes);
    if (tagMinutesMap[b.tagId] !== undefined) {
      tagMinutesMap[b.tagId] += dur;
    } else {
      tagMinutesMap[b.tagId] = dur;
    }
    totalScheduledMinutes += dur;
  });

  const unallocatedMinutes = Math.max(0, MINUTES_IN_DAY - totalScheduledMinutes);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold tracking-wider text-slate-700 uppercase flex items-center gap-2">
          <PieChart className="w-4 h-4 text-indigo-600" />
          Distribusi Alokasi 24 Jam
        </h3>
        <span className="text-xs text-slate-500 font-mono font-semibold">
          {formatDuration(totalScheduledMinutes)} / 24j
        </span>
      </div>

      {/* Bar visualizer persentase 24 jam */}
      <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden flex p-0.5 border border-slate-200 shadow-inner">
        {tags.map((tag) => {
          const minutes = tagMinutesMap[tag.id] || 0;
          if (minutes === 0) return null;
          const pct = (minutes / MINUTES_IN_DAY) * 100;

          return (
            <div
              key={tag.id}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 relative group"
              style={{
                width: `${pct}%`,
                backgroundColor: tag.color,
              }}
              title={`${tag.name}: ${formatDuration(minutes)} (${pct.toFixed(1)}%)`}
            />
          );
        })}

        {unallocatedMinutes > 0 && (
          <div
            className="h-full bg-slate-200/70 rounded-r-full transition-all duration-300"
            style={{ width: `${(unallocatedMinutes / MINUTES_IN_DAY) * 100}%` }}
            title={`Waktu Luang: ${formatDuration(unallocatedMinutes)}`}
          />
        )}
      </div>

      {/* Legend & Breakdown Tiap Kategori */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
        {tags.map((tag) => {
          const minutes = tagMinutesMap[tag.id] || 0;
          const pct = ((minutes / MINUTES_IN_DAY) * 100).toFixed(1);

          return (
            <div
              key={tag.id}
              className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-colors"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: tag.color }}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {tag.name}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                  <span>{formatDuration(minutes)}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-600">{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Waktu Luang */}
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50/60 border border-slate-200/50">
          <span className="w-3 h-3 rounded-full bg-slate-300 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-slate-500 truncate">Waktu Luang</span>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <span>{formatDuration(unallocatedMinutes)}</span>
              <span>•</span>
              <span>{((unallocatedMinutes / MINUTES_IN_DAY) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
