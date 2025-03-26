import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, ProfileUpdateParams, CV } from '@/types/user.types';

// Konstanter för prenumerationsbegränsningar
const SUBSCRIPTION_LIMITS = {
  free: {
    maxSavedLetters: 2,
    weeklyLetterLimit: 5,
    maxCVCount: 1,
    availableTonalities: ['professional', 'enthusiastic', 'confident', 'balanced', 'creative'],
  },
  premium: {
    maxSavedLetters: 10,
    weeklyLetterLimit: Infinity,
    maxCVCount: 5,
    availableTonalities: ['professional', 'enthusiastic', 'confident', 'balanced', 'creative', 'auto'],
  }
};

export const useProfile = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cv, setCv] = useState<CV | null>(null);
  const [gdprConsent, setGdprConsent] = useState<boolean>(false);
  
  // Prenumerationsrelaterad state
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'premium'>('free');
  const [weeklyLetterCount, setWeeklyLetterCount] = useState<number>(0);
  const [weeklyLetterLimit, setWeeklyLetterLimit] = useState<number>(5);
  const [lastCountReset, setLastCountReset] = useState<string | null>(null);
  const [remainingWeeklyLetters, setRemainingWeeklyLetters] = useState<number>(5);
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);
  
  // CV-relaterad state
  const [cvCount, setCvCount] = useState(0);
  const [hasReachedCvLimit, setHasReachedCvLimit] = useState(false);
  const [maxCvCount, setMaxCvCount] = useState(1); // Standard för gratisanvändare
  
  // Letters-relaterad state
  const [savedLettersCount, setSavedLettersCount] = useState(0);
  const [hasReachedLetterLimit, setHasReachedLetterLimit] = useState(false);
  const [maxSavedLetters, setMaxSavedLetters] = useState(2); // Standard för gratisanvändare
  
  // Använder din skapade klientkonfiguration
  const supabase = createClient();
  
  // Funktion för att beräkna återstående brev baserat på prenumerationsnivå och räknare
  const calculateRemainingLetters = useCallback((tier: 'free' | 'premium', count: number) => {
    if (tier === 'premium') return Infinity;
    return Math.max(0, SUBSCRIPTION_LIMITS.free.weeklyLetterLimit - count);
  }, []);
  
  // Funktion för att avgöra om användaren har nått sin gräns för sparade brev
  const calculateLetterLimitReached = useCallback((tier: 'free' | 'premium', count: number) => {
    const limit = tier === 'premium' 
      ? SUBSCRIPTION_LIMITS.premium.maxSavedLetters 
      : SUBSCRIPTION_LIMITS.free.maxSavedLetters;
    return count >= limit;
  }, []);
  
  // Funktion för att avgöra om användaren har nått sin CV-gräns
  const calculateCvLimitReached = useCallback((tier: 'free' | 'premium', count: number) => {
    const limit = tier === 'premium' 
      ? SUBSCRIPTION_LIMITS.premium.maxCVCount 
      : SUBSCRIPTION_LIMITS.free.maxCVCount;
    return count >= limit;
  }, []);
  
  // Hjälpfunktion för att formatera begränsningsvärden för bättre visning
  const formatLimit = useCallback((value: number): string => {
    if (value === Infinity) return '∞';
    return value.toString();
  }, []);
  
  // NY FUNKTION: Uppdatera återstående brevantal direkt
  const updateRemainingLetters = useCallback((newRemainingCount: number) => {
    setRemainingWeeklyLetters(newRemainingCount);
    
    // Uppdatera även weeklyLetterCount baserat på nytt återstående antal
    if (subscriptionTier === 'free') {
      const newCount = SUBSCRIPTION_LIMITS.free.weeklyLetterLimit - newRemainingCount;
      setWeeklyLetterCount(newCount);
    }
  }, [subscriptionTier]);
  
  // Funktion för att hämta sparade brev för användaren
  const fetchSavedLettersCount = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('Du måste vara inloggad för att se dina sparade brev');
        return 0;
      }
      
      const { count, error } = await supabase
        .from('letters')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_saved', true);
      
      if (error) {
        console.error('Fel vid hämtning av sparade brev:', error);
        return 0;
      }
      
      // Uppdatera brävräknaren och maxgräns-flaggan
      const currentCount = count || 0;
      setSavedLettersCount(currentCount);
      setHasReachedLetterLimit(calculateLetterLimitReached(subscriptionTier, currentCount));
      
      return currentCount;
    } catch (error) {
      console.error('Fel vid hämtning av sparade brev:', error);
      return 0;
    }
  }, [supabase, subscriptionTier, calculateLetterLimitReached]);
  
  // Funktion för att hämta antalet CV för användaren
  const fetchCvCount = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('Du måste vara inloggad för att se dina CV:n');
        return 0;
      }
      
      const { count, error } = await supabase
        .from('cv_texts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      
      if (error) {
        console.error('Fel vid hämtning av CV-antal:', error);
        return 0;
      }
      
      // Uppdatera CV-räknaren och maxgräns-flaggan
      const currentCount = count || 0;
      setCvCount(currentCount);
      setHasReachedCvLimit(calculateCvLimitReached(subscriptionTier, currentCount));
      
      return currentCount;
    } catch (error) {
      console.error('Fel vid hämtning av CV-antal:', error);
      return 0;
    }
  }, [supabase, subscriptionTier, calculateCvLimitReached]);
  
  // Funktion för att hämta CV-information från API
  const fetchCvInfo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cv');
      
      if (!response.ok) {
        // Om svaret är 404 (inget CV hittat) sätter vi CV till null
        if (response.status === 404) {
          setCv(null);
          return null;
        }
        
        throw new Error('Kunde inte hämta CV-information');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setCv({
          name: data.data.file_name || 'CV',
          url: data.data.publicUrl || null,
          lastUpdated: data.data.updated_at || data.data.created_at || null
        });
        return data.data;
      } else {
        setCv(null);
        return null;
      }
    } catch (error) {
      console.error('Fel vid hämtning av CV-information:', error);
      setCv(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Hämta profil - gjord memoizable med useCallback för att undvika onödiga renders
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // Hämta aktuell användarsession
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('Du måste vara inloggad för att se din profil');
        setLoading(false);
        return null;
      }
      
      // Hämta profildata
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Fel vid hämtning av profil:', error);
        return null;
      }
      
      if (data) {
        setProfile(data);
        
        // Uppdatera prenumerationsrelaterade states
        const tier = (data.subscription_tier || 'free') as 'free' | 'premium';
		setSubscriptionTier(tier);
        
        // Uppdatera max-värden baserat på prenumerationsnivå
        setMaxCvCount(SUBSCRIPTION_LIMITS[tier].maxCVCount);
        setMaxSavedLetters(SUBSCRIPTION_LIMITS[tier].maxSavedLetters);
        setWeeklyLetterLimit(SUBSCRIPTION_LIMITS[tier].weeklyLetterLimit);
        
        // Uppdatera veckoräknaren
        setWeeklyLetterCount(data.weekly_letter_count || 0);
        setLastCountReset(data.last_count_reset);
        
        // Beräkna återstående veckobrev
        setRemainingWeeklyLetters(
          calculateRemainingLetters(tier, data.weekly_letter_count || 0)
        );
        
        // Hämta CV-information från API
        await fetchCvInfo();
        
        // Hämta CV-antal för att uppdatera räknaren
        await fetchCvCount();
        
        // Hämta antal sparade brev
        await fetchSavedLettersCount();
        
        return data;
      }
      
      return null;
    } catch (error: any) {
      console.error('Fel vid hämtning av profil:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchCvInfo, fetchCvCount, fetchSavedLettersCount, calculateRemainingLetters]);
  
  // Uppdatera profil
  const updateProfile = async (profileData: ProfileUpdateParams) => {
    try {
      // Validera indata
      if (profileData.full_name !== undefined && profileData.full_name.trim() === '') {
        console.warn('Ange ditt namn');
        return false;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('Du måste vara inloggad för att uppdatera din profil');
        return false;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)
        .select();
      
      if (error) {
        console.error('Fel vid uppdatering av profil:', error);
        return false;
      }
      
      if (data && data[0]) {
        // Uppdatera lokal profilestate
        setProfile(prev => prev ? { ...prev, ...data[0] } : data[0]);
        
        // Om prenumerationsnivån har ändrats, uppdatera relaterade värden
        if (profileData.subscription_tier && profileData.subscription_tier !== subscriptionTier) {
          setSubscriptionTier(profileData.subscription_tier);
          setMaxCvCount(SUBSCRIPTION_LIMITS[profileData.subscription_tier].maxCVCount);
          setMaxSavedLetters(SUBSCRIPTION_LIMITS[profileData.subscription_tier].maxSavedLetters);
          setWeeklyLetterLimit(SUBSCRIPTION_LIMITS[profileData.subscription_tier].weeklyLetterLimit);
          
          // Uppdatera flaggor för gränser
          setHasReachedCvLimit(calculateCvLimitReached(profileData.subscription_tier, cvCount));
          setHasReachedLetterLimit(calculateLetterLimitReached(profileData.subscription_tier, savedLettersCount));
          setRemainingWeeklyLetters(calculateRemainingLetters(profileData.subscription_tier, weeklyLetterCount));
        }
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Fel vid uppdatering av profil:', error);
      return false;
    }
  };
  
  // Uppdatera prenumerationsnivå
  const upgradeSubscription = async (newTier: 'premium') => {
    try {
      setIsUpgrading(true);
      
      // I ett riktigt system skulle vi här hantera betalningsprocessen.
      // Här simulerar vi bara en uppgradering.
      
      const success = await updateProfile({
        subscription_tier: newTier
      });
      
      if (success) {
        // Uppdatera lokalt state
        setSubscriptionTier(newTier);
        setMaxCvCount(SUBSCRIPTION_LIMITS[newTier].maxCVCount);
        setMaxSavedLetters(SUBSCRIPTION_LIMITS[newTier].maxSavedLetters);
        setWeeklyLetterLimit(SUBSCRIPTION_LIMITS[newTier].weeklyLetterLimit);
        
        // Uppdatera flaggor för gränser
        setHasReachedCvLimit(calculateCvLimitReached(newTier, cvCount));
        setHasReachedLetterLimit(calculateLetterLimitReached(newTier, savedLettersCount));
        setRemainingWeeklyLetters(calculateRemainingLetters(newTier, weeklyLetterCount));
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Fel vid uppgradering av prenumeration:', error);
      return false;
    } finally {
      setIsUpgrading(false);
    }
  };
  
  // Downgrade-funktion (för testning - i en riktig app skulle detta hantera avbokning)
 const downgradeSubscription = async () => {
   try {
     const success = await updateProfile({
       subscription_tier: 'free'
     });
     
     if (success) {
       // Uppdatera lokalt state tillbaka till gratisnivå
      setSubscriptionTier('free');
      setMaxCvCount(SUBSCRIPTION_LIMITS.free.maxCVCount);
      setMaxSavedLetters(SUBSCRIPTION_LIMITS.free.maxSavedLetters);
      setWeeklyLetterLimit(SUBSCRIPTION_LIMITS.free.weeklyLetterLimit);
      
      // Uppdatera flaggor för gränser - dessa kan nu vara true om användare överskrider gratisbegränsningar
      setHasReachedCvLimit(calculateCvLimitReached('free', cvCount));
      setHasReachedLetterLimit(calculateLetterLimitReached('free', savedLettersCount));
      setRemainingWeeklyLetters(calculateRemainingLetters('free', weeklyLetterCount));
      
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error('Fel vid nedgradering av prenumeration:', error);
    return false;
  }
};

// Uppdatera GDPR-samtycke
const setGdprConsentValue = (value: boolean) => {
  setGdprConsent(value);
};

// Ladda upp CV via API
const uploadCV = async (file: File, title?: string) => {
  try {
    // Kontrollera om användaren har nått sin CV-gräns (baserat på prenumerationsnivå)
    if (hasReachedCvLimit) {
      if (subscriptionTier === 'free') {
        throw new Error(`Som gratisanvändare kan du bara ha ${maxCvCount} CV. Uppgradera till premium för att hantera flera CV:n.`);
      } else {
        throw new Error(`Du har nått maxgränsen på ${maxCvCount} CV. Ta bort ett befintligt CV först.`);
      }
    }
    
    // Kontrollera GDPR-samtycke
    if (!gdprConsent) {
      throw new Error('Du måste godkänna GDPR-samtycket för att ladda upp CV');
    }
    
    // Validera filtyp
    const validTypes = ['.pdf', '.docx', '.txt'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.some(type => fileExt.endsWith(type))) {
      throw new Error('Ogiltig filtyp. Endast PDF, DOCX och TXT är tillåtna.');
    }
    
    // Validera filstorlek (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Filen är för stor. Maximal storlek är 5MB.');
    }
    
    // Använd API-rutt för uppladdning
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name); // Lägg till titel baserat på filnamn
    
    const response = await fetch('/api/cv/upload', {
      method: 'POST',
      body: formData
    });
    
    // Hantera specifika felkoder från backend
    if (!response.ok) {
      const errorData = await response.json();
      
      // Om användare har nått CV-gräns på backend, ge specifikt felmeddelande
      if (errorData.code === 'CV_LIMIT_REACHED') {
        throw new Error('Som gratisanvändare kan du bara ha 1 CV. Uppgradera till premium för att hantera flera CV:n.');
      }
      
      throw new Error(errorData.error || 'Okänt fel vid uppladdning');
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Uppdatera CV-informationen genom att hämta den från API
      await fetchCvInfo();
      // Uppdatera CV-räkningen
      await fetchCvCount();
      // Återställ GDPR-samtycket
      setGdprConsent(false);
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error('Fel vid uppladdning av CV:', error);
    throw error; // Kasta vidare felet för hantering i UI
  }
};

// Ta bort CV
const deleteCV = async () => {
  try {
    const response = await fetch('/api/cv', {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Okänt fel vid borttagning');
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Återställ CV-tillståndet
      setCv(null);
      // Uppdatera CV-räkningen
      await fetchCvCount();
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error('Fel vid borttagning av CV:', error);
    throw error; // Kasta vidare felet för hantering i UI
  }
};

// Ta bort specifikt CV via ID
const deleteCVById = async (id: string) => {
  try {
    const response = await fetch('/api/cv/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Okänt fel vid borttagning');
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Uppdatera CV-räkningen och refresh cv-infon om aktuellt CV togs bort
      await fetchCvCount();
      await fetchCvInfo();
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error('Fel vid borttagning av CV:', error);
    throw error; // Kasta vidare felet för hantering i UI
  }
};

// Hämta profildata vid komponentmontering
useEffect(() => {
  fetchProfile();
}, [fetchProfile]);

// Returnera allt som behövs från hooken
return { 
  // Grundläggande profildata
  profile, 
  cv, 
  gdprConsent,
  loading, 
  
  // Prenumerationsrelaterad data
  subscriptionTier,
  isUpgrading,
  weeklyLetterCount,
  remainingWeeklyLetters,
  weeklyLetterLimit,
  
  // Gränser och antal baserade på prenumerationsnivå
  cvCount,
  maxCvCount,
  hasReachedCvLimit,
  savedLettersCount,
  maxSavedLetters,
  hasReachedLetterLimit,
  
  // Gränsinformationsobjekt för lättare användning
  subscriptionLimits: SUBSCRIPTION_LIMITS,
  formatLimit,
  
  // Funktioner
  updateProfile, 
  uploadCV,
  deleteCV,
  deleteCVById,
  setGdprConsent: setGdprConsentValue,
  refreshProfile: fetchProfile,
  
  // Prenumerationsuppgraderingsfunktioner
  upgradeSubscription,
  downgradeSubscription,  // För testning
  
  // NY FUNKTION exporterad
  updateRemainingLetters
};
};