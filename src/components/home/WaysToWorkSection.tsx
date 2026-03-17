import { useEffect, useState } from 'react';
import { Section } from '../shared/Section';
import { Container } from '../shared/Container';
import { H2, BodyText } from '../shared/Heading';
import { ProgramCard } from '../shared/Card';
import { getPrograms } from '../../lib/api';
import type { Program } from '../../types';

export function WaysToWorkSection() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrograms() {
      const data = await getPrograms();
      setPrograms(data);
      setLoading(false);
    }
    loadPrograms();
  }, []);

  return (
    <Section spacing="lg" background="secondary">
      <Container>
        <div className="text-center mb-16">
          <H2 className="mb-6">
            Ways to Work Together
          </H2>
          <BodyText className="max-w-[700px] mx-auto">
            Whether you need personalized support, structured guidance, or educational resources, there's a path that fits your needs.
          </BodyText>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-primary">Loading programs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                name={program.name}
                summary={program.summary}
                duration={program.duration}
                ctaLabel={program.cta_label}
                imageUrl={program.image_url}
                onClick={() => {
                  window.location.href = `/programs/${program.slug}`;
                }}
              />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
