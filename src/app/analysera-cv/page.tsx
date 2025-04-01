'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCVStore } from '@/store/cv-store'
import { useProfile } from '@/hooks/use-profile' // Behövs för prenumerationsinfo och gränser
import Notification from '@/components/ui/notification'
import CvAnalysisResults from '@/components/cv/CvAnalysisResults' // Komponenten för att visa resultat
import {
  FileText,
  Upload,
  SearchCheck, // Ikon för analys
  ClipboardList, // Ikon för resultat/placeholder
  AlertTriangle,
  Crown,
  Clock,
  Pencil, // För redigera-knapp
  Loader2, // En annan spinner-ikon från Lucide
  Info,
  MessageSquare // För "Skapa brev"-knapp
} from 'lucide-react'

export default function AnalyzeCvPage() {
  // Hooks
  const router = useRouter()
  const { cvs, fetchCVs, isLoading: cvsLoading } = useCVStore()
  const {
    subscriptionTier,
    // --- Nya värden från useProfile (Steg 1: Destrukturera) ---
    remainingWeeklyAnalyses,
    weeklyAnalysisLimit,    // Total gräns för tier
    nextAnalysisResetDate,  // Datum för nästa reset
    timeUntilAnalysisReset, // Formaterad tid till reset
    updateRemainingAnalyses, // Funktion för att uppdatera state
    updateNextAnalysisResetDate, // Funktion för att uppdatera state
    // --- Slut på nya värden ---
  } = useProfile()

  // State för sidan
  const [selectedCV, setSelectedCV] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any | null>(null) // För att lagra resultatet från API:et
  const [isAnalyzing, setIsAnalyzing] = useState(false) // Laddningsstate för analys
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'loading' as 'loading' | 'success' | 'error' | 'info',
  })

  // Refs
  const initialLoadRef = useRef(false)

  // --- Funktioner ---

  // Stäng notifikation
  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }))
  }, [])

  // Visa notifikation
  const showNotification = useCallback((type: 'loading' | 'success' | 'error' | 'info', message: string, duration?: number) => {
    setNotification({
      isVisible: true,
      message,
      type,
    });

    if (type !== 'loading' && duration) {
      setTimeout(closeNotification, duration);
    }
  }, [closeNotification])

  // Formatera datum (från create-letter)
   const formatDate = useCallback((dateString: string | Date) => {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }, []);

  // Hämta CVn vid sidladdning
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true
      fetchCVs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Välj första CV:t som standard
  useEffect(() => {
    if (cvs.length > 0 && !selectedCV) {
      setSelectedCV(cvs[0].id)
    }
  }, [cvs, selectedCV])

  // ** Huvudfunktion för att starta analysen (Steg 3: Uppdaterad) **
  const handleAnalyzeCv = useCallback(async () => {
    if (!selectedCV) {
      showNotification('error', 'Välj ett CV att analysera.', 3000)
      return
    }

    // --- NYTT: Kontrollera analysgräns för gratisanvändare --- (Steg 3a)
    if (subscriptionTier === 'free' && remainingWeeklyAnalyses <= 0) {
      showNotification('error', 'Du har nått din veckogräns för CV-analyser. Uppgradera till premium för obegränsad användning.', 5000);
      setError('Veckogräns nådd. Uppgradera till premium för obegränsad användning.'); // Optionellt felmeddelande
      return; // Stoppa funktionen
    }
    // --- SLUT PÅ GRÄNSKONTROLL ---

    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null) // Rensa gamla resultat
    showNotification('loading', 'Analyserar ditt CV...')

    try {
      const response = await fetch('/api/cv/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ cvId: selectedCV }),
      });

      const result = await response.json();

      closeNotification()

      if (!response.ok) {
        // Hantera specifika felkoder om API:et skickar dem
        if (response.status === 429) { // Too Many Requests (t.ex. gräns nådd på serversidan)
             showNotification('error', result.message || 'Du har nått din gräns för CV-analyser denna vecka.', 5000);
             // Uppdatera state även om serversidan säger ifrån (för konsekvens)
             if (typeof updateRemainingAnalyses === 'function') updateRemainingAnalyses(0);
             if (result.nextResetDate && typeof updateNextAnalysisResetDate === 'function') {
                 updateNextAnalysisResetDate(new Date(result.nextResetDate));
             }
        }
        throw new Error(result.message || `Fel ${response.status}: Något gick fel vid analysen`);
      }

      // Spara det riktiga resultatet från API:et
      setAnalysisResult(result);

      // --- NYTT: Uppdatera räknare i useProfile (Steg 3b) ---
      // Antag att API:et returnerar { success: true, ..., remainingAnalyses: X, nextResetDate: Y }
      if (result.remainingAnalyses !== undefined && typeof updateRemainingAnalyses === 'function') {
          updateRemainingAnalyses(result.remainingAnalyses);

          // Visa uppdaterat meddelande till användaren (likt create-letter)
          if (subscriptionTier === 'free') {
              const remainingText = result.remainingAnalyses === 0
                  ? 'Du har nu nått din veckogräns.'
                  : `Du har ${result.remainingAnalyses} ${result.remainingAnalyses === 1 ? 'analys' : 'analyser'} kvar denna vecka.`;
              showNotification('success', `CV-analysen är klar! ${remainingText}`, 5000);
          } else {
              showNotification('success', 'CV-analysen är klar!', 3000);
          }
      } else {
          // Fallback om API:et inte returnerar räknare
          showNotification('success', 'CV-analysen är klar!', 3000);
      }

      // Uppdatera reset-datum om det kommer från API:et
      if (result.nextResetDate && typeof updateNextAnalysisResetDate === 'function') {
          updateNextAnalysisResetDate(new Date(result.nextResetDate));
      }
      // --- SLUT PÅ UPPDATERING ---

    } catch (error: any) {
      console.error("Fel vid CV-analys:", error);
      closeNotification()
      const errorMessage = error.message.includes('Failed to fetch')
        ? 'Kunde inte ansluta till servern. Kontrollera din internetanslutning.'
        : error.message || 'Ett oväntat fel inträffade vid analysen.'
      setError(errorMessage)
      showNotification('error', errorMessage, 5000)
    } finally {
      setIsAnalyzing(false)
    }
    // --- NYTT: Uppdatera dependency array (Steg 3c) ---
  }, [
      selectedCV,
      showNotification,
      closeNotification,
      subscriptionTier, // Behövs för gränskontroll
      remainingWeeklyAnalyses, // Behövs för gränskontroll
      updateRemainingAnalyses, // Behövs för att uppdatera state
      updateNextAnalysisResetDate // Behövs för att uppdatera state
    ]);
  // --- SLUT PÅ UPPDATERING ---


  // Funktion för att navigera till redigering
  const handleEditCv = useCallback(() => {
    if (selectedCV) {
      router.push(`/profile/cv/${selectedCV}/edit`) // Dubbelkolla denna sökväg!
    }
  }, [selectedCV, router])

  // Funktion för att navigera till uppgradering (från create-letter)
  const handleUpgrade = useCallback(() => {
    router.push('/profile?tab=subscription'); // Antagande om fliknamn
  }, [router]);

  // Avgör om analysknappen ska vara inaktiverad (Steg 4: Uppdaterad)
  const isAnalyzeButtonDisabled = isAnalyzing || !selectedCV || cvsLoading || (subscriptionTier === 'free' && remainingWeeklyAnalyses <= 0);

  return (
    <div className="container max-w-6xl px-4 py-8 mx-auto">
      <Notification
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type as any}
        onClose={closeNotification}
      />

      <h1 className="mb-6 text-3xl font-bold text-white">Analysera ditt CV med AI</h1>
      <p className="mb-8 text-gray-300">
        Få insikter om styrkor, svagheter och förbättringsområden i ditt uppladdade CV.
      </p>

      {/* --- NYTT: Sektion för att visa analysgränser (Steg 2) --- */}
      {subscriptionTier === 'free' && weeklyAnalysisLimit > 0 && weeklyAnalysisLimit !== Infinity && ( // Visa bara om gräns finns och inte är oändlig
        <div className="mb-6 p-4 bg-navy-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <SearchCheck className="w-5 h-5 mr-2 text-pink-500" /> {/* Anpassad ikon */}
              <span className="text-white font-medium">CV-analyser denna vecka</span>
            </div>
            <div className="flex items-center">
              <span className="text-white">
                {/* Visa (Limit - Återstående) / Limit */}
                <span className={remainingWeeklyAnalyses <= 1 ? 'text-red-400' : ''}>
                  {weeklyAnalysisLimit - remainingWeeklyAnalyses}
                </span> / {weeklyAnalysisLimit}
              </span>
              {/* Visa uppgraderingsknapp om användaren är nära gränsen */}
              {remainingWeeklyAnalyses <= 1 && (
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

          {/* Visa info om nästa nollställning */}
          {nextAnalysisResetDate && (
            <div className="flex items-center mt-1 mb-1 text-xs text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              <span>Nollställs {timeUntilAnalysisReset ? `om ${timeUntilAnalysisReset}` : formatDate(nextAnalysisResetDate)}</span>
            </div>
          )}

          {/* Visa varning om användaren har få analyser kvar */}
          {remainingWeeklyAnalyses <= 1 && ( // Kan justera detta tröskelvärde
            <div className="mt-2 text-sm text-yellow-400 flex items-start">
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                Du har {remainingWeeklyAnalyses} {remainingWeeklyAnalyses === 1 ? 'analys' : 'analyser'} kvar denna vecka.
                {nextAnalysisResetDate && (
                  <span> Räknaren nollställs {timeUntilAnalysisReset ? `om ${timeUntilAnalysisReset}` : formatDate(nextAnalysisResetDate)}. </span>
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
      {/* --- SLUT PÅ NY SEKTION --- */}


      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* --- Vänster kolumn (Input) --- */}
        <div className="space-y-6">
          {/* CV-val */}
          <div>
            <h2 className="mb-2 text-xl font-semibold text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Välj CV att analysera
            </h2>
            {cvsLoading ? (
              <div className="flex items-center justify-center h-20 bg-navy-800 rounded-md">
                <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
              </div>
            ) : cvs.length === 0 ? (
              <div className="p-4 text-white bg-navy-800 rounded-md border border-gray-700">
                <p className="mb-3">Du har inte laddat upp något CV ännu.</p>
                <button
                  onClick={() => router.push('/profile/cv')} // Dubbelkolla sökväg
                  className="px-4 py-2 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Ladda upp CV
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {cvs.map((cv) => (
                  <div
                    key={cv.id}
                    onClick={() => !isAnalyzing && setSelectedCV(cv.id)}
                    className={`p-4 cursor-pointer rounded-md border ${
                      selectedCV === cv.id
                        ? 'bg-navy-700 border-pink-500'
                        : 'bg-navy-800 border-gray-700 hover:bg-navy-700 hover:border-gray-600'
                    } ${isAnalyzing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <p className="font-medium text-white">{cv.file_name}</p>
                    <p className="text-sm text-gray-400 line-clamp-1">
                      {cv.cv_text ? `${cv.cv_text.substring(0, 80)}...` : cv.file_name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Felmeddelande */}
          {error && (
            <div className="p-3 text-white bg-red-600 rounded-md border border-red-800">
              {error}
            </div>
          )}

          {/* Analysknapp (Steg 4: Uppdaterad) */}
          <button
            onClick={handleAnalyzeCv}
            disabled={isAnalyzeButtonDisabled}
            className="w-full py-3 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            aria-label={isAnalyzing ? "Analyserar CV..." : (subscriptionTier === 'free' && remainingWeeklyAnalyses <= 0) ? "Veckogräns nådd" : "Analysera CV"}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Analyserar...
              </>
            ) : (subscriptionTier === 'free' && remainingWeeklyAnalyses <= 0) ? ( // --- NYTT VILLKOR FÖR KNAPPTEXT ---
              <>
                <AlertTriangle className="w-5 h-5 mr-2" />
                Veckogräns nådd
              </>
            ) : (
                <>
                  <SearchCheck className="w-5 h-5 mr-2" />
                  Analysera CV
                </>
              )
            }
          </button>
        </div>

        {/* --- Höger kolumn (Output) --- */}
        <div className="p-6 bg-navy-800 rounded-lg border border-gray-700" style={{ minHeight: '400px' }}>
          <h2 className="mb-4 text-xl font-semibold text-white flex items-center">
            <ClipboardList className="w-5 h-5 mr-2 text-green-400" />
            CV-Analys Resultat
          </h2>

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
              <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
              <p className="text-gray-300">Analyserar ditt CV...</p>
              <p className="text-sm text-gray-400">Detta kan ta några sekunder.</p>
            </div>
          ) : analysisResult ? (
            <>
             <CvAnalysisResults data={analysisResult} /> {/* Använder resultatkomponenten */}
             <div className="mt-6 flex flex-wrap gap-3">
                <button
                    onClick={handleEditCv}
                    disabled={!selectedCV}
                    className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                >
                    <Pencil className="w-4 h-4 mr-2" />
                    Redigera CV
                </button>
                <button
                    onClick={() => router.push(`/skapa-brev?cvId=${selectedCV}`)} // Dubbelkolla sökväg
                    disabled={!selectedCV}
                    className="px-4 py-2 font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Skapa brev med detta CV
                </button>
             </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <SearchCheck className="w-16 h-16 mb-4 text-gray-600" />
              <p className="mb-2 text-lg text-gray-300">Din CV-analys kommer att visas här</p>
              <p className="text-sm text-gray-400">Välj ett CV från listan och klicka på "Analysera CV".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}