import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase-server";
import {
  KAKAO_OIDC_COOKIE,
  decodeCookie,
  exchangeCodeForTokens,
  kakaoRedirectUri,
  sameString,
} from "@/lib/kakao-oidc";

export const dynamic = "force-dynamic";

function fail(origin, reason) {
  const res = NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);
  res.cookies.set(KAKAO_OIDC_COOKIE, "", { path: "/auth/kakao", maxAge: 0 });
  return res;
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const cookieStore = cookies();
  const saved = decodeCookie(cookieStore.get(KAKAO_OIDC_COOKIE)?.value);

  // 사용자가 동의 화면에서 취소했거나 카카오가 오류를 돌려준 경우
  if (searchParams.get("error")) return fail(origin, "kakao_cancel");

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !saved || !sameString(state, saved.state)) {
    return fail(origin, "kakao_state");
  }

  let tokens;
  try {
    tokens = await exchangeCodeForTokens({
      clientId: process.env.KAKAO_REST_API_KEY,
      clientSecret: process.env.KAKAO_CLIENT_SECRET || undefined,
      redirectUri: kakaoRedirectUri(origin),
      code,
      codeVerifier: saved.verifier,
    });
  } catch (e) {
    console.error(e.message);
    return fail(origin, "kakao_token");
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "kakao",
    token: tokens.id_token,
  });
  if (error || !data?.user) {
    console.error("signInWithIdToken failed:", error?.message);
    return fail(origin, "supabase_signin");
  }

  // 기존 /auth/callback 과 같은 후처리: 가입 여부에 따라 이동
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("kakao_id", data.user.id)
    .single();

  const dest = existingUser ? saved.next || "/" : "/agree";
  cookieStore.set(KAKAO_OIDC_COOKIE, "", { path: "/auth/kakao", maxAge: 0 });
  return NextResponse.redirect(`${origin}${dest}`);
}
