export interface ScheduleBlock {
  id: string;
  title: string;
  startMinutes: number; // 0 to 1439 (minutes from 00:00)
  endMinutes: number;   // 0 to 1439 (if endMinutes < startMinutes, it spans across midnight)
  tagId: string;
  notes?: string;
  createdAt: number;
}

export type SnapInterval = 5 | 10 | 15 | 30 | 60;

export type DragMode = 'CREATE' | 'MOVE' | 'RESIZE_START' | 'RESIZE_END' | null;

export interface DragState {
  mode: DragMode;
  blockId?: string;
  originMinutes: number;      // pointer down position in minutes
  initialStart: number;       // initial block startMinutes
  initialEnd: number;         // initial block endMinutes
  currentMinutes: number;     // live pointer position in minutes
  activeTagId: string;        // tag used when creating new slice
}

export interface BackupData {
  version: number;
  exportedAt: string;
  schedules: ScheduleBlock[];
  tags: import('./tag').Tag[];
}
