import { supabase } from './supabase';
import type { BlogPost, Program, Resource, BlogPostFormData, BlogFilters, BlogTag, SocialMediaLink } from '../types';
import { generateSlug } from '../utils/slug';
import { calculateReadingTime } from '../utils/readingTime';

export async function getBlogPosts(limit?: number): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  return data || [];
}

export async function getAllBlogPostsAdmin(filters?: BlogFilters): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .order('updated_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  let posts = data || [];

  if (filters?.tag) {
    posts = posts.filter((post) => post.tags?.includes(filters.tag));
  }

  return posts;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }

  return data;
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }

  return data;
}

export async function getFeaturedBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('featured_on_home', true)
    .order('published_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching featured blog posts:', error);
    return [];
  }

  return data || [];
}

export async function getBlogPostsByTag(tag: string, limit?: number): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (limit) {
    query = query.limit(limit * 2);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching blog posts by tag:', error);
    return [];
  }

  const filtered = (data || []).filter((post) => post.tags?.includes(tag));
  return limit ? filtered.slice(0, limit) : filtered;
}

export async function createBlogPost(formData: Partial<BlogPostFormData>): Promise<BlogPost | null> {
  const slug = formData.slug || generateSlug(formData.title || '');
  const readingTime = calculateReadingTime(formData.content || '');

  const postData = {
    title: formData.title,
    slug,
    summary: formData.excerpt || '',
    excerpt: formData.excerpt,
    content: formData.content,
    cover_image: formData.cover_image,
    author: formData.author || 'Nourished Rebel',
    status: formData.status || 'draft',
    featured_on_home: formData.featured_on_home || false,
    tags: formData.tags || [],
    seo_title: formData.seo_title || formData.title,
    seo_description: formData.seo_description || formData.excerpt,
    og_image: formData.og_image,
    category: formData.category || 'Article',
    wellness_goal: formData.wellness_goal,
    reading_time: readingTime,
    published_at: formData.status === 'published' ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from('blog_posts')
    .insert([postData])
    .select()
    .single();

  if (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }

  return data;
}

export async function updateBlogPost(id: string, formData: Partial<BlogPostFormData>): Promise<BlogPost | null> {
  const existingPost = await getBlogPostById(id);
  if (!existingPost) return null;

  const readingTime = formData.content ? calculateReadingTime(formData.content) : existingPost.reading_time;

  const postData: any = {
    ...formData,
    summary: formData.excerpt || existingPost.excerpt || '',
    reading_time: readingTime,
  };

  if (formData.status === 'published' && existingPost.status === 'draft' && !existingPost.published_at) {
    postData.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(postData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }

  return data;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog post:', error);
    return false;
  }

  return true;
}

export async function checkSlugUniqueness(slug: string, excludeId?: string): Promise<boolean> {
  let query = supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', slug);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Error checking slug uniqueness:', error);
    return false;
  }

  return !data;
}

export async function getAllTags(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('tags')
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  const tagSet = new Set<string>();
  (data || []).forEach((post) => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach((tag: string) => tagSet.add(tag));
    }
  });

  return Array.from(tagSet).sort();
}

export async function getRelatedPosts(currentPostId: string, tags: string[], limit = 3): Promise<BlogPost[]> {
  if (!tags || tags.length === 0) return [];

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .neq('id', currentPostId)
    .order('published_at', { ascending: false })
    .limit(limit * 3);

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }

  const scored = (data || []).map((post) => {
    const commonTags = post.tags?.filter((tag: string) => tags.includes(tag)).length || 0;
    return { post, score: commonTags };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}

export async function getPrograms(): Promise<Program[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching programs:', error);
    return [];
  }

  return data || [];
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching program:', error);
    return null;
  }

  return data;
}

export async function getResources(limit?: number): Promise<Resource[]> {
  let query = supabase
    .from('resources')
    .select('*')
    .order('publish_date', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching resources:', error);
    return [];
  }

  return data || [];
}

export async function getFeaturedResources(): Promise<Resource[]> {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('is_featured', true)
    .order('publish_date', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching featured resources:', error);
    return [];
  }

  return data || [];
}

export async function getResourceBySlug(slug: string): Promise<Resource | null> {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching resource:', error);
    return null;
  }

  return data;
}

export async function getSocialMediaLinks(): Promise<SocialMediaLink[]> {
  const { data, error } = await supabase
    .from('social_media_links')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching social media links:', error);
    return [];
  }

  return data || [];
}

export async function getAllSocialMediaLinks(): Promise<SocialMediaLink[]> {
  const { data, error } = await supabase
    .from('social_media_links')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching all social media links:', error);
    return [];
  }

  return data || [];
}

export async function createSocialMediaLink(link: Partial<SocialMediaLink>): Promise<SocialMediaLink | null> {
  const { data, error } = await supabase
    .from('social_media_links')
    .insert([link])
    .select()
    .single();

  if (error) {
    console.error('Error creating social media link:', error);
    throw error;
  }

  return data;
}

export async function updateSocialMediaLink(id: string, link: Partial<SocialMediaLink>): Promise<SocialMediaLink | null> {
  const { data, error } = await supabase
    .from('social_media_links')
    .update(link)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating social media link:', error);
    throw error;
  }

  return data;
}

export async function deleteSocialMediaLink(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('social_media_links')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting social media link:', error);
    return false;
  }

  return true;
}

export async function getLatestFeaturedContent(contentType: 'blog' | 'programs' | 'resources', limit = 3) {
  if (contentType === 'blog') {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching latest blog posts:', error);
      return [];
    }
    return data || [];
  }

  if (contentType === 'programs') {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching latest programs:', error);
      return [];
    }
    return data || [];
  }

  if (contentType === 'resources') {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('publish_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching latest resources:', error);
      return [];
    }
    return data || [];
  }

  return [];
}

export async function getFeaturedContentTypes(): Promise<string[]> {
  const types: string[] = [];

  const { data: blogData } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('status', 'published')
    .eq('featured_on_home', true)
    .limit(1)
    .maybeSingle();

  if (blogData) types.push('blog');

  const { data: programData } = await supabase
    .from('programs')
    .select('id')
    .eq('is_active', true)
    .eq('featured_on_home', true)
    .limit(1)
    .maybeSingle();

  if (programData) types.push('programs');

  const { data: resourceData } = await supabase
    .from('resources')
    .select('id')
    .eq('featured_on_home', true)
    .limit(1)
    .maybeSingle();

  if (resourceData) types.push('resources');

  return types;
}
