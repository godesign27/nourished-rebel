import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Container } from '../components/shared/Container';
import { Section } from '../components/shared/Section';
import { Button } from '../components/shared/Button';
import { CheckCircle, ArrowRight, Mail, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

type PurchaseStatus = 'loading' | 'completed' | 'pending' | 'failed' | 'not_found';

export function PurchaseSuccessPage() {
  useDocumentMeta({
    title: 'Purchase Confirmation',
    description: 'Your purchase has been confirmed. Thank you for choosing Nourished Rebel.',
    canonicalPath: '/purchase/success',
    noindex: true,
  });
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<PurchaseStatus>('loading');
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setStatus('not_found');
      return;
    }

    let isMounted = true;
    let timeoutId: number;

    const checkPurchaseStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('program_purchases')
          .select('status')
          .eq('stripe_checkout_session_id', sessionId)
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          console.error('Error checking purchase status:', error);
          setStatus('pending');
          return;
        }

        if (!data) {
          if (pollCount < 10) {
            setPollCount(prev => prev + 1);
            timeoutId = window.setTimeout(checkPurchaseStatus, 2000);
          } else {
            setStatus('not_found');
          }
          return;
        }

        if (data.status === 'completed') {
          setStatus('completed');
        } else if (data.status === 'failed') {
          setStatus('failed');
        } else {
          if (pollCount < 15) {
            setPollCount(prev => prev + 1);
            timeoutId = window.setTimeout(checkPurchaseStatus, 2000);
          } else {
            setStatus('pending');
          }
        }
      } catch (err) {
        console.error('Error checking purchase:', err);
        if (isMounted) {
          setStatus('pending');
        }
      }
    };

    checkPurchaseStatus();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [sessionId, pollCount]);

  if (status === 'loading' || (status === 'pending' && pollCount < 15)) {
    return (
      <div className="pt-20 min-h-screen bg-background-white">
        <Section spacing="lg">
          <Container size="narrow">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-brand-100">
                <Loader2 size={32} className="text-brand-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-text-heading mb-2">
                Processing Your Purchase
              </h2>
              <p className="text-lg text-text-secondary">
                Please wait while we confirm your payment...
              </p>
            </div>
          </Container>
        </Section>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="pt-20 min-h-screen bg-background-white">
        <Section spacing="lg">
          <Container size="narrow">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-red-100">
                <AlertCircle size={48} className="text-red-600" />
              </div>

              <h1 className="text-4xl font-bold text-text-heading mb-4">
                Payment Issue
              </h1>

              <p className="text-xl text-text-secondary mb-8">
                There was an issue processing your payment. Please try again or contact support.
              </p>

              <div className="space-y-3">
                <Link to="/programs" className="block">
                  <Button className="w-full">
                    Try Again
                  </Button>
                </Link>

                <Link to="/book-session" className="block">
                  <Button variant="secondary" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </Section>
      </div>
    );
  }

  if (status === 'not_found') {
    return (
      <div className="pt-20 min-h-screen bg-background-white">
        <Section spacing="lg">
          <Container size="narrow">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-amber-100">
                <AlertCircle size={48} className="text-amber-600" />
              </div>

              <h1 className="text-4xl font-bold text-text-heading mb-4">
                Purchase Not Found
              </h1>

              <p className="text-xl text-text-secondary mb-8">
                We couldn't find this purchase. If you completed a payment, please check your email for confirmation or contact support.
              </p>

              <div className="space-y-3">
                <Link to="/programs" className="block">
                  <Button className="w-full">
                    Browse Programs
                  </Button>
                </Link>

                <Link to="/" className="block">
                  <Button variant="secondary" className="w-full">
                    Return Home
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </Section>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-background-white">
      <Section spacing="lg">
        <Container size="narrow">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-green-100">
              <CheckCircle size={48} className="text-green-600" />
            </div>

            <h1 className="text-4xl font-bold text-text-heading mb-4">
              Welcome to Your Journey!
            </h1>

            <p className="text-xl text-text-secondary mb-8">
              Your purchase was successful. We're excited to support you on your wellness path.
            </p>

            <div className="bg-accent-50 border border-accent-200 rounded-xl p-8 mb-8 text-left">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Mail size={24} className="text-accent-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-heading mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    We've sent a confirmation email with next steps and details about accessing your program.
                    If you don't see it in a few minutes, please check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link to="/programs" className="block">
                <Button className="w-full">
                  <span className="flex items-center justify-center gap-2">
                    Explore More Programs
                    <ArrowRight size={18} />
                  </span>
                </Button>
              </Link>

              <Link to="/" className="block">
                <Button variant="secondary" className="w-full">
                  Return Home
                </Button>
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-text-secondary mb-4">
                Questions about your program?
              </p>
              <Link to="/book-session">
                <Button variant="secondary" size="sm">
                  Schedule a Call
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
