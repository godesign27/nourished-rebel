/*
  # Create blog_posts table

  ## Overview
  This migration creates the blog_posts table for storing articles, recipes, and educational content.
  
  ## Changes
  
  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key) - Unique identifier
      - `title` (text) - Post title
      - `summary` (text) - Brief description for preview cards
      - `category` (text) - Content category (e.g., "Recipe", "Article", "Guide")
      - `wellness_goal` (text) - Related wellness goal (e.g., "Gut Health", "Energy")
      - `image_url` (text) - URL to header/preview image
      - `author` (text) - Author name
      - `publish_date` (date) - Publication date
      - `content` (text) - Full article content
      - `slug` (text, unique) - URL-friendly identifier
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `blog_posts` table
    - Add policy for public read access to published content
    - Content is read-only for anonymous users
  
  3. Indexes
    - Index on `slug` for efficient lookup
    - Index on `publish_date` for chronological sorting
    - Index on `category` for filtering
*/

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL,
  category text NOT NULL,
  wellness_goal text,
  image_url text,
  author text NOT NULL DEFAULT 'Nourished Rebel',
  publish_date date NOT NULL DEFAULT CURRENT_DATE,
  content text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blog posts are publicly readable"
  ON blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_publish_date ON blog_posts(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);