import type { Metadata } from 'next';
import AuthRedirect from '@/components/landing/AuthRedirect';
import PubliktSida from '@/components/publikt/PubliktSida';
import FunktionerSida from './FunktionerSida';

export const metadata: Metadata = {
  title: 'Funktioner: alla verktyg för jobbsöket | Jobbcoach.ai',
  description:
    'Alla verktyg för jobbsöket: rekryteringstester, CV-analys, CV-mallar, personliga brev, jobbmatchning och Jobbcoachen. Byggt för svensk arbetsmarknad.',
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
 * /funktioner, publikt v2 (spec del A 5.6). Metadata och h1 oförändrade;
 * sektionerna bor i FunktionerSida.tsx.
 */
export default function FunktionerPage() {
  return (
    <PubliktSida>
      <AuthRedirect />
      <FunktionerSida />
    </PubliktSida>
  );
}
