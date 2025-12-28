/*
  # Create Invoice PDFs Storage Bucket

  ## Summary
  Creates a storage bucket for generated invoice PDFs that can be downloaded
  directly by customers when shared via WhatsApp or email.

  ## Changes

  ### 1. Storage Bucket
  - Creates `invoice-pdfs` bucket for storing generated PDF files
  - Public access for downloads via share links
  - Organized by user_id/invoice_id structure

  ### 2. Storage Policies
  - Users can upload PDFs for their own invoices
  - Anyone can download PDFs (public read access for sharing)
  - Users can delete their own invoice PDFs

  ## Security
  - Upload restricted to authenticated users for their own invoices
  - Public read access allows customers to download via share links
  - Delete restricted to invoice owners
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('invoice-pdfs', 'invoice-pdfs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own invoice PDFs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'invoice-pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can download invoice PDFs"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'invoice-pdfs');

CREATE POLICY "Users can delete their own invoice PDFs"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'invoice-pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );