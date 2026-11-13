import { createClient } from "@/lib/supabase-server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
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

  // 로그인 계정(auth.users·auth.identities: 카카오 회원번호·이메일)까지 파기
  // 처리방침의 "탈퇴 시 즉시 파기"를 지키기 위해 서비스 롤 키로 삭제한다.
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // 등록한 동의서는 공유 자료로 남기되, 등록자 식별값은 지운다.
  await admin.from("services").update({ registered_by: "" }).eq("registered_by", user.id);

  await supabase.auth.signOut();

  const { error: authError } = await admin.auth.admin.deleteUser(user.id);
  if (authError) {
    console.error("auth user delete failed:", authError.message);
    return NextResponse.json({ error: "계정 삭제 중 오류가 발생했습니다. 카카오채널로 문의해주세요." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
