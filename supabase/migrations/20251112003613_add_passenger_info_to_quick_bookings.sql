/*
  # Add passenger information to quick bookings

  1. Changes
    - Add `adults` column (integer, default 1) - Number of adults
    - Add `children` column (integer, default 0) - Number of children
    - Add `infants` column (integer, default 0) - Number of infants
  
  2. Notes
    - These columns allow users to save passenger preferences with quick bookings
    - Default is 1 adult, no children or infants
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quick_bookings' AND column_name = 'adults'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN adults integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quick_bookings' AND column_name = 'children'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN children integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quick_bookings' AND column_name = 'infants'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN infants integer DEFAULT 0;
  END IF;
END $$;

-- Update existing records to have default passenger values
UPDATE quick_bookings
SET adults = 1, children = 0, infants = 0
WHERE adults IS NULL OR children IS NULL OR infants IS NULL;
