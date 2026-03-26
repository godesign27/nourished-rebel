/*
  # Add admin SELECT policy for program_purchases

  1. Security Changes
    - Add new RLS policy on `program_purchases` allowing admin users to view all purchases
    - Admin users are identified by matching their auth email against the `admin_users` table

  2. Notes
    - Both admin accounts (amyroseart@gmail.com, godesigngo@gmail.com) will now see all subscriber purchases
    - Regular users continue to only see their own purchases via the existing policy
*/

CREATE POLICY "Admins can view all purchases"
  ON program_purchases
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT auth.jwt() ->> 'email')
    )
  );
