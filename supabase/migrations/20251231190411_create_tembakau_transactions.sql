/*
  # Create Tembakau Transaction System

  ## New Tables
  
  ### `transactions`
  - `id` (uuid, primary key)
  - `tanggal` (date) - Transaction date
  - `nama` (text) - Customer/supplier name
  - `jenis` (text) - Transaction type (pembelian/penjualan)
  - `total` (bigint) - Total amount for the transaction
  - `created_at` (timestamptz) - Record creation timestamp

  ### `transaction_items`
  - `id` (uuid, primary key)
  - `transaction_id` (uuid, foreign key) - Links to transactions table
  - `nama_item` (text) - Item name (Tembakau, Kritik, etc)
  - `timbangan` (jsonb) - Array of weight measurements
  - `total_timbang` (integer) - Sum of all weights
  - `berat_bersih` (integer) - Net weight after 5% deduction (floored)
  - `harga` (integer) - Price per kg
  - `subtotal` (bigint) - Item subtotal (berat_bersih × harga)
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on both tables
  - Public access for all operations (since this is for local business use)
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal date NOT NULL,
  nama text NOT NULL,
  jenis text NOT NULL CHECK (jenis IN ('pembelian', 'penjualan')),
  total bigint NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  nama_item text NOT NULL,
  timbangan jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_timbang integer NOT NULL DEFAULT 0,
  berat_bersih integer NOT NULL DEFAULT 0,
  harga integer NOT NULL DEFAULT 0,
  subtotal bigint NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to transactions"
  ON transactions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to transactions"
  ON transactions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to transactions"
  ON transactions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from transactions"
  ON transactions FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to transaction_items"
  ON transaction_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to transaction_items"
  ON transaction_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to transaction_items"
  ON transaction_items FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from transaction_items"
  ON transaction_items FOR DELETE
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_transactions_tanggal ON transactions(tanggal);
CREATE INDEX IF NOT EXISTS idx_transactions_nama ON transactions(nama);
CREATE INDEX IF NOT EXISTS idx_transactions_jenis ON transactions(jenis);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON transaction_items(transaction_id);