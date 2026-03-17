/*
  # Create Admin Authentication Users

  1. Purpose
    - Creates authentication accounts for admin users
    - Sets up amyroseart@gmail.com and godesigngo@gmail.com with initial password

  2. Admin Users
    - amyroseart@gmail.com (password: Admin1234)
    - godesigngo@gmail.com (password: Admin1234)

  3. Security Notes
    - Users can change their passwords after first login
    - Email confirmation is disabled by default in Supabase
    - These users are linked to the admin_users table via email
*/

-- Create the two admin user accounts
-- Note: We're using pgcrypto's crypt function to hash the password
-- The password "Admin1234" will be hashed using bcrypt

DO $$
DECLARE
  admin1_id uuid;
  admin2_id uuid;
BEGIN
  -- Generate UUIDs for the users
  admin1_id := gen_random_uuid();
  admin2_id := gen_random_uuid();

  -- Insert first admin user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'amyroseart@gmail.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      admin1_id,
      '00000000-0000-0000-0000-000000000000',
      'amyroseart@gmail.com',
      crypt('Admin1234', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    );

    -- Insert identity record for email provider
    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      admin1_id::text,
      admin1_id,
      jsonb_build_object('sub', admin1_id::text, 'email', 'amyroseart@gmail.com'),
      'email',
      now(),
      now(),
      now()
    );
  END IF;

  -- Insert second admin user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'godesigngo@gmail.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      admin2_id,
      '00000000-0000-0000-0000-000000000000',
      'godesigngo@gmail.com',
      crypt('Admin1234', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    );

    -- Insert identity record for email provider
    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      admin2_id::text,
      admin2_id,
      jsonb_build_object('sub', admin2_id::text, 'email', 'godesigngo@gmail.com'),
      'email',
      now(),
      now(),
      now()
    );
  END IF;
END $$;
