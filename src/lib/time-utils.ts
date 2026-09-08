import { SnapInterval } from '@/types/schedule';

export const MINUTES_IN_DAY = 1440; // 24 * 60

/**
 * Mengubah menit dari tengah malam (0 - 1440) menjadi sudut derajat (0 - 360).
 */
export function minutesToDegree(minutes: number): number {
  const normalized = ((minutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  return (normalized / MINUTES_IN_DAY) * 360;
}

/**
 * Mengubah sudut derajat (0 - 360) menjadi menit dalam sehari (0 - 1440).
 */
export function degreeToMinutes(degree: number): number {
  const normalized = ((degree % 360) + 360) % 360;
  return (normalized / 360) * MINUTES_IN_DAY;
}

/**
 * Mengunci nilai menit ke kelipatan step terdekat (Magnetic Snap).
 */
export function snapMinutes(minutes: number, step: SnapInterval): number {
  const snapped = Math.round(minutes / step) * step;
  return ((snapped % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
}

/**
 * Menghitung durasi antara jam mulai dan selesai dalam menit.
 * Mendukung blok waktu yang melintasi tengah malam (misal 23:00 ke 07:00).
 */
export function calculateDuration(startMinutes: number, endMinutes: number): number {
  if (startMinutes === endMinutes) return MINUTES_IN_DAY; // full 24h block
  if (endMinutes > startMinutes) {
    return endMinutes - startMinutes;
  }
  // Crosses midnight: (1440 - start) + end
  return MINUTES_IN_DAY - startMinutes + endMinutes;
}

/**
 * Format menit ke string jam digital "HH:MM" (contoh: 870 -> "14:30").
 */
export function formatTime(minutes: number): string {
  const norm = ((Math.round(minutes) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  const hours = Math.floor(norm / 60);
  const mins = norm % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Format durasi waktu manusiawi (contoh: 90 -> "1j 30m", 45 -> "45m", 120 -> "2j").
 */
export function formatDuration(durationMinutes: number): string {
  if (durationMinutes <= 0) return '0m';
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}j ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}j`;
  }
  return `${mins}m`;
}

/**
 * Mengecek apakah suatu titik menit berada di dalam rentang waktu blok.
 */
export function isMinutesInsideRange(target: number, start: number, end: number): boolean {
  if (start === end) return true; // entire day
  if (end > start) {
    return target >= start && target <= end;
  }
  // Crosses midnight
  return target >= start || target <= end;
}

/**
 * Mengambil menit saat ini berdasarkan waktu lokal sistem.
 */
export function getCurrentSystemMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
}
