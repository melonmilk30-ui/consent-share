# 생글생글 - 에듀테크 개인정보 동의서 플랫폼

## 🚀 배포 가이드 (순서대로 따라하세요!)

### 1단계: GitHub에 코드 올리기
1. 기존 `consent-share-main` 폴더의 파일을 **전부 삭제**
2. 이 ZIP 안의 파일을 **전부 복사**해서 넣기
3. GitHub Desktop 또는 터미널에서:
   ```
   git add .
   git commit -m "v0.2: 전체 기능 업데이트"
   git push
   ```
4. Vercel이 자동으로 배포됨!

### 2단계: Supabase SQL 실행
1. Supabase 대시보드 → **SQL Editor** 열기
2. `SETUP_SQL.sql` 파일 내용을 **전부 복사**해서 붙여넣기
3. **Run** 클릭!

### 3단계: Vercel 환경변수 추가
Vercel → 프로젝트 → Settings → Environment Variables에 추가:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | (이미 있으면 그대로) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (이미 있으면 그대로) |
| `ANTHROPIC_API_KEY` | `sk-ant-xxxxx...` (Claude API 키) |

⚠️ ANTHROPIC_API_KEY는 앞에 NEXT_PUBLIC_ 붙이지 마세요!

### 4단계: 카카오 개발자 콘솔 설정
1. 카카오 개발자 → 내 앱 → 카카오 로그인 → **동의항목**
   - 닉네임, 프로필사진, 이메일 → **사용 안 함** 으로 변경
2. **Redirect URI** 확인 (이미 있으면 그대로):
   - `https://lnkeeioibishoprwxwav.supabase.co/auth/v1/callback`

### 5단계: 관리자 설정
1. 카카오 로그인을 한 번 해서 가입 완료
2. Supabase → SQL Editor에서 실행:
   ```sql
   UPDATE users SET is_admin = TRUE WHERE kakao_id = '여기에_본인_카카오ID';
   ```
   (카카오 ID는 Supabase → Table Editor → users에서 확인)

### 6단계: 도메인 연결 (나중에)
1. Vercel → Settings → Domains → `consent.saenggle.com` 추가
2. DNS에 CNAME 레코드 추가: `consent` → `cname.vercel-dns.com`
3. Supabase → Auth → URL Configuration:
   - Site URL → `https://consent.saenggle.com`
   - Redirect URLs → `https://consent.saenggle.com/**` 추가
4. 카카오 개발자 → Redirect URI에 추가:
   - `https://consent.saenggle.com/auth/callback`

---

## 📁 파일 구조
```
consent-share-main/
├── app/
│   ├── auth/callback/route.js  ← 카카오 로그인 콜백
│   ├── login/page.js           ← 로그인 페이지
│   ├── agree/page.js           ← 약관 동의 (첫 방문)
│   ├── page.js                 ← 메인 페이지
│   ├── services/page.js        ← 생글생글 서비스 목록
│   ├── terms/page.js           ← 이용약관
│   ├── privacy/page.js         ← 개인정보처리방침
│   ├── api/
│   │   ├── register/route.js   ← Claude API 연결 + 등록
│   │   ├── search/route.js     ← 검색
│   │   ├── admin/route.js      ← 관리자 삭제
│   │   ├── delete-account/route.js ← 계정 삭제
│   │   └── check-user/route.js ← 유저/관리자 확인
│   ├── layout.js
│   └── globals.css
├── lib/
│   ├── supabase.js             ← 브라우저용 클라이언트
│   └── supabase-server.js      ← 서버용 클라이언트
├── middleware.js                ← 세션 갱신
├── SETUP_SQL.sql               ← Supabase 테이블 생성 SQL
└── README.md                   ← 이 파일
```

## 🔒 보안
- API 키는 Vercel 환경변수에만 저장 (코드에 없음)
- 카카오 고유 ID만 수집 (닉네임/이메일 수집 안 함)
- RLS 정책으로 DB 접근 제어

## © 2026 생글생글
카카오채널: http://pf.kakao.com/_TxfbMX
