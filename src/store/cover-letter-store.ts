// src/store/cover-letter-store.ts
import { create } from 'zustand';

interface CoverLetterPrefillData {
  cvId: string;
  jobDescription: string;
  jobTitle: string;
  company: string;
}

interface CoverLetterStore {
  prefillData: CoverLetterPrefillData | null;

  setPrefillData: (data: CoverLetterPrefillData) => void;
  clearPrefillData: () => void;
  hasPrefillData: () => boolean;
}

export const useCoverLetterStore = create<CoverLetterStore>((set, get) => ({
  prefillData: null,

  setPrefillData: (data: CoverLetterPrefillData) => {
    set({ prefillData: data });
  },

  clearPrefillData: () => {
    set({ prefillData: null });
  },

  hasPrefillData: () => {
    return get().prefillData !== null;
  },
}));
