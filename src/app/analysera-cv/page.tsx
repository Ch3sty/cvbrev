/**
 * AnalyzeCvPage Component
 * Handles CV selection, initiates AI analysis, displays results,
 * and manages analysis limits based on user subscription tier.
 * Uses Zustand for global CV state and a custom hook for profile/subscription info.
 */
'use client'

// --- Core React/Next Imports ---
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- State Management & Hooks ---
import { useCVStore } from '@/store/cv-store';
import { useProfile } from '@/hooks/use-profile';

// --- UI Components ---
import Notification from '@/components/ui/notification';
import CvAnalysisResults from '@/components/cv/CvAnalysisResults';

// --- Utility Functions ---
import { logUserActivity } from '@/lib/activity-logger';

// --- Icons ---
import {
  FileText, Upload, SearchCheck, ClipboardList, AlertTriangle,
  Crown, Clock, Pencil, Loader2, MessageSquare, ChevronRight, Check
} from 'lucide-react';

// --- Constants ---
const PROFILE_CV_ROUTE = '/profile?tab=cv';
const CREATE_LETTER_ROUTE_BASE = '/create-letter';
const UPGRADE_ROUTE = '/profile?tab=subscription';
const API_ANALYZE_ROUTE = '/api/cv/analyze';
const NOTIFICATION_DURATION_MS = 5000;

// --- Types ---
type NotificationType = 'loading' | 'success' | 'error' | 'info';
interface NotificationState {
  isVisible: boolean;
  message: string;
  type: NotificationType;
}

// ============================================================================
//  Component Definition
// ============================================================================
export default function AnalyzeCvPage() {
  // --- Hooks ---
  const router = useRouter();
  const { cvs, fetchCVs, isLoading: cvsLoading } = useCVStore();
  const {
    profile, subscriptionTier, remainingWeeklyAnalyses, weeklyAnalysisLimit,
    nextAnalysisResetDate, timeUntilAnalysisReset, updateRemainingAnalyses,
    updateNextAnalysisResetDate, loading: profileLoading
  } = useProfile();

  // --- State ---
  const [selectedCV, setSelectedCV] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null); // Consider using a more specific type if defined globally
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    isVisible: false, message: '', type: 'loading',
  });

  // --- Refs ---
  const initialLoadRef = useRef(false);
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

  // --- Effects ---
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchCVs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchCVs identity is stable

  useEffect(() => {
    if (!selectedCV && cvs && cvs.length > 0) {
      setSelectedCV(cvs[0].id);
    }
  }, [cvs, selectedCV]);

  // --- Helper Functions ---
  const formatDate = useCallback((dateString: string | Date | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { console.error("Error formatting date:", e); return ''; }
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
    setTimeout(() => setNotification(prev => prev && !prev.isVisible ? { ...prev, message: '', type: 'loading' } : prev), 300);
  }, []);

  const showNotification = useCallback((type: NotificationType, message: string, duration: number = NOTIFICATION_DURATION_MS) => {
    setNotification({ isVisible: true, message, type });
    if (type !== 'loading') { setTimeout(closeNotification, duration); }
  }, [closeNotification]);

  // --- Event Handlers ---
  const handleAnalyzeCv = useCallback(async () => {
    if (!selectedCV) { showNotification('error', 'Välj ett CV att analysera.', 3000); return; }
    const isFreeTier = subscriptionTier === 'free';
    const hasReachedLimit = isFreeTier && remainingWeeklyAnalyses !== null && remainingWeeklyAnalyses <= 0;
    if (hasReachedLimit) { showNotification('error', 'Du har nått din veckogräns för CV-analyser. Uppgradera till premium för obegränsad användning.', NOTIFICATION_DURATION_MS); setError('Veckogräns nådd. Uppgradera till premium.'); return; }

    setIsAnalyzing(true); setError(null); setAnalysisResult(null); showNotification('loading', 'Analyserar ditt CV...');

    try {
      const response = await fetch(API_ANALYZE_ROUTE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cvId: selectedCV }) });
      const result = await response.json();
      closeNotification();
      if (!response.ok) { if (response.status === 429) { showNotification('error', result.message || 'Du har nått din gräns för CV-analyser denna vecka.', NOTIFICATION_DURATION_MS); if (typeof updateRemainingAnalyses === 'function') updateRemainingAnalyses(0); } throw new Error(result.message || `Serverfel ${response.status}: Något gick fel vid analysen.`); }

      setAnalysisResult(result);

      if (result.remainingAnalyses !== undefined && typeof updateRemainingAnalyses === 'function') {
        updateRemainingAnalyses(result.remainingAnalyses);
        if (isFreeTier) { const remainingCount = result.remainingAnalyses; const limitText = remainingCount === 0 ? 'Du har nu nått din veckogräns.' : `Du har ${remainingCount} ${remainingCount === 1 ? 'analys' : 'analyser'} kvar denna vecka.`; showNotification('success', `CV-analysen är klar! ${limitText}`, NOTIFICATION_DURATION_MS + 1000); } else { showNotification('success', 'CV-analysen är klar!', NOTIFICATION_DURATION_MS - 1000); }
      } else { showNotification('success', 'CV-analysen är klar!', NOTIFICATION_DURATION_MS - 1000); }
      if (result.nextResetDate && typeof updateNextAnalysisResetDate === 'function') { updateNextAnalysisResetDate(new Date(result.nextResetDate)); }

      if (profile?.id && selectedCV) { const cvFileName = cvs?.find(cv => cv.id === selectedCV)?.file_name || selectedCV; logUserActivity(profile.id, 'cv_analysis_completed', `Successfully analyzed CV: ${cvFileName}`, { cvId: selectedCV, tier: subscriptionTier }).catch(e => console.error("Activity logging failed:", e)); }

    } catch (error: any) {
      console.error("Fel vid CV-analys:", error); closeNotification();
      const errorMessage = error.message?.includes('Failed to fetch') ? 'Nätverksfel. Kontrollera din anslutning och försök igen.' : error.message || 'Ett oväntat fel inträffade vid analysen.';
      setError(errorMessage); showNotification('error', errorMessage, NOTIFICATION_DURATION_MS);
    } finally { setIsAnalyzing(false); }
  }, [ selectedCV, showNotification, closeNotification, subscriptionTier, remainingWeeklyAnalyses, updateRemainingAnalyses, updateNextAnalysisResetDate, profile, cvs ]);

  const handleNavigateToCvManagement = useCallback(() => { router.push(PROFILE_CV_ROUTE); }, [router]);
  const handleUpgrade = useCallback(() => { router.push(UPGRADE_ROUTE); }, [router]);

  // --- Derived State ---
  const isFreeTier = subscriptionTier === 'free';
  const hasReachedLimit = isFreeTier && remainingWeeklyAnalyses !== null && remainingWeeklyAnalyses <= 0;
  const isAnalyzeButtonDisabled = isAnalyzing || !selectedCV || cvsLoading || profileLoading || hasReachedLimit; // Added profileLoading check
  const analyzeButtonAriaLabel = isAnalyzing ? "Analyserar CV..." : hasReachedLimit ? "Veckogräns för analyser nådd" : "Starta CV-analys";

  // ============================================================================
  //  JSX Rendering
  // ============================================================================
  // Om sidan håller på att omdirigeras eller användaren inte är inloggad, visa ingenting
  if (profileLoading || !profile) {
    return null;
  }
  
  return (
    <div className="max-w-screen-xl mx-auto pt-8 pb-16 px-4"> {/* Kept wider max-width */}
      {/* --- Notification Area --- */}
      {notification.isVisible && ( <Notification isVisible={notification.isVisible} message={notification.message} type={notification.type} onClose={closeNotification} /> )}

      {/* --- Page Header --- */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analysera CV</h1>
        <p className="text-gray-300">Se exakt vad rekryterare letar efter i ditt CV.</p>
      </header>

      {/* --- Analysis Limits Info (Free Tier Only) - UPPDATERAD SEKTION --- */}
      {isFreeTier && weeklyAnalysisLimit > 0 && weeklyAnalysisLimit !== Infinity && (
        <section aria-labelledby="analysis-limit-heading" className="mb-8 p-5 bg-navy-800 rounded-lg border border-navy-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 id="analysis-limit-heading" className="flex items-center mb-1 font-medium text-white">
                <SearchCheck className="w-5 h-5 mr-2 text-pink-400" /> Veckans CV-analyser
              </h2>
              <p className="text-xs text-gray-400 pl-7">
                Gratisanvändare kan göra {weeklyAnalysisLimit} {weeklyAnalysisLimit === 1 ? 'analys' : 'analyser'} per vecka.
              </p>
            </div>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end sm:justify-start">
              <span className={`text-sm font-semibold px-2 py-0.5 rounded ${
                hasReachedLimit ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
              }`}>
                {remainingWeeklyAnalyses ?? '-'} / {weeklyAnalysisLimit} kvar
              </span>
              {hasReachedLimit && (
                <button
                  onClick={handleUpgrade}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white transition-all duration-300 bg-gradient-to-r from-pink-600 to-purple-600 rounded-md shadow-md hover:shadow-lg hover:from-pink-700 hover:to-purple-700 group"
                  aria-label="Uppgradera till Premium för fler analyser"
                >
                  <Crown className="w-3 h-3 mr-1" /> Uppgradera
                  <ChevronRight className="w-3 h-3 ml-1 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              )}
            </div>
          </div>
          
          {nextAnalysisResetDate && (
            <div className="flex items-center mt-3 text-xs text-gray-400 border-t border-navy-700 pt-3">
              <Clock className="w-3 h-3 mr-1.5" />
              <span>Nollställs {timeUntilAnalysisReset ? `om ${timeUntilAnalysisReset}` : formatDate(nextAnalysisResetDate)}</span>
            </div>
          )}
          
          {hasReachedLimit && (
            <div className="mt-3 text-sm text-yellow-300 flex items-start">
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                Du har nått din veckogräns för CV-analyser. 
                <button onClick={handleUpgrade} className="ml-1 text-pink-400 hover:text-pink-300 underline font-medium">Uppgradera</button>
                 för obegränsad användning.
              </span>
            </div>
          )}
        </section>
      )}
      {/* --- SLUT PÅ UPPDATERAD SEKTION --- */}

      {/* --- Main Content Grid (Layout Justerad) --- */}
      {/* Changed to lg:grid-cols-3. Left takes lg:col-span-1, Right takes lg:col-span-2 */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* --- Left Column: CV Selection & Actions --- */}
        {/* Changed to lg:col-span-1 */}
        <section aria-labelledby="cv-selection-heading" className="space-y-6 lg:col-span-1">
          <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
            <h2 id="cv-selection-heading" className="text-xl font-semibold mb-5 text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Välj CV
            </h2>
            <div className="min-h-[10rem]">
              {cvsLoading || profileLoading ? (
                <div className="flex items-center justify-center h-32"><Loader2 className="w-8 h-8 text-pink-500 animate-spin" aria-label="Laddar CV-lista..." /></div>
              ) : cvs.length === 0 ? (
                <div className="border border-navy-700 border-dashed rounded-lg p-6 bg-navy-900/50 text-center flex flex-col items-center justify-center h-full"> <FileText className="w-10 h-10 mx-auto mb-3 text-gray-600" /> <p className="text-lg mb-1 text-gray-300">Inga CV:n uppladdade</p> <p className="text-sm text-gray-500 mb-4">Ladda upp ditt CV för att kunna analysera det.</p> <Link href={PROFILE_CV_ROUTE} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700"> <Upload className="w-4 h-4 mr-2" /> Gå till CV-hantering </Link> </div>
              ) : (
                <ul className="space-y-3 max-h-80 overflow-y-auto elegant-scrollbar pr-1">
                  {cvs.map((cv) => ( <li key={cv.id}> <button type="button" onClick={() => !isAnalyzing && setSelectedCV(cv.id)} disabled={isAnalyzing} className={`w-full text-left p-4 rounded-md border transition-all duration-200 flex items-start gap-3 ${ selectedCV === cv.id ? 'bg-navy-700 border-pink-500 ring-1 ring-pink-500 shadow-md' : 'bg-navy-900/50 border-navy-700 hover:bg-navy-700 hover:border-navy-600' } ${isAnalyzing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`} aria-pressed={selectedCV === cv.id} > <FileText className={`w-5 h-5 mt-0.5 flex-shrink-0 ${selectedCV === cv.id ? 'text-pink-400' : 'text-blue-400'}`} /> <div className="flex-grow overflow-hidden"> <p className={`font-medium truncate ${selectedCV === cv.id ? 'text-white' : 'text-gray-200'}`}>{cv.file_name}</p> <p className="text-xs text-gray-400 truncate"> {cv.cv_text ? `Innehåll: ${cv.cv_text.substring(0, 60)}...` : 'Förhandsgranskning saknas'} </p> </div> {selectedCV === cv.id && <Check className="w-5 h-5 text-pink-400 flex-shrink-0" aria-hidden="true" />} </button> </li> ))}
                </ul>
              )}
            </div>
          </div>
          {error && ( <div role="alert" className="p-3 text-sm text-red-100 bg-red-900/50 border border-red-500/50 rounded-md"> {error} </div> )}
          <button onClick={handleAnalyzeCv} disabled={isAnalyzeButtonDisabled} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-700 transition-all duration-300" aria-label={analyzeButtonAriaLabel} aria-live="polite" >
            {isAnalyzing ? ( <> <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" aria-hidden="true" /> Analyserar... </> ) : hasReachedLimit ? ( <> <AlertTriangle className="w-5 h-5 mr-2" aria-hidden="true" /> Veckogräns nådd </> ) : ( <> <SearchCheck className="w-5 h-5 mr-2" aria-hidden="true" /> Analysera valt CV </> )}
          </button>
        </section>

        {/* --- Right Column: Analysis Results --- */}
        {/* Changed to lg:col-span-2 */}
        <section aria-labelledby="analysis-results-heading" className="bg-navy-800 rounded-lg p-6 border border-navy-700 lg:col-span-2 flex flex-col" style={{ minHeight: '400px' }}>
          <h2 id="analysis-results-heading" className="text-xl font-semibold mb-6 text-white flex items-center flex-shrink-0">
            <ClipboardList className="w-5 h-5 mr-2 text-green-400" />
            Resultat från analys
          </h2>
          <div className="flex-grow flex flex-col">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center text-center flex-grow"> <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" aria-label="Analys pågår"/> <p className="text-lg text-gray-300 mb-1">Analyserar ditt CV...</p> <p className="text-sm text-gray-400">Ett ögonblick, vi går igenom ditt CV.</p> </div>
            ) : analysisResult ? (
              <>
                {/* Pass the analysis result to the dedicated display component */}
                <div className="prose prose-sm prose-invert max-w-none elegant-scrollbar flex-grow mb-6" style={{ overflowY: 'auto' }}>
                  <CvAnalysisResults data={analysisResult} />
                </div>
                {/* Action buttons appear below the results */}
                <div className="mt-auto pt-4 border-t border-navy-700 flex flex-wrap gap-3 flex-shrink-0">
                  <button onClick={handleNavigateToCvManagement} className="inline-flex items-center px-4 py-2 border border-navy-600 text-sm font-medium rounded-md shadow-sm text-gray-300 bg-navy-700 hover:bg-navy-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-800 focus:ring-pink-500 transition-colors" aria-label="Hantera dina uppladdade CVn"> <Pencil className="w-4 h-4 mr-2" /> Hantera CV:n </button>
                  <button onClick={() => router.push(`${CREATE_LETTER_ROUTE_BASE}?cvId=${selectedCV}`)} disabled={!selectedCV} title={!selectedCV ? "Välj ett CV först" : "Skapa personligt brev med detta CV"} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-800 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all" aria-label={selectedCV ? "Skapa personligt brev baserat på det valda CV:t" : "Välj ett CV för att skapa brev"}> <MessageSquare className="w-4 h-4 mr-2" /> Skapa brev med CV </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center flex-grow"> <SearchCheck className="w-16 h-16 mb-4 text-gray-600" /> <p className="text-lg mb-1 text-gray-300">Analysen visas här</p> <p className="text-sm text-gray-400 max-w-xs"> Välj ett av dina uppladdade CV:n och klicka sedan på knappen "Analysera valt CV". </p> </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}