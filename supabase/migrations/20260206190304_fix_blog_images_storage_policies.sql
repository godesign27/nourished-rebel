/*
  # Fix Blog Images Storage Policies
  
  ## Overview
  This migration sets up proper Row Level Security policies for the blog-images storage bucket
  to allow admin users to upload and manage images for blog posts.
  
  ## Changes
  
  1. Storage Bucket Setup
    - Ensure blog-images bucket exists with public access
    - Configure bucket to allow image uploads
    
  2. Storage Policies
    - Admin users can upload images
    - Admin users can update images
    - Admin users can delete images
    - Public users can view images (bucket is public)
    
  ## Security
  - Only authenticated admin users can upload/modify images
  - Public read access for published content
  - No anonymous uploads
*/

-- Create the blog-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete blog images" ON storage.objects;
DROP POLICY IF EXISTS "Public users can view blog images" ON storage.objects;

-- Allow admin users to upload images to blog-images bucket
CREATE POLICY "Admin users can upload blog images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'blog-images' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

-- Allow admin users to update images in blog-images bucket
CREATE POLICY "Admin users can update blog images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'blog-images' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    bucket_id = 'blog-images' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

-- Allow admin users to delete images from blog-images bucket
CREATE POLICY "Admin users can delete blog images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'blog-images' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

-- Allow public access to view images (since bucket is public)
CREATE POLICY "Public users can view blog images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'blog-images');