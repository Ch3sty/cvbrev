// src/store/cover-letter-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

// Persist via sessionStorage så prefill överlever även hård navigation
// fran jobbmatchning -> skapa-brev. Storen rensas automatiskt nar
// sessionen avslutas (stang flik), och clearPrefillData() koras explicit
// efter att wizarden lasur datan.
export const useCoverLetterStore = create<CoverLetterStore>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'cover-letter-prefill',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.sessionStorage : (undefined as any)
      ),
    }
  )
);
