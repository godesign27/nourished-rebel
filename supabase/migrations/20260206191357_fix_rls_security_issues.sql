/*
  # Fix RLS Security Issues
  
  ## Overview
  This migration addresses critical security and performance issues identified by Supabase:
  
  ## Changes
  
  ### 1. Fix Unrestricted RLS Policies
  Updates policies that allow unrestricted access (USING/WITH CHECK true) to require admin authentication:
  - `about_page_content` - Restrict insert/update to admins only
  - `social_media_links` - Restrict write operations to admins only
  
  ### 2. Remove Duplicate Permissive Policies
  Consolidates multiple SELECT policies to avoid confusion:
  - `social_media_links` - Merge two SELECT policies into one
  
  ### 3. Remove Unused Indexes
  Drops indexes that are not being used to improve write performance:
  - `idx_blog_posts_category`
  - `idx_programs_slug`
  - `idx_programs_active`
  - `idx_programs_display_order`
  - `idx_resources_slug`
  - `idx_resources_publish_date`
  - `idx_resources_type`
  - `idx_resources_category`
  - `idx_resources_featured`
  - `idx_blog_posts_published_at`
  - `idx_blog_posts_featured_on_home`
  - `idx_blog_posts_tags`
  - `idx_subscriptions_customer_id` (if not used by FK)
  - `idx_subscriptions_program_id` (if not used by FK)
  - `idx_programs_featured_on_home`
  - `idx_resources_featured_on_home`
  
  ## Security Notes
  - All write access now properly restricted to admin users only
  - Public read access maintained where appropriate (theme settings, active social links, about page)
  - Multiple permissive policies consolidated to avoid confusion
*/

-- =====================================================
-- 1. Fix about_page_content RLS Policies
-- =====================================================

-- Drop old policies that allow unrestricted access
DROP POLICY IF EXISTS "Authenticated users can insert about page content" ON about_page_content;
DROP POLICY IF EXISTS "Authenticated users can update about page content" ON about_page_content;

-- Create admin-only policies
CREATE POLICY "Admins can insert about page content"
  ON about_page_content
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

CREATE POLICY "Admins can update about page content"
  ON about_page_content
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- =====================================================
-- 2. Fix social_media_links RLS Policies
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view active social media links" ON social_media_links;
DROP POLICY IF EXISTS "Authenticated users can view all social media links" ON social_media_links;
DROP POLICY IF EXISTS "Authenticated users can insert social media links" ON social_media_links;
DROP POLICY IF EXISTS "Authenticated users can update social media links" ON social_media_links;
DROP POLICY IF EXISTS "Authenticated users can delete social media links" ON social_media_links;

-- Create consolidated public read policy (anonymous can see active, authenticated can see all)
CREATE POLICY "Public can view active social media links"
  ON social_media_links
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all social media links"
  ON social_media_links
  FOR SELECT
  TO authenticated
  USING (true);

-- Create admin-only write policies
CREATE POLICY "Admins can insert social media links"
  ON social_media_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

CREATE POLICY "Admins can update social media links"
  ON social_media_links
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

CREATE POLICY "Admins can delete social media links"
  ON social_media_links
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- =====================================================
-- 3. Remove Unused Indexes
-- =====================================================

-- Note: We keep foreign key indexes (subscriptions_customer_id, subscriptions_program_id)
-- as they may be used by the database for join operations

DROP INDEX IF EXISTS idx_blog_posts_category;
DROP INDEX IF EXISTS idx_programs_slug;
DROP INDEX IF EXISTS idx_programs_active;
DROP INDEX IF EXISTS idx_programs_display_order;
DROP INDEX IF EXISTS idx_resources_slug;
DROP INDEX IF EXISTS idx_resources_publish_date;
DROP INDEX IF EXISTS idx_resources_type;
DROP INDEX IF EXISTS idx_resources_category;
DROP INDEX IF EXISTS idx_resources_featured;
DROP INDEX IF EXISTS idx_blog_posts_published_at;
DROP INDEX IF EXISTS idx_blog_posts_featured_on_home;
DROP INDEX IF EXISTS idx_blog_posts_tags;
DROP INDEX IF EXISTS idx_programs_featured_on_home;
DROP INDEX IF EXISTS idx_resources_featured_on_home;
