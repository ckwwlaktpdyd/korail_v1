/*
  # Create quick bookings table

  1. New Tables
    - `quick_bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable for now - can be used for multi-user support later)
      - `label` (text) - Display name like "집", "출장"
      - `departure` (text) - Departure station
      - `arrival` (text) - Arrival station
      - `train_type` (text) - Train type like "KTX"
      - `order_index` (integer) - For sorting
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `quick_bookings` table
    - Add policy for public access (since we don't have auth yet)
    - This allows anyone to manage bookings for demonstration purposes
*/

CREATE TABLE IF NOT EXISTS quick_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  label text NOT NULL,
  departure text NOT NULL,
  arrival text NOT NULL,
  train_type text DEFAULT 'KTX',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quick_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON quick_bookings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access"
  ON quick_bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON quick_bookings
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON quick_bookings
  FOR DELETE
  TO public
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_quick_bookings_order 
  ON quick_bookings(order_index);

-- Insert default quick bookings
INSERT INTO quick_bookings (label, departure, arrival, train_type, order_index) VALUES
  ('집', '서울', '부산', 'KTX', 1),
  ('출장', '광명', '부산', 'KTX', 2)
ON CONFLICT DO NOTHING;