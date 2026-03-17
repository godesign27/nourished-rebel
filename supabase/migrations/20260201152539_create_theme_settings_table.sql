/*
  # Create Theme Settings Table
  
  ## Overview
  This migration creates a table to store customizable theme settings including colors and fonts.
  The theme system allows admins to customize brand colors and typography throughout the site.
  
  ## Changes
  
  ### 1. New theme_settings Table
  - `id` (uuid, primary key) - Unique identifier
  - `key` (text, unique) - Setting key (e.g., 'colors', 'fonts')
  - `value` (jsonb) - Setting value as JSON
  - `updated_at` (timestamptz) - Last update timestamp
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 2. Security (RLS)
  - Enable RLS on theme_settings table
  - Anyone can read theme settings (public access for live site)
  - Only admins can insert/update/delete theme settings
  
  ### 3. Performance
  - Index on key for fast lookups
  - Function to automatically update updated_at timestamp
  
  ### 4. Initial Data
  - Insert default color scheme based on Nourished Rebel brand colors
  - Insert default font settings
  
  ## Security Notes
  - Public read access allows theme to be applied on live site
  - Write access restricted to admin users only
  - All admin checks use optimized RLS pattern
*/

-- Create theme_settings table
CREATE TABLE IF NOT EXISTS theme_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

-- Create index on key
CREATE INDEX IF NOT EXISTS idx_theme_settings_key ON theme_settings(key);

-- Public read access (needed for live site)
CREATE POLICY "Anyone can read theme settings"
  ON theme_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin insert access
CREATE POLICY "Admins can insert theme settings"
  ON theme_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- Admin update access
CREATE POLICY "Admins can update theme settings"
  ON theme_settings
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

-- Admin delete access
CREATE POLICY "Admins can delete theme settings"
  ON theme_settings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt()->>'email')
    )
  );

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_theme_settings_timestamp()
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

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_theme_settings_timestamp_trigger ON theme_settings;
CREATE TRIGGER update_theme_settings_timestamp_trigger
  BEFORE UPDATE ON theme_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_theme_settings_timestamp();

-- Insert default color scheme
INSERT INTO theme_settings (key, value) VALUES (
  'colors',
  '{
    "brand": {
      "50": "#F8F7F6",
      "100": "#F0EEEC",
      "200": "#DED9D5",
      "300": "#C3BAB3",
      "400": "#A1938A",
      "500": "#675C53",
      "600": "#524741",
      "700": "#423A34",
      "800": "#332D29",
      "900": "#282421",
      "950": "#1A1816"
    },
    "cream": {
      "50": "#FDFCFB",
      "100": "#FAF7F4",
      "200": "#EFE9E3",
      "300": "#E3DBD2",
      "400": "#D6CFC4",
      "500": "#C4BCB3",
      "600": "#A8A099",
      "700": "#87827C",
      "800": "#6B6762",
      "900": "#54504C",
      "950": "#333130"
    },
    "stone": {
      "50": "#F9F7F5",
      "100": "#F3EFEB",
      "200": "#E8E1D9",
      "300": "#D6CFC4",
      "400": "#C3BAB0",
      "500": "#AFA599",
      "600": "#948B81",
      "700": "#77706A",
      "800": "#5E5955",
      "900": "#4C4845",
      "950": "#2E2C2A"
    },
    "olive": {
      "50": "#F7F9EB",
      "100": "#EDF3D3",
      "200": "#DCE7AC",
      "300": "#C5D67A",
      "400": "#B3C658",
      "500": "#A6B640",
      "600": "#889630",
      "700": "#687328",
      "800": "#535B24",
      "900": "#464E22",
      "950": "#252B0F"
    },
    "terracotta": {
      "50": "#FBF5F2",
      "100": "#F7E8E1",
      "200": "#EECFC2",
      "300": "#E4AE9A",
      "400": "#D69878",
      "500": "#C6866A",
      "600": "#B16B50",
      "700": "#935642",
      "800": "#79483A",
      "900": "#643E33",
      "950": "#361F19"
    },
    "clay": {
      "50": "#FBF5F0",
      "100": "#F6E8DC",
      "200": "#EDCEB8",
      "300": "#E2AD89",
      "400": "#D79368",
      "500": "#C78553",
      "600": "#B56D42",
      "700": "#975739",
      "800": "#7A4733",
      "900": "#643C2C",
      "950": "#361E16"
    },
    "charcoal": {
      "50": "#F6F5F5",
      "100": "#EBEAEA",
      "200": "#D8D6D4",
      "300": "#BCB8B4",
      "400": "#9A9390",
      "500": "#7E7774",
      "600": "#6A6562",
      "700": "#575350",
      "800": "#4A4744",
      "900": "#3F3A36",
      "950": "#282523"
    },
    "success": {
      "50": "#F0F9F4",
      "100": "#DCEFE4",
      "200": "#BBDFCC",
      "300": "#8BC9AB",
      "400": "#57AB83",
      "500": "#359066",
      "600": "#267352",
      "700": "#1F5C43",
      "800": "#1B4937",
      "900": "#173C2E",
      "950": "#0B221A"
    },
    "warning": {
      "50": "#FBF7F0",
      "100": "#F6ECDB",
      "200": "#EDD7B8",
      "300": "#E2BB8A",
      "400": "#D69B5E",
      "500": "#CC803F",
      "600": "#BE6733",
      "700": "#9E4F2C",
      "800": "#7F4028",
      "900": "#673524",
      "950": "#381911"
    },
    "error": {
      "50": "#FDF4F3",
      "100": "#FCE7E4",
      "200": "#FAD3CD",
      "300": "#F5B3AA",
      "400": "#ED8578",
      "500": "#E0604E",
      "600": "#CC4434",
      "700": "#AB3528",
      "800": "#8D3025",
      "900": "#752E25",
      "950": "#40140F"
    },
    "info": {
      "50": "#F4F7F9",
      "100": "#E9EEF2",
      "200": "#D7E2E8",
      "300": "#B8CCD8",
      "400": "#94B0C4",
      "500": "#7796B3",
      "600": "#637FA2",
      "700": "#556C91",
      "800": "#495B78",
      "900": "#3F4D63",
      "950": "#29313E"
    }
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- Insert default font settings
INSERT INTO theme_settings (key, value) VALUES (
  'fonts',
  '{
    "heading": {
      "family": "SF Pro, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
      "weights": ["400", "600", "700"]
    },
    "body": {
      "family": "SF Pro, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
      "weights": ["400", "500", "600"]
    }
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;
