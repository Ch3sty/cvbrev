'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, Trash2, ChevronDown, ChevronUp, Calendar, Building2, MapPin, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { CVDraft } from '../CVCreatorWizard';
import type { CVExperience } from '@/lib/cv/cv-metadata';

interface Step3ExperienceProps {
  cvData: CVDraft;
  updateCVData: (updates: Partial<CVDraft>) => void;
}

// Empty experience template
const createEmptyExperience = (): Partial<CVExperience> => ({
  position: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  description: [],
});

// Date format helper
const formatMonthYear = (value: string): string => {
  // Remove non-alphanumeric except space
  const cleaned = value.replace(/[^a-zA-ZåäöÅÄÖ0-9\s]/g, '');
  return cleaned;
};

export default function Step3Experience({
  cvData,
  updateCVData,
}: Step3ExperienceProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    cvData.experience.length === 0 ? null : 0
  );
  const [currentlyWorkingHere, setCurrentlyWorkingHere] = useState<Set<number>>(new Set());

  // Add new experience
  const addExperience = () => {
    const newExperience = [...cvData.experience, createEmptyExperience()];
    updateCVData({ experience: newExperience });
    setExpandedIndex(newExperience.length - 1);
  };

  // Remove experience
  const removeExperience = (index: number) => {
    const newExperience = cvData.experience.filter((_, i) => i !== index);
    updateCVData({ experience: newExperience });
    if (expandedIndex === index) {
      setExpandedIndex(newExperience.length > 0 ? 0 : null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  // Update specific experience
  const updateExperience = (index: number, field: string, value: string | string[]) => {
    const newExperience = [...cvData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    updateCVData({ experience: newExperience });
  };

  // Handle description change - convert newlines to array
  const handleDescriptionChange = (index: number, value: string) => {
    const lines = value.split('\n').filter(line => line.trim());
    updateExperience(index, 'description', lines);
  };

  // Get description as string for textarea
  const getDescriptionText = (exp: Partial<CVExperience>): string => {
    if (!exp.description) return '';
    if (Array.isArray(exp.description)) {
      return exp.description.join('\n');
    }
    return exp.description;
  };

  // Toggle currently working
  const toggleCurrentlyWorking = (index: number) => {
    const newSet = new Set(currentlyWorkingHere);
    if (newSet.has(index)) {
      newSet.delete(index);
      updateExperience(index, 'endDate', '');
    } else {
      newSet.add(index);
      updateExperience(index, 'endDate', 'Nuvarande');
    }
    setCurrentlyWorkingHere(newSet);
  };

  // Check if experience is complete enough
  const isExperienceComplete = (exp: Partial<CVExperience>): boolean => {
    return !!(exp.position?.trim() && exp.company?.trim() && exp.startDate?.trim());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Arbetslivserfarenhet
        </h1>
        <p className="text-gray-600">
          Lägg till dina tidigare och nuvarande arbeten. Börja med det senaste.
        </p>
      </div>

      {/* Experience List */}
      <div className="space-y-4 max-w-2xl mx-auto">
        <AnimatePresence>
          {cvData.experience.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border border-gray-200 rounded-xl overflow-hidden bg-white"
            >
              {/* Header - Always visible */}
              <button
                type="button"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isExperienceComplete(exp) ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Briefcase className={`w-5 h-5 ${
                      isExperienceComplete(exp) ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      {exp.position || 'Ny arbetslivserfarenhet'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {exp.company || 'Fyll i detaljer'}
                      {exp.startDate && ` • ${exp.startDate}`}
                      {exp.endDate && ` - ${exp.endDate}`}
                    </p>
                  </div>
                </div>
                {expandedIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-4 space-y-4">
                      {/* Position */}
                      <div className="space-y-2">
                        <Label htmlFor={`position-${index}`} className="flex items-center gap-2">
                          Jobbtitel <span className="text-pink-600">*</span>
                        </Label>
                        <Input
                          id={`position-${index}`}
                          value={exp.position || ''}
                          onChange={(e) => updateExperience(index, 'position', e.target.value)}
                          placeholder="t.ex. Kassörska, Projektledare, Säljare"
                          className="h-12"
                        />
                      </div>

                      {/* Company */}
                      <div className="space-y-2">
                        <Label htmlFor={`company-${index}`} className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          Företag <span className="text-pink-600">*</span>
                        </Label>
                        <Input
                          id={`company-${index}`}
                          value={exp.company || ''}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          placeholder="t.ex. ICA Maxi, Volvo, Ericsson"
                          className="h-12"
                        />
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <Label htmlFor={`location-${index}`} className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          Plats
                        </Label>
                        <Input
                          id={`location-${index}`}
                          value={exp.location || ''}
                          onChange={(e) => updateExperience(index, 'location', e.target.value)}
                          placeholder="t.ex. Stockholm"
                          className="h-12"
                        />
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`startDate-${index}`} className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            Startdatum <span className="text-pink-600">*</span>
                          </Label>
                          <Input
                            id={`startDate-${index}`}
                            value={exp.startDate || ''}
                            onChange={(e) => updateExperience(index, 'startDate', formatMonthYear(e.target.value))}
                            placeholder="Jan 2021"
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`endDate-${index}`}>
                            Slutdatum
                          </Label>
                          <Input
                            id={`endDate-${index}`}
                            value={currentlyWorkingHere.has(index) ? '' : (exp.endDate || '')}
                            onChange={(e) => updateExperience(index, 'endDate', formatMonthYear(e.target.value))}
                            placeholder="Dec 2023"
                            disabled={currentlyWorkingHere.has(index)}
                            className="h-12"
                          />
                        </div>
                      </div>

                      {/* Currently working checkbox */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`current-${index}`}
                          checked={currentlyWorkingHere.has(index) || exp.endDate === 'Nuvarande'}
                          onCheckedChange={() => toggleCurrentlyWorking(index)}
                        />
                        <Label htmlFor={`current-${index}`} className="text-sm cursor-pointer">
                          Jag jobbar här fortfarande
                        </Label>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor={`description-${index}`}>
                          Arbetsuppgifter <span className="text-pink-600">*</span>
                        </Label>
                        <Textarea
                          id={`description-${index}`}
                          value={getDescriptionText(exp)}
                          onChange={(e) => handleDescriptionChange(index, e.target.value)}
                          placeholder="Beskriv dina huvudsakliga arbetsuppgifter. Varje rad blir en punkt i CV:t.

• Ansvarade för kundservice och kassaköer
• Hanterade lagerpåfyllning och varuexponering
• Utbildade nyanställda i kassasystemet"
                          className="min-h-[150px] resize-none"
                        />
                        <p className="text-xs text-gray-500">
                          Tips: Använd aktiva verb (ansvarade, utvecklade, ledde) och kvantifiera när möjligt
                        </p>
                      </div>

                      {/* Delete button */}
                      <div className="pt-2 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Ta bort
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Experience Button */}
        <Button
          type="button"
          variant="outline"
          onClick={addExperience}
          className="w-full h-12 border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          {cvData.experience.length === 0 ? 'Lägg till arbetslivserfarenhet' : 'Lägg till fler arbeten'}
        </Button>

        {/* Warning if many experiences */}
        {cvData.experience.length >= 5 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Tips: De flesta CV:n fokuserar på de senaste 5 rollerna. Överväg att ta bort äldre eller mindre relevanta jobb.
            </p>
          </div>
        )}
      </div>

      {/* No experience hint */}
      {cvData.experience.length === 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-500 mb-2">Har du ingen arbetslivserfarenhet ännu?</p>
          <p className="text-sm text-gray-400">
            Det är okej! Du kan hoppa över detta steg och fokusera på utbildning och kompetenser istället.
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100 max-w-2xl mx-auto">
        <h3 className="font-medium text-gray-900 mb-2">Tips för arbetslivserfarenhet</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Börja med senaste jobbet</strong> och jobba bakåt i tid</li>
          <li>• <strong>Fokusera på resultat:</strong> "Ökade försäljningen med 20%" är bättre än "Arbetade med försäljning"</li>
          <li>• <strong>Anpassa efter jobbet du söker:</strong> Lyft fram relevanta erfarenheter</li>
          <li>• <strong>Inkludera allt:</strong> Även sommarjobb, praktik och ideellt arbete räknas!</li>
        </ul>
      </div>
    </div>
  );
}
