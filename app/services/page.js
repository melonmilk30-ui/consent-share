"use client";

import { useRouter } from "next/navigation";

export default function ServicesPage() {
  const router = useRouter();

  const services = [
    {
      emoji: "📝",
      name: "생기부 작성 도우미",
      desc: "행동발달특성, 창의적체험활동 등 생활기록부 문장을 AI가 함께 작성해요.",
      status: "5월 오픈 예정",
      statusColor: "#7c3aed",
      statusBg: "#f3e8ff",
      active: false,
    },
    {
      emoji: "📄",
      name: "에듀테크 동의서",
      desc: "에듀테크 서비스 약관을 붙여넣으면 개인정보 수집·이용 동의서를 자동으로 만들어줘요.",
      status: "사용 중",
      statusColor: "#059669",
      statusBg: "#d1fae5",
      active: true,
    },
    {
      emoji: "📋",
      name: "공문 본문 도우미",
      desc: "공문 내용을 입력하면 양식에 맞는 공문 본문을 hwpx로 생성해줘요.",
      status: "준비 중",
      statusColor: "#d97706",
      statusBg: "#fef3c7",
      active: false,
    },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/")} style={{
            padding: 8, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)",
            background: "#fff", color: "#64748b", cursor: "pointer", display: "flex", fontFamily: "inherit",
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>생글생글</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>전체 서비스</div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img
            src="https://k.kakaocdn.net/dn/JnX0S/dJMcagLLNkH/Iy54jWQUY9nGep2gsP7Fek/img_xl.jpg"
            alt="생글생글"
            style={{ width: 72, height: 72, margin: "0 auto 12px", display: "block", borderRadius: 16 }}
          />
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.03em", background: "linear-gradient(135deg, #7c3aed, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            생글생글
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
            선생님의 업무를 덜어드리는 AI 도우미 모음
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {services.map((s, i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: 16, padding: "24px 20px",
              border: s.active ? "2px solid #6366f1" : "1px solid rgba(0,0,0,0.06)",
              boxShadow: s.active ? "0 4px 20px rgba(99,102,241,0.12)" : "0 1px 3px rgba(0,0,0,0.04)",
              position: "relative", overflow: "hidden",
            }}>
              {s.active && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(135deg, #3b82f6, #6366f1)" }} />
              )}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ fontSize: 32, flexShrink: 0, marginTop: 2 }}>{s.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>{s.name}</span>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.statusBg, color: s.statusColor }}>{s.status}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                  {s.active && (
                    <button onClick={() => router.push("/")} style={{
                      marginTop: 12, padding: "8px 20px", borderRadius: 8, border: "none",
                      background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                      color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    }}>바로가기 →</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7 }}>
            더 많은 서비스가 준비되고 있어요.<br />선생님들의 소중한 시간을 아껴드릴게요 💜
          </p>
        </div>
      </div>

      <footer style={{ maxWidth: 960, margin: "0 auto", padding: "20px 20px 32px", textAlign: "center", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span>© 2026 생글생글</span>
          <span style={{ color: "#d1d5db" }}>·</span>
          <a href="http://pf.kakao.com/_TxfbMX" target="_blank" rel="noopener noreferrer" style={{ color: "#cbd5e1", textDecoration: "underline", fontSize: 12 }}>카카오채널 문의</a>
        </div>
      </footer>
    </div>
  );
}
