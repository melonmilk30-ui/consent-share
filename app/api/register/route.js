import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { terms_text, terms_url } = body;

    if (!terms_text && !terms_url) {
      return NextResponse.json({ error: "이용약관 텍스트 또는 URL을 입력해주세요." }, { status: 400 });
    }

    if (terms_text && terms_text.length < 200) {
      return NextResponse.json({ error: "약관 텍스트가 너무 짧습니다. 200자 이상 입력해주세요." }, { status: 400 });
    }

    const inputText = terms_text || `다음 URL의 이용약관을 분석해주세요: ${terms_url}`;

    // API 키 확인
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 });
    }

    // Claude API 호출
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `당신은 에듀테크 서비스의 이용약관/개인정보처리방침을 분석하는 전문가입니다.

아래 텍스트를 분석하여 다음 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트는 절대 포함하지 마세요.

만약 입력된 텍스트가 소프트웨어/웹서비스의 이용약관이나 개인정보처리방침이 아닌 경우:
{"error": "유효한 이용약관 또는 개인정보처리방침이 아닙니다."}

유효한 약관인 경우:
{
  "name": "서비스 한글명",
  "name_en": "서비스 영문명 (없으면 빈 문자열)",
  "category": "디자인|협업|학급운영|LMS|수업도구|기타 중 하나",
  "items": "수집하는 개인정보 항목 (쉼표 구분)",
  "purpose": "수집 목적 요약",
  "retention": "보유 기간",
  "overseas_transfer": true 또는 false,
  "guardian_consent": true 또는 false,
  "cases": "국외|국내 · 보호자동의 필요|불필요 조합"
}

분석할 텍스트:
${inputText}`,
          },
        ],
      }),
    });

    // Claude 응답 확인
    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      return NextResponse.json({ error: `Claude API 오류 (${claudeRes.status}): ${errText.substring(0, 200)}` }, { status: 500 });
    }

    const claudeData = await claudeRes.json();
    const responseText = claudeData.content
      .map((item) => (item.type === "text" ? item.text : ""))
      .join("")
      .trim();

    let analysis;
    try {
      const cleaned = responseText.replace(/```json|```/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: `AI 응답 파싱 실패: ${responseText.substring(0, 200)}` }, { status: 500 });
    }

    if (analysis.error) {
      return NextResponse.json({ error: analysis.error }, { status: 400 });
    }

    // 같은 서비스 중복 확인
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

      if (new Date() < sixMonthsLater) {
        return NextResponse.json(
          { error: `${analysis.name}은(는) 이미 등록되어 있습니다. ${sixMonthsLater.toLocaleDateString("ko-KR")} 이후 재등록 가능합니다.` },
          { status: 400 }
        );
      }

      await supabase.from("services").delete().eq("id", existing.id);
    }

    // 새로 등록
    const { data, error } = await supabase
      .from("services")
      .insert({
        name: analysis.name,
        name_en: analysis.name_en || "",
        category: analysis.category || "기타",
        cases: analysis.cases || "",
        items: analysis.items || "",
        purpose: analysis.purpose || "",
        retention: analysis.retention || "",
        overseas_transfer: analysis.overseas_transfer || false,
        guardian_consent: analysis.guardian_consent || false,
        raw_terms: (terms_text || terms_url || "").substring(0, 10000),
        registered_by: user.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: `DB 저장 오류: ${error.message}` }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: `서버 오류: ${err.message}` }, { status: 500 });
  }
}
