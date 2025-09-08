'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Palette, 
  Type, 
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import type { CVTemplateType } from '@/lib/cv/cv-metadata';

interface TemplateCustomizerEnhancedProps {
  selectedTemplate: CVTemplateType | null;
  selectedCV: any;
  onCustomizationChange: (customization: EnhancedTemplateCustomization) => void;
  onPreviewUpdate: (shouldUpdate: boolean) => void;
  className?: string;
}

export interface EnhancedTemplateCustomization {
  colorScheme: string;
  fontSize: number;
  spacing: number;
  includePhoto: boolean;
  fontFamily: string;
  headerStyle: string;
  layoutStyle: string;
}

export default function TemplateCustomizerEnhanced({
  selectedTemplate,
  selectedCV,
  onCustomizationChange,
  onPreviewUpdate,
  className = ''
}: TemplateCustomizerEnhancedProps) {
  const [activeTab, setActiveTab] = useState('style');
  const [customization, setCustomization] = useState<EnhancedTemplateCustomization>({
    colorScheme: 'professional',
    fontSize: 12,
    spacing: 1.5,
    includePhoto: false,
    fontFamily: 'Inter',
    headerStyle: 'modern',
    layoutStyle: 'single-column'
  });

  const templateSchemes = {
    'klassisk': ['navy', 'charcoal', 'forest', 'burgundy', 'royal', 'emerald'],
    'modern': ['slate', 'teal', 'indigo', 'emerald', 'navy', 'charcoal'],
    'minimalistisk': ['navy', 'charcoal', 'neutral', 'elegant', 'clean', 'sophisticated'],
    'ats-optimerad': ['professional', 'corporate', 'neutral', 'executive', 'digital', 'clean'],
    'kreativ': ['creative', 'brand', 'vibrant', 'artistic', 'modern', 'elegant'],
    'akademisk': ['academic', 'institution', 'scholarly', 'traditional', 'research', 'university'],
    'modern-tech': ['tech', 'digital', 'innovation', 'modern', 'cyber', 'matrix']
  };

  const updateCustomization = useCallback((updates: Partial<EnhancedTemplateCustomization>) => {
    const newCustomization = { ...customization, ...updates };
    setCustomization(newCustomization);
    onCustomizationChange(newCustomization);
    onPreviewUpdate(true);
  }, [customization, onCustomizationChange, onPreviewUpdate]);

  const getAvailableSchemes = () => {
    if (!selectedTemplate) return ['professional'];
    return templateSchemes[selectedTemplate] || ['professional'];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'style', label: 'Stil', icon: Palette },
          { id: 'layout', label: 'Layout', icon: Settings },
          { id: 'typography', label: 'Typografi', icon: Type }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'style' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Färgscheman</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Välj färgschema
              </label>
              <div className="grid grid-cols-2 gap-2">
                {getAvailableSchemes().map((scheme) => (
                  <button
                    key={scheme}
                    onClick={() => updateCustomization({ colorScheme: scheme })}
                    className={`p-3 text-left rounded-lg border-2 transition-all ${
                      customization.colorScheme === scheme
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm capitalize">{scheme}</div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'typography' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Type className="w-5 h-5" />
              <span>Typografi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Textstorlek: {customization.fontSize}pt
              </label>
              <Slider
                value={[customization.fontSize]}
                onValueChange={(value) => updateCustomization({ fontSize: value[0] })}
                min={10}
                max={16}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Radavstånd: {customization.spacing}
              </label>
              <Slider
                value={[customization.spacing]}
                onValueChange={(value) => updateCustomization({ spacing: value[0] })}
                min={1.0}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Typsnitt
              </label>
              <div className="grid grid-cols-1 gap-2">
                {['Inter', 'Roboto', 'Open Sans', 'Lato'].map((font) => (
                  <button
                    key={font}
                    onClick={() => updateCustomization({ fontFamily: font })}
                    className={`p-3 text-left rounded-lg border-2 transition-all ${
                      customization.fontFamily === font
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ fontFamily: font }}
                  >
                    <div className="font-medium">{font}</div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'layout' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Layout</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Huvudstil
              </label>
              <div className="grid grid-cols-1 gap-2">
                {['minimal', 'prominent', 'creative', 'executive'].map((style) => (
                  <button
                    key={style}
                    onClick={() => updateCustomization({ headerStyle: style })}
                    className={`p-3 text-left rounded-lg border-2 transition-all ${
                      customization.headerStyle === style
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm capitalize">{style}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Layoutstil
              </label>
              <div className="grid grid-cols-1 gap-2">
                {['single-column', 'two-column', 'sidebar', 'modern-grid'].map((layout) => (
                  <button
                    key={layout}
                    onClick={() => updateCustomization({ layoutStyle: layout })}
                    className={`p-3 text-left rounded-lg border-2 transition-all ${
                      customization.layoutStyle === layout
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{layout}</div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <Button
          onClick={() => onPreviewUpdate(true)}
          className="flex-1"
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Uppdatera förhandsvisning
        </Button>
        <Button className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Ladda ned CV
        </Button>
      </div>

      {/* Template Info */}
      {selectedTemplate && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {selectedTemplate}
              </Badge>
            </div>
            <p className="text-sm text-blue-700">
              Anpassningar tillämpas automatiskt på den valda mallen.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}