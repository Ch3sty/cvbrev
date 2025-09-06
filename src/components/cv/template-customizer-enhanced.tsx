'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
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
  ChevronUp,
  Monitor,
  Smartphone,
  Printer,
  Globe,
  Languages,
  Award,
  User
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
  // Grundläggande
  colorScheme: string;
  fontSize: number;
  spacing: number;
  includePhoto: boolean;
  headerStyle: 'minimal' | 'prominent' | 'creative' | 'executive';
  
  // Avancerade färgalternativ
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  
  // Typografi
  fontFamily: string;
  fontWeight: number;
  lineHeight: number;
  headingFont: string;
  
  // Layout och design
  layoutStyle: 'single-column' | 'two-column' | 'sidebar' | 'modern-grid';
  borderRadius: number;
  shadowIntensity: number;
  borderStyle: 'none' | 'subtle' | 'prominent' | 'creative';
  
  // Sektioner och innehåll
  sectionOrder: string[];
  showSectionIcons: boolean;
  compactMode: boolean;
  emphasisStyle: 'bold' | 'color' | 'underline' | 'background';
  
  // Svenska optimeringar
  swedishOptimizations: {
    hidePersonalNumber: boolean;
    emphasizeLanguages: boolean;
    includeReferences: boolean;
    useSwedishDateFormat: boolean;
    gdprCompliant: boolean;
    includeWorkPermit: boolean;
    emphasizeCertifications: boolean;
  };
  
  // Export optimeringar
  exportSettings: {
    pdfOptimized: boolean;
    printFriendly: boolean;
    highResolution: boolean;
    colorProfile: 'rgb' | 'cmyk';
  };
  
  // Responsivitet
  responsiveDesign: {
    mobileOptimized: boolean;
    tabletView: boolean;
    printLayout: boolean;
  };
}

// Fördefinierade color schemes
const colorSchemes = {
  // Professionella
  'navy': { name: 'Navy Professional', primary: '#1e3a8a', accent: '#3b82f6', bg: '#f8fafc' },
  'charcoal': { name: 'Charcoal Executive', primary: '#374151', accent: '#6b7280', bg: '#f9fafb' },
  'forest': { name: 'Forest Green', primary: '#064e3b', accent: '#059669', bg: '#ecfdf5' },
  
  // Moderna
  'slate': { name: 'Modern Slate', primary: '#1e293b', accent: '#475569', bg: '#f1f5f9' },
  'teal': { name: 'Teal Innovation', primary: '#0f766e', accent: '#14b8a6', bg: '#f0fdfa' },
  'indigo': { name: 'Indigo Tech', primary: '#3730a3', accent: '#6366f1', bg: '#eef2ff' },
  
  // Kreativa
  'purple': { name: 'Creative Purple', primary: '#7c3aed', accent: '#a855f7', bg: '#faf5ff' },
  'rose': { name: 'Warm Rose', primary: '#be185d', accent: '#ec4899', bg: '#fdf2f8' },
  'amber': { name: 'Energy Amber', primary: '#d97706', accent: '#f59e0b', bg: '#fffbeb' }
};

// Font alternativ
const fontFamilies = {
  'inter': { name: 'Inter', style: 'Modern, Clean' },
  'crimson': { name: 'Crimson Text', style: 'Classic, Elegant' },
  'roboto': { name: 'Roboto', style: 'Technical, Clear' },
  'playfair': { name: 'Playfair Display', style: 'Sophisticated' },
  'source-sans': { name: 'Source Sans Pro', style: 'Professional' },
  'lato': { name: 'Lato', style: 'Friendly, Modern' }
};

// Layout alternativ
const layoutStyles = {
  'single-column': { name: 'Enkelkolumn', description: 'Klassisk, ATS-vänlig layout' },
  'two-column': { name: 'Tvåkolumn', description: 'Balanserad, informationstät' },
  'sidebar': { name: 'Sidebar', description: 'Modern, visuellt tilltalande' },
  'modern-grid': { name: 'Modern Grid', description: 'Flexibel, responsiv design' }
};

const defaultCustomization: EnhancedTemplateCustomization = {
  colorScheme: 'navy',
  fontSize: 11,
  spacing: 1.2,
  includePhoto: false,
  headerStyle: 'prominent',
  primaryColor: '#1e3a8a',
  accentColor: '#3b82f6',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  fontFamily: 'inter',
  fontWeight: 400,
  lineHeight: 1.5,
  headingFont: 'inter',
  layoutStyle: 'single-column',
  borderRadius: 4,
  shadowIntensity: 2,
  borderStyle: 'subtle',
  sectionOrder: ['summary', 'experience', 'skills', 'education'],
  showSectionIcons: true,
  compactMode: false,
  emphasisStyle: 'bold',
  swedishOptimizations: {
    hidePersonalNumber: true,
    emphasizeLanguages: true,
    includeReferences: false,
    useSwedishDateFormat: true,
    gdprCompliant: true,
    includeWorkPermit: false,
    emphasizeCertifications: true
  },
  exportSettings: {
    pdfOptimized: true,
    printFriendly: true,
    highResolution: false,
    colorProfile: 'rgb'
  },
  responsiveDesign: {
    mobileOptimized: true,
    tabletView: true,
    printLayout: true
  }
};

export default function TemplateCustomizerEnhanced({
  selectedTemplate,
  selectedCV,
  onCustomizationChange,
  onPreviewUpdate,
  className = ""
}: TemplateCustomizerEnhancedProps) {
  const [customization, setCustomization] = useState<EnhancedTemplateCustomization>(defaultCustomization);
  const [activeTab, setActiveTab] = useState('style');
  const [isExpanded, setIsExpanded] = useState(true);
  const [presets, setPresets] = useState<Record<string, EnhancedTemplateCustomization>>({});

  // Template-specifika rekommendationer
  const templateRecommendations = useMemo(() => {
    if (!selectedTemplate) return {};
    
    const recommendations: Record<CVTemplateType, Partial<EnhancedTemplateCustomization>> = {
      'klassisk': {
        colorScheme: 'navy',
        fontFamily: 'crimson',
        headerStyle: 'executive',
        layoutStyle: 'single-column',
        emphasisStyle: 'bold'
      },
      'modern': {
        colorScheme: 'slate',
        fontFamily: 'inter',
        headerStyle: 'prominent',
        layoutStyle: 'two-column',
        emphasisStyle: 'color'
      },
      'ats-optimerad': {
        colorScheme: 'charcoal',
        fontFamily: 'roboto',
        headerStyle: 'minimal',
        layoutStyle: 'single-column',
        borderStyle: 'none',
        compactMode: true
      },
      'kreativ': {
        colorScheme: 'purple',
        fontFamily: 'playfair',
        headerStyle: 'creative',
        layoutStyle: 'modern-grid',
        emphasisStyle: 'background'
      },
      'akademisk': {
        colorScheme: 'forest',
        fontFamily: 'source-sans',
        headerStyle: 'prominent',
        layoutStyle: 'single-column',
        emphasisStyle: 'underline'
      },
      'modern-tech': {
        colorScheme: 'indigo',
        fontFamily: 'roboto',
        headerStyle: 'minimal',
        layoutStyle: 'sidebar',
        emphasisStyle: 'color'
      }
    };
    
    return recommendations[selectedTemplate] || {};
  }, [selectedTemplate]);

  // Uppdatera customization när template ändras
  useEffect(() => {
    if (selectedTemplate && templateRecommendations) {
      setCustomization(prev => ({
        ...prev,
        ...templateRecommendations
      }));
    }
  }, [selectedTemplate, templateRecommendations]);

  // Meddelande om ändringar
  const handleCustomizationChange = useCallback((changes: Partial<EnhancedTemplateCustomization>) => {
    const newCustomization = { ...customization, ...changes };
    setCustomization(newCustomization);
    onCustomizationChange(newCustomization);
    onPreviewUpdate(true);
  }, [customization, onCustomizationChange, onPreviewUpdate]);

  // Snabb preset-funktioner
  const applyPreset = useCallback((presetName: string) => {
    const presetData = presets[presetName];
    if (presetData) {
      setCustomization(presetData);
      onCustomizationChange(presetData);
      onPreviewUpdate(true);
    }
  }, [presets, onCustomizationChange, onPreviewUpdate]);

  const savePreset = useCallback((name: string) => {
    setPresets(prev => ({
      ...prev,
      [name]: customization
    }));
  }, [customization]);

  // Reset till template default
  const resetToDefault = useCallback(() => {
    const defaultWithTemplate = { ...defaultCustomization, ...templateRecommendations };
    setCustomization(defaultWithTemplate);
    onCustomizationChange(defaultWithTemplate);
    onPreviewUpdate(true);
  }, [templateRecommendations, onCustomizationChange, onPreviewUpdate]);

  if (!selectedTemplate) {
    return (
      <Card className={`bg-navy-800 border-navy-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Anpassning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Välj en mall för att visa anpassningsalternativ.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-navy-800 border-navy-700 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Anpassa mall
            <Badge className="ml-2 bg-blue-600 text-white text-xs">
              {selectedTemplate}
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={resetToDefault}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-navy-700">
              <TabsTrigger value="style" className="data-[state=active]:bg-navy-600">
                <Palette className="w-4 h-4 mr-2" />
                Stil
              </TabsTrigger>
              <TabsTrigger value="layout" className="data-[state=active]:bg-navy-600">
                <Layout className="w-4 h-4 mr-2" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-navy-600">
                <Type className="w-4 h-4 mr-2" />
                Innehåll
              </TabsTrigger>
              <TabsTrigger value="export" className="data-[state=active]:bg-navy-600">
                <Download className="w-4 h-4 mr-2" />
                Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="style" className="space-y-4">
              {/* Färgschema */}
              <div>
                <Label className="text-white mb-2 block">Färgschema</Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(colorSchemes).map(([key, scheme]) => (
                    <Button
                      key={key}
                      onClick={() => handleCustomizationChange({ 
                        colorScheme: key,
                        primaryColor: scheme.primary,
                        accentColor: scheme.accent,
                        backgroundColor: scheme.bg
                      })}
                      variant={customization.colorScheme === key ? "default" : "outline"}
                      size="sm"
                      className="flex items-center space-x-2 h-auto p-2"
                    >
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: scheme.primary }}
                      />
                      <span className="text-xs">{scheme.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Typografi */}
              <div>
                <Label className="text-white mb-2 block">Typografi</Label>
                <Select
                  value={customization.fontFamily}
                  onValueChange={(value) => handleCustomizationChange({ fontFamily: value })}
                >
                  <SelectTrigger className="bg-navy-700 border-navy-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-navy-700 border-navy-600">
                    {Object.entries(fontFamilies).map(([key, font]) => (
                      <SelectItem key={key} value={key}>
                        <div>
                          <span className="font-medium">{font.name}</span>
                          <span className="text-sm text-gray-400 ml-2">{font.style}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Storlek och spacing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white mb-2 block">Textstorlek: {customization.fontSize}pt</Label>
                  <Slider
                    value={[customization.fontSize]}
                    onValueChange={([value]) => handleCustomizationChange({ fontSize: value })}
                    min={9}
                    max={14}
                    step={0.5}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">Radavstånd: {customization.lineHeight}</Label>
                  <Slider
                    value={[customization.lineHeight]}
                    onValueChange={([value]) => handleCustomizationChange({ lineHeight: value })}
                    min={1.2}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              {/* Layout stil */}
              <div>
                <Label className="text-white mb-2 block">Layout</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(layoutStyles).map(([key, layout]) => (
                    <Button
                      key={key}
                      onClick={() => handleCustomizationChange({ layoutStyle: key as any })}
                      variant={customization.layoutStyle === key ? "default" : "outline"}
                      size="sm"
                      className="h-auto p-3 text-left"
                    >
                      <div>
                        <div className="font-medium">{layout.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{layout.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Header stil */}
              <div>
                <Label className="text-white mb-2 block">Rubrikstil</Label>
                <Select
                  value={customization.headerStyle}
                  onValueChange={(value: any) => handleCustomizationChange({ headerStyle: value })}
                >
                  <SelectTrigger className="bg-navy-700 border-navy-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-navy-700 border-navy-600">
                    <SelectItem value="minimal">Minimalistisk</SelectItem>
                    <SelectItem value="prominent">Framträdande</SelectItem>
                    <SelectItem value="creative">Kreativ</SelectItem>
                    <SelectItem value="executive">Verkställande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Design detaljer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white mb-2 block">Hörn-radie: {customization.borderRadius}px</Label>
                  <Slider
                    value={[customization.borderRadius]}
                    onValueChange={([value]) => handleCustomizationChange({ borderRadius: value })}
                    min={0}
                    max={12}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">Skugga: {customization.shadowIntensity}</Label>
                  <Slider
                    value={[customization.shadowIntensity]}
                    onValueChange={([value]) => handleCustomizationChange({ shadowIntensity: value })}
                    min={0}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              {/* Svenska optimeringar */}
              <div>
                <Label className="text-white mb-3 block flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  Svenska optimeringar
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">GDPR-kompatibel</span>
                    <Switch
                      checked={customization.swedishOptimizations.gdprCompliant}
                      onCheckedChange={(checked) => 
                        handleCustomizationChange({
                          swedishOptimizations: {
                            ...customization.swedishOptimizations,
                            gdprCompliant: checked
                          }
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Svensk datumformat</span>
                    <Switch
                      checked={customization.swedishOptimizations.useSwedishDateFormat}
                      onCheckedChange={(checked) => 
                        handleCustomizationChange({
                          swedishOptimizations: {
                            ...customization.swedishOptimizations,
                            useSwedishDateFormat: checked
                          }
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Framhäv språkkunskaper</span>
                    <Switch
                      checked={customization.swedishOptimizations.emphasizeLanguages}
                      onCheckedChange={(checked) => 
                        handleCustomizationChange({
                          swedishOptimizations: {
                            ...customization.swedishOptimizations,
                            emphasizeLanguages: checked
                          }
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Inkludera certifieringar</span>
                    <Switch
                      checked={customization.swedishOptimizations.emphasizeCertifications}
                      onCheckedChange={(checked) => 
                        handleCustomizationChange({
                          swedishOptimizations: {
                            ...customization.swedishOptimizations,
                            emphasizeCertifications: checked
                          }
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Sektions-inställningar */}
              <div>
                <Label className="text-white mb-3 block">Visuella inställningar</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Visa sektions-ikoner</span>
                    <Switch
                      checked={customization.showSectionIcons}
                      onCheckedChange={(checked) => handleCustomizationChange({ showSectionIcons: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Kompakt läge</span>
                    <Switch
                      checked={customization.compactMode}
                      onCheckedChange={(checked) => handleCustomizationChange({ compactMode: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Inkludera foto</span>
                    <Switch
                      checked={customization.includePhoto}
                      onCheckedChange={(checked) => handleCustomizationChange({ includePhoto: checked })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              {/* Export inställningar */}
              <div>
                <Label className="text-white mb-3 block flex items-center">
                  <Monitor className="w-4 h-4 mr-2" />
                  Export & Display
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">PDF-optimerad</span>
                    <Switch
                      checked={customization.exportSettings.pdfOptimized}
                      onCheckedChange={(checked) => 
                        handleCustomizationChange({
                          exportSettings: {
                            ...customization.exportSettings,
                            pdfOptimized: checked
                          }
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Utskriftsvänlig</span>
                    <Switch
                      checked={customization.exportSettings.printFriendly}
                      onCheckedChange={(checked) => 
                        handleCustomizationChange({
                          exportSettings: {
                            ...customization.exportSettings,
                            printFriendly: checked
                          }
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Mobil-optimerad</span>
                    <Switch
                      checked={customization.responsiveDesign.mobileOptimized}
                      onCheckedChange={(checked) => 
                        handleCustomizationChange({
                          responsiveDesign: {
                            ...customization.responsiveDesign,
                            mobileOptimized: checked
                          }
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Snabbinställningar */}
              <div>
                <Label className="text-white mb-3 block">Snabbinställningar</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleCustomizationChange({
                      exportSettings: { ...customization.exportSettings, pdfOptimized: true, printFriendly: true },
                      responsiveDesign: { ...customization.responsiveDesign, mobileOptimized: false },
                      compactMode: true
                    })}
                    variant="outline"
                    size="sm"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    onClick={() => handleCustomizationChange({
                      exportSettings: { ...customization.exportSettings, pdfOptimized: true },
                      responsiveDesign: { ...customization.responsiveDesign, mobileOptimized: true },
                      compactMode: false
                    })}
                    variant="outline"
                    size="sm"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Mobile
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Template-specifika tips */}
          <div className="mt-6 p-3 bg-blue-900/30 rounded-lg border border-blue-600/30">
            <div className="flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-400 font-medium text-sm">Tips för {selectedTemplate}</p>
                <p className="text-gray-300 text-xs mt-1">
                  {selectedTemplate === 'ats-optimerad' && 'Använd minimalistisk design och undvik komplexa layouter för bästa ATS-kompatibilitet.'}
                  {selectedTemplate === 'klassisk' && 'Välj konservativa färger och traditionella fonter för professionell trovärdighet.'}
                  {selectedTemplate === 'modern' && 'Experimentera med färger och layout för att skapa visuell impact.'}
                  {selectedTemplate === 'kreativ' && 'Använd utrymmet för kreativ uttryck men behåll läsbarheten.'}
                  {selectedTemplate === 'akademisk' && 'Prioritera tydlig struktur och omfattande innehåll.'}
                  {selectedTemplate === 'modern-tech' && 'Framhäv teknisk kompetens med clean design och strukturerad layout.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}