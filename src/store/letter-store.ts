// src/store/letter-store.ts
import { create } from 'zustand';

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
  /** Sätts av GET /api/letters: gratisanvändare har bara de 2 senast
   *  sparade breven aktiva — resten är låsta tills Premium eller borttag. */
  isLocked?: boolean;
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

interface LetterState {
  letters: Letter[];
  currentLetter: Letter | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  
  // Åtgärder
  fetchLetters: (savedOnly?: boolean) => Promise<void>;
  fetchLetter: (id: string) => Promise<void>;
  generateLetter: (params: LetterGenerationParams) => Promise<Letter | null>;
  updateLetter: (id: string, updates: LetterUpdateParams) => Promise<boolean>;
  deleteLetter: (id: string) => Promise<boolean>;
}

export const useLetterStore = create<LetterState>((set, get) => ({
  letters: [],
  currentLetter: null,
  isLoading: false,
  isGenerating: false,
  error: null,
  
  // Hämta alla brev för användaren
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
      
      const { data } = await response.json();
      set({ letters: data, isLoading: false });
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
}));