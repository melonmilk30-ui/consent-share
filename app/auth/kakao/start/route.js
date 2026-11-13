import { NextResponse } from "next/server";
import {
  KAKAO_OIDC_COOKIE,
  KAKAO_OIDC_COOKIE_MAX_AGE,
  buildAuthorizeUrl,
  codeChallengeS256,
  encodeCookie,
  kakaoRedirectUri,
  randomToken,
  safeNext,
} from "@/lib/kakao-oidc";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const clientId = process.env.KAKAO_REST_API_KEY;

  if (!clientId) {
    console.error("KAKAO_REST_API_KEY 가 설정되지 않았습니다.");
    return NextResponse.redirect(`${origin}/login?error=kakao_config`);
  }

  const state = randomToken();
  const verifier = randomToken(48);
  const next = safeNext(searchParams.get("next"));

  const url = buildAuthorizeUrl({
    clientId,
    redirectUri: kakaoRedirectUri(origin),
    state,
    codeChallenge: codeChallengeS256(verifier),
    // 로그아웃 뒤 계정을 다시 고르게 하려면 ?relogin=1
    prompt: searchParams.get("relogin") === "1" ? "login" : undefined,
  });

  const res = NextResponse.redirect(url);
  res.cookies.set(KAKAO_OIDC_COOKIE, encodeCookie({ state, verifier, next }), {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax",
    path: "/auth/kakao",
    maxAge: KAKAO_OIDC_COOKIE_MAX_AGE,
  });
  return res;
}
