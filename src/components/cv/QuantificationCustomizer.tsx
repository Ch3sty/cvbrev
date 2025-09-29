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
  ChevronRight
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
          {/* Context information */}
          {(currentItem.area || currentItem.roleContext) && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-pink-600" />
                <Label className="text-sm font-medium text-gray-900">
                  Kontext för denna kvantifiering:
                </Label>
              </div>
              {currentItem.area && (
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Område:</span> {currentItem.area}
                </p>
              )}
              {currentItem.roleContext && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Roll/Position:</span> {currentItem.roleContext}
                </p>
              )}
            </div>
          )}

          {/* Original text */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <Label className="text-sm font-medium text-gray-600 mb-2 block">
              Originaltext från ditt CV:
            </Label>
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
                        <span className="font-medium">Använd vårt exempel</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Detta är ett AI-genererat förslag baserat på din roll och bransch.
                                Justera siffrorna om de inte stämmer exakt.
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
                  Tips för bra kvantifieringar:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quantificationExamples.map((example, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                      <example.icon className="h-3 w-3 text-gray-400" />
                      <span>{example.text}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Mall: <span className="font-mono bg-gray-50 px-1 rounded border border-gray-200">
                    [Handling] som resulterade i [Mätbart resultat]
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