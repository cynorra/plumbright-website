-- Seven more calculators: guides can now belong to any of the ten tools.
-- Keep this list in step with src/lib/tools.js.
alter table public.articles drop constraint if exists articles_tool_check;
alter table public.articles add constraint articles_tool_check check (
  tool in ('concrete', 'tile', 'paint', 'flooring', 'drywall', 'gravel', 'deck', 'stairs', 'roofing', 'area')
);
