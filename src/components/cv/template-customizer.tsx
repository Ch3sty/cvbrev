'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Palette, 
  Type, 
  Layout, 
  Image as ImageIcon,
  Sliders,
  Eye,
  Download,
  RefreshCw,
  Sparkles,
  Settings,
  Save,
  Undo2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { CVTemplateType } from '@/lib/cv/cv-metadata';

interface TemplateCustomizerProps {
  selectedTemplate: CVTemplateType | null;
  selectedCV: any;
  onCustomizationChange: (customization: TemplateCustomization) => void;
  onPreviewUpdate: (shouldUpdate: boolean) => void;
  className?: string;
}

export interface TemplateCustomization {
  colorScheme: string;
  fontSize: number;
  spacing: number;
  includePhoto: boolean;
  headerStyle: 'minimal' | 'prominent' | 'creative';
  sectionOrder: string[];
  accentColor: string;
  fontFamily: string;
  borderRadius: number;
  shadowIntensity: number;
  swedishOptimizations: {
    hidePersonalNumber: boolean;
    emphasizeLanguages: boolean;
    includeReferences: boolean;
    useSwedishDateFormat: boolean;
  };
}

const DEFAULT_CUSTOMIZATION: TemplateCustomization = {
  colorScheme: 'blue',
  fontSize: 11,
  spacing: 1,
  includePhoto: false,
  headerStyle: 'prominent',
  sectionOrder: ['experience', 'education', 'skills', 'projects'],
  accentColor: '#2563eb',
  fontFamily: 'Inter',
  borderRadius: 8,
  shadowIntensity: 0.1,
  swedishOptimizations: {
    hidePersonalNumber: true,
    emphasizeLanguages: true,
    includeReferences: true,
    useSwedishDateFormat: true,
  }
};

const COLOR_SCHEMES = [
  { id: 'blue', name: 'Klassisk Blå', color: '#2563eb', description: 'Professionell och trygg' },
  { id: 'green', name: 'Naturgrön', color: '#059669', description: 'Hållbar och modern' },
  { id: 'purple', name: 'Kreativ Lila', color: '#7c3aed', description: 'Innovativ och unik' },
  { id: 'red', name: 'Energisk Röd', color: '#dc2626', description: 'Kraftfull och driftig' },
  { id: 'orange', name: 'Varm Orange', color: '#ea580c', description: 'Vänlig och tillgänglig' },
  { id: 'teal', name: 'Tech Teal', color: '#0d9488', description: 'Modern och tech-fokuserad' },
  { id: 'pink', name: 'Rosa Premium', color: '#ec4899', description: 'Premiumkänsla och elegans' },
  { id: 'slate', name: 'Skandinavisk Grå', color: '#475569', description: 'Minimalistisk och ren' }
];

const FONT_FAMILIES = [
  { id: 'Inter', name: 'Inter', description: 'Modern och läsbar' },
  { id: 'Times', name: 'Times New Roman', description: 'Traditionell och formell' },
  { id: 'Arial', name: 'Arial', description: 'Ren och enkel' },
  { id: 'Georgia', name: 'Georgia', description: 'Elegans med läsbarhet' },
  { id: 'Helvetica', name: 'Helvetica', description: 'Schweizisk precision' }
];

const HEADER_STYLES = [
  { id: 'minimal', name: 'Minimal', description: 'Diskret och professionell' },
  { id: 'prominent', name: 'Framträdande', description: 'Tydlig och uppmärksamhetsfångande' },
  { id: 'creative', name: 'Kreativ', description: 'Unik och minnesvärd' }
];

export default function TemplateCustomizer({
  selectedTemplate,
  selectedCV,
  onCustomizationChange,
  onPreviewUpdate,
  className = ""
}: TemplateCustomizerProps) {
  const [customization, setCustomization] = useState<TemplateCustomization>(DEFAULT_CUSTOMIZATION);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'swedish'>('colors');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedCustomizations, setSavedCustomizations] = useState<Record<string, TemplateCustomization>>({});
  
  // Load saved customization for this template
  useEffect(() => {
    if (selectedTemplate && savedCustomizations[selectedTemplate]) {
      const saved = savedCustomizations[selectedTemplate];
      setCustomization(saved);
      onCustomizationChange(saved);
    } else {
      setCustomization(DEFAULT_CUSTOMIZATION);
      onCustomizationChange(DEFAULT_CUSTOMIZATION);
    }
    setHasUnsavedChanges(false);
  }, [selectedTemplate]);
  
  // Update customization and mark as changed
  const updateCustomization = (updates: Partial<TemplateCustomization>) => {
    const newCustomization = { ...customization, ...updates };
    setCustomization(newCustomization);
    onCustomizationChange(newCustomization);
    setHasUnsavedChanges(true);
    onPreviewUpdate(true);
  };
  
  // Save current customization
  const saveCustomization = () => {
    if (selectedTemplate) {
      setSavedCustomizations(prev => ({
        ...prev,
        [selectedTemplate]: customization
      }));
      setHasUnsavedChanges(false);
    }
  };
  
  // Reset to defaults
  const resetToDefaults = () => {
    setCustomization(DEFAULT_CUSTOMIZATION);
    onCustomizationChange(DEFAULT_CUSTOMIZATION);
    setHasUnsavedChanges(true);
    onPreviewUpdate(true);
  };
  
  if (!selectedTemplate || !selectedCV) {
    return (
      <Card className={`bg-navy-700 border-navy-600 ${className}`}>
        <CardContent className="p-6 text-center">
          <Sliders className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">Välj en mall och CV för att anpassa utseendet</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Customizer Header */}
      <Card className="bg-gradient-to-r from-navy-700 to-navy-600 border border-purple-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-2 mr-3">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white flex items-center">
                  Anpassa Utseende
                  <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                    Interaktiv
                  </Badge>
                </CardTitle>
                <p className="text-gray-300 text-sm mt-1">
                  Personalisera din {selectedTemplate}-mall i realtid
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {hasUnsavedChanges && (
                <Button
                  onClick={saveCustomization}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Spara
                </Button>
              )}
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="outline"
                size="sm"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="space-y-6">
            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-navy-800 p-1 rounded-lg">
              {[
                { id: 'colors', label: 'Färger', icon: Palette },
                { id: 'typography', label: 'Typografi', icon: Type },
                { id: 'layout', label: 'Layout', icon: Layout },
                { id: 'swedish', label: 'Svenska', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-pink-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-navy-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            
            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Färgschema</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {COLOR_SCHEMES.map((scheme) => (
                      <button
                        key={scheme.id}
                        onClick={() => updateCustomization({ 
                          colorScheme: scheme.id,
                          accentColor: scheme.color 
                        })}
                        className={`flex items-center p-3 rounded-lg border transition-all ${
                          customization.colorScheme === scheme.id
                            ? 'border-pink-500 bg-pink-500/20'
                            : 'border-navy-600 bg-navy-600 hover:border-navy-500'
                        }`}
                      >
                        <div 
                          className="w-6 h-6 rounded-full mr-3 border-2 border-white/20"
                          style={{ backgroundColor: scheme.color }}
                        />
                        <div className="text-left">
                          <div className="text-white text-sm font-medium">{scheme.name}</div>
                          <div className="text-gray-400 text-xs">{scheme.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-3">Skuggor & Effekter</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-300 text-sm mb-2 block">
                        Skuggintensitet: {Math.round(customization.shadowIntensity * 100)}%
                      </label>
                      <Slider
                        value={[customization.shadowIntensity]}
                        onValueChange={([value]) => updateCustomization({ shadowIntensity: value })}
                        max={0.5}
                        min={0}
                        step={0.05}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-gray-300 text-sm mb-2 block">
                        Hörnavrundning: {customization.borderRadius}px
                      </label>
                      <Slider
                        value={[customization.borderRadius]}
                        onValueChange={([value]) => updateCustomization({ borderRadius: value })}
                        max={20}
                        min={0}
                        step={2}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Typography Tab */}
            {activeTab === 'typography' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Typsnitt</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {FONT_FAMILIES.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => updateCustomization({ fontFamily: font.id })}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          customization.fontFamily === font.id
                            ? 'border-pink-500 bg-pink-500/20'
                            : 'border-navy-600 bg-navy-600 hover:border-navy-500'
                        }`}
                      >
                        <div className="text-left">
                          <div className="text-white font-medium" style={{ fontFamily: font.name }}>
                            {font.name}
                          </div>
                          <div className="text-gray-400 text-sm">{font.description}</div>
                        </div>
                        {customization.fontFamily === font.id && (
                          <Sparkles className="w-4 h-4 text-pink-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Textstorlek: {customization.fontSize}pt
                    </label>
                    <Slider
                      value={[customization.fontSize]}
                      onValueChange={([value]) => updateCustomization({ fontSize: value })}
                      max={14}
                      min={9}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Liten (9pt)</span>
                      <span>Standard (11pt)</span>
                      <span>Stor (14pt)</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Radavstånd: {customization.spacing === 0.8 ? 'Kompakt' : 
                                  customization.spacing === 1 ? 'Standard' : 'Luftigt'}
                    </label>
                    <Slider
                      value={[customization.spacing]}
                      onValueChange={([value]) => updateCustomization({ spacing: value })}
                      max={1.4}
                      min={0.8}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Layout Tab */}
            {activeTab === 'layout' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Rubrikstil</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {HEADER_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => updateCustomization({ headerStyle: style.id as any })}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          customization.headerStyle === style.id
                            ? 'border-pink-500 bg-pink-500/20'
                            : 'border-navy-600 bg-navy-600 hover:border-navy-500'
                        }`}
                      >
                        <div className="text-left">
                          <div className="text-white font-medium">{style.name}</div>
                          <div className="text-gray-400 text-sm">{style.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-3">Profilbild</h4>
                  <div className="flex items-center space-x-4 p-3 bg-navy-600 rounded-lg">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                    <div className="flex-grow">
                      <div className="text-white text-sm font-medium">Inkludera profilbild</div>
                      <div className="text-gray-400 text-xs">Rekommenderas ej för ATS-system</div>
                    </div>
                    <button
                      onClick={() => updateCustomization({ includePhoto: !customization.includePhoto })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        customization.includePhoto ? 'bg-pink-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          customization.includePhoto ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Swedish Optimizations Tab */}
            {activeTab === 'swedish' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-900/30 to-green-900/30 rounded-lg p-4 border border-blue-500/30 mb-4">
                  <h4 className="text-blue-400 font-medium mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Svenska Marknadsanpassningar
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Optimera ditt CV för svenska arbetsgivare och kulturella normer
                  </p>
                </div>
                
                <div className="space-y-4">
                  {[
                    {
                      key: 'hidePersonalNumber',
                      title: 'Dölj personnummer',
                      description: 'GDPR-kompatibel och rekommenderat för första ansökan'
                    },
                    {
                      key: 'emphasizeLanguages',
                      title: 'Framhäv språkkunskaper',
                      description: 'Viktigt på internationella svenska arbetsplatser'
                    },
                    {
                      key: 'includeReferences',
                      title: 'Inkludera referenser',
                      description: 'Standard i svenska CV-traditioner'
                    },
                    {
                      key: 'useSwedishDateFormat',
                      title: 'Svenskt datumformat',
                      description: 'YYYY-MM-DD enligt svensk standard'
                    }
                  ].map((option) => (
                    <div key={option.key} className="flex items-center space-x-4 p-3 bg-navy-600 rounded-lg">
                      <div className="flex-grow">
                        <div className="text-white text-sm font-medium">{option.title}</div>
                        <div className="text-gray-400 text-xs">{option.description}</div>
                      </div>
                      <button
                        onClick={() => updateCustomization({
                          swedishOptimizations: {
                            ...customization.swedishOptimizations,
                            [option.key]: !customization.swedishOptimizations[option.key as keyof typeof customization.swedishOptimizations]
                          }
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          customization.swedishOptimizations[option.key as keyof typeof customization.swedishOptimizations] 
                            ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            customization.swedishOptimizations[option.key as keyof typeof customization.swedishOptimizations] 
                              ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-navy-600">
              <Button
                onClick={resetToDefaults}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-400 hover:bg-gray-700"
              >
                <Undo2 className="w-4 h-4 mr-1" />
                Återställ
              </Button>
              
              <div className="flex items-center space-x-2">
                {hasUnsavedChanges && (
                  <div className="text-yellow-400 text-xs flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
                    Osparade ändringar
                  </div>
                )}
                <Button
                  onClick={saveCustomization}
                  disabled={!hasUnsavedChanges}
                  size="sm"
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Spara Anpassning
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Quick Customization Preview */}
      {!isExpanded && (
        <Card className="bg-navy-700 border-navy-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white/20"
                  style={{ backgroundColor: customization.accentColor }}
                />
                <div>
                  <div className="text-white text-sm font-medium">
                    {COLOR_SCHEMES.find(c => c.id === customization.colorScheme)?.name}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {customization.fontFamily}, {customization.fontSize}pt
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {hasUnsavedChanges && (
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                )}
                <Button
                  onClick={() => setIsExpanded(true)}
                  size="sm"
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
                >
                  Anpassa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}