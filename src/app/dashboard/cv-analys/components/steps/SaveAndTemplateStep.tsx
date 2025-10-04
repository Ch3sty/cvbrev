// src/components/cv/analysis/steps/SaveAndTemplateStep.tsx
'use client';

import { useState } from 'react';
import { Save, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CVQuotaManager from '../CVQuotaManager';
import TemplateSelector from '../TemplateSelector';
import { generateCVNameSuggestions } from '@/lib/cv/cvNameSuggestions';
import { useCvQuota } from '@/hooks/useCvQuota';

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

  const nameSuggestions = generateCVNameSuggestions();

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
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
          <Download className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Spara ditt CV
        </h3>
        <p className="text-gray-600">
          Välj mall och spara ditt förbättrade CV
        </p>
      </div>

      {/* Save to Library Section - MOVED TO TOP */}
      <Card className="p-6 bg-white/95 backdrop-blur-xl shadow-lg border border-gray-200/80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Save className="w-6 h-6 text-blue-600" />
              <div>
                <h4 className="font-semibold text-gray-900">
                  Spara till Jobbcoach.ai
                </h4>
                <p className="text-sm text-gray-600">
                  Spara i ditt CV-bibliotek för senare användning
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quota Badge */}
              <div className={`px-4 py-2 rounded-lg font-semibold ${
                canSave
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {cvCount}/{maxCvs} sparade
              </div>

              <input
                type="checkbox"
                checked={saveToLibrary && canSave}
                onChange={(e) => setSaveToLibrary(e.target.checked && canSave)}
                disabled={!canSave}
                className="w-6 h-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
          </div>

          {saveToLibrary && canSave && (
            <div className="space-y-3 border-t border-gray-200 pt-4">
              {/* Name Suggestions */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Välj ett namn:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {nameSuggestions.slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setCustomName(suggestion)}
                      className={`text-left p-3 rounded-lg border-2 transition-all ${
                        customName === suggestion
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {suggestion}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Name Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Eller skriv eget namn:
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="t.ex. Mitt förbättrade CV 2025"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                />
              </div>
            </div>
          )}

          {!canSave && (
            <div className="border-t border-gray-200 pt-4">
              <CVQuotaManager
                key={quotaRefreshKey}
                cvCount={cvCount}
                maxCvs={maxCvs}
                subscriptionTier={subscriptionTier}
                onCVDeleted={handleQuotaRefresh}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Template Selector */}
      <TemplateSelector
        selectedTemplateId={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
        subscriptionTier={subscriptionTier as 'free' | 'premium'}
      />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={!selectedTemplate || isSaving || (saveToLibrary && !canSave && !customName)}
          className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white h-12"
        >
          {isSaving ? (
            <>Bearbetar...</>
          ) : (
            <>
              {saveToLibrary && canSave ? (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Spara & Ladda ner
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Ladda ner
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
