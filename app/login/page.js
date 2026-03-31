"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const handleKakaoLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
        width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <img
          src="https://k.kakaocdn.net/dn/JnX0S/dJMcagLLNkH/Iy54jWQUY9nGep2gsP7Fek/img_xl.jpg"
          alt="생글생글"
          style={{ width: 80, height: 80, margin: "0 auto 16px", display: "block", borderRadius: 16 }}
        />
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 6px" }}>
          생글생글
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px", lineHeight: 1.6 }}>
          에듀테크 개인정보 동의서를<br />검색하고 hwpx로 바로 다운로드하세요.
        </p>

        <button onClick={handleKakaoLogin} style={{
          width: "100%", padding: "13px 0", borderRadius: 10, border: "none",
          background: "#FEE500", color: "#191919", fontSize: 15, fontWeight: 700,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, fontFamily: "inherit", transition: "transform 0.15s",
        }}
        onMouseOver={e => e.currentTarget.style.transform = "translateY(-1px)"}
        onMouseOut={e => e.currentTarget.style.transform = ""}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3C5.58 3 2 5.79 2 9.21c0 2.17 1.45 4.08 3.63 5.17l-.93 3.42c-.08.3.26.54.52.37l4.1-2.72c.22.02.44.03.68.03 4.42 0 8-2.79 8-6.27S14.42 3 10 3z" fill="#191919"/>
          </svg>
          카카오 로그인
        </button>

        {/* 로그인 안내 */}
        <div style={{
          marginTop: 20, padding: "16px 18px", borderRadius: 12,
          background: "#fffbeb", border: "1px solid #fde68a", textAlign: "left",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#92400e" }}>왜 로그인이 필요한가요?</span>
          </div>
          <div style={{ fontSize: 13, color: "#78716c", lineHeight: 1.8 }}>
            <div style={{ marginBottom: 4 }}>
              <strong style={{ color: "#92400e" }}>① AI API 비용</strong>을 개발자가 직접 부담하고 있어요.
            </div>
            <div style={{ marginBottom: 4 }}>
              <strong style={{ color: "#92400e" }}>② 봇/악성 접근 방지</strong>를 위해 로그인을 받고 있어요.
            </div>
            <div>
              <strong style={{ color: "#92400e" }}>③ 카카오 고유 ID만</strong> 저장하며, 닉네임·이메일 등 개인정보는 일절 수집하지 않습니다.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, fontSize: 11, color: "#c1c1c1", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
          <span>© 2026 생글생글</span>
          <span style={{ color: "#e2e8f0" }}>·</span>
          <a href="http://pf.kakao.com/_TxfbMX" target="_blank" rel="noopener noreferrer" style={{ color: "#c1c1c1", textDecoration: "underline", fontSize: 11 }}>카카오채널 문의</a>
          <span style={{ color: "#e2e8f0" }}>·</span>
          <Link href="/terms" style={{ color: "#c1c1c1", textDecoration: "underline", fontSize: 11 }}>이용약관</Link>
          <span style={{ color: "#e2e8f0" }}>·</span>
          <Link href="/privacy" style={{ color: "#c1c1c1", textDecoration: "underline", fontSize: 11 }}>개인정보처리방침</Link>
        </div>
      </div>
    </div>
  );
}
