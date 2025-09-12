// src/app/kompetensutveckling/page.tsx
/**
 * CompetenceAnalysisPage Component
 * Main page for competence analysis. Allows users to select a CV
 * and then uses the CompetenceAnalysisTool component to handle
 * the analysis input, execution, and display of results.
 */
'use client';

// --- Core React/Next Imports ---
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- State Management & Hooks ---
import { useCVStore } from '@/store/cv-store';
import { useProfile } from '@/hooks/use-profile'; 

// --- UI Components ---
import Notification from '@/components/ui/notification';
import CompetenceAnalysisTool from '@/components/cv/CompetenceAnalysisTool';

// --- Utility Functions ---
import { logUserActivity } from '@/lib/activity-logger';

// --- Icons ---
import {
    FileText, Upload, Check, Loader2, Target, ClipboardList, 
    Crown, Clock, AlertTriangle, ChevronRight
} from 'lucide-react';

// --- Constants ---
const PROFILE_CV_ROUTE = '/profile?tab=cv';
const UPGRADE_ROUTE = '/profile?tab=subscription';
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
export default function CompetenceAnalysisPage() {
  // --- Hooks ---
  const router = useRouter();
  const { cvs, fetchCVs, isLoading: cvsLoading } = useCVStore();
  const { 
    profile, 
    subscriptionTier, 
    remainingWeeklyAnalyses,
    weeklyAnalysisLimit,
    nextAnalysisResetDate,
    timeUntilAnalysisReset,
    updateRemainingAnalyses,
    updateNextAnalysisResetDate,
    loading: profileLoading 
  } = useProfile();

  // --- State ---
  // CV Selection
  const [selectedCV, setSelectedCV] = useState<string | null>(null);

  // UI State
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
  // Hämta CVs vid första laddning
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchCVs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Välj första CV automatiskt
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
  const handleUpgrade = useCallback(() => {
    if (profile?.id) {
      logUserActivity(profile.id, 'upgrade_clicked', 'Klick på uppgradering', 
        { source: 'kompetensutveckling', current_tier: subscriptionTier });
    }
    router.push(UPGRADE_ROUTE);
  }, [router, profile, subscriptionTier, logUserActivity]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Derived State ---
  const isFreeTier = subscriptionTier === 'free';
  const hasReachedLimit = isFreeTier && remainingWeeklyAnalyses !== null && remainingWeeklyAnalyses <= 0;

  // ============================================================================
  //  JSX Rendering
  // ============================================================================
  // Om sidan håller på att omdirigeras eller användaren inte är inloggad, visa ingenting
  if (profileLoading || !profile) {
    return null;
  }
  
  return (
    <div className="max-w-screen-xl mx-auto pt-8 pb-16 px-4">
      {/* --- Notification Area --- */}
      {notification.isVisible && ( <Notification isVisible={notification.isVisible} message={notification.message} type={notification.type} onClose={closeNotification} /> )}

      {/* --- Page Header --- */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Target className="w-7 h-7 mr-3 text-cyan-400" /> Kompetensanalys & Utveckling
        </h1>
        <p className="text-gray-300">Analysera hur väl ditt CV matchar en specifik roll eller jobbannons och få förslag på utvecklingsområden.</p>
      </header>

      {/* --- Analysis Limits Info (Free Tier Only) --- */}
      {isFreeTier && weeklyAnalysisLimit > 0 && weeklyAnalysisLimit !== Infinity && (
        <section aria-labelledby="analysis-limit-heading" className="mb-8 p-5 bg-navy-800 rounded-lg border border-navy-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 id="analysis-limit-heading" className="flex items-center mb-1 font-medium text-white">
                <Target className="w-5 h-5 mr-2 text-pink-400" /> Veckans kompetensanalyser
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
                Du har nått din veckogräns för kompetensanalyser. 
                <button onClick={handleUpgrade} className="ml-1 text-pink-400 hover:text-pink-300 underline font-medium">  Uppgradera </button>
                 för obegränsad användning.
              </span>
            </div>
          )}
        </section>
      )}

      {/* --- Main Content Grid --- */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* --- Left Column: CV Selection --- */}
        <section aria-labelledby="cv-selection-heading" className="space-y-6 lg:col-span-1">
          <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
            <h2 id="cv-selection-heading" className="text-xl font-semibold mb-5 text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              1. Välj CV
            </h2>
            <div className="min-h-[10rem]">
              {cvsLoading || profileLoading ? (
                 <div className="flex items-center justify-center h-32"><Loader2 className="w-8 h-8 text-pink-500 animate-spin" aria-label="Laddar CV-lista..." /></div>
              ) : cvs.length === 0 ? (
                <div className="border border-navy-700 border-dashed rounded-lg p-6 bg-navy-900/50 text-center flex flex-col items-center justify-center h-full">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                  <p className="text-lg mb-1 text-gray-300">Inga CV:n uppladdade</p>
                  <p className="text-sm text-gray-500 mb-4">Ladda upp ditt CV för att kunna analysera det.</p>
                  <Link href={PROFILE_CV_ROUTE} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700">
                    <Upload className="w-4 h-4 mr-2" /> Gå till CV-hantering
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3 max-h-80 overflow-y-auto elegant-scrollbar pr-1">
                  {cvs.map((cv) => (
                    <li key={cv.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedCV(cv.id)}
                        disabled={profileLoading || hasReachedLimit}
                        className={`w-full text-left p-4 rounded-md border transition-all duration-200 flex items-start gap-3 ${
                          selectedCV === cv.id 
                            ? 'bg-navy-700 border-pink-500 ring-1 ring-pink-500 shadow-md' 
                            : 'bg-navy-900/50 border-navy-700 hover:bg-navy-700 hover:border-navy-600'
                        } ${(profileLoading || hasReachedLimit) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        aria-pressed={selectedCV === cv.id}
                       >
                        <FileText className={`w-5 h-5 mt-0.5 flex-shrink-0 ${selectedCV === cv.id ? 'text-pink-400' : 'text-blue-400'}`} />
                        <div className="flex-grow overflow-hidden">
                          <p className={`font-medium truncate ${selectedCV === cv.id ? 'text-white' : 'text-gray-200'}`}>
                            {cv.file_name || `CV ${cv.id.substring(0, 6)}`}
                          </p>
                          <p className="text-xs text-gray-400">Uppladdat: {formatDate(cv.created_at)}</p>
                        </div>
                        {selectedCV === cv.id && <Check className="w-5 h-5 text-pink-400 flex-shrink-0" aria-hidden="true" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* --- Right Column: Analysis Tool & Results --- */}
        <section aria-labelledby="analysis-tool-heading" className="lg:col-span-2">
             <h2 id="analysis-tool-heading" className="sr-only">Kompetensanalysverktyg och Resultat</h2>
             <CompetenceAnalysisTool
                selectedCvId={selectedCV}
                subscriptionTier={subscriptionTier}
                remainingWeeklyAnalyses={remainingWeeklyAnalyses}
                updateRemainingAnalyses={updateRemainingAnalyses}
                updateNextAnalysisResetDate={updateNextAnalysisResetDate}
                hasReachedLimit={hasReachedLimit}
             />
        </section>

      </main>
    </div>
  );
}