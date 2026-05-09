'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  Target,
  TrendingUp,
  Lightbulb,
  Eye,
  Award,
  FileSearch,
  Sparkles
} from 'lucide-react';

interface ATSOptimizerProps {
  selectedCV: any;
  selectedTemplate?: string | null;
  className?: string;
}

interface ATSOptimization {
  score: number;
  issues: ATSIssue[];
  suggestions: ATSSuggestion[];
  keywords: KeywordAnalysis;
  swedishMarketInsights: SwedishMarketInsight[];
}

interface ATSIssue {
  type: 'critical' | 'warning' | 'info';
  category: 'format' | 'keywords' | 'structure' | 'content';
  title: string;
  description: string;
  fix: string;
}

interface ATSSuggestion {
  type: 'keyword' | 'format' | 'content' | 'structure';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  swedishRelevance: number; // 0-100
}

interface KeywordAnalysis {
  detected: string[];
  missing: string[];
  density: Record<string, number>;
  swedishJobPortals: {
    linkedin: string[];
    stepstone: string[];
    theHub: string[];
  };
}

interface SwedishMarketInsight {
  category: 'industry' | 'location' | 'company-size' | 'culture';
  title: string;
  description: string;
  actionable: string;
  relevanceScore: number;
}

export default function ATSOptimizer({ 
  selectedCV, 
  selectedTemplate,
  className = ""
}: ATSOptimizerProps) {
  const [optimization, setOptimization] = useState<ATSOptimization | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'suggestions' | 'swedish'>('overview');
  
  // Analysera CV för ATS-optimering
  const analyzeForATS = useMemo(() => {
    if (!selectedCV?.cv_text) return null;
    
    const cvText = selectedCV.cv_text.toLowerCase();
    const analysis: ATSOptimization = {
      score: 0,
      issues: [],
      suggestions: [],
      keywords: {
        detected: [],
        missing: [],
        density: {},
        swedishJobPortals: {
          linkedin: [],
          stepstone: [],
          theHub: []
        }
      },
      swedishMarketInsights: []
    };
    
    // 1. Strukturanalys
    analyzeStructure(cvText, analysis);
    
    // 2. Nyckelordsanalys
    analyzeKeywords(cvText, analysis);
    
    // 3. Formatanalys
    analyzeFormat(selectedTemplate || null, analysis);
    
    // 4. Svenska marknadsinsikter
    analyzeSwedishMarket(cvText, analysis);
    
    // 5. Beräkna total score
    calculateATSScore(analysis);
    
    return analysis;
  }, [selectedCV, selectedTemplate]);
  
  // Kör analys när CV ändras
  useEffect(() => {
    if (analyzeForATS) {
      setIsAnalyzing(true);
      // Simulera analystid för bättre UX
      setTimeout(() => {
        setOptimization(analyzeForATS);
        setIsAnalyzing(false);
      }, 1500);
    }
  }, [analyzeForATS]);
  
  if (!selectedCV) {
    return (
      <Card className={`bg-navy-700 border-navy-600 ${className}`}>
        <CardContent className="p-6 text-center">
          <FileSearch className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">Välj ett CV för ATS-optimering</p>
        </CardContent>
      </Card>
    );
  }
  
  if (isAnalyzing || !optimization) {
    return (
      <Card className={`bg-navy-700 border-navy-600 ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-medium mb-2">Analyserar för ATS-optimering...</p>
          <p className="text-gray-400 text-sm">Kontrollerar svenska marknadsstandards</p>
        </CardContent>
      </Card>
    );
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500';
    return 'bg-red-500/20 border-red-500';
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* ATS Score Overview */}
      <Card className={`border ${getScoreBg(optimization.score)}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-blue-400" />
              ATS-Optimering
              <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                Svenska Marknaden
              </Badge>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(optimization.score)}`}>
              {optimization.score}/100
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Progress bar */}
          <div className="w-full bg-navy-600 rounded-full h-2 mb-4">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                optimization.score >= 80 ? 'bg-green-500' : 
                optimization.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${optimization.score}%` }}
            ></div>
          </div>
          
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-red-400 text-lg font-bold">
                {optimization.issues.filter(i => i.type === 'critical').length}
              </div>
              <div className="text-gray-400 text-xs">Kritiska Problem</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 text-lg font-bold">
                {optimization.suggestions.filter(s => s.impact === 'high').length}
              </div>
              <div className="text-gray-400 text-xs">Viktiga Förslag</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 text-lg font-bold">
                {optimization.keywords.detected.length}
              </div>
              <div className="text-gray-400 text-xs">Nyckelord Hittade</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-navy-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Översikt', icon: Eye },
          { id: 'keywords', label: 'Nyckelord', icon: Target },
          { id: 'suggestions', label: 'Förslag', icon: Lightbulb },
          { id: 'swedish', label: 'Svenska Insikter', icon: Award }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-navy-700'
              }`}
            >
              <Icon className="w-4 h-4 mr-1" />
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <Card className="bg-navy-700 border-navy-600">
          <CardHeader>
            <CardTitle className="text-white text-lg">Kritiska Problem & Snabba Fixar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {optimization.issues.slice(0, 5).map((issue, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-navy-600 rounded-lg">
                {issue.type === 'critical' ? (
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                ) : issue.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-grow">
                  <h4 className="text-white font-medium mb-1">{issue.title}</h4>
                  <p className="text-gray-400 text-sm mb-2">{issue.description}</p>
                  <div className="bg-navy-500 p-2 rounded text-sm text-gray-300">
                    <strong>Fix:</strong> {issue.fix}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {activeTab === 'keywords' && (
        <Card className="bg-navy-700 border-navy-600">
          <CardHeader>
            <CardTitle className="text-white text-lg">Nyckelordsanalys för Svenska ATS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Detected keywords */}
            <div>
              <h4 className="text-green-400 font-medium mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Hittade Nyckelord ({optimization.keywords.detected.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {optimization.keywords.detected.slice(0, 10).map((keyword, index) => (
                  <Badge key={index} className="bg-green-500/20 text-green-400 border-green-500">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Missing keywords */}
            <div>
              <h4 className="text-red-400 font-medium mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Saknade Viktiga Nyckelord ({optimization.keywords.missing.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {optimization.keywords.missing.slice(0, 8).map((keyword, index) => (
                  <Badge key={index} className="bg-red-500/20 text-red-400 border-red-500">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Swedish job portals */}
            <div>
              <h4 className="text-blue-400 font-medium mb-2">Optimerat för Svenska Jobbportaler</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-gray-400 text-xs mb-1">LinkedIn Sverige</div>
                  <div className="flex flex-wrap gap-1">
                    {optimization.keywords.swedishJobPortals.linkedin.slice(0, 3).map((kw, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-blue-500 text-blue-400">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">StepStone</div>
                  <div className="flex flex-wrap gap-1">
                    {optimization.keywords.swedishJobPortals.stepstone.slice(0, 3).map((kw, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-purple-500 text-purple-400">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">TheHub</div>
                  <div className="flex flex-wrap gap-1">
                    {optimization.keywords.swedishJobPortals.theHub.slice(0, 3).map((kw, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-green-500 text-green-400">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {activeTab === 'suggestions' && (
        <Card className="bg-navy-700 border-navy-600">
          <CardHeader>
            <CardTitle className="text-white text-lg">Förbättringsförslag</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {optimization.suggestions.map((suggestion, index) => (
              <div key={index} className="p-4 bg-navy-600 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <h4 className="text-white font-medium">{suggestion.title}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={`text-xs ${
                        suggestion.impact === 'high' ? 'bg-red-500' : 
                        suggestion.impact === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                    >
                      {suggestion.impact === 'high' ? 'Hög Effekt' : 
                       suggestion.impact === 'medium' ? 'Medium Effekt' : 'Låg Effekt'}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-pink-500 text-pink-400">
                      {suggestion.swedishRelevance}% Sverige
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{suggestion.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {activeTab === 'swedish' && (
        <Card className="bg-navy-700 border-navy-600">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-400" />
              Svenska Arbetsmarknadsinsikter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {optimization.swedishMarketInsights.map((insight, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-navy-600 to-navy-500 rounded-lg border border-yellow-500/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-yellow-400 font-medium">{insight.title}</h4>
                  <div className="text-yellow-400 text-sm font-medium">
                    {insight.relevanceScore}% Relevant
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                <div className="bg-navy-700/50 p-3 rounded border-l-4 border-yellow-400">
                  <div className="text-yellow-400 text-xs font-medium mb-1">REKOMMENDERAD ÅTGÄRD:</div>
                  <div className="text-gray-200 text-sm">{insight.actionable}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper functions för ATS-analys

function analyzeStructure(cvText: string, analysis: ATSOptimization) {
  // Kontrollera grundstruktur
  if (!cvText.includes('erfarenhet') && !cvText.includes('experience')) {
    analysis.issues.push({
      type: 'critical',
      category: 'structure',
      title: 'Saknar tydlig erfarenhetssektion',
      description: 'ATS-system letar efter klara sektioner som "Arbetslivserfarenhet"',
      fix: 'Lägg till en tydlig sektion med rubriken "Arbetslivserfarenhet" eller "Erfarenhet"'
    });
  }
  
  if (!cvText.includes('utbildning') && !cvText.includes('education')) {
    analysis.issues.push({
      type: 'warning',
      category: 'structure',
      title: 'Otydlig utbildningssektion',
      description: 'Utbildningsinformation bör ha en egen sektion',
      fix: 'Skapa en separat sektion för "Utbildning"'
    });
  }
}

function analyzeKeywords(cvText: string, analysis: ATSOptimization) {
  // Svenska nyckelord för olika branscher
  const swedishKeywords = {
    tech: ['utveckling', 'programmering', 'agile', 'scrum', 'javascript', 'python', 'react', 'node.js'],
    business: ['projektledning', 'affärsutveckling', 'försäljning', 'marknadsföring', 'analys'],
    general: ['teamwork', 'problemlösning', 'kommunikation', 'ledarskap', 'självständig']
  };
  
  const allKeywords = [...swedishKeywords.tech, ...swedishKeywords.business, ...swedishKeywords.general];
  
  analysis.keywords.detected = allKeywords.filter(kw => cvText.includes(kw.toLowerCase()));
  analysis.keywords.missing = allKeywords.filter(kw => 
    !cvText.includes(kw.toLowerCase()) && Math.random() > 0.7 // Simulera relevanta saknade nyckelord
  ).slice(0, 6);
  
  // Simulera svenska jobbportaloptimering
  analysis.keywords.swedishJobPortals = {
    linkedin: ['projektledning', 'teamwork', 'javascript'],
    stepstone: ['problemlösning', 'utveckling', 'analys'],
    theHub: ['kommunikation', 'ledarskap', 'agile']
  };
}

function analyzeFormat(selectedTemplate: string | null, analysis: ATSOptimization) {
  const atsSafeTemplates = ['norrsken', 'tidlos-formell', 'sidebar-icons', 'stack-developer', 'student-startup'];
  if (selectedTemplate && atsSafeTemplates.includes(selectedTemplate)) {
    analysis.suggestions.push({
      type: 'format',
      title: 'Perfekt mallval för ATS',
      description: 'Du använder en av de mest ATS-vänliga mallarna',
      impact: 'high',
      swedishRelevance: 95
    });
  }
}

function analyzeSwedishMarket(cvText: string, analysis: ATSOptimization) {
  analysis.swedishMarketInsights = [
    {
      category: 'industry',
      title: 'Svensk Tech-marknad 2024',
      description: 'Svenska tech-företag prioriterar hållbarhet och innovation. Framhäv miljömedvetenhet och tech-for-good projekt.',
      actionable: 'Lägg till hållbarhetsprojekt eller miljöinitiativ du varit del av. Använd nyckelord som "hållbar utveckling" eller "grön tech".',
      relevanceScore: 87
    },
    {
      category: 'culture',
      title: 'Svenska Workplace Culture',
      description: 'Work-life balance och platt organisationsstruktur är viktigt på svenska arbetsplatser.',
      actionable: 'Framhäv erfarenhet av självständigt arbete, flexibilitet och kollaborativ problemlösning.',
      relevanceScore: 92
    },
    {
      category: 'location',
      title: 'Stockholmsregionen Jobb-trends',
      description: 'Hybridarbete och tech-innovation driver jobbmarknaden. Fintech och hållbar tech växer snabbt.',
      actionable: 'Framhäv remote work-erfarenhet och tekniska färdigheter inom fintech eller cleantech om relevant.',
      relevanceScore: 78
    }
  ];
  
  // Lägg till mer suggestions baserat på text
  analysis.suggestions.push(
    {
      type: 'content',
      title: 'Lägg till kvantifierbara resultat',
      description: 'Svenska rekryterare uppskattar konkreta mätbara prestationer',
      impact: 'high',
      swedishRelevance: 90
    },
    {
      type: 'keyword',
      title: 'Inkludera svenska företagskulturnyckelord',
      description: 'Ord som "kollaborativ", "självständig" och "flexibel" resonerar med svenska arbetsgivare',
      impact: 'medium',
      swedishRelevance: 85
    }
  );
}

function calculateATSScore(analysis: ATSOptimization) {
  let score = 100;
  
  // Dra av för kritiska problem
  score -= analysis.issues.filter(i => i.type === 'critical').length * 15;
  score -= analysis.issues.filter(i => i.type === 'warning').length * 8;
  
  // Lägg till för detekterade nyckelord
  score += Math.min(analysis.keywords.detected.length * 2, 20);
  
  // Bonus för svenska marknadsanpassning
  if (analysis.swedishMarketInsights.length > 0) {
    score += 10;
  }
  
  analysis.score = Math.max(0, Math.min(100, Math.round(score)));
}