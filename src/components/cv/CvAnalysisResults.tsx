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
    Info           // (Potentially for Tooltips - not used currently)
} from 'lucide-react';

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

interface PremiumAnalysisResult {
    analysisType: 'premium';
    summary?: string;
    detailedStrengths?: Array<{ point: string; example?: string }>;
    detailedImprovements?: PremiumImprovement[];
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
}

// ============================================================================
//  Styling Constants (Optional but can improve consistency)
// ============================================================================
const sectionBaseClasses = "bg-navy-900/50 border border-navy-700 rounded-lg p-5 transition-all hover:border-navy-600";
const sectionTitleClasses = "text-lg font-semibold text-white flex items-center mb-3";
const sectionIconClasses = "w-5 h-5 mr-2 text-pink-400 flex-shrink-0";
const listClasses = "list-disc pl-5 space-y-1 text-sm text-gray-300";
const premiumTeaserClasses = "bg-gradient-to-r from-pink-900/30 via-purple-900/20 to-navy-900/30 border border-pink-700/50 rounded-lg p-5 text-center";
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
                <span key={index} className="px-2.5 py-1 text-xs font-medium bg-pink-900/50 text-pink-300 rounded-full border border-pink-800/50">
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
        <div className="bg-navy-700/40 p-4 rounded-lg border border-navy-600 flex-1 min-w-[200px] flex flex-col">
            <h4 className="text-base font-semibold text-white flex items-center mb-2">
                <Icon className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0" aria-hidden="true" />
                {title}
            </h4>
            <div className="flex items-center mb-2" aria-label={`Betyg: ${rating} av ${maxRating}`}>
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 flex-shrink-0 ${i < visualRatingOutOf5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                    />
                ))}
                <span className="ml-2 text-xs text-gray-400">({rating}/{maxRating})</span>
            </div>
            <p className="text-xs text-gray-300 flex-grow">{feedback}</p> {/* flex-grow to push content */}
        </div>
    );
});
ScoreCard.displayName = 'ScoreCard';

/**
 * Renders the entire scores section, adapting display based on premium status.
 */
const ScoresSection: React.FC<{ scores?: BasicAnalysisResult['scores'] | PremiumAnalysisResult['scores']; isPremium: boolean }> = React.memo(({ scores, isPremium }) => {
    // Extract scores safely, provide fallbacks
    const clarityScore = scores?.clarityAndStructure;
    const impactScore = isPremium ? (scores as PremiumAnalysisResult['scores'])?.impactAndResults : undefined;
    // Use specific strongVerbs if available, else map impactAndResults for premium, else undefined
    const strongVerbScore = scores?.strongVerbs ?? impactScore;
    const overallScore = isPremium ? (scores as PremiumAnalysisResult['scores'])?.overall : undefined;
    const relevanceScore = isPremium ? (scores as PremiumAnalysisResult['scores'])?.relevance : undefined;

    // Check if there are any scores to display
    const hasScores = clarityScore || strongVerbScore || overallScore || relevanceScore;

    return (
        <AnalysisSection title="Poäng & Bedömning" icon={Trophy}>
            {hasScores ? (
                <div className="flex flex-wrap gap-4">
                    {/* Premium Scores */}
                    {isPremium && overallScore && <ScoreCard title="Övergripande" score={overallScore} maxRating={10} icon={CheckCircle} />}
                    {isPremium && relevanceScore && <ScoreCard title="Relevans" score={relevanceScore} maxRating={10} icon={Target} />}
                    {/* Common/Adapted Scores */}
                    {clarityScore && <ScoreCard title="Tydlighet & Struktur" score={clarityScore} maxRating={isPremium ? 10 : 5} icon={Type} />}
                    {strongVerbScore && <ScoreCard title={isPremium ? "Impact & Resultat" : "Starka Verb"} score={strongVerbScore} maxRating={isPremium ? 10 : 5} icon={Zap} />}
                 </div>
            ) : (
                <p className={fallbackTextClasses}>Ingen poänginformation tillgänglig.</p>
            )}
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
        <ul className="space-y-3">
            {strengths.map((item, index) => (
                <li key={index} className="border-l-2 border-green-500 pl-3 text-sm">
                    <p className="font-medium text-gray-200">{item.point}</p>
                    {item.example && <p className="text-xs text-gray-400 mt-1 italic">Exempel: "{item.example}"</p>}
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
                <li key={index} className="border-l-2 border-yellow-500 pl-3 text-sm">
                    <p className="font-medium text-gray-200"><span className="text-yellow-400 font-semibold">{item.area}:</span> {item.suggestion}</p>
                    {item.example && <p className="text-xs text-gray-400 mt-1 italic">Förslag: "{item.example}"</p>}
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
    const scoreColor = atsData.score >= 75 ? 'text-green-400' : atsData.score >= 50 ? 'text-yellow-400' : 'text-red-400';
    return (
        <AnalysisSection title="ATS-Vänlighet" icon={ScanSearch}>
             <div className="text-sm text-gray-300 space-y-2">
                <div className="flex items-baseline mb-1">
                    <span className={`text-2xl font-bold ${scoreColor}`}>{atsData.score}</span>
                    <span className="text-sm text-gray-400">/100</span>
                </div>
                <p>{atsData.feedback}</p>
                {atsData.missingKeywords && atsData.missingKeywords.length > 0 && (
                    <div className='pt-2'>
                        <h5 className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Potentiellt saknade nyckelord:</h5>
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
 * Renders a teaser prompting free users to upgrade to Premium.
 */
const PremiumTeaserSection: React.FC = React.memo(() => (
    <section className={premiumTeaserClasses}>
        <Crown className="w-8 h-8 mx-auto mb-3 text-yellow-400" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-white mb-2">Lås upp djupare insikter med Premium!</h3>
        <p className="text-sm text-gray-300 mb-4 max-w-md mx-auto">
            Få detaljerade exempel, ATS-analys, kvantifieringsförslag och mer avancerad poängsättning för att verkligen optimera ditt CV.
        </p>
        <Link
            href="/profile?tab=subscription" // Consistent link to upgrade
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 focus:ring-pink-500"
        >
            Uppgradera till Premium
            <ChevronRight className="w-4 h-4 ml-1.5" />
        </Link>
    </section>
));
PremiumTeaserSection.displayName = 'PremiumTeaserSection';


// ============================================================================
//  Main Analysis Results Component
// ============================================================================

const CvAnalysisResults: React.FC<CvAnalysisResultsProps> = React.memo(({ data }) => {

    // Handle loading or no data state gracefully
    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center text-center flex-grow py-10">
                <ClipboardList className="w-12 h-12 mb-4 text-gray-600" />
                <p className="text-lg text-gray-400">Ingen analysdata att visa.</p>
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

    return (
        <div className="space-y-6">
            {/* --- Common Sections --- */}
            <AnalysisSection title="Sammanfattning" icon={ClipboardList}>
                <p className="text-sm text-gray-300">{summary}</p>
            </AnalysisSection>

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
                    <PremiumImprovementsList improvements={premiumImprovements} />
                ) : (
                    <BasicList items={basicImprovements} />
                )}
            </AnalysisSection>

            <AnalysisSection title="Nyckelord" icon={Tags}>
                <KeywordList keywords={keywords} />
            </AnalysisSection>

            {/* Render scores using the dedicated component */}
            <ScoresSection scores={scores} isPremium={isPremium} />

            {/* --- Premium-Only Sections --- */}
            {isPremium && (
                <>
                    <AtsSection atsData={atsData} />
                    <QuantificationSection suggestions={quantificationSuggestions} />
                    {/* Add more premium-specific sections here if needed */}
                </>
            )}

            {/* --- Premium Teaser (Basic Users Only) --- */}
            {!isPremium && <PremiumTeaserSection />}
        </div>
    );
});
CvAnalysisResults.displayName = 'CvAnalysisResults'; // For easier debugging

export default CvAnalysisResults;