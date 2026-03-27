'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  Edit3,
  CheckCircle2,
  Info,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  Percent,
  Hash,
  ChevronRight,
  AlertTriangle,
  Shield,
  ShieldCheck,
  Building2,
  Calendar,
  Briefcase,
  Tag,
  Sparkles,
  Target
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface QuantificationItem {
  id: string;
  category: string;
  originalText: string;
  aiSuggestion: string;
  userChoice: 'ai' | 'custom';
  customText?: string;
  // Context fields for better user understanding
  area?: string; // E.g., "Arbetslivserfarenhet", "Profilsammanfattning"
  roleContext?: string; // E.g., "Platschef - Fitnessworld Skärholmen"
  section?: string; // More specific section identification
  // New fields for enhanced AI-driven functionality
  confidence?: number; // Confidence level for text extraction (0-1)
  sourceImprovementId?: string; // Reference to the original improvement suggestion
  sourceSection?: string; // More detailed section information from AI extraction
  isValid?: boolean; // Whether the extraction is valid for quantification
  // Grouped improvement fields
  groupedImprovements?: {
    quantification?: string;
    keywords?: string[];
    other?: string[];
  };
  sourceImprovementIds?: string[]; // IDs of original improvements that were grouped
  combinedSuggestion?: string; // Clear explanation of what's being combined
}

interface QuantificationCustomizerProps {
  items: QuantificationItem[];
  onUpdate: (items: QuantificationItem[]) => void;
  onComplete: () => void;
}

const quantificationExamples = [
  { icon: Users, text: 'Antal personer i teamet' },
  { icon: Percent, text: 'Procentuell ökning/minskning' },
  { icon: DollarSign, text: 'Budget eller kostnadsbesparingar' },
  { icon: Clock, text: 'Tidsbesparingar' },
  { icon: Hash, text: 'Antal projekt/kunder' },
  { icon: TrendingUp, text: 'Tillväxt eller förbättring' },
];

// Helper function to get confidence display info
const getConfidenceInfo = (confidence?: number) => {
  if (!confidence) return { icon: AlertTriangle, color: 'text-gray-400', text: 'Okänd', bgColor: 'bg-gray-100' };

  if (confidence >= 0.8) {
    return { icon: ShieldCheck, color: 'text-green-600', text: 'Hög säkerhet', bgColor: 'bg-green-50' };
  } else if (confidence >= 0.6) {
    return { icon: Shield, color: 'text-blue-600', text: 'Medel säkerhet', bgColor: 'bg-blue-50' };
  } else if (confidence >= 0.4) {
    return { icon: AlertTriangle, color: 'text-yellow-600', text: 'Låg säkerhet', bgColor: 'bg-yellow-50' };
  } else {
    return { icon: AlertTriangle, color: 'text-red-600', text: 'Mycket låg säkerhet', bgColor: 'bg-red-50' };
  }
};

export default function QuantificationCustomizer({
  items: initialItems,
  onUpdate,
  onComplete
}: QuantificationCustomizerProps) {
  const [items, setItems] = useState<QuantificationItem[]>(initialItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = items[currentIndex];

  const handleChoiceChange = (choice: 'ai' | 'custom') => {
    const updatedItems = [...items];
    updatedItems[currentIndex] = {
      ...updatedItems[currentIndex],
      userChoice: choice
    };
    setItems(updatedItems);
    onUpdate(updatedItems);
  };

  const handleCustomTextChange = (text: string) => {
    const updatedItems = [...items];
    updatedItems[currentIndex] = {
      ...updatedItems[currentIndex],
      customText: text
    };
    setItems(updatedItems);
    onUpdate(updatedItems);
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const isCurrentItemValid = () => {
    if (currentItem.userChoice === 'ai') return true;
    return currentItem.customText && currentItem.customText.trim().length > 0;
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Anpassa kvantifieringar</h3>
        </div>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} av {items.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-pink-600 to-purple-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Current item */}
      <Card className="bg-white border-gray-200 shadow-sm p-6">
        <div className="space-y-4">
          {/* Enhanced display for grouped improvements */}
          {currentItem.groupedImprovements && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-pink-600" />
                <span className="text-sm font-semibold text-gray-900">
                  {currentItem.combinedSuggestion ?
                    currentItem.combinedSuggestion.split('\n')[0] :
                    'Kombinerad förbättring'
                  }
                </span>
              </div>

              {/* Show what types are being combined */}
              <div className="flex flex-wrap gap-2 mb-3">
                {currentItem.groupedImprovements.quantification && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                    📊 Kvantifiering
                  </span>
                )}
                {currentItem.groupedImprovements.keywords && currentItem.groupedImprovements.keywords.length > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                    🔑 Nyckelord ({currentItem.groupedImprovements.keywords.length})
                  </span>
                )}
                {currentItem.groupedImprovements.other && currentItem.groupedImprovements.other.length > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 font-medium">
                    ⚡ ATS-optimering ({currentItem.groupedImprovements.other.length})
                  </span>
                )}
              </div>

              {/* Show keywords if available */}
              {currentItem.groupedImprovements.keywords && currentItem.groupedImprovements.keywords.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">Nyckelord att inkludera:</p>
                  <div className="flex flex-wrap gap-1">
                    {currentItem.groupedImprovements.keywords.map((keyword, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-600 mt-2 italic">
                {currentItem.combinedSuggestion && currentItem.combinedSuggestion.includes('För:') ?
                  'Detta förslag kombinerar flera förbättringstyper för samma roll/text.' :
                  'Denna förbättring kombinerar flera typer av förändringar för samma textavsnitt i ditt CV.'
                }
              </p>
            </div>
          )}

          {/* Context information */}
          {(currentItem.area || currentItem.roleContext || currentItem.confidence !== undefined) && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-pink-600" />
                  <Label className="text-sm font-medium text-gray-900">
                    Kontext för denna förbättring:
                  </Label>
                </div>

                {/* Confidence indicator */}
                {currentItem.confidence !== undefined && (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const confidenceInfo = getConfidenceInfo(currentItem.confidence);
                      const ConfidenceIcon = confidenceInfo.icon;
                      return (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${confidenceInfo.bgColor}`}>
                                <ConfidenceIcon className={`h-3 w-3 ${confidenceInfo.color}`} />
                                <span className={confidenceInfo.color}>
                                  {confidenceInfo.text}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-center">
                                Matchningssäkerhet: {Math.round((currentItem.confidence || 0) * 100)}%
                                <br />
                                {currentItem.confidence && currentItem.confidence >= 0.8 && 'Texten matchades exakt från ditt CV'}
                                {currentItem.confidence && currentItem.confidence >= 0.6 && currentItem.confidence < 0.8 && 'Texten matchades kontextuellt från ditt CV'}
                                {currentItem.confidence && currentItem.confidence >= 0.4 && currentItem.confidence < 0.6 && 'Texten matchades semantiskt - kontrollera att den stämmer'}
                                {currentItem.confidence && currentItem.confidence < 0.4 && 'Osäker matchning - dubbelkolla originaltexten'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {/* Role context with enhanced styling */}
                {currentItem.roleContext && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-xs font-medium text-blue-800 uppercase tracking-wide">ROLL & ARBETSPLATS</span>
                        <p className="text-sm font-bold text-gray-900 mt-1">{currentItem.roleContext}</p>
                        {currentItem.roleContext.includes('(') && (
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-blue-700">
                              {currentItem.roleContext.match(/\(([^)]+)\)/)?.[1] || ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Area information */}
                {currentItem.area && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-purple-600" />
                    <div>
                      <span className="text-xs font-medium text-gray-600">Område:</span>
                      <span className="text-sm text-gray-700 ml-2">{currentItem.area}</span>
                    </div>
                  </div>
                )}

                {/* Source section if different from area */}
                {currentItem.sourceSection && currentItem.sourceSection !== currentItem.area && (
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-orange-600" />
                    <div>
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">KÄLLA</span>
                      <p className="text-sm text-gray-700">{currentItem.sourceSection}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Original text */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium text-gray-600">
                Originaltext från ditt CV:
              </Label>
              {!currentItem.roleContext && currentItem.area && (
                <span className="text-xs text-gray-500 italic">
                  ⚠️ Roll/företag kunde inte identifieras
                </span>
              )}
            </div>
            <p className="text-gray-900">{currentItem.originalText}</p>
          </div>

          {/* Choice selection */}
          <RadioGroup
            value={currentItem.userChoice}
            onValueChange={(value) => handleChoiceChange(value as 'ai' | 'custom')}
          >
            <div className="space-y-4">
              {/* AI suggestion option */}
              <div className="relative">
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="ai" id="ai" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="ai" className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">Använd vårt exempel</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Detta är ett förslag baserat på din profil.
                                Justera siffrorna efter din faktiska erfarenhet.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-900">{currentItem.aiSuggestion}</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </div>

              {/* Custom input option */}
              <div className="relative">
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="custom" id="custom" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="custom" className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">Skriv eget exempel</span>
                        <Edit3 className="h-4 w-4 text-gray-400" />
                      </div>
                    </Label>

                    {currentItem.userChoice === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2"
                      >
                        <Textarea
                          value={currentItem.customText || ''}
                          onChange={(e) => handleCustomTextChange(e.target.value)}
                          placeholder="T.ex: Ledde ett team på 12 personer och ökade försäljningen med 25% under 2023"
                          className="min-h-[80px]"
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>

          {/* Help section */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-pink-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Tips för effektiva förbättringar:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quantificationExamples.map((example, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                      <example.icon className="h-3 w-3 text-gray-400" />
                      <span>{example.text}</span>
                    </div>
                  ))}
                </div>

                {/* Extra tip for grouped improvements */}
                {currentItem.groupedImprovements && currentItem.groupedImprovements.keywords && (
                  <div className="bg-purple-50 rounded p-2 mt-2 border border-purple-200">
                    <p className="text-xs text-purple-900 font-medium mb-1">
                      💡 Inkludera både siffror OCH nyckelord:
                    </p>
                    <p className="text-xs text-purple-800">
                      "Ledde team på 12 personer med <span className="font-semibold">budgetansvar</span> på 2 MSEK,
                      implementerade <span className="font-semibold">projektledning</span> som ökade effektiviteten med 25%"
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-600 mt-2">
                  Mall: <span className="font-mono bg-gray-50 px-1 rounded border border-gray-200">
                    [Handling] med [Nyckelord] som resulterade i [Mätbart resultat]
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          Föregående
        </Button>

        <div className="flex items-center gap-2">
          {items.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-8 bg-gradient-to-r from-pink-600 to-purple-600'
                  : idx < currentIndex
                  ? 'bg-purple-600'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={!isCurrentItemValid()}
          className="bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700"
        >
          {currentIndex === items.length - 1 ? (
            <>
              Slutför
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Nästa
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}