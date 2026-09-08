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
 * Mengekspor seluruh jadwal & tag ke dalam file JSON yang dapat diunduh.
 */
export function exportBackupFile(schedules: ScheduleBlock[], tags: Tag[]): void {
  const data: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    schedules,
    tags,
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `schedule-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Memvalidasi dan mengekstrak data dari file JSON yang diunggah.
 */
export function parseBackupFile(jsonString: string): { schedules: ScheduleBlock[]; tags: Tag[] } {
  const parsed = JSON.parse(jsonString);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Format file JSON tidak valid');
  }

  const schedules = Array.isArray(parsed.schedules) ? parsed.schedules : [];
  const tags = Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : DEFAULT_TAGS;

  return { schedules, tags };
}
