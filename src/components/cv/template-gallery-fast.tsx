'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, TrendingUp, FileText, Palette, Zap, Users, BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { CVTemplateType } from '@/lib/cv/cv-metadata';
import { getAllCVTemplates, loadTemplate } from '@/lib/cv/cv-templates';
import TemplatePreviewFast from './template-preview-fast';

interface TemplateGalleryFastProps {
  selectedTemplate?: CVTemplateType | null;
  onTemplateSelect: (templateId: CVTemplateType) => void;
  onPreviewModal: (templateId: CVTemplateType) => void;
  mostUsedTemplates: Array<{ templateId: CVTemplateType; count: number }>;
  cvData?: any;
  className?: string;
}

interface TemplateStatus {
  isLoaded: boolean;
  isGenerating: boolean;
  hasPreview: boolean;
  loadTime?: number;
  error?: string;
}

export default function TemplateGalleryFast({
  selectedTemplate,
  onTemplateSelect,
  onPreviewModal,
  mostUsedTemplates,
  cvData,
  className = ""
}: TemplateGalleryFastProps) {
  const [templateStatuses, setTemplateStatuses] = useState<Record<CVTemplateType, TemplateStatus>>({} as any);
  const [previewMode, setPreviewMode] = useState<'cards' | 'previews'>('cards');

  const allTemplates = useMemo(() => getAllCVTemplates(), []);
  
  // Prioritera templates baserat på popularitet och framgång
  const prioritizedTemplates = useMemo(() => {
    const popularSet = new Set(mostUsedTemplates.map(t => t.templateId));
    
    return allTemplates.sort((a, b) => {
      // Prioritetsordning: Populär -> Fungerar bra -> Alfabetisk
      const aPopular = popularSet.has(a.id);
      const bPopular = popularSet.has(b.id);
      
      if (aPopular && !bPopular) return -1;
      if (!aPopular && bPopular) return 1;
      
      // Sekundär sortering baserat på prestanda
      const aStatus = templateStatuses[a.id];
      const bStatus = templateStatuses[b.id];
      
      if (aStatus?.hasPreview && !bStatus?.hasPreview) return -1;
      if (!aStatus?.hasPreview && bStatus?.hasPreview) return 1;
      
      return a.name.localeCompare(b.name);
    });
  }, [allTemplates, mostUsedTemplates, templateStatuses]);

  // Uppdatera template status
  const updateTemplateStatus = useCallback((templateId: CVTemplateType, status: Partial<TemplateStatus>) => {
    setTemplateStatuses(prev => ({
      ...prev,
      [templateId]: { ...prev[templateId], ...status }
    }));
  }, []);

  // Preload templates strategiskt
  const handleTemplateHover = useCallback((templateId: CVTemplateType) => {
    const status = templateStatuses[templateId];
    if (!status?.isLoaded) {
      updateTemplateStatus(templateId, { isGenerating: true });
      
      loadTemplate(templateId)
        .then(() => {
          updateTemplateStatus(templateId, { 
            isLoaded: true, 
            isGenerating: false 
          });
        })
        .catch((error) => {
          updateTemplateStatus(templateId, { 
            isGenerating: false, 
            error: error.message 
          });
        });
    }
  }, [templateStatuses, updateTemplateStatus]);

  // Template selection med feedback
  const handleTemplateSelect = useCallback((templateId: CVTemplateType) => {
    onTemplateSelect(templateId);
    
    // Preload template om inte redan laddat
    if (!templateStatuses[templateId]?.isLoaded) {
      loadTemplate(templateId).catch(console.error);
    }
  }, [templateStatuses, onTemplateSelect]);

  // Preview ready callback
  const handlePreviewReady = useCallback((templateId: CVTemplateType, isReady: boolean) => {
    updateTemplateStatus(templateId, { hasPreview: isReady });
  }, [updateTemplateStatus]);

  // Template ikoner
  const getTemplateIcon = useCallback((templateId: CVTemplateType) => {
    const icons: Record<CVTemplateType, any> = {
      'klassisk': FileText,
      'modern': Palette,
      'minimalistisk': TrendingUp,
      'kreativ': Zap,
      'ats-optimerad': Users,
      'akademisk': BookOpen,
      'modern-tech': Zap
    };
    return icons[templateId] || FileText;
  }, []);

  // Status badge för template
  const getStatusBadge = useCallback((templateId: CVTemplateType) => {
    const status = templateStatuses[templateId];
    
    if (status?.error) {
      return (
        <Badge variant="outline" className="text-red-400 border-red-500">
          <AlertCircle className="w-3 h-3 mr-1" />
          Fel
        </Badge>
      );
    }
    
    if (status?.hasPreview) {
      return (
        <Badge variant="outline" className="text-green-400 border-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Redo
        </Badge>
      );
    }
    
    if (status?.isGenerating) {
      return (
        <Badge variant="outline" className="text-amber-400 border-amber-500">
          <Clock className="w-3 h-3 mr-1 animate-spin" />
          Laddar
        </Badge>
      );
    }
    
    return null;
  }, [templateStatuses]);

  const isTemplatePopular = useCallback((templateId: CVTemplateType) => {
    return mostUsedTemplates.some(usage => usage.templateId === templateId);
  }, [mostUsedTemplates]);

  return (
    <div className={`template-gallery-fast ${className}`}>
      {/* View toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button
            variant={previewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('cards')}
            className="text-sm"
          >
            Kort
          </Button>
          <Button
            variant={previewMode === 'previews' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('previews')}
            className="text-sm"
          >
            Förhandsvisning
          </Button>
        </div>
        
        {/* Performance stats */}
        <div className="text-sm text-gray-400">
          {Object.values(templateStatuses).filter(s => s.hasPreview).length} av {allTemplates.length} redo
        </div>
      </div>

      {previewMode === 'cards' ? (
        // Cards view - snabbt och responsivt
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prioritizedTemplates.map((template, index) => {
            const Icon = getTemplateIcon(template.id);
            const isSelected = selectedTemplate === template.id;
            const isPriority = index < 3;
            const status = templateStatuses[template.id];

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: isPriority ? index * 0.1 : (index * 0.05) + 0.2
                }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg bg-navy-700 border-navy-600 ${
                    isSelected 
                      ? 'ring-2 ring-pink-500 shadow-lg' 
                      : 'hover:shadow-md hover:border-navy-500'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                  onMouseEnter={() => handleTemplateHover(template.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-white text-sm">
                        <Icon className="h-4 w-4" />
                        {template.name}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        {isSelected && (
                          <Badge variant="default" className="bg-pink-500 text-xs">
                            Vald
                          </Badge>
                        )}
                        {getStatusBadge(template.id)}
                      </div>
                    </div>
                    <CardDescription className="text-gray-300 text-xs">
                      {template.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {isTemplatePopular(template.id) && (
                          <Badge className="bg-green-600 text-white text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Populär
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                          ATS-OK
                        </Badge>
                        {isPriority && (
                          <Badge className="bg-amber-600 text-white text-xs">
                            Top 3
                          </Badge>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-pink-400 hover:text-pink-300 hover:bg-navy-600 h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewModal(template.id);
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {template.visualFeatures?.slice(0, 2).join(', ')}
                      </span>
                      {status?.loadTime && (
                        <span className="text-green-400">
                          {status.loadTime}ms
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        // Preview view - visar faktiska förhandsvisningar
        <div className="space-y-6">
          {prioritizedTemplates.map((template, index) => {
            const isSelected = selectedTemplate === template.id;
            const isPriority = index < 3;

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`border border-navy-600 rounded-lg p-6 ${
                  isSelected ? 'ring-2 ring-pink-500 bg-navy-800/50' : 'bg-navy-800'
                }`}
              >
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Template info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {React.createElement(getTemplateIcon(template.id), { 
                        className: "h-5 w-5 text-pink-400" 
                      })}
                      <h3 className="text-lg font-semibold text-white">
                        {template.name}
                      </h3>
                    </div>
                    
                    <p className="text-gray-300 text-sm">
                      {template.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {isTemplatePopular(template.id) && (
                        <Badge className="bg-green-600 text-white">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Populär
                        </Badge>
                      )}
                      {isPriority && (
                        <Badge className="bg-amber-600 text-white">
                          Rekommenderad
                        </Badge>
                      )}
                      {getStatusBadge(template.id)}
                    </div>
                    
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleTemplateSelect(template.id)}
                        className={`w-full ${
                          isSelected 
                            ? 'bg-pink-600 hover:bg-pink-700' 
                            : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'
                        }`}
                        disabled={isSelected}
                      >
                        {isSelected ? 'Vald mall' : 'Välj denna mall'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPreviewModal(template.id)}
                        className="w-full border-navy-600 text-gray-300 hover:bg-navy-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Fullscreen förhandsvisning
                      </Button>
                    </div>
                  </div>
                  
                  {/* Fast preview */}
                  <div className="lg:col-span-2">
                    <TemplatePreviewFast
                      templateId={template.id}
                      cvData={cvData}
                      onPreviewReady={(isReady) => handlePreviewReady(template.id, isReady)}
                      priority={isPriority ? 'high' : 'medium'}
                      className="max-w-md mx-auto"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Performance insights */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-navy-900/50 rounded-lg border border-navy-700">
          <h3 className="text-white font-medium mb-3">Performance Dashboard</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Templates:</span>
              <span className="text-white ml-2">{allTemplates.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Loaded:</span>
              <span className="text-green-400 ml-2">
                {Object.values(templateStatuses).filter(s => s.isLoaded).length}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Ready:</span>
              <span className="text-blue-400 ml-2">
                {Object.values(templateStatuses).filter(s => s.hasPreview).length}
              </span>
            </div>
            <div>
              <span className="text-gray-400">View:</span>
              <span className="text-pink-400 ml-2">{previewMode}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}