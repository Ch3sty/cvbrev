// src/components/cv/CvAnalysisResults.tsx
/**
 * CvAnalysisResults Component
 *
 * Displays the results of an AI CV analysis. It handles rendering different
 * sections based on whether the analysis data is 'basic' (for free users)
 * or 'premium'. For free users, it also displays a teaser prompting an upgrade.
 */
'use client';

// --- Core React/Next Imports ---
import React from 'react';
import Link from 'next/link';

// --- Icons ---
import {
    ClipboardList, // For Summary
    ThumbsUp,      // For Strengths
    Lightbulb,     // For Improvements
    Tags,          // For Keywords
    Type,          // For Clarity Score
    Zap,           // For Verbs/Impact Score
    CheckCircle,   // For Premium Scores / General Good
    Target,        // For Relevance / Quantification
    ScanSearch,    // For ATS
    Star,          // For Ratings
    Trophy,        // For Scores Section Title
    Crown,         // For Premium Teaser
    ChevronRight,  // For Premium Teaser Button
    Info,          // (Potentially for Tooltips - not used currently)
    Wand2,         // For improvement workflow
    ArrowRight     // For action button
} from 'lucide-react';

// --- Additional Components ---
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CVImprovementWorkflow, { Suggestion } from './CVImprovementWorkflow';
import CVSectionAnalysisOverview from './analysis/CVSectionAnalysisOverview';

// --- Type Definitions ---
// It's highly recommended to move these types to a shared location
// (e.g., 'src/types/analysis.types.ts') and import them here.
interface Score {
    rating: number;
    feedback: string;
}

interface BasicAnalysisResult {
    analysisType: 'basic';
    summary?: string; // Make optional for safety
    identifiedStrengths?: string[];
    improvementAreas?: string[];
    keywords?: string[];
    scores?: {
        clarityAndStructure?: Score;
        strongVerbs?: Score;
    };
}

interface PremiumImprovement {
    area: string;
    suggestion: string;
    example?: string;
}

interface RoleBasedImprovement {
    roleTitle: string;
    company: string;
    period: string;
    currentText: string;
    improvements: {
        hasQuantification: boolean;
        keywords: string[];
        grammarIssues: string[];
        atsOptimization: boolean;
    };
    suggestedText: string;
    atsImpact: number;
}

interface GeneralImprovement {
    area: string;
    suggestion: string;
    example?: string;
}

interface PremiumAnalysisResult {
    analysisType: 'premium';
    summary?: string;
    detailedStrengths?: Array<{ point: string; example?: string }>;
    detailedImprovements?: PremiumImprovement[];
    roleBasedImprovements?: RoleBasedImprovement[];
    generalImprovements?: GeneralImprovement[];
    keywords?: string[];
    atsFriendliness?: {
        score: number;
        feedback: string;
        missingKeywords?: string[];
    };
    quantificationSuggestions?: string[];
    scores?: {
        overall?: Score;
        clarityAndStructure?: Score;
        relevance?: Score;
        impactAndResults?: Score;
        // Include strongVerbs directly if premium analysis provides it,
        // otherwise it can be derived from impactAndResults if needed.
        strongVerbs?: Score;
    };
}

type CvAnalysisData = BasicAnalysisResult | PremiumAnalysisResult;

interface CvAnalysisResultsProps {
    data: CvAnalysisData | null | undefined; // Allow null/undefined for initial/error states
    cvContent?: string; // The original CV content for improvement workflow
    cvId?: string; // CV ID for saving improvements
}

// ============================================================================
//  Utility Functions
// ============================================================================

/**
 * Identifies if a suggestion is structural/formatting related that should be
 * automatically handled by CV templates
 */
const isStructuralSuggestion = (suggestion: string | PremiumImprovement): boolean => {
    const text = typeof suggestion === 'string'
        ? suggestion.toLowerCase()
        : `${suggestion.area} ${suggestion.suggestion}`.toLowerCase();

    const structuralKeywords = [
        // Layout and structure
        'layout', 'struktur', 'formatering', 'format', 'överskådlighet',
        // Headers and sections
        'rubrik', 'rubriker', 'sidhuvud', 'huvud', 'header',
        'sektion', 'sektioner', 'avsnitt', 'dela upp', 'organisera',
        // Lists and formatting
        'punktlista', 'punktlistor', 'bullets', 'bullet points',
        'indrag', 'marginal', 'spacing', 'avstånd',
        // Contact info positioning
        'kontaktuppgifter', 'kontakt', 'placera', 'flytta',
        // General structure commands
        'strukturera', 'ordna', 'gruppera', 'kategorisera',
        'använd tydliga', 'gör tydligare', 'förtydliga struktur'
    ];

    return structuralKeywords.some(keyword => text.includes(keyword));
};

// ============================================================================
//  Styling Constants - Premium Light Theme
// ============================================================================
const sectionBaseClasses = "bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 transition-all hover:border-gray-300 hover:shadow-md";
const sectionTitleClasses = "text-lg font-semibold text-gray-900 flex items-center mb-4";
const sectionIconClasses = "w-5 h-5 mr-2 text-pink-600 flex-shrink-0";
const listClasses = "list-disc pl-5 space-y-2 text-sm text-gray-700";
const premiumTeaserClasses = "bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border border-pink-200 rounded-xl p-6 text-center";
const fallbackTextClasses = "text-gray-500 italic text-sm";

// ============================================================================
//  Helper Rendering Components
// ============================================================================

/**
 * Renders a standard section container with an icon and title.
 */
const AnalysisSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = React.memo(({ title, icon: Icon, children }) => (
    <section className={sectionBaseClasses}>
        <h3 className={sectionTitleClasses}>
            <Icon className={sectionIconClasses} aria-hidden="true" />
            {title}
        </h3>
        {children}
    </section>
));
AnalysisSection.displayName = 'AnalysisSection'; // For easier debugging

/**
 * Renders a simple bulleted list from an array of strings.
 */
const BasicList: React.FC<{ items?: string[] }> = React.memo(({ items }) => {
    if (!items || items.length === 0) {
        return <p className={fallbackTextClasses}>Ingen information tillgänglig.</p>;
    }
    return (
        <ul className={listClasses}>
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    );
});
BasicList.displayName = 'BasicList';

/**
 * Renders a list of keywords as styled badges.
 */
const KeywordList: React.FC<{ keywords?: string[] }> = React.memo(({ keywords }) => {
    if (!keywords || keywords.length === 0) {
        return <p className={fallbackTextClasses}>Inga nyckelord identifierade.</p>;
    }
    return (
        <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
                <span key={index} className="px-3 py-1.5 text-xs font-medium bg-pink-100 text-pink-700 rounded-full border border-pink-200 hover:bg-pink-200 transition-colors">
                    {keyword}
                </span>
            ))}
        </div>
    );
});
KeywordList.displayName = 'KeywordList';

/**
 * Renders a single score card component (rating + feedback).
 * Scales rating to 5 stars for visual consistency.
 */
const ScoreCard: React.FC<{ title: string; score?: Score; maxRating?: number; icon: React.ElementType }> = React.memo(({ title, score, maxRating = 5, icon: Icon }) => {
    const rating = score?.rating ?? 0;
    const feedback = score?.feedback ?? "Ingen feedback tillgänglig.";
    // Scale rating to a 5-star system visually, regardless of maxRating
    const visualRatingOutOf5 = maxRating > 0 ? Math.round((rating / maxRating) * 5) : 0;

    return (
        <div className="bg-gradient-to-br from-white to-gray-50/50 p-5 rounded-xl border border-gray-200 flex-1 min-w-[200px] flex flex-col shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-base font-semibold text-gray-900 flex items-center mb-3">
                <Icon className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" aria-hidden="true" />
                {title}
            </h4>
            <div className="flex items-center mb-3" aria-label={`Betyg: ${rating} av ${maxRating}`}>
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 flex-shrink-0 ${i < visualRatingOutOf5 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                ))}
                <span className="ml-2 text-xs text-gray-500 font-medium">({rating}/{maxRating})</span>
            </div>
            <p className="text-sm text-gray-600 flex-grow leading-relaxed">{feedback}</p>
        </div>
    );
});
ScoreCard.displayName = 'ScoreCard';

/**
 * Renders the entire scores section with progression tracking
 */
const ScoresSection: React.FC<{
    scores?: BasicAnalysisResult['scores'] | PremiumAnalysisResult['scores'];
    isPremium: boolean;
    roleBasedImprovements?: RoleBasedImprovement[];
    atsData?: PremiumAnalysisResult['atsFriendliness'];
}> = React.memo(({ scores, isPremium, roleBasedImprovements, atsData }) => {
    // Extract scores safely, provide fallbacks
    const clarityScore = scores?.clarityAndStructure;
    const impactScore = isPremium ? (scores as PremiumAnalysisResult['scores'])?.impactAndResults : undefined;
    const strongVerbScore = scores?.strongVerbs ?? impactScore;
    const overallScore = isPremium ? (scores as PremiumAnalysisResult['scores'])?.overall : undefined;
    const relevanceScore = isPremium ? (scores as PremiumAnalysisResult['scores'])?.relevance : undefined;

    // Calculate potential improvement from role-based analysis
    const calculatePotentialImprovement = () => {
        if (!roleBasedImprovements || roleBasedImprovements.length === 0) return null;

        // Sum up ATS impact from all role improvements
        const totalAtsImpact = roleBasedImprovements.reduce((sum, role) => {
            return sum + (role.atsImpact || 0);
        }, 0);

        // Current ATS score
        const currentAtsScore = atsData?.score || 0;

        // Estimated improvement (cap at 100)
        const estimatedImprovedScore = Math.min(100, currentAtsScore + totalAtsImpact);

        return {
            current: currentAtsScore,
            potential: estimatedImprovedScore,
            improvement: totalAtsImpact,
            improvementCount: roleBasedImprovements.length
        };
    };

    const potentialImprovement = calculatePotentialImprovement();

    return (
        <AnalysisSection title="Poäng & Bedömning" icon={Trophy}>
            <div className="space-y-6">
                {/* Current CV Scores */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                        Ditt nuvarande CV
                    </h4>
                    <div className="flex flex-wrap gap-4">
                        {/* Premium Scores */}
                        {isPremium && overallScore && <ScoreCard title="Övergripande" score={overallScore} maxRating={10} icon={CheckCircle} />}
                        {isPremium && relevanceScore && <ScoreCard title="Relevans" score={relevanceScore} maxRating={10} icon={Target} />}
                        {/* Common/Adapted Scores */}
                        {clarityScore && <ScoreCard title="Tydlighet & Struktur" score={clarityScore} maxRating={isPremium ? 10 : 5} icon={Type} />}
                        {strongVerbScore && <ScoreCard title={isPremium ? "Impact & Resultat" : "Starka Verb"} score={strongVerbScore} maxRating={isPremium ? 10 : 5} icon={Zap} />}
                    </div>
                </div>

                {/* ATS Score with Potential Improvement */}
                {atsData && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                            ATS-Vänlighet (Applicant Tracking System)
                        </h4>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Nuvarande poäng</div>
                                    <div className="flex items-baseline">
                                        <span className={`text-4xl font-bold ${atsData.score >= 75 ? 'text-green-600' : atsData.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {atsData.score}
                                        </span>
                                        <span className="text-lg text-gray-500 ml-1">/100</span>
                                    </div>
                                </div>

                                {potentialImprovement && potentialImprovement.improvement > 0 && (
                                    <>
                                        <ArrowRight className="w-8 h-8 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-600 mb-1">Potentiell förbättring</div>
                                            <div className="flex items-baseline">
                                                <span className="text-4xl font-bold text-green-600">
                                                    {potentialImprovement.potential}
                                                </span>
                                                <span className="text-lg text-gray-500 ml-1">/100</span>
                                                <span className="text-sm text-green-600 ml-2 font-semibold">
                                                    (+{potentialImprovement.improvement})
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                {atsData.feedback}
                            </p>

                            {potentialImprovement && potentialImprovement.improvement > 0 && (
                                <div className="bg-white/50 rounded-lg p-4 border border-blue-200 mt-4">
                                    <div className="flex items-start gap-2">
                                        <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 mb-1">
                                                Värdeskapande insikter
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                Genom att implementera våra {potentialImprovement.improvementCount} föreslagna förbättringar
                                                kan ditt CV:s ATS-poäng förbättras med upp till <strong>+{potentialImprovement.improvement} poäng</strong>.
                                                Detta ökar chansen att ditt CV kommer förbi automatiska urvalsystem och når rekryterare.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Fallback if no scores available */}
                {!clarityScore && !strongVerbScore && !overallScore && !relevanceScore && !atsData && (
                    <p className={fallbackTextClasses}>Ingen poänginformation tillgänglig.</p>
                )}
            </div>
        </AnalysisSection>
    );
});
ScoresSection.displayName = 'ScoresSection';


/**
 * Renders the detailed strengths list with examples (Premium).
 */
const PremiumStrengthsList: React.FC<{ strengths?: Array<{ point: string; example?: string }> }> = React.memo(({ strengths }) => {
     if (!strengths || strengths.length === 0) {
        return <p className={fallbackTextClasses}>Inga specifika styrkor med exempel identifierade.</p>;
    }
    return (
        <ul className="space-y-4">
            {strengths.map((item, index) => (
                <li key={index} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50/50 rounded-r-lg">
                    <p className="font-medium text-gray-800">{item.point}</p>
                    {item.example && <p className="text-sm text-green-700 mt-2 italic bg-green-100/50 p-2 rounded text-xs">Exempel: "{item.example}"</p>}
                </li>
            ))}
        </ul>
    );
});
PremiumStrengthsList.displayName = 'PremiumStrengthsList';

/**
 * Renders the detailed improvements list with examples and area (Premium).
 */
const PremiumImprovementsList: React.FC<{ improvements?: PremiumImprovement[] }> = React.memo(({ improvements }) => {
     if (!improvements || improvements.length === 0) {
        return <p className={fallbackTextClasses}>Inga specifika förbättringsområden med exempel identifierade.</p>;
    }
    return (
         <ul className="space-y-4">
            {improvements.map((item, index) => (
                <li key={index} className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50/50 rounded-r-lg">
                    <p className="font-medium text-gray-800"><span className="text-orange-700 font-semibold">{item.area}:</span> {item.suggestion}</p>
                    {item.example && <p className="text-sm text-orange-700 mt-2 italic bg-orange-100/50 p-2 rounded text-xs">Förslag: "{item.example}"</p>}
                </li>
            ))}
        </ul>
    );
});
PremiumImprovementsList.displayName = 'PremiumImprovementsList';

/**
 * Renders the ATS Friendliness analysis section (Premium).
 */
const AtsSection: React.FC<{ atsData?: PremiumAnalysisResult['atsFriendliness'] }> = React.memo(({ atsData }) => {
    if (!atsData) return null; // Don't render if no ATS data
    const scoreColor = atsData.score >= 75 ? 'text-green-600' : atsData.score >= 50 ? 'text-yellow-600' : 'text-red-600';
    const scoreBgColor = atsData.score >= 75 ? 'bg-green-100' : atsData.score >= 50 ? 'bg-yellow-100' : 'bg-red-100';
    return (
        <AnalysisSection title="ATS-Vänlighet" icon={ScanSearch}>
             <div className="text-sm text-gray-700 space-y-4">
                <div className={`${scoreBgColor} rounded-lg p-4 border border-gray-200`}>
                    <div className="flex items-baseline mb-2">
                        <span className={`text-3xl font-bold ${scoreColor}`}>{atsData.score}</span>
                        <span className="text-sm text-gray-500 ml-1">/100</span>
                    </div>
                    <p className="text-gray-700">{atsData.feedback}</p>
                </div>
                {atsData.missingKeywords && atsData.missingKeywords.length > 0 && (
                    <div className='pt-2'>
                        <h5 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Potentiellt saknade nyckelord:</h5>
                        <KeywordList keywords={atsData.missingKeywords} />
                    </div>
                )}
            </div>
        </AnalysisSection>
    );
});
AtsSection.displayName = 'AtsSection';

/**
 * Renders the Quantification Suggestions section (Premium).
 */
const QuantificationSection: React.FC<{ suggestions?: string[] }> = React.memo(({ suggestions }) => {
     if (!suggestions || suggestions.length === 0) return null; // Don't render if no suggestions
     return (
        <AnalysisSection title="Förslag på kvantifiering" icon={Target}>
            <p className="text-xs text-gray-400 mb-2">Överväg att lägga till siffror eller mätbara resultat för följande punkter för att öka slagkraften:</p>
            <BasicList items={suggestions} />
        </AnalysisSection>
     );
});
QuantificationSection.displayName = 'QuantificationSection';


/**
 * Renders a list of automatic improvements that will be handled by CV templates
 */
const AutomaticImprovementsSection: React.FC<{ improvements: string[] }> = React.memo(({ improvements }) => {
    if (improvements.length === 0) return null;

    return (
        <AnalysisSection title="Automatiska förbättringar" icon={CheckCircle}>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-900">
                        Följande förbättringar sker automatiskt med våra CV-mallar
                    </h4>
                </div>
                <p className="text-sm text-green-700 mb-4">
                    Dessa struktur- och formateringsproblem löses automatiskt när du väljer en CV-mall.
                    Du behöver inte välja dessa förbättringar manuellt.
                </p>
                <ul className="space-y-2">
                    {improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{improvement}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </AnalysisSection>
    );
});
AutomaticImprovementsSection.displayName = 'AutomaticImprovementsSection';

/**
 * Renders a teaser prompting free users to upgrade to Premium.
 */
const PremiumTeaserSection: React.FC = React.memo(() => (
    <section className={premiumTeaserClasses}>
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Lås upp djupare insikter med Premium!</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
            Få detaljerade exempel, ATS-analys, kvantifieringsförslag och mer avancerad poängsättning för att verkligen optimera ditt CV.
        </p>
        <Link
            href="/profile?tab=subscription"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white transition-all bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-700 hover:to-purple-700 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
        >
            Uppgradera till Premium
            <ChevronRight className="w-4 h-4 ml-2" />
        </Link>
    </section>
));
PremiumTeaserSection.displayName = 'PremiumTeaserSection';


// ============================================================================
//  Main Analysis Results Component
// ============================================================================

const CvAnalysisResults: React.FC<CvAnalysisResultsProps> = React.memo(({ data, cvContent, cvId }) => {
    const [showImprovementWorkflow, setShowImprovementWorkflow] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showImplementationChoice, setShowImplementationChoice] = useState(false);
    const [pendingImprovements, setPendingImprovements] = useState<any[]>([]);

    // Handle loading or no data state gracefully
    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center text-center flex-grow py-10">
                <ClipboardList className="w-12 h-12 mb-4 text-gray-500" />
                <p className="text-lg text-gray-700">Ingen analysdata att visa.</p>
                <p className="text-sm text-gray-500">Välj ett CV och starta analysen.</p>
            </div>
        );
    }

    // Determine if the results are from a premium analysis
    const isPremium = data.analysisType === 'premium';

    // Safely access potentially missing fields with optional chaining and fallbacks
    const summary = data.summary ?? "Ingen sammanfattning tillgänglig.";
    const basicStrengths = (data as BasicAnalysisResult).identifiedStrengths;
    const premiumStrengths = isPremium ? (data as PremiumAnalysisResult).detailedStrengths : undefined;
    const basicImprovements = (data as BasicAnalysisResult).improvementAreas;
    const premiumImprovements = isPremium ? (data as PremiumAnalysisResult).detailedImprovements : undefined;
    const keywords = data.keywords;
    const scores = data.scores;
    const atsData = isPremium ? (data as PremiumAnalysisResult).atsFriendliness : undefined;
    const quantificationSuggestions = isPremium ? (data as PremiumAnalysisResult).quantificationSuggestions : undefined;

    // Convert analysis data to suggestions for improvement workflow
    // Filter out structural suggestions that will be handled automatically by templates
    const convertToSuggestions = (): Suggestion[] => {
        const suggestions: Suggestion[] = [];
        let idCounter = 0;

        // Convert improvement areas to suggestions with full context
        if (isPremium && premiumImprovements) {
            premiumImprovements.forEach(imp => {
                // Skip structural suggestions - they will be shown in automatic improvements
                if (!isStructuralSuggestion(imp)) {
                    suggestions.push({
                        id: `suggestion-${idCounter++}`,
                        category: 'content',
                        title: imp.area,
                        description: imp.suggestion,
                        impact: 'high',
                        example: imp.example, // Include example if available
                        area: imp.area // Include area for better context
                    });
                }
            });
        } else if (basicImprovements) {
            basicImprovements.forEach(imp => {
                // Skip structural suggestions - they will be shown in automatic improvements
                if (!isStructuralSuggestion(imp)) {
                    suggestions.push({
                        id: `suggestion-${idCounter++}`,
                        category: 'content',
                        title: 'Förbättringsförslag',
                        description: imp,
                        impact: 'medium'
                    });
                }
            });
        }

        // Add ATS suggestions if available
        if (atsData?.missingKeywords && atsData.missingKeywords.length > 0) {
            suggestions.push({
                id: `suggestion-${idCounter++}`,
                category: 'ats',
                title: 'Lägg till saknade nyckelord',
                description: `Inkludera följande nyckelord för bättre ATS-kompatibilitet: ${atsData.missingKeywords.join(', ')}`,
                impact: 'high'
            });
        }

        // Add quantification suggestions
        if (quantificationSuggestions && quantificationSuggestions.length > 0) {
            quantificationSuggestions.forEach(q => {
                suggestions.push({
                    id: `suggestion-${idCounter++}`,
                    category: 'keywords',
                    title: 'Kvantifiering',
                    description: q,
                    impact: 'medium'
                });
            });
        }

        return suggestions;
    };

    // Extract structural suggestions that will be handled automatically
    const getAutomaticImprovements = (): string[] => {
        const automaticImprovements: string[] = [];

        if (isPremium && premiumImprovements) {
            premiumImprovements.forEach(imp => {
                if (isStructuralSuggestion(imp)) {
                    automaticImprovements.push(`${imp.area}: ${imp.suggestion}`);
                }
            });
        } else if (basicImprovements) {
            basicImprovements.forEach(imp => {
                if (isStructuralSuggestion(imp)) {
                    automaticImprovements.push(imp);
                }
            });
        }

        return automaticImprovements;
    };

    const handleStartImprovement = () => {
        setShowImprovementWorkflow(true);
    };

    /**
     * Applicerar valda förbättringar på CV-texten
     */
    const applyImprovements = (originalText: string, improvements: any[]): string => {
        let updatedText = originalText;

        improvements.forEach(improvement => {
            const { currentText, suggestedText } = improvement;

            // Om vi har både original och förbättrad text, ersätt
            if (currentText && suggestedText) {
                // Normalisera whitespace för att hantera olika formatering
                const normalizedCurrent = currentText.trim().replace(/\s+/g, ' ');
                const normalizedOriginal = updatedText.replace(/\s+/g, ' ');

                // Hitta och ersätt texten
                if (normalizedOriginal.includes(normalizedCurrent)) {
                    updatedText = updatedText.replace(
                        new RegExp(currentText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                        suggestedText
                    );
                }
            }
        });

        return updatedText;
    };

    const handleImplementSelected = (selectedImprovements: any[]) => {
        if (!cvContent || !cvId || selectedImprovements.length === 0) {
            return;
        }

        // Spara förbättringar och visa valmöjlighet
        setPendingImprovements(selectedImprovements);
        setShowImplementationChoice(true);
    };

    const handleQuickSave = async () => {
        setShowImplementationChoice(false);
        setIsProcessing(true);

        try {
            // 1. Applicera förbättringar på CV-texten
            const improvedText = applyImprovements(cvContent!, pendingImprovements);

            // 2. Spara till databasen
            const response = await fetch('/api/cv/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: cvId,
                    cv_text: improvedText,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Kunde inte uppdatera CV');
            }

            // 3. Visa success-modal
            setShowSuccessModal(true);

        } catch (error) {
            console.error('Error implementing improvements:', error);
            alert('Ett fel uppstod när förbättringarna skulle implementeras. Försök igen.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFullWorkflow = () => {
        setShowImplementationChoice(false);
        setShowImprovementWorkflow(true);
    };

    // If improvement workflow is active, show it instead of regular results
    if (showImprovementWorkflow && cvContent && cvId) {
        // Prepare analysis details to pass to improvement workflow
        const analysisDetailsForWorkflow = {
            atsFriendliness: atsData,
            quantificationSuggestions: quantificationSuggestions,
            detailedImprovements: premiumImprovements,
            keywords: keywords,
            parsedRoles: (data as any).parsedRoles || [] // Lägg till parsedRoles från analysis data
        };

        return (
            <div className="space-y-6">
                <CVImprovementWorkflow
                    suggestions={convertToSuggestions()}
                    originalCV={cvContent}
                    cvId={cvId}
                    onComplete={() => setShowImprovementWorkflow(false)}
                    analysisDetails={analysisDetailsForWorkflow}
                />
            </div>
        );
    }

    // Get role-based and general improvements from premium analysis
    const roleBasedImprovements = isPremium ? (data as PremiumAnalysisResult).roleBasedImprovements : undefined;
    const generalImprovements = isPremium ? (data as PremiumAnalysisResult).generalImprovements : undefined;

    return (
        <div className="space-y-6">
            {/* --- Sammanfattning (dold för nu) --- */}
            {summary && summary !== "Ingen sammanfattning tillgänglig." && (
                <AnalysisSection title="Sammanfattning" icon={ClipboardList}>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
                    </div>
                </AnalysisSection>
            )}

            {/* NEW: Section-Based Analysis Overview (Premium Only) */}
            {isPremium && roleBasedImprovements && roleBasedImprovements.length > 0 && (
                <CVSectionAnalysisOverview
                    roleBasedImprovements={roleBasedImprovements}
                    generalImprovements={generalImprovements || []}
                    atsScore={atsData?.score}
                    onStartImprovements={cvContent && cvId ? handleStartImprovement : undefined}
                    onImplementSelected={cvContent && cvId ? handleImplementSelected : undefined}
                />
            )}

            {/* Fallback: Show old analysis format if no role-based improvements */}
            {(!isPremium || !roleBasedImprovements || roleBasedImprovements.length === 0) && (
                <>
                    <AnalysisSection title="Identifierade Styrkor" icon={ThumbsUp}>
                        {/* Render premium list if available, otherwise basic list */}
                        {isPremium && premiumStrengths ? (
                            <PremiumStrengthsList strengths={premiumStrengths} />
                        ) : (
                            <BasicList items={basicStrengths} />
                        )}
                    </AnalysisSection>

                    <AnalysisSection title="Förbättringsområden" icon={Lightbulb}>
                        {/* Render premium list if available, otherwise basic list */}
                         {isPremium && premiumImprovements ? (
                            <PremiumImprovementsList improvements={premiumImprovements.filter(imp => !isStructuralSuggestion(imp))} />
                        ) : (
                            <BasicList items={basicImprovements?.filter(imp => !isStructuralSuggestion(imp))} />
                        )}
                    </AnalysisSection>

                    {/* Show automatic improvements that will be handled by CV templates */}
                    <AutomaticImprovementsSection improvements={getAutomaticImprovements()} />
                </>
            )}

            {/* --- Poäng & Bedömning (alltid synlig) --- */}
            <ScoresSection
                scores={scores}
                isPremium={isPremium}
                roleBasedImprovements={roleBasedImprovements}
                atsData={atsData}
            />

            {/* --- Nyckelord (döljs för premium med role-based improvements) --- */}
            {(!isPremium || !roleBasedImprovements || roleBasedImprovements.length === 0) && (
                <AnalysisSection title="Nyckelord" icon={Tags}>
                    <KeywordList keywords={keywords} />
                </AnalysisSection>
            )}

            {/* --- Premium-Only Sections --- */}
            {isPremium && (
                <>
                    {/* ATS-sektion borttagen - visas redan i Poäng & Bedömning */}
                    <QuantificationSection suggestions={quantificationSuggestions} />
                    {/* Add more premium-specific sections here if needed */}
                </>
            )}

            {/* --- Premium Teaser removed - will be added later when everything works --- */}

            {/* --- Improvement Workflow Button removed for premium users with role-based improvements --- */}
            {/* The new CVSectionAnalysisOverview component already handles improvements inline */}

            {/* Implementation Choice Modal */}
            {showImplementationChoice && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8"
                    >
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Hur vill du fortsätta?
                            </h3>
                            <p className="text-gray-600">
                                Välj mellan snabbsparning eller fullständig kontroll över dina CV-förbättringar
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            {/* Quick Save Option */}
                            <button
                                onClick={handleQuickSave}
                                className="group relative bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 hover:border-green-400 rounded-xl p-6 text-left transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-green-100 group-hover:bg-green-200 flex items-center justify-center flex-shrink-0 transition-colors">
                                        <Zap className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            Snabbspara
                                            <Badge className="bg-green-100 text-green-700 text-xs">
                                                2 sek
                                            </Badge>
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Spara förbättringar direkt till ditt CV utan ytterligare steg
                                        </p>
                                        <ul className="text-xs text-gray-500 space-y-1">
                                            <li className="flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3 text-green-600" />
                                                Snabbt och enkelt
                                            </li>
                                            <li className="flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3 text-green-600" />
                                                Sparar automatiskt
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </button>

                            {/* Full Workflow Option */}
                            <button
                                onClick={handleFullWorkflow}
                                className="group relative bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-purple-200 hover:border-purple-400 rounded-xl p-6 text-left transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center flex-shrink-0 transition-colors">
                                        <Sparkles className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            Granska & Anpassa
                                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                                                2-3 min
                                            </Badge>
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Förhandsgranska, anpassa och välj mellan att spara eller ladda ner
                                        </p>
                                        <ul className="text-xs text-gray-500 space-y-1">
                                            <li className="flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3 text-purple-600" />
                                                Full kontroll över förbättringar
                                            </li>
                                            <li className="flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3 text-purple-600" />
                                                Förhandsgranska före/efter
                                            </li>
                                            <li className="flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3 text-purple-600" />
                                                Välj CV-mall och format
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowImplementationChoice(false)}
                            className="w-full text-gray-600 hover:text-gray-800 font-medium px-6 py-3 rounded-lg transition-colors"
                        >
                            Avbryt
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8"
                    >
                        <div className="text-center">
                            {/* Success Icon */}
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                CV Uppdaterat!
                            </h3>

                            {/* Description */}
                            <p className="text-gray-600 mb-6">
                                Dina valda förbättringar har implementerats och sparats i ditt CV.
                            </p>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Link
                                    href="/dashboard/profil/cv"
                                    className="block w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <ClipboardList className="w-5 h-5" />
                                        Visa mitt CV
                                    </div>
                                </Link>

                                <Link
                                    href="/cv-mallar"
                                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Star className="w-5 h-5" />
                                        Ladda ner med CV-mall
                                    </div>
                                </Link>

                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-full text-gray-600 hover:text-gray-800 font-medium px-6 py-3 rounded-lg transition-colors"
                                >
                                    Stäng
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Processing Overlay */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                            <p className="text-lg font-semibold text-gray-900">
                                Implementerar förbättringar...
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                Detta kan ta några sekunder
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
CvAnalysisResults.displayName = 'CvAnalysisResults'; // For easier debugging

export default CvAnalysisResults;