'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Download, Save, Check, ChevronRight, User, FileText,
  Briefcase, GraduationCap, Wrench, Languages, Pencil, X,
  Loader2, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CVDraft } from '../CVCreatorWizard';
import type { CVMetadata, CVTemplateType } from '@/lib/cv/cv-metadata';

interface Step7ReviewProps {
  cvData: CVDraft;
  updateCVData: (updates: Partial<CVDraft>) => void;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  onComplete: (action: 'save' | 'download' | 'both') => Promise<void>;
  isSaving: boolean;
  buildCVMetadata: () => CVMetadata;
}

// Available templates
const TEMPLATES: { id: CVTemplateType; name: string; description: string }[] = [
  { id: 'modern-minimal', name: 'Modern Minimal', description: 'Ren och modern design' },
  { id: 'classic-professional', name: 'Klassisk', description: 'Traditionell och professionell' },
  { id: 'nordic-professional', name: 'Nordic', description: 'Skandinavisk elegans' },
  { id: 'clean-corporate', name: 'Företag', description: 'Affärsmässig stil' },
];

// Section icons
const SECTION_ICONS = {
  personalInfo: User,
  summary: FileText,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  languages: Languages,
};

export default function Step7Review({
  cvData,
  updateCVData,
  selectedTemplate,
  setSelectedTemplate,
  onComplete,
  isSaving,
  buildCVMetadata,
}: Step7ReviewProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [cvName, setCvName] = useState(`CV - ${cvData.personalInfo.fullName || 'Nytt CV'}`);

  // Build summary of each section
  const sections = useMemo(() => {
    return [
      {
        id: 'personalInfo',
        title: 'Kontaktuppgifter',
        count: null,
        summary: cvData.personalInfo.fullName || 'Ej ifyllt',
        isComplete: !!(cvData.personalInfo.fullName && cvData.personalInfo.email && cvData.personalInfo.phone),
      },
      {
        id: 'summary',
        title: 'Om dig',
        count: null,
        summary: cvData.summary ? `${cvData.summary.slice(0, 50)}...` : 'Ej ifyllt',
        isComplete: !!cvData.summary,
      },
      {
        id: 'experience',
        title: 'Erfarenhet',
        count: cvData.experience.filter(e => e.position && e.company).length,
        summary: cvData.experience.length > 0
          ? cvData.experience.filter(e => e.position).map(e => e.position).join(', ')
          : 'Ingen erfarenhet',
        isComplete: cvData.experience.some(e => e.position && e.company),
      },
      {
        id: 'education',
        title: 'Utbildning',
        count: cvData.education.filter(e => e.degree && e.institution).length,
        summary: cvData.education.length > 0
          ? cvData.education.filter(e => e.degree).map(e => e.degree).join(', ')
          : 'Ingen utbildning',
        isComplete: cvData.education.some(e => e.degree && e.institution),
      },
      {
        id: 'skills',
        title: 'Kompetenser',
        count: cvData.skills.flatMap(s => s.skills).length,
        summary: cvData.skills.flatMap(s => s.skills).slice(0, 3).join(', ') || 'Inga kompetenser',
        isComplete: cvData.skills.some(s => s.skills.length > 0),
      },
      {
        id: 'languages',
        title: 'Språk',
        count: cvData.languages.filter(l => l.language).length,
        summary: cvData.languages.filter(l => l.language).map(l => l.language).join(', ') || 'Inga språk',
        isComplete: cvData.languages.some(l => l.language),
      },
    ];
  }, [cvData]);

  // Check if CV is valid for saving
  const isValid = useMemo(() => {
    const hasBasicInfo = !!(cvData.personalInfo.fullName && cvData.personalInfo.email && cvData.personalInfo.phone);
    const hasContent = cvData.experience.some(e => e.position && e.company) ||
                      cvData.education.some(e => e.degree && e.institution);
    return hasBasicInfo && hasContent;
  }, [cvData]);

  // Generate preview text
  const previewText = useMemo(() => {
    const lines: string[] = [];

    // Header
    if (cvData.personalInfo.fullName) {
      lines.push(cvData.personalInfo.fullName.toUpperCase());
      const contactParts = [
        cvData.personalInfo.email,
        cvData.personalInfo.phone,
        cvData.personalInfo.address,
      ].filter(Boolean);
      if (contactParts.length > 0) {
        lines.push(contactParts.join(' | '));
      }
      lines.push('');
    }

    // Summary
    if (cvData.summary) {
      lines.push('SAMMANFATTNING');
      lines.push(cvData.summary);
      lines.push('');
    }

    // Experience
    const validExperience = cvData.experience.filter(e => e.position && e.company);
    if (validExperience.length > 0) {
      lines.push('ARBETSLIVSERFARENHET');
      validExperience.forEach(exp => {
        lines.push(`${exp.position}, ${exp.company}`);
        if (exp.startDate) {
          lines.push(`${exp.startDate} - ${exp.endDate || 'Nuvarande'}`);
        }
        if (exp.description && exp.description.length > 0) {
          exp.description.forEach(desc => {
            if (desc) lines.push(`• ${desc}`);
          });
        }
        lines.push('');
      });
    }

    // Education
    const validEducation = cvData.education.filter(e => e.degree && e.institution);
    if (validEducation.length > 0) {
      lines.push('UTBILDNING');
      validEducation.forEach(edu => {
        lines.push(`${edu.degree}`);
        lines.push(`${edu.institution}${edu.graduationYear ? `, ${edu.graduationYear}` : ''}`);
        lines.push('');
      });
    }

    // Skills
    const allSkills = cvData.skills.flatMap(s => s.skills);
    if (allSkills.length > 0) {
      lines.push('KOMPETENSER');
      lines.push(allSkills.join(' • '));
      lines.push('');
    }

    // Languages
    const validLanguages = cvData.languages.filter(l => l.language);
    if (validLanguages.length > 0) {
      lines.push('SPRÅK');
      validLanguages.forEach(lang => {
        lines.push(`${lang.language}: ${lang.proficiency}`);
      });
    }

    return lines.join('\n');
  }, [cvData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Granska ditt CV
        </h1>
        <p className="text-gray-600">
          Kontrollera att allt ser bra ut innan du sparar eller laddar ner.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Two column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Sections Overview */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              Sektioner
            </h2>

            <div className="space-y-2">
              {sections.map((section) => {
                const Icon = SECTION_ICONS[section.id as keyof typeof SECTION_ICONS];
                return (
                  <div
                    key={section.id}
                    className={`p-4 rounded-xl border transition-all ${
                      section.isComplete
                        ? 'bg-white border-gray-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          section.isComplete ? 'bg-green-100' : 'bg-amber-100'
                        }`}>
                          {section.isComplete ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Icon className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {section.title}
                            {section.count !== null && section.count > 0 && (
                              <span className="text-gray-500 font-normal"> ({section.count})</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">
                            {section.summary}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Template Selection */}
            <div className="mt-6 space-y-3">
              <h2 className="font-semibold text-gray-900">Välj mall</h2>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedTemplate === template.id
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900 text-sm">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.description}</p>
                    {selectedTemplate === template.id && (
                      <Check className="w-4 h-4 text-pink-600 mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Förhandsvisning
            </h2>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[400px] max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                {previewText || 'Fyll i dina uppgifter för att se förhandsvisning...'}
              </pre>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Den slutgiltiga PDF:en kommer att se annorlunda ut baserat på vald mall
            </p>
          </div>
        </div>

        {/* CV Name */}
        <div className="mt-8 space-y-2">
          <Label htmlFor="cvName">CV-namn</Label>
          <Input
            id="cvName"
            value={cvName}
            onChange={(e) => setCvName(e.target.value)}
            placeholder="Namnge ditt CV"
            className="max-w-md"
          />
        </div>

        {/* Validation Warning */}
        {!isValid && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 font-medium">Ditt CV är inte komplett</p>
            <p className="text-sm text-amber-700 mt-1">
              Du behöver minst: kontaktuppgifter (namn, e-post, telefon) och antingen arbetslivserfarenhet eller utbildning.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => onComplete('both')}
            disabled={!isValid || isSaving}
            className="min-h-[48px] px-8 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sparar...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Spara & Ladda ner PDF
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => onComplete('download')}
            disabled={!isValid || isSaving}
            className="min-h-[48px]"
          >
            <Download className="w-4 h-4 mr-2" />
            Bara ladda ner
          </Button>

          <Button
            variant="outline"
            onClick={() => onComplete('save')}
            disabled={!isValid || isSaving}
            className="min-h-[48px]"
          >
            <Save className="w-4 h-4 mr-2" />
            Bara spara
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Ditt CV sparas i "Mina CV" där du kan redigera och ladda ner det igen
        </p>
      </div>
    </div>
  );
}
