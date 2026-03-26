/*
  # Add booking and intake form links to programs

  1. Modified Tables
    - `programs`
      - `booking_link` (text, nullable) - URL for scheduling first session
      - `intake_form_link` (text, nullable) - URL for client intake form

  2. Purpose
    - These links are included in purchase confirmation emails
    - Each program can have its own booking and intake form URLs
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programs' AND column_name = 'booking_link'
  ) THEN
    ALTER TABLE programs ADD COLUMN booking_link text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programs' AND column_name = 'intake_form_link'
  ) THEN
    ALTER TABLE programs ADD COLUMN intake_form_link text;
  END IF;
END $$;