import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  const supabase = createClient();

  // 로그인 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // 관리자 확인
  const { data: userData } = await supabase
    .from("users")
    .select("is_admin")
    .eq("kakao_id", user.id)
    .single();

  if (!userData?.is_admin) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("id");

  if (!serviceId) {
    return NextResponse.json({ error: "서비스 ID가 필요합니다." }, { status: 400 });
  }

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
