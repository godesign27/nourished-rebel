import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Container } from '../shared/Container';
import { Section } from '../shared/Section';
import { H2 } from '../shared/Heading';
import BlogPostCard from '../blog/BlogPostCard';
import { Button } from '../shared/Button';
import { getFeaturedBlogPosts } from '../../lib/api';
import type { BlogPost } from '../../types';

export default function FeaturedBlogSection() {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedPosts();
  }, []);

  const loadFeaturedPosts = async () => {
    try {
      const posts = await getFeaturedBlogPosts();
      setFeaturedPosts(posts);
    } catch (error) {
      console.error('Error loading featured posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && featuredPosts.length === 0) {
    return null;
  }

  return (
    <Section background="white">
      <Container>
        <div className="text-center mb-12">
          <H2 className="mb-4">
            The Nourished Life
          </H2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover insights, recipes, and wellness wisdom to support your journey
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {featuredPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>

            <div className="text-center">
              <Link to="/blog">
                <Button variant="secondary">
                  View All Posts
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
            </div>
          </>
        )}
      </Container>
    </Section>
  );
}
