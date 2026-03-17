/*
  # Add idempotency columns to program_purchases

  1. Changes
    - Add `stripe_event_id` column to track which Stripe webhook event completed the purchase
    - Add `emails_sent` column to track whether confirmation emails were sent
    - These columns prevent duplicate processing from webhook retries

  2. Purpose
    - Enables idempotent webhook processing
    - Prevents duplicate email notifications
    - Provides audit trail for debugging
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'program_purchases' AND column_name = 'stripe_event_id'
  ) THEN
    ALTER TABLE program_purchases ADD COLUMN stripe_event_id text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'program_purchases' AND column_name = 'emails_sent'
  ) THEN
    ALTER TABLE program_purchases ADD COLUMN emails_sent boolean DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_program_purchases_stripe_event_id 
ON program_purchases(stripe_event_id) 
WHERE stripe_event_id IS NOT NULL;