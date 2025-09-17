// src/components/cv/CompetenceAnalysisTool.tsx
'use client';

// --- Core React/Next Imports ---
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- Components ---
import CompetenceAnalysisDisplay from './CompetenceAnalysisDisplay';
import Notification from '@/components/ui/notification';

// --- Icons ---
import { 
  Briefcase, FileText, Percent, Sparkles, Loader2, AlertTriangle, 
  Check, Lock 
} from 'lucide-react';

// --- Types ---
import { CompetenceAnalysisResult as InitialCompetenceAnalysisResult } from '@/lib/openai/analyzeCompetenceGap';
import { logUserActivity } from '@/lib/activity-logger';

// --- Definiera LearningSuggestion ---
interface LearningSuggestion {
    type: 'course' | 'certification' | 'self-study' | 'project';
    title: string;
    provider?: string;
    relevance: string;
    search_keywords?: string[];
    direct_url?: string;
    duration?: string;
    cost?: string;
    priority?: 'essential' | 'recommended' | 'optional';
    language?: 'sv' | 'en' | 'other';
}

// --- Definiera den fullständiga typen som API:et returnerar ---
type FullAnalysisResult = InitialCompetenceAnalysisResult & {
    suggestedLearningPath: LearningSuggestion[];
    remainingAnalyses?: number; // Antal återstående analyser
    nextResetDate?: string;     // Tidpunkt för nästa återställning
    limitReached?: boolean;     // Om användaren har nått sin gräns
};

// --- Props Interface ---
interface CompetenceAnalysisToolProps {
    selectedCvId: string | null;
    subscriptionTier?: 'free' | 'premium';
    remainingWeeklyAnalyses?: number | null;
    hasReachedLimit?: boolean;
    updateRemainingAnalyses?: (count: number) => void;
    updateNextAnalysisResetDate?: (date: Date) => void;
}

// --- Mode Type ---
type AnalysisMode = 'role' | 'jobAd';

// --- Constants ---
const UPGRADE_ROUTE = '/profile?tab=subscription';

// ============================================================================
//  Main Component
// ============================================================================
const CompetenceAnalysisTool: React.FC<CompetenceAnalysisToolProps> = ({
    selectedCvId,
    subscriptionTier = 'free',
    remainingWeeklyAnalyses,
    hasReachedLimit = false,
    updateRemainingAnalyses,
    updateNextAnalysisResetDate
}) => {
    const router = useRouter();

    // --- State Variables ---
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('role');
    const [targetRole, setTargetRole] = useState('');
    const [jobAdText, setJobAdText] = useState('');
    const [analysisResult, setAnalysisResult] = useState<FullAnalysisResult | null>(null);
    const [matchScore, setMatchScore] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState({ 
      isVisible: false, 
      message: '', 
      type: 'info' as 'loading' | 'success' | 'error' | 'info' 
    });

    // --- Notification Handlers ---
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

    // --- Input Validation ---
    const isInputValid = useCallback(() => {
        if (!selectedCvId) return false;
        if (analysisMode === 'role') return targetRole.trim() !== '';
        if (analysisMode === 'jobAd') return jobAdText.trim().length > 50;
        return false;
    }, [selectedCvId, analysisMode, targetRole, jobAdText]);

    // --- Event Handlers ---
    const handleUpgrade = useCallback(() => {
      router.push(UPGRADE_ROUTE);
    }, [router]);

    // --- API Call Handler ---
    const handleAnalyzeCompetence = useCallback(async () => {
        // Check input validity
        if (!isInputValid()) {
            setError("Vänligen fyll i alla nödvändiga fält.");
            showNotification('error', 'Vänligen fyll i alla nödvändiga fält.', 3000);
            return;
        }

        // Check limits for free tier
        if (subscriptionTier === 'free' && hasReachedLimit) {
            setError("Du har nått din veckogräns för kompetensanalyser.");
            showNotification('error', 'Veckogräns nådd.', 5000);
            return;
        }

        // Start analysis
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setMatchScore(null);

        // Roliga laddningsmeddelanden som uppdateras
        const loadingMessages = [
            '🚀 Startar kompetensanalys...',
            '📖 Läser igenom ditt CV...',
            '🔍 Analyserar dina färdigheter...',
            '🎯 Matchar mot målrollen...',
            '🧠 AI:n tänker djupt...',
            '📊 Beräknar matchningspoäng...',
            '💡 Identifierar utvecklingsområden...',
            '🎓 Söker efter relevanta kurser...',
            '✨ Nästan klar...'
        ];

        let messageIndex = 0;
        showNotification('loading', loadingMessages[0]);

        // Uppdatera meddelandet var 3:e sekund
        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            showNotification('loading', loadingMessages[messageIndex], null);
        }, 3000);

        const requestBody: any = { cvId: selectedCvId, analysisMode };
        if (analysisMode === 'role') requestBody.targetRole = targetRole;
        else requestBody.jobAdText = jobAdText;

        try {
            const response = await fetch('/api/cv/kompetensutveckling', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
            const data = await response.json();
            clearInterval(messageInterval); // Stoppa laddningsmeddelanden
            closeNotification();

            if (!response.ok) {
                // Special handling for rate limit errors (429)
                if (response.status === 429) {
                    // Update remaining analyses in profile hook
                    if (typeof updateRemainingAnalyses === 'function') {
                        updateRemainingAnalyses(0); // Set to 0 since limit is reached
                    }
                    throw new Error('Veckogräns nådd.');
                }
                throw new Error(data.message || `Något gick fel (Status: ${response.status})`);
            }

            // Process successful result
            const resultData = data as FullAnalysisResult;
            setAnalysisResult(resultData);
            setMatchScore(resultData.matchScore ?? null);

            // Update profile counter state
            if (resultData.remainingAnalyses !== undefined && typeof updateRemainingAnalyses === 'function') {
                updateRemainingAnalyses(resultData.remainingAnalyses);
            }

            // Update next reset date if provided
            if (resultData.nextResetDate && typeof updateNextAnalysisResetDate === 'function') {
                updateNextAnalysisResetDate(new Date(resultData.nextResetDate));
            }

            // Show success notification
            if (subscriptionTier === 'free' && resultData.remainingAnalyses !== undefined) {
                const remainingText = resultData.remainingAnalyses <= 0 
                    ? 'Du har nu nått din veckogräns.' 
                    : `Du har ${resultData.remainingAnalyses} ${resultData.remainingAnalyses === 1 ? 'analys' : 'analyser'} kvar denna vecka.`;
                showNotification('success', `Analys slutförd! Matchning: ${resultData.matchScore ?? 'N/A'}%. ${remainingText}`, 5000);
            } else {
                showNotification('success', `Analys slutförd! Matchning: ${resultData.matchScore ?? 'N/A'}%`, 4000);
            }

        } catch (err: any) {
            console.error("Fel vid kompetensanalys:", err);
            clearInterval(messageInterval); // Stoppa laddningsmeddelanden även vid fel
            const errorMessage = err.message || 'Ett okänt fel uppstod vid analysen.';
            setError(errorMessage);
            closeNotification();
            showNotification('error', `Analysen misslyckades: ${errorMessage}`, 6000);
            setAnalysisResult(null);
            setMatchScore(null);
        } finally {
            setIsLoading(false);
        }
    }, [
        selectedCvId, 
        analysisMode, 
        targetRole, 
        jobAdText, 
        isInputValid, 
        showNotification, 
        closeNotification,
        subscriptionTier,
        hasReachedLimit,
        updateRemainingAnalyses,
        updateNextAnalysisResetDate
    ]);

    // --- Derived State ---
    const isAnalyzeButtonDisabled = isLoading || !isInputValid() || hasReachedLimit;

    // --- Render Logic ---
    return (
        <div className="space-y-6">
            <Notification
                isVisible={notification.isVisible}
                message={notification.message}
                type={notification.type}
                onClose={closeNotification}
            />

            {/* === Input Section === */}
            <div className="p-6 bg-navy-800/50 border border-navy-700 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-5">Starta Kompetensanalys</h2>
                
                {!selectedCvId && (
                    <div className="mb-4 p-3 bg-yellow-900/40 border border-yellow-700/50 rounded-lg text-sm text-yellow-200"> 
                        Välj ett CV för att kunna starta analysen. 
                    </div>
                )}
                
                <div className="mb-5 flex p-1 bg-navy-900/60 border border-navy-600 rounded-lg">
                    <button 
                        onClick={() => setAnalysisMode('role')} 
                        disabled={isLoading || hasReachedLimit} 
                        className={`flex-1 px-3 py-2 rounded-md font-medium text-sm flex items-center justify-center transition-all duration-200 ${ 
                            analysisMode === 'role' ? 'bg-pink-600 text-white shadow-sm scale-[1.03]' : 'text-gray-300 hover:bg-navy-700/50' 
                        } ${(isLoading || hasReachedLimit) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    > 
                        <Briefcase className="w-4 h-4 mr-1.5" /> Analysera mot Yrkesroll 
                    </button>
                    <button 
                        onClick={() => setAnalysisMode('jobAd')} 
                        disabled={isLoading || hasReachedLimit} 
                        className={`flex-1 px-3 py-2 rounded-md font-medium text-sm flex items-center justify-center transition-all duration-200 ${ 
                            analysisMode === 'jobAd' ? 'bg-pink-600 text-white shadow-sm scale-[1.03]' : 'text-gray-300 hover:bg-navy-700/50' 
                        } ${(isLoading || hasReachedLimit) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    > 
                        <FileText className="w-4 h-4 mr-1.5" /> Analysera mot Jobbannons 
                    </button>
                </div>
                
                <div className="space-y-4 mb-6">
                    {analysisMode === 'role' && (
                        <div>
                            <label htmlFor="targetRole" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Mål Yrkesroll (i Sverige)
                            </label>
                            <input 
                                type="text" 
                                id="targetRole" 
                                value={targetRole} 
                                onChange={(e) => setTargetRole(e.target.value)} 
                                placeholder="t.ex. Frontend-utvecklare..." 
                                className="w-full p-2.5 text-sm text-gray-200 bg-navy-900/70 border border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 transition duration-200" 
                                disabled={isLoading || hasReachedLimit} 
                            />
                        </div>
                    )}
                    
                    {analysisMode === 'jobAd' && (
                        <div>
                            <label htmlFor="jobAdText" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Klistra in Jobbannons
                            </label>
                            <textarea 
                                id="jobAdText" 
                                value={jobAdText} 
                                onChange={(e) => setJobAdText(e.target.value)} 
                                placeholder="Klistra in hela jobbannonsen här..." 
                                className="w-full h-48 p-3 text-sm text-gray-200 bg-navy-900/70 border border-navy-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 transition duration-200 elegant-scrollbar" 
                                disabled={isLoading || hasReachedLimit} 
                                rows={8} 
                            />
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={handleAnalyzeCompetence} 
                    disabled={isAnalyzeButtonDisabled} 
                    className={`w-full py-3 px-6 font-semibold text-base text-white rounded-lg shadow-md transition-all duration-300 flex items-center justify-center relative overflow-hidden ${ 
                        isAnalyzeButtonDisabled 
                            ? 'bg-gray-600 cursor-not-allowed opacity-70' 
                            : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 hover:shadow-xl hover:scale-[1.02]' 
                    }`}
                    aria-label={
                        isLoading 
                            ? "Analyserar..." 
                            : hasReachedLimit 
                                ? "Veckogräns nådd" 
                                : "Analysera Kompetens"
                    }
                >
                    {isLoading ? ( 
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Analyserar...</> 
                    ) : hasReachedLimit ? (
                        <><Lock className="w-5 h-5 mr-2" />Veckogräns Nådd</>
                    ) : ( 
                        <><Sparkles className="w-5 h-5 mr-2 opacity-90" />Analysera Kompetens</> 
                    )}
                </button>
                
                {error && !isLoading && (
                    <div className="mt-4 p-3 bg-red-900/40 border border-red-700/50 rounded-lg flex items-start text-sm">
                        <AlertTriangle className="w-5 h-5 text-red-400 mr-2.5 flex-shrink-0 mt-0.5" />
                        <p className="text-red-200">{error}</p>
                    </div>
                )}
            </div>

            {/* === Results Section === */}
            <div className="mt-8">
                {/* Match Score Display */}
                {!isLoading && analysisResult && matchScore !== null && (
                    <div className="mb-6 p-5 bg-gradient-to-r from-blue-900/50 to-purple-900/40 border border-blue-700/50 rounded-xl shadow-lg flex items-center justify-center text-center animate-fadeIn">
                        <Percent className="w-7 h-7 mr-3 text-blue-300 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-blue-200 mb-0.5">Beräknad Matchning</p>
                            <p className="text-4xl font-bold text-white">{matchScore}%</p>
                        </div>
                    </div>
                )}

                {/* Detailed Analysis Display */}
                <CompetenceAnalysisDisplay
                    data={analysisResult}
                    isLoading={isLoading}
                    error={error}
                    subscriptionTier={subscriptionTier}
                />
            </div>
        </div>
    );
};

export default CompetenceAnalysisTool;