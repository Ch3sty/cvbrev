'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import type { CVTemplateType } from '@/lib/cv/cv-metadata';
import { getAllCVTemplates } from '@/lib/cv/cv-templates';
import TemplatePreviewLive from './template-preview-live';

interface TemplateComparisonProps {
  selectedTemplates: CVTemplateType[];
  availableTemplates: CVTemplateType[];
  cvData?: any;
  customization?: any;
  onTemplateSelect: (templateId: CVTemplateType) => void;
  onRemoveTemplate: (templateId: CVTemplateType) => void;
  onAddTemplate: (templateId: CVTemplateType) => void;
  onClose: () => void;
  className?: string;
}

interface ComparisonFeature {
  name: string;
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const comparisonFeatures: ComparisonFeature[] = [
  {
    name: 'ATS-kompatibilitet',
    key: 'atsCompatible',
    icon: CheckCircle,
    description: 'Hur väl mallen fungerar med automatiska rekryteringssystem'
  },
  {
    name: 'Visuell impact',
    key: 'visualImpact',
    icon: AlertTriangle,
    description: 'Mallens visuella styrka och professionella intryck'
  },
  {
    name: 'Branschfokus',
    key: 'industryFocus',
    icon: Info,
    description: 'Vilka branscher mallen är optimerad för'
  },
  {
    name: 'Läsbarhet',
    key: 'readability',
    icon: CheckCircle,
    description: 'Hur lätt det är att läsa och förstå innehållet'
  }
];

export default function TemplateComparison({
  selectedTemplates,
  availableTemplates,
  cvData,
  customization,
  onTemplateSelect,
  onRemoveTemplate,
  onAddTemplate,
  onClose,
  className = ""
}: TemplateComparisonProps) {
  const [currentView, setCurrentView] = useState<'grid' | 'sidebyside'>('grid');
  const [comparisonIndex, setComparisonIndex] = useState(0);

  // Få template metadata
  const allTemplates = useMemo(() => getAllCVTemplates(), []);
  
  const getTemplateInfo = useCallback((templateId: CVTemplateType) => {
    return allTemplates.find(t => t.id === templateId);
  }, [allTemplates]);

  // Template som kan läggas till
  const addableTemplates = useMemo(() => {
    return availableTemplates.filter(t => !selectedTemplates.includes(t));
  }, [availableTemplates, selectedTemplates]);

  // Jämförelsedata för mallar
  const getComparisonData = useCallback((templateId: CVTemplateType) => {
    const template = getTemplateInfo(templateId);
    if (!template) return null;

    // Simulera jämförelsedata baserat på template type
    const scores = {
      'ats-optimerad': { atsCompatible: 95, visualImpact: 70, industryFocus: 85, readability: 90 },
      'klassisk': { atsCompatible: 90, visualImpact: 85, industryFocus: 95, readability: 95 },
      'modern': { atsCompatible: 85, visualImpact: 90, industryFocus: 80, readability: 85 },
      'kreativ': { atsCompatible: 75, visualImpact: 95, industryFocus: 70, readability: 80 },
      'akademisk': { atsCompatible: 88, visualImpact: 75, industryFocus: 90, readability: 92 },
      'modern-tech': { atsCompatible: 88, visualImpact: 85, industryFocus: 85, readability: 88 }
    };

    return {
      ...template,
      scores: scores[templateId] || { atsCompatible: 80, visualImpact: 80, industryFocus: 80, readability: 80 },
      strengths: template.features?.slice(0, 3) || [],
      bestFor: template.bestFor?.slice(0, 2) || []
    };
  }, [getTemplateInfo]);

  // Navigering för side-by-side view
  const navigateComparison = useCallback((direction: 'prev' | 'next') => {
    const maxIndex = Math.max(0, selectedTemplates.length - 2);
    if (direction === 'prev') {
      setComparisonIndex(Math.max(0, comparisonIndex - 1));
    } else {
      setComparisonIndex(Math.min(maxIndex, comparisonIndex + 1));
    }
  }, [comparisonIndex, selectedTemplates.length]);

  // Render score badge
  const renderScore = useCallback((score: number) => {
    const color = score >= 90 ? 'bg-green-600' : score >= 80 ? 'bg-blue-600' : score >= 70 ? 'bg-yellow-600' : 'bg-red-600';
    return (
      <Badge className={`${color} text-white text-xs`}>
        {score}%
      </Badge>
    );
  }, []);

  if (selectedTemplates.length === 0) {
    return (
      <div className={`template-comparison-empty ${className}`}>
        <Card className="bg-navy-800 border-navy-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Jämför CV-mallar</CardTitle>
            <CardDescription>
              Välj upp till 3 mallar för att jämföra deras egenskaper och se vilket som passar bäst för ditt CV.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addableTemplates.slice(0, 6).map(templateId => {
                const template = getTemplateInfo(templateId);
                return template ? (
                  <Button
                    key={templateId}
                    onClick={() => onAddTemplate(templateId)}
                    variant="outline"
                    className="h-auto p-4 text-left border-navy-600 hover:bg-navy-700"
                  >
                    <div>
                      <div className="font-medium text-white">{template.name}</div>
                      <div className="text-sm text-gray-400 mt-1">{template.category}</div>
                    </div>
                  </Button>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`template-comparison ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Mallkjämförelse</h2>
          <p className="text-gray-300">Jämför {selectedTemplates.length} mallar side-by-side</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* View toggle */}
          <div className="flex bg-navy-800 rounded-lg p-1">
            <Button
              variant={currentView === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('grid')}
              className="px-3"
            >
              Grid
            </Button>
            <Button
              variant={currentView === 'sidebyside' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('sidebyside')}
              className="px-3"
              disabled={selectedTemplates.length < 2}
            >
              Sida vid sida
            </Button>
          </div>
          
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Add template section */}
      {addableTemplates.length > 0 && selectedTemplates.length < 3 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Lägg till mall för jämförelse</h3>
          <div className="flex flex-wrap gap-2">
            {addableTemplates.slice(0, 6).map(templateId => {
              const template = getTemplateInfo(templateId);
              return template ? (
                <Button
                  key={templateId}
                  onClick={() => onAddTemplate(templateId)}
                  variant="outline"
                  size="sm"
                  className="border-navy-600 hover:bg-navy-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {template.name}
                </Button>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Comparison content */}
      <AnimatePresence mode="wait">
        {currentView === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {selectedTemplates.map(templateId => {
              const comparisonData = getComparisonData(templateId);
              if (!comparisonData) return null;

              return (
                <Card key={templateId} className="bg-navy-800 border-navy-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{comparisonData.name}</CardTitle>
                      <Button
                        onClick={() => onRemoveTemplate(templateId)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardDescription>{comparisonData.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Preview */}
                    <div className="aspect-[3/4] bg-navy-900 rounded overflow-hidden">
                      <TemplatePreviewLive
                        templateId={templateId}
                        cvData={cvData}
                        customization={customization}
                        autoUpdate={false}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Scores */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-white">Betyg</h4>
                      {comparisonFeatures.map(feature => {
                        const score = (comparisonData.scores as any)[feature.key];
                        return (
                          <div key={feature.key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{feature.name}</span>
                            {renderScore(score)}
                          </div>
                        );
                      })}
                    </div>

                    {/* Best for */}
                    <div>
                      <h4 className="font-medium text-white mb-2">Bäst för</h4>
                      <div className="flex flex-wrap gap-1">
                        {comparisonData.bestFor.map(industry => (
                          <Badge key={industry} variant="outline" className="text-xs border-navy-600 text-gray-300">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action button */}
                    <Button
                      onClick={() => onTemplateSelect(templateId)}
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                    >
                      Välj denna mall
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="sidebyside"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Side-by-side navigation */}
            {selectedTemplates.length > 2 && (
              <div className="flex items-center justify-center mb-6 space-x-4">
                <Button
                  onClick={() => navigateComparison('prev')}
                  disabled={comparisonIndex === 0}
                  variant="outline"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-gray-300">
                  {comparisonIndex + 1}-{Math.min(comparisonIndex + 2, selectedTemplates.length)} av {selectedTemplates.length}
                </span>
                <Button
                  onClick={() => navigateComparison('next')}
                  disabled={comparisonIndex >= selectedTemplates.length - 2}
                  variant="outline"
                  size="sm"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Side-by-side comparison */}
            <div className="grid md:grid-cols-2 gap-8">
              {selectedTemplates.slice(comparisonIndex, comparisonIndex + 2).map(templateId => {
                const comparisonData = getComparisonData(templateId);
                if (!comparisonData) return null;

                return (
                  <Card key={templateId} className="bg-navy-800 border-navy-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{comparisonData.name}</CardTitle>
                        <Button
                          onClick={() => onTemplateSelect(templateId)}
                          size="sm"
                          className="bg-gradient-to-r from-pink-600 to-purple-600"
                        >
                          Välj
                        </Button>
                      </div>
                      <CardDescription>{comparisonData.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Large preview */}
                      <div className="aspect-[3/4] bg-navy-900 rounded overflow-hidden">
                        <TemplatePreviewLive
                          templateId={templateId}
                          cvData={cvData}
                          customization={customization}
                          autoUpdate={false}
                          className="w-full h-full"
                        />
                      </div>

                      {/* Detailed comparison */}
                      <div className="space-y-4">
                        {comparisonFeatures.map(feature => {
                          const Icon = feature.icon;
                          const score = (comparisonData.scores as any)[feature.key];
                          return (
                            <div key={feature.key} className="flex items-start space-x-3">
                              <Icon className="w-5 h-5 text-blue-400 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-white">{feature.name}</span>
                                  {renderScore(score)}
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}