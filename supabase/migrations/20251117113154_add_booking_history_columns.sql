/*
  # Add Booking History Columns to Quick Bookings

  1. Changes
    - Add `is_quick_purchase` (boolean) - Distinguishes between quick purchases and booking history
    - Add `booking_status` (text) - Tracks booking status (completed, cancelled, etc.)
    - Add `total_price` (integer) - Stores the total payment amount
    - Add `payment_date` (timestamptz) - Records when the payment was completed
    - Set default values for backward compatibility
  
  2. Purpose
    - Enable dual functionality: booking history and quick purchase management
    - Track completed bookings and their payment information
    - Allow conversion from booking history to quick purchase
  
  3. Notes
    - Existing records will have `is_quick_purchase` set to true by default for backward compatibility
    - New booking history entries will have `is_quick_purchase` set to false
    - booking_status defaults to 'completed'
*/

-- Add new columns to quick_bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quick_bookings' AND column_name = 'is_quick_purchase'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN is_quick_purchase boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quick_bookings' AND column_name = 'booking_status'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN booking_status text DEFAULT 'completed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quick_bookings' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN total_price integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quick_bookings' AND column_name = 'payment_date'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN payment_date timestamptz DEFAULT now();
  END IF;
END $$;