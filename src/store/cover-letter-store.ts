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
   *
   * VIKTIGT: Next.js kan mounta samma komponent flera ganger under en
   * navigation (prefetch + hydration, eller layout-remount). Om vi
   * rensar sessionStorage i forsta mounten fastnar vi pa null vid
   * andra mounten.
   *
   * Losning: en module-level cache som halls i minnet for hela tabben
   * livstid. Forsta consume() laser fran sessionStorage OCH cachar i
   * minnet, samtidigt som sessionStorage rensas (sa F5 inte aterhamtar).
   * Efterfoljande consume() returnerar minnescachen.
   *
   * Cache rensas explicit nar wizarden faktiskt borjat anvanda datan,
   * eller automatiskt nar tabben stangs.
   */
  consume(): CoverLetterPrefillData | null {
    if (consumedCache !== undefined) {
      return consumedCache;
    }
    const data = this.read();
    consumedCache = data;
    if (data) this.clear();
    return data;
  },

  /**
   * Rensa minnescachen explicit. Anropas av wizarden nar anvandaren
   * faktiskt borjat anvanda prefill-datan, eller vid avbrutet flow.
   */
  reset(): void {
    consumedCache = undefined;
  },
};

// Module-level cache for att overleva multipla React-mounts under samma
// navigation. undefined = inte konsumerad an, null = konsumerad och tom,
// CoverLetterPrefillData = konsumerad med data.
let consumedCache: CoverLetterPrefillData | null | undefined = undefined;

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
