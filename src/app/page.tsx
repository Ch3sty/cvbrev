import PremiumNavbar from '@/components/PremiumNavbar';
import AuthRedirect from '@/components/landing/AuthRedirect';
import LandingHero from '@/components/landing/LandingHero';
import MediaBar from '@/components/landing/MediaBar';
import ThreeStepFlow from '@/components/landing/ThreeStepFlow';
import ProductShowcase from '@/components/landing/ProductShowcase';
import ValuePropsGrid from '@/components/landing/ValuePropsGrid';
import PricingTeaser from '@/components/landing/PricingTeaser';
import TestimonialsRow from '@/components/landing/TestimonialsRow';
import LandingFAQ from '@/components/landing/LandingFAQ';
import LandingFinalCTA from '@/components/landing/LandingFinalCTA';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <AuthRedirect />
      <PremiumNavbar />

      <main>
        <LandingHero />
        <MediaBar />
        <ThreeStepFlow />
        <ProductShowcase />
        <ValuePropsGrid />
        <PricingTeaser />
        <TestimonialsRow />
        <LandingFAQ />
        <LandingFinalCTA />
      </main>
    </div>
  );
}
