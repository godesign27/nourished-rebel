import { Section } from '../shared/Section';
import { Container } from '../shared/Container';
import { H2, BodyText } from '../shared/Heading';

export function ProblemAwarenessSection() {
  return (
    <Section spacing="lg" background="white">
      <Container size="narrow" className="text-center">
        <H2 className="mb-6">
          You're not alone in feeling confused
        </H2>

        <div className="space-y-6">
          <BodyText>
            Conflicting advice from every direction. Diets that work for a week, then fail.
            Symptoms that no one seems to take seriously. Frustration with your body when you're
            doing everything "right."
          </BodyText>

          <BodyText>
            You've tried eliminating foods, following meal plans, and reading every article you can find.
            But nothing feels sustainable. Nothing addresses the root of what's happening in your body.
          </BodyText>

          <BodyText className="text-heading-4 font-medium text-text-primary">
            There's a gentler, more intuitive way forward.
          </BodyText>
        </div>
      </Container>
    </Section>
  );
}
