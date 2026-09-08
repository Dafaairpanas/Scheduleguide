import { polarToCartesian, getClockwiseAngleDelta } from './polar-math';
import { minutesToDegree } from './time-utils';

export interface ArcSlicePathOptions {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startMinutes: number;
  endMinutes: number;
  insetGapDegrees?: number; // small gap between slices for sleek modern look
}

/**
 * Menghasilkan string SVG path `d` untuk sektor busur donat (donut arc slice).
 * Mendukung penanganan blok waktu normal, blok yang melintasi tengah malam,
 * serta blok 24 jam penuh.
 */
export function createDonutArcPath({
  cx,
  cy,
  innerRadius,
  outerRadius,
  startMinutes,
  endMinutes,
  insetGapDegrees = 0.3,
}: ArcSlicePathOptions): string {
  const startAngleRaw = minutesToDegree(startMinutes);
  const endAngleRaw = minutesToDegree(endMinutes);

  let delta = getClockwiseAngleDelta(startAngleRaw, endAngleRaw);

  // Jika durasi sangat kecil (< 1 menit), jangan render
  if (delta < 0.25) {
    return '';
  }

  // Jika blok mencakup 24 jam penuh (atau mendekati 360°)
  if (delta >= 359.8) {
    return `
      M ${cx} ${cy - outerRadius}
      A ${outerRadius} ${outerRadius} 0 1 1 ${cx} ${cy + outerRadius}
      A ${outerRadius} ${outerRadius} 0 1 1 ${cx} ${cy - outerRadius}
      M ${cx} ${cy - innerRadius}
      A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy + innerRadius}
      A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy - innerRadius}
      Z
    `.replace(/\s+/g, ' ').trim();
  }

  // Terapkan sedikit celah (gap) jika delta mencukupi, agar potongan terlihat terpisah elegan
  const actualGap = delta > 4 ? insetGapDegrees : 0;
  const startAngle = (startAngleRaw + actualGap) % 360;
  const endAngle = (endAngleRaw - actualGap + 360) % 360;
  const activeDelta = delta - actualGap * 2;

  const largeArcFlag = activeDelta > 180 ? 1 : 0;

  // 4 Titik Sudut Busur Donut
  const p1 = polarToCartesian(cx, cy, outerRadius, startAngle);
  const p2 = polarToCartesian(cx, cy, outerRadius, endAngle);
  const p3 = polarToCartesian(cx, cy, innerRadius, endAngle);
  const p4 = polarToCartesian(cx, cy, innerRadius, startAngle);

  return `
    M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}
    A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}
    L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}
    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}
    Z
  `.replace(/\s+/g, ' ').trim();
}

/**
 * Menghitung titik tengah sektor busur donat untuk meletakkan teks judul / ikon.
 */
export function getArcCenterPoint(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startMinutes: number,
  endMinutes: number
) {
  const startAngle = minutesToDegree(startMinutes);
  const delta = getClockwiseAngleDelta(startAngle, minutesToDegree(endMinutes));
  const midAngle = (startAngle + delta / 2) % 360;
  const midRadius = (innerRadius + outerRadius) / 2;

  const point = polarToCartesian(cx, cy, midRadius, midAngle);
  return {
    ...point,
    midAngle,
    deltaDegrees: delta,
  };
}
