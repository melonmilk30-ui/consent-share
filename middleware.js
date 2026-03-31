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

  // 로그인 안 된 상태에서 보호 페이지 접근 시 → 로그인으로
  const protectedPaths = ["/", "/agree", "/services"];
  const isProtected = protectedPaths.some(p =>
    request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith("/api/")
  );

  if (!user && isProtected && !request.nextUrl.pathname.startsWith("/api/search")) {
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
