// src/app/dashboard/cv-analys/components/TemplateSelectorNew.tsx
'use client';

import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { Check, Crown, Lock, ChevronLeft, ChevronRight, Camera, Linkedin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SIMPLE_TEMPLATES, type SimpleTemplate } from '@/lib/cv/simple-templates';
import Image from 'next/image';

interface TemplateSelectorProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
  subscriptionTier: 'free' | 'premium';
}

export default function TemplateSelector({
  selectedTemplateId,
  onSelectTemplate,
  subscriptionTier
}: TemplateSelectorProps) {
  const isPremium = subscriptionTier === 'premium';
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: true
  });

  const availableTemplates = SIMPLE_TEMPLATES.filter(
    template => isPremium || template.tier === 'free'
  );

  const lockedTemplates = SIMPLE_TEMPLATES.filter(
    template => !isPremium && template.tier === 'premium'
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const handleTemplateClick = (template: SimpleTemplate) => {
    if (template.tier === 'premium' && !isPremium) {
      window.location.href = '/profile?tab=subscription';
      return;
    }
    onSelectTemplate(template.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-1">Välj CV-mall</h4>
          <p className="text-sm text-gray-600">
            {availableTemplates.length} professionella mallar tillgängliga
          </p>
        </div>

        {/* Navigation Arrows - Desktop only */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollPrev}
            className="h-9 w-9 rounded-full p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollNext}
            className="h-9 w-9 rounded-full p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {availableTemplates.map((template) => {
              const isSelected = selectedTemplateId === template.id;

              return (
                <div
                  key={template.id}
                  className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0"
                >
                  <motion.button
                    onClick={() => handleTemplateClick(template)}
                    className="w-full text-left group"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className={`overflow-hidden border-2 transition-all ${
                      isSelected
                        ? 'border-pink-500 shadow-xl shadow-pink-200/50 ring-2 ring-pink-200'
                        : 'border-gray-200 hover:border-pink-300 hover:shadow-lg'
                    }`}>
                      {/* Template Preview */}
                      <div className="relative aspect-[1/1.4] bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                        {template.imagePath ? (
                          <Image
                            src={template.imagePath}
                            alt={template.name}
                            fill
                            className="object-contain p-2 rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Preview
                          </div>
                        )}

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-pink-600 shadow-lg flex items-center justify-center animate-in zoom-in">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                        )}

                        {/* Premium Badge */}
                        {template.tier === 'premium' && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 shadow-md">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Template Info */}
                      <div className="p-4 bg-white">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h5 className="font-semibold text-gray-900 text-sm line-clamp-1">
                            {template.name}
                          </h5>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                          {template.description}
                        </p>

                        {/* Feature Badges */}
                        {template.features && (
                          <div className="flex flex-wrap gap-1.5">
                            {template.features.supportsPhoto && (
                              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                <Camera className="w-3 h-3 mr-1" />
                                Foto
                              </Badge>
                            )}
                            {template.features.supportsLinkedIn && (
                              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                <Linkedin className="w-3 h-3 mr-1" />
                                LinkedIn
                              </Badge>
                            )}
                            {template.features.columns === 2 && (
                              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                                2 kolumner
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gradient Overlays for visual feedback */}
        <div className="pointer-events-none absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent" />
      </div>

      {/* Scroll Hint - Mobile */}
      <div className="md:hidden text-center">
        <p className="text-xs text-gray-500">
          ← Svep för att se fler mallar →
        </p>
      </div>

      {/* Locked Templates */}
      {!isPremium && lockedTemplates.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" />
              <h5 className="font-semibold text-gray-900">Premium-mallar</h5>
            </div>
            <button
              onClick={() => window.location.href = '/profile?tab=subscription'}
              className="text-sm text-pink-600 hover:text-pink-700 font-medium hover:underline"
            >
              Lås upp alla →
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 opacity-75">
            {lockedTemplates.slice(0, 4).map((template) => (
              <motion.button
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                className="text-left"
                whileHover={{ scale: 1.02 }}
              >
                <Card className="overflow-hidden border-gray-200">
                  <div className="relative aspect-[1/1.4] bg-gray-100">
                    {template.imagePath && (
                      <Image
                        src={template.imagePath}
                        alt={template.name}
                        fill
                        className="object-contain p-2 filter blur-[2px]"
                      />
                    )}

                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white/90 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-gray-700" />
                        </div>
                        <p className="text-white text-xs font-medium">
                          Premium
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white">
                    <h5 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                      {template.name}
                    </h5>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </Card>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
