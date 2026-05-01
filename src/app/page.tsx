import PremiumNavbar from '@/components/PremiumNavbar';
import { GlobalCountersProvider } from '@/contexts/GlobalCountersContext';
import AuthRedirect from '@/components/landing/AuthRedirect';
import LandingHero from '@/components/landing/LandingHero';
import MatchingShowcaseSection from '@/components/landing/MatchingShowcaseSection';
import MediaBar from '@/components/landing/MediaBar';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import ProductShowcase from '@/components/landing/ProductShowcase';
import JobMatchingShowcase from '@/components/landing/JobMatchingShowcase';
import TestsShowcase from '@/components/landing/TestsShowcase';
import ValuePropsGrid from '@/components/landing/ValuePropsGrid';
import PricingTeaser from '@/components/landing/PricingTeaser';
import TestimonialsRow from '@/components/landing/TestimonialsRow';
import LandingFAQ from '@/components/landing/LandingFAQ';
import LandingFinalCTA from '@/components/landing/LandingFinalCTA';

export default function HomePage() {
  return (
    <GlobalCountersProvider>
      <div className="min-h-screen bg-white">
        <AuthRedirect />
        <PremiumNavbar />

        <main>
          <LandingHero />
          <MatchingShowcaseSection />
          <MediaBar />
          <FeaturesGrid />
          <ProductShowcase />
          <JobMatchingShowcase />
          <TestsShowcase />
          <ValuePropsGrid />
          <PricingTeaser />
          <TestimonialsRow />
          <LandingFAQ />
          <LandingFinalCTA />
        </main>
      </div>
    </GlobalCountersProvider>
  );
}
