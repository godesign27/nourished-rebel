/*
  # Create Social Media Links Table

  1. New Tables
    - `social_media_links`
      - `id` (uuid, primary key)
      - `platform` (text) - e.g., 'facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'pinterest'
      - `url` (text) - the full URL to the social media profile
      - `display_order` (integer) - order in which to display the links
      - `is_active` (boolean) - whether to show this link
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `social_media_links` table
    - Add policy for public read access (anyone can view)
    - Add policy for authenticated admin users to manage links
*/

CREATE TABLE IF NOT EXISTS social_media_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE social_media_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active social media links"
  ON social_media_links
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all social media links"
  ON social_media_links
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert social media links"
  ON social_media_links
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update social media links"
  ON social_media_links
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete social media links"
  ON social_media_links
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_social_media_links_display_order ON social_media_links(display_order);
CREATE INDEX IF NOT EXISTS idx_social_media_links_is_active ON social_media_links(is_active);