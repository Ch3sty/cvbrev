import PremiumNavbar from '@/components/PremiumNavbar';
import { GlobalCountersProvider } from '@/contexts/GlobalCountersContext';
import AuthRedirect from '@/components/landing/AuthRedirect';
import LandingHero from '@/components/landing/LandingHero';
import MatchingShowcaseSection from '@/components/landing/MatchingShowcaseSection';
import MediaImpactSection from '@/components/landing/MediaImpactSection';
import ToolsConstellation from '@/components/landing/ToolsConstellation';
import JobbcoachenSpotlight from '@/components/landing/JobbcoachenSpotlight';
import JobMatchingShowcase from '@/components/landing/JobMatchingShowcase';
import CvTemplatesGallery from '@/components/landing/CvTemplatesGallery';
import TestsShowcase from '@/components/landing/TestsShowcase';
import DetailedPricingSection from '@/components/landing/DetailedPricingSection';
import TestimonialsRow from '@/components/landing/TestimonialsRow';
import LandingFAQ from '@/components/landing/LandingFAQ';
import RichFinalCTA from '@/components/landing/RichFinalCTA';

export default function HomePage() {
  return (
    <GlobalCountersProvider>
      <div className="min-h-screen bg-white">
        <AuthRedirect />
        <PremiumNavbar />

        <main>
          <LandingHero />
          <MatchingShowcaseSection />
          <MediaImpactSection />
          <ToolsConstellation />
          <JobbcoachenSpotlight />
          <JobMatchingShowcase />
          <CvTemplatesGallery />
          <TestsShowcase />
          <DetailedPricingSection />
          <TestimonialsRow />
          <LandingFAQ />
          <RichFinalCTA />
        </main>
      </div>
    </GlobalCountersProvider>
  );
}
