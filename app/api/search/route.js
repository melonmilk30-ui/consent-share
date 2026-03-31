import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "전체";
  const sort = searchParams.get("sort") || "latest";

  let q = supabase.from("services").select("*");

  if (query) {
    q = q.or(`name.ilike.%${query}%,name_en.ilike.%${query}%`);
  }
  if (category && category !== "전체") {
    q = q.eq("category", category);
  }
  if (sort === "popular") {
    q = q.order("downloads", { ascending: false });
  } else {
    q = q.order("created_at", { ascending: false });
  }

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
