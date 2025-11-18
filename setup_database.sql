-- KTX 예약 시스템 데이터베이스 전체 설정
-- Supabase SQL Editor에서 이 전체 내용을 복사해서 한 번에 실행하세요

-- 1. 빠른 예매 테이블 생성
CREATE TABLE IF NOT EXISTS quick_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  label text NOT NULL,
  departure text NOT NULL,
  arrival text NOT NULL,
  train_type text DEFAULT 'KTX',
  adults integer DEFAULT 1,
  children integer DEFAULT 0,
  infants integer DEFAULT 0,
  seat_class text DEFAULT '일반실',
  seat_direction text DEFAULT '순방향',
  car_number integer,
  seat_numbers text,
  departure_time text,
  days_of_week text[],
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. 열차 스케줄 테이블 생성
CREATE TABLE IF NOT EXISTS train_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  train_number text NOT NULL,
  train_type text NOT NULL,
  departure_station text NOT NULL,
  arrival_station text NOT NULL,
  departure_time time NOT NULL,
  arrival_time time NOT NULL,
  travel_date date NOT NULL,
  regular_price integer NOT NULL,
  first_class_price integer,
  has_regular_seats boolean DEFAULT true,
  has_first_class_seats boolean DEFAULT false,
  discount_rate integer DEFAULT 0,
  discount_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. 좌석 알림 테이블 생성
CREATE TABLE IF NOT EXISTS seat_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  train_schedule_id uuid REFERENCES train_schedules(id) ON DELETE CASCADE,
  seat_type text NOT NULL CHECK (seat_type IN ('regular', 'first_class')),
  user_identifier text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 4. 보안 설정 (RLS)
ALTER TABLE quick_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE train_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_alerts ENABLE ROW LEVEL SECURITY;

-- 5. 접근 권한 설정 (모든 사용자가 데이터 조회/수정 가능)
CREATE POLICY "Anyone can do anything with quick_bookings" ON quick_bookings FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can view train schedules" ON train_schedules FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can do anything with seat_alerts" ON seat_alerts FOR ALL TO public USING (true) WITH CHECK (true);

-- 6. 인덱스 생성 (검색 속도 향상)
CREATE INDEX IF NOT EXISTS idx_quick_bookings_order ON quick_bookings(order_index);
CREATE INDEX IF NOT EXISTS idx_train_schedules_route ON train_schedules(departure_station, arrival_station, travel_date);
CREATE INDEX IF NOT EXISTS idx_seat_alerts_schedule ON seat_alerts(train_schedule_id);

-- 7. 기본 데이터 추가
INSERT INTO quick_bookings (label, departure, arrival, train_type, order_index) VALUES
  ('집', '서울', '부산', 'KTX', 1),
  ('출장', '광명', '부산', 'KTX', 2)
ON CONFLICT DO NOTHING;



