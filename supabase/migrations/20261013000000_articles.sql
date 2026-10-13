-- Plumbright articles: the guides shown under /guides/.
-- The public site reads ONLY published rows whose publish time has passed,
-- through the anon key. Writes happen with the service role key (scripts,
-- Supabase dashboard), which bypasses RLS.

create table if not exists public.articles (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique
                       check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  title              text not null check (char_length(title) between 10 and 80),
  description        text not null check (char_length(description) between 70 and 165),
  body_md            text not null check (char_length(body_md) >= 300),
  tool               text not null check (tool in ('concrete', 'tile', 'paint')),
  status             text not null default 'draft' check (status in ('draft', 'published')),
  -- When the article goes live. A future time schedules it: the daily rebuild
  -- picks it up once the time has passed.
  published_at       timestamptz,
  -- Set automatically when the words change after publication (not when only
  -- the status changes). Drives the "Updated" date and the sitemap <lastmod>.
  content_updated_at timestamptz,
  author_slug        text not null default 'eren-simsir',
  created_at         timestamptz not null default now(),
  modified_at        timestamptz not null default now(),
  constraint published_needs_date check (status = 'draft' or published_at is not null)
);

create index if not exists articles_live_idx on public.articles (status, published_at desc);

-- Track real content changes separately from housekeeping edits.
create or replace function public.articles_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.modified_at := now();
  if tg_op = 'UPDATE'
     and old.status = 'published'
     and old.published_at is not null
     and old.published_at <= now()
     and (new.title is distinct from old.title
          or new.description is distinct from old.description
          or new.body_md is distinct from old.body_md
          or new.tool is distinct from old.tool) then
    new.content_updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists articles_touch on public.articles;
create trigger articles_touch
before insert or update on public.articles
for each row execute function public.articles_touch();

-- Row Level Security: the public can read live articles and nothing else.
alter table public.articles enable row level security;

drop policy if exists "Public can read live articles" on public.articles;
create policy "Public can read live articles"
on public.articles
for select
to anon, authenticated
using (status = 'published' and published_at <= now());

revoke all on public.articles from anon, authenticated;
grant select on public.articles to anon, authenticated;
