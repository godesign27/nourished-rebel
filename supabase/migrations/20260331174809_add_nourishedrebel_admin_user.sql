/*
  # Add nourishedrebel admin user

  1. Changes
    - Add `nourishedrebel@gmail.com` to the `admin_users` table
    - This grants full admin access (CRUD on programs, variants, blog posts, etc.)

  2. Notes
    - Without this entry, RLS policies silently block write operations for this user
*/

INSERT INTO admin_users (email)
SELECT 'nourishedrebel@gmail.com'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE email = 'nourishedrebel@gmail.com'
);
