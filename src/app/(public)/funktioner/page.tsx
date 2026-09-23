import type { Metadata } from 'next';
import AuthRedirect from '@/components/landing/AuthRedirect';
import FunktionerSida from './FunktionerSida';

export const metadata: Metadata = {
  title: 'Funktioner: alla verktyg för jobbsöket | Jobbcoach.ai',
  description:
    'Åtta verktyg på en plattform: personligt brev, CV-analys, CV-mallar, jobbmatchning, jobbcoachen och rekryteringstester. Byggt för svensk arbetsmarknad.',
  alternates: {
    canonical: 'https://www.jobbcoach.ai/funktioner',
  },
  openGraph: {
    title: 'Våra funktioner: alla verktyg du behöver | Jobbcoach.ai',
    description:
      'Åtta verktyg på en plattform: personliga brev, CV-analys, jobbmatchning, jobbcoach, rekryteringstester, LinkedIn-optimering, CV-skapande och åtta professionella mallar.',
    url: 'https://www.jobbcoach.ai/funktioner',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Våra funktioner: alla verktyg du behöver | Jobbcoach.ai',
    description:
      'Åtta verktyg på en plattform: personliga brev, CV-analys, jobbmatchning, jobbcoach, rekryteringstester, LinkedIn-optimering.',
  },
};

/**
 * /funktioner i linjen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5). Metadata och h1 oförändrade.
 */
export default function FunktionerPage() {
  return (
    <div className="min-h-screen bg-mark">
      <AuthRedirect />
      <FunktionerSida />
    </div>
  );
}
