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
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 28 }}>시행일: 2026년 11월 13일 (이전 시행일: 2026년 4월 1일)</p>

          <div style={sectionStyle}>
            <h2 style={h2Style}>1. 수집하는 개인정보 항목</h2>
            <p style={pStyle}>
              <strong>필수:</strong> 카카오 회원번호(카카오 로그인 식별값) 1개<br />
              <strong>선택:</strong> 카카오계정 이메일 — 카카오 로그인 동의 화면에서 이용자가 동의한 경우에만 받으며, 동의하지 않아도 서비스를 모두 이용할 수 있습니다. 현재 어떤 기능에서도 이메일을 사용하지 않습니다.<br />
              <strong>자동 생성:</strong> 로그인 유지를 위한 쿠키, 서비스 이용 과정에서 호스팅 업체에 남는 접속 기록(IP 주소·접속 시각 등)<br /><br />
              카카오 닉네임·프로필사진은 카카오에 요청하지 않으며 수집·저장하지 않습니다. 이름·전화번호 등 그 밖의 개인정보도 받지 않습니다.
            </p>
          </div>
          <div style={sectionStyle}>
            <h2 style={h2Style}>2. 수집 목적</h2>
            <p style={pStyle}>봇 및 악성 접근 방지를 위한 이용자 식별, 로그인 유지, 서비스 이용 기록 관리 목적으로만 사용합니다.</p>
          </div>
          <div style={sectionStyle}>
            <h2 style={h2Style}>3. 보유 및 이용 기간</h2>
            <p style={pStyle}>
              계정 삭제(탈퇴) 시 카카오 회원번호와 이메일을 즉시 파기합니다. 별도의 보유 기간은 없습니다.<br />
              이용자가 등록한 동의서 자료는 다른 교사와 공유하는 자료로 남지만, 등록자를 알아볼 수 있는 값은 함께 지웁니다.<br />
              호스팅 업체의 접속 기록은 각 업체의 보관 정책에 따라 자동 삭제됩니다.
            </p>
          </div>
          <div style={sectionStyle}>
            <h2 style={h2Style}>4. 제3자 제공</h2>
            <p style={pStyle}>수집한 개인정보는 제3자에게 제공하지 않습니다.</p>
          </div>
          <div style={sectionStyle}>
            <h2 style={h2Style}>5. 처리 위탁 및 국외 이전</h2>
            <p style={pStyle}>
              서비스 운영을 위해 다음 업체에 처리를 맡기며, 이 과정에서 개인정보가 국외 서버에 저장·처리됩니다. 해당 업체는 위탁받은 목적으로만 처리하며, 독자적으로 개인정보를 활용하지 않습니다.<br /><br />
              • <strong>Supabase Inc.</strong>(미국) — 회원 인증·데이터베이스 운영 / 카카오 회원번호, 이메일(동의 시) / 저장 위치: 인도(뭄바이) 클라우드 서버 / 서비스 이용 시 네트워크를 통해 전송 / 탈퇴 시까지<br />
              • <strong>Vercel Inc.</strong>(미국) — 웹사이트 호스팅 / 접속 기록 / 저장 위치: 미국 등 클라우드 서버 / 서비스 이용 시 네트워크를 통해 전송 / 업체 보관 정책에 따름<br /><br />
              국외 이전을 원하지 않으시면 로그인하지 않거나 계정을 삭제할 수 있습니다. 다만 로그인이 필요한 기능(동의서 생성·다운로드)은 이용할 수 없습니다.
            </p>
          </div>
          <div style={sectionStyle}>
            <h2 style={h2Style}>6. 이용자의 권리</h2>
            <p style={pStyle}>이용자는 언제든지 서비스 내 계정 삭제 기능으로 개인정보 삭제를 요청할 수 있습니다. 카카오계정 설정에서 생글생글과의 연결을 끊을 수도 있습니다. 기타 문의는 카카오채널로 연락해주세요.</p>
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
