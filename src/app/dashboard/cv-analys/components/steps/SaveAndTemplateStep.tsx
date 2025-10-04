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
  const [saveToLibrary, setSaveToLibrary] = useState(canSave);
  const [customName, setCustomName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>('modern-minimal');
  const [quotaRefreshKey, setQuotaRefreshKey] = useState(0);
  const [showTips, setShowTips] = useState(false);

  const nameSuggestions = generateCVNameSuggestions();
  const selectedTemplateData = selectedTemplate ? getTemplateById(selectedTemplate) : null;

  // Mock user profile data - replace with actual data from context/hook
  const userProfile = {
    hasPhoto: false, // TODO: Get from actual user profile
    hasLinkedIn: false // TODO: Get from actual user profile
  };

  const handleSave = async () => {
    if (!selectedTemplate) {
      alert('Välj en CV-mall');
      return;
    }

    if (saveToLibrary && !customName) {
      alert('Ange ett namn för ditt CV');
      return;
    }

    await onSaveAndDownload(selectedTemplate, customName || nameSuggestions[0], saveToLibrary);
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

      {/* Kompakt Spara-sektion */}
      <Card className="p-4 bg-white border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Namn input - tar upp huvudplats */}
          <div className="flex-1 w-full">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={nameSuggestions[0] || "Mitt CV 2025"}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
            />
          </div>

          {/* Spara checkbox med quota */}
          {canSave && (
            <label className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors whitespace-nowrap">
              <input
                type="checkbox"
                checked={saveToLibrary}
                onChange={(e) => setSaveToLibrary(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-green-800">
                Spara ({cvCount}/{maxCvs})
              </span>
            </label>
          )}

          {!canSave && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-800 whitespace-nowrap">
              Fullt ({cvCount}/{maxCvs})
            </div>
          )}
        </div>

        {/* Tips-sektion - fällbar */}
        <button
          onClick={() => setShowTips(!showTips)}
          className="mt-3 w-full text-left flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Lightbulb className="w-4 h-4" />
          <span className="font-medium">Namngivningstips</span>
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

        {!canSave && (
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
        disabled={!selectedTemplate || isSaving || (saveToLibrary && !canSave && !customName)}
        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        {isSaving ? (
          <>Bearbetar...</>
        ) : (
          <>
            {saveToLibrary && canSave ? (
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
          </>
        )}
      </Button>
    </div>
  );
}
