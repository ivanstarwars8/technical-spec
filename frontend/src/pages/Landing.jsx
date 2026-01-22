import { LandingHeader } from '../components/landing/LandingHeader';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingBenefits } from '../components/landing/LandingBenefits';
import { LandingFeatures } from '../components/landing/LandingFeatures';
import { LandingAIShowcase } from '../components/landing/LandingAIShowcase';
import { LandingPricing } from '../components/landing/LandingPricing';
import { LandingCTA } from '../components/landing/LandingCTA';
import { LandingFooter } from '../components/landing/LandingFooter';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingBenefits />
        <LandingFeatures />
        <LandingAIShowcase />
        <LandingPricing />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Landing;
