// src/components/cv/CompetenceAnalysisDashboard.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompetenceJob } from '@/hooks/use-competence-job';
import CompetenceProgressTracker from './CompetenceProgressTracker';
import LearningPathVisualization from './LearningPathVisualization';
import Notification from '@/components/ui/notification';
import {
  Briefcase, FileText, Sparkles, Loader2, AlertTriangle,
  Lock, Target, PlayCircle, RefreshCw
} from 'lucide-react';

interface CompetenceAnalysisDashboardProps {
  selectedCvId: string | null;
  subscriptionTier?: 'free' | 'premium';
  remainingWeeklyAnalyses?: number | null;
  hasReachedLimit?: boolean;
  updateRemainingAnalyses?: (count: number) => void;
  updateNextAnalysisResetDate?: (date: Date) => void;
}

type AnalysisMode = 'role' | 'jobAd';

const CompetenceAnalysisDashboard: React.FC<CompetenceAnalysisDashboardProps> = ({
  selectedCvId,
  subscriptionTier = 'free',
  remainingWeeklyAnalyses,
  hasReachedLimit = false,
  updateRemainingAnalyses,
  updateNextAnalysisResetDate
}) => {
  const router = useRouter();

  // State
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('role');
  const [targetRole, setTargetRole] = useState('');
  const [jobAdText, setJobAdText] = useState('');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info' as 'loading' | 'success' | 'error' | 'info'
  });

  // Use the job hook
  const { job, loading, error, refetch } = useCompetenceJob(currentJobId);

  // Notification handlers
  const closeNotification = useCallback(() =>
    setNotification(prev => ({ ...prev, isVisible: false })), []);

  const showNotification = useCallback((
    type: 'loading' | 'success' | 'error' | 'info',
    message: string,
    duration: number | null = 4000
  ) => {
    setNotification({ isVisible: true, message, type });
    if (duration && type !== 'loading') {
      setTimeout(closeNotification, duration);
    }
  }, [closeNotification]);

  // Input validation
  const isInputValid = useCallback(() => {
    if (!selectedCvId) return false;
    if (analysisMode === 'role') return targetRole.trim() !== '';
    if (analysisMode === 'jobAd') return jobAdText.trim().length > 50;
    return false;
  }, [selectedCvId, analysisMode, targetRole, jobAdText]);

  // Event handlers
  const handleUpgrade = useCallback(() => {
    router.push('/profile?tab=subscription');
  }, [router]);

  // Start analysis
  const handleStartAnalysis = useCallback(async () => {
    if (!isInputValid()) {
      showNotification('error', 'Vänligen fyll i alla nödvändiga fält.', 3000);
      return;
    }

    if (subscriptionTier === 'free' && hasReachedLimit) {
      showNotification('error', 'Veckogräns nådd.', 5000);
      return;
    }

    // Reset current job
    setCurrentJobId(null);

    const requestBody: any = {
      cvId: selectedCvId,
      analysisMode
    };

    if (analysisMode === 'role') {
      requestBody.targetRole = targetRole;
    } else {
      requestBody.jobAdText = jobAdText;
    }

    try {
      showNotification('loading', 'Startar analys...', null);

      const response = await fetch('/api/cv/kompetensutveckling/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      closeNotification();

      if (!response.ok) {
        if (response.status === 429) {
          if (updateRemainingAnalyses) {
            updateRemainingAnalyses(0);
          }
          throw new Error('Veckogräns nådd.');
        }
        throw new Error(data.message || `Något gick fel (Status: ${response.status})`);
      }

      // Set the job ID to start tracking
      setCurrentJobId(data.jobId);
      showNotification('success', 'Analys startad! Väntar på resultat...', 3000);

      // Update remaining analyses
      if (data.remainingAnalyses !== undefined && updateRemainingAnalyses) {
        updateRemainingAnalyses(data.remainingAnalyses);
      }

      // Update next reset date
      if (data.nextResetDate && updateNextAnalysisResetDate) {
        updateNextAnalysisResetDate(new Date(data.nextResetDate));
      }

      // Activity logging happens on server side in /start endpoint

    } catch (err: any) {
      console.error('Error starting analysis:', err);
      showNotification('error', err.message || 'Något gick fel vid start av analys', 5000);
    }
  }, [
    isInputValid, selectedCvId, analysisMode, targetRole, jobAdText,
    subscriptionTier, hasReachedLimit, showNotification, closeNotification,
    updateRemainingAnalyses, updateNextAnalysisResetDate
  ]);

  // Cancel analysis
  const handleCancelAnalysis = useCallback(() => {
    setCurrentJobId(null);
    showNotification('info', 'Analys avbruten', 3000);
  }, [showNotification]);

  // Reset form for new analysis
  const handleNewAnalysis = useCallback(() => {
    setCurrentJobId(null);
    setTargetRole('');
    setJobAdText('');
    showNotification('info', 'Redo för ny analys', 2000);
  }, [showNotification]);

  // Check if analysis is in progress
  const isAnalyzing = job && job.status !== 'completed' && job.status !== 'failed';

  return (
    <div className="w-full space-y-6">
      {/* Notification */}
      {notification.isVisible && (
        <Notification
          isVisible={notification.isVisible}
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      {/* Show progress tracker if job is running */}
      {job && isAnalyzing && (
        <CompetenceProgressTracker
          status={job.status}
          progress={job.progress}
          currentStep={job.current_step}
          totalGaps={job.total_gaps}
          processedGaps={job.processed_gaps}
          errorMessage={job.error_message}
          onCancel={handleCancelAnalysis}
        />
      )}

      {/* Show results if job is completed */}
      {job && job.status === 'completed' && job.learning_suggestions && (
        <>
          <LearningPathVisualization
            matchScore={job.match_score || 0}
            cvSummary={job.cv_summary || ''}
            skillGaps={job.skill_gaps || []}
            learningSuggestions={job.learning_suggestions || []}
            targetRole={targetRole}
          />

          {/* New Analysis Button */}
          <div className="flex justify-center">
            <button
              onClick={handleNewAnalysis}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Gör ny analys
            </button>
          </div>
        </>
      )}

      {/* Show input form if no job or job completed/failed */}
      {(!job || job.status === 'completed' || job.status === 'failed') && !job?.learning_suggestions && (
        <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
          <h2 className="text-xl font-semibold mb-5 text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-cyan-400" />
            Analysera kompetensmatchning
          </h2>

          {/* Analysis Mode Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Vad vill du matcha mot?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAnalysisMode('role')}
                disabled={hasReachedLimit}
                className={`p-4 rounded-lg border-2 transition-all ${
                  analysisMode === 'role'
                    ? 'bg-navy-700 border-pink-500 text-white'
                    : 'bg-navy-900/50 border-navy-700 text-gray-400 hover:border-navy-600'
                } ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Briefcase className="w-6 h-6 mx-auto mb-2" />
                <span className="block font-medium">Yrkesroll</span>
                <span className="text-xs opacity-75">T.ex. "Frontend-utvecklare"</span>
              </button>

              <button
                type="button"
                onClick={() => setAnalysisMode('jobAd')}
                disabled={hasReachedLimit}
                className={`p-4 rounded-lg border-2 transition-all ${
                  analysisMode === 'jobAd'
                    ? 'bg-navy-700 border-pink-500 text-white'
                    : 'bg-navy-900/50 border-navy-700 text-gray-400 hover:border-navy-600'
                } ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FileText className="w-6 h-6 mx-auto mb-2" />
                <span className="block font-medium">Jobbannons</span>
                <span className="text-xs opacity-75">Klistra in en annons</span>
              </button>
            </div>
          </div>

          {/* Input Fields */}
          {analysisMode === 'role' ? (
            <div className="mb-6">
              <label htmlFor="targetRole" className="block text-sm font-medium text-gray-300 mb-2">
                Ange yrkesroll du vill matcha mot
              </label>
              <input
                id="targetRole"
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                disabled={hasReachedLimit}
                placeholder="T.ex. Projektledare, Sjuksköterska, Frontend-utvecklare..."
                className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
          ) : (
            <div className="mb-6">
              <label htmlFor="jobAdText" className="block text-sm font-medium text-gray-300 mb-2">
                Klistra in jobbannons
              </label>
              <textarea
                id="jobAdText"
                value={jobAdText}
                onChange={(e) => setJobAdText(e.target.value)}
                disabled={hasReachedLimit}
                placeholder="Klistra in hela jobbannonsen här..."
                rows={8}
                className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {hasReachedLimit && (
                <div className="flex items-center text-yellow-400 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Du har nått din veckogräns
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {hasReachedLimit ? (
                <button
                  onClick={handleUpgrade}
                  className="flex items-center px-5 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 transition-all"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Uppgradera för fler analyser
                </button>
              ) : (
                <button
                  onClick={handleStartAnalysis}
                  disabled={!isInputValid() || loading}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                    isInputValid() && !loading
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl'
                      : 'bg-navy-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Startar analys...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Starta analys
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start">
              <Sparkles className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-300 font-medium mb-1">
                  Powered by GPT-5 med websökning
                </p>
                <p className="text-xs text-blue-200/70">
                  Vår analys använder GPT-5 för att ge dig de mest relevanta och aktuella kursförslagen
                  direkt från webben. Analysen tar 1-3 minuter beroende på antal kompetensgap.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetenceAnalysisDashboard;