import { Button } from '../shared/Button';
import { H1, BodyText } from '../shared/Heading';

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: 'url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30" />

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <H1 className="text-white mb-6">
          Reclaim your health with real food, not rules
        </H1>

        <BodyText className="text-white/95 mb-10 max-w-[700px] mx-auto text-lg md:text-xl">
          Holistic nutrition guidance that helps you listen to your body, heal your gut, and build sustainable wellness — without diets or extremes.
        </BodyText>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="primary" href="/#quiz">
            Start Your Journey
          </Button>
          <Button variant="secondary" href="/book-session" className="bg-white/10 border-white text-white hover:bg-white hover:text-text-primary backdrop-blur-sm">
            Book a Session
          </Button>
        </div>
      </div>
    </section>
  );
}
