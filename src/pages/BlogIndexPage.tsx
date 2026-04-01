import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Container } from '../components/shared/Container';
import { Section } from '../components/shared/Section';
import { H1 } from '../components/shared/Heading';
import BlogPostCard from '../components/blog/BlogPostCard';
import TagFilter from '../components/blog/TagFilter';
import { getBlogPosts, getAllTags, getBlogPostsByTag } from '../lib/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import type { BlogPost } from '../types';

export default function BlogIndexPage() {
  useDocumentMeta({
    title: 'Blog',
    description: 'Insights, recipes, and wellness wisdom for nourishing your body and mind. Read the latest from Nourished Rebel.',
    canonicalPath: '/blog',
  });

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 12;

  useEffect(() => {
    loadBlogData();
  }, []);

  const loadBlogData = async () => {
    setLoading(true);
    try {
      const [postsData, tagsData] = await Promise.all([
        getBlogPosts(),
        getAllTags(),
      ]);
      setPosts(postsData);
      setFilteredPosts(postsData);
      setAllTags(tagsData);
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterPosts();
  }, [selectedTag, searchQuery, posts]);

  const filterPosts = async () => {
    let filtered = [...posts];

    if (selectedTag) {
      const tagPosts = await getBlogPostsByTag(selectedTag);
      filtered = tagPosts;
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Section background="white">
        <Container>
          <div className="text-center max-w-3xl mx-auto py-16">
            <H1 className="mb-4">
              The Nourished Life
            </H1>
            <p className="text-lg text-gray-600">
              Insights, recipes, and wellness wisdom for nourishing your body and mind
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <TagFilter
                allTags={allTags}
                selectedTag={selectedTag}
                onSelectTag={setSelectedTag}
              />

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : paginatedPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-2 rounded-lg ${
                                currentPage === page
                                  ? 'bg-primary text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-2">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No posts found matching your criteria</p>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </div>
  );
}
