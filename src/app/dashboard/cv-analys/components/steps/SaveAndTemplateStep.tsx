// src/components/cv/analysis/steps/SaveAndTemplateStep.tsx
'use client';

import { useState } from 'react';
import { Save, Download, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CVQuotaManager from '../CVQuotaManager';
import TemplateSelector from '../TemplateSelector';
import TemplateOptions from '../TemplateOptions';
import { generateCVNameSuggestions } from '@/lib/cv/cvNameSuggestions';
import { useCvQuota } from '@/hooks/useCvQuota';
import { getTemplateById } from '@/lib/cv/simple-templates';
import { useProfile } from '@/hooks/use-profile';

interface SaveAndTemplateStepProps {
  improvedCV: string;
  onSaveAndDownload: (templateId: string, fileName: string, saveToLibrary: boolean) => Promise<void>;
  isSaving: boolean;
}

export default function SaveAndTemplateStep({
  improvedCV,
  onSaveAndDownload,
  isSaving
}: SaveAndTemplateStepProps) {
  const { cvCount, maxCvs, canSave, subscriptionTier, loading } = useCvQuota();
  const { profile } = useProfile();
  const [saveChoice, setSaveChoice] = useState<'save' | 'download' | null>(null);
  const [customName, setCustomName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>('modern-minimal');
  const [quotaRefreshKey, setQuotaRefreshKey] = useState(0);
  const [showTips, setShowTips] = useState(false);

  const nameSuggestions = generateCVNameSuggestions();
  const selectedTemplateData = selectedTemplate ? (getTemplateById(selectedTemplate) || null) : null;

  // Get actual user profile data for photo and LinkedIn
  const userProfile = {
    hasPhoto: !!profile?.profile_photo_url,
    hasLinkedIn: !!profile?.linkedin_url
  };

  const handleSave = async () => {
    if (!selectedTemplate) {
      alert('Välj en CV-mall');
      return;
    }

    if (!saveChoice) {
      alert('Välj om du vill spara CV:t på Jobbcoach.ai eller bara ladda ned det');
      return;
    }

    const shouldSave = saveChoice === 'save';
    await onSaveAndDownload(selectedTemplate, customName || nameSuggestions[0], shouldSave);
  };

  const handleQuotaRefresh = () => {
    setQuotaRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Laddar...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Kompakt Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-3">
          <Download className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Spara & Ladda ner</h3>
      </div>

      {/* Välj hur du vill hantera ditt CV */}
      <Card className="p-6 bg-white border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Hur vill du hantera ditt förbättrade CV?</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Spara på Jobbcoach.ai */}
          <button
            type="button"
            onClick={() => setSaveChoice('save')}
            disabled={!canSave}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              saveChoice === 'save'
                ? 'border-green-500 bg-green-50 shadow-lg'
                : canSave
                ? 'border-gray-300 bg-white hover:border-green-300 hover:bg-green-50/50'
                : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 ${
                saveChoice === 'save'
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300 bg-white'
              }`}>
                {saveChoice === 'save' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Save className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-gray-900">Spara på Jobbcoach.ai</span>
                </div>
                <p className="text-sm text-gray-600">
                  Spara i ditt CV-bibliotek och ladda ned PDF
                </p>
                {canSave && (
                  <p className="text-xs text-green-700 mt-1 font-medium">
                    {cvCount}/{maxCvs} platser använda
                  </p>
                )}
                {!canSave && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    Fullt ({cvCount}/{maxCvs}) - Ta bort gamla CV:n först
                  </p>
                )}
              </div>
            </div>
          </button>

          {/* Bara ladda ned */}
          <button
            type="button"
            onClick={() => setSaveChoice('download')}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              saveChoice === 'download'
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 ${
                saveChoice === 'download'
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300 bg-white'
              }`}>
                {saveChoice === 'download' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Download className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-gray-900">Bara ladda ned PDF</span>
                </div>
                <p className="text-sm text-gray-600">
                  Ladda ned direkt utan att spara i biblioteket
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Du kan alltid ladda upp det senare
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Namn input - visas bara om man väljer att spara */}
        {saveChoice === 'save' && (
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">CV-namn</span>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={nameSuggestions[0] || "Mitt CV 2025"}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
              />
            </label>

            {/* Tips-sektion - fällbar */}
            <button
              onClick={() => setShowTips(!showTips)}
              className="mt-3 w-full text-left flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              <span className="font-medium">Namnförslag</span>
              <span className="ml-auto text-gray-400">{showTips ? '−' : '+'}</span>
            </button>

            {showTips && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                <p className="font-medium mb-1">💡 Tips för beskrivande namn:</p>
                <ul className="space-y-1 list-disc list-inside text-blue-800">
                  <li>Inkludera roll: "Frontend Developer CV 2025"</li>
                  <li>Inkludera bransch: "Säljare - Detaljhandel"</li>
                  <li>Inkludera månad för versionshantering</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Quota manager - visas om biblioteket är fullt */}
        {!canSave && saveChoice === 'save' && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <CVQuotaManager
              key={quotaRefreshKey}
              cvCount={cvCount}
              maxCvs={maxCvs}
              subscriptionTier={subscriptionTier}
              onCVDeleted={handleQuotaRefresh}
            />
          </div>
        )}
      </Card>

      {/* Template Selector med Carousel */}
      <TemplateSelector
        selectedTemplateId={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
        subscriptionTier={subscriptionTier as 'free' | 'premium'}
      />

      {/* Template Options (Photo/LinkedIn) */}
      <TemplateOptions
        template={selectedTemplateData}
        userProfile={userProfile}
      />

      {/* Action Button */}
      <Button
        onClick={handleSave}
        disabled={!selectedTemplate || isSaving || !saveChoice}
        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>Bearbetar...</>
        ) : !saveChoice ? (
          <>Välj ett alternativ ovan</>
        ) : saveChoice === 'save' ? (
          <>
            <Save className="w-5 h-5 mr-2" />
            Spara & Ladda ner PDF
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-2" />
            Ladda ner PDF
          </>
        )}
      </Button>
    </div>
  );
}
