// src/components/cv/CompetenceAnalysisTool.tsx
'use client';

// --- Core React/Next Imports ---
import React, { useState, useCallback } from 'react';

// --- Components ---
// OBS: Namnet är CompetenceAnalysisDisplay i din kod, inte CompetenceAnalysisTool.tsx
// Det är viktigt att det stämmer med filnamnet.
// Jag antar att komponenten du vill visa heter CompetenceAnalysisDisplay.
import CompetenceAnalysisDisplay from './CompetenceAnalysisDisplay';
import Notification from '@/components/ui/notification';

// --- Icons ---
import { Briefcase, FileText, Percent, Sparkles, Loader2, AlertTriangle, Check } from 'lucide-react';

// --- Types ---
// Importera grundtypen (utan suggestedLearningPath) från analyzeCompetenceGap
import { CompetenceAnalysisResult as InitialCompetenceAnalysisResult } from '@/lib/openai/analyzeCompetenceGap';
// OBS: LearningSuggestion importeras INTE härifrån längre

// --- FIX: Definiera LearningSuggestion LOKALT här ---
interface LearningSuggestion {
    type: 'course' | 'certification' | 'self-study' | 'project';
    title: string;
    provider?: string;
    relevance: string;
    url?: string;
    language?: 'sv' | 'en' | 'other';
}
// --- SLUT FIX ---

// --- FIX: Definiera den fullständiga typen som API:et returnerar ---
// Denna kombinerar grundtypen med den lokalt definierade LearningSuggestion
type FullAnalysisResult = InitialCompetenceAnalysisResult & {
    suggestedLearningPath: LearningSuggestion[];
};
// --- SLUT FIX ---


// --- Props Interface ---
interface CompetenceAnalysisToolProps {
    selectedCvId: string | null;
    subscriptionTier?: 'free' | 'premium';
}

// --- Mode Type ---
type AnalysisMode = 'role' | 'jobAd';

// ============================================================================
//  Main Component
// ============================================================================
const CompetenceAnalysisTool: React.FC<CompetenceAnalysisToolProps> = ({
    selectedCvId,
    subscriptionTier
}) => {

    // --- State Variables ---
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('role');
    const [targetRole, setTargetRole] = useState('');
    const [jobAdText, setJobAdText] = useState('');

    // --- FIX: Uppdatera typen för analysisResult state ---
    const [analysisResult, setAnalysisResult] = useState<FullAnalysisResult | null>(null);
    // --- SLUT FIX ---
    const [matchScore, setMatchScore] = useState<number | null>(null); // Behåll denna för enkelhetens skull? Eller ta från analysisResult
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [notification, setNotification] = useState({ isVisible: false, message: '', type: 'info' as 'loading' | 'success' | 'error' | 'info' });
    const closeNotification = useCallback(() => setNotification(prev => ({ ...prev, isVisible: false })), []);
    const showNotification = useCallback((type: 'loading' | 'success' | 'error' | 'info', message: string, duration: number | null = 4000) => {
        setNotification({ isVisible: true, message, type });
        if (duration && type !== 'loading') {
          setTimeout(closeNotification, duration);
        }
      }, [closeNotification]);

    const isInputValid = useCallback(() => {
        if (!selectedCvId) return false;
        if (analysisMode === 'role') return targetRole.trim() !== '';
        if (analysisMode === 'jobAd') return jobAdText.trim().length > 50;
        return false;
    }, [selectedCvId, analysisMode, targetRole, jobAdText]);

    // --- API Call Handler ---
    const handleAnalyzeCompetence = useCallback(async () => {
        if (!isInputValid()) {
            setError("Vänligen fyll i alla nödvändiga fält.");
            showNotification('error', 'Vänligen fyll i alla nödvändiga fält.', 3000);
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setMatchScore(null);
        showNotification('loading', 'Startar kompetensanalys...');

        const requestBody: any = { cvId: selectedCvId, analysisMode };
        if (analysisMode === 'role') requestBody.targetRole = targetRole;
        else requestBody.jobAdText = jobAdText;

        try {
            const response = await fetch('/api/cv/kompetensutveckling', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
            const data = await response.json(); // Läs svaret oavsett status först
            closeNotification(); // Stäng laddningsnotis

            if (!response.ok) {
                // Använd message från API-svaret om det finns, annars generiskt fel
                throw new Error(data.message || `Något gick fel (Status: ${response.status})`);
            }

            // --- FIX: Type assertion för att säkerställa att datan matchar FullAnalysisResult ---
            const resultData = data as FullAnalysisResult;
            // --- SLUT FIX ---

            setAnalysisResult(resultData);
            setMatchScore(resultData.matchScore ?? null); // Uppdatera matchScore härifrån
            showNotification('success', `Analys slutförd! Matchning: ${resultData.matchScore ?? 'N/A'}%`, 5000);

        } catch (err: any) {
            console.error("Fel vid kompetensanalys:", err);
            const errorMessage = err.message || 'Ett okänt fel uppstod vid analysen.';
            setError(errorMessage);
            closeNotification(); // Se till att laddningsnotis stängs även vid fel
            showNotification('error', `Analysen misslyckades: ${errorMessage}`, 6000);
            setAnalysisResult(null); // Rensa resultat vid fel
            setMatchScore(null);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCvId, analysisMode, targetRole, jobAdText, isInputValid, showNotification, closeNotification]); // subscriptionTier borttagen härifrån, behövs inte för API-anropet

    // --- Render Logic ---
    return (
        <div className="space-y-6">
             <Notification
                isVisible={notification.isVisible}
                message={notification.message}
                type={notification.type}
                onClose={closeNotification}
            />

            {/* === Input Section (Oförändrad från din kod) === */}
            <div className="p-6 bg-navy-800/50 border border-navy-700 rounded-xl shadow-lg">
                {/* ... Titel, CV-val, Mode-tabs ... */}
                 <h2 className="text-xl font-semibold text-white mb-5">Starta Kompetensanalys</h2>
                 {!selectedCvId && ( <div className="mb-4 p-3 bg-yellow-900/40 border border-yellow-700/50 rounded-lg text-sm text-yellow-200"> Välj ett CV för att kunna starta analysen. </div> )}
                 <div className="mb-5 flex p-1 bg-navy-900/60 border border-navy-600 rounded-lg">
                    <button onClick={() => setAnalysisMode('role')} disabled={isLoading} className={`flex-1 px-3 py-2 rounded-md font-medium text-sm flex items-center justify-center transition-all duration-200 ${ analysisMode === 'role' ? 'bg-pink-600 text-white shadow-sm scale-[1.03]' : 'text-gray-300 hover:bg-navy-700/50' } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}> <Briefcase className="w-4 h-4 mr-1.5" /> Analysera mot Yrkesroll </button>
                    <button onClick={() => setAnalysisMode('jobAd')} disabled={isLoading} className={`flex-1 px-3 py-2 rounded-md font-medium text-sm flex items-center justify-center transition-all duration-200 ${ analysisMode === 'jobAd' ? 'bg-pink-600 text-white shadow-sm scale-[1.03]' : 'text-gray-300 hover:bg-navy-700/50' } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}> <FileText className="w-4 h-4 mr-1.5" /> Analysera mot Jobbannons </button>
                 </div>
                <div className="space-y-4 mb-6">
                    {analysisMode === 'role' && (
                        <div>
                            <label htmlFor="targetRole" className="block text-sm font-medium text-gray-300 mb-1.5">Mål Yrkesroll (i Sverige)</label>
                            <input type="text" id="targetRole" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="t.ex. Frontend-utvecklare..." className="w-full p-2.5 text-sm text-gray-200 bg-navy-900/70 border border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 transition duration-200" disabled={isLoading} />
                        </div>
                    )}
                    {analysisMode === 'jobAd' && (
                        <div>
                             <label htmlFor="jobAdText" className="block text-sm font-medium text-gray-300 mb-1.5">Klistra in Jobbannons</label>
                             <textarea id="jobAdText" value={jobAdText} onChange={(e) => setJobAdText(e.target.value)} placeholder="Klistra in hela jobbannonsen här..." className="w-full h-48 p-3 text-sm text-gray-200 bg-navy-900/70 border border-navy-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 transition duration-200 elegant-scrollbar" disabled={isLoading} rows={8} />
                        </div>
                    )}
                </div>
                 <button onClick={handleAnalyzeCompetence} disabled={isLoading || !isInputValid()} className={`w-full py-3 px-6 font-semibold text-base text-white rounded-lg shadow-md transition-all duration-300 flex items-center justify-center relative overflow-hidden ${ (!isInputValid() || isLoading) ? 'bg-gray-600 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 hover:shadow-xl hover:scale-[1.02]' }`} aria-label={isLoading ? "Analyserar..." : "Analysera Kompetens"}>
                    {isLoading ? ( <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Analyserar...</> ) : ( <><Sparkles className="w-5 h-5 mr-2 opacity-90" />Analysera Kompetens</> )}
                 </button>
                 {error && !isLoading && (
                    <div className="mt-4 p-3 bg-red-900/40 border border-red-700/50 rounded-lg flex items-start text-sm">
                        <AlertTriangle className="w-5 h-5 text-red-400 mr-2.5 flex-shrink-0 mt-0.5" />
                        <p className="text-red-200">{error}</p>
                    </div>
                 )}
            </div> {/* === Slut på Input Section === */}

            {/* === Results Section === */}
            <div className="mt-8">
                 {/* Match Score Display (Använder state 'matchScore' som sätts efter lyckat anrop) */}
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
                 {/* Skickar analysisResult (som nu är av typen FullAnalysisResult | null) */}
                 <CompetenceAnalysisDisplay
                    data={analysisResult} // Nu matchar typerna!
                    isLoading={isLoading}
                    error={error} // Skicka med error-state om Display ska visa det
                    subscriptionTier={subscriptionTier}
                   />
            </div> {/* === Slut på Results Section === */}
        </div>
    );
};

export default CompetenceAnalysisTool;