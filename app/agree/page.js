"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AgreePage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 이미 동의한 유저면 바로 메인으로
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("kakao_id", user.id)
        .single();

      if (existingUser) {
        router.push("/");
        return;
      }

      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleAgree = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // users 테이블에 등록
    const { error } = await supabase
      .from("users")
      .insert({
        kakao_id: user.id,
        agreed_at: new Date().toISOString(),
        is_admin: false,
      });

    if (!error) {
      router.push("/");
    } else {
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 14, color: "#94a3b8" }}>확인 중...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "40px 28px", maxWidth: 400, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img
            src="https://k.kakaocdn.net/dn/JnX0S/dJMcagLLNkH/Iy54jWQUY9nGep2gsP7Fek/img_xl.jpg"
            alt="생글생글"
            style={{ width: 56, height: 56, margin: "0 auto 12px", display: "block", borderRadius: 12 }}
          />
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>환영합니다! 🎉</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>서비스 이용을 위해 약관에 동의해주세요.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          <div style={{
            padding: "14px 16px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)",
            background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>이용약관</span>
            <Link href="/terms" style={{ color: "#6366f1", fontSize: 12, fontWeight: 600, textDecoration: "underline" }}>보기</Link>
          </div>
          <div style={{
            padding: "14px 16px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)",
            background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>개인정보처리방침</span>
            <Link href="/privacy" style={{ color: "#6366f1", fontSize: 12, fontWeight: 600, textDecoration: "underline" }}>보기</Link>
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 16, padding: "0 4px" }}>
          <input
            type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: "#6366f1", cursor: "pointer", flexShrink: 0 }}
          />
          <span style={{ fontSize: 14, color: "#334155", fontWeight: 600 }}>위 약관에 모두 동의합니다.</span>
        </label>

        <button onClick={handleAgree} disabled={!agreed} style={{
          width: "100%", padding: 13, borderRadius: 10, border: "none",
          background: agreed ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "#e2e8f0",
          color: agreed ? "#fff" : "#94a3b8",
          fontSize: 15, fontWeight: 700,
          cursor: agreed ? "pointer" : "not-allowed",
          fontFamily: "inherit", transition: "all 0.2s",
        }}>시작하기</button>
      </div>
    </div>
  );
}
