import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, ProfileUpdateParams, CV } from '@/types/user.types';

export const useProfile = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cv, setCv] = useState<CV | null>(null);
  
  // Använder din skapade klientkonfiguration
  const supabase = createClient();
  
  // Funktion för att hämta CV-information från API
  const fetchCvInfo = async () => {
    try {
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
      
      if (data.success && data.cv) {
        setCv(data.cv);
        return data.cv;
      } else {
        setCv(null);
        return null;
      }
    } catch (error) {
      console.error('Fel vid hämtning av CV-information:', error);
      setCv(null);
      return null;
    }
  };
  
  // Hämta profil
  const fetchProfile = async () => {
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
        
        return data;
      }
      
      return null;
    } catch (error: any) {
      console.error('Fel vid hämtning av profil:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
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
  
  // Ladda upp CV via API
  const uploadCV = async (file: File) => {
    try {
      // Validera filtyp
      const validTypes = ['.pdf', '.docx', '.txt'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.some(type => fileExt.endsWith(type))) {
        console.error('Ogiltig filtyp. Endast PDF, DOCX och TXT är tillåtna.');
        return false;
      }
      
      // Validera filstorlek (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        console.error('Filen är för stor. Maximal storlek är 5MB.');
        return false;
      }
      
      // Använd API-rutt för uppladdning
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name); // Lägg till titel baserat på filnamn
      
      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Fel vid uppladdning:', errorData.error || 'Okänt fel');
        return false;
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Uppdatera CV-informationen genom att hämta den från API
        await fetchCvInfo();
        // Uppdatera även profilen
        await fetchProfile();
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Fel vid uppladdning av CV:', error);
      return false;
    }
  };
  
  // Ladda ner CV
  const downloadCV = async () => {
    try {
      if (!cv?.url) {
        console.error('Inget CV hittat');
        return null;
      }
      
      const response = await fetch(cv.url);
      if (!response.ok) {
        throw new Error('Kunde inte ladda ner CV');
      }
      
      return await response.blob();
    } catch (error: any) {
      console.error('Fel vid nedladdning av CV:', error);
      return null;
    }
  };
  
  // Hämta profildata vid komponentmontering
  useEffect(() => {
    fetchProfile();
  }, []);
  
  return { 
    profile, 
    cv, 
    loading, 
    updateProfile, 
    uploadCV,
    downloadCV,
    refreshProfile: fetchProfile 
  };
};