// src/hooks/use-letters.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLetterStore, Letter } from '@/store/letter-store';

interface GenerateLetterParams {
  cv_id: string;
  job_description: string;
  tonality: string;
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
  
  // Skapa cachelagring för API-anrop
  const cachedFetchLetters = createCachedFetcher(
    storeFetchLetters,
    (savedOnly) => `fetchLetters:${savedOnly ? 'saved' : 'all'}`
  );
  
  const cachedFetchLetter = createCachedFetcher(
    storeFetchLetter,
    (id) => `fetchLetter:${id}`
  );
  
  // Memoizera funktionerna för att förhindra oändliga rerenderingar
  const memoizedFetchLetters = useCallback((savedOnly = false) => {
    // Förhindra anrop om komponenten avmonterats eller redan hämtar
    if (!isMountedRef.current || fetchingLettersRef.current || isLoading) return Promise.resolve();
    
    fetchingLettersRef.current = true;
    
    return cachedFetchLetters(savedOnly).finally(() => {
      if (isMountedRef.current) {
        fetchingLettersRef.current = false;
      }
    });
  }, [isLoading, cachedFetchLetters]);
  
  const memoizedGetLetter = useCallback((id: string) => {
    // Förhindra anrop om komponenten avmonterats eller redan hämtar detta ID
    if (!isMountedRef.current || fetchingLetterRef.current[id] || !id) return Promise.resolve(null);
    
    fetchingLetterRef.current[id] = true;
    
    return cachedFetchLetter(id)
      .then(() => currentLetter)
      .finally(() => {
        if (isMountedRef.current) {
          fetchingLetterRef.current[id] = false;
        }
      });
  }, [currentLetter, cachedFetchLetter]);
  
  // Funktion för att generera ett nytt brev - kan inte vara cachad eftersom den har sidoeffekter
  const createLetter = useCallback(async (params: GenerateLetterParams) => {
    if (!isMountedRef.current) return null;
    
    try {
      const generatedLetter = await storeGenerateLetter(params);
      return generatedLetter;
    } catch (error) {
      console.error('Error generating letter:', error);
      return null;
    }
  }, [storeGenerateLetter]);
  
  // Funktion för att uppdatera ett brev - kan inte vara cachad eftersom den har sidoeffekter
  const editLetter = useCallback(async (id: string, updates: UpdateLetterParams) => {
    if (!isMountedRef.current) return false;
    
    try {
      const success = await storeUpdateLetter(id, updates);
      return success;
    } catch (error) {
      console.error('Error updating letter:', error);
      return false;
    }
  }, [storeUpdateLetter]);
  
  // Funktion för att ta bort ett brev - kan inte vara cachad eftersom den har sidoeffekter
  const removeLetter = useCallback(async (id: string) => {
    if (!isMountedRef.current) return false;
    
    try {
      const success = await storeDeleteLetter(id);
      return success;
    } catch (error) {
      console.error('Error deleting letter:', error);
      return false;
    }
  }, [storeDeleteLetter]);
  
  // Funktion för att hämta sparade brev - kan vara cachad
  const getSavedLetters = useCallback(async () => {
    if (!isMountedRef.current) return [];
    
    try {
      await memoizedFetchLetters(true);
      return letters;
    } catch (error) {
      console.error('Error fetching saved letters:', error);
      return [];
    }
  }, [letters, memoizedFetchLetters]);
  
  // Ladda brev automatiskt första gången hooken används
  useEffect(() => {
    // Om det inte redan finns några brev, hämta dem
    if (letters.length === 0 && !isLoading && !fetchingLettersRef.current) {
      memoizedFetchLetters();
    }
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
    getLetter: memoizedGetLetter,
    editLetter,
    removeLetter,
    getSavedLetters
  };
};