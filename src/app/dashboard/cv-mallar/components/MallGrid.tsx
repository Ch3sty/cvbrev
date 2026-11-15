'use client';

/**
 * Steg 2 på CV-mallar: riktiga miniatyrer i stället för en rullista
 * (docs/design/analys-visuell-linje-2026-09-22.html, avsnitt 4).
 *
 * Sex mallar syns (den valda alltid med), sedan "Alla 41" som fäller ut hela
 * galleriet på samma yta. Miniatyrerna är MallMiniatyr, samma komponent som
 * artiklarnas mallvisning. Mallar utanför paketet står i insunken med lås,
 * som förut, men går att välja för att förhandsvisa; nedladdningen är det
 * som spärras.
 */

import { useMemo, useState } from 'react';
import { MallMiniatyr } from '@/components/cv/MallMiniatyrer';
import { SIMPLE_TEMPLATES, TEMPLATE_COUNT } from '@/lib/cv/simple-templates';
import { paketKort } from '@/lib/plans/plans';
import { harWordVersion } from '@/lib/cv/template-antal';

interface MallGridProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  isPremium: boolean;
}

/**
 * De sex som syns först (skissen för CV som Word, avsnitt 3b): de tre fria
 * och tre premiummallar som också finns som Word, så att både gratisnivån och
 * Word går att upptäcka utan att fälla ut galleriet.
 */
const FORSTA_IDS = ['norrsken', 'student-startup', 'tidlos-formell', 'myndighet', 'stack-developer', 'sidebar-icons'];
const SYNLIGA = FORSTA_IDS.length;
const FORSTA = FORSTA_IDS.map((id) => SIMPLE_TEMPLATES.find((t) => t.id === id)).filter(
  (t): t is (typeof SIMPLE_TEMPLATES)[number] => Boolean(t)
);

export default function MallGrid({ selectedTemplate, onTemplateSelect, isPremium }: MallGridProps) {
  const [alla, setAlla] = useState(false);

  const lista = useMemo(() => {
    if (alla) return SIMPLE_TEMPLATES;
    const forsta = FORSTA;
    if (forsta.some((t) => t.id === selectedTemplate)) return forsta;
    const vald = SIMPLE_TEMPLATES.find((t) => t.id === selectedTemplate);
    return vald ? [vald, ...forsta.slice(0, SYNLIGA - 1)] : forsta;
  }, [alla, selectedTemplate]);

  return (
    <div>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6" role="radiogroup" aria-label="Välj mall">
        {lista.map((t) => {
          const vald = t.id === selectedTemplate;
          const last = t.tier === 'premium' && !isPremium;
          return (
            <li key={t.id}>
              <button
                type="button"
                role="radio"
                aria-checked={vald}
                aria-label={`${t.name}${harWordVersion(t.id) ? '. Finns också som Word' : ''}${last ? `. Låst, ingår i ${paketKort()}.` : ''}`}
                onClick={() => onTemplateSelect(t.id)}
                className="block w-full rounded-lg text-left"
              >
                <MallMiniatyr
                  mall={t}
                  vald={vald}
                  last={last}
                  under={t.tier === 'free' ? 'Gratis' : last ? paketKort() : undefined}
                  etikett={harWordVersion(t.id) ? 'Word' : undefined}
                />
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => setAlla((v) => !v)}
        aria-expanded={alla}
        className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
      >
        {alla ? 'Visa färre' : `Alla ${TEMPLATE_COUNT} mallar`}
      </button>
    </div>
  );
}
