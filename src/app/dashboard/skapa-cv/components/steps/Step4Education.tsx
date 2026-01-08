'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Plus, Trash2, ChevronDown, ChevronUp, Building2, MapPin, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { CVDraft } from '../CVCreatorWizard';
import type { CVEducation } from '@/lib/cv/cv-metadata';

interface Step4EducationProps {
  cvData: CVDraft;
  updateCVData: (updates: Partial<CVDraft>) => void;
}

// Empty education template
const createEmptyEducation = (): Partial<CVEducation> => ({
  degree: '',
  institution: '',
  location: '',
  graduationYear: '',
  description: '',
});

// Common education suggestions
const EDUCATION_SUGGESTIONS = [
  'Gymnasieexamen',
  'Kandidatexamen',
  'Masterexamen',
  'Yrkeshögskoleexamen',
  'Högskoleutbildning',
  'Certifiering',
];

export default function Step4Education({
  cvData,
  updateCVData,
}: Step4EducationProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    cvData.education.length === 0 ? null : 0
  );
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);

  // Add new education
  const addEducation = () => {
    const newEducation = [...cvData.education, createEmptyEducation()];
    updateCVData({ education: newEducation });
    setExpandedIndex(newEducation.length - 1);
  };

  // Remove education
  const removeEducation = (index: number) => {
    const newEducation = cvData.education.filter((_, i) => i !== index);
    updateCVData({ education: newEducation });
    if (expandedIndex === index) {
      setExpandedIndex(newEducation.length > 0 ? 0 : null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  // Update specific education
  const updateEducation = (index: number, field: string, value: string) => {
    const newEducation = [...cvData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    updateCVData({ education: newEducation });
  };

  // Check if education is complete enough
  const isEducationComplete = (edu: Partial<CVEducation>): boolean => {
    return !!(edu.degree?.trim() && edu.institution?.trim());
  };

  // Apply suggestion
  const applySuggestion = (index: number, suggestion: string) => {
    updateEducation(index, 'degree', suggestion);
    setShowSuggestions(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Utbildning
        </h1>
        <p className="text-gray-600">
          Lägg till din utbildningsbakgrund. Börja med den högsta/senaste utbildningen.
        </p>
      </div>

      {/* Education List */}
      <div className="space-y-4 max-w-2xl mx-auto">
        <AnimatePresence>
          {cvData.education.map((edu, index) => (
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
                    isEducationComplete(edu) ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <GraduationCap className={`w-5 h-5 ${
                      isEducationComplete(edu) ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      {edu.degree || 'Ny utbildning'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {edu.institution || 'Fyll i detaljer'}
                      {edu.graduationYear && ` • ${edu.graduationYear}`}
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
                      {/* Degree/Program */}
                      <div className="space-y-2">
                        <Label htmlFor={`degree-${index}`} className="flex items-center gap-2">
                          Examen/Program <span className="text-pink-600">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id={`degree-${index}`}
                            value={edu.degree || ''}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            onFocus={() => setShowSuggestions(index)}
                            onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
                            placeholder="t.ex. Gymnasieexamen, Kandidatexamen i ekonomi"
                            className="h-12"
                          />
                          {/* Suggestions dropdown */}
                          {showSuggestions === index && !edu.degree && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                              <p className="px-3 py-2 text-xs text-gray-500 border-b">Vanliga utbildningar</p>
                              {EDUCATION_SUGGESTIONS.map((suggestion) => (
                                <button
                                  key={suggestion}
                                  type="button"
                                  onClick={() => applySuggestion(index, suggestion)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Institution */}
                      <div className="space-y-2">
                        <Label htmlFor={`institution-${index}`} className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          Skola/Universitet <span className="text-pink-600">*</span>
                        </Label>
                        <Input
                          id={`institution-${index}`}
                          value={edu.institution || ''}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          placeholder="t.ex. Stockholms Universitet, Kungliga Tekniska Högskolan"
                          className="h-12"
                        />
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <Label htmlFor={`edu-location-${index}`} className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          Plats
                        </Label>
                        <Input
                          id={`edu-location-${index}`}
                          value={edu.location || ''}
                          onChange={(e) => updateEducation(index, 'location', e.target.value)}
                          placeholder="t.ex. Stockholm"
                          className="h-12"
                        />
                      </div>

                      {/* Year */}
                      <div className="space-y-2">
                        <Label htmlFor={`year-${index}`} className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          Examensår <span className="text-pink-600">*</span>
                        </Label>
                        <Input
                          id={`year-${index}`}
                          value={edu.graduationYear || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            updateEducation(index, 'graduationYear', value);
                          }}
                          placeholder="t.ex. 2023"
                          className="h-12 w-32"
                          maxLength={4}
                        />
                      </div>

                      {/* Description (optional) */}
                      <div className="space-y-2">
                        <Label htmlFor={`edu-description-${index}`}>
                          Beskrivning (valfritt)
                        </Label>
                        <Textarea
                          id={`edu-description-${index}`}
                          value={edu.description || ''}
                          onChange={(e) => updateEducation(index, 'description', e.target.value)}
                          placeholder="Inriktning, utmärkelser, relevanta kurser..."
                          className="min-h-[80px] resize-none"
                        />
                      </div>

                      {/* Delete button */}
                      <div className="pt-2 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(index)}
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

        {/* Add Education Button */}
        <Button
          type="button"
          variant="outline"
          onClick={addEducation}
          className="w-full h-12 border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          {cvData.education.length === 0 ? 'Lägg till utbildning' : 'Lägg till fler utbildningar'}
        </Button>
      </div>

      {/* No education hint */}
      {cvData.education.length === 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-500 mb-2">Har du ingen formell utbildning?</p>
          <p className="text-sm text-gray-400">
            Du kan hoppa över detta steg. Fokusera istället på arbetslivserfarenhet och kompetenser.
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100 max-w-2xl mx-auto">
        <h3 className="font-medium text-gray-900 mb-2">Tips för utbildning</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Börja med högsta utbildning</strong> - den är ofta mest relevant</li>
          <li>• <strong>Inkludera relevanta kurser</strong> om de stärker din profil</li>
          <li>• <strong>Nämn utmärkelser och stipendier</strong> om du har några</li>
          <li>• <strong>Pågående utbildning?</strong> Skriv "Förväntat examen 2026"</li>
        </ul>
      </div>
    </div>
  );
}
