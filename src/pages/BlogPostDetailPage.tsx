import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Share2, Facebook, Linkedin } from 'lucide-react';
import { Container } from '../components/shared/Container';
import { Section } from '../components/shared/Section';
import BlogPostCard from '../components/blog/BlogPostCard';
import { getBlogPostBySlug, getRelatedPosts } from '../lib/api';
import { sanitizeHtml } from '../utils/sanitize';
import { formatReadingTime } from '../utils/readingTime';
import type { BlogPost } from '../types';

export default function BlogPostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (slug: string) => {
    setLoading(true);
    try {
      const postData = await getBlogPostBySlug(slug);
      if (postData) {
        setPost(postData);
        const related = await getRelatedPosts(postData.id, postData.tags || [], 3);
        setRelatedPosts(related);
      } else {
        navigate('/blog');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const sharePost = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setShowShareMenu(false);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareMenu(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const imageUrl = post.cover_image?.url || post.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
  const imageAlt = post.cover_image?.alt_text || post.title;

  return (
    <div className="min-h-screen bg-white">
      <div className="relative w-full h-[60vh] bg-gray-900 overflow-hidden">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <Section background="white" className="relative -mt-32 z-10">
        <Container>
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft size={20} />
              <span>Back to The Nourished Life</span>
            </Link>

            <nav className="text-sm text-gray-500 mb-4">
              <Link to="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/resources" className="hover:text-primary">The Nourished Life</Link>
              <span className="mx-2">/</span>
              <span>{post.title}</span>
            </nav>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="font-medium">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatDate(post.published_at || post.publish_date)}</span>
              </div>
              {post.reading_time && (
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{formatReadingTime(post.reading_time)}</span>
                </div>
              )}
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <button
                      onClick={() => sharePost('twitter')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      Twitter / X
                    </button>
                    <button
                      onClick={() => sharePost('facebook')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Facebook size={16} />
                      Facebook
                    </button>
                    <button
                      onClick={() => sharePost('linkedin')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Linkedin size={16} />
                      LinkedIn
                    </button>
                    <button
                      onClick={() => sharePost('copy')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            />
          </div>
        </Container>
      </Section>

      {relatedPosts.length > 0 && (
        <Section background="white">
          <Container>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <BlogPostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </div>
  );
}
