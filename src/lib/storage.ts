import { ScheduleBlock, BackupData, SnapInterval } from '@/types/schedule';
import { Tag } from '@/types/tag';
import { DEFAULT_SCHEDULES, DEFAULT_TAGS } from './constants';

const STORAGE_KEYS = {
  SCHEDULES: 'schedule_builder_blocks_v1',
  TAGS: 'schedule_builder_tags_v1',
  SNAP_STEP: 'schedule_builder_snap_step_v1',
};

/**
 * Menyimpan data jadwal ke LocalStorage browser.
 */
export function saveSchedulesToStorage(schedules: ScheduleBlock[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  } catch (err) {
    console.error('Gagal menyimpan jadwal ke LocalStorage:', err);
  }
}

/**
 * Mengambil data jadwal dari LocalStorage atau default.
 */
export function loadSchedulesFromStorage(): ScheduleBlock[] {
  if (typeof window === 'undefined') return DEFAULT_SCHEDULES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    if (!raw) return DEFAULT_SCHEDULES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCHEDULES;
  } catch (err) {
    console.error('Gagal membaca jadwal dari LocalStorage:', err);
    return DEFAULT_SCHEDULES;
  }
}

/**
 * Menyimpan master tags ke LocalStorage.
 */
export function saveTagsToStorage(tags: Tag[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
  } catch (err) {
    console.error('Gagal menyimpan tags ke LocalStorage:', err);
  }
}

/**
 * Mengambil master tags dari LocalStorage.
 */
export function loadTagsFromStorage(): Tag[] {
  if (typeof window === 'undefined') return DEFAULT_TAGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TAGS);
    if (!raw) return DEFAULT_TAGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TAGS;
  } catch (err) {
    console.error('Gagal membaca tags dari LocalStorage:', err);
    return DEFAULT_TAGS;
  }
}

/**
 * Mengambil setelan snap interval.
 */
export function loadSnapStepFromStorage(): SnapInterval {
  if (typeof window === 'undefined') return 15;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SNAP_STEP);
    if (!raw) return 15;
    const parsed = parseInt(raw, 10);
    return ([5, 10, 15, 30, 60].includes(parsed) ? parsed : 15) as SnapInterval;
  } catch {
    return 15;
  }
}

/**
 * Menyimpan setelan snap interval.
 */
export function saveSnapStepToStorage(step: SnapInterval): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SNAP_STEP, String(step));
  } catch (err) {
    console.error('Gagal menyimpan snap step:', err);
  }
}

/**
 * Menghasilkan string JSON cadangan dari data jadwal dan kategori.
 */
export function generateBackupString(schedules: ScheduleBlock[], tags: Tag[]): string {
  const data: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    schedules,
    tags,
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Menyalin teks ke clipboard perangkat dengan fallback kompatibilitas penuh.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard writeText failed, trying execCommand fallback:', err);
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.error('Semua metode copy ke clipboard gagal:', err);
    return false;
  }
}

/**
 * Memvalidasi dan mengekstrak data jadwal dari string JSON yang ditempel.
 */
export function parseBackupData(rawText: string): { schedules: ScheduleBlock[]; tags: Tag[] } {
  const trimmed = (rawText || '').trim();
  if (!trimmed) {
    throw new Error('Data masih kosong. Silakan tempel kode JSON jadwal terlebih dahulu.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error('Format JSON tidak valid. Pastikan seluruh teks kode tersalin secara lengkap.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Format data tidak sesuai objek cadangan.');
  }

  const record = parsed as Record<string, unknown>;
  let schedulesRaw: unknown[] = [];
  let tags: Tag[] = DEFAULT_TAGS;

  if (Array.isArray(parsed)) {
    schedulesRaw = parsed;
  } else if (Array.isArray(record.schedules)) {
    schedulesRaw = record.schedules;
    if (Array.isArray(record.tags) && record.tags.length > 0) {
      tags = record.tags as Tag[];
    }
  } else {
    throw new Error('Format data tidak memuat struktur jadwal ChronoCircle yang valid.');
  }

  // Validasi dan normalisasi tiap blok jadwal
  const validSchedules: ScheduleBlock[] = schedulesRaw
    .filter((s): s is Record<string, unknown> => {
      return (
        s !== null &&
        typeof s === 'object' &&
        typeof (s as Record<string, unknown>).title === 'string' &&
        typeof (s as Record<string, unknown>).startMinutes === 'number' &&
        typeof (s as Record<string, unknown>).endMinutes === 'number'
      );
    })
    .map((s) => ({
      id: typeof s.id === 'string' && s.id ? s.id : 'block-' + Math.random().toString(36).substring(2, 9),
      title: String(s.title),
      startMinutes: Number(s.startMinutes),
      endMinutes: Number(s.endMinutes),
      tagId: typeof s.tagId === 'string' ? s.tagId : tags[0]?.id || DEFAULT_TAGS[0].id,
      notes: typeof s.notes === 'string' ? s.notes : undefined,
      createdAt: typeof s.createdAt === 'number' ? s.createdAt : Date.now(),
    }));

  if (validSchedules.length === 0 && schedulesRaw.length > 0) {
    throw new Error('Tidak ada blok jadwal yang valid di dalam data.');
  }

  return { schedules: validSchedules, tags };
}

/**
 * Mengekspor seluruh jadwal & tag ke dalam file JSON yang dapat diunduh (opsi opsional).
 */
export function exportBackupFile(schedules: ScheduleBlock[], tags: Tag[]): void {
  const json = generateBackupString(schedules, tags);
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(json)}`;
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `schedule-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Memvalidasi dan mengekstrak data dari file JSON yang diunggah (kompatibilitas).
 */
export function parseBackupFile(jsonString: string): { schedules: ScheduleBlock[]; tags: Tag[] } {
  return parseBackupData(jsonString);
}

