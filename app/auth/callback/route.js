import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 유저 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // users 테이블에서 이미 가입한 유저인지 확인
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("kakao_id", user.id)
          .single();

        if (existingUser) {
          // 재방문 → 바로 메인
          return NextResponse.redirect(`${origin}/`);
        } else {
          // 첫 방문 → 약관 동의 페이지
          return NextResponse.redirect(`${origin}/agree`);
        }
      }
    }
  }

  // 실패 시 → 로그인 페이지
  return NextResponse.redirect(`${origin}/login`);
}
