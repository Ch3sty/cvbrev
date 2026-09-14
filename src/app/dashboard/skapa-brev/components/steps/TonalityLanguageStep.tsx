'use client';

/**
 * Steg 4: hur ska brevet låta? (docs/design/rod-trad-preview.html, ram 3)
 *
 * Det rekommenderade valet är ett featured-kort med marginalplatta (vyns
 * enda), "Rekommenderas" i bläck och beskrivningen bredvid. De manuella
 * tonerna är plain-kort med naken ikon 24. Språket är ett segment. Val
 * markeras med kant ink-1 och bock, aldrig med orange yta.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import ChoiceCard from '@/components/shell/ChoiceCard';
import Segment from '@/components/shell/Segment';
import MarginPlate from '@/components/shell/MarginPlate';
import { IlluPlattaSmartTon } from '@/components/illustrations/TradenScener';
import {
  IkonProfessionell,
  IkonEntusiastisk,
  IkonKreativ,
  IkonSjalvsaker,
  IkonBalanserad,
  type IkonProps,
} from '@/components/illustrations/Ikoner';
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry';

type Tonality =
  | 'professional'
  | 'enthusiastic'
  | 'creative'
  | 'confident'
  | 'balanced'
  | 'auto';
type Language = 'sv' | 'en';

interface TonalityLanguageStepProps {
  tonality: Tonality;
  language: Language;
  onTonalityChange: (tonality: Tonality) => void;
  onLanguageChange: (language: Language) => void;
  isPremium: boolean;
  isActive: boolean;
  registerRef?: (el: HTMLElement | null) => void;
}

const STANDARD_TONES: {
  id: Tonality;
  label: string;
  description: string;
  icon: (props: IkonProps) => React.JSX.Element;
  recommendedFor: string;
}[] = [
  {
    id: 'professional',
    label: 'Professionell',
    description: 'Saklig och formell. Går rakt på kraven.',
    icon: IkonProfessionell,
    recommendedFor: 'Traditionella branscher',
  },
  {
    id: 'enthusiastic',
    label: 'Entusiastisk',
    description: 'Varm, energisk. Visar att du vill hit.',
    icon: IkonEntusiastisk,
    recommendedFor: 'Kreativa yrken, startups',
  },
  {
    id: 'creative',
    label: 'Kreativ',
    description: 'Personlig och oväntad. Vågar sticka ut.',
    icon: IkonKreativ,
    recommendedFor: 'Design, marknadsföring',
  },
  {
    id: 'confident',
    label: 'Självsäker',
    description: 'Leder med dina resultat, i siffror.',
    icon: IkonSjalvsaker,
    recommendedFor: 'Chefsroller, sälj',
  },
  {
    id: 'balanced',
    label: 'Balanserad',
    description: 'Saklig men varm. Passar de flesta.',
    icon: IkonBalanserad,
    recommendedFor: 'De flesta tjänster',
  },
];

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'sv', label: 'Svenska' },
  { value: 'en', label: 'English' },
];

export default function TonalityLanguageStep({
  tonality,
  language,
  onTonalityChange,
  onLanguageChange,
  isPremium,
  registerRef,
}: TonalityLanguageStepProps) {
  useEffect(() => {
    if (isPremium && tonality === 'balanced') {
      onTonalityChange('auto');
    }
  }, [isPremium]);

  const isAutoSelected = tonality === 'auto';

  return (
    <section ref={registerRef} data-flow-section="tone" className="space-y-4">
      <div role="radiogroup" aria-label="Ton" className="space-y-2">
        <ChoiceCard
          variant="featured"
          selected={isAutoSelected}
          disabled={!isPremium}
          onSelect={() => {
            if (isPremium) onTonalityChange('auto');
          }}
          eyebrow={isPremium ? 'Rekommenderas' : undefined}
          title="Vi väljer ton åt dig"
          description="Vi läser annonsens språk och bransch och skriver brevet i den ton arbetsgivaren själv använder."
          meta={isPremium ? 'Läser kraven · Branschens ton' : 'Ingår i Premium'}
          leading={
            <MarginPlate>
              <IlluPlattaSmartTon size={48} />
            </MarginPlate>
          }
        />

        {!isPremium ? (
          <p className="text-meta text-ink-3">
            Automatiskt tonval ingår i Premium.{' '}
            <Link
              href={PREMIUM_HREF}
              className="font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
            >
              Se vad Premium kostar
            </Link>
          </p>
        ) : null}

        <p className="pt-2 text-sm font-medium text-ink-3">Eller välj själv</p>

        {STANDARD_TONES.map((tone) => {
          const Icon = tone.icon;
          return (
            <ChoiceCard
              key={tone.id}
              variant="plain"
              selected={tonality === tone.id}
              onSelect={() => onTonalityChange(tone.id)}
              title={tone.label}
              description={tone.description}
              meta={tone.recommendedFor}
              leading={<Icon size={24} />}
            />
          );
        })}
      </div>

      <div className="pt-1">
        <p className="text-sm font-medium text-ink-1">Brevets språk</p>
        <Segment
          className="mt-2"
          label="Språk"
          value={language}
          onChange={onLanguageChange}
          options={LANGUAGES}
        />
      </div>
    </section>
  );
}
