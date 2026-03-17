/*
  # Fix Programs Public Access Policy

  ## Issue
  The public RLS policy for programs checks `status = 'published'` but the actual
  data uses `status = 'active'`. This causes program detail pages to be blank for
  anonymous users.

  ## Changes
  Update the public SELECT policy to check for `status = 'active'` and `is_active = true`
  to match the actual data model and application logic.
*/

DROP POLICY IF EXISTS "Public can view published programs" ON programs;

CREATE POLICY "Public can view published programs"
  ON programs FOR SELECT
  TO public
  USING (status = 'active' AND is_active = true);
