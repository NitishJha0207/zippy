/*
  # Create Company Logos Storage Bucket

  1. Storage Setup
    - Create `company-logos` storage bucket
    - Set bucket as public for read access
    - Configure bucket settings for image files

  2. Security Policies
    - Allow authenticated users to upload logos to their own folder
    - Allow public read access to all logos
    - Allow authenticated users to update their own logos
    - Allow authenticated users to delete their own logos

  3. Important Notes
    - Each user's logo is stored in their own folder: `{user_id}/logo.{ext}`
    - Bucket is public for read access so logos can be displayed on invoices
    - Users can only modify files in their own folder
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own logo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'company-logos');

CREATE POLICY "Users can update their own logo"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'company-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own logo"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);