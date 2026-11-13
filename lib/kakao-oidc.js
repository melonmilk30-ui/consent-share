/**
 * 카카오 OIDC 직접 로그인 도우미
 *
 * Supabase 기본 카카오 로그인(signInWithOAuth)은 항상
 * `account_email profile_image profile_nickname` 을 요청한다.
 * 카카오 콘솔에서 닉네임·프로필 사진을 '사용 안 함'으로 바꿨기 때문에
 * 그대로 두면 KOE205 오류가 난다.
 * 그래서 카카오에 직접 `openid account_email` 만 요청하고,
 * 받은 id_token 을 supabase.auth.signInWithIdToken 으로 넘긴다.
 */

import crypto from "node:crypto";

export const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";
export const KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";

// 프로필(닉네임·사진)은 절대 넣지 않는다.
export const KAKAO_SCOPES = ["openid", "account_email"];

export const KAKAO_OIDC_COOKIE = "kakao_oidc";
export const KAKAO_OIDC_COOKIE_MAX_AGE = 60 * 10; // 10분

function base64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function randomToken(bytes = 32) {
  return base64url(crypto.randomBytes(bytes));
}

export function codeChallengeS256(verifier) {
  return base64url(crypto.createHash("sha256").update(verifier).digest());
}

export function kakaoRedirectUri(origin) {
  return `${origin}/auth/kakao/callback`;
}

/** 로그인 후 이동할 경로: 같은 사이트 안의 상대 경로만 허용 */
export function safeNext(next) {
  if (typeof next !== "string") return null;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

export function buildAuthorizeUrl({ clientId, redirectUri, state, codeChallenge, prompt }) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: KAKAO_SCOPES.join(" "),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  if (prompt) params.set("prompt", prompt);
  return `${KAKAO_AUTHORIZE_URL}?${params.toString()}`;
}

export function buildTokenRequestBody({ clientId, clientSecret, redirectUri, code, codeVerifier }) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });
  // 카카오 콘솔에서 Client Secret 을 '사용함'으로 둔 경우에만 보낸다.
  if (clientSecret) body.set("client_secret", clientSecret);
  return body;
}

export async function exchangeCodeForTokens(opts, fetchImpl = fetch) {
  const res = await fetchImpl(KAKAO_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: buildTokenRequestBody(opts).toString(),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.id_token) {
    const reason = json.error_code || json.error || `HTTP ${res.status}`;
    throw new Error(`kakao token exchange failed: ${reason}`);
  }
  return json;
}

export function encodeCookie(payload) {
  return base64url(Buffer.from(JSON.stringify(payload)));
}

export function decodeCookie(value) {
  if (!value) return null;
  try {
    const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const data = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
    if (typeof data?.state !== "string" || typeof data?.verifier !== "string") return null;
    return data;
  } catch {
    return null;
  }
}

/** 길이가 달라도 안전하게 비교 */
export function sameString(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}
