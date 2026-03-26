export type BlogPostStatus = 'draft' | 'published';

export interface CoverImage {
  url: string;
  alt_text: string;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  category: string;
  wellness_goal: string | null;
  image_url: string | null;
  author: string;
  publish_date: string;
  content: string;
  slug: string;
  created_at: string;
  updated_at: string;
  // Enhanced fields
  status: BlogPostStatus;
  excerpt: string | null;
  cover_image: CoverImage | null;
  published_at: string | null;
  featured_on_home: boolean;
  reading_time: number | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  tags: string[];
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogPostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: CoverImage | null;
  author: string;
  status: BlogPostStatus;
  featured_on_home: boolean;
  tags: string[];
  seo_title: string;
  seo_description: string;
  og_image: string;
  category: string;
  wellness_goal: string;
}

export interface BlogFilters {
  status?: BlogPostStatus;
  tag?: string;
  search?: string;
}

export interface Program {
  id: string;
  name: string;
  category: string;
  summary: string;
  description: string | null;
  ideal_participant: string | null;
  duration: string;
  cta_label: string;
  price: number | null;
  image_url: string | null;
  slug: string;
  is_active: boolean;
  display_order: number;
  featured_on_home: boolean;
  booking_link: string | null;
  intake_form_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgramVariant {
  id: string;
  program_id: string;
  name: string;
  description: string | null;
  price: number;
  billing_frequency: string | null;
  session_count: number | null;
  duration_weeks: number | null;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  summary: string;
  resource_type: string;
  category: string;
  wellness_goal: string | null;
  image_url: string | null;
  file_url: string | null;
  author: string;
  publish_date: string;
  content: string | null;
  slug: string;
  is_featured: boolean;
  featured_on_home: boolean;
  created_at: string;
  updated_at: string;
}

export interface NavigationLink {
  label: string;
  path: string;
}

export interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SocialMediaPlatform = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'pinterest' | 'tiktok';
