/*
  # Add booking preferences to quick_bookings table

  1. Changes
    - Add train_type column (KTX, SAEMAEUL_ITX, MUGUNGHWA, ITX_CHEONGCHUN)
    - Add seat_class column (일반실, 특실)
    - Add seat_position column (창가, 복도, 상관없음)
    - Add seat_direction column (순방향, 역방향, 상관없음)
    - Add adults column for number of adult passengers
    - Add children column for number of child passengers
    - Add seniors column for number of senior passengers
    - Add days_of_week column for repeated booking days (array)
    - Add departure_time column for preferred departure time
    - Add payment_method column (kakaopay, card, toss, naverpay, payco)

  2. Notes
    - All columns have sensible defaults for easy insertion
    - days_of_week is stored as a text array for flexibility
    - Passenger counts default to 1 adult, 0 children, 0 seniors
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quick_bookings' AND column_name = 'train_type'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN train_type text DEFAULT 'KTX';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quick_bookings' AND column_name = 'seat_class'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN seat_class text DEFAULT '일반실';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quick_bookings' AND column_name = 'seat_position'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN seat_position text DEFAULT '창가';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quick_bookings' AND column_name = 'seat_direction'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN seat_direction text DEFAULT '순방향';
  END IF;

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
    WHERE table_name = 'quick_bookings' AND column_name = 'seniors'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN seniors integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quick_bookings' AND column_name = 'days_of_week'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN days_of_week text[] DEFAULT ARRAY['금']::text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quick_bookings' AND column_name = 'departure_time'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN departure_time text DEFAULT '오전 09:00';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quick_bookings' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE quick_bookings ADD COLUMN payment_method text DEFAULT 'kakaopay';
  END IF;
END $$;
