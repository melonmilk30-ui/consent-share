"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
    <span style={{
      padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500,
      background: c.bg, color: c.text, whiteSpace: "nowrap",
    }}>{text}</span>
  );
}

function Icon({ name }) {
  if (name === "search") return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11.5 11.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (name === "download") return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (name === "plus") return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (name === "check") return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (name === "x") return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (name === "sort") return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 5l4-3 4 3M3 9l4 3 4-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (name === "file") return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 2h7l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M11 2v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M6 10h6M6 13h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
  if (name === "logout") return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return null;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("latest");
  const [selected, setSelected] = useState(new Set());
  const [showDetail, setShowDetail] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const [inputMode, setInputMode] = useState("text"); // "text" or "url"
  const [registerCategory, setRegisterCategory] = useState("기타");
  const [termsText, setTermsText] = useState("");
  const [termsUrl, setTermsUrl] = useState("");
  const [registering, setRegistering] = useState(false);
  const inputRef = useRef(null);

  // 로그인 상태 확인
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      setLoading(false);
      setMounted(true);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // 서비스 목록 불러오기
  useEffect(() => {
    if (!user) return;
    fetchServices();
  }, [user, query, category, sortBy]);

  const fetchServices = async () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category !== "전체") params.set("category", category);
    params.set("sort", sortBy);

    try {
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setServices(data);
    } catch (e) {
      console.error("검색 오류:", e);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const handleSingleDownload = (service) => {
    showToast(`${service.name} 동의서 다운로드 시작!`);
    // TODO: 실제 hwpx 다운로드 API 연결
  };

  const handleMergeDownload = () => {
    const names = services.filter(s => selected.has(s.id)).map(s => s.name).join(", ");
    showToast(`합본 다운로드: ${names}`);
    setSelected(new Set());
    // TODO: 실제 합본 hwpx 다운로드 API 연결
  };

  const handleRegister = async () => {
    if (!termsText && !termsUrl) {
      showToast("이용약관 텍스트 또는 URL을 입력해주세요!");
      return;
    }
    setRegistering(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: registerCategory,
          terms_text: inputMode === "text" ? termsText : null,
          terms_url: inputMode === "url" ? termsUrl : null,
        }),
      });
      if (res.ok) {
        showToast("동의서 등록이 완료되었습니다!");
        setShowRegister(false);
        setTermsText("");
        setTermsUrl("");
        fetchServices();
      } else {
        const err = await res.json();
        showToast(err.error || "등록에 실패했습니다.");
      }
    } catch (e) {
      showToast("서버 오류가 발생했습니다.");
    }
    setRegistering(false);
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
      {/* Header */}
      <header style={{
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 960, margin: "0 auto", padding: "12px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            }}>
              <Icon name="file" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                동의서 공유
              </div>
              <div className="header-sub" style={{ fontSize: 11, color: "#64748b" }}>
                에듀테크 개인정보 동의서 플랫폼
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setShowRegister(true)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 2px 8px rgba(99,102,241,0.3)", fontFamily: "inherit",
            }}>
              <Icon name="plus" />
              <span className="btn-text-full">개인정보 동의서 자동 제작</span>
              <span className="btn-text-short">자동 제작</span>
            </button>
            <button onClick={handleLogout} title="로그아웃" style={{
              padding: 8, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)",
              background: "#fff", color: "#94a3b8", cursor: "pointer", display: "flex",
            }}>
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero + Search */}
      <div style={{
        maxWidth: 960, margin: "0 auto", padding: "32px 20px 0",
        opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <h1 className="hero-title" style={{
          fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em",
          margin: "0 0 6px", lineHeight: 1.3,
          background: "linear-gradient(135deg, #1e293b, #475569)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>한 번 만들면, 모두가 쓰는 동의서</h1>
        <p className="hero-desc" style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px", lineHeight: 1.6 }}>
          전국 선생님들이 등록한 에듀테크 개인정보 동의서를 검색하고 hwpx로 바로 다운로드하세요.
        </p>

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "#fff", borderRadius: 12, padding: "4px 4px 4px 16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}>
          <span style={{ flexShrink: 0, display: "flex", color: "#94a3b8" }}><Icon name="search" /></span>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="서비스명 검색 (예: 캔바, Padlet)"
            style={{
              flex: 1, border: "none", outline: "none", fontSize: 15,
              padding: "10px 0", background: "transparent", fontFamily: "inherit", minWidth: 0,
            }}
          />
          {query && (
            <button onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#94a3b8", display: "flex", flexShrink: 0 }}>
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
                fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                whiteSpace: "nowrap", flexShrink: 0,
              }}>{cat}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <span style={{ color: "#94a3b8", display: "flex" }}><Icon name="sort" /></span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{
                padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)",
                background: "#fff", color: "#475569", fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit", outline: "none",
              }}>
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Merge bar */}
      {selected.size > 0 && (
        <div style={{ position: "sticky", top: 56, zIndex: 40, maxWidth: 960, margin: "16px auto 0", padding: "0 20px" }}>
          <div className="merge-bar" style={{
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            borderRadius: 12, padding: "12px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            color: "#fff", boxShadow: "0 4px 20px rgba(79,70,229,0.35)", gap: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
              <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, padding: "2px 10px", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{selected.size}</span>
              <span style={{ fontSize: 13, fontWeight: 500, flexShrink: 0 }}>개 선택</span>
              <span className="merge-names" style={{ fontSize: 12, opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {services.filter(s => selected.has(s.id)).map(s => s.name).join(" · ")}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => setSelected(new Set())} style={{
                padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)",
                background: "transparent", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              }}>해제</button>
              <button onClick={handleMergeDownload} style={{
                padding: "7px 14px", borderRadius: 8, border: "none", background: "#fff", color: "#4f46e5",
                fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                fontFamily: "inherit", whiteSpace: "nowrap",
              }}>
                <Icon name="download" />
                <span className="merge-dl-text">합본 다운로드</span>
                <span className="merge-dl-short">다운</span>
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
            const isSelected = selected.has(service.id);
            return (
              <div key={service.id} style={{
                background: isSelected ? "rgba(99,102,241,0.04)" : "#fff",
                borderRadius: 12, padding: "14px 16px",
                border: `1px solid ${isSelected ? "rgba(99,102,241,0.3)" : "rgba(0,0,0,0.05)"}`,
                display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                transition: "all 0.2s",
                opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)",
                transitionDelay: `${i * 40}ms`,
              }}>
                <button onClick={e => { e.stopPropagation(); toggleSelect(service.id); }} style={{
                  width: 22, height: 22, borderRadius: 6, border: "1.5px solid",
                  borderColor: isSelected ? "#6366f1" : "#cbd5e1",
                  background: isSelected ? "#6366f1" : "transparent",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
                }}>{isSelected && <Icon name="check" />}</button>

                <div style={{ flex: 1, minWidth: 0 }} onClick={() => setShowDetail(service)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 650, letterSpacing: "-0.01em" }}>{service.name}</span>
                    <TagBadge text={service.category} />
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{service.cases}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                    {new Date(service.created_at).toLocaleDateString("ko-KR")} 등록 · 다운로드 {service.downloads}회
                  </div>
                </div>

                <button onClick={e => { e.stopPropagation(); handleSingleDownload(service); }}
                  className="btn-dl" style={{
                    padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)",
                    background: "#fff", color: "#475569", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                    whiteSpace: "nowrap", fontFamily: "inherit", flexShrink: 0,
                  }}>
                  <Icon name="download" /> <span className="dl-label">.hwpx</span>
                </button>
              </div>
            );
          })}

          {services.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>&#x1F50D;</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>검색 결과가 없습니다</div>
              <div style={{ fontSize: 13 }}>아직 등록되지 않은 서비스라면, 직접 등록해 보세요!</div>
              <button onClick={() => setShowRegister(true)} style={{
                marginTop: 16, padding: "8px 20px", borderRadius: 8,
                border: "none", background: "#6366f1", color: "#fff",
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>개인정보 동의서 자동 제작하기</button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ maxWidth: 960, margin: "0 auto", padding: "20px 20px 32px", textAlign: "center", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>서울중현초 박유빈</div>
      </footer>

      {/* Detail Modal */}
      {showDetail && (
        <div onClick={() => setShowDetail(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
          zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center",
        }}>
          <div onClick={e => e.stopPropagation()} className="modal-sheet" style={{
            background: "#fff", borderRadius: "16px 16px 0 0", padding: "24px 20px",
            maxWidth: 520, width: "100%", maxHeight: "85vh", overflowY: "auto",
            boxShadow: "0 -10px 40px rgba(0,0,0,0.12)", animation: "sheetUp 0.3s ease-out",
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#d1d5db", margin: "0 auto 16px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 750, margin: 0, letterSpacing: "-0.02em" }}>{showDetail.name}</h2>
                <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <TagBadge text={showDetail.category} />
                  <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: "#dbeafe", color: "#1e40af" }}>{showDetail.cases}</span>
                </div>
              </div>
              <button onClick={() => setShowDetail(null)} style={{
                background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", flexShrink: 0,
              }}><Icon name="x" /></button>
            </div>
            {[
              { label: "수집 항목", value: showDetail.items },
              { label: "이용 목적", value: showDetail.purpose },
              { label: "보유 기간", value: showDetail.retention },
              { label: "등록일", value: new Date(showDetail.created_at).toLocaleDateString("ko-KR") },
              { label: "다운로드", value: `${showDetail.downloads}회` },
            ].map(({ label, value }) => value && (
              <div key={label} style={{ display: "flex", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                <span style={{ width: 80, fontSize: 13, color: "#94a3b8", fontWeight: 500, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
            <div className="modal-actions" style={{ display: "flex", gap: 8, marginTop: 24 }}>
              <button onClick={() => { handleSingleDownload(showDetail); setShowDetail(null); }} style={{
                flex: 1, padding: 13, borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit",
              }}><Icon name="download" /> 다운로드 (.hwpx)</button>
              <button onClick={() => { toggleSelect(showDetail.id); setShowDetail(null); }} style={{
                padding: "13px 18px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)",
                background: "#fff", color: "#475569", fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
              }}>{selected.has(showDetail.id) ? "선택 해제" : "합본 추가"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div onClick={() => setShowRegister(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
          zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center",
        }}>
          <div onClick={e => e.stopPropagation()} className="modal-sheet" style={{
            background: "#fff", borderRadius: "16px 16px 0 0", padding: "24px 20px",
            maxWidth: 520, width: "100%", maxHeight: "85vh", overflowY: "auto",
            boxShadow: "0 -10px 40px rgba(0,0,0,0.12)", animation: "sheetUp 0.3s ease-out",
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#d1d5db", margin: "0 auto 16px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 750, margin: 0, letterSpacing: "-0.02em" }}>개인정보 동의서 자동 제작</h2>
              <button onClick={() => setShowRegister(false)} style={{
                background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b",
              }}><Icon name="x" /></button>
            </div>

            {/* Category */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>카테고리</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {CATEGORIES.filter(c => c !== "전체").map(cat => (
                  <button key={cat} onClick={() => setRegisterCategory(cat)} style={{
                    padding: "6px 14px", borderRadius: 20,
                    border: "1px solid", borderColor: registerCategory === cat ? "#6366f1" : "rgba(0,0,0,0.08)",
                    background: registerCategory === cat ? "#6366f1" : "#fff",
                    color: registerCategory === cat ? "#fff" : "#475569",
                    fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                  }}>{cat}</button>
                ))}
              </div>
            </div>

            {/* Input mode toggle */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>입력 방식</label>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setInputMode("text")} style={{
                  padding: "6px 14px", borderRadius: 20, border: "1px solid",
                  borderColor: inputMode === "text" ? "#6366f1" : "rgba(0,0,0,0.08)",
                  background: inputMode === "text" ? "#6366f1" : "#fff",
                  color: inputMode === "text" ? "#fff" : "#475569",
                  fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                }}>약관 텍스트 붙여넣기</button>
                <button onClick={() => setInputMode("url")} style={{
                  padding: "6px 14px", borderRadius: 20, border: "1px solid",
                  borderColor: inputMode === "url" ? "#6366f1" : "rgba(0,0,0,0.08)",
                  background: inputMode === "url" ? "#6366f1" : "#fff",
                  color: inputMode === "url" ? "#fff" : "#475569",
                  fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                }}>이용약관 페이지 URL</button>
              </div>
            </div>

            {/* Input */}
            {inputMode === "text" ? (
              <div style={{ marginBottom: 20 }}>
                <textarea value={termsText} onChange={e => setTermsText(e.target.value)}
                  placeholder="서비스의 이용약관이나 개인정보처리방침 전문을 붙여넣어 주세요..."
                  style={{
                    width: "100%", minHeight: 160, padding: "12px 14px", borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.1)", fontSize: 13, lineHeight: 1.7,
                    fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box",
                  }} />
              </div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <input value={termsUrl} onChange={e => setTermsUrl(e.target.value)}
                  placeholder="https://example.com/terms"
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.1)", fontSize: 14,
                    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                  }} />
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
                  이용약관 또는 개인정보처리방침 페이지의 URL을 입력해 주세요.
                </p>
              </div>
            )}

            <button onClick={handleRegister} disabled={registering} style={{
              width: "100%", padding: 13, borderRadius: 10, border: "none",
              background: registering ? "#94a3b8" : "linear-gradient(135deg, #3b82f6, #6366f1)",
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: registering ? "default" : "pointer",
              fontFamily: "inherit",
            }}>
              {registering ? "분석 중..." : "AI 분석 후 등록하기"}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#1e293b", color: "#fff", padding: "12px 24px",
          borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 200,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)", animation: "toastIn 0.3s ease-out",
          maxWidth: "calc(100vw - 48px)", textAlign: "center",
        }}>{toastMsg}</div>
      )}

      <style>{`
        .btn-text-short { display: none; }
        .merge-dl-short { display: none; }
        .cat-pills::-webkit-scrollbar { display: none; }
        .cat-pills { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 640px) {
          .hero-title { font-size: 22px !important; }
          .hero-desc { font-size: 13px !important; }
          .header-sub { display: none; }
          .btn-text-full { display: none; }
          .btn-text-short { display: inline; }
          .dl-label { display: none; }
          .btn-dl { padding: 8px 10px !important; }
          .merge-names { display: none; }
          .merge-dl-text { display: none; }
          .merge-dl-short { display: inline; }
        }
        @media (min-width: 641px) {
          .modal-sheet { border-radius: 16px !important; margin-bottom: 40px !important; }
        }
      `}</style>
    </div>
  );
}
