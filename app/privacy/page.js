"use client";

import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();
  const sectionStyle = { marginBottom: 24 };
  const h2Style = { fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 8 };
  const pStyle = { fontSize: 13, color: "#475569", lineHeight: 1.8, margin: 0 };

  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.back()} style={{
            padding: 8, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)",
            background: "#fff", color: "#64748b", cursor: "pointer", display: "flex", fontFamily: "inherit",
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div style={{ fontSize: 15, fontWeight: 700 }}>개인정보처리방침</div>
        </div>
      </header>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "32px 24px", border: "1px solid rgba(0,0,0,0.06)" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>개인정보처리방침</h1>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 28 }}>시행일: 2026년 4월 1일</p>

          <div style={sectionStyle}>
            <h2 style={h2Style}>1. 수집하는 개인정보 항목</h2>
            <p style={pStyle}>카카오 고유 ID (숫자형 식별자) 1개만 수집합니다. 닉네임, 이메일, 프로필사진 등 추가 개인정보는 일절 수집하지 않습니다.</p>
          </div>
          <div style={sectionStyle}>
            <h2 style={h2Style}>2. 수집 목적</h2>
            <p style={pStyle}>봇 및 악성 접근 방지를 위한 이용자 식별, 서비스 이용 기록 관리 목적으로만 사용합니다.</p>
          </div>
          <div style={sectionStyle}>
            <h2 style={h2Style}>3. 보유 및 이용 기간</h2>
            <p style={pStyle}>계정 삭제(탈퇴) 요청 시 즉시 파기합니다. 별도의 보유 기간은 없습니다.</p>
          </div>
          <div style={sectionStyle}>
            <h2 style={h2Style}>4. 제3자 제공</h2>
            <p style={pStyle}>수집한 카카오 고유 ID는 제3자에게 제공하지 않습니다.</p>
          </div>
          <div style={sectionStyle}>
            <h2 style={h2Style}>5. 처리 위탁</h2>
            <p style={pStyle}>서비스 운영을 위해 다음 외부 서비스를 이용합니다: Supabase(데이터베이스 호스팅), Vercel(웹 호스팅). 해당 서비스는 데이터 처리 목적으로만 이용되며, 독자적으로 개인정보를 활용하지 않습니다.</p>
          </div>
          <div style={sectionStyle}>
            <h2 style={h2Style}>6. 이용자의 권리</h2>
            <p style={pStyle}>이용자는 언제든지 서비스 내 계정 삭제 기능을 통해 개인정보 삭제를 요청할 수 있습니다. 기타 문의는 카카오채널을 통해 연락해주세요.</p>
          </div>
          <div>
            <h2 style={h2Style}>7. 개인정보 보호책임자</h2>
            <p style={pStyle}>
              담당자: 박유빈<br />
              연락처: 카카오채널 &quot;생글생글&quot; (<a href="http://pf.kakao.com/_TxfbMX" target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1" }}>http://pf.kakao.com/_TxfbMX</a>)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
