/*
  # Fix Admin Authentication Approach

  1. Purpose
    - Remove direct manipulation of auth.users and auth.identities tables
    - Clean approach: admin_users table only tracks admin emails
    - Users must sign up through Supabase's normal auth flow

  2. Changes
    - This migration ensures admin_users table is properly set up
    - Admin users should sign up normally, then their email is checked against admin_users table

  3. Security
    - No direct auth schema manipulation
    - Relies on Supabase's built-in auth system
    - Admin status is determined by presence in admin_users table
*/

-- Ensure admin_users table exists with correct structure
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can check admin status" ON admin_users;
  
  CREATE POLICY "Authenticated users can check admin status"
    ON admin_users
    FOR SELECT
    TO authenticated
    USING (true);
END $$;

-- Ensure the admin emails are in the table
INSERT INTO admin_users (email)
VALUES 
  ('amyroseart@gmail.com'),
  ('godesigngo@gmail.com')
ON CONFLICT (email) DO NOTHING;
