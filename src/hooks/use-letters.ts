// src/hooks/use-letters.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLetterStore, Letter } from '@/store/letter-store';

interface GenerateLetterParams {
  cv_id: string;
  job_description: string;
  tonality: string;
  language?: string; // Ny parameter för språkval
  save?: boolean; // Parameter för att ange om brevet ska sparas direkt
}

interface UpdateLetterParams {
  title?: string;
  company?: string;
  job_title?: string;
  content?: string;
  is_saved?: boolean;
}

// Cache-system för att förhindra dubblettanrop
const requestCache = new Map<string, { timestamp: number, promise: Promise<any> }>();

// För att spåra pågående genereringar
const activeGenerations = new Map<string, Promise<any>>();

// Tid i millisekunder innan en cachad förfrågan anses vara gammal (5 minuter)
const CACHE_MAX_AGE = 5 * 60 * 1000;

/**
 * Hjälpfunktion för att hantera datahämtning med caching
 */
function createCachedFetcher<T, P extends any[]>(
  fetcher: (...args: P) => Promise<T>,
  getCacheKey: (...args: P) => string,
  maxAge = CACHE_MAX_AGE
) {
  return (...args: P): Promise<T> => {
    const cacheKey = getCacheKey(...args);
    const now = Date.now();
    
    // Kontrollera om en cachad version finns och inte är för gammal
    const cached = requestCache.get(cacheKey);
    if (cached && (now - cached.timestamp < maxAge)) {
      return cached.promise;
    }
    
    // Skapa en ny förfrågan och cacha den
    const promise = fetcher(...args);
    requestCache.set(cacheKey, { timestamp: now, promise });
    
    // Ta bort från cachen när förfrågan är klar (oavsett resultat)
    promise.finally(() => {
      setTimeout(() => {
        if (requestCache.get(cacheKey)?.timestamp === now) {
          requestCache.delete(cacheKey);
        }
      }, 1000);
    });
    
    return promise;
  };
}

export const useLetters = () => {
  const {
    letters,
    currentLetter,
    isLoading,
    isGenerating,
    error,
    fetchLetters: storeFetchLetters,
    fetchLetter: storeFetchLetter,
    generateLetter: storeGenerateLetter,
    updateLetter: storeUpdateLetter,
    deleteLetter: storeDeleteLetter
  } = useLetterStore();
  
  // Använd en ref för att spåra monteringsstatus
  const isMountedRef = useRef(true);
  
  // Refs för att spåra pågående förfrågningar
  const fetchingLettersRef = useRef(false);
  const fetchingLetterRef = useRef<Record<string, boolean>>({});
  const generatingLetterRef = useRef(false);
  
  // Force-fetch state
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Skapa cachelagring för API-anrop med cache=false option
  const fetchLettersWithOptions = async (savedOnly = false, useCache = true) => {
    // Om laddning redan pågår och vi inte tvingar uppdatering, avbryt
    if (fetchingLettersRef.current && useCache) return;
    
    fetchingLettersRef.current = true;
    
    try {
      // Direkt anrop utan caching om useCache=false
      await storeFetchLetters(savedOnly);
      return letters;
    } catch (error) {
      console.error('Error fetching letters:', error);
      throw error;
    } finally {
      fetchingLettersRef.current = false;
    }
  };
  
  // Memoizera funktionerna för att förhindra oändliga rerenderingar
  const memoizedFetchLetters = useCallback(async (savedOnly = false, useCache = true) => {
    // Förhindra anrop om komponenten avmonterats
    if (!isMountedRef.current) return Promise.resolve();
    
    return fetchLettersWithOptions(savedOnly, useCache);
  }, [letters, forceUpdate]);
  
  const memoizedGetLetter = useCallback(async (id: string) => {
    // Förhindra anrop om komponenten avmonterats eller redan hämtar detta ID
    if (!isMountedRef.current || fetchingLetterRef.current[id] || !id) return Promise.resolve(null);
    
    fetchingLetterRef.current[id] = true;
    
    try {
      await storeFetchLetter(id);
      return currentLetter;
    } finally {
      if (isMountedRef.current) {
        fetchingLetterRef.current[id] = false;
      }
    }
  }, [currentLetter, storeFetchLetter]);
  
  // Uppdaterad createLetter-funktion med språkstöd
  const createLetter = useCallback(async (params: GenerateLetterParams) => {
    if (!isMountedRef.current) return null;
    
    // Förhindra dubblettanrop om generering redan pågår
    if (generatingLetterRef.current || isGenerating) {
      console.log('Förhindrar dubblett brevgenerering, en generering pågår redan');
      return null;
    }
    
    // Markera att generering pågår
    generatingLetterRef.current = true;
    
    try {
      console.log('Genererar brev med parametrar:', params);
      
      // Om save-parametern är false, använd en anpassad funktion för att bara generera innehållet
      if (params.save === false) {
        // Detta API-anrop skulle generera brevet utan att spara det i databasen
        const response = await fetch('/api/letters/generate-preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cv_id: params.cv_id,
            job_description: params.job_description,
            tonality: params.tonality,
            language: params.language || 'sv' // Skicka med språket
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Kunde inte generera brevförhandsvisning');
        }
        
        const data = await response.json();
        console.log('API svar:', data);
        return data.data;
      }
      
      // Annars, använd det befintliga API-anropet för att spara direkt
      const generatedLetter = await storeGenerateLetter({
        cv_id: params.cv_id,
        job_description: params.job_description,
        tonality: params.tonality,
        language: params.language || 'sv' // Skicka med språket
      });
      
      // Efter framgångsrik generering, uppdatera brevlistan
      await memoizedFetchLetters(true, false);
      
      return generatedLetter;
    } catch (error) {
      console.error('Error generating letter:', error);
      return null;
    } finally {
      // Säkerställ att genereringsflaggan återställs
      generatingLetterRef.current = false;
    }
  }, [storeGenerateLetter, isGenerating, memoizedFetchLetters]);
  
  // Ny funktion för att spara ett tidigare genererat brev
  const saveLetter = useCallback(async (letterData: any) => {
    if (!isMountedRef.current) return null;
    
    try {
      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...letterData,
          is_saved: true
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte spara brevet');
      }
      
      const data = await response.json();
      
      // Uppdatera brevlistan om sparandet lyckades - tvinga refresh
      await memoizedFetchLetters(true, false);
      
      return data.data;
    } catch (error) {
      console.error('Error saving letter:', error);
      return null;
    }
  }, [memoizedFetchLetters]);
  
  // Funktion för att uppdatera ett brev - kan inte vara cachad eftersom den har sidoeffekter
  const editLetter = useCallback(async (id: string, updates: UpdateLetterParams) => {
    if (!isMountedRef.current) return false;
    
    try {
      const success = await storeUpdateLetter(id, updates);
      
      // Uppdatera brevlistan vid framgång
      if (success) {
        await memoizedFetchLetters(true, false);
      }
      
      return success;
    } catch (error) {
      console.error('Error updating letter:', error);
      return false;
    }
  }, [storeUpdateLetter, memoizedFetchLetters]);
  
  // Funktion för att ta bort ett brev - kan inte vara cachad eftersom den har sidoeffekter
  const removeLetter = useCallback(async (id: string) => {
    if (!isMountedRef.current) return false;
    
    try {
      const success = await storeDeleteLetter(id);
      
      // Uppdatera brevlistan vid framgång
      if (success) {
        await memoizedFetchLetters(true, false);
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting letter:', error);
      return false;
    }
  }, [storeDeleteLetter, memoizedFetchLetters]);
  
  // Funktion för att förnya brevlistan
  const refreshLetters = useCallback(async () => {
    setForceUpdate(prev => prev + 1);
    return memoizedFetchLetters(true, false);
  }, [memoizedFetchLetters]);
  
  // Ladda brev automatiskt första gången hooken används
  useEffect(() => {
    // Tvinga en förnyad laddning direkt när komponenten monteras
    memoizedFetchLetters(true, false);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Rensa referenser när komponenten avmonteras
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  return {
    // State
    letters,
    currentLetter,
    isLoading,
    isGenerating,
    error,
    
    // Funktioner
    fetchLetters: memoizedFetchLetters,
    fetchLetter: memoizedGetLetter,
    createLetter,
    saveLetter, 
    getLetter: memoizedGetLetter,
    editLetter,
    removeLetter,
    refreshLetters
  };
};