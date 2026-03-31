"use client";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const handleKakaoLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/`,
        scopes: "profile_nickname",
      },
    });
    if (error) alert("로그인에 실패했습니다. 다시 시도해주세요.");
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "48px 32px", maxWidth: 400,
        width: "100%", textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        {/* Logo */}
        <div style={{
          width: 56, height: 56, borderRadius: 14, margin: "0 auto 20px",
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
            <path d="M4 2h7l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="#fff" strokeWidth="1.2" fill="none"/>
            <path d="M11 2v4h4" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M6 10h6M6 13h4" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
          </svg>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 6px" }}>
          동의서 공유
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 32px", lineHeight: 1.6 }}>
          에듀테크 개인정보 동의서를<br />검색하고 hwpx로 바로 다운로드하세요.
        </p>

        {/* Kakao Login Button */}
        <button onClick={handleKakaoLogin} style={{
          width: "100%", padding: "13px 0", borderRadius: 10, border: "none",
          background: "#FEE500", color: "#191919", fontSize: 15, fontWeight: 700,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, fontFamily: "inherit",
          transition: "transform 0.15s",
        }}
        onMouseOver={e => e.currentTarget.style.transform = "translateY(-1px)"}
        onMouseOut={e => e.currentTarget.style.transform = ""}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3C5.58 3 2 5.79 2 9.21c0 2.17 1.45 4.08 3.63 5.17l-.93 3.42c-.08.3.26.54.52.37l4.1-2.72c.22.02.44.03.68.03 4.42 0 8-2.79 8-6.27S14.42 3 10 3z" fill="#191919"/>
          </svg>
          카카오 로그인
        </button>

        {/* Notice */}
        <div style={{
          marginTop: 24, padding: "14px 16px", borderRadius: 10,
          background: "#f8fafc", border: "1px solid rgba(0,0,0,0.04)",
          textAlign: "left",
        }}>
          <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
            본 서비스는 개발자가 AI API 비용을 부담하고 있어, 봇 및 악성 접근 방지를 위해 부득이하게 로그인을 받고 있습니다. 카카오 고유 ID 외에 어떠한 개인정보도 수집하지 않습니다.
          </p>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 24, fontSize: 11, color: "#c1c1c1" }}>
          서울중현초 박유빈
        </div>
      </div>
    </div>
  );
}
