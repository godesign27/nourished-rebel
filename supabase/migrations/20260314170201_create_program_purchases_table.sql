/*
  # Create program purchases tracking table

  1. New Tables
    - `program_purchases`
      - `id` (uuid, primary key) - Unique identifier for each purchase
      - `auth_user_id` (uuid, references auth.users) - Customer from auth system (nullable for guest checkouts)
      - `program_id` (uuid, foreign key) - References the purchased program
      - `variant_id` (uuid, foreign key, optional) - References the program variant if applicable
      - `stripe_checkout_session_id` (text, unique) - Stripe checkout session ID
      - `stripe_payment_intent_id` (text) - Stripe payment intent ID
      - `status` (text) - Purchase status: pending, completed, failed, refunded
      - `amount` (decimal) - Amount paid
      - `currency` (text) - Currency code (default: usd)
      - `customer_email` (text) - Customer email from Stripe
      - `customer_name` (text) - Customer name from Stripe
      - `program_snapshot` (jsonb) - Snapshot of program data at purchase time
      - `created_at` (timestamptz) - When the purchase was created
      - `updated_at` (timestamptz) - When the purchase was last updated
      - `completed_at` (timestamptz) - When the payment was completed

  2. Security
    - Enable RLS on table
    - Users can view their own purchases
    - System can insert/update via Edge Functions

  3. Indexes
    - Index on auth_user_id for efficient user purchase queries
    - Index on stripe_checkout_session_id for webhook lookups
    - Index on status for filtering
*/

CREATE TABLE IF NOT EXISTS program_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES program_variants(id) ON DELETE SET NULL,
  stripe_checkout_session_id text UNIQUE,
  stripe_payment_intent_id text,
  status text NOT NULL DEFAULT 'pending',
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'usd',
  customer_email text NOT NULL,
  customer_name text,
  program_snapshot jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT valid_purchase_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

CREATE INDEX IF NOT EXISTS idx_program_purchases_auth_user ON program_purchases(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_program_purchases_stripe_session ON program_purchases(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_program_purchases_status ON program_purchases(status);

ALTER TABLE program_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases"
  ON program_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);
