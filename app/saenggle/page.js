"use client";

export default function SaengglePage() {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>생글생글 — AI 생기부 작성 도우미</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&family=Gowun+Batang:wght@400;700&display=swap" rel="stylesheet">
<style>
:root {
  --ink: #1a1a2e;
  --cream: #faf8f4;
  --accent: #4659a7;
  --accent2: #7c6bc4;
  --warm: #e8a87c;
  --red: #e03131;
  --green: #2d8a4e;
  --blue: #1971c2;
  --paper: #fff;
  --soft: #f0ede8;
}
* { margin:0; padding:0; box-sizing:border-box; }
html { scroll-behavior:smooth; }
body {
  font-family:'Noto Sans KR',sans-serif;
  background:var(--cream);
  color:var(--ink);
  overflow-x:hidden;
  line-height:1.7;
}
body::before {
  content:'';
  position:fixed; top:0; left:0; width:100%; height:100%;
  background:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events:none; z-index:9999;
}
.hero {
  min-height:100vh;
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  text-align:center;
  padding:60px 24px;
  position:relative;
  background:linear-gradient(170deg, #f0ede8 0%, #e8e4f8 40%, #faf8f4 100%);
}
.hero::after {
  content:''; position:absolute; bottom:0; left:0; right:0; height:120px;
  background:linear-gradient(to bottom, transparent, var(--cream));
}
.hero-badge {
  display:inline-flex; align-items:center; gap:8px;
  padding:6px 18px; border-radius:50px;
  background:rgba(70,89,167,0.08); border:1px solid rgba(70,89,167,0.15);
  font-size:13px; font-weight:700; color:var(--accent);
  margin-bottom:28px;
  animation:fadeDown 0.8s ease;
}
.hero-title {
  font-family:'Gowun Batang',serif;
  font-size:clamp(48px,8vw,80px);
  font-weight:700;
  letter-spacing:-0.04em;
  line-height:1.15;
  margin-bottom:20px;
  animation:fadeDown 0.8s ease 0.1s both;
}
.hero-title span { color:var(--accent); }
.hero-sub {
  font-size:clamp(16px,2.5vw,20px);
  color:#64748b;
  max-width:560px;
  line-height:1.8;
  margin-bottom:40px;
  animation:fadeDown 0.8s ease 0.2s both;
}
.hero-chips {
  display:flex; gap:12px; flex-wrap:wrap; justify-content:center;
  animation:fadeDown 0.8s ease 0.3s both;
}
.hero-chip {
  padding:10px 22px; border-radius:50px;
  font-size:14px; font-weight:700;
  border:none; cursor:pointer; font-family:inherit;
  transition:transform 0.2s, box-shadow 0.2s;
}
.hero-chip:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.1); }
.chip-main { background:var(--accent); color:#fff; }
.chip-sub { background:var(--paper); color:var(--ink); border:1.5px solid #e2e0dc; }
.section {
  max-width:960px;
  margin:0 auto;
  padding:100px 24px;
}
.section-label {
  font-size:13px; font-weight:700; color:var(--accent);
  letter-spacing:0.08em; text-transform:uppercase;
  margin-bottom:12px;
}
.section-title {
  font-family:'Gowun Batang',serif;
  font-size:clamp(28px,4vw,42px);
  font-weight:700;
  letter-spacing:-0.03em;
  line-height:1.3;
  margin-bottom:16px;
}
.section-desc {
  font-size:16px; color:#64748b; max-width:600px; line-height:1.8;
  margin-bottom:48px;
}
.features {
  display:grid;
  grid-template-columns:repeat(auto-fit, minmax(280px,1fr));
  gap:20px;
}
.feat-card {
  background:var(--paper);
  border-radius:20px;
  padding:32px 28px;
  border:1px solid #e8e6e2;
  transition:transform 0.25s, box-shadow 0.25s;
  position:relative; overflow:hidden;
}
.feat-card:hover {
  transform:translateY(-4px);
  box-shadow:0 16px 48px rgba(70,89,167,0.1);
}
.feat-card::before {
  content:''; position:absolute; top:0; left:0; right:0; height:4px;
  background:linear-gradient(90deg, var(--accent), var(--accent2));
  opacity:0; transition:opacity 0.3s;
}
.feat-card:hover::before { opacity:1; }
.feat-icon {
  width:48px; height:48px; border-radius:14px;
  display:flex; align-items:center; justify-content:center;
  font-size:22px; margin-bottom:18px;
}
.feat-name { font-size:17px; font-weight:900; margin-bottom:8px; }
.feat-desc { font-size:14px; color:#64748b; line-height:1.7; }
.family {
  display:grid;
  grid-template-columns:repeat(3, 1fr);
  gap:20px;
}
@media(max-width:700px){ .family { grid-template-columns:1fr; } }
.family-card {
  background:var(--paper);
  border-radius:20px;
  padding:36px 28px;
  border:1px solid #e8e6e2;
  text-align:center;
  transition:transform 0.2s;
}
.family-card:hover { transform:translateY(-3px); }
.family-emoji { font-size:40px; margin-bottom:16px; }
.family-name { font-family:'Gowun Batang',serif; font-size:24px; font-weight:700; margin-bottom:8px; }
.family-sub { font-size:13px; color:#94a3b8; margin-bottom:14px; }
.family-desc { font-size:14px; color:#64748b; line-height:1.7; }
.footer {
  text-align:center;
  padding:60px 24px;
  font-size:13px;
  color:#94a3b8;
}
.footer-brand {
  font-family:'Gowun Batang',serif;
  font-size:20px; font-weight:700; color:var(--ink);
  margin-bottom:8px;
}
@keyframes fadeDown {
  from { opacity:0; transform:translateY(20px); }
  to { opacity:1; transform:translateY(0); }
}
.reveal {
  opacity:0; transform:translateY(30px);
  transition:opacity 0.7s ease, transform 0.7s ease;
}
.reveal.visible { opacity:1; transform:translateY(0); }
@media(max-width:600px){
  .section { padding:60px 18px; }
}
</style>
</head>
<body>

<section class="hero">
  <div class="hero-badge">🤖 AI 보조 도구 · 교사 검토 필수</div>
  <h1 class="hero-title"><span>생글</span>생글</h1>
  <p class="hero-sub">
    초등 교사를 위한 AI 생활기록부 작성 도우미.<br>
    클릭 몇 번으로 행동특성부터 교과 평어까지,<br>
    학생 한 명 한 명에 맞는 문장을 만들어 드려요.
  </p>
  <div style="margin-bottom:32px;display:flex;flex-direction:column;align-items:center;gap:8px;animation:fadeDown 0.8s ease 0.25s both;">
    <div style="display:inline-block;padding:10px 28px;border-radius:50px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;font-size:16px;font-weight:900;letter-spacing:0.02em;">2025. 5. 1. OPEN</div>
    <div style="font-size:14px;color:#64748b;">현직 초등교사가 직접 개발했습니다</div>
  </div>
  <div class="hero-chips">
    <button class="hero-chip chip-main" onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})">기능 둘러보기</button>
    <button class="hero-chip chip-sub" onclick="document.getElementById('family').scrollIntoView({behavior:'smooth'})">패밀리 서비스</button>
  </div>
</section>

<section class="section reveal" id="features">
  <div class="section-label">Features</div>
  <div class="section-title">생글생글이 하는 일</div>
  <div class="section-desc">생활기록부 문장을 AI가 초안 작성하고, 교사가 검토·수정합니다.</div>
  <div class="features">
    <div class="feat-card">
      <div class="feat-icon" style="background:#eef0f8;">🧠</div>
      <div class="feat-name">행동특성</div>
      <div class="feat-desc">150개 이상의 체크포인트에서 학생 개개인에 알맞은 특성을 선택하면, 학생별 맞춤 문장을 만들어 드립니다.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#e7f5ff;">🏫</div>
      <div class="feat-name">자율·자치활동</div>
      <div class="feat-desc">학년 교육과정의 텍스트만 복사해서 붙여넣으면, 활용 가능한 다양한 문장을 만들어 드립니다.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#fff4e6;">🎭</div>
      <div class="feat-name">동아리활동</div>
      <div class="feat-desc">동아리명과 간단한 활동 내용을 복사·붙여넣기 하세요. 활동 내용과 학생별 참여도를 반영한 문장을 만들어 드립니다.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#e6fcf5;">🧭</div>
      <div class="feat-name">진로활동</div>
      <div class="feat-desc">진로 차시는 몇 시간 안 되는데, 학생마다 다른 문장을 써야 해서 머리 아프셨죠? 생글생글이 학생별로 다양한 진로활동 문장을 만들어 드립니다.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#f3f0ff;">📚</div>
      <div class="feat-name">교과 평어</div>
      <div class="feat-desc">2022 개정교육과정의 성취기준과 각 교과의 차시별 목표를 활용한 교과 평어. 학생의 성취도까지 반영하면 더욱 정확한 평어를 만들 수 있습니다.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#fff0f0;">📋</div>
      <div class="feat-name">일괄 복사</div>
      <div class="feat-desc">번호순으로 정렬된 전체 학생의 완성 문장을 한 명씩 복사하여 나이스에 바로 붙여넣기 할 수 있습니다.</div>
    </div>
  </div>
</section>

<section class="section reveal" id="principles" style="text-align:center;">
  <div class="section-label">Principles</div>
  <div class="section-title" style="max-width:600px;margin:0 auto 48px;">교사가 주인, AI는 도우미</div>
  <div class="features" style="max-width:800px;margin:0 auto;">
    <div class="feat-card" style="text-align:center;">
      <div style="font-size:32px;margin-bottom:12px;">🔒</div>
      <div class="feat-name">개인정보 보호</div>
      <div class="feat-desc">학생 실명은 AI에 전송되지 않습니다.</div>
    </div>
    <div class="feat-card" style="text-align:center;">
      <div style="font-size:32px;margin-bottom:12px;">✏️</div>
      <div class="feat-name">교사 검토 필수</div>
      <div class="feat-desc">모든 생성 문장은 초안일 뿐입니다. 수정률이 표시되며, 반드시 교사가 검토·수정 후 사용합니다.</div>
    </div>
  </div>
</section>

<section class="section reveal" id="family">
  <div class="section-label">Family</div>
  <div class="section-title">같이 쓰면 더 좋은 도구들</div>
  <div class="section-desc">생글생글과 함께 교사의 업무를 도와주는 패밀리 서비스입니다.</div>
  <div class="family">
    <div class="family-card" style="border-top:4px solid var(--accent);">
      <div class="family-emoji">🖊️</div>
      <div class="family-name">생글생글</div>
      <div class="family-sub">AI 생기부 작성 도우미</div>
      <div class="family-desc">행동특성 · 창의적체험활동 · 교과 평어를 AI 초안으로 빠르게 작성</div>
    </div>
    <a href="https://consent.saenggle.com/" target="_blank" style="text-decoration:none;color:inherit;">
    <div class="family-card" style="border-top:4px solid var(--warm);cursor:pointer;">
      <div class="family-emoji">🤝</div>
      <div class="family-name">동글동글</div>
      <div class="family-sub">동의서 공유 플랫폼</div>
      <div class="family-desc">에듀테크 약관을 붙여넣으면 개인정보 수집 동의서를 자동 생성 · 공유</div>
    </div>
    </a>
    <a href="https://gongmoon.saenggle.com/" target="_blank" style="text-decoration:none;color:inherit;">
    <div class="family-card" style="border-top:4px solid var(--green);cursor:pointer;">
      <div class="family-emoji">📄</div>
      <div class="family-name">뚝딱공문</div>
      <div class="family-sub">공문 작성 도우미</div>
      <div class="family-desc">학교 공문 본문을 hwpx 파일로 뚝딱 생성하여 한컴오피스에서 바로 사용</div>
    </div>
    </a>
  </div>
</section>

<footer class="footer">
  <div class="footer-brand">생글생글</div>
  <p style="margin-top:12px;display:flex;gap:16px;justify-content:center;flex-wrap:wrap;font-size:13px;">
    <span>© 2026 생글생글</span>
    <a href="http://pf.kakao.com/_TxfbMX" target="_blank" style="color:#64748b;text-decoration:underline;">카카오채널 문의</a>
    <a href="https://consent.saenggle.com/terms" target="_blank" style="color:#64748b;text-decoration:underline;">이용약관</a>
    <a href="https://consent.saenggle.com/privacy" target="_blank" style="color:#64748b;text-decoration:underline;">개인정보처리방침</a>
  </p>
</footer>

<script>
const obs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}
  });
},{threshold:0.12});
document.querySelectorAll('.reveal').forEach(function(el){obs.observe(el);});
</script>
</body>
</html>
    ` }} />
  );
}
