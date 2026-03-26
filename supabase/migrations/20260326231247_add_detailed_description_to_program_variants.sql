/*
  # Add detailed description to program variants

  1. Modified Tables
    - `program_variants`
      - `detailed_description` (text, nullable) - Rich HTML content for variant's full description, 
        displayed on the program detail page when a user selects this variant

  2. Notes
    - This field stores WYSIWYG-generated HTML content
    - Used to provide extensive copy about each program variant
    - Displayed on both the admin editor (left panel preview) and the public program detail page
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'program_variants' AND column_name = 'detailed_description'
  ) THEN
    ALTER TABLE program_variants ADD COLUMN detailed_description text;
  END IF;
END $$;
