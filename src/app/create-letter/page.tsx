'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCVStore } from '@/store/cv-store'
import { useLetters } from '@/hooks/use-letters'
import { useProfile } from '@/hooks/use-profile'
// Behåll endast nödvändiga importer för loggning
import { logUserActivity } from '@/lib/activity-logger'
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
  AlertTriangle,
  Crown,
  Clock
} from 'lucide-react'
import Notification from '@/components/ui/notification'

type Tonality = 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced' | 'auto'
type Language = 'sv' | 'en'

interface TonalityInfo {
  label: string;
  description: string;
  icon: React.ReactNode;
  recommendedFor: string;
  premiumOnly?: boolean;
}

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
    premiumOnly: true
  }
};

export default function CreateLetterPage() {
  // Hooks
  const { cvs, fetchCVs, isLoading: cvsLoading } = useCVStore();
  const { createLetter, saveLetter, isGenerating } = useLetters();
  const {
    profile,
    subscriptionTier,
    remainingWeeklyLetters,
    hasReachedLetterLimit,
    savedLettersCount,
    maxSavedLetters,
    updateRemainingLetters,
    nextResetDate,
    timeUntilReset,
    updateNextResetDate
  } = useProfile();

  // State
  const [selectedCV, setSelectedCV] = useState<string | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [tonality, setTonality] = useState<Tonality>('balanced') // Default, ställs in från profil senare
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

  // Refs
  const letterContentRef = useRef<HTMLDivElement>(null);
  const tonalityDropdownRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(false);
  const generationInProgressRef = useRef(false);
  const lastGenerationAttemptRef = useRef(0);

  const router = useRouter()

  // IMPLEMENTERING AV FÖRVALD TONALITET - Ny useEffect
  useEffect(() => {
    // Sätt tonalitet baserat på profilinställningar när profilen laddas
    if (profile && profile.preferred_tonality) {
      // Kontrollera att tonaliteten är giltig (och tillgänglig för användarens prenumerationsnivå)
      const preferredTonality = profile.preferred_tonality;

      // Specialhantering för 'auto' tonalitet som kräver premium
      // *** FIX: Added type assertion (as Tonality) to resolve TypeScript error ***
      if ((preferredTonality as Tonality) === 'auto' && subscriptionTier !== 'premium') {
        // Om användaren har valt 'auto' i profilen men inte har premium, använd 'balanced' som fallback
        setTonality('balanced');
      } else if (
        ['professional', 'enthusiastic', 'creative', 'confident', 'balanced', 'auto'].includes(preferredTonality)
      ) {
        // Kontrollera att tonaliteten finns i listan över giltiga värden
        setTonality(preferredTonality as Tonality);
      }
    }
  }, [profile, subscriptionTier]);

  // Befintliga effects (oförändrade)
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

  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchCVs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Callbacks
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
      setTimeout(closeNotification, duration);
    }
  }, [closeNotification]);

  const formatDate = useCallback((dateString: string | Date) => {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }, []);

  // FOKUSERAD BREVGENERERINGSFUNKTION - med endast vital loggning
  const generateLetter = useCallback(async () => {
    // Validering
    if (!selectedCV || !jobDescription) {
      setError('Välj ett CV och lägg till en jobbannons.');
      showNotification('error', 'Välj ett CV och lägg till en jobbannons', 3000);
      return;
    }

    // Gränskontroll
    if (subscriptionTier === 'free' && remainingWeeklyLetters <= 0) {
      setError('Du har nått din veckogräns för brevgenerering. Uppgradera till premium för obegränsad användning.');
      showNotification('error', 'Veckogräns nådd. Uppgradera till premium för obegränsad användning.', 5000);
      return;
    }

    // Tidsbegränsning
    const now = Date.now();
    if (now - lastGenerationAttemptRef.current < 3000) {
      console.log('Förhindrar för snabba genereringsförsök');
      return;
    }

    // Dubblettanrops-check
    if (generationInProgressRef.current || isGenerating || isSubmitting) {
      console.log('Förhindrar dubblett brevgenerering, en generering pågår redan');
      return;
    }

    // Återställ och sätt flaggor
    setError(null);
    setGeneratedLetter(null);
    setLetterData(null);
    setIsSubmitting(true);
    generationInProgressRef.current = true;
    lastGenerationAttemptRef.current = now;
    showNotification('loading', 'Genererar ditt brev...');

    // *** VIKTIG LOGGNING #1: Logga start av brevgenerering ***
    if (profile?.id) {
      logUserActivity(
        profile.id,
        'letter_generation_started',
        'Användaren startade generering av personligt brev',
        { cv_id: selectedCV, language, tonality }
      );
    }

    let safetyTimer: NodeJS.Timeout | null = null;

    try {
      // Säkerhetstimer
      safetyTimer = setTimeout(() => {
        if (generationInProgressRef.current) {
          console.log('Säkerhetsåterställning av UI efter timeout');
          generationInProgressRef.current = false;
          setIsSubmitting(false);
          closeNotification();
          showNotification('error', 'Genereringen tog för lång tid, försök igen', 5000);
        }
      }, 45000);

      // Generera brevet
      const result = await createLetter({
        cv_id: selectedCV,
        job_description: jobDescription,
        tonality: tonality,
        language: language,
        save: false // Använder generate-preview
      });

      // Rensa säkerhetstimern
      if (safetyTimer) clearTimeout(safetyTimer);
      safetyTimer = null;
      closeNotification();

      // Hantera svaret (enklare än tidigare)
      if (result && typeof result === 'object') {
        // Extrahera brevinnehåll från de olika möjliga svarsformaten
        const letterContent = result.content ||
                            (result.data && result.data.content) || '';

        // Extrahera AI-metadata och kostnad för loggning
        const aiMetadata = result.ai_metadata ||
                         (result.data && result.data.ai_metadata) || {};

        if (letterContent && typeof letterContent === 'string' && letterContent.trim().length > 0) {
          setGeneratedLetter(letterContent);
          setLetterData(result.data || result);

          // *** VIKTIG LOGGNING #2: Logga lyckad generering MED KOSTNAD ***
          if (profile?.id) {
            logUserActivity(
              profile.id,
              'letter_created',
              'Lyckad generering av personligt brev',
              {
                cv_id: selectedCV,
                language,
                tonality,
                // Extrahera kostnad och modell för att spåra AI-användning
                model: aiMetadata.model || 'unknown',
                cost: aiMetadata.cost || null,
                tokens: aiMetadata.tokens?.total || null
              }
            );
          }
        } else {
          console.error("Tomt eller ogiltigt brevinnehåll från API");
          setError('Det genererade brevinnehållet är tomt eller ogiltigt. Försök igen.');
          showNotification('error', 'Kunde inte tolka det genererade brevet.', 5000);
        }
      } else {
        console.error("Oväntat eller tomt svar från API:", result);
        setError('Fick ett oväntat svar från servern. Försök igen.');
        showNotification('error', 'Servern svarade i ett oväntat format.', 5000);
      }

      // Uppdatera återställningsdatum
      const nextResetDateString = result?.nextResetDate ||
                               (result?.data && result.data.nextResetDate);

      if (nextResetDateString) {
        try {
          const newResetDate = new Date(nextResetDateString);
          if (!isNaN(newResetDate.getTime())) {
            updateNextResetDate(newResetDate);
          }
        } catch (e) {
          console.warn("Fel vid parsning av nextResetDate:", e);
        }
      }

      // Visa framgångsmeddelande
      if (generatedLetter) {
        const remainingLetters = result?.remainingLetters ||
                              (result?.data && result.data.remainingLetters);

        if (subscriptionTier === 'free' && remainingLetters !== undefined) {
          updateRemainingLetters(remainingLetters);
          const remainingText = remainingLetters === 0
            ? 'Du har nått din gräns för denna vecka.'
            : `Du har ${remainingLetters} genererade brev kvar denna vecka.`;

          showNotification('success', `Brevet har genererats! ${remainingText}`, 5000);
        } else {
          // Premium eller inget remaining info
          showNotification('success', 'Brevet har genererats!', 3000);
        }
      }

    } catch (error: any) {
      if (safetyTimer) clearTimeout(safetyTimer);
      safetyTimer = null;
      closeNotification();

      // Visa felmeddelande
      showNotification('error', 'Ett fel uppstod vid generering av brevet', 5000);
      setError(error.message || 'Ett fel uppstod vid generering av brevet.');

      // Återställ state vid catch
      setGeneratedLetter(null);
      setLetterData(null);
    } finally {
      // Återställ flaggor
      generationInProgressRef.current = false;
      setIsSubmitting(false);
    }
  }, [selectedCV, jobDescription, tonality, language, isGenerating, isSubmitting, createLetter, showNotification, closeNotification, subscriptionTier, remainingWeeklyLetters, updateRemainingLetters, updateNextResetDate, profile]);

  // FÖRENKLAD SPARFUNKTION - med endast vital loggning
  const handleSaveLetter = useCallback(async () => {
    if (!letterData) return;

    // Gränskontroll
    if (hasReachedLetterLimit || (subscriptionTier === 'free' && savedLettersCount >= maxSavedLetters)) {
      showNotification('error', `Som ${subscriptionTier === 'free' ? 'gratisanvändare' : 'användare'} kan du max spara ${maxSavedLetters} brev. Radera något brev eller uppgradera till premium.`, 5000);
      setError(`Du har nått maxgränsen på ${maxSavedLetters} sparade brev. Radera ett brev eller uppgradera.`);
      return;
    }

    try {
      setIsSaving(true);
      showNotification('loading', 'Sparar brevet...');

      // Anropa saveLetter
      const savedLetter = await saveLetter(letterData);

      closeNotification();

      if (savedLetter) {
        // Uppdatera state
        setLetterData({
          ...letterData,
          id: savedLetter.id,
          is_saved: true
        });
        showNotification('success', 'Brevet har sparats! Du hittar det under "Mina brev".', 3000);

        // *** VIKTIG LOGGNING #3: Logga lyckat sparande ***
        if (profile?.id && savedLetter.id) {
          logUserActivity(
            profile.id,
            'letter_saved',
            'Sparade ett genererat personligt brev',
            { letter_id: savedLetter.id }
          );
        }
      }
    } catch (error: any) {
      closeNotification();

      if (error.message && error.message.includes('maximal gräns')) {
        showNotification('error', error.message, 5000);
      } else {
        showNotification('error', 'Kunde inte spara brevet', 5000);
      }
      setError(error.message || 'Kunde inte spara brevet.');
    } finally {
      setIsSaving(false);
    }
  }, [letterData, saveLetter, showNotification, closeNotification, hasReachedLetterLimit, subscriptionTier, savedLettersCount, maxSavedLetters, profile]);

  // FÖRENKLAD REDIGERINGSFUNKTION - utan loggning
  const handleEdit = useCallback(() => {
    if (letterData && letterData.id) {
      router.push(`/my-letters/${letterData.id}/edit`);
    } else {
      showNotification('error', 'Brevet måste sparas innan det kan redigeras', 3000);
      setError('Brevet måste sparas innan det kan redigeras.');
    }
  }, [letterData, router, showNotification]);

  // FÖRENKLAD UPPGRADERINGSFUNKTION - endast loggning av klick
  const handleUpgrade = useCallback(() => {
    // *** VIKTIG LOGGNING #4: Logga klick på uppgraderingsknapp ***
    if (profile?.id) {
      logUserActivity(
        profile.id,
        'upgrade_clicked',
        'Klickade på uppgraderingsknapp',
        { current_tier: subscriptionTier }
      );
    }
    router.push('/profile?tab=subscription');
  }, [router, profile, subscriptionTier]);

  // Förenkla språkväljare-funktionerna (ta bort loggning)
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  // Förenkla tonalitetsväljare (ta bort loggning)
  const handleTonalitySelect = (value: Tonality) => {
    if (tonalityInfo[value].premiumOnly && subscriptionTier === 'free') {
      showNotification('info', 'Den här tonaliteten är endast tillgänglig för premium-användare', 3000);
    } else {
      setTonality(value);
      setIsTonalityOpen(false);
    }
  };

  // Beräkna om knappen ska vara inaktiverad
  const isButtonDisabled = isGenerating || isSubmitting || !selectedCV || !jobDescription;

  // --- JSX (ändrad tonalitetsväljare och språkväljare) ---
  return (
    <div className="container max-w-6xl px-4 py-8 mx-auto">
      {/* Notifikationskomponent */}
      <Notification
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        progress={notification.progress}
        onClose={closeNotification}
      />

      {/* Sidhuvud */}
      <h1 className="mb-6 text-3xl font-bold text-white">Skapa ditt personliga ansökningsbrev</h1>
      <p className="mb-8 text-gray-300">
        Välj ditt CV och klistra in jobbannonsen för att generera ett personligt brev
      </p>

      {/* Visa återstående brev */}
      {subscriptionTier === 'free' && (
        <div className="mb-6 p-4 bg-navy-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-pink-500" />
              <span className="text-white font-medium">Genererade brev denna vecka</span>
            </div>
            <div className="flex items-center">
              <span className="text-white">
                <span className={remainingWeeklyLetters <= 1 ? 'text-red-400' : ''}>
                  {5 - remainingWeeklyLetters}
                </span> / 5
              </span>
              {remainingWeeklyLetters <= 1 && (
                <button
                  onClick={handleUpgrade}
                  className="ml-3 px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white text-sm rounded-md flex items-center"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Uppgradera
                </button>
              )}
            </div>
          </div>

          {/* Nollställningsinfo */}
          {nextResetDate && (
            <div className="flex items-center mt-1 mb-1 text-xs text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              <span>Nollställs {timeUntilReset ? `om ${timeUntilReset}` : formatDate(nextResetDate)}</span>
            </div>
          )}

          {/* Varning om få brev kvar */}
          {remainingWeeklyLetters <= 2 && (
            <div className="mt-2 text-sm text-yellow-400 flex items-start">
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                Du har {remainingWeeklyLetters} {remainingWeeklyLetters === 1 ? 'brev' : 'brev'} kvar denna vecka.
                {nextResetDate && (
                  <span> Räknaren nollställs {timeUntilReset ? `om ${timeUntilReset}` : formatDate(nextResetDate)}. </span>
                )}
                <button
                  onClick={handleUpgrade}
                  className="ml-1 text-pink-400 hover:text-pink-300 underline"
                >
                  Uppgradera till premium
                </button> för obegränsad användning.
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {/* CV-val */}
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
              <div className="p-4 mb-4 text-white bg-navy-800 rounded-md">
                <p>Du har inte laddat upp något CV ännu.</p>
                <button
                  onClick={() => router.push('/profile/cv')}
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
                    className={`p-4 cursor-pointer rounded-md ${
                      selectedCV === cv.id ? 'bg-navy-700 border border-pink-500' : 'bg-navy-800 hover:bg-navy-700'
                    } ${(isGenerating || isSubmitting) ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <p className="font-medium text-white">{cv.file_name}</p>
                    {cv.cv_text && (
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {cv.cv_text.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Jobbannons */}
          <div>
            <h2 className="mb-2 text-xl font-semibold text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-400" />
              Jobbannons
            </h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Klistra in jobbannonsen här..."
              className="w-full h-60 p-3 text-white bg-navy-800 border border-gray-700 rounded-md resize-none"
              disabled={isGenerating || isSubmitting}
            />
          </div>

          {/* Inställningar */}
          <div className="flex flex-wrap gap-4">
            {/* Tonalitet */}
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

              {/* Tonalitetsväljare - utan onödig loggning */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setIsTonalityOpen(!isTonalityOpen)}
                  disabled={isGenerating || isSubmitting}
                  className="flex items-center justify-between w-full px-4 py-3 text-white bg-navy-800 border border-gray-700 rounded-md"
                >
                  <div className="flex items-center">
                    {tonalityInfo[tonality].icon}
                    <span className="ml-2">{tonalityInfo[tonality].label}</span>
                    {tonalityInfo[tonality].premiumOnly && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500 text-black rounded-full font-medium">
                        Premium
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${isTonalityOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {/* Dropdown - utan onödig loggning */}
                {isTonalityOpen && (
                  <div className="absolute z-30 w-full mt-1 bg-navy-700 border border-gray-600 rounded-md shadow-lg">
                    {(Object.entries(tonalityInfo) as [Tonality, TonalityInfo][]).map(([value, info]) => (
                      <div key={value} className="border-b border-gray-700 last:border-0">
                        <button
                          onClick={() => handleTonalitySelect(value)}
                          disabled={info.premiumOnly && subscriptionTier === 'free'}
                          className={`flex items-center w-full p-3 text-left hover:bg-navy-600
                            ${tonality === value ? 'bg-navy-600' : ''}
                            ${info.premiumOnly && subscriptionTier === 'free' ? 'opacity-70 cursor-not-allowed' : ''}
                          `}
                        >
                          <div className="flex-shrink-0">{info.icon}</div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center">
                              <p className={`font-medium ${tonality === value ? 'text-pink-400' : 'text-white'}`}>
                                {info.label}
                              </p>
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

              {/* Tonalitets-info */}
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

            {/* Språkval - utan onödig loggning */}
            <div className="w-full">
              <h2 className="mb-2 text-xl font-semibold text-white flex items-center">
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
              <div className="flex p-1 bg-navy-800 border border-gray-700 rounded-md">
                <button
                  onClick={() => handleLanguageChange('sv')}
                  disabled={isGenerating || isSubmitting}
                  className={`flex-1 px-4 py-2 rounded-md font-medium flex items-center justify-center ${
                    language === 'sv'
                      ? 'bg-pink-600/80 text-white'
                      : 'text-gray-300 hover:bg-navy-700'
                  }`}
                >
                  <span className="mr-2">🇸🇪</span>
                  Svenska
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  disabled={isGenerating || isSubmitting}
                  className={`flex-1 px-4 py-2 rounded-md font-medium flex items-center justify-center ${
                    language === 'en'
                      ? 'bg-pink-600/80 text-white'
                      : 'text-gray-300 hover:bg-navy-700'
                  }`}
                >
                  <span className="mr-2">🇬🇧</span>
                  English
                </button>
              </div>
            </div>
          </div>

          {/* Felmeddelande */}
          {error && (
            <div className="p-3 text-white bg-red-500 rounded-md">
              {error}
            </div>
          )}

          {/* Genereringsknapp */}
          <button
            onClick={generateLetter}
            disabled={isButtonDisabled || (subscriptionTier === 'free' && remainingWeeklyLetters <= 0)}
            className="w-full py-3 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
            aria-label={isGenerating || isSubmitting ? "Genererar brev..." : "Skapa ansökningsbrev"}
          >
            {isGenerating || isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Genererar...
              </span>
            ) : subscriptionTier === 'free' && remainingWeeklyLetters <= 0 ? (
              <span className="flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Veckogräns nådd
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Upload className="w-5 h-5 mr-2" />
                Skapa ansökningsbrev
              </span>
            )}
          </button>
        </div>

        {/* Förhandsvisning */}
        <div className="p-6 overflow-auto bg-navy-800 rounded-lg" style={{ maxHeight: '80vh' }}>
          <h2 className="mb-4 text-xl font-semibold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-400" />
            Ditt ansökningsbrev
          </h2>

          {isGenerating || isSubmitting ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-10 h-10 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
              <p className="text-gray-300">Genererar ditt personliga brev...</p>
              <p className="text-sm text-gray-400">Detta kan ta upp till 30 sekunder</p>
            </div>
          ) : generatedLetter ? (
            <div>
              <div
                ref={letterContentRef}
                className="p-6 mb-4 overflow-auto bg-white rounded-md"
                style={{ maxHeight: '60vh' }}
              >
                <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: generatedLetter.replace(/\n/g, '<br />') }} />
              </div>

              {/* Åtgärdsknappar */}
              <div className="flex flex-wrap gap-2">
                {/* Spara-knapp */}
                <button
                  onClick={handleSaveLetter}
                  disabled={isSaving || (letterData && letterData.is_saved) || hasReachedLetterLimit}
                  className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Sparar...
                    </>
                  ) : letterData && letterData.is_saved ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Sparat
                    </>
                  ) : hasReachedLetterLimit ? (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Brev gräns nådd
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Spara brev
                    </>
                  )}
                </button>

                {/* Redigera-knapp */}
                <button
                  onClick={handleEdit}
                  disabled={!letterData || !letterData.id}
                  className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Redigera
                </button>

                {/* Uppgraderingsknapp */}
                {hasReachedLetterLimit && subscriptionTier === 'free' && (
                  <button
                    onClick={handleUpgrade}
                    className="px-4 py-2 font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 flex items-center"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Uppgradera till Premium
                  </button>
                )}
              </div>

              {/* Notis om spargräns */}
              {hasReachedLetterLimit && (
                <div className="mt-4 p-3 bg-yellow-900/30 border-l-4 border-yellow-500 rounded-r text-sm">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
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
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="p-4 mb-4 text-6xl">📝</div>
              <p className="mb-2 text-lg text-gray-300">Ditt ansökningsbrev kommer att visas här</p>
              <p className="text-sm text-gray-400">Välj ett CV och klistra in en jobbannons för att generera ett personligt brev</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}