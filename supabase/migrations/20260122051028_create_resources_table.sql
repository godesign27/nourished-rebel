/*
  # Create resources table

  ## Overview
  This migration creates the resources table for storing educational resources, guides, and downloadables.
  
  ## Changes
  
  1. New Tables
    - `resources`
      - `id` (uuid, primary key) - Unique identifier
      - `title` (text) - Resource title
      - `summary` (text) - Brief description
      - `resource_type` (text) - Type (e.g., "Guide", "Checklist", "Template", "Article")
      - `category` (text) - Content category (e.g., "Gut Health", "Meal Planning")
      - `wellness_goal` (text) - Related wellness goal
      - `image_url` (text) - URL to preview image
      - `file_url` (text) - URL to downloadable file (if applicable)
      - `author` (text) - Author name
      - `publish_date` (date) - Publication date
      - `content` (text) - Full content or description
      - `slug` (text, unique) - URL-friendly identifier
      - `is_featured` (boolean) - Whether to feature on homepage
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `resources` table
    - Add policy for public read access to published resources
    - Resources are read-only for anonymous users
  
  3. Indexes
    - Index on `slug` for efficient lookup
    - Index on `publish_date` for chronological sorting
    - Index on `resource_type` and `category` for filtering
    - Index on `is_featured` for homepage queries
*/

CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL,
  resource_type text NOT NULL,
  category text NOT NULL,
  wellness_goal text,
  image_url text,
  file_url text,
  author text NOT NULL DEFAULT 'Nourished Rebel',
  publish_date date NOT NULL DEFAULT CURRENT_DATE,
  content text,
  slug text UNIQUE NOT NULL,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resources are publicly readable"
  ON resources
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_resources_slug ON resources(slug);
CREATE INDEX IF NOT EXISTS idx_resources_publish_date ON resources(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_featured ON resources(is_featured);