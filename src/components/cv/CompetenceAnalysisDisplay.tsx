// src/components/cv/CompetenceAnalysisDisplay.tsx
'use client';

// --- Core React/Next Imports ---
import React from 'react';
import Link from 'next/link';

// --- Icons ---
import {
    CheckCircle, AlertTriangle, GraduationCap, Search, Briefcase, Building,
    Languages, BookOpen, Award, Loader2, ServerCrash, SearchX, Target,
    Lock, ArrowRight, ThumbsUp, ClipboardList, Clock, Coins, ExternalLink, Star
} from 'lucide-react';

// --- Type Definitions ---
import {
    CompetenceAnalysisResult as InitialCompetenceAnalysisResult,
    IdentifiedSkill,
    MissingSkill,
} from '@/lib/openai/analyzeCompetenceGap';

// --- Lokal Typ för Lärandeförslag ---
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

// --- Typ för den fullständiga datan ---
type FullAnalysisData = (InitialCompetenceAnalysisResult & {
    suggestedLearningPath: LearningSuggestion[];
}) | null;

// --- Props för huvudkomponenten ---
interface CompetenceAnalysisDisplayProps {
    data: FullAnalysisData;
    isLoading?: boolean;
    error?: string | null;
    subscriptionTier?: 'free' | 'premium';
}

// ============================================================================
//  Styling Constants
// ============================================================================
const sectionBaseClasses = "bg-navy-900/50 border border-navy-700 rounded-lg overflow-hidden";
const sectionHeaderClasses = "px-5 py-3 border-b border-navy-700";
const sectionTitleClasses = "text-lg font-semibold text-white flex items-center";
const sectionIconClasses = "w-5 h-5 mr-2 text-pink-400 flex-shrink-0";
const sectionContentClasses = "p-5";
const fallbackTextClasses = "text-gray-500 italic text-sm";
const listSeparatorClasses = "border-l-2 pl-3 text-sm"; // För listor
const upgradeMessageClasses = "mt-4 p-3 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700/40 rounded-lg text-sm text-purple-200 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-inner";
const upgradeLinkClasses = "ml-auto sm:ml-2 mt-1 sm:mt-0 whitespace-nowrap inline-flex items-center text-sm font-medium text-pink-400 hover:text-pink-300 hover:underline transition-colors duration-200 group";
const searchKeywordSpanClasses = "inline-block text-xs bg-navy-700/70 text-gray-300 border border-navy-600 px-2 py-0.5 rounded cursor-default";

// ============================================================================
//  Helper Rendering Components
// ============================================================================

/**
 * Generell sektionswrapper med header och content-område.
 */
const AnalysisSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; headerContent?: React.ReactNode }> = React.memo(({ title, icon: Icon, children, headerContent }) => (
    <section className={sectionBaseClasses}>
        <div className={sectionHeaderClasses}>
            <h3 className={sectionTitleClasses}>
                <Icon className={sectionIconClasses} aria-hidden="true" />
                {title}
            </h3>
            {headerContent}
        </div>
        <div className={sectionContentClasses}>
            {children}
        </div>
    </section>
));
AnalysisSection.displayName = 'AnalysisSection';

/**
 * Visar en betygsindikator (väsentlig/önskvärd).
 */
const ImportanceIndicator: React.FC<{ importance?: MissingSkill['importance'] }> = React.memo(({ importance }) => { /* ... (samma som tidigare) ... */ let color = 'text-gray-400'; let text = 'Oklar'; if (importance === 'essential') { color = 'text-red-400'; text = 'Väsentlig'; } else if (importance === 'desirable') { color = 'text-yellow-400'; text = 'Önskvärd'; } if (!importance || importance === 'unclear') return null; return <span className={`ml-1.5 text-xs font-semibold ${color}`}>({text})</span>; });
ImportanceIndicator.displayName = 'ImportanceIndicator';

/**
 * Visar en relevansindikator (hög/medel/låg).
 */
const RelevanceIndicator: React.FC<{ relevance?: IdentifiedSkill['relevance_to_target'] }> = React.memo(({ relevance }) => { /* ... (samma som tidigare) ... */ let color = 'text-gray-400'; let text = 'Okänd relevans'; if (relevance === 'high') { color = 'text-green-400'; text = 'Hög relevans'; } else if (relevance === 'medium') { color = 'text-blue-400'; text = 'Medel relevans'; } else if (relevance === 'low') { color = 'text-gray-500'; text = 'Lägre relevans'; } if (!relevance) return null; return <span className={`ml-1.5 text-xs font-medium ${color}`}>({text})</span>; });
RelevanceIndicator.displayName = 'RelevanceIndicator';

/**
 * Visar en ikon baserat på lärandetyp.
 */
const LearningIcon: React.FC<{ type: LearningSuggestion['type'] }> = React.memo(({ type }) => { /* ... (samma som tidigare) ... */ switch (type) { case 'course': return <GraduationCap className="w-5 h-5 text-blue-400 flex-shrink-0" />; case 'certification': return <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />; case 'project': return <Briefcase className="w-5 h-5 text-teal-400 flex-shrink-0" />; case 'self-study': return <BookOpen className="w-5 h-5 text-indigo-400 flex-shrink-0" />; default: return <GraduationCap className="w-5 h-5 text-gray-400 flex-shrink-0" />; } });
LearningIcon.displayName = 'LearningIcon';

/**
 * Visar uppgraderingsmeddelandet.
 */
const UpgradeMessage: React.FC<{ hiddenCount: number; itemType: string }> = React.memo(({ hiddenCount, itemType }) => { /* ... (samma som tidigare) ... */ if (hiddenCount <= 0) return null; return ( <div className={upgradeMessageClasses}> <div className="flex items-center flex-shrink-0"> <Lock className="w-5 h-5 text-purple-400" /> </div> <div className="flex-grow"> <span className="font-medium">Se {hiddenCount} till {itemType}?</span> <p className="text-xs text-purple-300/80">Uppgradera för att se allt.</p> </div> <Link href="/priser" target="_blank" rel="noopener noreferrer" className={upgradeLinkClasses}> Uppgradera nu <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5" /> </Link> </div> ); });
UpgradeMessage.displayName = 'UpgradeMessage';

/**
 * Visar en lista med söktermer.
 */
const SearchKeywordDisplay: React.FC<{ keywords?: string[] }> = React.memo(({ keywords }) => {
    if (!keywords || keywords.length === 0) return null;
    return (
        <div className="mt-2 pt-2 border-t border-navy-700/50">
            <p className="text-xs font-medium text-gray-400 mb-1.5 flex items-center"> <Search className="w-3 h-3 mr-1 text-gray-400"/> Föreslagna söktermer: </p>
            <div className="flex flex-wrap gap-1.5">
                {keywords.map((keyword, kwIndex) => (
                    // Använder span istället för Badge
                    <span key={kwIndex} className={searchKeywordSpanClasses}>
                        {keyword}
                    </span>
                ))}
            </div>
        </div>
    );
});
SearchKeywordDisplay.displayName = 'SearchKeywordDisplay';

/**
 * Visar ett enskilt lärandeförslag.
 */
const LearningSuggestionItem: React.FC<{ item: LearningSuggestion }> = React.memo(({ item }) => {
    // Prioritetsfärg och text
    const getPriorityColor = (priority?: string) => {
        if (priority === 'essential') return 'text-red-400';
        if (priority === 'recommended') return 'text-yellow-400';
        return 'text-gray-400';
    };

    const getPriorityText = (priority?: string) => {
        if (priority === 'essential') return 'Väsentlig';
        if (priority === 'recommended') return 'Rekommenderad';
        return 'Valfri';
    };

    return (
        <div className="bg-navy-800/60 p-4 rounded-lg border border-navy-700/70 hover:border-navy-600/80 transition-colors">
            {/* Header med ikon och prioritet */}
            <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 pt-0.5">
                    <LearningIcon type={item.type} />
                </div>
                <div className="flex-grow">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-white text-base">{item.title}</h4>
                        {item.priority && (
                            <span className={`flex items-center text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                <Star className="w-3 h-3 mr-1" />
                                {getPriorityText(item.priority)}
                            </span>
                        )}
                    </div>
                    {item.provider && (
                        <p className="text-sm text-gray-400 mt-1 flex items-center">
                            <Building className="w-3.5 h-3.5 mr-1.5 flex-shrink-0"/>
                            {item.provider}
                        </p>
                    )}
                </div>
            </div>

            {/* Beskrivning */}
            <p className="text-gray-300 text-sm leading-relaxed mb-3">{item.relevance}</p>

            {/* Kursinfo: Längd, Kostnad, Språk */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-3">
                {item.duration && (
                    <span className="flex items-center text-gray-300">
                        <Clock className="w-4 h-4 mr-1.5 text-blue-400"/>
                        {item.duration}
                    </span>
                )}
                {item.cost && (
                    <span className="flex items-center text-gray-300">
                        <Coins className="w-4 h-4 mr-1.5 text-green-400"/>
                        {item.cost}
                    </span>
                )}
                {item.language && (
                    <span className="flex items-center text-gray-300">
                        <Languages className="w-4 h-4 mr-1.5 text-purple-400"/>
                        {item.language === 'sv' ? 'Svenska' : item.language === 'en' ? 'Engelska' : item.language}
                    </span>
                )}
            </div>

            {/* Direktlänk eller söktermer */}
            {item.direct_url ? (
                <a
                    href={item.direct_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-pink-400 hover:text-pink-300 transition-colors group"
                >
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    Gå direkt till kursen
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </a>
            ) : (
                <SearchKeywordDisplay keywords={item.search_keywords} />
            )}
        </div>
    );
});
LearningSuggestionItem.displayName = 'LearningSuggestionItem';

// ============================================================================
//  Main Analysis Display Component
// ============================================================================
const CompetenceAnalysisDisplay: React.FC<CompetenceAnalysisDisplayProps> = React.memo(({
    data,
    isLoading,
    error,
    subscriptionTier
}) => {

    const isFreeTier = subscriptionTier === 'free';

    // --- Loading, Error, No Data States ---
    if (isLoading) { return ( <div className="flex flex-col items-center justify-center text-center py-10 bg-navy-900/30 rounded-lg border border-navy-700"> <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" /> <p>Analyserar kompetens...</p> </div> ); }
    if (error && !data) { return ( <div className="p-5 bg-red-900/40 border border-red-700 rounded-lg flex items-start text-sm text-red-200"> <ServerCrash className="w-6 h-6 mr-3 text-red-400 flex-shrink-0 mt-0.5" /> <div> <p className="font-semibold mb-1">Analysen misslyckades</p> <p>{error}</p> </div> </div> ); }
    if (!data) { return ( <div className="flex flex-col items-center justify-center text-center py-10 bg-navy-900/30 rounded-lg border border-navy-700"> <SearchX className="w-12 h-12 mb-4 text-gray-600" /> <p>Ingen analysdata att visa.</p> </div> ); }

    // --- Prepare Data for Display (Apply Tier Limits) ---
    const allGaps = data.identifiedSkillGaps || [];
    const allSuggestions = data.suggestedLearningPath || [];

    const MAX_GAPS_FREE = 2;
    const MAX_SUGGESTIONS_FREE = 3; // Visa 3 förslag för bättre översikt

    // Visa max 2 gap för free, annars alla
    const gapsToShow = isFreeTier ? allGaps.slice(0, MAX_GAPS_FREE) : allGaps;
    // Visa max 3 förslag för free, annars ALLA för premium
    const suggestionsToShow = isFreeTier ? allSuggestions.slice(0, MAX_SUGGESTIONS_FREE) : allSuggestions;

    const hiddenGapsCount = allGaps.length - gapsToShow.length;
    const hiddenSuggestionsCount = allSuggestions.length - suggestionsToShow.length;

    // --- Render Main Analysis Content ---
    return (
        <div className="space-y-4 animate-fadeIn"> {/* Minskad space-y */}

            {/* --- Analysmål --- */}
            <AnalysisSection title="Analysmål" icon={Target}>
                <p className="text-sm text-gray-300">{data.targetDescription || "Okänt mål"}</p>
            </AnalysisSection>

            {/* --- Sammanfattning --- */}
            <AnalysisSection title="Sammanfattning" icon={ClipboardList}>
                 <p className="text-sm text-gray-300">{data.cvSummaryForTarget || fallbackTextClasses}</p>
             </AnalysisSection>

            {/* --- Relevanta Färdigheter --- */}
            <AnalysisSection title="Relevanta Färdigheter" icon={CheckCircle}>
                {data.identifiedRelevantSkills?.length > 0 ? (
                    <ul className="space-y-3">
                        {data.identifiedRelevantSkills.map((item, index) => (
                            <li key={index} className={`${listSeparatorClasses} border-green-500/50`}>
                                <p className="font-medium text-gray-200 flex items-center">
                                    {item.skill} <RelevanceIndicator relevance={item.relevance_to_target} />
                                </p>
                                {item.source_in_cv && <p className="text-xs text-gray-400 mt-0.5 italic">"{item.source_in_cv}"</p>}
                            </li>
                        ))}
                    </ul>
                ) : ( <p className={fallbackTextClasses}>Inga specifikt relevanta färdigheter identifierades.</p> )}
            </AnalysisSection>

            {/* --- Möjliga Kompetensgap --- */}
            <AnalysisSection title="Möjliga Kompetensgap" icon={AlertTriangle}>
                {allGaps.length > 0 ? (
                    <>
                        <ul className="space-y-4">
                            {gapsToShow.map((item, index) => (
                                <li key={index} className={`${listSeparatorClasses} ${item.importance === 'essential' ? 'border-red-500/60' : 'border-yellow-500/60'}`}>
                                    <p className="font-medium text-gray-200 flex items-center">
                                        {item.skill} <ImportanceIndicator importance={item.importance} />
                                    </p>
                                    {item.reasoning && <p className="text-xs text-gray-400 mt-0.5">{item.reasoning}</p>}
                                </li>
                            ))}
                        </ul>
                        {isFreeTier && <UpgradeMessage hiddenCount={hiddenGapsCount} itemType="kompetensgap" />}
                    </>
                ) : ( <div className="flex items-center text-sm text-green-300"> <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0"/> <span>Inga uppenbara kompetensgap identifierades.</span> </div> )}
            </AnalysisSection>

            {/* --- Förslag på Lärande & Utveckling --- */}
            <AnalysisSection title="Förslag på Lärande & Utveckling" icon={GraduationCap}>
                {allSuggestions.length > 0 ? (
                    <>
                        <div className="space-y-4">
                             {suggestionsToShow.map((item, index) => (
                                <LearningSuggestionItem key={index} item={item} />
                             ))}
                        </div>
                        {isFreeTier && <UpgradeMessage hiddenCount={hiddenSuggestionsCount} itemType="lärandeförslag" />}
                    </>
                 ) : ( <p className={fallbackTextClasses}>Inga specifika lärandeförslag genererades.</p> )}
            </AnalysisSection>

        </div>
    );
});
CompetenceAnalysisDisplay.displayName = 'CompetenceAnalysisDisplay';

export default CompetenceAnalysisDisplay;