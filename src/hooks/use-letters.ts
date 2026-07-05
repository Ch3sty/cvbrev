// src/hooks/use-letters.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLetterStore, Letter } from '@/store/letter-store';

interface GenerateLetterParams {
  cv_id: string;
  job_description: string;
  tonality: string;
  language?: string; // Ny parameter för språkval
  template_id?: string; // Ny parameter för mallval
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

// För att spåra aktiva operationer
const activeOperations = {
  fetching: false,
  deleting: false
};

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
  const fetchingLetterRef = useRef<Record<string, boolean>>({});
  const generatingLetterRef = useRef(false);
  
  // Lokala tillstånd för att hantera operationer
  const [isDeleting, setIsDeleting] = useState(false);
  const [localIsLoading, setLocalIsLoading] = useState(false);
  
  // Force-fetch state
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Förhindra oönskade anrop vid monteringsskedet
  const initialLoadingDoneRef = useRef(false);

  // Memoizera fetchLettersWithOptions för att kunna använda den i andra useCallback
  const memoizedFetchLettersWithOptions = useCallback(async (savedOnly = false, useCache = true) => {
    // Förhindra samtidiga anrop
    if (activeOperations.fetching && useCache) {
      // Wait for ongoing fetch to complete instead of returning stale data
      await new Promise(resolve => setTimeout(resolve, 100));
      return useLetterStore.getState().letters;
    }

    // Markera att hämtning pågår
    activeOperations.fetching = true;
    setLocalIsLoading(true);

    try {
      // Direkt anrop utan caching om useCache=false
      await storeFetchLetters(savedOnly);

      // Return fresh data from store, not from closure
      return useLetterStore.getState().letters;
    } catch (error) {
      console.error('Error fetching letters:', error);
      throw error;
    } finally {
      activeOperations.fetching = false;
      setLocalIsLoading(false);
    }
  }, [storeFetchLetters]);
  
  // Memoizera funktionerna för att förhindra oändliga rerenderingar
  // Ta bort forceUpdate från beroendelistan eftersom det ger en onödig/oanvänd beroendeparameter
  const memoizedFetchLetters = useCallback(async (savedOnly = false, useCache = true) => {
    // Förhindra anrop om komponenten avmonterats eller om en borttagningsoperation pågår
    if (!isMountedRef.current || activeOperations.deleting) {
      // Use getState() instead of closure variable to avoid infinite loop
      return Promise.resolve(useLetterStore.getState().letters);
    }

    return memoizedFetchLettersWithOptions(savedOnly, useCache);
  }, [memoizedFetchLettersWithOptions]); // Removed 'letters' to prevent infinite loop
  
  const memoizedGetLetter = useCallback(async (id: string) => {
    // Förhindra anrop om komponenten avmonterats eller redan hämtar detta ID
    if (!isMountedRef.current || fetchingLetterRef.current[id] || !id) {
      return Promise.resolve(currentLetter);
    }
    
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
            language: params.language || 'sv', // Skicka med språket
            template_id: params.template_id || 'classic' // Skicka med vald mall
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          // Bevara strukturerad felinfo (t.ex. code='quota_exceeded' + nextResetAt)
          // så UI:t kan visa rätt spärrvy i stället för ett generiskt fel.
          const error: any = new Error(errorData.message || errorData.error || 'Kunde inte generera brevförhandsvisning');
          error.code = errorData.code;
          error.payload = errorData;
          throw error;
        }
        
        const data = await response.json();
        console.log('API svar:', data);
        
        // Här tilldelar vi remainingLetters från data direkt till resultatet som returneras
        // Detta gör att värdet blir tillgängligt i create-letter/page.tsx
        const result = data.data;
        if (data.remainingLetters !== undefined) {
          result.remainingLetters = data.remainingLetters;
        }
        
        return result;
      }
      
      // Annars, använd det befintliga API-anropet för att spara direkt
      const generatedLetter = await storeGenerateLetter({
        cv_id: params.cv_id,
        job_description: params.job_description,
        tonality: params.tonality,
        language: params.language || 'sv', // Skicka med språket
        template_id: params.template_id || 'classic' // Skicka med vald mall
      });
      
      // Efter framgångsrik generering, uppdatera brevlistan - men bara om inget borttagningsanrop pågår
      if (!activeOperations.deleting) {
        await memoizedFetchLetters(true, false);
      }
      
      return generatedLetter;
    } catch (error) {
      console.error('Error generating letter:', error);
      throw error; // Kasta vidare felet för att hantera i UI
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
          id: letterData.id, // ✅ Skicka med preview ID för exakt matchning
          is_saved: true
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte spara brevet');
      }
      
      const data = await response.json();
      
      // Uppdatera brevlistan om sparandet lyckades - tvinga refresh - men bara om inget borttagningsanrop pågår
      if (!activeOperations.deleting) {
        await memoizedFetchLetters(true, false);
      }
      
      return data.data;
    } catch (error) {
      console.error('Error saving letter:', error);
      throw error; // Kasta vidare felet för att hantera i UI
    }
  }, [memoizedFetchLetters]);
  
  // Funktion för att uppdatera ett brev - kan inte vara cachad eftersom den har sidoeffekter
  const editLetter = useCallback(async (id: string, updates: UpdateLetterParams) => {
    if (!isMountedRef.current) return false;
    
    try {
      const success = await storeUpdateLetter(id, updates);
      
      // Uppdatera brevlistan vid framgång - men bara om inget borttagningsanrop pågår
      if (success && !activeOperations.deleting) {
        await memoizedFetchLetters(true, false);
      }
      
      return success;
    } catch (error) {
      console.error('Error updating letter:', error);
      return false;
    }
  }, [storeUpdateLetter, memoizedFetchLetters]);
  
  // Förbättrad funktion för att ta bort ett brev - kan inte vara cachad eftersom den har sidoeffekter
  const removeLetter = useCallback(async (id: string) => {
    if (!isMountedRef.current) return false;
    
    // Förhindra samtidiga borttagningar
    if (activeOperations.deleting || isDeleting) {
      console.log('En borttagningsoperation pågår redan');
      return false;
    }
    
    activeOperations.deleting = true;
    setIsDeleting(true);
    
    try {
      // Uppdatera client-side state optimistiskt
      // Spara en lokal kopia av den aktuella brevlistan
      const updatedLetters = letters.filter(letter => letter.id !== id);
      
      // Anropa server för att ta bort brevet
      const success = await storeDeleteLetter(id);
      
      if (success) {
        // Inget behov av att hämta brev igen om vi redan har uppdaterat lokalt
        // Vi förlitar oss på att store:n har uppdaterats korrekt

        return true;
      } else {
        // Om borttagningen misslyckades, tvinga en ny hämtning för att återställa korrekt läge
        await memoizedFetchLetters(true, false);
        return false;
      }
    } catch (error) {
      console.error('Error deleting letter:', error);
      // Vid fel, tvinga en ny hämtning för att återställa korrekt läge
      await memoizedFetchLetters(true, false);
      return false;
    } finally {
      // Återställ flaggor
      activeOperations.deleting = false;
      setIsDeleting(false);
    }
  }, [storeDeleteLetter, memoizedFetchLetters, letters, isDeleting]);
  
  // Funktion för att förnya brevlistan
  const refreshLetters = useCallback(async () => {
    setForceUpdate(prev => prev + 1);
    return memoizedFetchLetters(true, false);
  }, [memoizedFetchLetters]);
  
// Ladda brev automatiskt första gången hooken används
  useEffect(() => {
    // Undvik att ladda brev flera gånger vid initialt läge
    if (!initialLoadingDoneRef.current) {
      initialLoadingDoneRef.current = true;
      
      // Tvinga en förnyad laddning direkt när komponenten monteras
      memoizedFetchLetters(true, false);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Rensa referenser när komponenten avmonteras
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Återställ också alla globala flaggor
      activeOperations.fetching = false;
      activeOperations.deleting = false;
    };
  }, []);
  
  return {
    // State
    letters,
    currentLetter,
    isLoading: isLoading || localIsLoading,
    isDeleting,
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