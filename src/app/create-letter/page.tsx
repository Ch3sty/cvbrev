'use client'

// --- Core Imports ---
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Head from 'next/head'

// --- State Management & Hooks ---
import { useCVStore } from '@/store/cv-store'
import { useLetters } from '@/hooks/use-letters'
import { useProfile } from '@/hooks/use-profile'

// --- Utilities & Components ---
import { logUserActivity } from '@/lib/activity-logger'
import Notification from '@/components/ui/notification'

// --- Icon Imports (Lucide React) ---
import {
  FileText, Upload, MessageSquare, ChevronDown, Info, Building2, Sparkles,
  Lightbulb, Trophy, Scale, Bot, Pencil, Save, Check, AlertTriangle,
  Crown, Clock, ExternalLink, Languages, SlidersHorizontal, Eye,
  Loader2, ChevronRight
} from 'lucide-react'

// --- Types ---
type Tonality = 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced' | 'auto'
type Language = 'sv' | 'en'

interface TonalityInfo {
  label: string;
  description: string;
  icon: React.ReactNode;
  recommendedFor: string;
  premiumOnly?: boolean;
}

// --- Constants ---
const tonalityInfo: Record<Tonality, TonalityInfo> = {
  'professional': { label: 'Professionell', description: 'Formell och saklig ton.', icon: <Building2 className="w-5 h-5 text-blue-400" />, recommendedFor: 'Traditionella branscher.', premiumOnly: false },
  'enthusiastic': { label: 'Entusiastisk', description: 'Energisk och passionerad.', icon: <Sparkles className="w-5 h-5 text-pink-400" />, recommendedFor: 'Kreativa yrken, startups.', premiumOnly: false },
  'creative': { label: 'Kreativ', description: 'Innovativ och nytänkande.', icon: <Lightbulb className="w-5 h-5 text-yellow-400" />, recommendedFor: 'Design, marknadsföring.', premiumOnly: false },
  'confident': { label: 'Självsäker', description: 'Betonar prestationer och resultat.', icon: <Trophy className="w-5 h-5 text-amber-400" />, recommendedFor: 'Chefsroller, sälj.', premiumOnly: false },
  'balanced': { label: 'Balanserad', description: 'Blandning av professionalitet & personlighet.', icon: <Scale className="w-5 h-5 text-emerald-400" />, recommendedFor: 'De flesta tjänster.', premiumOnly: false },
  'auto': { label: 'AI-val (Premium)', description: 'AI anpassar tonen optimalt.', icon: <Bot className="w-5 h-5 text-purple-400" />, recommendedFor: 'Alla ansökningar för max effekt.', premiumOnly: true }
};

const GENERATION_TIMEOUT = 45000; // ms
const GENERATION_DEBOUNCE = 3000; // ms
const UPGRADE_ROUTE = '/profile?tab=subscription';

// --- Main Page Component ---
export default function CreateLetterPage() {
  // ========================================================================
  // Hooks
  // ========================================================================
  const router = useRouter();
  const { cvs, fetchCVs, isLoading: cvsLoading } = useCVStore();
  const { createLetter, saveLetter, isGenerating } = useLetters();
  const {
    profile,
    loading: profileLoading,
    subscriptionTier,
    remainingWeeklyLetters,
    hasReachedLetterLimit, // Gräns för *sparade* brev
    savedLettersCount, // Antal sparade brev
    maxSavedLetters,   // Max antal sparade brev
    updateRemainingLetters,
    nextResetDate,
    timeUntilReset,
    updateNextResetDate,
    weeklyLetterLimit
  } = useProfile();

  // ========================================================================
  // State
  // ========================================================================
  const [selectedCV, setSelectedCV] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [tonality, setTonality] = useState<Tonality>('balanced');
  const [language, setLanguage] = useState<Language>('sv');
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [letterData, setLetterData] = useState<any | null>(null); // Data associerad med det genererade brevet
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // För UI-låsning/feedback under generering
  const [isSaving, setIsSaving] = useState(false);         // För UI-låsning/feedback under sparande
  const [isTonalityOpen, setIsTonalityOpen] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false, message: '', type: 'loading' as 'loading' | 'success' | 'error' | 'info', progress: 0
  });

  // ========================================================================
  // Refs
  // ========================================================================
  const letterContentRef = useRef<HTMLDivElement>(null); // För scroll eller annan manipulation av förhandsvisning
  const tonalityDropdownRef = useRef<HTMLDivElement>(null); // För att stänga dropdown vid klick utanför
  const initialLoadRef = useRef(false); // För att bara köra initial datahämtning en gång
  const generationInProgressRef = useRef(false); // För att förhindra samtidiga genereringsanrop
  const lastGenerationAttemptRef = useRef(0); // För rate limiting på klienten
  const authCheckedRef = useRef(false); // För att bara kontrollera auth en gång

  // ========================================================================
  // Authentication Check Effect (Tidigt i effekt-kedjan)
  // ========================================================================
  useEffect(() => {
    if (!authCheckedRef.current && !profileLoading) {
      authCheckedRef.current = true;
      if (!profile) {
        console.log('Användare ej inloggad, omdirigerar till /login');
        router.push('/login');
      }
    }
  }, [profile, profileLoading, router]);

  // ========================================================================
  // Effects
  // ========================================================================

  // Ställ in initial tonalitet baserat på profil och prenumeration
  useEffect(() => {
    if (profile) {
        const preferred = profile.preferred_tonality as Tonality | undefined;
        if (preferred && tonalityInfo[preferred]) {
            if (preferred === 'auto' && subscriptionTier !== 'premium') {
                setTonality('balanced'); // Fallback om 'auto' vald men ej premium
            } else {
                setTonality(preferred);
            }
        } else if (!profile.preferred_tonality) {
            // Sätt default baserat på tier om ingen preferens finns
            setTonality(subscriptionTier === 'premium' ? 'auto' : 'balanced');
        }
        // Om preferred är ogiltig eller saknas i tonalityInfo, behåll nuvarande state (t.ex. 'balanced')
    }
  }, [profile, subscriptionTier]); // Körs när profil eller prenumeration laddas/ändras

  // Stäng tonalitetsdropdown vid klick utanför
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tonalityDropdownRef.current && !tonalityDropdownRef.current.contains(event.target as Node)) {
        setIsTonalityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fallback om tonalitet blir 'auto' men användaren är 'free'
  useEffect(() => {
    if (tonality === 'auto' && subscriptionTier === 'free') {
      setTonality('balanced');
    }
  }, [tonality, subscriptionTier]);

  // Hämta CVs vid första sidladdning
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchCVs();
    }
  }, [fetchCVs]);

  // Välj första CV:t i listan automatiskt om inget är valt
  useEffect(() => {
    if (cvs.length > 0 && !selectedCV) {
      setSelectedCV(cvs[0].id);
    }
  }, [cvs, selectedCV]);

  // Synkronisera UI-låsningsstate (isSubmitting) med hookens state (isGenerating)
  useEffect(() => {
    if (isGenerating !== isSubmitting) {
       setIsSubmitting(isGenerating);
       // Återställ ref när hooken indikerar att genereringen är klar
       if (!isGenerating) {
         generationInProgressRef.current = false;
       }
    }
 }, [isGenerating, isSubmitting]);

  // ========================================================================
  // Callbacks
  // ========================================================================

  // Funktion för att stänga notifikationer
  const closeNotification = useCallback(() => setNotification(prev => ({ ...prev, isVisible: false })), []);

  // Funktion för att visa notifikationer
  const showNotification = useCallback((type: 'loading' | 'success' | 'error' | 'info', message: string, duration: number | null = 3000) => {
    setNotification({ isVisible: true, message, type, progress: type === 'loading' ? 0 : 100 });
    // Stäng automatiskt om det inte är en 'loading'-notis och duration är satt
    if (type !== 'loading' && duration) {
      setTimeout(closeNotification, duration);
    }
  }, [closeNotification]);

  // Funktion för att formatera datumsträngar
  const formatDate = useCallback((dateString: string | Date | null): string => {
    if (!dateString) return '';
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        if (!date || isNaN(date.getTime())) return '';
        return date.toLocaleDateString('sv-SE', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        console.warn("Date formatting error:", e);
        return ''; // Returnera tom sträng vid fel
    }
  }, []);

  // --- Huvudfunktion: Generera Brev ---
  const generateLetter = useCallback(async () => {
    // 1. Validering
    if (!selectedCV || !jobDescription) {
      setError('Välj ett CV och klistra in jobbannonsen.');
      showNotification('error', 'Välj ett CV och klistra in jobbannonsen.', 3000);
      return;
    }
    // 2. Gränskontroll (Generering)
    if (subscriptionTier === 'free' && remainingWeeklyLetters <= 0) {
      setError('Du har nått din veckogräns för brevgenerering. Uppgradera till premium för obegränsad användning.');
      showNotification('error', 'Veckogräns nådd. Uppgradera till premium.', 5000);
      return;
    }
    // 3. Debounce & Dubblettanrop-skydd
    const now = Date.now();
    if (now - lastGenerationAttemptRef.current < GENERATION_DEBOUNCE) {
      console.log('Förhindrar för snabba genereringsförsök.');
      return;
    }
    if (generationInProgressRef.current || isGenerating || isSubmitting) {
      console.log('Förhindrar dubblett brevgenerering, en generering pågår redan.');
      return;
    }

    // 4. Förbered state & starta processen
    setError(null);
    setGeneratedLetter(null);
    setLetterData(null);
    setIsSubmitting(true); // Lås UI direkt
    generationInProgressRef.current = true;
    lastGenerationAttemptRef.current = now;
    showNotification('loading', 'Genererar ditt brev...');

    // 5. Logga start
    if (profile?.id) {
      logUserActivity(profile.id, 'letter_generation_started', 'Startade brevgenerering', { cv_id: selectedCV, language, tonality });
    }

    // 6. Säkerhetstimer
    // eslint-disable-next-line prefer-const -- Behöver vara let för att kunna nollställas
    let safetyTimer: NodeJS.Timeout | null = setTimeout(() => {
      if (generationInProgressRef.current) {
        console.warn('Generering timeout (klient).');
        generationInProgressRef.current = false;
        setIsSubmitting(false); // Viktigt att låsa upp UI
        closeNotification();
        showNotification('error', 'Genereringen tog för lång tid, försök igen. Kontakta support om problemet kvarstår.', 6000);
        setError('Genereringen tog för lång tid. Försök igen eller kontakta support.');
      }
    }, GENERATION_TIMEOUT);

    try {
      // 7. Anropa API
      const result = await createLetter({ cv_id: selectedCV, job_description: jobDescription, tonality: tonality, language: language, save: false });

      // 8. Hantera svar (när anropet är klart)
      if (safetyTimer) clearTimeout(safetyTimer); // Rensa timer
      closeNotification(); // Stäng "laddar"-notis

      if (result && typeof result === 'object') { // Grundläggande kontroll av svaret
        // Försök extrahera nödvändig data
        const letterContent = result.content || (result.data && result.data.content) || '';
        const aiMetadata = result.ai_metadata || (result.data && result.data.ai_metadata) || {};
        const aiModel = result.ai_model || (result.data && result.data.ai_model) || aiMetadata?.model || 'unknown';
        const aiTokens = result.ai_tokens || (result.data && result.data.ai_tokens) || aiMetadata?.tokens?.total || null;
        const aiCost = result.ai_cost || (result.data && result.data.ai_cost) || aiMetadata?.cost || null;
        const generationTimeMs = result.generation_time_ms || (result.data && result.data.generation_time_ms) || null;

        if (letterContent && typeof letterContent === 'string' && letterContent.trim().length > 10) { // Lite strängare längdkontroll
          setGeneratedLetter(letterContent);
          // Spara all relevant data från svaret
          const dataFromApi = result.data || result; // Använd 'data'-fältet om det finns, annars hela resultatet
          setLetterData({ ...dataFromApi, ai_model: aiModel, ai_tokens: aiTokens, ai_cost: aiCost, generation_time_ms: generationTimeMs, ai_metadata: aiMetadata });

          // Logga lyckad generering
          if (profile?.id) {
            logUserActivity(profile.id, 'letter_created', 'Lyckad brevgenerering', { cv_id: selectedCV, language, tonality, model: aiModel, cost: aiCost, tokens: aiTokens });
          }
        } else {
           console.error("Tomt eller ogiltigt brevinnehåll från API:", result);
           throw new Error('Det genererade brevinnehållet är tomt eller ogiltigt.'); // Kasta fel
        }

        // Uppdatera räknare och visa success-meddelande
        const remainingLetters = result?.remainingLetters ?? (result?.data && result.data.remainingLetters); // Använd ??
        const nextResetDateString = result?.nextResetDate ?? (result?.data && result.data.nextResetDate);

        if (nextResetDateString) {
          try {
            const newResetDate = new Date(nextResetDateString);
            if (!isNaN(newResetDate.getTime())) updateNextResetDate(newResetDate);
          } catch (e) { console.warn("Fel vid parsning av nextResetDate:", e); }
        }

        if (subscriptionTier === 'free' && remainingLetters !== undefined) {
          updateRemainingLetters(remainingLetters);
          const remainingText = remainingLetters <= 0 ? 'Du har nu nått din veckogräns.' : `Du har ${remainingLetters} genereringar kvar denna vecka.`;
          showNotification('success', `Brevet har genererats! ${remainingText}`, 5000);
        } else {
          showNotification('success', 'Brevet har genererats!', 3000);
        }

      } else {
        // Om resultatet är oväntat (t.ex. inte ett objekt, eller saknar nödvändig data)
        console.error("Oväntat eller tomt svar från API:", result);
        throw new Error('Fick ett oväntat svar från servern.'); // Kasta fel
      }
    } catch (error: any) {
      // 9. Felhantering
      if (safetyTimer) clearTimeout(safetyTimer); // Rensa timer även vid fel
      closeNotification(); // Stäng eventuell "laddar"-notis
      console.error("Fel vid generateLetter:", error);
      setError(error.message || 'Ett okänt fel uppstod vid generering.');
      showNotification('error', `Genereringen misslyckades: ${error.message || 'Okänt fel'}`, 5000);
      setGeneratedLetter(null); // Rensa vid fel
      setLetterData(null);     // Rensa vid fel

      // Logga misslyckad generering
      if (profile?.id) {
        logUserActivity(profile.id, 'letter_generation_failed', 'Misslyckad brevgenerering', { cv_id: selectedCV, language, tonality, error: error.message });
      }
    } finally {
      // 10. Återställ state (oavsett resultat)
      generationInProgressRef.current = false;
      // setIsSubmitting återställs automatiskt av dess useEffect när isGenerating från hooken blir false
    }
  }, [
    // Inkludera alla dependencies som används i callbacken
    selectedCV, jobDescription, tonality, language, isGenerating, isSubmitting, profile,
    subscriptionTier, remainingWeeklyLetters, createLetter, showNotification,
    closeNotification, updateRemainingLetters, updateNextResetDate
    // logUserActivity removed as it's not a valid dependency (outer scope function)
  ]);

  // --- Funktion: Spara Brev ---
  const handleSaveLetter = useCallback(async () => {
    if (!letterData) {
      showNotification('info', 'Inget genererat brev att spara.', 3000);
      return;
    }
    if (letterData.is_saved) {
        showNotification('info', 'Brevet är redan sparat.', 3000);
        return;
    }
    // Gränskontroll (Sparade brev)
    if (hasReachedLetterLimit) {
      const limitMsg = `Du har nått maxgränsen på ${maxSavedLetters} sparade brev. Radera ett gammalt brev eller uppgradera.`;
      showNotification('error', limitMsg, 6000);
      setError(limitMsg);
      return;
    }

    setIsSaving(true);
    showNotification('loading', 'Sparar brevet...');

    try {
      // Förbered data för sparande, inkludera AI metadata om den finns
      const letterToSave = {
        ...letterData,
        content: generatedLetter || letterData.content, // Se till att det senaste innehållet sparas
        // Prioritera toppnivå-metadata om den finns, annars från ai_metadata-objektet
        ai_model: letterData.ai_model ?? letterData.ai_metadata?.model,
        ai_tokens: letterData.ai_tokens ?? letterData.ai_metadata?.tokens?.total,
        ai_cost: letterData.ai_cost ?? letterData.ai_metadata?.cost,
        generation_time_ms: letterData.generation_time_ms,
        // Ta bort det potentiellt redundanta ai_metadata-objektet om vi har allt på toppnivå
        ai_metadata: undefined
      };
      // Radera ai_metadata om det är tomt eller onödigt
      if (!letterToSave.ai_model && !letterToSave.ai_tokens && !letterToSave.ai_cost) {
          delete letterToSave.ai_metadata;
      }


      const savedLetter = await saveLetter(letterToSave); // Anropa hookens saveLetter
      closeNotification();

      if (savedLetter && savedLetter.id) {
        // Uppdatera lokalt state för att reflektera att brevet är sparat
        setLetterData((prev: any) => ({ ...prev, id: savedLetter.id, is_saved: true }));
        showNotification('success', 'Brevet har sparats! Du hittar det under "Mina brev".', 3000);

        // Logga lyckat sparande
        if (profile?.id) {
          logUserActivity(profile.id, 'letter_saved', 'Sparade brev', { letter_id: savedLetter.id });
        }
      } else {
         // Om saveLetter inte returnerar ett ID eller indikerar framgång
         throw new Error("Sparandet misslyckades eller returnerade oväntad data.");
      }
    } catch (error: any) {
      closeNotification();
      console.error("Fel vid handleSaveLetter:", error);
      const errorMsg = error.message?.includes('maximal gräns')
        ? error.message // Visa specifik gräns-felmeddelande
        : 'Kunde inte spara brevet. Försök igen.';
      showNotification('error', errorMsg, 5000);
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  }, [letterData, generatedLetter, saveLetter, showNotification, closeNotification, hasReachedLetterLimit, maxSavedLetters, profile, logUserActivity]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Funktion: Redigera Brev ---
  const handleEdit = useCallback(() => {
    if (letterData?.id && letterData?.is_saved) { // Måste vara sparat
      router.push(`/my-letters/${letterData.id}/edit`);
    } else {
      showNotification('info', 'Brevet måste sparas innan det kan redigeras.', 3000);
      setError('Spara brevet först för att kunna redigera det.');
    }
  }, [letterData, router, showNotification]);

  // --- Funktion: Uppgradera ---
  const handleUpgrade = useCallback(() => {
    if (profile?.id) {
      logUserActivity(profile.id, 'upgrade_clicked', 'Klick på uppgradering', { source: 'create-letter', current_tier: subscriptionTier });
    }
    router.push(UPGRADE_ROUTE); // Gå till prissidan
  }, [router, profile, subscriptionTier, logUserActivity]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Funktioner för inställningar ---
  const handleLanguageChange = (lang: Language) => setLanguage(lang);
  const handleTonalitySelect = (value: Tonality) => {
    if (tonalityInfo[value].premiumOnly && subscriptionTier !== 'premium') {
      showNotification('info', `"${tonalityInfo[value].label}" är en premiumfunktion.`, 4000);
    } else {
      setTonality(value);
      setIsTonalityOpen(false);
    }
  };

  // ========================================================================
  // Beräknade Värden för UI
  // ========================================================================
  const isGenerateButtonDisabled = isSubmitting || !selectedCV || !jobDescription || cvsLoading || (subscriptionTier === 'free' && remainingWeeklyLetters <= 0);
  const isSaveButtonDisabled = isSaving || letterData?.is_saved || hasReachedLetterLimit || !generatedLetter;
  const isEditButtonDisabled = !letterData?.id || !letterData?.is_saved || !generatedLetter;
  const isFreeTier = subscriptionTier === 'free';
  const hasReachedLimit = isFreeTier && remainingWeeklyLetters !== null && remainingWeeklyLetters <= 0;


  // ========================================================================
  // JSX Render
  // ========================================================================
  // Om sidan håller på att omdirigeras eller användaren inte är inloggad, visa ingenting
  if (profileLoading || !profile) {
    return null;
  }

  return (
    <>
      {/* --- SEO Head --- */}
      <Head>
        <title>Skapa Personligt Brev med AI | Jobbcoach.ai</title>
        <meta name="description" content="Använd Jobbcoach.ai för att automatiskt generera ett skräddarsytt personligt brev baserat på ditt CV och jobbannonsen. Välj tonalitet och språk." />
        <meta name="keywords" content="skapa personligt brev, AI personligt brev, jobbansökan, ansökningsbrev, AI jobbcoach, generera brev" />
      </Head>

      {/* --- Notifikationskomponent --- */}
      <Notification
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        progress={notification.progress} // Behåller progress
        onClose={closeNotification}
      />

      {/* --- Huvudbehållare --- */}
      <div className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white">
          <div className="container max-w-7xl px-4 py-10 mx-auto">

              {/* --- Sidhuvud --- */}
              <div className="mb-8 md:mb-12 text-center">
                  <h1 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                      Skapa <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Personligt Brev</span> med AI
                  </h1>
                  <p className="max-w-2xl mx-auto text-lg text-gray-300">
                      Välj ditt CV, klistra in jobbannonsen och låt vår AI skapa ett unikt och anpassat utkast på sekunder.
                  </p>
              </div>

              {/* --- Veckogräns Info (Free Tier) - UPPDATERAD SEKTION --- */}
              {isFreeTier && weeklyLetterLimit > 0 && weeklyLetterLimit !== Infinity && (
                <section aria-labelledby="letter-limit-heading" className="mb-8 p-5 bg-navy-800 rounded-lg border border-navy-700">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h2 id="letter-limit-heading" className="flex items-center mb-1 font-medium text-white">
                        <MessageSquare className="w-5 h-5 mr-2 text-pink-400" /> Veckans brevgenereringar
                      </h2>
                      <p className="text-xs text-gray-400 pl-7">
                        Gratisanvändare kan göra {weeklyLetterLimit} {weeklyLetterLimit === 1 ? 'brevgenerering' : 'brevgenereringar'} per vecka.
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-end sm:justify-start">
                      <span className={`text-sm font-semibold px-2 py-0.5 rounded ${
                        hasReachedLimit ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                      }`}>
                        {remainingWeeklyLetters ?? '-'} / {weeklyLetterLimit} kvar
                      </span>
                      {hasReachedLimit && (
                        <button
                          onClick={handleUpgrade}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white transition-all duration-300 bg-gradient-to-r from-pink-600 to-purple-600 rounded-md shadow-md hover:shadow-lg hover:from-pink-700 hover:to-purple-700 group"
                          aria-label="Uppgradera till Premium för fler brevgenereringar"
                        >
                          <Crown className="w-3 h-3 mr-1" /> Uppgradera
                          <ChevronRight className="w-3 h-3 ml-1 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {nextResetDate && (
                    <div className="flex items-center mt-3 text-xs text-gray-400 border-t border-navy-700 pt-3">
                      <Clock className="w-3 h-3 mr-1.5" />
                      <span>Nollställs {timeUntilReset ? `om ${timeUntilReset}` : formatDate(nextResetDate)}</span>
                    </div>
                  )}
                  
                  {hasReachedLimit && (
                    <div className="mt-3 text-sm text-yellow-300 flex items-start">
                      <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Du har nått din veckogräns för brevgenereringar. 
                        <button onClick={handleUpgrade} className="ml-1 text-pink-400 hover:text-pink-300 underline font-medium">Uppgradera</button>
                        för obegränsad användning.
                      </span>
                    </div>
                  )}
                </section>
              )}
              {/* --- SLUT PÅ UPPDATERAD SEKTION --- */}

              {/* --- Huvudlayout (Grid) --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">

                  {/* === Vänsterkolumn: Input === */}
                  <div className="space-y-6 p-6 bg-navy-800/50 border border-navy-700 rounded-2xl shadow-xl flex flex-col"> {/* Lade till flex flex-col */}

                      {/* --- 1. Välj CV --- */}
                      <section>
                          <h2 className="mb-3 text-xl font-semibold text-white flex items-center">
                              <FileText className="w-5 h-5 mr-2 text-blue-400" />
                              1. Välj CV
                          </h2>
                          {/* Logik för CV-lista (oförändrad från förra versionen) */}
                          {cvsLoading ? (
                              <div className="flex items-center justify-center h-24 bg-navy-900/30 rounded-md">
                                  <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                              </div>
                          ) : cvs.length === 0 ? (
                              <div className="p-4 text-center bg-navy-900/30 rounded-md border border-navy-600">
                                  <p className="text-gray-300 mb-3">Inga CV:n uppladdade ännu.</p>
                                  <button onClick={() => router.push('/profile?tab=cv')} className="inline-flex items-center px-4 py-2 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 text-sm transition-colors">
                                      <Upload className="w-4 h-4 mr-2" /> Ladda upp CV
                                  </button>
                              </div>
                          ) : (
                              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 elegant-scrollbar">
                                  {cvs.map((cv) => (
                                      <div
                                          key={cv.id}
                                          onClick={() => !isSubmitting && setSelectedCV(cv.id)}
                                          className={`p-3 cursor-pointer rounded-lg transition-all duration-200 border ${ selectedCV === cv.id ? 'bg-navy-700 border-pink-500 shadow-inner scale-[1.02]' : 'bg-navy-900/60 border-navy-700 hover:bg-navy-700/70 hover:border-navy-600' } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`} >
                                          <p className="font-medium text-white truncate">{cv.file_name || `CV ${cv.id.substring(0, 6)}`}</p>
                                          {cv.created_at && <p className="text-xs text-gray-400">Uppladdat: {formatDate(cv.created_at)}</p>}
                                      </div>
                                  ))}
                              </div>
                          )}
                      </section>

                      {/* --- 2. Jobbannons --- */}
                      <section>
                          <h2 className="mb-3 text-xl font-semibold text-white flex items-center">
                              <MessageSquare className="w-5 h-5 mr-2 text-purple-400" />
                              2. Klistra in Jobbannons
                          </h2>
                          <textarea
                              value={jobDescription}
                              onChange={(e) => setJobDescription(e.target.value)}
                              placeholder="Klistra in hela jobbannonsen här..."
                              className="w-full h-52 p-3 text-sm text-gray-200 bg-navy-900/60 border border-navy-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 transition duration-200 elegant-scrollbar"
                              disabled={isSubmitting}
                              rows={10}
                              aria-label="Jobbannons"
                          />
                      </section>

                      {/* --- 3. Inställningar --- */}
                      <section>
                          <h2 className="mb-4 text-xl font-semibold text-white flex items-center">
                            <SlidersHorizontal className="w-5 h-5 mr-2 text-teal-400" />
                             3. Anpassa Utkastet
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Tonalitet */}
                              <div className="relative" ref={tonalityDropdownRef}>
                                  <label htmlFor="tonality-button" className="block text-sm font-medium text-gray-300 mb-1.5">Tonalitet</label>
                                  {/* Knapp och dropdown-logik (oförändrad från förra versionen) */}
                                  <button id="tonality-button" type="button" onClick={() => setIsTonalityOpen(!isTonalityOpen)} disabled={isSubmitting} className={`flex items-center justify-between w-full px-3 py-2.5 text-sm text-white bg-navy-900/60 border border-navy-700 rounded-lg hover:border-navy-600 transition-colors ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`} aria-haspopup="listbox" aria-expanded={isTonalityOpen} >
                                      <span className="flex items-center"> {tonalityInfo[tonality].icon} <span className="ml-2">{tonalityInfo[tonality].label}</span> {tonalityInfo[tonality].premiumOnly && ( <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-full leading-none"> PREMIUM </span> )} </span>
                                      <ChevronDown className={`w-4 h-4 transition-transform text-gray-400 ${isTonalityOpen ? 'rotate-180' : ''}`} />
                                  </button>
                                  {isTonalityOpen && ( <div className="absolute z-30 w-full mt-1 max-h-60 overflow-y-auto bg-navy-800 border border-navy-600 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fadeIn elegant-scrollbar"> {(Object.entries(tonalityInfo) as [Tonality, TonalityInfo][]).map(([value, info]) => ( <button key={value} onClick={() => handleTonalitySelect(value)} disabled={info.premiumOnly && subscriptionTier !== 'premium'} className={`flex items-center w-full px-3 py-3 text-left text-sm hover:bg-navy-700/70 transition-colors border-b border-navy-700/50 last:border-b-0 ${tonality === value ? 'bg-navy-700 font-semibold' : ''} ${info.premiumOnly && subscriptionTier !== 'premium' ? 'opacity-60 cursor-not-allowed relative' : ''}`} role="option" aria-selected={tonality === value} > <div className="flex-shrink-0 mr-2">{info.icon}</div> <div className="flex-1"> <span className={tonality === value ? 'text-pink-400' : 'text-white'}>{info.label}</span> <p className="text-xs text-gray-400 mt-0.5">{info.description}</p> </div> {info.premiumOnly && subscriptionTier !== 'premium' && ( <div className="ml-2 flex-shrink-0" title="Premiumfunktion"> <Crown className="w-4 h-4 text-yellow-400" /> </div> )} </button> ))} </div> )}
                              </div>
                              {/* Språk */}
                              <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Språk</label>
                                   {/* Knapp-logik (oförändrad från förra versionen) */}
                                  <div className="flex p-1 bg-navy-900/60 border border-navy-700 rounded-lg">
                                      <button onClick={() => handleLanguageChange('sv')} disabled={isSubmitting} className={`flex-1 px-3 py-2 rounded-md font-medium text-sm flex items-center justify-center transition-all duration-200 ${ language === 'sv' ? 'bg-pink-600 text-white shadow-sm scale-[1.03]' : 'text-gray-300 hover:bg-navy-700/50' } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`} > <span className="mr-1.5">🇸🇪</span> Svenska </button>
                                      <button onClick={() => handleLanguageChange('en')} disabled={isSubmitting} className={`flex-1 px-3 py-2 rounded-md font-medium text-sm flex items-center justify-center transition-all duration-200 ${ language === 'en' ? 'bg-pink-600 text-white shadow-sm scale-[1.03]' : 'text-gray-300 hover:bg-navy-700/50' } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`} > <span className="mr-1.5">🇬🇧</span> English </button>
                                  </div>
                              </div>
                          </div>
                           {/* Tonalitetsinfo */}
                          <div className="mt-4 p-3 bg-navy-900/40 rounded-lg border border-navy-700/50 text-xs">
                              <p className="text-gray-400 flex items-center">
                                  <Info size={14} className="mr-1.5 text-teal-400 flex-shrink-0"/>
                                  <span className="font-medium text-gray-300 mr-1">Vald ton: {tonalityInfo[tonality].label}.</span> {tonalityInfo[tonality].recommendedFor}
                              </p>
                          </div>
                      </section>

                       {/* --- Felmeddelande --- */}
                        {error && (
                            <div className="p-3 bg-red-900/40 border border-red-700/50 rounded-lg flex items-start text-sm mt-2"> {/* Lade till mt-2 */}
                                <AlertTriangle className="w-5 h-5 text-red-400 mr-2.5 flex-shrink-0 mt-0.5" />
                                <p className="text-red-200">{error}</p>
                            </div>
                        )}

                      {/* --- Genereringsknapp --- */}
                      <div className="pt-4 mt-auto"> {/* mt-auto knuffar ner knappen */}
                          <button
                              onClick={generateLetter}
                              disabled={isGenerateButtonDisabled}
                              className={`w-full py-3.5 px-6 font-semibold text-lg text-white rounded-xl shadow-lg transition-all duration-300 group flex items-center justify-center relative overflow-hidden ${ isGenerateButtonDisabled ? 'bg-gray-600 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02]' }`}
                              aria-label={isSubmitting ? "Genererar brev..." : "Skapa personligt brev"} >
                              {/* Knapp-innehåll (oförändrat från förra versionen) */}
                              {!isGenerateButtonDisabled && ( <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-20 group-hover:opacity-30 transition-opacity duration-300"></span> )}
                              <span className="relative z-10 flex items-center">
                                  {isSubmitting ? ( <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Genererar...</> ) : ( <><Sparkles className="w-5 h-5 mr-2 opacity-90 group-hover:scale-110 transition-transform" />Skapa Personligt Brev</> )}
                              </span>
                          </button>
                           {subscriptionTier === 'free' && remainingWeeklyLetters <= 0 && !isSubmitting && (
                                <p className="text-center text-xs text-red-400 mt-2.5">Veckogräns nådd. Uppgradera för fler.</p>
                           )}
                      </div>
                  </div> {/* Slut Vänsterkolumn */}

                  {/* === Högerkolumn: Förhandsgranskning === */}
                  <div className="p-6 bg-navy-800/50 border border-navy-700 rounded-2xl shadow-xl flex flex-col" style={{ minHeight: '70vh' }}>
                      {/* Section Header */}
                      <h2 className="mb-4 text-xl font-semibold text-white flex items-center">
                          <Eye className="w-5 h-5 mr-2 text-green-400" />
                          Förhandsgranskning
                      </h2>

                      {/* Inre container för brev/placeholder */}
                      <div className="flex-grow bg-navy-900/50 rounded-lg p-1 border border-navy-700/50 relative overflow-hidden min-h-[300px]">
                          {/* Laddning / Placeholder */}
                          {!generatedLetter && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-navy-900/30 to-navy-800/20">
                                  {/* Logik för laddning/placeholder (oförändrad från förra versionen) */}
                                  {isSubmitting ? ( <><Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" /><p className="text-lg font-medium text-gray-200">AI:n arbetar...</p><p className="text-sm text-gray-400 mt-1">Skapar ett unikt brev baserat på din data.</p></> ) : ( <><div className="p-3 mb-4 text-6xl opacity-40 filter grayscale">📄✨</div><p className="mb-1 text-base font-medium text-gray-300">Resultatet visas här</p><p className="text-sm text-gray-400">Fyll i informationen till vänster och klicka på "Skapa".</p></> )}
                              </div>
                          )}

                          {/* Genererat Brev */}
                          {generatedLetter && (
                              <div className="h-full overflow-y-auto p-5 sm:p-6 bg-white rounded-md shadow-inner elegant-scrollbar" ref={letterContentRef} >
                                   {/* Prose formatering (oförändrad från förra versionen) */}
                                  <div className="prose prose-sm sm:prose-base max-w-none text-gray-800 prose-headings:text-gray-900 prose-strong:text-gray-800" dangerouslySetInnerHTML={{ __html: generatedLetter.replace(/\n/g, '<br />') }} />
                              </div>
                          )}
                      </div>

                      {/* --- Åtgärdsknappar (visas när brev finns) --- */}
                      {generatedLetter && (
                          <div className="mt-5 flex flex-wrap gap-3 justify-start">
                               {/* Knappar (Spara, Redigera, Nytt Fönster) med logik oförändrad, endast styling */}
                              <button onClick={handleSaveLetter} disabled={isSaveButtonDisabled} className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border shadow-sm ${ isSaveButtonDisabled ? 'bg-navy-700 text-gray-500 border-navy-700 cursor-not-allowed' : 'bg-navy-700 text-white border-gray-600 hover:bg-navy-600 hover:border-gray-500 hover:scale-[1.03]' }`} > {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (letterData?.is_saved ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Save className="w-4 h-4 mr-2" />)} {isSaving ? 'Sparar...' : (letterData?.is_saved ? 'Sparat' : 'Spara brev')} </button>
                              <button onClick={handleEdit} disabled={isEditButtonDisabled} className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border shadow-sm ${ isEditButtonDisabled ? 'bg-navy-700 text-gray-500 border-navy-700 cursor-not-allowed' : 'bg-navy-700 text-white border-gray-600 hover:bg-navy-600 hover:border-gray-500 hover:scale-[1.03]' }`} > <Pencil className="w-4 h-4 mr-2" /> Redigera </button>
                              <button onClick={() => { const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes'); if (newWindow && generatedLetter) { newWindow.document.write(`<!DOCTYPE html><html><head><title>Personligt Brev - Förhandsgranskning</title><style>body{font-family:system-ui,sans-serif;padding:30px 40px;line-height:1.65;color:#2d3748;} .content{white-space:pre-wrap;}</style></head><body><div class="content">${generatedLetter.replace(/</g, "<").replace(/>/g, ">")}</div></body></html>`); newWindow.document.close(); } }} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-navy-700 border border-gray-600 rounded-lg hover:bg-navy-600 hover:border-gray-500 transition-all duration-200 shadow-sm hover:scale-[1.03]" > <ExternalLink className="w-4 h-4 mr-2" /> Visa i nytt fönster </button>
                              {/* Uppgraderingsknapp vid spargräns */}
                              {hasReachedLetterLimit && subscriptionTier === 'free' && !letterData?.is_saved && ( <button onClick={handleUpgrade} className="inline-flex items-center px-4 py-2 text-sm font-medium text-pink-400 bg-navy-700 border border-pink-700/50 rounded-lg hover:bg-pink-900/30 hover:text-pink-300 transition-colors ml-auto shadow-sm" > <Crown className="w-4 h-4 mr-2" /> Uppgradera för att spara </button> )}
                          </div>
                      )}
                        {/* --- Notis om spargräns --- */}
                        {hasReachedLetterLimit && generatedLetter && !letterData?.is_saved && (
                            <div className="mt-4 p-3 bg-yellow-900/40 border border-yellow-700/50 rounded-lg text-sm">
                                 {/* Logik oförändrad */}
                                <div className="flex items-start">
                                    <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                                    <p className="text-yellow-200"> {subscriptionTier === 'free' ? `Max ${maxSavedLetters} sparade brev för gratisanvändare. ` : `Max ${maxSavedLetters} sparade brev.`} <button onClick={() => router.push('/my-letters')} className="ml-1 underline hover:text-yellow-100 font-medium">Hantera</button> eller <button onClick={handleUpgrade} className="ml-1 underline hover:text-yellow-100 font-medium"> uppgradera</button>. </p>
                                </div>
                            </div>
                        )}
                  </div> {/* Slut Högerkolumn */}
              </div> {/* Slut Grid */}
          </div> {/* Slut Container */}
      </div> {/* Slut Huvudbehållare */}
    </>
  )
}