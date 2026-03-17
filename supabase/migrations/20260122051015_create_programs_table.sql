/*
  # Create programs table

  ## Overview
  This migration creates the programs table for storing coaching programs and courses.
  
  ## Changes
  
  1. New Tables
    - `programs`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text) - Program name
      - `category` (text) - Program category (e.g., "1:1 Coaching", "Group Program")
      - `summary` (text) - Brief program description
      - `description` (text) - Full program details
      - `ideal_participant` (text) - Who this program is for
      - `duration` (text) - Program length (e.g., "8 weeks", "Self-paced")
      - `cta_label` (text) - Call-to-action button text
      - `price` (numeric) - Program price
      - `image_url` (text) - URL to program image
      - `slug` (text, unique) - URL-friendly identifier
      - `is_active` (boolean) - Whether program is currently available
      - `display_order` (integer) - Sort order for display
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `programs` table
    - Add policy for public read access to active programs
    - Programs are read-only for anonymous users
  
  3. Indexes
    - Index on `slug` for efficient lookup
    - Index on `is_active` for filtering active programs
    - Index on `display_order` for sorting
*/

CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  summary text NOT NULL,
  description text,
  ideal_participant text,
  duration text NOT NULL,
  cta_label text NOT NULL DEFAULT 'Learn More',
  price numeric(10, 2),
  image_url text,
  slug text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active programs are publicly readable"
  ON programs
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_programs_slug ON programs(slug);
CREATE INDEX IF NOT EXISTS idx_programs_active ON programs(is_active);
CREATE INDEX IF NOT EXISTS idx_programs_display_order ON programs(display_order);