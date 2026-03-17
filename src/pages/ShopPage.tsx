import { Container } from '../components/shared/Container';
import { Section } from '../components/shared/Section';
import { H1, BodyText } from '../components/shared/Heading';

export function ShopPage() {
  return (
    <div className="pt-20">
      <Section spacing="lg" background="primary">
        <Container size="narrow" className="text-center">
          <H1 className="mb-6">Shop</H1>
          <BodyText>
            Discover curated products and resources to support your wellness journey.
            This page is coming soon.
          </BodyText>
        </Container>
      </Section>
    </div>
  );
}
