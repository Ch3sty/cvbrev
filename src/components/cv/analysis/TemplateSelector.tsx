// src/components/cv/analysis/TemplateSelector.tsx
'use client';

import { motion } from 'framer-motion';
import { Check, Crown, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const availableTemplates = SIMPLE_TEMPLATES.filter(
    template => isPremium || template.tier === 'free'
  );

  const lockedTemplates = SIMPLE_TEMPLATES.filter(
    template => !isPremium && template.tier === 'premium'
  );

  const handleTemplateClick = (template: SimpleTemplate) => {
    if (template.tier === 'premium' && !isPremium) {
      // Redirect to upgrade
      window.location.href = '/profile?tab=subscription';
      return;
    }
    onSelectTemplate(template.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">Välj CV-mall</h4>
        <p className="text-sm text-gray-600">
          Välj en professionell mall för ditt förbättrade CV
        </p>
      </div>

      {/* Available Templates */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableTemplates.map((template) => {
          const isSelected = selectedTemplateId === template.id;

          return (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={() => handleTemplateClick(template)}
                className={`w-full text-left transition-all ${
                  isSelected ? 'ring-2 ring-pink-600 ring-offset-2' : ''
                }`}
              >
                <Card className={`overflow-hidden ${
                  isSelected ? 'border-2 border-pink-600' : 'border-gray-200'
                }`}>
                  {/* Template Preview */}
                  <div className="relative aspect-[3/4] bg-gray-100">
                    {template.imagePath ? (
                      <Image
                        src={template.imagePath}
                        alt={template.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Preview
                      </div>
                    )}

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}

                    {/* Premium Badge */}
                    {template.tier === 'premium' && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <h5 className="font-semibold text-gray-900 mb-1">
                      {template.name}
                    </h5>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </Card>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Locked Templates (for free users) */}
      {!isPremium && lockedTemplates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-gray-400" />
            <h5 className="font-semibold text-gray-700">Premium-mallar</h5>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedTemplates.slice(0, 3).map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => handleTemplateClick(template)}
                  className="w-full text-left"
                >
                  <Card className="overflow-hidden border-gray-200 opacity-75 hover:opacity-100 transition-opacity">
                    {/* Template Preview with overlay */}
                    <div className="relative aspect-[3/4] bg-gray-100">
                      {template.imagePath ? (
                        <Image
                          src={template.imagePath}
                          alt={template.name}
                          fill
                          className="object-cover filter blur-sm"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Preview
                        </div>
                      )}

                      {/* Lock Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/90 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-gray-700" />
                          </div>
                          <p className="text-white text-sm font-medium">
                            Premium
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="p-4">
                      <h5 className="font-semibold text-gray-900 mb-1">
                        {template.name}
                      </h5>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </Card>
                </button>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => window.location.href = '/profile?tab=subscription'}
              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              Lås upp alla mallar med Premium →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
