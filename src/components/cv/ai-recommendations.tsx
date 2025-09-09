'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, TrendingUp, Target, Loader2, ChevronRight, Info } from 'lucide-react';
import type { TemplateRecommendation } from '@/lib/ai/template-recommender';
import type { CVTemplateType } from '@/lib/cv/cv-metadata';
import { SIMPLE_TEMPLATES, getTemplateById } from '@/lib/cv/simple-templates';

interface AIRecommendationsProps {
  selectedCV: any;
  onSelectTemplate: (templateId: CVTemplateType) => void;
  getAIRecommendations: (cvId?: string) => Promise<TemplateRecommendation[]>;
  getQuickSmartRecommendations: (cvId?: string) => CVTemplateType[];
  selectedTemplate?: CVTemplateType | null;
  className?: string;
}

export default function AIRecommendations({
  selectedCV,
  onSelectTemplate,
  getAIRecommendations,
  getQuickSmartRecommendations,
  selectedTemplate,
  className = ""
}: AIRecommendationsProps) {
  const [aiRecommendations, setAiRecommendations] = useState<TemplateRecommendation[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [hasRunAIAnalysis, setHasRunAIAnalysis] = useState(false);
  
  // Quick recommendations (utan AI)
  const quickRecommendations = selectedCV ? getQuickSmartRecommendations(selectedCV.id) : [];
  
  // Template lookup (använder metadata för snabbare rendering)
  const getTemplateInfo = (templateId: CVTemplateType) => {
    return getTemplateById(templateId);
  };
  
  // Kör AI-analys
  const runAIAnalysis = async () => {
    if (!selectedCV?.cv_text || isLoadingAI) return;
    
    setIsLoadingAI(true);
    try {
      const recommendations = await getAIRecommendations(selectedCV.id);
      setAiRecommendations(recommendations);
      setHasRunAIAnalysis(true);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };
  
  // Auto-run för vissa användare (kan konfigureras)
  useEffect(() => {
    if (selectedCV && !hasRunAIAnalysis && !isLoadingAI) {
      // Auto-kör AI efter 2 sekunder om användaren inte interagerar
      const timer = setTimeout(() => {
        runAIAnalysis();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedCV, hasRunAIAnalysis, isLoadingAI]); // eslint-disable-line react-hooks/exhaustive-deps
  
  if (!selectedCV) {
    return (
      <Card className={`bg-navy-700 border-navy-600 ${className}`}>
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">Välj ett CV för att få AI-rekommendationer</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Smart Recommendations */}
      <Card className="bg-navy-700 border-navy-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center text-lg">
            <Target className="w-5 h-5 mr-2 text-blue-400" />
            Smarta Rekommendationer
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Baserat på ditt CV-innehåll och svenska marknadsinsikter
          </p>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {quickRecommendations.map((templateId, index) => {
            const template = getTemplateInfo(templateId);
            const isSelected = selectedTemplate === templateId;
            
            if (!template) return null;
            
            return (
              <div
                key={templateId}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-pink-500/20 border-pink-500 ring-1 ring-pink-500' 
                    : 'bg-navy-600 border-navy-500 hover:bg-navy-500 hover:border-navy-400'
                }`}
                onClick={() => onSelectTemplate(templateId)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isSelected ? 'bg-pink-500 text-white' : 'bg-navy-500 text-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{template.name}</div>
                    <div className="text-gray-400 text-sm">{template.description}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {index === 0 && (
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs">
                      Top Val
                    </Badge>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      {/* AI-Powered Deep Analysis */}
      <Card className="bg-gradient-to-br from-navy-700 to-navy-600 border border-purple-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center text-lg">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-2 mr-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            AI-Driven Analys
            <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
              Premium
            </Badge>
          </CardTitle>
          <p className="text-gray-300 text-sm">
            Djupanalys av ditt CV med svenska arbetsmarknadsinsikter
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!hasRunAIAnalysis && !isLoadingAI && (
            <Button
              onClick={runAIAnalysis}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
              size="lg"
            >
              <Brain className="w-4 h-4 mr-2" />
              Kör AI-Analys av ditt CV
            </Button>
          )}
          
          {isLoadingAI && (
            <div className="text-center py-6">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
              <p className="text-white font-medium">Analyserar ditt CV...</p>
              <p className="text-gray-400 text-sm">
                AI:n studerar branschkontext, erfarenhetsnivå och svenska marknadsinsikter
              </p>
            </div>
          )}
          
          {aiRecommendations.length > 0 && (
            <div className="space-y-3">
              {aiRecommendations.map((recommendation, index) => {
                const template = getTemplateInfo(recommendation.templateId);
                const isSelected = selectedTemplate === recommendation.templateId;
                
                if (!template) return null;
                
                return (
                  <div
                    key={recommendation.templateId}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-pink-500/20 border-pink-500 ring-1 ring-pink-500' 
                        : 'bg-navy-600/50 border-purple-500/30 hover:bg-navy-500/50 hover:border-purple-400'
                    }`}
                    onClick={() => onSelectTemplate(recommendation.templateId)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                            : 'bg-navy-500 text-gray-300'
                        }`}>
                          {recommendation.score}
                        </div>
                        <div>
                          <div className="text-white font-medium">{template.name}</div>
                          <div className="flex items-center space-x-2">
                            {index === 0 && (
                              <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Bäst Match
                              </Badge>
                            )}
                            <Badge variant="outline" className="border-purple-500/50 text-purple-300 text-xs">
                              {recommendation.swedishMarketFit}% Svenska Marknaden
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDetailedAnalysis(!showDetailedAnalysis);
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <Info className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3">
                      {recommendation.reasoning}
                    </p>
                    
                    {showDetailedAnalysis && (
                      <div className="border-t border-navy-500 pt-3 mt-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400">Branschpassning:</span>
                            <div className="text-blue-400 font-medium">{recommendation.suitabilityFactors.industryMatch}%</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Erfarenhetsnivå:</span>
                            <div className="text-green-400 font-medium">{recommendation.suitabilityFactors.experienceLevel}%</div>
                          </div>
                          <div>
                            <span className="text-gray-400">ATS-optimering:</span>
                            <div className="text-purple-400 font-medium">{recommendation.suitabilityFactors.atsOptimization}%</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Visuell Appeal:</span>
                            <div className="text-pink-400 font-medium">{recommendation.suitabilityFactors.visualPreference}%</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              <div className="text-center pt-2">
                <button
                  onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                >
                  {showDetailedAnalysis ? 'Dölj Detaljerad Analys' : 'Visa Detaljerad Analys'}
                </button>
              </div>
            </div>
          )}
          
          {hasRunAIAnalysis && aiRecommendations.length === 0 && (
            <div className="text-center py-4">
              <div className="text-gray-400 mb-2">AI-analys kunde inte generera rekommendationer</div>
              <Button
                onClick={runAIAnalysis}
                variant="outline"
                size="sm"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
              >
                Försök igen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Premium upsell för icke-premium användare */}
      {!hasRunAIAnalysis && (
        <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/30">
          <CardContent className="p-4 text-center">
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-amber-400 font-medium mb-1">Premium AI-Analys</p>
            <p className="text-gray-300 text-sm">
              Få personaliserade template-rekommendationer baserade på djupanalys av ditt CV och svenska marknadsinsikter.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}