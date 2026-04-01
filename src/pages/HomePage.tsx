import { HeroSection } from '../components/home/HeroSection';
import { ProblemAwarenessSection } from '../components/home/ProblemAwarenessSection';
import { ApproachSection } from '../components/home/ApproachSection';
import { WaysToWorkSection } from '../components/home/WaysToWorkSection';
import FeaturedBlogSection from '../components/home/FeaturedBlogSection';
import { ResourcesPreviewSection } from '../components/home/ResourcesPreviewSection';
import { FounderStorySection } from '../components/home/FounderStorySection';
import FeaturedContentSection from '../components/home/FeaturedContentSection';
export function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemAwarenessSection />
      <ApproachSection />
      <WaysToWorkSection />
      <FeaturedBlogSection />
      <ResourcesPreviewSection />
      <FounderStorySection />
      <FeaturedContentSection />
    </>
  );
}
