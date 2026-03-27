import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container } from '../components/shared/Container';
import { Section } from '../components/shared/Section';
import { H1, H2, BodyText } from '../components/shared/Heading';
import { Button } from '../components/shared/Button';
import { ArrowLeft, Phone, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sanitizeHtml } from '../utils/sanitize';
import { useAuth } from '../contexts/AuthContext';
import type { Program, ProgramVariant } from '../types';

export function ProgramDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [program, setProgram] = useState<Program | null>(null);
  const [variants, setVariants] = useState<ProgramVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProgramVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const variantDetailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProgram();
  }, [slug]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('canceled') === 'true') {
      setCheckoutError('Checkout was canceled. You can try again when ready.');
      window.history.replaceState({}, '', `/programs/${slug}`);
    }
  }, [slug]);

  const loadProgram = async () => {
    if (!slug) return;

    try {
      const { data: programData, error: programError } = await supabase
        .from('programs')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (programError) throw programError;
      if (!programData) {
        setIsLoading(false);
        return;
      }

      setProgram(programData);

      const { data: variantsData, error: variantsError } = await supabase
        .from('program_variants')
        .select('*')
        .eq('program_id', programData.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (variantsError) throw variantsError;
      setVariants(variantsData || []);

      if (variantsData && variantsData.length > 0) {
        setSelectedVariant(variantsData[0]);
      }
    } catch (error) {
      console.error('Error loading program:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartProgram = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/programs/${slug}` } });
      return;
    }

    if (!program) return;

    if (variants.length > 0 && !selectedVariant) {
      setCheckoutError('Please select a program option to continue.');
      return;
    }

    if (!selectedVariant && program.price == null) {
      setCheckoutError('This program does not have pricing configured. Please contact support.');
      return;
    }

    setIsProcessingCheckout(true);
    setCheckoutError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login', { state: { from: `/programs/${slug}` } });
        return;
      }

      const currentUrl = window.location.origin;
      const successUrl = `${currentUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${currentUrl}/programs/${slug}?canceled=true`;

      const requestBody = {
        programId: program.id,
        variantId: selectedVariant?.id || null,
        successUrl,
        cancelUrl,
      };
      console.log('Checkout request:', requestBody);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Checkout error response:', error);
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(
        error instanceof Error ? error.message : 'Failed to start checkout. Please try again.'
      );
      setIsProcessingCheckout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen">
        <Section spacing="lg">
          <Container>
            <p className="text-center text-text-secondary">Loading program...</p>
          </Container>
        </Section>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="pt-20 min-h-screen">
        <Section spacing="lg">
          <Container size="narrow" className="text-center">
            <H1 className="mb-4">Program Not Found</H1>
            <BodyText className="mb-8">
              The program you're looking for doesn't exist or is no longer available.
            </BodyText>
            <Link to="/programs">
              <Button>View All Programs</Button>
            </Link>
          </Container>
        </Section>
      </div>
    );
  }

  const variantsWithDetails = variants.filter((v) => v.detailed_description);

  const displayPrice = selectedVariant
    ? `$${Number(selectedVariant.price).toFixed(2)}`
    : program.price
      ? `$${Number(program.price).toFixed(2)}`
      : null;

  return (
    <div className="pt-20">
      <section className="pt-4 pb-2 bg-background-white">
        <Container>
          <Link
            to="/programs"
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Programs
          </Link>
        </Container>
      </section>

      <Section spacing="lg" background="white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              {program.image_url && (
                <div className="rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={program.image_url}
                    alt={program.name}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {program.description && (
                <div className="mt-10">
                  <H2 className="mb-6">About This Program</H2>
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(program.description) }}
                  />
                </div>
              )}

              {variantsWithDetails.length > 0 && (
                <div ref={variantDetailRef} className="mt-10 scroll-mt-24">
                  {variantsWithDetails.map((variant, idx) => (
                    <div
                      key={variant.id}
                      id={`variant-${variant.id}`}
                      className={`${idx > 0 ? 'mt-10' : ''} scroll-mt-24`}
                    >
                      <div className={`${idx > 0 ? 'border-t border-gray-200 pt-10' : ''}`}>
                        <div className="flex items-center gap-3 mb-6">
                          <H2 className="!mb-0">{variant.name}</H2>
                          {selectedVariant?.id === variant.id && (
                            <span className="px-2.5 py-1 bg-brand-100 text-brand-700 text-xs font-semibold rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                        <div
                          className="prose prose-lg max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(variant.detailed_description!),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-brand-100 text-brand-700 text-sm font-medium rounded-full mb-4">
                {program.category}
              </span>

              <h1 className="text-3xl lg:text-4xl font-bold text-text-heading mb-2">
                {program.name}
              </h1>

              {displayPrice && (
                <p className="text-2xl font-bold text-text-heading mb-6">
                  {displayPrice}
                  {selectedVariant?.billing_frequency && selectedVariant.billing_frequency !== 'one-time' && (
                    <span className="text-base font-normal text-text-secondary ml-1">
                      / {selectedVariant.billing_frequency}
                    </span>
                  )}
                </p>
              )}

              {variants.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-text-heading mb-3">Available Options:</p>
                  <div className="space-y-2">
                    {variants.map((variant) => {
                      const isSelected = selectedVariant?.id === variant.id;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => {
                            setSelectedVariant(variant);
                            if (variant.detailed_description) {
                              setTimeout(() => {
                                const el = document.getElementById(`variant-${variant.id}`);
                                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 100);
                            }
                          }}
                          className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-150 text-left ${
                            isSelected
                              ? 'border-text-heading bg-brand-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSelected
                                  ? 'border-text-heading bg-text-heading'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-text-heading">{variant.name}</span>
                              {variant.description && (
                                <p className="text-sm text-text-secondary mt-0.5">{variant.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-1">
                                {variant.session_count && (
                                  <span className="text-xs text-text-secondary">
                                    {variant.session_count} sessions
                                  </span>
                                )}
                                {variant.duration_weeks && (
                                  <span className="text-xs text-text-secondary">
                                    {variant.duration_weeks} weeks
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-text-heading whitespace-nowrap ml-4">
                            ${Number(variant.price).toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <BodyText className="mb-6 leading-relaxed">{program.summary}</BodyText>

              {program.ideal_participant && (
                <div className="bg-accent-50 border-l-4 border-accent-500 p-4 rounded-r mb-6">
                  <p className="text-sm font-semibold text-text-heading mb-1">Ideal for:</p>
                  <p className="text-sm text-text-primary">{program.ideal_participant}</p>
                </div>
              )}

              <div className="flex items-center gap-6 text-sm text-text-secondary mb-8">
                <div>
                  <span className="font-medium text-text-heading">Duration:</span> {program.duration}
                </div>
              </div>

              {checkoutError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{checkoutError}</p>
                </div>
              )}

              <Button
                className="w-full py-4 text-lg"
                onClick={handleStartProgram}
                disabled={isProcessingCheckout}
              >
                {isProcessingCheckout ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Start Program'
                )}
              </Button>

              {!user && (
                <p className="text-sm text-text-secondary text-center mt-3">
                  You'll be asked to sign in to continue
                </p>
              )}
            </div>
          </div>
        </Container>
      </Section>

      <section className="py-10 md:py-16 bg-terracotta-200">
        <Container size="narrow">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-terracotta-900 mb-2">
              Not sure which option is right for you?
            </h3>
            <p className="text-terracotta-800 mb-6">
              Schedule a free discovery call and we'll help you find the perfect fit for your goals.
            </p>
            <Link to="/book-session">
              <Button className="inline-flex items-center gap-2 px-8 py-3">
                <Phone size={18} />
                Book a Discovery Call
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
