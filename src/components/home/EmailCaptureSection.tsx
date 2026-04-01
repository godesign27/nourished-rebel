import { useState } from 'react';
import { Section } from '../shared/Section';
import { Container } from '../shared/Container';
import { H2, BodyText } from '../shared/Heading';

export function EmailCaptureSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    setSubmitted(true);
    setEmail('');

    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <Section spacing="lg" background="secondary">
      <Container size="narrow" className="text-center">
        <H2 className="mb-6">
          Get simple, nourishing guidance delivered to your inbox
        </H2>

        <BodyText className="mb-10 max-w-[600px] mx-auto">
          Stop following the crowd—get grounded, no-nonsense nutrition guidance delivered to your inbox.
        </BodyText>

        {submitted ? (
          <div className="bg-accent-muted/10 border border-accent-muted text-accent-muted px-6 py-4 rounded-lg max-w-md mx-auto">
            Thank you for joining! Check your inbox soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-background-secondary rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-background-primary"
                required
              />
              <button
                type="submit"
                className="px-8 py-3 bg-brand-primary text-text-inverse rounded-lg font-medium hover:bg-brand-primary-dark transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 whitespace-nowrap"
              >
                Sign Up
              </button>
            </div>
            <p className="text-body-small text-text-primary mt-4">
              No spam, just real food wisdom. Unsubscribe anytime.
            </p>
          </form>
        )}
      </Container>
    </Section>
  );
}
