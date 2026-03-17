/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses multiple security and performance issues identified by Supabase:
  - Adds missing indexes for foreign key columns
  - Optimizes RLS policies to prevent re-evaluation of auth functions per row
  - Fixes function search paths to be immutable
  
  ## Changes
  
  ### 1. Add Missing Foreign Key Indexes
  - `subscriptions.customer_id` - Index for foreign key relationship
  - `subscriptions.program_id` - Index for foreign key relationship
  
  ### 2. Optimize RLS Policies
  All admin-related RLS policies are updated to wrap `auth.jwt()` calls in a SELECT statement.
  This prevents the function from being re-evaluated for each row, dramatically improving performance at scale.
  
  Tables affected:
  - blog_posts (4 policies)
  - blog_tags (3 policies)
  - products (4 policies)
  - customers (4 policies)
  - subscriptions (4 policies)
  - mail_subscribers (4 policies)
  - pages (3 policies)
  - media_library (3 policies)
  - site_settings (2 policies)
  
  ### 3. Fix Function Search Paths
  - `update_blog_posts_updated_at()` - Set immutable search path
  - `set_blog_post_published_at()` - Set immutable search path
  
  ## Performance Impact
  - Foreign key lookups will be significantly faster
  - RLS policy evaluation will be optimized by evaluating auth functions once per query instead of per row
  - Functions will have stable, predictable search paths
  
  ## Security Notes
  - All RLS policies maintain the same security posture
  - Only performance optimizations are applied
  - No changes to access control logic
*/

-- =====================================================
-- 1. Add Missing Foreign Key Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_program_id ON subscriptions(program_id);

-- =====================================================
-- 2. Optimize RLS Policies - blog_posts
-- =====================================================

DROP POLICY IF EXISTS "Admin users can read all blog posts" ON blog_posts;
CREATE POLICY "Admin users can read all blog posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admin users can insert blog posts" ON blog_posts;
CREATE POLICY "Admin users can insert blog posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admin users can update blog posts" ON blog_posts;
CREATE POLICY "Admin users can update blog posts"
  ON blog_posts
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

DROP POLICY IF EXISTS "Admin users can delete blog posts" ON blog_posts;
CREATE POLICY "Admin users can delete blog posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- =====================================================
-- 3. Optimize RLS Policies - blog_tags
-- =====================================================

DROP POLICY IF EXISTS "Admin users can insert blog tags" ON blog_tags;
CREATE POLICY "Admin users can insert blog tags"
  ON blog_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admin users can update blog tags" ON blog_tags;
CREATE POLICY "Admin users can update blog tags"
  ON blog_tags
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

DROP POLICY IF EXISTS "Admin users can delete blog tags" ON blog_tags;
CREATE POLICY "Admin users can delete blog tags"
  ON blog_tags
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- =====================================================
-- 4. Optimize RLS Policies - products
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all products" ON products;
CREATE POLICY "Admins can view all products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products"
  ON products
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

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- =====================================================
-- 5. Optimize RLS Policies - customers
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
CREATE POLICY "Admins can view all customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can insert customers" ON customers;
CREATE POLICY "Admins can insert customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can update customers" ON customers;
CREATE POLICY "Admins can update customers"
  ON customers
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

DROP POLICY IF EXISTS "Admins can delete customers" ON customers;
CREATE POLICY "Admins can delete customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- =====================================================
-- 6. Optimize RLS Policies - subscriptions
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can insert subscriptions" ON subscriptions;
CREATE POLICY "Admins can insert subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can update subscriptions" ON subscriptions;
CREATE POLICY "Admins can update subscriptions"
  ON subscriptions
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

DROP POLICY IF EXISTS "Admins can delete subscriptions" ON subscriptions;
CREATE POLICY "Admins can delete subscriptions"
  ON subscriptions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- =====================================================
-- 7. Optimize RLS Policies - mail_subscribers
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all subscribers" ON mail_subscribers;
CREATE POLICY "Admins can view all subscribers"
  ON mail_subscribers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can insert subscribers" ON mail_subscribers;
CREATE POLICY "Admins can insert subscribers"
  ON mail_subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can update subscribers" ON mail_subscribers;
CREATE POLICY "Admins can update subscribers"
  ON mail_subscribers
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

DROP POLICY IF EXISTS "Admins can delete subscribers" ON mail_subscribers;
CREATE POLICY "Admins can delete subscribers"
  ON mail_subscribers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- =====================================================
-- 8. Optimize RLS Policies - pages
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all pages" ON pages;
CREATE POLICY "Admins can view all pages"
  ON pages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can insert pages" ON pages;
CREATE POLICY "Admins can insert pages"
  ON pages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can update pages" ON pages;
CREATE POLICY "Admins can update pages"
  ON pages
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
-- 9. Optimize RLS Policies - media_library
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all media" ON media_library;
CREATE POLICY "Admins can view all media"
  ON media_library
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can insert media" ON media_library;
CREATE POLICY "Admins can insert media"
  ON media_library
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can delete media" ON media_library;
CREATE POLICY "Admins can delete media"
  ON media_library
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- =====================================================
-- 10. Optimize RLS Policies - site_settings
-- =====================================================

DROP POLICY IF EXISTS "Admins can insert site settings" ON site_settings;
CREATE POLICY "Admins can insert site settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;
CREATE POLICY "Admins can update site settings"
  ON site_settings
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
-- 11. Fix Function Search Paths
-- =====================================================

CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION set_blog_post_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status = 'draft' AND NEW.published_at IS NULL THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$;
