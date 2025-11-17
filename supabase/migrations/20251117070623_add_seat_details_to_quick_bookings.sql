/*
  # Add seat details to quick_bookings table

  1. Changes
    - Add `car_number` column (integer) to store train car number (e.g., 16)
    - Add `seat_numbers` column (text) to store seat numbers (e.g., "7D" or "7D, 8D")
  
  2. Notes
    - These columns are optional and can be null
    - Seat numbers are stored as text to support various formats (e.g., "7D", "1A", "12")
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quick_bookings' AND column_name = 'car_number'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN car_number integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quick_bookings' AND column_name = 'seat_numbers'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN seat_numbers text;
  END IF;
END $$;
