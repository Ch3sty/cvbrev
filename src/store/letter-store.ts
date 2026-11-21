// src/store/letter-store.ts
import { create } from 'zustand';
import type { BrevKrav } from '@/lib/letters/brevmall/typer';
import type { BrevKvot } from '@/lib/letters/brevKvot';

// Konstanter för cachning och prestanda
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuter
const REQUEST_TIMEOUT = 30 * 1000; // 30 sekunder

// Spåra om ett genereringsanrop pågår
let isGenerationInProgress = false;
let generationTimeoutId: NodeJS.Timeout | null = null;

/**
 * Säker fetch-funktion med timeout och felhantering
 */
async function safeFetch(url: string, options: RequestInit = {}, timeout = REQUEST_TIMEOUT): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ) as Promise<Response>
  ]);
}

/**
 * Fetch med återförsök vid tillfälliga fel
 */
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
  try {
    return await safeFetch(url, options);
  } catch (error) {
    if (retries <= 0) throw error;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return fetchWithRetry(url, options, retries - 1);
  }
}

export interface Letter {
  id: string;
  user_id: string;
  title: string | null;
  company: string | null;
  job_title: string | null;
  content: string;
  tonality: string | null;
  template_id: string | null; // Mall-ID för brevet
  job_description: string | null;
  cv_text: string | null;
  is_saved: boolean | null;
  cv_path: string | null;
  created_at: string | null;
  updated_at: string | null;
  language?: string | null;
  cv_id?: string | null;
  /** Brevrummet (migreringen 20261121130000_brev_rummet.sql). Källan för brevet:
   *  styckena som ren text. Null på gamla brev tills första ändringen. */
  body_stycken?: string[] | null;
  /** Hälsningsraden, null = mallens förval. */
  halsning?: string | null;
  mottagare_person?: string | null;
  /** CV-mallens id. Null = gammalt brev i en av de sex gamla mallarna (template_id). */
  mall_id?: string | null;
  /** Typsnittets id, null = mallens eget. */
  font_id?: string | null;
  /** Sparade krav (BrevKrav[]). Null = inte läst, [] = inget kravmått. Citaten
   *  kan ha fallit bort ur texten: använd kravTraffar/kravForBrev för träffarna. */
  krav?: BrevKrav[] | null;
  forberett_at?: string | null;
  forberett_som?: 'kopierat' | 'nedladdat' | null;
  /** Sätts av listan och brevets rutter: de två senast uppdaterade breven är
   *  öppna på gratisnivån, övriga låsta (src/lib/letters/lista.ts). */
  isLocked?: boolean;
  /** Kraven med träffar omräknade mot texten (sätts av rutterna). */
  kravTraffar?: BrevKrav[] | null;
  /** Datum då brevet markerades som sökt (sätts av listan och GET [id]). */
  soktDatum?: string | null;
  ansokanId?: string | null;
}

interface LetterGenerationParams {
  cv_id: string;
  job_description: string;
  tonality: string;
  language?: string; // Lägg till språkparameter här
  template_id?: string; // Mall-ID för brevgenerering
}

interface LetterUpdateParams {
  title?: string;
  company?: string;
  job_title?: string;
  content?: string;
  is_saved?: boolean;
}

/**
 * Ändringar utan AI och utan kvot (PUT /api/letters/[id]). Alla fält valfria;
 * null tömmer (hälsning till mallens förval, typsnitt till mallens eget).
 */
export interface BrevAndringParams {
  stycken?: string[];
  halsning?: string | null;
  mall_id?: string;
  font_id?: string | null;
  title?: string | null;
  company?: string | null;
  job_title?: string | null;
  mottagare_person?: string | null;
}

/**
 * Fel från brevets rutter, med koden vyerna styr på:
 * letter_locked (403), premium_required (402, sparr 'mall' | 'typsnitt' | 'ton'),
 * quota_exceeded (429, nextResetAt), name_required (422), invalid_field (400),
 * annons_saknas / cv_saknas / krav_saknas (409), network_error.
 */
export class BrevFel extends Error {
  code: string;
  status: number | null;
  payload: Record<string, any>;
  constructor(message: string, code: string, status: number | null, payload: Record<string, any> = {}) {
    super(message);
    this.code = code;
    this.status = status;
    this.payload = payload;
  }
}

async function brevAnrop<T = any>(url: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await safeFetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    throw new BrevFel(error?.message || 'Nätverksfel', 'network_error', null);
  }
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new BrevFel(json.message || json.error || 'Något gick fel', json.code || json.error || 'error', response.status, json);
  }
  return json as T;
}

interface LetterState {
  letters: Letter[];
  currentLetter: Letter | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  /** Veckokvoten från senaste listhämtning, generering eller omskrivning. */
  kvot: BrevKvot | null;
  harBetalt: boolean | null;
  
  // Åtgärder
  fetchLetters: (savedOnly?: boolean) => Promise<void>;
  fetchLetter: (id: string) => Promise<void>;
  generateLetter: (params: LetterGenerationParams) => Promise<Letter | null>;
  updateLetter: (id: string, updates: LetterUpdateParams) => Promise<boolean>;
  deleteLetter: (id: string) => Promise<boolean>;
  /** Autospar: PUT utan AI. Kastar BrevFel; uppdaterar listan och currentLetter. */
  sparaBrev: (id: string, andring: BrevAndringParams) => Promise<Letter>;
  /** Skriv om i ny ton eller nytt språk. Drar kvot. Kastar BrevFel. */
  skrivOmBrev: (id: string, val: { tonality?: string; language?: 'sv' | 'en' }) => Promise<Letter>;
  /** Kopierat eller nedladdat första gången. */
  markeraForberett: (id: string, som: 'kopierat' | 'nedladdat') => Promise<void>;
  /** "Lägg till i brevet" för ett saknat krav. Kastar BrevFel. */
  laggTillKravMening: (id: string, val: { kravIndex: number; mening: string; stycke?: number }) => Promise<Letter>;
}

function ersattBrev(state: LetterState, brev: Letter): Partial<LetterState> {
  return {
    letters: state.letters.map((l) => (l.id === brev.id ? { ...l, ...brev } : l)),
    currentLetter: state.currentLetter?.id === brev.id ? { ...state.currentLetter, ...brev } : state.currentLetter,
  };
}

export const useLetterStore = create<LetterState>((set, get) => ({
  letters: [],
  currentLetter: null,
  isLoading: false,
  isGenerating: false,
  error: null,
  kvot: null,
  harBetalt: null,
  
  // Hämta alla brev för användaren. Listan är Dina brev (avdubblad, med lås);
  // savedOnly finns kvar i signaturen men servern filtrerar inte längre.
  fetchLetters: async (savedOnly = false) => {
    // Om laddning redan pågår, avbryt
    if (get().isLoading) return;
    
    set({ isLoading: true, error: null });
    
    try {
      const queryParams = savedOnly ? '?saved=true' : '';
      const response = await safeFetch(`/api/letters${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte hämta brev');
      }
      
      const { data, kvot, harBetalt } = await response.json();
      set({ letters: data, isLoading: false, kvot: kvot ?? null, harBetalt: harBetalt ?? null });
    } catch (error: any) {
      console.error('Error fetching letters:', error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  // Hämta ett specifikt brev med ID
  fetchLetter: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await safeFetch(`/api/letters/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte hämta brevet');
      }
      
      const { data } = await response.json();
      set({ currentLetter: data, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching letter:', error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  // Generera ett nytt brev med AI - med förbättrad hantering för att förhindra dubblettanrop
  generateLetter: async (params: LetterGenerationParams) => {
    // Kontrollera om generering redan pågår för att förhindra dubblettanrop
    if (isGenerationInProgress || get().isGenerating) {
      console.log('Brevgenerering pågår redan, avbryter dubblett-begäran');
      return null;
    }
    
    // Sätt globala flaggor för att förhindra ytterligare anrop
    isGenerationInProgress = true;
    set({ isGenerating: true, error: null });
    
    // Sätt en säkerhetstimer för att återställa flaggor vid timeout
    if (generationTimeoutId) {
      clearTimeout(generationTimeoutId);
    }
    generationTimeoutId = setTimeout(() => {
      isGenerationInProgress = false;
      set({ isGenerating: false });
      console.log('Brevgenerering timed out, återställer status');
    }, REQUEST_TIMEOUT);
    
    try {
      const response = await fetchWithRetry('/api/letters/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte generera brev');
      }
      
      const { data } = await response.json();
      
      // Uppdatera lokalt state
      set((state) => ({
        letters: [data, ...state.letters],
        currentLetter: data,
        isGenerating: false,
      }));
      
      return data;
    } catch (error: any) {
      console.error('Error generating letter:', error);
      set({ error: error.message, isGenerating: false });
      return null;
    } finally {
      // Återställ flaggor oavsett resultat
      isGenerationInProgress = false;
      if (generationTimeoutId) {
        clearTimeout(generationTimeoutId);
        generationTimeoutId = null;
      }
    }
  },
  
  // Uppdatera ett befintligt brev
  updateLetter: async (id: string, updates: LetterUpdateParams) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await safeFetch(`/api/letters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte uppdatera brevet');
      }
      
      const { data } = await response.json();
      
      // Uppdatera lokalt state
      set((state) => ({
        letters: state.letters.map((letter) => 
          letter.id === id ? { ...letter, ...data } : letter
        ),
        currentLetter: state.currentLetter?.id === id 
          ? { ...state.currentLetter, ...data } 
          : state.currentLetter,
        isLoading: false,
      }));
      
      return true;
    } catch (error: any) {
      console.error('Error updating letter:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
  
  // Ta bort ett brev
  deleteLetter: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await safeFetch(`/api/letters/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte ta bort brevet');
      }
      
      // Uppdatera lokalt state
      set((state) => ({
        letters: state.letters.filter((letter) => letter.id !== id),
        currentLetter: state.currentLetter?.id === id ? null : state.currentLetter,
        isLoading: false,
      }));
      
      return true;
    } catch (error: any) {
      console.error('Error deleting letter:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  sparaBrev: async (id, andring) => {
    const { data } = await brevAnrop<{ data: Letter }>(`/api/letters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(andring),
    });
    set((state) => ersattBrev(state, data));
    return data;
  },

  skrivOmBrev: async (id, val) => {
    const { data, kvot } = await brevAnrop<{ data: Letter; kvot: BrevKvot }>(`/api/letters/${id}/skriv-om`, {
      method: 'POST',
      body: JSON.stringify(val),
    });
    set((state) => ({ ...ersattBrev(state, data), kvot: kvot ?? state.kvot }));
    return data;
  },

  markeraForberett: async (id, som) => {
    const { data } = await brevAnrop<{ data: { forberett_at: string; forberett_som: Letter['forberett_som'] } }>(
      `/api/letters/${id}/forberett`,
      { method: 'POST', body: JSON.stringify({ som }) }
    );
    set((state) => {
      const fore = state.letters.find((l) => l.id === id) ?? (state.currentLetter?.id === id ? state.currentLetter : null);
      return fore ? ersattBrev(state, { ...fore, ...data }) : {};
    });
  },

  laggTillKravMening: async (id, val) => {
    const { data } = await brevAnrop<{ data: Letter }>(`/api/letters/${id}/krav`, {
      method: 'POST',
      body: JSON.stringify(val),
    });
    set((state) => ersattBrev(state, data));
    return data;
  },
}));
