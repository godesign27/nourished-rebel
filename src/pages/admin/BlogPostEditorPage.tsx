import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';
import TiptapEditor from '../../components/blog/TiptapEditor';
import ImageUpload from '../../components/blog/ImageUpload';
import TagInput from '../../components/blog/TagInput';
import {
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  checkSlugUniqueness,
  getAllTags,
} from '../../lib/api';
import { generateSlug, isValidSlug } from '../../utils/slug';
import type { BlogPostFormData, CoverImage } from '../../types';

export function BlogPostEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id !== 'new';

  const [formData, setFormData] = useState<BlogPostFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: null,
    author: 'Nourished Rebel',
    status: 'draft',
    featured_on_home: false,
    tags: [],
    seo_title: '',
    seo_description: '',
    og_image: '',
    category: 'Article',
    wellness_goal: '',
  });

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugEdited, setSlugEdited] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (isEditing) {
      loadPost();
    }
    loadTags();
  }, [id]);

  useEffect(() => {
    if (!slugEdited && formData.title) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(formData.title) }));
    }
  }, [formData.title, slugEdited]);

  const loadPost = async () => {
    if (!id || id === 'new') return;

    setLoading(true);
    try {
      const post = await getBlogPostById(id);
      if (post) {
        setFormData({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || post.summary,
          content: post.content,
          cover_image: post.cover_image,
          author: post.author,
          status: post.status,
          featured_on_home: post.featured_on_home,
          tags: post.tags || [],
          seo_title: post.seo_title || '',
          seo_description: post.seo_description || '',
          og_image: post.og_image || '',
          category: post.category,
          wellness_goal: post.wellness_goal || '',
        });
        setSlugEdited(true);
      }
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    const tags = await getAllTags();
    setAllTags(tags);
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!isValidSlug(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    } else {
      const isUnique = await checkSlugUniqueness(formData.slug, isEditing ? id : undefined);
      if (!isUnique) {
        newErrors.slug = 'This slug is already in use';
      }
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if (formData.excerpt.length < 50) {
      newErrors.excerpt = 'Excerpt must be at least 50 characters';
    }

    if (!formData.content.trim() || formData.content === '<p></p>') {
      newErrors.content = 'Content is required';
    }

    if (formData.status === 'published' && !formData.cover_image) {
      newErrors.cover_image = 'Cover image is required for published posts';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (publish = false) => {
    const dataToSave = { ...formData, status: publish ? 'published' : formData.status };

    if (publish) {
      const isValid = await validateForm();
      if (!isValid) return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await updateBlogPost(id!, dataToSave);
      } else {
        const newPost = await createBlogPost(dataToSave);
        if (newPost) {
          navigate(`/admin/blog/${newPost.id}`);
          return;
        }
      }
      setLastSaved(new Date());
      if (publish) {
        navigate('/admin/blog');
      }
    } catch (error: any) {
      console.error('Error saving post:', error);
      setErrors({ submit: error.message || 'Failed to save post' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBlogPost(id!);
      navigate('/admin/blog');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handlePreview = () => {
    if (formData.slug) {
      window.open(`/blog/${formData.slug}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/blog')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Blog Posts</span>
          </button>

          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-sm text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {isEditing && (
              <button
                onClick={handlePreview}
                disabled={!formData.slug}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Eye size={18} />
                Preview
              </button>
            )}
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {formData.status === 'published' ? 'Update' : 'Publish'}
            </button>
            {isEditing && (
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter post title..."
                className={`w-full px-4 py-2 text-2xl font-bold border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  setFormData({ ...formData, slug: e.target.value });
                  setSlugEdited(true);
                }}
                placeholder="post-url-slug"
                className={`w-full px-4 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.slug ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
              <p className="mt-1 text-sm text-gray-500">
                URL: /blog/{formData.slug || 'post-slug'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt *
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Write a brief summary..."
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.excerpt ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between mt-1">
                {errors.excerpt && <p className="text-sm text-red-600">{errors.excerpt}</p>}
                <p className="text-sm text-gray-500 ml-auto">
                  {formData.excerpt.length} characters
                </p>
              </div>
            </div>

            <ImageUpload
              value={formData.cover_image}
              onChange={(image) => setFormData({ ...formData, cover_image: image })}
            />
            {errors.cover_image && (
              <p className="text-sm text-red-600">{errors.cover_image}</p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <TiptapEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
              />
              {errors.content && <p className="mt-2 text-sm text-red-600">{errors.content}</p>}
            </div>

            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-medium text-gray-900 cursor-pointer">
                SEO Settings
              </summary>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seo_title}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    placeholder={formData.title || 'SEO title...'}
                    maxLength={60}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">{formData.seo_title.length}/60</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    value={formData.seo_description}
                    onChange={(e) =>
                      setFormData({ ...formData, seo_description: e.target.value })
                    }
                    placeholder={formData.excerpt || 'SEO description...'}
                    maxLength={160}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.seo_description.length}/160
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <h3 className="font-medium text-gray-900">Post Settings</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Article">Article</option>
                  <option value="Recipe">Recipe</option>
                  <option value="Guide">Guide</option>
                  <option value="News">News</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured_on_home}
                    onChange={(e) =>
                      setFormData({ ...formData, featured_on_home: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Feature on homepage
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <TagInput
                tags={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
                suggestions={allTags}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
