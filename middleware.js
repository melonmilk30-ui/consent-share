import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 갱신
  const { data: { user } } = await supabase.auth.getUser();

  // 로그인이 필요한 경로 (생성/다운로드/계정 관련 API만)
  const protectedPaths = ["/agree"];
  const protectedApis = ["/api/analyze", "/api/confirm", "/api/download", "/api/download-merge", "/api/delete-account", "/api/admin"];
  
  const isProtectedPage = protectedPaths.some(p => request.nextUrl.pathname === p);
  const isProtectedApi = protectedApis.some(p => request.nextUrl.pathname.startsWith(p));

  if (!user && (isProtectedPage || isProtectedApi)) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "로그인이 필요합니다.", needLogin: true }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|auth|terms|privacy|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
