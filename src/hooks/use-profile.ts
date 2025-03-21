import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, ProfileUpdateParams, CV } from '@/types/user.types';

export const useProfile = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cv, setCv] = useState<CV | null>(null);
  const [gdprConsent, setGdprConsent] = useState<boolean>(false);
  
  // Max antal CVs
  const MAX_CV_COUNT = 5;
  // Räknare för antal CVs
  const [cvCount, setCvCount] = useState(0);
  // Flagga för om max antal CVs är uppnått
  const [hasReachedCvLimit, setHasReachedCvLimit] = useState(false);
  
  // Använder din skapade klientkonfiguration
  const supabase = createClient();
  
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
      setHasReachedCvLimit(currentCount >= MAX_CV_COUNT);
      
      return currentCount;
    } catch (error) {
      console.error('Fel vid hämtning av CV-antal:', error);
      return 0;
    }
  }, [supabase]);
  
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
        
        // Hämta CV-information från API
        await fetchCvInfo();
        
        // Hämta CV-antal för att uppdatera räknaren
        await fetchCvCount();
        
        return data;
      }
      
      return null;
    } catch (error: any) {
      console.error('Fel vid hämtning av profil:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchCvInfo, fetchCvCount]);
  
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
        setProfile(prev => prev ? { ...prev, ...data[0] } : data[0]);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Fel vid uppdatering av profil:', error);
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
      // Kontrollera om vi har nått maximalt antal CV
      if (hasReachedCvLimit) {
        throw new Error(`Du har nått maxgränsen på ${MAX_CV_COUNT} CV. Ta bort ett befintligt CV först.`);
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
      
      if (!response.ok) {
        const errorData = await response.json();
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
  
  // Hämta profildata vid komponentmontering
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  return { 
    profile, 
    cv, 
    gdprConsent,
    loading, 
    cvCount,
    maxCvCount: MAX_CV_COUNT,
    hasReachedCvLimit,
    updateProfile, 
    uploadCV,
    deleteCV,
    setGdprConsent: setGdprConsentValue,
    refreshProfile: fetchProfile 
  };
};