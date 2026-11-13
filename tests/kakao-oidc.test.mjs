import { test } from "node:test";
import assert from "node:assert/strict";
import {
  KAKAO_SCOPES, buildAuthorizeUrl, buildTokenRequestBody, codeChallengeS256,
  decodeCookie, encodeCookie, safeNext, sameString,
} from "../lib/kakao-oidc.js";

test("요청 항목에 profile 이 없다", () => {
  const url = new URL(buildAuthorizeUrl({ clientId: "k", redirectUri: "https://consent.saenggle.com/auth/kakao/callback", state: "s", codeChallenge: "c" }));
  const scope = url.searchParams.get("scope");
  assert.equal(scope, "openid account_email");
  assert.ok(!/profile/.test(scope));
  assert.ok(!KAKAO_SCOPES.some((s) => s.includes("profile")));
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.equal(url.searchParams.get("prompt"), null);
});

test("relogin 이면 prompt=login", () => {
  const url = new URL(buildAuthorizeUrl({ clientId: "k", redirectUri: "r", state: "s", codeChallenge: "c", prompt: "login" }));
  assert.equal(url.searchParams.get("prompt"), "login");
});

test("PKCE S256 (RFC 7636 예시)", () => {
  assert.equal(codeChallengeS256("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"), "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
});

test("client_secret 은 있을 때만 보낸다", () => {
  const base = { clientId: "k", redirectUri: "r", code: "c", codeVerifier: "v" };
  assert.equal(buildTokenRequestBody(base).get("client_secret"), null);
  assert.equal(buildTokenRequestBody({ ...base, clientSecret: "x" }).get("client_secret"), "x");
});

test("쿠키 왕복·위조 거부", () => {
  const v = encodeCookie({ state: "a", verifier: "b", next: "/x" });
  assert.deepEqual(decodeCookie(v), { state: "a", verifier: "b", next: "/x" });
  assert.equal(decodeCookie("!!!"), null);
  assert.equal(decodeCookie(encodeCookie({ state: 1 })), null);
});

test("next 는 사이트 안 상대 경로만", () => {
  assert.equal(safeNext("/agree"), "/agree");
  assert.equal(safeNext("//evil.com"), null);
  assert.equal(safeNext("/\\evil.com"), null);
  assert.equal(safeNext("https://evil.com"), null);
});

test("state 비교", () => {
  assert.ok(sameString("abc", "abc"));
  assert.ok(!sameString("abc", "abd"));
  assert.ok(!sameString("abc", "ab"));
  assert.ok(!sameString(null, "ab"));
});
