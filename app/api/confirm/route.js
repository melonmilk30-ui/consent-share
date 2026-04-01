import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request) {
  const supabase = createClient();

  // 로그인 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { analysis, raw_terms } = body;

    if (!analysis || !analysis.name) {
      return NextResponse.json({ error: "분석 데이터가 필요합니다." }, { status: 400 });
    }

    // 관리자 여부 확인
    const { data: adminUser } = await supabase
      .from("users")
      .select("is_admin")
      .eq("kakao_id", user.id)
      .single();
    const isAdmin = adminUser?.is_admin || false;

    // 같은 서비스가 이미 있는지 확인
    const { data: existing } = await supabase
      .from("services")
      .select("id, created_at")
      .ilike("name", analysis.name)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      const createdDate = new Date(existing.created_at);
      const sixMonthsLater = new Date(createdDate);
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

      // 관리자는 6개월 제한 없이 재등록 가능
      if (new Date() < sixMonthsLater && !isAdmin) {
        return NextResponse.json(
          { error: `${analysis.name}은(는) 이미 등록되어 있습니다. ${sixMonthsLater.toLocaleDateString("ko-KR")} 이후 재등록 가능합니다.` },
          { status: 400 }
        );
      }

      await supabase.from("services").delete().eq("id", existing.id);
    }

    // DB에 등록
    const { data, error } = await supabase
      .from("services")
      .insert({
        name: analysis.name,
        name_en: analysis.name_en || "",
        category: analysis.category || "기타",
        case_type: analysis.case_type || "",
        cases: analysis.case_type || "",
        items: analysis.items || "학년, 반, 번호, 성명",
        purpose: analysis.purpose || "",
        retention: analysis.retention || "회원 탈퇴 시 또는 수집·이용 목적 달성 시까지",
        overseas_transfer: analysis.overseas_transfer || false,
        guardian_consent: analysis.guardian_consent || false,
        transfer_country: analysis.transfer_country || "",
        transfer_method: analysis.transfer_method || "",
        third_party_items: analysis.third_party_items || "",
        raw_terms: raw_terms || "",
        registered_by: user.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Confirm error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
