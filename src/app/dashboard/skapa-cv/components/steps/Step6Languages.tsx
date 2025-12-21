'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Plus, Trash2, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { CVDraft } from '../CVCreatorWizard';
import type { CVLanguage, CVCertification } from '@/lib/cv/cv-metadata';

interface Step6LanguagesProps {
  cvData: CVDraft;
  updateCVData: (updates: Partial<CVDraft>) => void;
}

// Language proficiency levels
const PROFICIENCY_LEVELS: CVLanguage['proficiency'][] = [
  'Nybörjare',
  'Konversation',
  'Flytande',
  'Modersmål',
  'Tvåspråkig',
];

// Proficiency visual indicators
const PROFICIENCY_DOTS: Record<CVLanguage['proficiency'], number> = {
  'Nybörjare': 1,
  'Konversation': 2,
  'Flytande': 3,
  'Modersmål': 4,
  'Tvåspråkig': 5,
};

// Common languages
const COMMON_LANGUAGES = [
  'Svenska',
  'Engelska',
  'Tyska',
  'Franska',
  'Spanska',
  'Arabiska',
  'Persiska',
  'Turkiska',
  'Polska',
  'Finska',
  'Norska',
  'Danska',
  'Kinesiska',
  'Japanska',
];

export default function Step6Languages({
  cvData,
  updateCVData,
}: Step6LanguagesProps) {
  const [showCertifications, setShowCertifications] = useState(cvData.certifications.length > 0);

  // Add new language
  const addLanguage = () => {
    const newLanguages = [
      ...cvData.languages,
      { language: '', proficiency: 'Konversation' as CVLanguage['proficiency'] },
    ];
    updateCVData({ languages: newLanguages });
  };

  // Remove language
  const removeLanguage = (index: number) => {
    const newLanguages = cvData.languages.filter((_, i) => i !== index);
    updateCVData({ languages: newLanguages });
  };

  // Update language
  const updateLanguage = (index: number, field: keyof CVLanguage, value: string) => {
    const newLanguages = [...cvData.languages];
    newLanguages[index] = { ...newLanguages[index], [field]: value };
    updateCVData({ languages: newLanguages });
  };

  // Add new certification
  const addCertification = () => {
    const newCertifications = [
      ...cvData.certifications,
      { name: '', issuer: '', issueDate: '' },
    ];
    updateCVData({ certifications: newCertifications });
  };

  // Remove certification
  const removeCertification = (index: number) => {
    const newCertifications = cvData.certifications.filter((_, i) => i !== index);
    updateCVData({ certifications: newCertifications });
  };

  // Update certification
  const updateCertification = (index: number, field: keyof CVCertification, value: string) => {
    const newCertifications = [...cvData.certifications];
    newCertifications[index] = { ...newCertifications[index], [field]: value };
    updateCVData({ certifications: newCertifications });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Språk & Certifieringar
        </h1>
        <p className="text-gray-600">
          Lägg till dina språkkunskaper och eventuella certifieringar.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Languages Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Språk</h2>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {cvData.languages.map((lang, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl"
                >
                  {/* Language Select */}
                  <div className="flex-1">
                    <select
                      value={lang.language}
                      onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                      className="w-full h-12 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="">Välj språk</option>
                      {COMMON_LANGUAGES.map((language) => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Proficiency */}
                  <div className="flex-1">
                    <select
                      value={lang.proficiency}
                      onChange={(e) => updateLanguage(index, 'proficiency', e.target.value as CVLanguage['proficiency'])}
                      className="w-full h-12 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      {PROFICIENCY_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {'●'.repeat(PROFICIENCY_DOTS[level])}{'○'.repeat(5 - PROFICIENCY_DOTS[level])} {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Delete button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(index)}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              type="button"
              variant="outline"
              onClick={addLanguage}
              className="w-full h-12 border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Lägg till språk
            </Button>
          </div>

          {/* Proficiency Legend */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 mb-2">Nivåer:</p>
            <div className="flex flex-wrap gap-3 text-xs text-gray-600">
              {PROFICIENCY_LEVELS.map((level) => (
                <div key={level} className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div
                        key={dot}
                        className={`w-1.5 h-1.5 rounded-full ${
                          dot <= PROFICIENCY_DOTS[level]
                            ? 'bg-pink-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span>{level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certifications Section */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowCertifications(!showCertifications)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Certifieringar</h2>
              <span className="text-sm text-gray-500">(valfritt)</span>
            </div>
            {showCertifications ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {showCertifications && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {cvData.certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white border border-gray-200 rounded-xl space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <Label className="text-sm font-medium">Certifiering {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCertification(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 -mt-1 -mr-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor={`cert-name-${index}`} className="text-xs text-gray-500">
                          Namn
                        </Label>
                        <Input
                          id={`cert-name-${index}`}
                          value={cert.name}
                          onChange={(e) => updateCertification(index, 'name', e.target.value)}
                          placeholder="t.ex. PMP, AWS Certified"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`cert-issuer-${index}`} className="text-xs text-gray-500">
                          Utfärdare
                        </Label>
                        <Input
                          id={`cert-issuer-${index}`}
                          value={cert.issuer}
                          onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                          placeholder="t.ex. PMI, Amazon"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`cert-date-${index}`} className="text-xs text-gray-500">
                          Årtal
                        </Label>
                        <Input
                          id={`cert-date-${index}`}
                          value={cert.issueDate || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            updateCertification(index, 'issueDate', value);
                          }}
                          placeholder="t.ex. 2023"
                          className="h-10 w-32"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addCertification}
                  className="w-full h-12 border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Lägg till certifiering
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100 max-w-2xl mx-auto">
        <h3 className="font-medium text-gray-900 mb-2">Tips</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Var ärlig med språknivåer</strong> - arbetsgivare testar ibland</li>
          <li>• <strong>Inkludera relevanta certifieringar</strong> som styrker din kompetens</li>
          <li>• <strong>Körkort?</strong> Lägg till det som en certifiering om det är relevant för jobbet</li>
        </ul>
      </div>

      {/* Skip hint */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Språk är viktigt för de flesta jobb. Certifieringar kan du lägga till senare.
      </p>
    </div>
  );
}
