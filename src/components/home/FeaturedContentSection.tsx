import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Dumbbell, FileText } from 'lucide-react';
import { Container } from '../shared/Container';
import { Section } from '../shared/Section';
import { H2 } from '../shared/Heading';
import BlogPostCard from '../blog/BlogPostCard';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { getLatestFeaturedContent, getFeaturedContentTypes } from '../../lib/api';
import type { BlogPost, Program, Resource } from '../../types';

type ContentType = 'blog' | 'programs' | 'resources';

const CONTENT_CONFIG = {
  blog: {
    label: 'Blog Posts',
    icon: BookOpen,
    path: '/blog',
  },
  programs: {
    label: 'Programs',
    icon: Dumbbell,
    path: '/programs',
  },
  resources: {
    label: 'Resources',
    icon: FileText,
    path: '/resources',
  },
};

export default function FeaturedContentSection() {
  const [activeTab, setActiveTab] = useState<ContentType | null>(null);
  const [availableTypes, setAvailableTypes] = useState<ContentType[]>([]);
  const [content, setContent] = useState<(BlogPost | Program | Resource)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableTypes();
  }, []);

  useEffect(() => {
    if (activeTab) {
      loadContent(activeTab);
    }
  }, [activeTab]);

  const loadAvailableTypes = async () => {
    try {
      const types = await getFeaturedContentTypes();
      const typedTypes = types as ContentType[];
      setAvailableTypes(typedTypes);
      if (typedTypes.length > 0) {
        setActiveTab(typedTypes[0]);
      }
    } catch (error) {
      console.error('Error loading featured content types:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async (type: ContentType) => {
    try {
      setLoading(true);
      const data = await getLatestFeaturedContent(type, 3);
      setContent(data);
    } catch (error) {
      console.error('Error loading featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (availableTypes.length === 0 && !loading) {
    return null;
  }

  const config = activeTab ? CONTENT_CONFIG[activeTab] : null;

  return (
    <Section background="white">
      <Container>
        <div className="text-center mb-8">
          <H2 className="mb-4">Featured Content</H2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our latest offerings and insights
          </p>
        </div>

        {availableTypes.length > 1 && (
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {availableTypes.map((type) => {
              const Icon = CONTENT_CONFIG[type].icon;
              return (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === type
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={20} />
                  {CONTENT_CONFIG[type].label}
                </button>
              );
            })}
          </div>
        )}

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
              {activeTab === 'blog' &&
                (content as BlogPost[]).map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}

              {activeTab === 'programs' &&
                (content as Program[]).map((program) => (
                  <Card key={program.id} className="bg-white hover:shadow-lg transition-shadow">
                    {program.image_url && (
                      <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden mb-4">
                        <img
                          src={program.image_url}
                          alt={program.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="text-sm text-teal-600 font-medium mb-2">
                        {program.category}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{program.name}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{program.summary}</p>
                      <Link to={`/programs/${program.slug}`}>
                        <Button variant="secondary" className="w-full">
                          Learn More
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}

              {activeTab === 'resources' &&
                (content as Resource[]).map((resource) => (
                  <Card key={resource.id} className="bg-white hover:shadow-lg transition-shadow">
                    {resource.image_url && (
                      <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden mb-4">
                        <img
                          src={resource.image_url}
                          alt={resource.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex gap-2 mb-2">
                        <span className="text-sm text-teal-600 font-medium">
                          {resource.resource_type}
                        </span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{resource.category}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{resource.summary}</p>
                      <Link to={`/resources/${resource.slug}`}>
                        <Button variant="secondary" className="w-full">
                          View Resource
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
            </div>

            {config && (
              <div className="text-center">
                <Link to={config.path}>
                  <Button variant="secondary">
                    View All {config.label}
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </Container>
    </Section>
  );
}
