/*
  # Create About Page Content Table

  1. New Tables
    - `about_page_content`
      - `id` (uuid, primary key) - Unique identifier
      - `image_url` (text) - URL of the about page hero image
      - `content` (text) - About page main content/copy
      - `created_at` (timestamptz) - When the record was created
      - `updated_at` (timestamptz) - When the record was last updated

  2. Security
    - Enable RLS on `about_page_content` table
    - Add policy for public read access (anyone can view the about page)
    - Add policy for authenticated admin users to update content

  3. Initial Data
    - Insert a default row to ensure there's always content available
*/

CREATE TABLE IF NOT EXISTS about_page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text DEFAULT '',
  content text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE about_page_content ENABLE ROW LEVEL SECURITY;

-- Public can read about page content
CREATE POLICY "Anyone can view about page content"
  ON about_page_content
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can update about page content
CREATE POLICY "Authenticated users can update about page content"
  ON about_page_content
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can insert about page content
CREATE POLICY "Authenticated users can insert about page content"
  ON about_page_content
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default content if none exists
INSERT INTO about_page_content (image_url, content)
SELECT 
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
  '<h2>Welcome to Our Story</h2><p>This is where your about page content will go. Use the admin panel to customize this text and add your own image.</p><p>Share your journey, your mission, and what makes your coaching practice unique.</p>'
WHERE NOT EXISTS (SELECT 1 FROM about_page_content LIMIT 1);