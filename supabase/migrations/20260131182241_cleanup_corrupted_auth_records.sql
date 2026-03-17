/*
  # Cleanup Corrupted Auth Records

  1. Purpose
    - Remove manually inserted auth records that are corrupting the auth system
    - These records were incorrectly inserted directly into auth.users and auth.identities
    - Supabase's auth system must manage these tables internally

  2. Changes
    - Delete corrupted auth.users records for admin emails
    - Delete corrupted auth.identities records for admin emails
    - Allow users to sign up properly through Supabase's auth system

  3. Security
    - Admin status is still tracked in the admin_users table
    - Users must sign up through proper Supabase auth flow
*/

-- Delete corrupted auth records that were manually inserted
DO $$
BEGIN
  -- Delete from auth.identities first (due to foreign key constraints)
  DELETE FROM auth.identities
  WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('amyroseart@gmail.com', 'godesigngo@gmail.com', 'godesigno@gmail.com')
    AND instance_id = '00000000-0000-0000-0000-000000000000'
  );

  -- Delete from auth.users
  DELETE FROM auth.users
  WHERE email IN ('amyroseart@gmail.com', 'godesigngo@gmail.com', 'godesigno@gmail.com')
  AND instance_id = '00000000-0000-0000-0000-000000000000';
  
END $$;
