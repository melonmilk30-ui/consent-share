import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // users 테이블에서 삭제
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("kakao_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 로그아웃 처리
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
