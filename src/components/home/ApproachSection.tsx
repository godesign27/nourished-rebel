import { Apple, Heart, TrendingUp } from 'lucide-react';
import { Section } from '../shared/Section';
import { Container } from '../shared/Container';
import { H2, BodyText } from '../shared/Heading';
import { PillarCard } from '../shared/Card';

export function ApproachSection() {
  const pillars = [
    {
      icon: <Apple size={32} strokeWidth={1.5} />,
      title: 'Real Food Foundations',
      description: 'Build your wellness on whole, nourishing foods that support your body naturally — without restrictive rules or elimination protocols.',
    },
    {
      icon: <Heart size={32} strokeWidth={1.5} />,
      title: 'Gut-Centered Healing',
      description: 'Address digestive health at its root through gentle, evidence-informed practices that honor your body unique needs.',
    },
    {
      icon: <TrendingUp size={32} strokeWidth={1.5} />,
      title: 'Personalized, Sustainable Change',
      description: 'Move beyond one-size-fits-all advice to discover eating patterns and lifestyle shifts that work for your life, long-term.',
    },
  ];

  return (
    <Section spacing="lg" background="white">
      <Container>
        <div className="text-center mb-16">
          <H2 className="mb-6">
            The Nourished Rebel Approach
          </H2>
          <BodyText className="max-w-[700px] mx-auto mb-6">
            This is where you opt out of the noise, the trends, and the one-size-fits-all BS.
          </BodyText>
          <BodyText className="max-w-[700px] mx-auto font-medium text-text-primary">
            No extremes. No perfection. No blindly following rules that were never made for you.
          </BodyText>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar) => (
            <PillarCard
              key={pillar.title}
              icon={pillar.icon}
              title={pillar.title}
              description={pillar.description}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
