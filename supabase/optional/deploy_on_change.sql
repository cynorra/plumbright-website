-- OPTIONAL: rebuild the site as soon as articles change, instead of waiting for
-- the daily scheduled run. Run this in the Supabase SQL editor after:
--   1. Database > Extensions: enable "pg_net".
--   2. Create a GitHub fine-grained token for this repository only, with
--      "Contents: Read and write" (needed for repository_dispatch).
--   3. Store it in Vault (Project Settings > Vault, or SQL):
--        select vault.create_secret('<token>', 'github_dispatch_token');
--   4. Replace OWNER/REPO below.
-- Not covered by the local tests (pg_net and Vault exist only on Supabase).

create or replace function public.request_site_rebuild()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  token text;
begin
  select decrypted_secret into token
  from vault.decrypted_secrets
  where name = 'github_dispatch_token';

  if token is null then
    raise warning 'github_dispatch_token not found in Vault; skipping rebuild request';
    return null;
  end if;

  perform net.http_post(
    url := 'https://api.github.com/repos/OWNER/REPO/dispatches',
    body := jsonb_build_object('event_type', 'articles-changed'),
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || token,
      'Accept', 'application/vnd.github+json',
      'User-Agent', 'supabase-pg-net'
    )
  );
  return null;
end;
$$;

-- One request per statement, so pushing 20 articles at once triggers one build.
drop trigger if exists articles_request_rebuild on public.articles;
create trigger articles_request_rebuild
after insert or update or delete on public.articles
for each statement execute function public.request_site_rebuild();
