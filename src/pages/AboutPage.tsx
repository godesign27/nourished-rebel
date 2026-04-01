import { useState, useEffect } from 'react';
import { Container } from '../components/shared/Container';
import { Section } from '../components/shared/Section';
import { supabase } from '../lib/supabase';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import DOMPurify from 'dompurify';

interface AboutPageContent {
  id: string;
  image_url: string;
  content: string;
}

export function AboutPage() {
  useDocumentMeta({
    title: 'About',
    description: 'Learn about Nourished Rebel and our mission to empower people to reclaim their health through real food, holistic nutrition, and self-trust.',
    canonicalPath: '/about',
  });
  const [content, setContent] = useState<AboutPageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('about_page_content')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setContent(data);
      }
    } catch (err) {
      console.error('Error fetching about page content:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {content?.image_url && (
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
          <img
            src={content.image_url}
            alt="About"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
        </div>
      )}

      <Section spacing="lg" background="primary">
        <Container size="narrow">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(content?.content || '<p>Content coming soon...</p>')
            }}
          />
        </Container>
      </Section>
    </div>
  );
}
