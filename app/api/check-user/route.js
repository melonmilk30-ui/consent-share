import { createClient } from "@/lib/supabase-server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
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

  const isAdmin = userData?.is_admin || false;

  let total_users = 0;
  if (isAdmin) {
    // RLS 우회하여 전체 가입자 수 조회
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { count } = await serviceSupabase
      .from("users")
      .select("*", { count: "exact", head: true });
    total_users = count || 0;
  }

  return NextResponse.json({
    kakao_id: user.id,
    is_admin: isAdmin,
    total_users,
  });
}
