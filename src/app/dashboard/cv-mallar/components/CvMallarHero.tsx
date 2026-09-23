'use client';

import PageHeader from '@/components/shell/PageHeader';
import { IlluScenMallar } from '@/components/illustrations/PriserScener';
import { TEMPLATE_COUNT } from '@/lib/cv/simple-templates';

/**
 * Sidhuvudet för CV-mallar. Sidans enda h1.
 *
 * Bort: ikonen i 80 px, versalerad etikett i orange, de gröna chipsen och
 * de låsta höjderna som fanns för att hålla emot typsnittsbytet. PageHeader
 * har fast form, så inget hoppar när Inter landar.
 */
export default function CvMallarHero() {
  return (
    <PageHeader
      eyebrow="CV-mallar"
      title="Samma innehåll, en mall rekryteraren läser."
      description={`Välj ett CV, välj en av ${TEMPLATE_COUNT} mallar, ladda ner som PDF. Alla klarar rekryteringssystemens läsning.`}
      scene={<IlluScenMallar className="h-auto w-full" />}
    />
  );
}
