// src/components/cv/analysis/TemplateSelector.tsx
'use client';

/**
 * Mallvalet (docs/plan-paket-och-onboarding.md avsnitt 4).
 *
 * Tre mallar ingår i gratisnivån. Resten förhandsvisas i full storlek, inte
 * suddade: användaren ska se hela mallen som den blir, och först när hon
 * väljer en låst mall möta betalväggen. Suddade förhandsvisningar säljer
 * ingenting, de får mallen att se sämre ut än den är.
 *
 * Har hon ett betalt paket som inte täcker mallarna, alltså Träningspaketet, är
 * det inte en spärr utan en uppgradering, och då ritar PaywallCard FelSpar.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SIMPLE_TEMPLATES, type SimpleTemplate } from '@/lib/cv/simple-templates';
import PaywallCard from '@/components/paywall/PaywallCard';
import { GRATISRADER } from '@/components/paywall/paywall-copy';
import { scopeHasFeature, type Scope } from '@/lib/access/features';

interface TemplateSelectorProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
  /** Paketet kontot har, eller null på gratisnivån. */
  scope?: Scope | null;
  /** Spåret som valts i onboardingen. Styr vilket paket som föreslås. */
  track?: Scope | null;
}

export default function TemplateSelector({
  selectedTemplateId,
  onSelectTemplate,
  scope = null,
  track = null,
}: TemplateSelectorProps) {
  const harAllaMallar = scopeHasFeature(scope, 'cv_templates_all');
  const [lastMall, setLastMall] = useState<SimpleTemplate | null>(null);

  const handleTemplateClick = (template: SimpleTemplate) => {
    if (template.tier === 'premium' && !harAllaMallar) {
      // Betalväggen kommer i vyn, inte som en omdirigering till en annan
      // sida: hon ska kunna backa till sitt val utan att tappa flödet.
      setLastMall(template);
      return;
    }
    setLastMall(null);
    onSelectTemplate(template.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 font-semibold text-gray-900">Välj CV-mall</h4>
        <p className="text-sm text-gray-600">
          Välj en professionell mall för ditt förbättrade CV
        </p>
        {/* GR1. Raden säger vad som ingår, utan att be om något. */}
        {!harAllaMallar ? (
          <p className="mt-1 text-xs text-gray-500">{GRATISRADER.mallar}</p>
        ) : null}
      </div>

      {/* Alla mallar i samma rutnät, alla i full storlek. Skillnaden mellan
          fri och låst är ett hänglås och en etikett, aldrig en suddning. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SIMPLE_TEMPLATES.map((template) => {
          const isSelected = selectedTemplateId === template.id;
          const last = template.tier === 'premium' && !harAllaMallar;

          return (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={() => handleTemplateClick(template)}
                aria-pressed={isSelected}
                className={`w-full text-left transition-all ${
                  isSelected ? 'ring-2 ring-pink-600 ring-offset-2' : ''
                }`}
              >
                <Card
                  className={`overflow-hidden ${
                    isSelected ? 'border-2 border-pink-600' : 'border-gray-200'
                  }`}
                >
                  <div className="relative aspect-[3/4] bg-gray-100">
                    {template.imagePath ? (
                      <Image
                        src={template.imagePath}
                        alt={template.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        Förhandsvisning
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-pink-600">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    )}

                    {last && (
                      <div className="absolute left-2 top-2">
                        <Badge className="border-0 bg-gray-900/80 text-white">
                          <Lock className="mr-1 h-3 w-3" />
                          CV-paketet
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h5 className="mb-1 font-semibold text-gray-900">{template.name}</h5>
                    <p className="line-clamp-2 text-sm text-gray-600">{template.description}</p>
                  </div>
                </Card>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* PW1. Kommer först när hon faktiskt tryckt på en låst mall, så
          rubriken kan peka på just den mall hon ville ha. */}
      {lastMall ? (
        <PaywallCard
          variant="mall"
          feature="cv_templates_all"
          scope={scope}
          track={track}
          onSecondary={() => setLastMall(null)}
        />
      ) : null}
    </div>
  );
}
