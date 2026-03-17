/*
  # Fix Security and Performance Issues - Comprehensive Update

  ## 1. Add Missing Indexes for Foreign Keys
  
  Foreign keys without indexes can cause significant performance issues:
  - `orders.program_id` - Add index for program lookups
  - `orders.program_option_id` - Add index for option lookups
  - `program_purchases.program_id` - Add index for program purchase queries
  - `program_purchases.variant_id` - Add index for variant purchase queries

  ## 2. Optimize RLS Policies - Auth Function Initialization
  
  All RLS policies using `auth.uid()` or `auth.jwt()` are updated to use
  `(SELECT auth.uid())` or `(SELECT auth.jwt())` to prevent re-evaluation
  for each row, significantly improving query performance at scale.

  ## 3. Fix Overly Permissive RLS Policies
  
  - `program_variants` policies for authenticated users currently allow all operations
    These are changed to properly check admin status

  ## 4. Notes
  
  - Unused indexes are kept as they will be used when the application scales
  - Multiple permissive policies are intentional for public/admin access patterns
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_orders_program_id ON orders(program_id);
CREATE INDEX IF NOT EXISTS idx_orders_program_option_id ON orders(program_option_id);
CREATE INDEX IF NOT EXISTS idx_program_purchases_program_id ON program_purchases(program_id);
CREATE INDEX IF NOT EXISTS idx_program_purchases_variant_id ON program_purchases(variant_id);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES - FIX AUTH FUNCTION CALLS
-- =====================================================

-- Fix program_purchases policies
DROP POLICY IF EXISTS "Users can view their own purchases" ON program_purchases;
CREATE POLICY "Users can view their own purchases"
  ON program_purchases FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = auth_user_id);

-- Fix blog_posts policies
DROP POLICY IF EXISTS "Admin users can read all blog posts" ON blog_posts;
CREATE POLICY "Admin users can read all blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admin users can insert blog posts" ON blog_posts;
CREATE POLICY "Admin users can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admin users can update blog posts" ON blog_posts;
CREATE POLICY "Admin users can update blog posts"
  ON blog_posts FOR UPDATE
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
  ON blog_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- Fix blog_tags policies
DROP POLICY IF EXISTS "Admin users can insert blog tags" ON blog_tags;
CREATE POLICY "Admin users can insert blog tags"
  ON blog_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admin users can update blog tags" ON blog_tags;
CREATE POLICY "Admin users can update blog tags"
  ON blog_tags FOR UPDATE
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
  ON blog_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- Fix products policies
DROP POLICY IF EXISTS "Admins can view all products" ON products;
CREATE POLICY "Admins can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
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
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- Fix customers policies
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can insert customers" ON customers;
CREATE POLICY "Admins can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can update customers" ON customers;
CREATE POLICY "Admins can update customers"
  ON customers FOR UPDATE
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
  ON customers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- Fix subscriptions policies
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can insert subscriptions" ON subscriptions;
CREATE POLICY "Admins can insert subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can update subscriptions" ON subscriptions;
CREATE POLICY "Admins can update subscriptions"
  ON subscriptions FOR UPDATE
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
  ON subscriptions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- Fix mail_subscribers policies
DROP POLICY IF EXISTS "Admins can view all subscribers" ON mail_subscribers;
CREATE POLICY "Admins can view all subscribers"
  ON mail_subscribers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can insert subscribers" ON mail_subscribers;
CREATE POLICY "Admins can insert subscribers"
  ON mail_subscribers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can update subscribers" ON mail_subscribers;
CREATE POLICY "Admins can update subscribers"
  ON mail_subscribers FOR UPDATE
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
  ON mail_subscribers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- Fix pages policies
DROP POLICY IF EXISTS "Admins can view all pages" ON pages;
CREATE POLICY "Admins can view all pages"
  ON pages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can insert pages" ON pages;
CREATE POLICY "Admins can insert pages"
  ON pages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can update pages" ON pages;
CREATE POLICY "Admins can update pages"
  ON pages FOR UPDATE
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

-- Fix media_library policies
DROP POLICY IF EXISTS "Admins can view all media" ON media_library;
CREATE POLICY "Admins can view all media"
  ON media_library FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can insert media" ON media_library;
CREATE POLICY "Admins can insert media"
  ON media_library FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can delete media" ON media_library;
CREATE POLICY "Admins can delete media"
  ON media_library FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- Fix site_settings policies
DROP POLICY IF EXISTS "Admins can insert site settings" ON site_settings;
CREATE POLICY "Admins can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;
CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
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

-- Fix theme_settings policies
DROP POLICY IF EXISTS "Admins can insert theme settings" ON theme_settings;
CREATE POLICY "Admins can insert theme settings"
  ON theme_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Admins can update theme settings" ON theme_settings;
CREATE POLICY "Admins can update theme settings"
  ON theme_settings FOR UPDATE
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

DROP POLICY IF EXISTS "Admins can delete theme settings" ON theme_settings;
CREATE POLICY "Admins can delete theme settings"
  ON theme_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- Fix programs policies
DROP POLICY IF EXISTS "Authenticated admins can view all programs" ON programs;
CREATE POLICY "Authenticated admins can view all programs"
  ON programs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Authenticated admins can insert programs" ON programs;
CREATE POLICY "Authenticated admins can insert programs"
  ON programs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Authenticated admins can update programs" ON programs;
CREATE POLICY "Authenticated admins can update programs"
  ON programs FOR UPDATE
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

DROP POLICY IF EXISTS "Authenticated admins can delete programs" ON programs;
CREATE POLICY "Authenticated admins can delete programs"
  ON programs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- Fix program_options policies
DROP POLICY IF EXISTS "Authenticated admins can view all options" ON program_options;
CREATE POLICY "Authenticated admins can view all options"
  ON program_options FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Authenticated admins can insert options" ON program_options;
CREATE POLICY "Authenticated admins can insert options"
  ON program_options FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Authenticated admins can update options" ON program_options;
CREATE POLICY "Authenticated admins can update options"
  ON program_options FOR UPDATE
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

DROP POLICY IF EXISTS "Authenticated admins can delete options" ON program_options;
CREATE POLICY "Authenticated admins can delete options"
  ON program_options FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- Fix waitlist_signups policies
DROP POLICY IF EXISTS "Authenticated admins can view waitlist signups" ON waitlist_signups;
CREATE POLICY "Authenticated admins can view waitlist signups"
  ON waitlist_signups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- Fix orders policies
DROP POLICY IF EXISTS "Authenticated admins can view orders" ON orders;
CREATE POLICY "Authenticated admins can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- =====================================================
-- 3. FIX OVERLY PERMISSIVE PROGRAM_VARIANTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can insert program variants" ON program_variants;
CREATE POLICY "Authenticated users can insert program variants"
  ON program_variants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Authenticated users can update program variants" ON program_variants;
CREATE POLICY "Authenticated users can update program variants"
  ON program_variants FOR UPDATE
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

DROP POLICY IF EXISTS "Authenticated users can delete program variants" ON program_variants;
CREATE POLICY "Authenticated users can delete program variants"
  ON program_variants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Authenticated users can view all program variants" ON program_variants;
CREATE POLICY "Authenticated users can view all program variants"
  ON program_variants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );
