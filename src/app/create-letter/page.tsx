'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCVStore } from '@/store/cv-store'
import { useLetters } from '@/hooks/use-letters'
// *** UPPDATERAD IMPORT: Behöver 'profile' för ID ***
import { useProfile } from '@/hooks/use-profile'
// *** NYA IMPORTER FÖR LOGGNING ***
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { logUserActivity } from '@/lib/activity-logger';
// ***********************************
import {
  FileText,
  Upload,
  MessageSquare,
  ChevronDown,
  Info,
  Building2,
  Sparkles,
  Lightbulb,
  Trophy,
  Scale,
  Bot,
  Pencil,
  Save,
  Check,
  AlertTriangle, // För varningsmeddelanden om begränsningar
  Crown,         // För premium-indikator
  Clock         // För reset-timer
} from 'lucide-react'
import Notification from '@/components/ui/notification'

// Typer (från gamla)
type Tonality = 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced' | 'auto'
type Language = 'sv' | 'en'

// Interface (från gamla)
interface TonalityInfo {
  label: string;
  description: string;
  icon: React.ReactNode;
  recommendedFor: string;
  premiumOnly?: boolean; // Ny flagga för premium-funktioner
}

// Konstant (från gamla - med RÄTT data)
const tonalityInfo: Record<Tonality, TonalityInfo> = {
  'professional': {
    label: 'Professionell',
    description: 'Formell och saklig ton som lägger fokus på kompetens och erfarenhet.',
    icon: <Building2 className="w-5 h-5 text-blue-400" />,
    recommendedFor: 'Traditionella branscher som bank, juridik och offentlig sektor.'
  },
  'enthusiastic': {
    label: 'Entusiastisk',
    description: 'Energisk och passionerad ton som visar stort intresse för tjänsten.',
    icon: <Sparkles className="w-5 h-5 text-pink-400" />,
    recommendedFor: 'Kreativa yrken, startups och kundorienterade roller.'
  },
  'creative': {
    label: 'Kreativ',
    description: 'Innovativ och nytänkande ton som framhäver din kreativa sida.',
    icon: <Lightbulb className="w-5 h-5 text-yellow-400" />,
    recommendedFor: 'Design, marknadsföring och kulturella sektorer.'
  },
  'confident': {
    label: 'Självsäker',
    description: 'Stark och bestämd ton som betonar prestationer och resultat.',
    icon: <Trophy className="w-5 h-5 text-amber-400" />,
    recommendedFor: 'Chefsroller, sälj och konsultroller.'
  },
  'balanced': {
    label: 'Balanserad',
    description: 'En harmonisk blandning av professionalitet och personlighet.',
    icon: <Scale className="w-5 h-5 text-emerald-400" />,
    recommendedFor: 'De flesta tjänster när du är osäker.'
  },
  'auto': {
    label: 'AI-val (Rekommenderas)',
    description: 'Låt AI analysera jobbannonsen och välja den bästa anpassade tonen baserat på bransch, företagskultur och tjänst.',
    icon: <Bot className="w-5 h-5 text-purple-400" />,
    recommendedFor: 'Alla ansökningar för att maximera dina chanser att få jobbet.',
    premiumOnly: true // Markera denna tonalitet som premium-exklusiv
  }
};

export default function CreateLetterPage() {
  // Hooks (från gamla)
  const { cvs, fetchCVs, isLoading: cvsLoading } = useCVStore();
  const { createLetter, saveLetter, isGenerating } = useLetters();
  // *** UPPDATERAD DESTRUCTURING: Lägg till 'profile' ***
  const {
    profile, // <-- TILLAGD FÖR ID
    subscriptionTier,
    remainingWeeklyLetters,
    hasReachedLetterLimit, // Behåller den gamla variabeln
    savedLettersCount,
    maxSavedLetters,
    updateRemainingLetters,
    nextResetDate,
    timeUntilReset,
    updateNextResetDate
  } = useProfile();

  // State (från gamla)
  const [selectedCV, setSelectedCV] = useState<string | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [tonality, setTonality] = useState<Tonality>('balanced') // Default från gamla
  const [language, setLanguage] = useState<Language>('sv')
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null)
  const [letterData, setLetterData] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTonalityOpen, setIsTonalityOpen] = useState(false)
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'loading' as 'loading' | 'success' | 'error' | 'info',
    progress: 0
  })

  // Refs (från gamla)
  const letterContentRef = useRef<HTMLDivElement>(null);
  const tonalityDropdownRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(false);
  const generationInProgressRef = useRef(false);
  const lastGenerationAttemptRef = useRef(0);

  const router = useRouter()

  // Effects (från gamla)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tonalityDropdownRef.current && !tonalityDropdownRef.current.contains(event.target as Node)) {
        setIsTonalityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (tonality === 'auto' && subscriptionTier === 'free') {
      setTonality('balanced');
    }
  }, [tonality, subscriptionTier]);

  // Denna useEffect hade en eslint-disable kommentar i din gamla kod, behåller den.
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchCVs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependency array som i gamla koden

  useEffect(() => {
    if (cvs.length > 0 && !selectedCV) {
      setSelectedCV(cvs[0].id);
    }
  }, [cvs, selectedCV]);

  useEffect(() => {
    if (!isGenerating && isSubmitting) {
      setIsSubmitting(false);
      generationInProgressRef.current = false;
    }
  }, [isGenerating, isSubmitting]);

  // Callbacks (från gamla)
  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  const showNotification = useCallback((type: 'loading' | 'success' | 'error' | 'info', message: string, duration?: number) => {
    setNotification({
      isVisible: true,
      message,
      type,
      progress: type === 'loading' ? 0 : 100
    });
    if (type !== 'loading' && duration) {
      // Använder den gamla versionens setTimeout-logik
      setTimeout(closeNotification, duration);
    }
  }, [closeNotification]); // Dependency array som i gamla koden

  const formatDate = useCallback((dateString: string | Date) => { // Signatur från gamla
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }, []);

  // Funktion för att generera brev (från gamla, med loggning tillagd)
  const generateLetter = useCallback(async () => {
    // Validering (från gamla)
    if (!selectedCV || !jobDescription) {
      setError('Välj ett CV och lägg till en jobbannons.');
      showNotification('error', 'Välj ett CV och lägg till en jobbannons', 3000);
      return;
    }
    // Gränskontroll (från gamla)
    if (subscriptionTier === 'free' && remainingWeeklyLetters <= 0) {
      setError('Du har nått din veckogräns för brevgenerering. Uppgradera till premium för obegränsad användning.');
      showNotification('error', 'Veckogräns nådd. Uppgradera till premium för obegränsad användning.', 5000);
      return;
    }
    // Tidsbegränsning (från gamla)
    const now = Date.now();
    if (now - lastGenerationAttemptRef.current < 3000) {
      console.log('Förhindrar för snabba genereringsförsök');
      return;
    }
    // Dubblettanrops-check (från gamla)
    if (generationInProgressRef.current || isGenerating || isSubmitting) {
      console.log('Förhindrar dubblett brevgenerering, en generering pågår redan');
      return;
    }

    // Återställ och sätt flaggor (från gamla)
    setError(null);
    setGeneratedLetter(null);
    setLetterData(null);
    setIsSubmitting(true);
    generationInProgressRef.current = true;
    lastGenerationAttemptRef.current = now;
    showNotification('loading', 'Genererar ditt brev...');

    // *** NYTT: Logga start ***
    if (profile?.id) {
      logUserActivity(
        profile.id,
        'letter_generation_started',
        'Användaren startade generering av personligt brev',
        { cv_id: selectedCV, language: language, tonality: tonality, job_description_length: jobDescription.length }
      );
    } else { console.warn("Loggning: Användar-ID saknas.") }
    // *************************

    let safetyTimer: NodeJS.Timeout | null = null; // Deklarerad utanför för att kunna rensas i catch/finally

	try {
      // Säkerhetstimer (från gamla)
      safetyTimer = setTimeout(() => {
        if (generationInProgressRef.current) {
          console.log('Säkerhetsåterställning av UI efter timeout');
          generationInProgressRef.current = false;
          setIsSubmitting(false);
          closeNotification();
          showNotification('error', 'Genereringen tog för lång tid, försök igen', 5000);
          // *** NYTT: Logga timeout-fel ***
          if (profile?.id) {
            logUserActivity(
              profile.id,
              'letter_generation_failed',
              'Generering avbröts på grund av timeout (klient)',
              { cv_id: selectedCV, language: language, tonality: tonality, job_description_length: jobDescription.length, error_details: 'Client-side timeout after 45s', timeout_ms: 45000 }
            );
          }
          // ******************************
        }
      }, 45000);

      // Generera brevet (från gamla)
      const result = await createLetter({
        cv_id: selectedCV,
        job_description: jobDescription,
        tonality: tonality,
        language: language,
        save: false // Indikera att vi inte vill spara brevet ännu (använder generate-preview)
      });

      // Rensa säkerhetstimern (från gamla)
      if (safetyTimer) clearTimeout(safetyTimer);
      safetyTimer = null; // Nollställ referens

      closeNotification(); // Stäng "Genererar..." notisen

      // <<< ÄNDRING START >>>
      // Hantera resultat - KORRIGERAD FÖR ATT HANTERA { success: boolean, data: object, ... }
      if (result && result.data && typeof result.data.content === 'string') {
        // Lyckat fall: Spara brevinnehåll och data
        setGeneratedLetter(result.data.content); // Hämta innehållet från 'data'
        setLetterData(result.data);             // Spara hela brevobjektet från 'data'
      } else {
        // Om svaret är oväntat, null, eller saknar content-sträng
        console.error("Ogiltigt eller felaktigt format på svar från createLetter:", result);
        // Sätt generellt felmeddelande som i den gamla koden, men logga det specifika felet
        setError('Kunde inte generera brevet. Försök igen om en stund.'); // Gammalt felmeddelande
        showNotification('error', 'Kunde inte tolka svaret från servern.', 5000); // Tydligare fel till användaren
        setGeneratedLetter(null); // Återställ vid fel
        setLetterData(null);      // Återställ vid fel
        // Logga felet
        if (profile?.id) {
            logUserActivity(
                profile.id,
                'letter_generation_failed',
                'Felaktigt format eller innehåll saknades i API-svar (klient)',
                { cv_id: selectedCV, language: language, tonality: tonality, response_received: JSON.stringify(result) } // Logga vad som faktiskt mottogs (kan vara stort)
            );
        }
        // Gå vidare för att uppdatera räknare etc. om `result` finns, men visa inte brevet.
      }
      // <<< ÄNDRING SLUT >>>


      // Uppdatera återställningsdatum (Korrekt, använder result direkt)
      if (result && result.nextResetDate) {
        const newResetDate = new Date(result.nextResetDate);
        if (!isNaN(newResetDate.getTime())) {
           updateNextResetDate(newResetDate);
        } else {
            console.warn("Mottog ogiltigt nextResetDate från API:", result.nextResetDate);
        }
      }

      // Visa framgångsmeddelande (Korrekt, använder result direkt)
      // Modifierad för att endast visa om genereringen faktiskt lyckades (dvs. generatedLetter är satt)
      if (result && subscriptionTier === 'free' && result.remainingLetters !== undefined) {
        updateRemainingLetters(result.remainingLetters);
        const remainingText = result.remainingLetters === 0
          ? 'Du har nått din gräns för denna vecka.'
          : `Du har ${result.remainingLetters} genererade brev kvar denna vecka.`;
        // Visa bara om brevet faktiskt genererades OK
        if (generatedLetter) { // <<< KONTROLL LADES TILL
            showNotification('success', `Brevet har genererats! ${remainingText}`, 5000);
        }
      } else if (generatedLetter) { // <<< KONTROLL LADES TILL
         // Visa bara om brevet faktiskt genererades OK
        showNotification('success', 'Brevet har genererats!', 3000);
      }
      // *** Servern bör logga 'letter_created' ***

    } catch (error: any) {
      if (safetyTimer) clearTimeout(safetyTimer); // Rensa timer vid fel
      safetyTimer = null;
      closeNotification();
      // Visa felmeddelande och sätt state (från gamla koden)
      showNotification('error', 'Ett fel uppstod vid generering av brevet', 5000);
      setError(error.message || 'Ett fel uppstod vid generering av brevet.');
      // *** Logga genereringsfel ***
      if (profile?.id) {
          logUserActivity(
            profile.id,
            'letter_generation_failed',
            'Generering misslyckades på grund av ett fel (klient)',
            { cv_id: selectedCV, language: language, tonality: tonality, job_description_length: jobDescription.length, error_message: error.message || 'Okänt fel', error_stack: error.stack }
          );
      }
      // Återställ state vid catch
      setGeneratedLetter(null);
      setLetterData(null);

    } finally {
      // Återställ flaggor (från gamla)
      generationInProgressRef.current = false;
      setIsSubmitting(false);
    }
  }, [selectedCV, jobDescription, tonality, language, isGenerating, isSubmitting, createLetter, showNotification, closeNotification, subscriptionTier, remainingWeeklyLetters, updateRemainingLetters, updateNextResetDate, profile, generatedLetter]); // <<< ADDED generatedLetter to dependencies for the success message check

// Funktion för att spara brevet (från gamla, med loggning tillagd)
  const handleSaveLetter = useCallback(async () => {
    // <<< INGEN ÄNDRING I DENNA FUNKTION >>>
    if (!letterData) return;

    // Gränskontroll (från gamla, använder hasReachedLetterLimit)
    if (hasReachedLetterLimit || (subscriptionTier === 'free' && savedLettersCount >= maxSavedLetters)) {
      showNotification('error', `Som ${subscriptionTier === 'free' ? 'gratisanvändare' : 'användare'} kan du max spara ${maxSavedLetters} brev. Radera något brev eller uppgradera till premium.`, 5000);
      setError(`Du har nått maxgränsen på ${maxSavedLetters} sparade brev. Radera ett brev eller uppgradera.`);
      // *** NYTT: Logga försök att spara över gräns ***
      if (profile?.id) {
        logUserActivity(profile.id, 'save_limit_reached', 'Försökte spara brev över gränsen', { max_saved_letters: maxSavedLetters });
      }
      // ********************************************
      return;
    }

    try {
      setIsSaving(true);
      showNotification('loading', 'Sparar brevet...');

      // Anropa saveLetter (från gamla)
      const savedLetter = await saveLetter(letterData); // Skickar med genererat data

      closeNotification();

      if (savedLetter) {
        // Uppdatera state (från gamla)
        setLetterData({
          ...letterData,
          id: savedLetter.id,
          is_saved: true
        });
        showNotification('success', 'Brevet har sparats! Du hittar det under "Mina brev".', 3000);
        // *** NYTT: Logga lyckat sparande ***
        if (profile?.id && savedLetter.id) {
          logUserActivity(profile.id, 'letter_saved', 'Sparade ett genererat personligt brev', { letter_id: savedLetter.id });
        }
        // **********************************
      }
      // Ingen else-hantering i gamla koden, behåller det så
    } catch (error: any) {
      closeNotification();
      // Felhantering (från gamla)
      if (error.message && error.message.includes('maximal gräns')) {
        showNotification('error', error.message, 5000); // Specifikt meddelande
         // *** NYTT: Logga server-side limit error ***
         if (profile?.id) {
           logUserActivity(profile.id, 'save_limit_reached', 'Servern nekade sparande pga gräns', { max_saved_letters: maxSavedLetters, error_message: error.message });
         }
         // ***************************************
      } else {
        showNotification('error', 'Kunde inte spara brevet', 5000); // Generellt meddelande
         // *** NYTT: Logga allmänt spara-fel ***
         if (profile?.id) {
           logUserActivity(profile.id, 'letter_save_failed', 'Misslyckades med att spara personligt brev', { error_message: error.message || 'Okänt fel', error_code: error.code });
         }
         // ***********************************
      }
      setError(error.message || 'Kunde inte spara brevet.'); // Sätt error state som i gamla
    } finally {
      setIsSaving(false);
    }
     // *** VIKTIGT: Lägg till 'profile' i dependency array ***
  }, [letterData, saveLetter, showNotification, closeNotification, hasReachedLetterLimit, subscriptionTier, savedLettersCount, maxSavedLetters, profile]); // <-- profile TILLAGD

  // Funktion för att navigera till redigering (från gamla, med loggning tillagd)
  const handleEdit = useCallback(() => {
     // <<< INGEN ÄNDRING I DENNA FUNKTION >>>
    // Kontroll från gamla (kollar bara id, inte is_saved)
    if (letterData && letterData.id) {
       // *** NYTT: Logga att redigering initieras ***
      if (profile?.id) {
        // Lägger till en check här om brevet faktiskt *är* sparat, för loggens skull
        const isTrulySaved = letterData.is_saved === true;
        logUserActivity(
            profile.id,
            'letter_edit_initiated',
            'Navigerade för att redigera ett brev (via edit-knapp)',
            { letter_id: letterData.id, was_saved_flag_set: isTrulySaved }
        );
      }
      // *******************************************
      router.push(`/my-letters/${letterData.id}/edit`);
    } else {
      showNotification('error', 'Brevet måste sparas innan det kan redigeras', 3000);
      setError('Brevet måste sparas innan det kan redigeras.');
       // *** NYTT: Logga försök att redigera (troligen) osparat brev ***
      if (profile?.id) {
          logUserActivity(profile.id, 'letter_edit_attempt_unsaved', 'Försökte redigera brev (id saknades/var null)');
      }
      // **************************************************************
    }
     // *** VIKTIGT: Lägg till 'profile' i dependency array ***
  }, [letterData, router, showNotification, profile]); // <-- profile TILLAGD

  // Funktion för navigering till uppgradering (från gamla, med loggning tillagd)
  const handleUpgrade = useCallback(() => {
     // <<< INGEN ÄNDRING I DENNA FUNKTION >>>
    // *** NYTT: Logga klick på uppgraderingsknapp ***
    if (profile?.id) {
        const context = hasReachedLetterLimit ? 'save_limit_reached'
            : (remainingWeeklyLetters <= 0) ? 'generation_limit_reached'
            : 'general_upgrade_button';
        logUserActivity(profile.id, 'upgrade_clicked', 'Klickade på uppgraderingsknapp', { context: context, current_tier: subscriptionTier });
    }
    // *******************************************
    router.push('/profile?tab=subscription');
     // *** VIKTIGT: Lägg till 'profile' + relevanta states i dependency array ***
  }, [router, profile, hasReachedLetterLimit, remainingWeeklyLetters, subscriptionTier]); // <-- TILLAGDA dependencies

  // Beräkna om knappen ska vara inaktiverad (från gamla)
  const isButtonDisabled = isGenerating || isSubmitting || !selectedCV || !jobDescription;

  // --- JSX (Struktur och klasser EXAKT från gamla versionen) ---
  return (
    <div className="container max-w-6xl px-4 py-8 mx-auto">
      {/* Notifikationskomponent (från gamla) */}
      <Notification
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        progress={notification.progress}
        onClose={closeNotification}
      />

      {/* Sidhuvud (från gamla) */}
      <h1 className="mb-6 text-3xl font-bold text-white">Skapa ditt personliga ansökningsbrev</h1>
      <p className="mb-8 text-gray-300">
        Välj ditt CV och klistra in jobbannonsen för att generera ett personligt brev
      </p>

      {/* Visa återstående brev (från gamla) */}
      {subscriptionTier === 'free' && (
        <div className="mb-6 p-4 bg-navy-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-pink-500" />
              <span className="text-white font-medium">Genererade brev denna vecka</span>
            </div>
            <div className="flex items-center">
              <span className="text-white">
                {/* Klass från gamla */}
                <span className={remainingWeeklyLetters <= 1 ? 'text-red-400' : ''}>
                  {5 - remainingWeeklyLetters}
                </span> / 5
              </span>
              {/* Logik för knapp från gamla */}
              {remainingWeeklyLetters <= 1 && (
                <button
                  onClick={handleUpgrade} // Använder handleUpgrade som loggar
                  className="ml-3 px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white text-sm rounded-md flex items-center"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Uppgradera
                </button>
              )}
            </div>
          </div>

          {/* Nollställningsinfo (från gamla) */}
          {nextResetDate && (
            <div className="flex items-center mt-1 mb-1 text-xs text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              {/* Format från gamla */}
              <span>Nollställs {timeUntilReset ? `om ${timeUntilReset}` : formatDate(nextResetDate)}</span>
            </div>
          )}

          {/* Varning om få brev kvar (från gamla) */}
          {remainingWeeklyLetters <= 2 && (
            <div className="mt-2 text-sm text-yellow-400 flex items-start">
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                {/* Text från gamla */}
                Du har {remainingWeeklyLetters} {remainingWeeklyLetters === 1 ? 'brev' : 'brev'} kvar denna vecka.
                {nextResetDate && (
                   /* Text från gamla */
                  <span> Räknaren nollställs {timeUntilReset ? `om ${timeUntilReset}` : formatDate(nextResetDate)}. </span>
                )}
                <button
                  onClick={handleUpgrade} // Använder handleUpgrade som loggar
                  className="ml-1 text-pink-400 hover:text-pink-300 underline"
                >
                  Uppgradera till premium
                </button> för obegränsad användning.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Layout Grid (från gamla) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {/* CV-val (från gamla) */}
          <div>
            <h2 className="mb-2 text-xl font-semibold text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Välj ditt CV
            </h2>
            {cvsLoading ? (
              <div className="flex items-center justify-center h-20">
                <div className="w-6 h-6 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
              </div>
            ) : cvs.length === 0 ? (
              // Klasser från gamla
              <div className="p-4 mb-4 text-white bg-navy-800 rounded-md">
                <p>Du har inte laddat upp något CV ännu.</p>
                <button
                  onClick={() => router.push('/profile/cv')} // Länk från gamla
                  // Klasser från gamla
                  className="px-4 py-2 mt-2 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700"
                >
                  Ladda upp CV
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {cvs.map((cv) => (
                  <div
                    key={cv.id}
                    onClick={() => !isGenerating && !isSubmitting && setSelectedCV(cv.id)}
                    // Klasser från gamla
                    className={`p-4 cursor-pointer rounded-md ${
                      selectedCV === cv.id ? 'bg-navy-700 border border-pink-500' : 'bg-navy-800 hover:bg-navy-700'
                    } ${(isGenerating || isSubmitting) ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {/* Struktur från gamla */}
                    <p className="font-medium text-white">{cv.file_name}</p>
                     {/* Struktur från gamla - Förutsätter att cv_text finns */}
                     {/* <<< ÄNDRING START >>> Lägger till en null-check för cv_text, bra praxis */}
                     {cv.cv_text && (
                       <p className="text-sm text-gray-400 line-clamp-1">
                         {cv.cv_text.substring(0, 100)}...
                       </p>
                     )}
                     {/* <<< ÄNDRING SLUT >>> */}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Jobbannons (från gamla) */}
          <div>
            <h2 className="mb-2 text-xl font-semibold text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-400" />
              Jobbannons
            </h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Klistra in jobbannonsen här..."
              // Klasser från gamla
              className="w-full h-60 p-3 text-white bg-navy-800 border border-gray-700 rounded-md resize-none"
              disabled={isGenerating || isSubmitting}
            />
          </div>

          {/* Inställningar (Struktur från gamla) */}
          <div className="flex flex-wrap gap-4">
            {/* Tonalitet (från gamla) */}
            <div className="relative w-full" ref={tonalityDropdownRef}>
              <div className="flex items-center mb-2">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-pink-400" />
                  Tonalitet
                </h2>
                <div className="ml-2 text-gray-400 flex items-center text-sm">
                  <Info className="w-4 h-4 mr-1" />
                  <span>Välj hur ditt brev ska låta</span>
                </div>
              </div>

              {/* Tonalitetsväljare (från gamla) */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setIsTonalityOpen(!isTonalityOpen)}
                  disabled={isGenerating || isSubmitting}
                  // Klasser från gamla
                  className="flex items-center justify-between w-full px-4 py-3 text-white bg-navy-800 border border-gray-700 rounded-md"
                >
                  <div className="flex items-center">
                    {tonalityInfo[tonality].icon}
                    <span className="ml-2">{tonalityInfo[tonality].label}</span>
                     {/* Premium-badge logik/styling från gamla */}
                     {tonalityInfo[tonality].premiumOnly && (
                         <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500 text-black rounded-full font-medium">
                           Premium
                         </span>
                      )}
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${isTonalityOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {/* Dropdown (från gamla, med loggning i onClick) */}
                {isTonalityOpen && (
                  <div className="absolute z-30 w-full mt-1 bg-navy-700 border border-gray-600 rounded-md shadow-lg">
                    {(Object.entries(tonalityInfo) as [Tonality, TonalityInfo][]).map(([value, info]) => (
                      <div key={value} className="border-b border-gray-700 last:border-0">
                        <button
                          onClick={() => {
                            if (info.premiumOnly && subscriptionTier === 'free') {
                              showNotification('info', 'Den här tonaliteten är endast tillgänglig för premium-användare', 3000); // Meddelande från gamla
                              // *** NYTT: Logga premiumförsök ***
                              if(profile?.id) {
                                  logUserActivity(profile.id, 'premium_feature_attempt', 'Försökte välja premium-tonalitet (AI-val)', { feature: 'tonality_auto' });
                              }
                              // *********************************
                              // Ingen handleUpgrade() i gamla koden här
                            } else {
                              setTonality(value);
                              setIsTonalityOpen(false);
                              // *** NYTT: Logga val ***
                              if(profile?.id) {
                                  logUserActivity(profile.id, 'setting_changed', 'Ändrade tonalitet', { setting: 'tonality', new_value: value });
                              }
                              // **********************
                            }
                          }}
                          disabled={info.premiumOnly && subscriptionTier === 'free'}
                          // Klasser från gamla
                          className={`flex items-center w-full p-3 text-left hover:bg-navy-600
                            ${tonality === value ? 'bg-navy-600' : ''}
                            ${info.premiumOnly && subscriptionTier === 'free' ? 'opacity-70 cursor-not-allowed' : ''}
                          `}
                        >
                          <div className="flex-shrink-0">{info.icon}</div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center">
                              {/* Klasser från gamla */}
                              <p className={`font-medium ${tonality === value ? 'text-pink-400' : 'text-white'}`}>
                                {info.label}
                              </p>
                              {/* Premium-badge från gamla */}
                              {info.premiumOnly && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500 text-black rounded-full font-medium">
                                  Premium
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{info.description}</p>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tonalitets-info (från gamla) */}
              <div className="p-4 bg-navy-800/50 rounded-md border border-gray-700">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">{tonalityInfo[tonality].icon}</div>
                  <div className="ml-3">
                    <p className="text-white font-medium">{tonalityInfo[tonality].label}</p>
                    <p className="text-sm text-gray-400 mt-1">{tonalityInfo[tonality].description}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      <span className="text-pink-400 font-medium">Rekommenderas för:</span> {tonalityInfo[tonality].recommendedFor}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Språkval (från gamla, med loggning i onClick) */}
            <div className="w-full">
              <h2 className="mb-2 text-xl font-semibold text-white flex items-center">
                {/* SVG Ikon från gamla */}
                <svg className="w-5 h-5 mr-2 text-green-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 5H12M2 5V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7H4C2.89543 7 2 6.10457 2 5ZM2 5C2 3.89543 2.89543 3 4 3H8C9.10457 3 10 3.89543 10 5V7"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 13L8 16.5M8 16.5L7 20M8 16.5L5 16.5M8 16.5L11 16.5"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 12L15 17L19 17"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Språk
              </h2>
              {/* Klasser från gamla */}
              <div className="flex p-1 bg-navy-800 border border-gray-700 rounded-md">
                <button
                  onClick={() => {
                      setLanguage('sv');
                      // *** NYTT: Logga språkbyte ***
                      if(profile?.id) { logUserActivity(profile.id, 'setting_changed', 'Ändrade språk', { setting: 'language', new_value: 'sv' }); }
                      // ****************************
                  }}
                  disabled={isGenerating || isSubmitting}
                  // Klasser från gamla
                  className={`flex-1 px-4 py-2 rounded-md font-medium flex items-center justify-center ${
                    language === 'sv'
                      ? 'bg-pink-600/80 text-white' // Stil från gamla
                      : 'text-gray-300 hover:bg-navy-700'
                  }`}
                >
                  <span className="mr-2">🇸🇪</span>
                  Svenska
                </button>
                <button
                  onClick={() => {
                      setLanguage('en');
                      // *** NYTT: Logga språkbyte ***
                      if(profile?.id) { logUserActivity(profile.id, 'setting_changed', 'Ändrade språk', { setting: 'language', new_value: 'en' }); }
                      // ****************************
                  }}
                  disabled={isGenerating || isSubmitting}
                   // Klasser från gamla
                  className={`flex-1 px-4 py-2 rounded-md font-medium flex items-center justify-center ${
                    language === 'en'
                      ? 'bg-pink-600/80 text-white' // Stil från gamla
                      : 'text-gray-300 hover:bg-navy-700'
                  }`}
                >
                  <span className="mr-2">🇬🇧</span>
                  English
                </button>
              </div>
            </div>
          </div>

          {/* Felmeddelande (från gamla) */}
          {error && (
            // Klasser från gamla
            <div className="p-3 text-white bg-red-500 rounded-md">
              {error}
            </div>
          )}


          {/* Genereringsknapp (från gamla) */}
          <button
            onClick={generateLetter} // Använder generateLetter som loggar
            // Disable-logik från gamla
            disabled={isButtonDisabled || (subscriptionTier === 'free' && remainingWeeklyLetters <= 0)}
            // Klasser från gamla
            className="w-full py-3 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
            aria-label={isGenerating || isSubmitting ? "Genererar brev..." : "Skapa ansökningsbrev"}
          >
            {isGenerating || isSubmitting ? (
              <span className="flex items-center justify-center">
                {/* Ikon från gamla */}
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Genererar...
              </span>
            ) : subscriptionTier === 'free' && remainingWeeklyLetters <= 0 ? (
               // Struktur från gamla
              <span className="flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Veckogräns nådd
              </span>
            ) : (
               // Struktur från gamla
              <span className="flex items-center justify-center">
                {/* Ikon från gamla */}
                <Upload className="w-5 h-5 mr-2" />
                Skapa ansökningsbrev
              </span>
            )}
          </button>
        </div> {/* Slut på vänster kolumn */}

        {/* Förhandsvisning (från gamla) */}
        <div className="p-6 overflow-auto bg-navy-800 rounded-lg" style={{ maxHeight: '80vh' }}> {/* Stil från gamla */}
          <h2 className="mb-4 text-xl font-semibold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-400" />
            Ditt ansökningsbrev
          </h2>

          {isGenerating || isSubmitting ? (
             // Loading state från gamla
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-10 h-10 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
              <p className="text-gray-300">Genererar ditt personliga brev...</p>
               {/* Text från gamla */}
              <p className="text-sm text-gray-400">Detta kan ta upp till 30 sekunder</p>
            </div>
          // <<< ÄNDRING START >>>
          // *** KORRIGERAD KONTROLL HÄR ***
          ) : generatedLetter && typeof generatedLetter === 'string' ? ( // <<< Lägg till typeof check
          // <<< ÄNDRING SLUT >>>
            // Brevet visas endast om generatedLetter är en icke-tom sträng
            <div>
              <div
                ref={letterContentRef}
                // Klasser och stil från gamla
                className="p-6 mb-4 overflow-auto bg-white rounded-md"
                style={{ maxHeight: '60vh' }}
              >
                 {/* Rendering från gamla */}
                 {/* Nu är detta anrop säkrare */}
                <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: generatedLetter.replace(/\n/g, '<br />') }} />
              </div>

              {/* Åtgärdsknappar (från gamla) */}
              <div className="flex flex-wrap gap-2"> {/* Gap från gamla */}
                {/* Spara-knapp (från gamla) */}
                <button
                  onClick={handleSaveLetter} // Använder handleSaveLetter som loggar
                  // Disable-logik från gamla
                  disabled={isSaving || (letterData && letterData.is_saved) || hasReachedLetterLimit}
                   // Klasser från gamla
                  className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                >
                  {isSaving ? (
                    <> {/* Struktur från gamla */}
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Sparar...
                    </>
                  ) : letterData && letterData.is_saved ? (
                    <> {/* Struktur från gamla */}
                      <Check className="w-4 h-4 mr-2" />
                      Sparat
                    </>
                  ) : hasReachedLetterLimit ? ( // Använder hasReachedLetterLimit från gamla
                    <> {/* Struktur från gamla */}
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Brev gräns nådd {/* Text från gamla */}
                    </>
                  ) : (
                    <> {/* Struktur från gamla */}
                      <Save className="w-4 h-4 mr-2" />
                      Spara brev
                    </>
                  )}
                </button>

                {/* Redigera-knapp (från gamla) */}
                <button
                  onClick={handleEdit} // Använder handleEdit som loggar
                   // Disable-logik från gamla (använder inte is_saved)
                  disabled={!letterData || !letterData.id}
                   // Klasser från gamla
                  className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Redigera
                </button>

                {/* Uppgraderingsknapp (från gamla) */}
                {hasReachedLetterLimit && subscriptionTier === 'free' && (
                  <button
                    onClick={handleUpgrade} // Använder handleUpgrade som loggar
                     // Klasser från gamla
                    className="px-4 py-2 font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 flex items-center"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Uppgradera till Premium {/* Text från gamla */}
                  </button>
                )}
              </div>

              {/* Notis om spargräns (från gamla) */}
              {hasReachedLetterLimit && (
                 // Klasser från gamla
                <div className="mt-4 p-3 bg-yellow-900/30 border-l-4 border-yellow-500 rounded-r text-sm">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    {/* Text från gamla */}
                    <p className="text-yellow-200">
                      {subscriptionTier === 'free'
                        ? `Som gratisanvändare kan du spara max ${maxSavedLetters} brev. Uppgradera till premium för obegränsad lagring eller radera något brev.`
                        : `Du har nått maxgränsen på ${maxSavedLetters} sparade brev. Radera något brev för att frigöra plats.`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
             // Placeholder (från gamla) - Visas om generatedLetter är null, undefined, tom, eller inte en sträng
            <div className="flex flex-col items-center justify-center h-64 text-center">
               {/* Ikon från gamla */}
              <div className="p-4 mb-4 text-6xl">📝</div>
              {/* Texter från gamla */}
              <p className="mb-2 text-lg text-gray-300">Ditt ansökningsbrev kommer att visas här</p>
              <p className="text-sm text-gray-400">Välj ett CV och klistra in en jobbannons för att generera ett personligt brev</p>
               {/* <<< ÄNDRING START >>> */}
               {/* Valfri extra felinfo om generatedLetter har ett värde men inte är en sträng */}
               {generatedLetter && typeof generatedLetter !== 'string' && (
                 <p className="mt-4 text-red-500 font-medium">Internt fel: Brevets format är ogiltigt.</p>
               )}
               {/* <<< ÄNDRING SLUT >>> */}
            </div>
          )}
        </div> {/* Slut på höger kolumn */}
      </div> {/* Slut på grid div */}
    </div> // Slut på container div
  )
}