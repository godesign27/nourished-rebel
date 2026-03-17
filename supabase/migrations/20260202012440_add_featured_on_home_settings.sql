/*
  # Add Featured Content Settings

  1. Changes to Existing Tables
    - Add `featured_on_home` column to `blog_posts` table
    - Add `featured_on_home` column to `programs` table
    - Add `featured_on_home` column to `resources` table

  2. Notes
    - This allows admins to toggle whether content from each type should be featured on the home page
    - When enabled, the 3 latest posts/programs/resources will display
    - If multiple types are enabled, tabs will allow filtering between them
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'featured_on_home'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN featured_on_home boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programs' AND column_name = 'featured_on_home'
  ) THEN
    ALTER TABLE programs ADD COLUMN featured_on_home boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resources' AND column_name = 'featured_on_home'
  ) THEN
    ALTER TABLE resources ADD COLUMN featured_on_home boolean DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_blog_posts_featured_on_home ON blog_posts(featured_on_home) WHERE featured_on_home = true;
CREATE INDEX IF NOT EXISTS idx_programs_featured_on_home ON programs(featured_on_home) WHERE featured_on_home = true;
CREATE INDEX IF NOT EXISTS idx_resources_featured_on_home ON resources(featured_on_home) WHERE featured_on_home = true;