'use client';

import PageHeader from '@/components/shell/PageHeader';

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
      title="Byt design på ditt CV"
      description="Ditt innehåll, snyggare format. Välj mall, anpassa typsnitt och ladda ner som PDF."
    />
  );
}
