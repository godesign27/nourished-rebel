import { Container } from '../components/shared/Container';
import { Section } from '../components/shared/Section';
import { H1, BodyText } from '../components/shared/Heading';

export function BookSessionPage() {
  return (
    <div className="pt-20">
      <Section spacing="lg" background="primary">
        <Container size="narrow" className="text-center">
          <H1 className="mb-6">Book a Session</H1>
          <BodyText>
            Schedule a discovery call or consultation to explore how we can work together.
            This page is coming soon.
          </BodyText>
        </Container>
      </Section>
    </div>
  );
}
