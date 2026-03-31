import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("is_admin")
    .eq("kakao_id", user.id)
    .single();

  return NextResponse.json({
    kakao_id: user.id,
    is_admin: userData?.is_admin || false,
  });
}
