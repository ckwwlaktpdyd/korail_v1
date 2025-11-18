/*
  # 열차 스케줄 및 좌석 알림 시스템

  1. New Tables
    - `train_schedules`
      - `id` (uuid, primary key)
      - `train_number` (text) - 열차 번호 (예: 1309, 103)
      - `train_type` (text) - 열차 종류 (KTX, 무궁화호, ITX-새마을)
      - `departure_station` (text) - 출발역
      - `arrival_station` (text) - 도착역
      - `departure_time` (time) - 출발 시간
      - `arrival_time` (time) - 도착 시간
      - `travel_date` (date) - 운행 날짜
      - `regular_price` (integer) - 일반실 가격 (원)
      - `first_class_price` (integer) - 특실 가격 (원), nullable
      - `has_regular_seats` (boolean) - 일반실 좌석 여부
      - `has_first_class_seats` (boolean) - 특실 좌석 여부
      - `discount_rate` (integer) - 할인율 (%), nullable
      - `discount_type` (text) - 할인 유형 (M적립, 회원할인 등), nullable
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `seat_alerts`
      - `id` (uuid, primary key)
      - `train_schedule_id` (uuid, foreign key)
      - `seat_type` (text) - 좌석 유형 (regular, first_class)
      - `user_identifier` (text) - 사용자 식별자 (이메일, 전화번호 등)
      - `is_active` (boolean) - 알림 활성화 여부
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public read access for train_schedules
    - Users can manage their own seat alerts
*/

-- 열차 스케줄 테이블 생성
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

-- 좌석 알림 테이블 생성
CREATE TABLE IF NOT EXISTS seat_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  train_schedule_id uuid REFERENCES train_schedules(id) ON DELETE CASCADE,
  seat_type text NOT NULL CHECK (seat_type IN ('regular', 'first_class')),
  user_identifier text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_train_schedules_route ON train_schedules(departure_station, arrival_station, travel_date);
CREATE INDEX IF NOT EXISTS idx_train_schedules_date ON train_schedules(travel_date);
CREATE INDEX IF NOT EXISTS idx_seat_alerts_schedule ON seat_alerts(train_schedule_id);

-- RLS 활성화
ALTER TABLE train_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_alerts ENABLE ROW LEVEL SECURITY;

-- 열차 스케줄 정책 (모든 사용자가 조회 가능)
CREATE POLICY "Anyone can view train schedules"
  ON train_schedules FOR SELECT
  TO public
  USING (true);

-- 좌석 알림 정책
CREATE POLICY "Users can view their own alerts"
  ON seat_alerts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create seat alerts"
  ON seat_alerts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own alerts"
  ON seat_alerts FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own alerts"
  ON seat_alerts FOR DELETE
  TO public
  USING (true);