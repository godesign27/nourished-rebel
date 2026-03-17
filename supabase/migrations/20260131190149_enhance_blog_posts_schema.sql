/*
  # Enhance Blog Posts Schema for Full-Featured Blogging
  
  ## Overview
  This migration extends the blog_posts table with advanced features including:
  - Draft/published status workflow
  - Rich content with cover images
  - Homepage featuring capability
  - SEO optimization fields
  - Tag system for content categorization
  - Reading time calculation
  
  ## Changes
  
  1. Enhanced blog_posts Table Columns
    - `status` (text) - Workflow state: 'draft' or 'published'
    - `excerpt` (text) - Short summary for cards (replaces/extends summary)
    - `cover_image` (jsonb) - Cover image with url and alt_text
    - `published_at` (timestamptz) - When post was published
    - `featured_on_home` (boolean) - Display on homepage
    - `reading_time` (integer) - Estimated reading time in minutes
    - `seo_title` (text) - Custom SEO title
    - `seo_description` (text) - Custom meta description
    - `og_image` (text) - Open Graph image URL
    - `tags` (jsonb) - Array of tag strings
    
  2. New blog_tags Table
    - `id` (uuid, primary key)
    - `name` (text, unique) - Display name
    - `slug` (text, unique) - URL-friendly version
    - `created_at` (timestamptz)
    
  3. Updated Security Policies
    - Public can only read published posts
    - Authenticated admin users can manage all posts
    - Admin users can manage tags
    
  4. Performance Indexes
    - Index on status for filtering
    - Index on published_at for sorting published content
    - Index on featured_on_home for homepage queries
    - GIN index on tags for tag-based filtering
*/

-- Add new columns to blog_posts table
DO $$
BEGIN
  -- Add status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'status'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN status text NOT NULL DEFAULT 'draft';
    ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_status_check 
      CHECK (status IN ('draft', 'published'));
  END IF;
  
  -- Add excerpt column (keeping summary for backward compatibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'excerpt'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN excerpt text;
    -- Copy existing summary to excerpt
    UPDATE blog_posts SET excerpt = summary WHERE excerpt IS NULL;
  END IF;
  
  -- Add cover_image column (jsonb with url and alt_text)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'cover_image'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN cover_image jsonb;
    -- Migrate existing image_url to cover_image
    UPDATE blog_posts 
    SET cover_image = jsonb_build_object('url', image_url, 'alt_text', title)
    WHERE image_url IS NOT NULL AND cover_image IS NULL;
  END IF;
  
  -- Add published_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'published_at'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN published_at timestamptz;
    -- Set published_at from publish_date for existing posts
    UPDATE blog_posts 
    SET published_at = publish_date::timestamptz 
    WHERE published_at IS NULL;
  END IF;
  
  -- Add featured_on_home column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'featured_on_home'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN featured_on_home boolean NOT NULL DEFAULT false;
  END IF;
  
  -- Add reading_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'reading_time'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN reading_time integer;
  END IF;
  
  -- Add SEO fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'seo_title'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN seo_title text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'seo_description'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN seo_description text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'og_image'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN og_image text;
  END IF;
  
  -- Add tags column (jsonb array)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'tags'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN tags jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create blog_tags table for tag management
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured_on_home ON blog_posts(featured_on_home) WHERE featured_on_home = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN (tags);

-- Update RLS policies for blog_posts
-- Drop the old public read policy and create new ones
DROP POLICY IF EXISTS "Blog posts are publicly readable" ON blog_posts;

-- Public can only read published posts
CREATE POLICY "Published blog posts are publicly readable"
  ON blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Admin users can read all posts (including drafts)
CREATE POLICY "Admin users can read all blog posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

-- Admin users can insert posts
CREATE POLICY "Admin users can insert blog posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

-- Admin users can update posts
CREATE POLICY "Admin users can update blog posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

-- Admin users can delete posts
CREATE POLICY "Admin users can delete blog posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

-- RLS policies for blog_tags
-- Public can read tags
CREATE POLICY "Blog tags are publicly readable"
  ON blog_tags
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin users can manage tags
CREATE POLICY "Admin users can insert blog tags"
  ON blog_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admin users can update blog tags"
  ON blog_tags
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admin users can delete blog tags"
  ON blog_tags
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at_trigger ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at_trigger
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- Create function to automatically set published_at when status changes to published
CREATE OR REPLACE FUNCTION set_blog_post_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status = 'draft' AND NEW.published_at IS NULL THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for published_at
DROP TRIGGER IF EXISTS set_blog_post_published_at_trigger ON blog_posts;
CREATE TRIGGER set_blog_post_published_at_trigger
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_blog_post_published_at();