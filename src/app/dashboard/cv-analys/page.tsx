/**
 * AnalyzeCvPage Component - Premium Light Theme
 * Enhanced AI-powered CV analysis with real-time visualization and premium UX.
 * Features step-by-step AI wizard, animated progress tracking, and glassmorphism design.
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
import CVAnalysisModal from '@/components/cv/analysis/CVAnalysisModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// --- Utility Functions ---
import { logUserActivity } from '@/lib/activity-logger';

// --- Animations ---
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons ---
import {
  FileText, Upload, SearchCheck, ClipboardList, AlertTriangle,
  Crown, Clock, Pencil, Loader2, MessageSquare, ChevronRight, Check,
  Sparkles, Zap, Target, Star, Brain, Layers, BarChart3, Lightbulb,
  ArrowRight, CheckCircle2, Timer, TrendingUp
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    isVisible: false, message: '', type: 'loading',
  });
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

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

  // --- Helper: Poll for background job result ---
  const pollForJobResult = useCallback(async (jobId: string): Promise<any> => {
    const MAX_POLLS = 60; // 60 polls * 2s = 2 minutes max
    const POLL_INTERVAL_MS = 2000; // 2 seconds
    const ESTIMATED_TOTAL_TIME = 50; // sekunder (realistisk uppskattning)

    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

      const pollResponse = await fetch(`/api/cv/jobs/${jobId}`);
      const jobData = await pollResponse.json();

      if (!pollResponse.ok) {
        throw new Error(jobData.message || 'Failed to fetch job status');
      }

      if (jobData.status === 'completed') {
        return jobData.result;
      } else if (jobData.status === 'failed') {
        throw new Error(jobData.error || 'Analysis failed');
      }

      // Progress is now handled by CVAnalysisModal - no need for notification here
    }

    throw new Error('Analysen tog för lång tid. Försök igen eller kontakta support.');
  }, [showNotification]);

  // --- Modal Callbacks ---
  const handleModalAnalysisStart = useCallback(async () => {
    if (!selectedCV) {
      throw new Error('Inget CV valt');
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(API_ANALYZE_ROUTE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvId: selectedCV })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Kunde inte starta analys');
      }

      // Update quota info
      if (result.remainingAnalyses !== undefined) {
        updateRemainingAnalyses(result.remainingAnalyses);
      }
      if (result.nextResetDate) {
        updateNextAnalysisResetDate(result.nextResetDate);
      }

      // Store jobId for polling
      setCurrentJobId(result.jobId);

      // Log activity
      if (profile?.id) {
        const cvFileName = cvs?.find(cv => cv.id === selectedCV)?.file_name || 'Unknown CV';
        await logUserActivity(
          profile.id,
          'cv_analysis_started',
          `Started CV analysis for: ${cvFileName}`,
          {
            cv_id: selectedCV,
            job_id: result.jobId
          }
        );
      }

      return result.jobId;
    } catch (error: any) {
      setIsAnalyzing(false);
      throw error;
    }
  }, [selectedCV, updateRemainingAnalyses, updateNextAnalysisResetDate, profile]);

  const handleModalPollJob = useCallback(async (jobId: string) => {
    return await pollForJobResult(jobId);
  }, [pollForJobResult]);

  const handleModalClose = useCallback(() => {
    setShowAnalysisModal(false);
    setIsAnalyzing(false);
    setCurrentJobId(null);
  }, []);

  const handleModalComplete = useCallback((result: any) => {
    // Modal is self-contained and handles all results internally - just reset state
    setIsAnalyzing(false);
    setShowAnalysisModal(false);
    setCurrentJobId(null);
  }, []);

  // --- Event Handlers ---
  const handleAnalyzeCv = useCallback(async () => {
    if (!selectedCV) { showNotification('error', 'Välj ett CV att analysera.', 3000); return; }
    const isFreeTier = subscriptionTier === 'free';
    const hasReachedLimit = isFreeTier && remainingWeeklyAnalyses !== null && remainingWeeklyAnalyses <= 0;
    if (hasReachedLimit) { showNotification('error', 'Du har nått din veckogräns för CV-analyser. Uppgradera till premium för obegränsad användning.', NOTIFICATION_DURATION_MS); setError('Veckogräns nådd. Uppgradera till premium.'); return; }

    // Open modal - analysis will start automatically in modal
    setShowAnalysisModal(true);
    setError(null);
    setAnalysisResult(null);
  }, [selectedCV, showNotification, subscriptionTier, remainingWeeklyAnalyses]);

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
    <div className="relative min-h-screen overflow-hidden">
      {/* Premium Dynamic Background - Enhanced like CV-mallar page */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0 opacity-90"
      >
        {/* Primary gradient foundation */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-slate-50/50" />

        {/* Secondary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-50/20 to-pink-50/30" />

        {/* Animated morphing gradient orbs */}
        <motion.div
          className="absolute top-[10%] left-[5%] w-[500px] h-[500px] will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(147, 51, 234, 0.05) 40%, transparent 70%)',
            filter: 'blur(60px)',
            willChange: 'transform',
          }}
          animate={{
            x: [0, 150, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute top-[30%] right-[10%] w-[600px] h-[600px] will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)',
            filter: 'blur(80px)',
            willChange: 'transform',
          }}
          animate={{
            x: [0, -200, 0],
            y: [0, 150, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute bottom-[20%] left-[15%] w-[400px] h-[400px] will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.03) 40%, transparent 70%)',
            filter: 'blur(70px)',
            willChange: 'transform',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "easeInOut"
          }}
        />

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.015,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '40px 40px',
          }}
        />
      </motion.div>

      {/* Notification */}
      {notification.isVisible && (
        <Notification
          isVisible={notification.isVisible}
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              AI CV-Analys
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Få djupgående AI-drivna insikter och förbättringsförslag för ditt CV.
            </p>
          </div>

          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center text-green-600">
              <Check className="w-4 h-4 mr-2" />
              ATS-analys
            </div>
            <div className="flex items-center text-blue-600">
              <Check className="w-4 h-4 mr-2" />
              Nyckelord
            </div>
            <div className="flex items-center text-purple-600">
              <Check className="w-4 h-4 mr-2" />
              Förbättringsförslag
            </div>
          </div>
        </motion.header>

        {/* Analysis Limits Info with Premium Design */}
        {isFreeTier && weeklyAnalysisLimit > 0 && weeklyAnalysisLimit !== Infinity && (
          <motion.section
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/95 backdrop-blur-xl shadow-xl border border-gray-200/80 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Progress Ring Section */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20">
                      {/* Background Circle */}
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-gray-200"
                        />
                        {/* Progress Circle */}
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeLinecap="round"
                          className={hasReachedLimit ? "text-red-500" : "text-green-500"}
                          initial={{ pathLength: 0 }}
                          animate={{
                            pathLength: remainingWeeklyAnalyses !== null
                              ? remainingWeeklyAnalyses / weeklyAnalysisLimit
                              : 0
                          }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          style={{
                            strokeDasharray: "251.2",
                            strokeDashoffset: "251.2",
                          }}
                        />
                      </svg>

                      {/* Center Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">
                          {remainingWeeklyAnalyses ?? 0}
                        </span>
                        <span className="text-xs text-gray-500">kvar</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-pink-600" />
                        Veckans AI-analyser
                      </h3>
                      <p className="text-sm text-gray-600">
                        {remainingWeeklyAnalyses ?? 0} av {weeklyAnalysisLimit} analyser kvar
                      </p>
                      {nextAnalysisResetDate && (
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Timer className="w-3 h-3 mr-1" />
                          Nollställs {timeUntilAnalysisReset ? `om ${timeUntilAnalysisReset}` : formatDate(nextAnalysisResetDate)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upgrade Section */}
                  {hasReachedLimit ? (
                    <motion.div
                      className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Veckogräns nådd</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Du har använt alla dina CV-analyser denna vecka.
                          </p>
                          <motion.button
                            onClick={handleUpgrade}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Uppgradera till Premium
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">Analyser tillgängliga</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Du kan göra {remainingWeeklyAnalyses} fler analyser denna vecka.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-8">

          {/* Sidebar - CV Selection */}
          <motion.aside
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-white/95 backdrop-blur-xl shadow-xl border border-gray-200/80">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                  <FileText className="w-5 h-5 text-pink-600" />
                  Ditt CV
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Välj det CV du vill analysera
                </CardDescription>
              </CardHeader>

              <CardContent>
                {cvsLoading || profileLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <motion.div
                      className="w-8 h-8 border-2 border-pink-600 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                ) : cvs.length === 0 ? (
                  <div className="text-center py-6">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p className="text-gray-600 mb-4">Inga CV uppladdade</p>
                    <Link href={PROFILE_CV_ROUTE}>
                      <Button size="sm" className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                        Ladda upp CV
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cvs.map((cv) => (
                      <motion.button
                        key={cv.id}
                        type="button"
                        onClick={() => !isAnalyzing && setSelectedCV(cv.id)}
                        disabled={isAnalyzing}
                        className={`w-full text-left p-3 rounded-lg border transition-all duration-300 ${
                          selectedCV === cv.id
                            ? 'bg-pink-50/80 border-pink-500 ring-1 ring-pink-400 shadow-lg'
                            : 'bg-white/60 border-gray-200 hover:bg-gray-50/80 hover:border-gray-300 hover:shadow-md'
                        } ${isAnalyzing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        whileHover={!isAnalyzing ? { scale: 1.02, y: -2 } : {}}
                        whileTap={!isAnalyzing ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-start gap-3">
                          <FileText className={`w-4 h-4 mt-0.5 ${
                            selectedCV === cv.id ? 'text-pink-600' : 'text-gray-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate ${
                              selectedCV === cv.id ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {cv.file_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {cv.cv_text ? cv.cv_text.substring(0, 80) + '...' : 'Ingen förhandsgranskning'}
                            </p>
                          </div>
                          {selectedCV === cv.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <Check className="w-4 h-4 text-pink-600 flex-shrink-0" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4"
                >
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analysis Button */}
            {selectedCV && (
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className={`border-0 shadow-xl overflow-hidden ${
                  hasReachedLimit
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                    : 'bg-gradient-to-r from-pink-600 to-purple-600'
                } text-white`}>
                  <CardContent className="p-4">
                    <div className="text-center mb-3">
                      <h3 className="font-semibold">
                        {isAnalyzing ? 'AI analyserar...' : hasReachedLimit ? 'Veckogräns nådd' : 'Klar för analys'}
                      </h3>
                      {!hasReachedLimit && !isAnalyzing && (
                        <p className="text-sm opacity-90 mt-1">
                          CV: {cvs.find(cv => cv.id === selectedCV)?.file_name}
                        </p>
                      )}
                    </div>

                    <motion.div
                      whileHover={!isAnalyzeButtonDisabled ? { scale: 1.02 } : {}}
                      whileTap={!isAnalyzeButtonDisabled ? { scale: 0.98 } : {}}
                    >
                      <Button
                        onClick={handleAnalyzeCv}
                        disabled={isAnalyzeButtonDisabled}
                        className="w-full bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group disabled:bg-gray-200 disabled:text-gray-500"
                      >
                        {!isAnalyzing && !hasReachedLimit && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                          />
                        )}
                        <div className="relative z-10 flex items-center justify-center">
                          {isAnalyzing ? (
                            <>
                              <motion.div
                                className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full mr-2"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              Analyserar CV...
                            </>
                          ) : hasReachedLimit ? (
                            <>
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Veckogräns nådd
                            </>
                          ) : (
                            <>
                              <Brain className="w-4 h-4 mr-2" />
                              Starta AI-analys
                              <Sparkles className="w-3 h-3 ml-2 opacity-60" />
                            </>
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.aside>

          {/* Main Content - Analysis Results */}
          <motion.main
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-white/95 backdrop-blur-xl shadow-xl border border-gray-200/80 min-h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-xl flex items-center gap-2 text-gray-900">
                  <ClipboardList className="w-5 h-5 text-green-600" />
                  AI-Analysresultat
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Djupgående insikter och förbättringsförslag från vår AI.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow flex flex-col">
                <AnimatePresence mode="wait">
                  {/* Analysis happens in modal - show empty state here */}
                  {!showAnalysisModal ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-grow flex flex-col items-center justify-center text-center"
                    >
                      <motion.div
                        className="w-24 h-24 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mb-6"
                        animate={{
                          scale: [1, 1.05, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <SearchCheck className="w-12 h-12 text-gray-500" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Redo för AI-analys</h3>
                      <p className="text-gray-600 max-w-sm">
                        Välj ett CV från vänster panel och klicka på "Starta AI-analys" för att få djupgående insikter.
                      </p>

                      {/* Feature highlights */}
                      <div className="grid grid-cols-2 gap-4 mt-8 max-w-md">
                        {[
                          { icon: Target, text: "ATS-optimering" },
                          { icon: Star, text: "Poängbedömning" },
                          { icon: Lightbulb, text: "Förbättringar" },
                          { icon: TrendingUp, text: "Insikter" }
                        ].map((feature, index) => (
                          <motion.div
                            key={index}
                            className="flex flex-col items-center p-3 bg-gray-50 rounded-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <feature.icon className="w-6 h-6 text-pink-600 mb-2" />
                            <span className="text-xs text-gray-600 text-center">{feature.text}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.main>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-5">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Success Confetti Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes confetti {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.5) rotate(360deg);
            opacity: 0;
          }
        }
        .elegant-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(236, 72, 153, 0.3) transparent;
        }
        .elegant-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .elegant-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .elegant-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(236, 72, 153, 0.3);
          border-radius: 3px;
        }
        .elegant-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(236, 72, 153, 0.5);
        }
      `}} />

      {/* CV Analysis Modal */}
      <CVAnalysisModal
        isOpen={showAnalysisModal}
        onClose={handleModalClose}
        cvId={selectedCV || ''}
        cvContent={cvs?.find(cv => cv.id === selectedCV)?.cv_text || ''}
        onAnalysisStart={handleModalAnalysisStart}
        onPollJob={handleModalPollJob}
        onComplete={handleModalComplete}
      />
    </div>
  );
}