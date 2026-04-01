import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { createConsentHwpx, createCombinedConsentHwpx } from "@/lib/hwpx-generator";
import { getTemplateBuffers } from "@/lib/hwpx-templates";

export async function POST(request) {
  const supabase = createClient();

  // 로그인 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "서비스 ID 목록이 필요합니다." }, { status: 400 });
    }

    if (ids.length > 10) {
      return NextResponse.json({ error: "최대 10개까지 합본 가능합니다." }, { status: 400 });
    }

    // DB에서 서비스 목록 조회
    const { data: services, error: fetchError } = await supabase
      .from("services")
      .select("*")
      .in("id", ids);

    if (fetchError || !services || services.length === 0) {
      return NextResponse.json({ error: "서비스를 찾을 수 없습니다." }, { status: 404 });
    }

    // 요청한 순서대로 정렬
    const orderedServices = ids
      .map((id) => services.find((s) => s.id === id))
      .filter(Boolean);

    // hwpx 생성
    const templates = getTemplateBuffers();
    let hwpxBuffer;

    if (orderedServices.length === 1) {
      hwpxBuffer = await createConsentHwpx(orderedServices[0], templates);
    } else {
      hwpxBuffer = await createCombinedConsentHwpx(orderedServices, templates);
    }

    // 다운로드 수 증가 (각 서비스별)
    for (const svc of orderedServices) {
      await supabase
        .from("services")
        .update({ downloads: (svc.downloads || 0) + 1 })
        .eq("id", svc.id);
    }

    // 파일명 생성
    const names = orderedServices.map((s) => s.name).join("_");
    const filename = orderedServices.length === 1
      ? `(생글생글) ${names}_개인정보수집이용동의서.hwpx`
      : `(생글생글) 동의서합본_${orderedServices.length}건_${names.substring(0, 30)}.hwpx`;
    const encodedFilename = encodeURIComponent(filename);

    return new Response(hwpxBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodedFilename}`,
        "Content-Length": hwpxBuffer.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error("Merge download error:", err);
    return NextResponse.json(
      { error: "합본 hwpx 생성에 실패했습니다: " + err.message },
      { status: 500 }
    );
  }
}
