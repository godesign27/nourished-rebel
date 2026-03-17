import { useEffect, useState } from 'react';
import { Section } from '../shared/Section';
import { Container } from '../shared/Container';
import { H2, BodyText } from '../shared/Heading';
import { ResourceCard } from '../shared/Card';
import { Button } from '../shared/Button';
import { getBlogPosts } from '../../lib/api';
import type { BlogPost } from '../../types';

export function ResourcesPreviewSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      const data = await getBlogPosts(6);
      setPosts(data);
      setLoading(false);
    }
    loadPosts();
  }, []);

  return (
    <Section spacing="lg" background="primary">
      <Container>
        <div className="text-center mb-16">
          <H2 className="mb-6">
            Explore & Learn
          </H2>
          <BodyText className="max-w-[700px] mx-auto">
            Evidence-informed articles, nourishing recipes, and practical guides to support your wellness journey.
          </BodyText>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-primary">Loading resources...</p>
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map((post) => (
                <ResourceCard
                  key={post.id}
                  title={post.title}
                  summary={post.summary}
                  category={post.category}
                  imageUrl={post.image_url}
                  publishDate={post.publish_date}
                  onClick={() => {
                    window.location.href = `/resources/${post.slug}`;
                  }}
                />
              ))}
            </div>

            <div className="text-center">
              <Button variant="secondary" href="/resources">
                View All Resources
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-primary">No resources available yet. Check back soon!</p>
          </div>
        )}
      </Container>
    </Section>
  );
}
