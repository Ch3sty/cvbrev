import type { Metadata } from 'next';
import { GlobalCountersProvider } from '@/contexts/GlobalCountersContext';
import AuthRedirect from '@/components/landing/AuthRedirect';
import FunktionerHero from '@/components/funktioner/FunktionerHero';
import ToolsOverview from '@/components/funktioner/ToolsOverview';
import PersonligtBrevSection from '@/components/funktioner/PersonligtBrevSection';
import CvAnalysSection from '@/components/funktioner/CvAnalysSection';
import CvSkapaOchMallarSection from '@/components/funktioner/CvSkapaOchMallarSection';
import JobMatchingShowcase from '@/components/landing/JobMatchingShowcase';
import JobbcoachenSpotlight from '@/components/landing/JobbcoachenSpotlight';
import TesterSection from '@/components/funktioner/TesterSection';
import LinkedinOptimeringSection from '@/components/funktioner/LinkedinOptimeringSection';
import ComparisonSection from '@/components/funktioner/ComparisonSection';
import FunktionerFAQ from '@/components/funktioner/FunktionerFAQ';
import RichFinalCTA from '@/components/landing/RichFinalCTA';

export const metadata: Metadata = {
  title: 'Våra funktioner: alla verktyg du behöver för jobbsökningen | Jobbcoach.ai',
  description:
    'Åtta verktyg på en plattform: personliga brev, CV-analys, jobbmatchning, jobbcoach, rekryteringstester, LinkedIn-optimering, CV-skapande och åtta professionella mallar. Byggt för svenska arbetsmarknaden.',
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

export default function FunktionerPage() {
  return (
    <GlobalCountersProvider>
      <div className="min-h-screen bg-white">
        <AuthRedirect />

        <main>
          <FunktionerHero />
          <ToolsOverview />
          <PersonligtBrevSection />
          <CvAnalysSection />
          <CvSkapaOchMallarSection />

          <div id="jobbmatchning" className="scroll-mt-20">
            <JobMatchingShowcase />
          </div>

          <div id="jobbcoachen" className="scroll-mt-20">
            <JobbcoachenSpotlight />
          </div>

          <TesterSection />
          <LinkedinOptimeringSection />
          <ComparisonSection />
          <FunktionerFAQ />
          <RichFinalCTA />
        </main>
      </div>
    </GlobalCountersProvider>
  );
}
