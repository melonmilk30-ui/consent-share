"use client";

import { useRouter } from "next/navigation";

export default function TermsPage() {
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
          <div style={{ fontSize: 15, fontWeight: 700 }}>이용약관</div>
        </div>
      </header>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "32px 24px", border: "1px solid rgba(0,0,0,0.06)" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>이용약관</h1>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 28 }}>시행일: 2026년 4월 1일</p>

          <div style={sectionStyle}>
            <h2 style={h2Style}>제1조 (목적)</h2>
            <p style={pStyle}>이 약관은 생글생글(이하 &quot;서비스&quot;)이 제공하는 에듀테크 개인정보 동의서 생성 및 공유 서비스의 이용 조건과 절차를 규정함을 목적으로 합니다.</p>
          </div>
          <div style={sectionStyle}>
            <h2 style={h2Style}>제2조 (서비스 내용)</h2>
            <p style={pStyle}>서비스는 에듀테크 서비스의 이용약관을 AI로 분석하여 학교용 개인정보 수집·이용 동의서를 자동 생성하고, 이를 다른 이용자와 공유·다운로드할 수 있는 기능을 제공합니다.</p>
          </div>
          <div style={sectionStyle}>
            <h2 style={h2Style}>제3조 (가입 및 로그인)</h2>
            <p style={pStyle}>서비스 이용을 위해 카카오 계정을 통한 로그인이 필요합니다. 로그인 시 카카오 고유 ID만 수집하며, 닉네임·이메일·프로필사진 등 추가 개인정보는 수집하지 않습니다.</p>
          </div>
          <div style={sectionStyle}>
            <h2 style={h2Style}>제4조 (이용자의 의무)</h2>
            <p style={pStyle}>이용자는 서비스를 교육 목적에 맞게 사용해야 하며, 이용약관이 아닌 부적절한 내용을 등록해서는 안 됩니다. 부적절한 등록 내용은 관리자에 의해 삭제될 수 있습니다.</p>
          </div>
          <div style={sectionStyle}>
            <h2 style={h2Style}>제5조 (면책)</h2>
            <p style={pStyle}>AI가 생성한 동의서는 참고용이며, 최종 사용 전 내용을 반드시 확인하시기 바랍니다. 서비스는 AI 생성 결과물의 법적 정확성을 보장하지 않으며, 이로 인한 책임을 지지 않습니다.</p>
          </div>
          <div style={sectionStyle}>
            <h2 style={h2Style}>제6조 (계정 삭제)</h2>
            <p style={pStyle}>이용자는 언제든지 서비스 내 계정 삭제 기능을 통해 탈퇴할 수 있으며, 탈퇴 시 저장된 카카오 고유 ID는 즉시 삭제됩니다.</p>
          </div>
          <div>
            <h2 style={h2Style}>제7조 (약관 변경)</h2>
            <p style={pStyle}>본 약관은 필요 시 변경될 수 있으며, 변경 시 서비스 내 공지를 통해 안내합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
