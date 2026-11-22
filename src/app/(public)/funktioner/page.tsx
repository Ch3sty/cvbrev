import type { Metadata } from 'next';
import AuthRedirect from '@/components/landing/AuthRedirect';
import FunktionerSida from './FunktionerSida';
import { TEMPLATE_COUNT } from '@/lib/cv/template-antal';

export const metadata: Metadata = {
  title: 'Funktioner: alla verktyg för jobbsöket | Jobbcoach.ai',
  description:
    'Alla verktyg för jobbsöket: rekryteringstester, CV-analys, CV-mallar, personliga brev, jobbmatchning och Jobbcoachen. Byggt för svensk arbetsmarknad.',
  alternates: {
    canonical: 'https://www.jobbcoach.ai/funktioner',
  },
  openGraph: {
    title: 'Våra funktioner: alla verktyg du behöver | Jobbcoach.ai',
    // Textbeslut FUN-10, kortad till 156 tecken (P1, publikt omgång 3): "och" före
    // LinkedIn-optimering blev ett kommatecken.
    description:
      `Alla verktyg på en plattform: rekryteringstester, CV-analys, ${TEMPLATE_COUNT} CV-mallar, personliga brev, jobbmatchning, sökta tjänster, Jobbcoachen, LinkedIn-optimering.`,
    url: 'https://www.jobbcoach.ai/funktioner',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Våra funktioner: alla verktyg du behöver | Jobbcoach.ai',
    description:
      'Alla verktyg på en plattform: rekryteringstester, CV-analys, personliga brev, jobbmatchning, sökta tjänster, Jobbcoachen och LinkedIn-optimering.',
  },
};

/**
 * /funktioner, publikt omgång 3 (skissen funktioner). Metadata och h1
 * oförändrade; sektionerna bor i FunktionerSida.tsx, som har sidans skal
 * (<Sida farg="tran">).
 */
export default function FunktionerPage() {
  return (
    <>
      <AuthRedirect />
      <FunktionerSida />
    </>
  );
}
