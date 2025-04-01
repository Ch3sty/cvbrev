import React from 'react'
import {
  ClipboardCheck,
  ThumbsUp,
  Lightbulb,
  Tags,
  Star,
  CheckCircle,
  AlertCircle,
  Type,
  Wrench,
  Info // Importerad för tooltips
} from 'lucide-react'

// Definiera strukturen på datan vi förväntar oss från API:et
interface CvAnalysisData {
  summary: string;
  strengths: string[];
  improvement_areas: string[];
  keywords: string[];
  clarity_score?: number;
  action_verbs_usage?: string; // Behåller JSON-nyckeln
}

interface CvAnalysisResultsProps {
  data: CvAnalysisData | null;
}

// --- UPPDATERAD AnalysisSection med Tooltip-funktion ---
const AnalysisSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  tooltipText?: string; // Valfri prop för tooltip-text
  children: React.ReactNode;
}> = ({ title, icon, tooltipText, children }) => (
  <div className="bg-navy-700/50 p-4 rounded-lg border border-gray-700 mb-4 last:mb-0">
    <h3 className="text-lg font-semibold text-white mb-3 flex items-center group relative"> {/* Group + Relative för tooltip */}
      <span className="mr-2 text-pink-400">{icon}</span>
      {title}
      {/* Visa Info-ikon och Tooltip om tooltipText finns */}
      {tooltipText && (
        <span className="ml-2 cursor-help">
          <Info size={16} className="text-gray-400 group-hover:text-gray-200 transition-colors" />
          {/* Själva Tooltip-bubblan */}
          <span className="absolute left-0 top-full mt-2 w-64 p-2 bg-gray-900 border border-gray-700 text-white text-xs rounded-md shadow-lg
                         opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-10 pointer-events-none">
            {tooltipText}
          </span>
        </span>
      )}
    </h3>
    <div className="text-gray-300 text-sm space-y-2">
      {children}
    </div>
  </div>
);
// --- Slut på uppdaterad AnalysisSection ---

// Huvudkomponenten för att visa hela analysen
const CvAnalysisResults: React.FC<CvAnalysisResultsProps> = ({ data }) => {
  if (!data) {
    return <p className="text-gray-400">Ingen analysdata att visa.</p>;
  }

  const renderList = (items: string[] | undefined) => {
    if (!items || items.length === 0) {
      return <p className="italic text-gray-500">Inga specifika punkter identifierade.</p>;
    }
    return (
      <ul className="list-disc list-outside pl-5 space-y-1">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  const renderKeywords = (keywords: string[] | undefined) => {
    if (!keywords || keywords.length === 0) {
      return <p className="italic text-gray-500">Inga nyckelord identifierade.</p>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <span
            key={index}
            className="bg-pink-600/20 text-pink-300 px-2.5 py-1 rounded-full text-xs font-medium"
          >
            {keyword}
          </span>
        ))}
      </div>
    );
  };

  const renderScore = (score: number | undefined) => {
    if (score === undefined || score === null) return <span className="italic text-gray-500">Ej bedömd</span>;
    const filledStars = Math.max(0, Math.min(5, Math.round(score / 2))); // Säkerställ 0-5
    const emptyStars = 5 - filledStars;
    return (
      <div className="flex items-center">
        {[...Array(filledStars)].map((_, i) => (
          <Star key={`filled-${i}`} className="w-4 h-4 text-yellow-400 fill-current" />
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-600" />
        ))}
        <span className="ml-2 text-xs text-gray-400">({score}/10)</span>
      </div>
    );
  };

  // Ändrad funktion för att rendera "Starka Verb"-bedömning
  const renderActionVerbs = (usage: string | undefined) => {
    if (!usage) return <span className="italic text-gray-500">Ej bedömd</span>;
    const lowerUsage = usage.toLowerCase();
    let icon = <CheckCircle className="w-4 h-4 text-green-400" />;
    if (lowerUsage.includes('förbättras') || lowerUsage.includes('improve')) {
      icon = <AlertCircle className="w-4 h-4 text-yellow-400" />;
    } else if (lowerUsage.includes('varierad') || lowerUsage.includes('varied')) {
       icon = <Wrench className="w-4 h-4 text-blue-400" />;
    }

    return (
        <div className="flex items-center space-x-2">
           {icon}
           <span>{usage}</span>
        </div>
    );
  };

  // Definiera tooltip-texter
  const clarityTooltip = "Bedömer hur lättläst och välstrukturerat ditt CV är på en skala 1-10. Tydliga rubriker, lagom textmängd och en logisk ordning bidrar till högre poäng.";
  const verbsTooltip = "Använd kraftfulla verb (t.ex. 'ledde', 'utvecklade', 'optimerade') för att tydligt visa vad du åstadkommit, istället för passiva formuleringar (t.ex. 'var delaktig i').";

  return (
    <div className="space-y-5">
      {/* Sammanfattning (Oförändrad) */}
      <AnalysisSection title="Sammanfattning" icon={<ClipboardCheck size={20} />}>
        <p>{data.summary || <span className="italic text-gray-500">Ingen sammanfattning tillgänglig.</span>}</p>
      </AnalysisSection>

      {/* Styrkor (Oförändrad) */}
      <AnalysisSection title="Identifierade Styrkor" icon={<ThumbsUp size={20} />}>
        {renderList(data.strengths)}
      </AnalysisSection>

      {/* Förbättringsområden (Oförändrad) */}
      <AnalysisSection title="Förbättringsområden" icon={<Lightbulb size={20} />}>
        {renderList(data.improvement_areas)}
      </AnalysisSection>

      {/* Nyckelord (Oförändrad) */}
      <AnalysisSection title="Nyckelord" icon={<Tags size={20} />}>
        {renderKeywords(data.keywords)}
      </AnalysisSection>

      {/* Sektion för tydlighet och verb - UPPDATERAD MED TOOLTIPS */}
      {(data.clarity_score !== undefined || data.action_verbs_usage !== undefined) && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Tydlighet & Struktur - med tooltip */}
           {data.clarity_score !== undefined && (
              <AnalysisSection
                 title="Tydlighet & Struktur"
                 icon={<Type size={20} />}
                 tooltipText={clarityTooltip} // <-- Tooltip tillagd
              >
                {renderScore(data.clarity_score)}
              </AnalysisSection>
           )}
           {/* Starka Verb - med tooltip och ny rubrik */}
            {data.action_verbs_usage !== undefined && (
              <AnalysisSection
                 title="Starka Verb" // <-- Ny rubrik
                 icon={<CheckCircle size={20} />} // Ikon kan justeras om du vill
                 tooltipText={verbsTooltip} // <-- Tooltip tillagd
              >
                 {renderActionVerbs(data.action_verbs_usage)}
              </AnalysisSection>
            )}
         </div>
      )}
    </div>
  );
};

export default CvAnalysisResults;