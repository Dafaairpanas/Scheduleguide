import { create } from 'zustand';
import { ScheduleBlock, SnapInterval, DragState } from '@/types/schedule';
import { Tag } from '@/types/tag';
import { DEFAULT_TAGS, DEFAULT_SCHEDULES } from '@/lib/constants';
import {
  loadSchedulesFromStorage,
  saveSchedulesToStorage,
  loadTagsFromStorage,
  saveTagsToStorage,
  loadSnapStepFromStorage,
  saveSnapStepToStorage,
} from '@/lib/storage';

interface ScheduleStoreState {
  schedules: ScheduleBlock[];
  tags: Tag[];
  snapStep: SnapInterval;
  selectedBlockId: string | null;
  activeTagId: string;
  isEditModalOpen: boolean;
  isTagManagerOpen: boolean;
  isBackupModalOpen: boolean;
  hoveredTimeMinutes: number | null;
  hoveredBlockId: string | null;
  activeDrag: DragState | null;

  // History for Undo & Redo
  historyPast: ScheduleBlock[][];
  historyFuture: ScheduleBlock[][];

  // Actions
  initialize: () => void;
  setSelectedBlockId: (id: string | null) => void;
  setActiveTagId: (id: string) => void;
  setSnapStep: (step: SnapInterval) => void;
  setEditModalOpen: (open: boolean) => void;
  setTagManagerOpen: (open: boolean) => void;
  setBackupModalOpen: (open: boolean) => void;
  setHoveredTimeMinutes: (minutes: number | null) => void;
  setHoveredBlockId: (id: string | null) => void;
  setActiveDrag: (drag: DragState | null) => void;

  // Schedules CRUD
  addBlock: (block: Omit<ScheduleBlock, 'id' | 'createdAt'>) => string;
  updateBlock: (id: string, updates: Partial<ScheduleBlock>, commitToHistory?: boolean) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  clearAllSchedules: () => void;
  resetToDefault: () => void;

  // Tags CRUD
  addTag: (tag: Omit<Tag, 'id'>) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;

  // History Actions
  undo: () => void;
  redo: () => void;

  // Bulk Import
  importBackup: (schedules: ScheduleBlock[], tags: Tag[]) => void;
}

const MAX_HISTORY = 25;

export const useScheduleStore = create<ScheduleStoreState>((set, get) => ({
  schedules: DEFAULT_SCHEDULES,
  tags: DEFAULT_TAGS,
  snapStep: 15,
  selectedBlockId: null,
  activeTagId: DEFAULT_TAGS[0].id,
  isEditModalOpen: false,
  isTagManagerOpen: false,
  isBackupModalOpen: false,
  hoveredTimeMinutes: null,
  hoveredBlockId: null,
  activeDrag: null,

  historyPast: [],
  historyFuture: [],

  initialize: () => {
    const schedules = loadSchedulesFromStorage();
    const tags = loadTagsFromStorage();
    const snapStep = loadSnapStepFromStorage();
    set({
      schedules,
      tags,
      snapStep,
      activeTagId: tags[0]?.id || DEFAULT_TAGS[0].id,
    });
  },

  setSelectedBlockId: (id) => set({ selectedBlockId: id }),
  setActiveTagId: (id) => set({ activeTagId: id }),
  setSnapStep: (step) => {
    saveSnapStepToStorage(step);
    set({ snapStep: step });
  },
  setEditModalOpen: (open) => set({ isEditModalOpen: open }),
  setTagManagerOpen: (open) => set({ isTagManagerOpen: open }),
  setBackupModalOpen: (open) => set({ isBackupModalOpen: open }),
  setHoveredTimeMinutes: (minutes) => set({ hoveredTimeMinutes: minutes }),
  setHoveredBlockId: (id) => set({ hoveredBlockId: id }),
  setActiveDrag: (drag) => set({ activeDrag: drag }),

  addBlock: (newBlockData) => {
    const state = get();
    const newBlock: ScheduleBlock = {
      ...newBlockData,
      id: 'block-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36),
      createdAt: Date.now(),
    };

    const newSchedules = [...state.schedules, newBlock];
    saveSchedulesToStorage(newSchedules);

    set({
      schedules: newSchedules,
      selectedBlockId: newBlock.id,
      historyPast: [...state.historyPast.slice(-MAX_HISTORY), state.schedules],
      historyFuture: [],
    });

    return newBlock.id;
  },

  updateBlock: (id, updates, commitToHistory = true) => {
    const state = get();
    const index = state.schedules.findIndex((b) => b.id === id);
    if (index === -1) return;

    const currentBlock = state.schedules[index];
    const updatedBlock = { ...currentBlock, ...updates };
    const newSchedules = [...state.schedules];
    newSchedules[index] = updatedBlock;

    saveSchedulesToStorage(newSchedules);

    set({
      schedules: newSchedules,
      historyPast: commitToHistory
        ? [...state.historyPast.slice(-MAX_HISTORY), state.schedules]
        : state.historyPast,
      historyFuture: commitToHistory ? [] : state.historyFuture,
    });
  },

  deleteBlock: (id) => {
    const state = get();
    const newSchedules = state.schedules.filter((b) => b.id !== id);
    saveSchedulesToStorage(newSchedules);

    set({
      schedules: newSchedules,
      selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
      isEditModalOpen: state.selectedBlockId === id ? false : state.isEditModalOpen,
      historyPast: [...state.historyPast.slice(-MAX_HISTORY), state.schedules],
      historyFuture: [],
    });
  },

  duplicateBlock: (id) => {
    const state = get();
    const block = state.schedules.find((b) => b.id === id);
    if (!block) return;

    const duration = block.endMinutes >= block.startMinutes
      ? block.endMinutes - block.startMinutes
      : 1440 - block.startMinutes + block.endMinutes;

    const newStart = (block.endMinutes + 15) % 1440;
    const newEnd = (newStart + duration) % 1440;

    const cloned: ScheduleBlock = {
      ...block,
      id: 'block-' + Math.random().toString(36).substring(2, 9),
      title: `${block.title} (Salinan)`,
      startMinutes: newStart,
      endMinutes: newEnd,
      createdAt: Date.now(),
    };

    const newSchedules = [...state.schedules, cloned];
    saveSchedulesToStorage(newSchedules);

    set({
      schedules: newSchedules,
      selectedBlockId: cloned.id,
      historyPast: [...state.historyPast.slice(-MAX_HISTORY), state.schedules],
      historyFuture: [],
    });
  },

  clearAllSchedules: () => {
    const state = get();
    saveSchedulesToStorage([]);
    set({
      schedules: [],
      selectedBlockId: null,
      historyPast: [...state.historyPast.slice(-MAX_HISTORY), state.schedules],
      historyFuture: [],
    });
  },

  resetToDefault: () => {
    saveSchedulesToStorage(DEFAULT_SCHEDULES);
    saveTagsToStorage(DEFAULT_TAGS);
    set({
      schedules: DEFAULT_SCHEDULES,
      tags: DEFAULT_TAGS,
      selectedBlockId: null,
      historyPast: [],
      historyFuture: [],
    });
  },

  addTag: (newTagData) => {
    const state = get();
    const newTag: Tag = {
      ...newTagData,
      id: 'tag-' + Math.random().toString(36).substring(2, 8),
    };
    const newTags = [...state.tags, newTag];
    saveTagsToStorage(newTags);
    set({ tags: newTags });
  },

  updateTag: (id, updates) => {
    const state = get();
    const newTags = state.tags.map((t) => (t.id === id ? { ...t, ...updates } : t));
    saveTagsToStorage(newTags);
    set({ tags: newTags });
  },

  deleteTag: (id) => {
    const state = get();
    if (state.tags.length <= 1) return; // minimal 1 tag
    const newTags = state.tags.filter((t) => t.id !== id);
    saveTagsToStorage(newTags);

    // Ubah jadwal yang mengacu ke tag ini ke tag pertama
    const fallbackTagId = newTags[0].id;
    const newSchedules = state.schedules.map((s) =>
      s.tagId === id ? { ...s, tagId: fallbackTagId } : s
    );
    saveSchedulesToStorage(newSchedules);

    set({
      tags: newTags,
      schedules: newSchedules,
      activeTagId: state.activeTagId === id ? fallbackTagId : state.activeTagId,
    });
  },

  undo: () => {
    const { historyPast, historyFuture, schedules } = get();
    if (historyPast.length === 0) return;

    const previous = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, -1);

    saveSchedulesToStorage(previous);
    set({
      schedules: previous,
      historyPast: newPast,
      historyFuture: [schedules, ...historyFuture],
    });
  },

  redo: () => {
    const { historyPast, historyFuture, schedules } = get();
    if (historyFuture.length === 0) return;

    const next = historyFuture[0];
    const newFuture = historyFuture.slice(1);

    saveSchedulesToStorage(next);
    set({
      schedules: next,
      historyPast: [...historyPast, schedules],
      historyFuture: newFuture,
    });
  },

  importBackup: (newSchedules, newTags) => {
    saveSchedulesToStorage(newSchedules);
    saveTagsToStorage(newTags);
    set({
      schedules: newSchedules,
      tags: newTags,
      selectedBlockId: null,
      historyPast: [],
      historyFuture: [],
    });
  },
}));
