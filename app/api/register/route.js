import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { category, terms_text, terms_url } = body;

    if (!terms_text && !terms_url) {
      return NextResponse.json(
        { error: "이용약관 텍스트 또는 URL을 입력해주세요." },
        { status: 400 }
      );
    }

    // TODO: Claude API 연결
    // 1. terms_url이 있으면 해당 페이지 크롤링해서 텍스트 추출
    // 2. Claude API로 약관 텍스트 분석 → 서비스명, 수집항목, 보유기간 등 추출
    // 3. 지금은 임시 데이터로 저장

    const analysisResult = {
      name: "분석 대기 중",
      items: "분석 대기 중",
      purpose: "분석 대기 중",
      retention: "분석 대기 중",
      cases: "국내 · 보호자동의 불필요",
      overseas_transfer: false,
      guardian_consent: false,
    };

    const { data, error } = await supabase
      .from("services")
      .insert({
        name: analysisResult.name,
        category: category || "기타",
        cases: analysisResult.cases,
        items: analysisResult.items,
        purpose: analysisResult.purpose,
        retention: analysisResult.retention,
        overseas_transfer: analysisResult.overseas_transfer,
        guardian_consent: analysisResult.guardian_consent,
        raw_terms: terms_text || terms_url,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
