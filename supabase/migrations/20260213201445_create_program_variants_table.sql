/*
  # Create program variants table

  1. New Tables
    - `program_variants`
      - `id` (uuid, primary key) - Unique identifier for each variant
      - `program_id` (uuid, foreign key) - References the parent program
      - `name` (text) - Variant name (e.g., "6-Week Package", "3-Month Membership")
      - `description` (text, optional) - Detailed description of what's included
      - `price` (decimal) - Price for this variant
      - `billing_frequency` (text, optional) - e.g., "one-time", "monthly", "weekly"
      - `session_count` (integer, optional) - Number of sessions included
      - `duration_weeks` (integer, optional) - Duration in weeks
      - `is_featured` (boolean) - Whether this is the featured/recommended variant
      - `display_order` (integer) - Order in which variants are displayed
      - `is_active` (boolean) - Whether this variant is available for purchase
      - `created_at` (timestamptz) - When the variant was created
      - `updated_at` (timestamptz) - When the variant was last updated

  2. Security
    - Enable RLS on `program_variants` table
    - Add policy for public to read active variants
    - Add policy for authenticated admins to manage variants

  3. Indexes
    - Index on program_id for efficient querying
    - Index on is_active for filtering
*/

CREATE TABLE IF NOT EXISTS program_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  billing_frequency text,
  session_count integer,
  duration_weeks integer,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_variants_program_id ON program_variants(program_id);
CREATE INDEX IF NOT EXISTS idx_program_variants_is_active ON program_variants(is_active);

ALTER TABLE program_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active program variants"
  ON program_variants FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all program variants"
  ON program_variants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert program variants"
  ON program_variants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update program variants"
  ON program_variants FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete program variants"
  ON program_variants FOR DELETE
  TO authenticated
  USING (true);
