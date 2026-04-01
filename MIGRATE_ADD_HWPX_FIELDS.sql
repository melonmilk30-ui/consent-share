-- ==========================================
-- hwpx 생성에 필요한 컬럼 추가
-- Supabase 대시보드 → SQL Editor에서 실행하세요
-- ==========================================

-- 1. case_type: hwpx 템플릿 선택용 (foreign_no_signup, foreign_with_signup, domestic_no_signup, domestic_with_signup)
ALTER TABLE services ADD COLUMN IF NOT EXISTS case_type TEXT DEFAULT '';

-- 2. transfer_country: 국외이전 국가 (국외기업만)
ALTER TABLE services ADD COLUMN IF NOT EXISTS transfer_country TEXT DEFAULT '';

-- 3. transfer_method: 국외이전 방법 (국외기업만)
ALTER TABLE services ADD COLUMN IF NOT EXISTS transfer_method TEXT DEFAULT '';

-- 4. third_party_items: 제3자 제공 항목 (없으면 수집항목과 동일하게 처리)
ALTER TABLE services ADD COLUMN IF NOT EXISTS third_party_items TEXT DEFAULT '';

-- 5. 기존 데이터의 cases 값을 case_type으로 마이그레이션 (수동)
-- 필요시 아래 쿼리로 기존 데이터 확인:
-- SELECT id, name, cases, overseas_transfer, guardian_consent FROM services;
--
-- 수동 업데이트 예시:
-- UPDATE services SET case_type = 'foreign_no_signup' WHERE overseas_transfer = true AND guardian_consent = false;
-- UPDATE services SET case_type = 'foreign_with_signup' WHERE overseas_transfer = true AND guardian_consent = true;
-- UPDATE services SET case_type = 'domestic_no_signup' WHERE overseas_transfer = false AND guardian_consent = false;
-- UPDATE services SET case_type = 'domestic_with_signup' WHERE overseas_transfer = false AND guardian_consent = true;
