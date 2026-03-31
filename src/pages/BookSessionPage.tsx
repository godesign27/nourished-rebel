import { Container } from '../components/shared/Container';
import { Section } from '../components/shared/Section';
import { H1, BodyText } from '../components/shared/Heading';

export function BookSessionPage() {
  return (
    <div className="pt-20">
      <Section spacing="md" background="primary">
        <Container size="narrow" className="text-center">
          <H1 className="mb-4">Book a Discovery Call</H1>
          <BodyText className="max-w-2xl mx-auto">
            Ready to take the first step toward a healthier relationship with food?
            Choose a time that works for you and let's explore how we can work together.
          </BodyText>
        </Container>
      </Section>

      <Section spacing="none" background="white">
        <Container size="wide" className="py-8">
          <div className="w-full rounded-xl overflow-hidden shadow-lg border border-background-secondary">
            <iframe
              id="nutri-q-appt-view"
              src="https://client-nta.nutri-q.com/public/calendar/e1fee14f920511f0aa3b0affd2188ebf"
              frameBorder="0"
              title="Book a Discovery Call"
              className="w-full"
              style={{ minHeight: '100vh' }}
            />
          </div>
        </Container>
      </Section>
    </div>
  );
}
