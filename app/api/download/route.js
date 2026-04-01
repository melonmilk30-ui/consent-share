import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { createConsentHwpx } from "@/lib/hwpx-generator";
import { getTemplateBuffers } from "@/lib/hwpx-templates";

export async function GET(request) {
  const supabase = createClient();

  // 로그인 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "서비스 ID가 필요합니다." }, { status: 400 });
  }

  try {
    // DB에서 서비스 조회
    const { data: service, error: fetchError } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !service) {
      return NextResponse.json({ error: "서비스를 찾을 수 없습니다." }, { status: 404 });
    }

    // hwpx 생성
    const templates = getTemplateBuffers();
    const hwpxBuffer = await createConsentHwpx(service, templates);

    // 다운로드 수 증가
    await supabase
      .from("services")
      .update({ downloads: (service.downloads || 0) + 1 })
      .eq("id", id);

    // 파일명 생성 (한글 서비스명 + 동의서)
    const filename = `(생글생글) ${service.name}_개인정보수집이용동의서.hwpx`;
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
    console.error("Download error:", err);
    return NextResponse.json(
      { error: "hwpx 생성에 실패했습니다: " + err.message },
      { status: 500 }
    );
  }
}
