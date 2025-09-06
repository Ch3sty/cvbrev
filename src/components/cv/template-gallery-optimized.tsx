'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, TrendingUp, FileText, Palette, Zap, Users, BookOpen } from 'lucide-react';
import type { CVTemplateType } from '@/lib/cv/cv-metadata';
import { getAllCVTemplates, loadTemplate } from '@/lib/cv/cv-templates';
import TemplatePreviewLazy, { TemplatePreviewPriority } from './template-preview-lazy';

interface TemplateGalleryOptimizedProps {
  selectedTemplate?: CVTemplateType | null;
  onTemplateSelect: (templateId: CVTemplateType) => void;
  onPreviewModal: (templateId: CVTemplateType) => void;
  mostUsedTemplates: Array<{ templateId: CVTemplateType; count: number }>;
  className?: string;
}

export default function TemplateGalleryOptimized({
  selectedTemplate,
  onTemplateSelect,
  onPreviewModal,
  mostUsedTemplates,
  className = ""
}: TemplateGalleryOptimizedProps) {
  const [preloadedTemplates, setPreloadedTemplates] = useState<Set<CVTemplateType>>(new Set());
  const [visibleTemplates, setVisibleTemplates] = useState<Set<CVTemplateType>>(new Set());

  // Få alla template metadata (utan generateHTML för snabb rendering)
  const allTemplates = useMemo(() => getAllCVTemplates(), []);
  
  // Prioritera populära mallar
  const priorityTemplates = useMemo(() => {
    const popular = new Set(mostUsedTemplates.map(t => t.templateId));
    return allTemplates.sort((a, b) => {
      const aIsPriority = popular.has(a.id);
      const bIsPriority = popular.has(b.id);
      
      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;
      return 0;
    });
  }, [allTemplates, mostUsedTemplates]);

  // Smart preloading när användare hovrar
  const handleTemplateHover = useCallback((templateId: CVTemplateType) => {
    if (!preloadedTemplates.has(templateId)) {
      loadTemplate(templateId)
        .then(() => {
          setPreloadedTemplates(prev => new Set(prev).add(templateId));
        })
        .catch(console.error);
    }
  }, [preloadedTemplates]);

  // Optimerad template selection med feedback
  const handleTemplateSelect = useCallback((templateId: CVTemplateType) => {
    // Ge omedelbar visuell feedback
    onTemplateSelect(templateId);
    
    // Preload template om inte redan gjort
    if (!preloadedTemplates.has(templateId)) {
      loadTemplate(templateId)
        .then(() => {
          setPreloadedTemplates(prev => new Set(prev).add(templateId));
        })
        .catch(console.error);
    }
  }, [preloadedTemplates, onTemplateSelect]);

  // Template ikoner
  const getTemplateIcon = useCallback((templateId: CVTemplateType) => {
    const icons = {
      'klassisk': FileText,
      'modern': Palette,
      'kreativ': Zap,
      'ats-optimerad': Users,
      'akademisk': BookOpen,
      'modern-tech': Zap
    };
    return icons[templateId] || FileText;
  }, []);

  // Kolla om template är populär
  const isTemplatePopular = useCallback((templateId: CVTemplateType) => {
    return mostUsedTemplates.some(usage => usage.templateId === templateId);
  }, [mostUsedTemplates]);

  return (
    <div className={`template-gallery-optimized ${className}`}>
      <div className="grid md:grid-cols-2 gap-4">
        {priorityTemplates.map((template, index) => {
          const Icon = getTemplateIcon(template.id);
          const isSelected = selectedTemplate === template.id;
          const isPriority = index < 3; // Första 3 mallar får prioritet

          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: isPriority ? index * 0.1 : (index * 0.05) + 0.3,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
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
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Icon className="h-5 w-5" />
                      {template.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <Badge variant="default" className="bg-pink-500">
                          Vald
                        </Badge>
                      )}
                      {preloadedTemplates.has(template.id) && (
                        <div className="w-2 h-2 bg-green-400 rounded-full" title="Preloaded" />
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-gray-300">
                    {template.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {isTemplatePopular(template.id) && (
                        <Badge className="bg-green-600 text-white text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Populär
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                        ATS-kompatibel
                      </Badge>
                      {isPriority && (
                        <Badge className="bg-amber-600 text-white text-xs">
                          Prioritet
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-pink-400 hover:text-pink-300 hover:bg-navy-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreviewModal(template.id);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Visa preloading status subtilt */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {template.visualFeatures?.slice(0, 2).join(', ')}
                      {template.visualFeatures && template.visualFeatures.length > 2 && '...'}
                    </span>
                    {preloadedTemplates.has(template.id) ? (
                      <span className="text-green-400">Redo</span>
                    ) : (
                      <span className="text-gray-500">Laddas...</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Performance stats (endast i development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-navy-900/50 rounded-lg border border-navy-700">
          <h3 className="text-white font-medium mb-2">Performance Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Total templates:</span>
              <span className="text-white ml-2">{allTemplates.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Preloaded:</span>
              <span className="text-green-400 ml-2">{preloadedTemplates.size}</span>
            </div>
            <div>
              <span className="text-gray-400">Priority:</span>
              <span className="text-amber-400 ml-2">3</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}