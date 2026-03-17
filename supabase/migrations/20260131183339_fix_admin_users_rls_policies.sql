/*
  # Fix Admin Users RLS Policies

  1. Changes
    - Remove the restrictive "Only admins can view admin users" policy that creates a circular dependency
    - Keep the permissive policy that allows authenticated users to check their admin status
    - This allows the frontend to properly check if a logged-in user is an admin
  
  2. Security
    - Authenticated users can query the admin_users table to check if their email is in it
    - This is safe because users can only see if they themselves are admins
    - The table only contains email addresses (no sensitive data)
*/

DROP POLICY IF EXISTS "Only admins can view admin users" ON admin_users;
