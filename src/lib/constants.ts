import { Tag } from '@/types/tag';
import { ScheduleBlock } from '@/types/schedule';

export const CLOCK_SIZE = 600;
export const CLOCK_CENTER = 300;

// Radial geometry
export const OUTER_RADIUS = 248;
export const INNER_RADIUS = 160;
export const TICK_OUTER_RADIUS = 278;
export const TICK_INNER_RADIUS = 266;
export const LABEL_RADIUS = 289;
export const CENTER_CORE_RADIUS = 135;

export const DEFAULT_TAGS: Tag[] = [
  { id: 'tag-deep-work', name: 'Deep Work', color: '#4f46e5', textColor: '#3730a3', icon: 'Laptop' },
  { id: 'tag-learning', name: 'Belajar & Riset', color: '#059669', textColor: '#065f46', icon: 'BookOpen' },
  { id: 'tag-workout', name: 'Olahraga & Sehat', color: '#ea580c', textColor: '#9a3412', icon: 'Activity' },
  { id: 'tag-rest', name: 'Istirahat & Santai', color: '#e11d48', textColor: '#9f1239', icon: 'Coffee' },
  { id: 'tag-routine', name: 'Rutinitas / Makan', color: '#d97706', textColor: '#92400e', icon: 'Utensils' },
  { id: 'tag-sleep', name: 'Tidur Berkualitas', color: '#7c3aed', textColor: '#5b21b6', icon: 'Moon' },
];

export const DEFAULT_SCHEDULES: ScheduleBlock[] = [
  {
    id: 'block-sleep',
    title: 'Tidur Malam Nyenyak',
    startMinutes: 23 * 60, // 23:00
    endMinutes: 6 * 60,    // 06:00 (spans midnight)
    tagId: 'tag-sleep',
    notes: 'Tanpa layar 30 menit sebelum tidur',
    createdAt: 1,
  },
  {
    id: 'block-morning-routine',
    title: 'Rutinitas Pagi & Sarapan',
    startMinutes: 6 * 60,  // 06:00
    endMinutes: 7 * 60 + 30, // 07:30
    tagId: 'tag-routine',
    notes: 'Minum air putih & sarapan sehat',
    createdAt: 2,
  },
  {
    id: 'block-workout',
    title: 'Jogging / Gym Pagi',
    startMinutes: 7 * 60 + 30, // 07:30
    endMinutes: 8 * 60 + 30,   // 08:30
    tagId: 'tag-workout',
    notes: 'Kardio 30m + peregangan',
    createdAt: 3,
  },
  {
    id: 'block-deep-work-1',
    title: 'Sesi Fokus Pagi (Coding & Arsitektur)',
    startMinutes: 9 * 60,  // 09:00
    endMinutes: 12 * 60,   // 12:00
    tagId: 'tag-deep-work',
    notes: 'Mode DND, selesaikan tugas paling kritis',
    createdAt: 4,
  },
  {
    id: 'block-lunch',
    title: 'Makan Siang & Istirahat',
    startMinutes: 12 * 60, // 12:00
    endMinutes: 13 * 60,   // 13:00
    tagId: 'tag-rest',
    notes: 'Jalan santai dan istirahatkan mata',
    createdAt: 5,
  },
  {
    id: 'block-deep-work-2',
    title: 'Sesi Kolaborasi & Eksekusi',
    startMinutes: 13 * 60 + 30, // 13:30
    endMinutes: 16 * 60 + 30,   // 16:30
    tagId: 'tag-deep-work',
    notes: 'Code review & implementasi fitur',
    createdAt: 6,
  },
  {
    id: 'block-learning',
    title: 'Belajar Teknologi Baru',
    startMinutes: 17 * 60, // 17:00
    endMinutes: 18 * 60 + 30, // 18:30
    tagId: 'tag-learning',
    notes: 'Membaca paper dan bereksperimen',
    createdAt: 7,
  },
  {
    id: 'block-dinner',
    title: 'Makan Malam & Santai Bersama',
    startMinutes: 19 * 60, // 19:00
    endMinutes: 21 * 60,   // 21:00
    tagId: 'tag-routine',
    notes: 'Santai bersama keluarga',
    createdAt: 8,
  },
  {
    id: 'block-wind-down',
    title: 'Wind-down & Baca Buku',
    startMinutes: 21 * 60 + 30, // 21:30
    endMinutes: 23 * 60,        // 23:00
    tagId: 'tag-rest',
    notes: 'Membaca buku non-fiksi',
    createdAt: 9,
  },
];
