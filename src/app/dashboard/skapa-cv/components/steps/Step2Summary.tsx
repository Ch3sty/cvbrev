'use client';

import React, { useState } from 'react';
import { FileText, Lightbulb, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { CVDraft } from '../CVCreatorWizard';

interface Step2SummaryProps {
  cvData: CVDraft;
  updateCVData: (updates: Partial<CVDraft>) => void;
}

// Example summaries for inspiration
const EXAMPLE_SUMMARIES = [
  {
    title: 'Nyexaminerad',
    text: 'Engagerad och målinriktad nyexaminerad ekonom med stort intresse för affärsutveckling och kundrelationer. Söker en roll där jag kan kombinera min teoretiska kunskap med praktisk erfarenhet.',
  },
  {
    title: 'Erfaren yrkesperson',
    text: 'Resultatdriven projektledare med över 8 års erfarenhet av att leda tvärfunktionella team inom IT-sektorn. Specialiserad på agila metoder och digital transformation med dokumenterad framgång i att leverera projekt i tid och budget.',
  },
  {
    title: 'Karriärbyte',
    text: 'Driven säljare som nu vill ta steget in i marknadsföring. Min bakgrund inom kundkontakt och försäljning har gett mig värdefull insikt i kundbeteenden som jag vill använda för att skapa effektiva marknadsstrategier.',
  },
];

export default function Step2Summary({
  cvData,
  updateCVData,
}: Step2SummaryProps) {
  const [showExamples, setShowExamples] = useState(false);

  const characterCount = cvData.summary?.length || 0;
  const isOptimalLength = characterCount >= 100 && characterCount <= 300;
  const isTooLong = characterCount > 400;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Personlig sammanfattning
        </h1>
        <p className="text-gray-600">
          Beskriv kort vem du är och vad du söker. Detta visas högst upp i ditt CV.
        </p>
      </div>

      {/* Main Form */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="summary" className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            Om dig
          </Label>
          <Textarea
            id="summary"
            value={cvData.summary || ''}
            onChange={(e) => updateCVData({ summary: e.target.value })}
            placeholder="Skriv 2-3 meningar om din bakgrund, dina styrkor och vad du söker..."
            className={`min-h-[150px] resize-none ${
              isTooLong ? 'border-amber-500 focus:ring-amber-500' : ''
            }`}
          />
          <div className="flex justify-between items-center text-sm">
            <span className={`${
              isTooLong
                ? 'text-amber-600'
                : isOptimalLength
                  ? 'text-green-600'
                  : 'text-gray-500'
            }`}>
              {characterCount} tecken
              {isOptimalLength && ' - bra längd!'}
              {isTooLong && ' - försök korta ner lite'}
            </span>
            <span className="text-gray-400">Rekommenderat: 100-300 tecken</span>
          </div>
        </div>

        {/* Show Examples Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowExamples(!showExamples)}
          className="w-full"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          {showExamples ? 'Dölj exempel' : 'Visa exempel för inspiration'}
        </Button>

        {/* Examples */}
        {showExamples && (
          <div className="space-y-4 mt-4">
            {EXAMPLE_SUMMARIES.map((example, index) => (
              <div
                key={index}
                className="p-4 bg-white border border-gray-200 rounded-xl hover:border-pink-300 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => updateCVData({ summary: example.text })}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{example.title}</span>
                  <span className="text-xs text-pink-600 hover:text-pink-700">
                    Använd detta
                  </span>
                </div>
                <p className="text-sm text-gray-600 italic">"{example.text}"</p>
              </div>
            ))}
            <p className="text-xs text-gray-500 text-center">
              Klicka på ett exempel för att använda det som utgångspunkt
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100 max-w-2xl mx-auto">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Så skriver du en bra sammanfattning</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Var konkret:</strong> Undvik tomma fraser som "hårt arbetande" - visa istället vad du gjort</li>
              <li>• <strong>Anpassa efter jobbet:</strong> Lyft fram det som är relevant för den typ av jobb du söker</li>
              <li>• <strong>Håll det kort:</strong> 2-3 meningar räcker - arbetsgivare läser snabbt</li>
              <li>• <strong>Var inte blyg:</strong> Det här är din chans att sälja in dig själv!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Skip hint */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Du kan hoppa över detta steg och lägga till sammanfattning senare
      </p>
    </div>
  );
}
