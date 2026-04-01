import { Calendar, Clock, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Container } from '../components/shared/Container';
import { Section } from '../components/shared/Section';
import { H1, H2, BodyText } from '../components/shared/Heading';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const SCHEDULER_URL = 'https://client-nta.nutri-q.com/public/calendar/e1fee14f920511f0aa3b0affd2188ebf';

const steps = [
  {
    icon: Calendar,
    title: 'Pick a Time',
    description: 'Choose a date and time that fits your schedule from the available slots.',
  },
  {
    icon: MessageCircle,
    title: 'Share Your Story',
    description: 'Tell me a bit about where you are and what you are hoping to achieve.',
  },
  {
    icon: Sparkles,
    title: 'Get a Plan',
    description: 'Walk away with clarity on your next steps and how we can work together.',
  },
];

export function BookSessionPage() {
  useDocumentMeta({
    title: 'Book a Discovery Call',
    description: 'Schedule a free discovery call with Nourished Rebel to discuss your health goals and find out if holistic nutrition coaching is right for you.',
    canonicalPath: '/book-session',
  });

  return (
    <div className="pt-20">
      <Section spacing="lg" background="primary">
        <Container size="narrow" className="text-center">
          <H1 className="mb-6">Book a Discovery Call</H1>
          <BodyText className="max-w-2xl mx-auto text-lg leading-relaxed mb-10">
            This free call is your chance to share where you are, ask questions, and
            find out if we are the right fit to work together. No pressure, no obligations
            -- just an honest conversation about your health goals.
          </BodyText>
          <a
            href={SCHEDULER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl hover:bg-brand-primary/90 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Calendar size={22} />
            Schedule Your Free Call
            <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </Container>
      </Section>

      <Section spacing="lg" background="white">
        <Container size="default">
          <H2 className="text-center mb-12">How It Works</H2>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative text-center p-8 rounded-2xl bg-background-primary border border-background-secondary hover:shadow-lg transition-all duration-300"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-terracotta-100 flex items-center justify-center text-terracotta-600">
                  <step.icon size={28} />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">{step.title}</h3>
                <p className="text-text-secondary leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="lg" background="secondary">
        <Container size="narrow" className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-terracotta-600">
            <Clock size={20} />
            <span className="font-medium text-sm uppercase tracking-wider">Complimentary</span>
          </div>
          <H2 className="mb-4">Ready to Get Started?</H2>
          <BodyText className="max-w-xl mx-auto mb-8">
            Your discovery call is completely free. It is a relaxed, no-pressure conversation
            to see how I can support you on your wellness journey.
          </BodyText>
          <a
            href={SCHEDULER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl hover:bg-brand-primary/90 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Book Now
            <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </Container>
      </Section>
    </div>
  );
}
