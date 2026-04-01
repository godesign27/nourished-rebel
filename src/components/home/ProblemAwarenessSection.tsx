import { Section } from '../shared/Section';
import { Container } from '../shared/Container';
import { H2, BodyText } from '../shared/Heading';

export function ProblemAwarenessSection() {
  return (
    <Section spacing="lg" background="white">
      <Container size="narrow" className="text-center">
        <H2 className="mb-6">
          There's a Better Way—And It Doesn't Involve More Rules
        </H2>

        <div className="space-y-6">
          <BodyText>
            You don't need another plan to follow. You don't need more restriction.
            You need an approach that actually makes sense for your body.
          </BodyText>

          <BodyText>
            One that cuts through the noise, gets to the root, and finally gives you
            a way forward that feels sustainable—not exhausting.
          </BodyText>
        </div>
      </Container>
    </Section>
  );
}
