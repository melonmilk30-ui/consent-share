-- 카카오 닉네임·프로필 사진을 Supabase Auth 메타데이터에서 빼고, 기존 값도 지운다.
-- (생글생글 마이그레이션 0080_strip_kakao_profile 과 같은 내용)
-- ⚠️ 지운 값은 되돌릴 수 없습니다. consent 앱 코드는 이 값을 쓰지 않습니다(2026-11-13 확인).
-- 로그인 판별에 쓰는 sub·provider_id·email 은 그대로 남습니다.

create or replace function public.strip_kakao_profile_users() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.raw_user_meta_data is not null then
    new.raw_user_meta_data := new.raw_user_meta_data - array['name','full_name','user_name','preferred_username','nickname','avatar_url','picture'];
  end if;
  return new;
end; $$;
create or replace function public.strip_kakao_profile_identities() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.identity_data is not null then
    new.identity_data := new.identity_data - array['name','full_name','user_name','preferred_username','nickname','avatar_url','picture'];
  end if;
  return new;
end; $$;
revoke execute on function public.strip_kakao_profile_users() from public, anon, authenticated;
revoke execute on function public.strip_kakao_profile_identities() from public, anon, authenticated;
drop trigger if exists strip_kakao_profile_users on auth.users;
drop trigger if exists strip_kakao_profile_identities on auth.identities;
create trigger strip_kakao_profile_users before insert or update of raw_user_meta_data on auth.users
  for each row execute function public.strip_kakao_profile_users();
create trigger strip_kakao_profile_identities before insert or update of identity_data on auth.identities
  for each row execute function public.strip_kakao_profile_identities();

-- 기존 값 정리(트리거가 같은 키를 빼 줌)
update auth.users set raw_user_meta_data = raw_user_meta_data
  where raw_user_meta_data ?| array['name','full_name','user_name','preferred_username','nickname','avatar_url','picture'];
update auth.identities set identity_data = identity_data
  where identity_data ?| array['name','full_name','user_name','preferred_username','nickname','avatar_url','picture'];

-- 확인(0이면 성공)
-- select count(*) from auth.users where raw_user_meta_data ?| array['name','full_name','avatar_url','picture'];
