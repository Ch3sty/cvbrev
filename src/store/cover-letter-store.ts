// src/store/cover-letter-store.ts
//
// Sessionsbaserad prefill via direkt sessionStorage. Vi anvander INTE zustand
// persist har for att undvika async rehydration-race - prefillData laggs in
// pa /jobbmatchning innan router.push och lases SYNKRONT pa /skapa-brev vid
// forsta mount.

const PREFILL_KEY = 'jobbcoach-cover-letter-prefill';

export interface CoverLetterPrefillData {
  cvId: string;
  jobDescription: string;
  jobTitle: string;
  company: string;
}

export const coverLetterPrefill = {
  set(data: CoverLetterPrefillData): void {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(PREFILL_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not write cover letter prefill:', e);
    }
  },

  read(): CoverLetterPrefillData | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.sessionStorage.getItem(PREFILL_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as CoverLetterPrefillData;
    } catch (e) {
      console.warn('Could not read cover letter prefill:', e);
      return null;
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.removeItem(PREFILL_KEY);
    } catch (e) {
      console.warn('Could not clear cover letter prefill:', e);
    }
  },

  /**
   * Atomic read-and-clear: vanlig pattern for "consume" av prefill.
   * Anvands av wizarden vid forsta mount sa data ar tillganglig en gang
   * och sen automatiskt rensad infor nasta sessionsanvanding.
   */
  consume(): CoverLetterPrefillData | null {
    const data = this.read();
    if (data) this.clear();
    return data;
  },
};

// Bakatkompatibilitet: behaller useCoverLetterStore-API:t for komponenter
// som redan anvander det, men implementerat ovanpa sessionStorage istallet
// for zustand persist (eftersom zustand persist hade race-conditions vid
// router.push i Next.js 16 / Turbopack).
import { create } from 'zustand';

interface CoverLetterStore {
  prefillData: CoverLetterPrefillData | null;
  setPrefillData: (data: CoverLetterPrefillData) => void;
  clearPrefillData: () => void;
  hasPrefillData: () => boolean;
}

export const useCoverLetterStore = create<CoverLetterStore>((set, get) => ({
  prefillData: null,
  setPrefillData: (data) => {
    coverLetterPrefill.set(data);
    set({ prefillData: data });
  },
  clearPrefillData: () => {
    coverLetterPrefill.clear();
    set({ prefillData: null });
  },
  hasPrefillData: () => get().prefillData !== null,
}));
