import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `당신은 에듀테크 서비스의 이용약관/개인정보처리방침을 분석하여 학교용 개인정보 수집·이용 동의서 작성에 필요한 정보를 추출하는 전문가입니다.

**중요: 이 동의서는 학생·학부모의 개인정보 수집에 대한 것입니다.**

분석 결과를 다음 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트는 절대 포함하지 마세요.

만약 입력된 텍스트가 소프트웨어/웹서비스의 이용약관이나 개인정보처리방침이 아닌 경우:
{"error": "유효한 이용약관 또는 개인정보처리방침이 아닙니다."}

유효한 약관인 경우, 먼저 **동의서 필요 여부**를 판별하세요:

[동의서가 필요한 경우]
- 학생의 개인정보(이름, 학번, 이메일 등)를 서비스에 등록/입력해야 하는 경우
- 교사가 학생 계정을 일괄 생성하는 기능이 있는 경우
- 학생이 직접 회원가입해야 하는 경우

[동의서가 필요 없는 경우]
- 교사 혼자 사용하고 학생 개인정보를 입력할 필요가 없는 경우
- 로그인 없이 사용 가능한 경우 (예: 구글어스, 스텔라리움)
- 교사 계정으로만 사용하고 학생 정보를 수집하지 않는 경우

동의서가 필요 없는 경우:
{
  "consent_needed": false,
  "name": "서비스명 (실제 웹사이트/앱에서 사용하는 이름)",
  "reason": "동의서가 필요하지 않은 이유 (1~2문장)"
}

동의서가 필요한 경우:
{
  "consent_needed": true,
  "name": "서비스명 (한글명 영문명 (법인명) 형식. 예: 캔바 Canva (Canva Pty Ltd.), 클래스팅 (㈜클래스팅))",
  "name_en": "서비스 영문명 (없으면 빈 문자열)",
  "category": "디자인|협업|학급운영|LMS|수업도구|기타 중 하나",
  "case_type": "아래 4가지 중 하나",
  "items": "학생·학부모 관련 수집 항목만 (쉼표 구분, 최소: 학년, 반, 번호, 성명)",
  "purpose": "학생·학부모 관련 수집 목적만 요약",
  "retention": "보유 기간 (불명시: 회원 탈퇴 시 또는 수집·이용 목적 달성 시까지)",
  "third_party_items": "제3자 제공 항목 (없으면 빈 문자열)",
  "overseas_transfer": true 또는 false,
  "transfer_country": "국외이전 국가 (국내기업이면 빈 문자열)",
  "transfer_method": "국외이전 방법 (국내기업이면 빈 문자열, 불명시: 활용 동의 후 클라우드 서버를 통한 자동 전송)",
  "guardian_consent": true 또는 false
}

**서비스명 주의사항:**
- 이용약관의 법적 명칭이 아니라, 실제로 사용자들이 부르는 웹사이트/앱 이름을 사용하세요.
- 영문명이 기본인 서비스는 한글 표기를 앞에 붙이세요.
- 법인명은 괄호 안에 병기하세요.
- 예: 약관에 "주식회사 클래스팅 서비스"라고 되어 있어도 → "클래스팅 (㈜클래스팅)"
- 예: 약관에 "Canva Pty Ltd"라고 되어 있어도 → "캔바 Canva (Canva Pty Ltd.)"
- 예: 약관에 "Wallwisher, Inc. Service"라고 되어 있어도 → "패들렛 Padlet (Wallwisher, Inc.)"
- 예: 약관에 "Google LLC"라고 되어 있어도 → "구글 어스 Google Earth (Google LLC)"

**수집항목·이용목적 필터링 규칙:**
- 교사 전용 항목은 반드시 제외하세요: GPKI, 담당학년, 수업과목, 교사인증, 교원번호, NEIS 정보 등
- 학생·학부모와 관련된 항목만 포함하세요: 학년, 반, 번호, 성명, 이메일, 학습 데이터 등
- 이용목적도 교사 인증, 교사 관리 등은 제외하고 학생·학부모 관련 목적만 포함하세요

case_type 판별 기준:
- "foreign_no_signup": 국외기업(본사/서버 해외 또는 국외이전 조항 있음) + 학생 계정 생성이 없는 경우 (학생 정보 등록만)
- "foreign_with_signup": 국외기업 + 학생 계정을 생성하는 경우 (학생 직접 가입, 교사 일괄 계정 생성, 보호자 동의 후 가입 모두 포함)
- "domestic_no_signup": 국내기업(본사·서버 국내, 국외이전 조항 없음) + 학생 계정 생성이 없는 경우 (학생 정보 등록만)
- "domestic_with_signup": 국내기업 + 학생 계정을 생성하는 경우 (학생 직접 가입, 교사 일괄 계정 생성, 보호자 동의 후 가입 모두 포함)`;

export async function POST(request) {
  const supabase = createClient();

  // 로그인 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { terms_text, terms_url, privacy_text, privacy_url } = body;

    const hasText = terms_text || privacy_text;
    const hasUrl = terms_url || privacy_url;

    if (!hasText && !hasUrl) {
      return NextResponse.json(
        { error: "이용약관 또는 개인정보처리방침을 입력해주세요." },
        { status: 400 }
      );
    }

    // Claude API 호출
    const isUrl = !hasText && hasUrl;
    let userMessage = "";

    if (isUrl) {
      // URL 모드: 두 개 URL을 함께 전달
      const urls = [];
      if (terms_url) urls.push(`이용약관: ${terms_url}`);
      if (privacy_url) urls.push(`개인정보처리방침: ${privacy_url}`);
      userMessage = `다음 에듀테크 서비스의 URL입니다:\n${urls.join("\n")}

위 URL에 접속하여 이용약관과 개인정보처리방침을 모두 읽고 분석해주세요.
특히 개인정보처리방침에서 수집하는 개인정보 항목(이름, 학년, 반, 번호 등)을 반드시 확인해주세요.
이용약관에는 개인정보 수집 내용이 없더라도 개인정보처리방침에 학생 정보 수집이 명시되어 있다면 동의서가 필요합니다.`;
    } else {
      // 텍스트 모드: 두 텍스트를 구분하여 전달
      const parts = [];
      if (terms_text) parts.push(`[이용약관]\n${terms_text}`);
      if (privacy_text) parts.push(`[개인정보처리방침]\n${privacy_text}`);
      userMessage = `다음 이용약관과 개인정보처리방침을 분석해주세요:\n\n${parts.join("\n\n---\n\n")}`;
    }

    const claudeBody = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    };

    if (isUrl) {
      claudeBody.tools = [
        { type: "web_search_20250305", name: "web_search" },
      ];
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log("API Key exists:", !!apiKey, "Length:", apiKey?.length, "Starts with:", apiKey?.substring(0, 10));

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(claudeBody),
    });

    if (!claudeRes.ok) {
      const errBody = await claudeRes.text();
      console.error("Claude API error:", claudeRes.status, errBody);
      return NextResponse.json(
        { error: "AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      );
    }

    const claudeData = await claudeRes.json();
    const responseText = claudeData.content
      .filter((item) => item.type === "text")
      .map((item) => item.text)
      .join("")
      .trim();

    if (!responseText) {
      return NextResponse.json(
        { error: "AI가 약관 내용을 찾지 못했습니다. 약관 텍스트를 직접 붙여넣어 주세요." },
        { status: 400 }
      );
    }

    // JSON 파싱
    let analysis;
    try {
      let jsonStr = responseText;
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        const firstBrace = responseText.indexOf("{");
        const lastBrace = responseText.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1) {
          jsonStr = responseText.substring(firstBrace, lastBrace + 1);
        }
      }
      analysis = JSON.parse(jsonStr.trim());
    } catch {
      console.error("JSON parse failed:", responseText.substring(0, 500));
      return NextResponse.json(
        { error: "AI 응답을 처리할 수 없습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    if (analysis.error) {
      return NextResponse.json({ error: analysis.error }, { status: 400 });
    }

    // 분석 결과만 반환 (아직 DB에 저장하지 않음!)
    return NextResponse.json({
      analysis,
      raw_terms: [terms_text, privacy_text, terms_url, privacy_url].filter(Boolean).join("\n---\n"),
    });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
