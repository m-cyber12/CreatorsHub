-- Migration 0016: Paid Orders & Fast-Track Promotions
-- Stores tool submission orders, crypto payments, and promotion durations.

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  tagline TEXT NOT NULL,
  category TEXT NOT NULL,
  pricing TEXT NOT NULL,
  founder_email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  amount_usd NUMERIC NOT NULL DEFAULT 0,
  crypto_currency TEXT DEFAULT 'USDT-TON',
  wallet_address TEXT,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_founder_email ON orders(founder_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on orders"
  ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can create order"
  ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can read order by id"
  ON orders
  FOR SELECT
  TO anon
  USING (true);
