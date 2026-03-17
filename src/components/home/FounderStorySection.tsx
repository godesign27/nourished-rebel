import { Section } from '../shared/Section';
import { Container } from '../shared/Container';
import { H2, BodyText } from '../shared/Heading';
import { Button } from '../shared/Button';

export function FounderStorySection() {
  return (
    <Section spacing="lg" background="white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <img
              src="https://images.pexels.com/photos/3768894/pexels-photo-3768894.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Nourished Rebel founder"
              className="w-full h-auto rounded-card-lg shadow-card"
            />
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <H2>
              Hi, I'm here because I've been where you are
            </H2>

            <BodyText>
              For years, I struggled with gut issues that no one could explain. Conventional medicine offered
              band-aid solutions that never addressed the root cause. I was told my symptoms were "just stress"
              or "all in my head."
            </BodyText>

            <BodyText>
              Frustrated and exhausted, I dove into nutrition research, studied holistic approaches, and slowly
              pieced together what my body was trying to tell me. It wasn't about following another diet or
              eliminating more foods. It was about understanding my body's signals and nourishing it with
              intention and compassion.
            </BodyText>

            <BodyText>
              Now, I help others find that clarity sooner — without years of confusion, restriction, or
              self-doubt. Because everyone deserves to feel at home in their body.
            </BodyText>

            <div>
              <Button variant="text" href="/about">
                Read My Full Story →
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
