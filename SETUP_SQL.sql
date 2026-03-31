-- ==========================================
-- 생글생글 동의서 공유 - Supabase SQL 설정
-- Supabase 대시보드 → SQL Editor에서 실행하세요
-- ==========================================

-- 1. users 테이블 생성 (회원 관리)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kakao_id TEXT UNIQUE NOT NULL,
  agreed_at TIMESTAMPTZ DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. services 테이블에 누락 컬럼 추가
-- (이미 있는 컬럼은 에러나도 무시하면 됩니다)
ALTER TABLE services ADD COLUMN IF NOT EXISTS name_en TEXT DEFAULT '';
ALTER TABLE services ADD COLUMN IF NOT EXISTS registered_by TEXT DEFAULT '';

-- 3. 차차를 관리자로 등록 (카카오 로그인 후 확인되는 ID로 교체)
-- 일단 비워두고, 첫 로그인 후 아래 쿼리로 관리자 설정:
-- UPDATE users SET is_admin = TRUE WHERE kakao_id = '여기에_차차_카카오ID';

-- 4. RLS (Row Level Security) 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- users: 인증된 사용자만 본인 데이터 접근
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = kakao_id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = kakao_id);

CREATE POLICY "Users can delete own data" ON users
  FOR DELETE USING (auth.uid()::text = kakao_id);

-- services: 누구나 읽기 가능, 인증된 사용자만 등록 가능
CREATE POLICY "Anyone can read services" ON services
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert services" ON services
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete services" ON services
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.kakao_id = auth.uid()::text
      AND users.is_admin = TRUE
    )
  );
