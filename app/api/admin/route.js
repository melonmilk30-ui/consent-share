import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

async function checkAdmin(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다.", status: 401 };

  const { data: userData } = await supabase
    .from("users")
    .select("is_admin")
    .eq("kakao_id", user.id)
    .single();

  if (!userData?.is_admin) return { error: "권한이 없습니다.", status: 403 };
  return { ok: true };
}

export async function DELETE(request) {
  const supabase = createClient();
  const auth = await checkAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

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

export async function PATCH(request) {
  const supabase = createClient();
  const auth = await checkAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id, name, category } = await request.json();

    if (!id) return NextResponse.json({ error: "서비스 ID가 필요합니다." }, { status: 400 });

    const updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;

    const { error } = await supabase
      .from("services")
      .update(updateData)
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
