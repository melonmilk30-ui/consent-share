"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = ["전체", "디자인", "협업", "학급운영", "LMS", "수업도구", "기타"];

const categoryColors = {
  "디자인": { bg: "#ede9fe", text: "#5b21b6" },
  "협업": { bg: "#dbeafe", text: "#1e40af" },
  "학급운영": { bg: "#dcfce7", text: "#166534" },
  "LMS": { bg: "#fef3c7", text: "#92400e" },
  "수업도구": { bg: "#ffe4e6", text: "#9f1239" },
  "기타": { bg: "#f1f5f9", text: "#475569" },
};

function TagBadge({ text }) {
  const c = categoryColors[text] || categoryColors["기타"];
  return (
    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: c.bg, color: c.text, whiteSpace: "nowrap" }}>{text}</span>
  );
}

function Icon({ name }) {
  if (name === "search") return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="M11.5 11.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
  if (name === "download") return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (name === "check") return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (name === "x") return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
  if (name === "logout") return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  return null;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("latest");
  const [selected, setSelected] = useState(new Set());
  const [showDetail, setShowDetail] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showSgsg, setShowSgsg] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const [inputMode, setInputMode] = useState("url");
  const [termsText, setTermsText] = useState("");
  const [termsUrl, setTermsUrl] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registerAgreed, setRegisterAgreed] = useState(false);
  const [registerShareAgreed, setRegisterShareAgreed] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState(null); // AI 분석 결과
  const [editName, setEditName] = useState(""); // 수정 가능한 서비스명
  const [editCategory, setEditCategory] = useState(""); // 수정 가능한 카테고리
  const [registerStep, setRegisterStep] = useState("q1"); // "q1" | "q2" | "input" | "confirm" | "not_needed" | "need_review"
  const [totalUsers, setTotalUsers] = useState(0); // 관리자용 가입자 수
  const [editingDetail, setEditingDetail] = useState(false); // 상세 모달 수정 모드
  const [detailEditName, setDetailEditName] = useState("");
  const [detailEditCategory, setDetailEditCategory] = useState("");
  const inputRef = useRef(null);

  // 로그인 상태 확인 (비로그인도 메인 페이지 접근 가능)
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        // 관리자 여부 확인
        try {
          const res = await fetch("/api/check-user");
          const data = await res.json();
          setIsAdmin(data.is_admin || false);
          if (data.is_admin) {
            setTotalUsers(data.total_users || 0);
          }
        } catch {}
      }
      setLoading(false);
      setMounted(true);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setUser(session.user);
      else { setUser(null); setIsAdmin(false); }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  // 서비스 목록 불러오기 (비로그인도 가능)
  useEffect(() => {
    fetchServices();
  }, [query, category, sortBy]);

  const fetchServices = async () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category !== "전체") params.set("category", category);
    params.set("sort", sortBy);
    try {
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setServices(data);
    } catch (e) { console.error("검색 오류:", e); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleSelect = (id) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 2500); };

  const isExpired = (dateStr) => {
    const created = new Date(dateStr);
    const sixMonths = new Date(created);
    sixMonths.setMonth(sixMonths.getMonth() + 6);
    return new Date() > sixMonths;
  };

  // 로그인 필요한 작업 시 체크
  const requireLogin = () => {
    if (!user) {
      showToast("로그인이 필요합니다!");
      setTimeout(() => router.push("/login"), 800);
      return true;
    }
    return false;
  };

  const handleSingleDownload = async (service) => {
    if (requireLogin()) return;
    showToast(`${service.name} 동의서 생성 중...`);
    try {
      const res = await fetch(`/api/download?id=${service.id}`);
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || "다운로드 실패");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `(생글생글) ${service.name}_개인정보수집이용동의서.hwpx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`${service.name} 동의서 다운로드 완료!`);
      fetchServices(); // 다운로드 수 갱신
    } catch {
      showToast("다운로드 중 오류가 발생했습니다.");
    }
  };

  const handleMergeDownload = async () => {
    if (requireLogin()) return;
    const selectedIds = Array.from(selected);
    const names = services.filter(s => selected.has(s.id)).map(s => s.name).join(", ");
    showToast(`합본 동의서 생성 중... (${selectedIds.length}건)`);
    try {
      const res = await fetch("/api/download-merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || "합본 다운로드 실패");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `(생글생글) 동의서합본_${selectedIds.length}건.hwpx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`합본 다운로드 완료! (${names})`);
      setSelected(new Set());
      fetchServices(); // 다운로드 수 갱신
    } catch {
      showToast("합본 다운로드 중 오류가 발생했습니다.");
    }
  };

  const handleAdminEdit = async () => {
    if (!showDetail || !detailEditName.trim()) return;
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: showDetail.id, name: detailEditName, category: detailEditCategory }),
      });
      if (res.ok) {
        showToast("수정 완료!");
        setEditingDetail(false);
        setShowDetail({ ...showDetail, name: detailEditName, category: detailEditCategory });
        fetchServices();
      } else {
        const err = await res.json();
        showToast(err.error || "수정 실패");
      }
    } catch { showToast("수정 중 오류가 발생했습니다."); }
  };

  const handleAdminDelete = async (service) => {
    if (!confirm(`${service.name}을(를) 정말 삭제할까요?`)) return;
    try {
      const res = await fetch(`/api/admin?id=${service.id}`, { method: "DELETE" });
      if (res.ok) { showToast(`${service.name} 삭제됨`); fetchServices(); }
      else { const err = await res.json(); showToast(err.error || "삭제 실패"); }
    } catch { showToast("삭제 중 오류가 발생했습니다."); }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/delete-account", { method: "DELETE" });
      if (res.ok) {
        showToast("계정이 삭제되었습니다.");
        setTimeout(() => { router.push("/login"); }, 1500);
      } else { showToast("삭제에 실패했습니다."); }
    } catch { showToast("오류가 발생했습니다."); }
  };

  // 1단계: AI 분석 요청
  const handleAnalyze = async () => {
    if (requireLogin()) return;
    if (!termsText && !termsUrl) { showToast("이용약관 텍스트 또는 URL을 입력해주세요!"); return; }
    setRegistering(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          terms_text: inputMode === "text" ? termsText : null,
          terms_url: inputMode === "url" ? termsUrl : null,
        }),
      });
      const result = await res.json();
      if (result.needLogin) { router.push("/login"); return; }
      if (res.ok) {
        setAnalyzeResult(result);
        // 동의서 필요 없는 경우
        if (result.analysis.consent_needed === false) {
          setRegisterStep("not_needed");
        } else {
          setEditName(result.analysis.name || "");
          setEditCategory(result.analysis.category || "기타");
          setRegisterStep("confirm");
        }
      } else {
        showToast(result.error || "분석에 실패했습니다.");
      }
    } catch { showToast("서버 오류가 발생했습니다."); }
    setRegistering(false);
  };

  // 2단계: 확인 후 DB 등록
  const handleConfirmRegister = async () => {
    if (!analyzeResult) return;
    setRegistering(true);
    try {
      // 사용자가 수정한 서비스명 반영
      const finalAnalysis = { ...analyzeResult.analysis, name: editName, category: editCategory };
      const res = await fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis: finalAnalysis,
          raw_terms: analyzeResult.raw_terms,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        showToast("동의서 등록이 완료되었습니다!");
        setShowRegister(false);
        resetRegisterForm();
        fetchServices();
      } else {
        showToast(result.error || "등록에 실패했습니다.");
      }
    } catch { showToast("서버 오류가 발생했습니다."); }
    setRegistering(false);
  };

  const resetRegisterForm = () => {
    setTermsText(""); setTermsUrl("");
    setRegisterAgreed(false); setRegisterShareAgreed(false);
    setAnalyzeResult(null); setEditName(""); setEditCategory(""); setRegisterStep("q1");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 14, color: "#94a3b8" }}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* 생글생글 띠 배너 */}
      {showBanner && (
        <div style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)", padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, position: "relative" }}>
          <button onClick={() => setShowSgsg(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#fff", padding: 0 }}>
            <span style={{ fontSize: 14 }}>✨</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>생글생글</span>
            <span style={{ fontSize: 12, opacity: 0.9 }}>생기부 작성 도우미도 곧 오픈!</span>
            <span style={{ fontSize: 12, opacity: 0.7 }}>→</span>
          </button>
          <button onClick={() => setShowBanner(false)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: 4, display: "flex" }}>
            <Icon name="x" />
          </button>
        </div>
      )}

      {/* Header */}
      <header style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="https://k.kakaocdn.net/dn/JnX0S/dJMcagLLNkH/Iy54jWQUY9nGep2gsP7Fek/img_xl.jpg" alt="생글생글" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>생글생글</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{isAdmin ? `가입자 ${totalUsers}명 · ` : ""}에듀테크 개인정보 동의서</div>
            </div>
          </div>
          {user ? (
            <button onClick={handleLogout} title="로그아웃" style={{ padding: 8, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", background: "#fff", color: "#94a3b8", cursor: "pointer", display: "flex" }}>
              <Icon name="logout" />
            </button>
          ) : (
            <button onClick={() => router.push("/login")} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              로그인
            </button>
          )}
        </div>
      </header>

      {/* Hero + Search */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px 0", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)", transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 6px", lineHeight: 1.3, background: "linear-gradient(135deg, #1e293b, #475569)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          한 번 만들면, 모두가 쓰는 동의서
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 16px", lineHeight: 1.6 }}>
          전국 선생님들이 등록한 에듀테크 개인정보 동의서를 검색하고 hwpx로 바로 다운로드하세요.
        </p>

        {/* 3단계 안내 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 2 }}>
          {[
            { emoji: "🔍", title: "서비스명으로 찾고" },
            { emoji: "📄", title: "hwpx 바로 받고" },
            { emoji: "✨", title: "없으면 약관 붙여넣기만!" },
          ].map((step, i) => (
            <div key={i} style={{ flex: 1, minWidth: 100, padding: "12px 14px", borderRadius: 10, background: "#fff", border: "1px solid rgba(0,0,0,0.05)", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{step.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{step.title}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 12, padding: "4px 4px 4px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.06)" }}>
          <span style={{ flexShrink: 0, display: "flex", color: "#94a3b8" }}><Icon name="search" /></span>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="서비스명 검색 (예: 캔바, Padlet)" style={{ flex: 1, border: "none", outline: "none", fontSize: 15, padding: "10px 0", background: "transparent", fontFamily: "inherit", minWidth: 0 }} />
          {query && (
            <button onClick={() => { setQuery(""); inputRef.current?.focus(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#94a3b8", display: "flex", flexShrink: 0 }}>
              <Icon name="x" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, gap: 12 }}>
          <div className="cat-pills" style={{ display: "flex", gap: 6, overflowX: "auto", flex: 1, paddingBottom: 2 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: "6px 14px", borderRadius: 20, border: "1px solid",
                borderColor: category === cat ? "#3b82f6" : "rgba(0,0,0,0.08)",
                background: category === cat ? "#3b82f6" : "#fff",
                color: category === cat ? "#fff" : "#475569",
                fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
              }}>{cat}</button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", background: "#fff", color: "#475569", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", outline: "none", flexShrink: 0 }}>
            <option value="latest">최신순</option>
            <option value="popular">인기순</option>
          </select>
        </div>
      </div>

      {/* Merge bar */}
      {selected.size > 0 && (
        <div style={{ position: "sticky", top: 56, zIndex: 40, maxWidth: 960, margin: "16px auto 0", padding: "0 20px" }}>
          <div style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff", boxShadow: "0 4px 20px rgba(79,70,229,0.35)", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, padding: "2px 10px", fontSize: 14, fontWeight: 700 }}>{selected.size}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>개 선택</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setSelected(new Set())} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>해제</button>
              <button onClick={handleMergeDownload} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#fff", color: "#4f46e5", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit" }}>
                <Icon name="download" /> 합본 다운로드
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 20px 20px" }}>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12, fontWeight: 500 }}>
          {services.length}개 서비스 · 체크박스로 선택 후 합본 다운로드 가능
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {services.map((service, i) => {
            const isSel = selected.has(service.id);
            const expired = isExpired(service.created_at);
            return (
              <div key={service.id} style={{
                background: isSel ? "rgba(99,102,241,0.04)" : "#fff", borderRadius: 12, padding: "14px 16px",
                border: `1px solid ${isSel ? "rgba(99,102,241,0.3)" : "rgba(0,0,0,0.05)"}`,
                display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)",
                transition: "all 0.2s", transitionDelay: `${i * 40}ms`,
              }}>
                <button onClick={e => { e.stopPropagation(); toggleSelect(service.id); }} style={{
                  width: 22, height: 22, borderRadius: 6, border: "1.5px solid",
                  borderColor: isSel ? "#6366f1" : "#cbd5e1", background: isSel ? "#6366f1" : "transparent",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
                }}>{isSel && <Icon name="check" />}</button>

                <div style={{ flex: 1, minWidth: 0 }} onClick={() => setShowDetail(service)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 650 }}>{service.name}</span>
                    <TagBadge text={service.category} />
                    {expired && <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: "#fef2f2", color: "#dc2626" }}>⏰ 6개월 경과</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{service.case_type ? ({
                    foreign_no_signup: "국외기업 · 보호자동의 불필요",
                    foreign_with_signup: "국외기업 · 보호자동의 필요",
                    domestic_no_signup: "국내기업 · 보호자동의 불필요",
                    domestic_with_signup: "국내기업 · 보호자동의 필요",
                  }[service.case_type] || service.case_type) : service.cases}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                    {new Date(service.created_at).toLocaleDateString("ko-KR")} 등록{isAdmin ? ` · 다운로드 ${service.downloads}회` : ""}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {isAdmin && (
                    <button onClick={e => { e.stopPropagation(); handleAdminDelete(service); }} style={{
                      padding: "6px 8px", borderRadius: 6, border: "1px solid #fecaca",
                      background: "#fff", color: "#dc2626", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    }}>삭제</button>
                  )}
                  <button onClick={e => { e.stopPropagation(); handleSingleDownload(service); }} style={{
                    padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)",
                    background: "#fff", color: "#475569", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", fontFamily: "inherit",
                  }}>
                    <Icon name="download" /> .hwpx
                  </button>
                </div>
              </div>
            );
          })}

          {services.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#475569", marginBottom: 4 }}>검색 결과가 없습니다</div>
              <div style={{ fontSize: 13, marginBottom: 8, lineHeight: 1.6 }}>
                아직 등록되지 않은 서비스라면,<br />약관만 붙여넣으면 AI가 동의서를 자동으로 만들어줘요!
              </div>
              <div style={{ fontSize: 12, color: "#b0b8c4", marginBottom: 20 }}>
                💡 한글·영문 모두 검색해보세요 (예: 캔바 / Canva)
              </div>
              <button onClick={() => setShowRegister(true)} style={{
                padding: "12px 24px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
              }}>동의서 자동 제작하기 ✨</button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ maxWidth: 960, margin: "0 auto", padding: "20px 20px 32px", textAlign: "center", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          <span>© 2026 생글생글</span>
          <span style={{ color: "#d1d5db" }}>·</span>
          <a href="http://pf.kakao.com/_TxfbMX" target="_blank" rel="noopener noreferrer" style={{ color: "#a1a8b4", textDecoration: "underline", fontSize: 12 }}>카카오채널 문의</a>
          <span style={{ color: "#d1d5db" }}>·</span>
          <Link href="/terms" style={{ color: "#a1a8b4", textDecoration: "underline", fontSize: 12 }}>이용약관</Link>
          <span style={{ color: "#d1d5db" }}>·</span>
          <Link href="/privacy" style={{ color: "#a1a8b4", textDecoration: "underline", fontSize: 12 }}>개인정보처리방침</Link>
          <span style={{ color: "#d1d5db" }}>·</span>
          <button onClick={() => setShowDeleteConfirm(true)} style={{ background: "none", border: "none", color: "#a1a8b4", fontSize: 12, cursor: "pointer", padding: 0, textDecoration: "underline" }}>계정 삭제</button>
        </div>
      </footer>

      {/* Detail Modal */}
      {showDetail && (
        <div onClick={() => setShowDetail(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} className="modal-sheet" style={{ background: "#fff", borderRadius: "16px 16px 0 0", padding: "24px 20px", maxWidth: 520, width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 -10px 40px rgba(0,0,0,0.12)", animation: "sheetUp 0.3s ease-out" }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#d1d5db", margin: "0 auto 16px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                {editingDetail && isAdmin ? (<>
                  <input value={detailEditName} onChange={e => setDetailEditName(e.target.value)} style={{
                    width: "100%", padding: "8px 12px", borderRadius: 8, border: "2px solid #6366f1",
                    fontSize: 18, fontWeight: 700, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                    background: "#faf5ff", marginBottom: 8,
                  }} />
                  <select value={detailEditCategory} onChange={e => setDetailEditCategory(e.target.value)} style={{
                    padding: "4px 10px", borderRadius: 6, border: "2px solid #6366f1",
                    fontSize: 13, fontWeight: 600, fontFamily: "inherit", outline: "none",
                    background: "#faf5ff", cursor: "pointer",
                  }}>
                    {["디자인", "협업", "학급운영", "LMS", "수업도구", "기타"].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button onClick={handleAdminEdit} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: "#6366f1", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>저장</button>
                    <button onClick={() => setEditingDetail(false)} style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid rgba(0,0,0,0.08)", background: "#fff", color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>취소</button>
                  </div>
                </>) : (<>
                  <h2 style={{ fontSize: 20, fontWeight: 750, margin: 0 }}>{showDetail.name}</h2>
                  <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    <TagBadge text={showDetail.category} />
                    {isExpired(showDetail.created_at) && <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: "#fef2f2", color: "#dc2626" }}>⏰ 6개월 경과</span>}
                    {isAdmin && (
                      <button onClick={() => { setEditingDetail(true); setDetailEditName(showDetail.name); setDetailEditCategory(showDetail.category); }} style={{ padding: "2px 8px", borderRadius: 4, border: "1px solid #c7d2fe", background: "#eef2ff", color: "#6366f1", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>✏️ 수정</button>
                    )}
                  </div>
                </>)}
              </div>
              <button onClick={() => setShowDetail(null)} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", flexShrink: 0 }}>
                <Icon name="x" />
              </button>
            </div>

            {isExpired(showDetail.created_at) && (
              <div style={{ padding: "14px 16px", borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>📢 등록일로부터 6개월이 지났습니다</div>
                <div style={{ fontSize: 12, color: "#a16207", lineHeight: 1.6 }}>약관이 변경되었을 수 있어요. 최신 약관으로 동의서를 다시 등록하면 기존 것은 자동으로 교체됩니다.</div>
                <button onClick={() => { setShowDetail(null); setShowRegister(true); }} style={{ marginTop: 10, padding: "8px 16px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>최신 약관으로 재등록하기</button>
              </div>
            )}

            {[
              { label: "수집 항목", value: showDetail.items },
              { label: "이용 목적", value: showDetail.purpose },
              { label: "보유 기간", value: showDetail.retention },
              { label: "등록일", value: new Date(showDetail.created_at).toLocaleDateString("ko-KR") },
              { label: "다운로드", value: isAdmin ? `${showDetail.downloads}회` : null },
            ].map(({ label, value }) => value && (
              <div key={label} style={{ display: "flex", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                <span style={{ width: 80, fontSize: 13, color: "#94a3b8", fontWeight: 500, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
            <div className="modal-actions" style={{ display: "flex", gap: 8, marginTop: 24 }}>
              <button onClick={() => { handleSingleDownload(showDetail); setShowDetail(null); }} style={{ flex: 1, padding: 13, borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit" }}>
                <Icon name="download" /> 다운로드 (.hwpx)
              </button>
              <button onClick={() => { toggleSelect(showDetail.id); setShowDetail(null); }} style={{ padding: "13px 18px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)", background: "#fff", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                {selected.has(showDetail.id) ? "선택 해제" : "합본 추가"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div onClick={() => { setShowRegister(false); resetRegisterForm(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: ["q1", "q2", "not_needed", "need_review"].includes(registerStep) ? "center" : "flex-end", justifyContent: "center", padding: ["q1", "q2", "not_needed", "need_review"].includes(registerStep) ? 20 : 0 }}>
          <div onClick={e => e.stopPropagation()} className="modal-sheet" style={{ background: "#fff", borderRadius: ["q1", "q2", "not_needed", "need_review"].includes(registerStep) ? 20 : "16px 16px 0 0", padding: "24px 20px", maxWidth: 520, width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: ["q1", "q2", "not_needed", "need_review"].includes(registerStep) ? "0 20px 60px rgba(0,0,0,0.15)" : "0 -10px 40px rgba(0,0,0,0.12)" }}>
            {!["q1", "q2", "not_needed", "need_review"].includes(registerStep) && (
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "#d1d5db", margin: "0 auto 16px" }} />
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 750, margin: 0 }}>
                {(registerStep === "q1" || registerStep === "q2") && "동의서 작성 전 확인"}
                {registerStep === "input" && "개인정보 동의서 자동 제작"}
                {registerStep === "confirm" && "분석 결과 확인"}
                {registerStep === "not_needed" && "확인 완료"}
                {registerStep === "need_review" && "확인 완료"}
              </h2>
              <button onClick={() => { setShowRegister(false); resetRegisterForm(); }} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}>
                <Icon name="x" />
              </button>
            </div>

            {/* Q1: 개인정보 수집 여부 */}
            {registerStep === "q1" && (<>
              <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#334155", lineHeight: 1.6, marginBottom: 16 }}>
                  이 에듀테크 서비스를 사용할 때,<br />학생의 개인정보를 입력하는 경우가 있나요?
                </div>
              </div>

              <div style={{ padding: "14px 16px", borderRadius: 10, background: "#f8fafc", border: "1px solid rgba(0,0,0,0.06)", marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>누가 입력하든 상관없이, 학생의 개인정보가 서비스에 들어가면 해당됩니다.</div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.8 }}>
                  • 교사가 학생 이름·번호를 서비스에 등록하는 경우<br />
                  • 교사가 학생 계정을 대신 만들어주는 경우<br />
                  • 학생이 직접 회원가입하는 경우<br />
                  • 학부모가 자녀 정보를 입력하는 경우
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setShowRegister(false); resetRegisterForm(); showToast("개인정보를 수집하지 않는 서비스는 동의서가 필요하지 않습니다."); }} style={{
                  flex: 1, padding: 13, borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)",
                  background: "#fff", color: "#475569", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}>아니요, 해당 없어요</button>
                <button onClick={() => setRegisterStep("q2")} style={{
                  flex: 1, padding: 13, borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff",
                  fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}>예, 해당됩니다</button>
              </div>
            </>)}

            {/* Q2: 운영위원회 심의 */}
            {registerStep === "q2" && (<>
              <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#334155", lineHeight: 1.6, marginBottom: 16 }}>
                  이 에듀테크는 학교 운영위원회 심의를<br />통과한 학습지원 소프트웨어인가요?
                </div>
              </div>

              <div style={{ padding: "14px 16px", borderRadius: 10, background: "#f8fafc", border: "1px solid rgba(0,0,0,0.06)", marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
                  학습지원 소프트웨어는 운영위원회 심의를 통과한 경우에만 개인정보 수집·이용 동의서를 내보낼 수 있습니다.
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setRegisterStep("need_review")} style={{
                  flex: 1, padding: 13, borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)",
                  background: "#fff", color: "#475569", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}>아직 심의 전이에요</button>
                <button onClick={() => setRegisterStep("input")} style={{
                  flex: 1, padding: 13, borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff",
                  fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}>예, 통과했습니다</button>
              </div>
            </>)}

            {/* 운영위 심의 필요 안내 */}
            {registerStep === "need_review" && (<>
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#d97706", marginBottom: 16 }}>운영위원회 심의를 먼저 받아주세요</div>
              </div>

              <div style={{ padding: "16px", borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a", marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "#92400e", lineHeight: 1.7 }}>
                  학습지원 소프트웨어를 학교에서 사용하려면 운영위원회 심의를 먼저 통과해야 합니다. 심의 통과 후 다시 방문해주세요.
                </div>
              </div>

              <button onClick={() => { setShowRegister(false); resetRegisterForm(); }} style={{
                width: "100%", padding: 13, borderRadius: 10, border: "none",
                background: "#f1f5f9", color: "#475569", fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}>확인</button>
            </>)}

            {/* Step: 약관 입력 */}
            {registerStep === "input" && (<>
              <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f0f9ff", border: "1px solid #bae6fd", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#0369a1", lineHeight: 1.6 }}>
                  💡 AI가 약관을 분석하여 <strong>동의서 필요 여부를 판별</strong>하고, 필요한 정보를 자동으로 추출합니다.
                </div>
              </div>

              <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fefce8", border: "1px solid #fde68a", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
                  📌 <strong>동의서가 필요한 경우</strong>: 학생 개인정보(이름, 번호 등)를 서비스에 등록하거나, 학생 계정을 생성하는 경우<br />
                  📌 <strong>동의서가 필요 없는 경우</strong>: 교사만 사용하고 학생 정보를 입력하지 않는 경우 (예: 구글어스, 유튜브)
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>입력 방식</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["url", "이용약관 페이지 URL"], ["text", "약관 텍스트 붙여넣기"]].map(([mode, label]) => (
                    <button key={mode} onClick={() => setInputMode(mode)} style={{
                      padding: "6px 14px", borderRadius: 20, border: "1px solid",
                      borderColor: inputMode === mode ? "#6366f1" : "rgba(0,0,0,0.08)",
                      background: inputMode === mode ? "#6366f1" : "#fff",
                      color: inputMode === mode ? "#fff" : "#475569",
                      fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                    }}>{label}</button>
                  ))}
                </div>
              </div>

              {inputMode === "text" ? (
                <div style={{ marginBottom: 20 }}>
                  <textarea value={termsText} onChange={e => setTermsText(e.target.value)} placeholder="서비스의 이용약관이나 개인정보처리방침 전문을 붙여넣어 주세요..." style={{ width: "100%", minHeight: 160, padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", fontSize: 13, lineHeight: 1.7, fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                </div>
              ) : (
                <div style={{ marginBottom: 20 }}>
                  <input value={termsUrl} onChange={e => setTermsUrl(e.target.value)} placeholder="https://example.com/terms" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>이용약관 또는 개인정보처리방침 페이지의 URL을 입력해 주세요.</p>
                </div>
              )}

              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", marginBottom: 8, padding: "0 2px" }}>
                <input type="checkbox" checked={registerAgreed} onChange={e => setRegisterAgreed(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#6366f1", cursor: "pointer", flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>AI가 분석한 결과는 참고용이며, 등록 전 내용을 반드시 확인합니다. 분석 결과에 대한 책임은 등록자에게 있음에 동의합니다.</span>
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", marginBottom: 16, padding: "0 2px" }}>
                <input type="checkbox" checked={registerShareAgreed} onChange={e => setRegisterShareAgreed(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#6366f1", cursor: "pointer", flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>분석 결과를 바탕으로 생성된 hwpx 파일은 본 플랫폼에 공유되며, 다른 이용자가 다운로드할 수 있음을 인지합니다.</span>
              </label>

              <button onClick={handleAnalyze} disabled={registering || !(registerAgreed && registerShareAgreed)} style={{
                width: "100%", padding: 13, borderRadius: 10, border: "none",
                background: (registerAgreed && registerShareAgreed && !registering) ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "#e2e8f0",
                color: (registerAgreed && registerShareAgreed && !registering) ? "#fff" : "#94a3b8",
                fontSize: 15, fontWeight: 700, cursor: (registerAgreed && registerShareAgreed && !registering) ? "pointer" : "not-allowed",
                fontFamily: "inherit", transition: "all 0.2s",
              }}>
                {registering ? "AI 분석 중... (최대 30초)" : "AI 분석 시작"}
              </button>
            </>)}

            {/* Step: 동의서 불필요 */}
            {registerStep === "not_needed" && analyzeResult && (<>
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#059669", marginBottom: 8 }}>동의서가 필요하지 않습니다</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#334155", marginBottom: 16 }}>{analyzeResult.analysis.name}</div>
              </div>

              <div style={{ padding: "16px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "#166534", lineHeight: 1.7 }}>
                  {analyzeResult.analysis.reason}
                </div>
              </div>

              <div style={{ padding: "12px 14px", borderRadius: 8, background: "#f8fafc", marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
                  💡 교사만 사용하고 학생 개인정보를 입력하지 않는 서비스는 개인정보 수집·이용 동의서를 작성할 필요가 없습니다.
                </div>
              </div>

              <button onClick={() => { setShowRegister(false); resetRegisterForm(); }} style={{
                width: "100%", padding: 13, borderRadius: 10, border: "none",
                background: "#f1f5f9", color: "#475569", fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}>확인</button>
            </>)}

            {/* Step 2: 분석 결과 확인 + 서비스명 수정 */}
            {registerStep === "confirm" && analyzeResult && (<>
              <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#166534", lineHeight: 1.6 }}>
                  ✅ AI 분석이 완료되었습니다. 아래 내용을 확인하고, 서비스명이 다르면 수정해주세요.
                </div>
              </div>

              {/* 서비스명 수정 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>
                  서비스명 <span style={{ color: "#dc2626", fontSize: 11 }}>* 수정 가능</span>
                </label>
                <input value={editName} onChange={e => setEditName(e.target.value)} style={{
                  width: "100%", padding: "10px 14px", borderRadius: 8, border: "2px solid #6366f1",
                  fontSize: 15, fontWeight: 600, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                  background: "#faf5ff",
                }} />
                <p style={{ fontSize: 11, color: "#8b5cf6", marginTop: 4 }}>
                  ⚠️ 실제 웹사이트/앱에서 사용하는 이름으로 입력해주세요. 다른 선생님이 검색할 때 이 이름으로 찾습니다.
                </p>
              </div>

              {/* 카테고리 수정 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>
                  카테고리 <span style={{ color: "#dc2626", fontSize: 11 }}>* 수정 가능</span>
                </label>
                <select value={editCategory} onChange={e => setEditCategory(e.target.value)} style={{
                  width: "100%", padding: "10px 14px", borderRadius: 8, border: "2px solid #6366f1",
                  fontSize: 14, fontWeight: 600, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                  background: "#faf5ff", cursor: "pointer",
                }}>
                  {["디자인", "협업", "학급운영", "LMS", "수업도구", "기타"].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* 분석 결과 표시 */}
              {[
                { label: "케이스", value: ({
                  foreign_no_signup: "국외기업 · 보호자동의 불필요",
                  foreign_with_signup: "국외기업 · 보호자동의 필요",
                  domestic_no_signup: "국내기업 · 보호자동의 불필요",
                  domestic_with_signup: "국내기업 · 보호자동의 필요",
                }[analyzeResult.analysis.case_type] || analyzeResult.analysis.case_type) },
                { label: "수집 항목", value: analyzeResult.analysis.items },
                { label: "이용 목적", value: analyzeResult.analysis.purpose },
                { label: "보유 기간", value: analyzeResult.analysis.retention },
                ...(analyzeResult.analysis.overseas_transfer ? [
                  { label: "이전 국가", value: analyzeResult.analysis.transfer_country },
                  { label: "이전 방법", value: analyzeResult.analysis.transfer_method },
                ] : []),
              ].map(({ label, value }) => value && (
                <div key={label} style={{ display: "flex", padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                  <span style={{ width: 80, fontSize: 12, color: "#94a3b8", fontWeight: 500, flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 12, color: "#334155", fontWeight: 500, lineHeight: 1.5 }}>{value}</span>
                </div>
              ))}

              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <button onClick={() => { setRegisterStep("input"); setAnalyzeResult(null); }} style={{
                  flex: 1, padding: 13, borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)",
                  background: "#fff", color: "#475569", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}>다시 분석</button>
                <button onClick={handleConfirmRegister} disabled={registering || !editName.trim()} style={{
                  flex: 2, padding: 13, borderRadius: 10, border: "none",
                  background: (!registering && editName.trim()) ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "#e2e8f0",
                  color: (!registering && editName.trim()) ? "#fff" : "#94a3b8",
                  fontSize: 15, fontWeight: 700,
                  cursor: (!registering && editName.trim()) ? "pointer" : "not-allowed",
                  fontFamily: "inherit", transition: "all 0.2s",
                }}>
                  {registering ? "등록 중..." : "이 내용으로 등록하기"}
                </button>
              </div>
            </>)}
          </div>
        </div>
      )}

      {/* 생글생글 팝업 */}
      {showSgsg && (
        <div onClick={() => setShowSgsg(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "36px 28px", maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <img src="https://k.kakaocdn.net/dn/JnX0S/dJMcagLLNkH/Iy54jWQUY9nGep2gsP7Fek/img_xl.jpg" alt="생글생글" style={{ width: 64, height: 64, margin: "0 auto 12px", display: "block", borderRadius: 14 }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", background: "linear-gradient(135deg, #7c3aed, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>생글생글</h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px", fontWeight: 500 }}>생기부 올인원 도우미</p>
            <div style={{ padding: "16px 20px", borderRadius: 12, background: "#faf5ff", border: "1px solid #e9d5ff", marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#7c3aed", marginBottom: 4 }}>🗓️ 2025년 5월 1일 오픈!</div>
              <div style={{ fontSize: 13, color: "#8b5cf6", lineHeight: 1.7 }}>행동발달특성, 창의적체험활동 등<br />생활기록부 작성을 생글생글이 도와드려요.</div>
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 20px" }}>
              학기 끝만 되면 찾아오는 생기부 스트레스...<br />이번엔 혼자 고민하지 마세요. 🤝<br />생글생글이 옆에서 함께할게요.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowSgsg(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)", background: "#fff", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>닫기</button>
              <button onClick={() => { setShowSgsg(false); router.push("/services"); }} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #7c3aed, #ec4899)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>전체 서비스 보기</button>
            </div>
          </div>
        </div>
      )}

      {/* 계정 삭제 확인 팝업 */}
      {showDeleteConfirm && (
        <div onClick={() => setShowDeleteConfirm(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", maxWidth: 340, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 18, fontWeight: 750, margin: "0 0 8px" }}>정말 계정을 삭제할까요?</h3>
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: "0 0 20px" }}>저장된 카카오 고유 ID가 삭제되며,<br />이 작업은 되돌릴 수 없습니다.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)", background: "#fff", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>취소</button>
              <button onClick={() => { setShowDeleteConfirm(false); handleDeleteAccount(); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>삭제하기</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1e293b", color: "#fff", padding: "12px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", animation: "toastIn 0.3s ease-out", maxWidth: "calc(100vw - 48px)", textAlign: "center" }}>{toastMsg}</div>
      )}

      <style>{`
        .btn-text-short { display: none; }
        .cat-pills::-webkit-scrollbar { display: none; }
        .cat-pills { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 640px) {
          .header-sub { display: none; }
        }
        @media (min-width: 641px) {
          .modal-sheet { border-radius: 16px !important; margin-bottom: 40px !important; }
        }
      `}</style>
    </div>
  );
}
