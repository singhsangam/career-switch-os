-- Run this once in the Supabase SQL Editor (Project → SQL → New query).
-- Security model: journeys are reachable only by exact sync id via RPCs
-- (no table listing for anon). Treat your RTD-**** sync code like a password.

create table if not exists public.journeys (
  id text primary key,
  schema_version int not null default 1,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.journeys enable row level security;

-- No direct table access for anon/authenticated
revoke all on public.journeys from anon, authenticated;

create or replace function public.fetch_journey(p_id text)
returns table (schema_version int, payload jsonb, updated_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select j.schema_version, j.payload, j.updated_at
  from public.journeys j
  where j.id = p_id;
$$;

create or replace function public.upsert_journey(
  p_id text,
  p_schema int,
  p_payload jsonb,
  p_updated timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.journeys (id, schema_version, payload, updated_at)
  values (p_id, p_schema, p_payload, coalesce(p_updated, now()))
  on conflict (id) do update
  set
    schema_version = excluded.schema_version,
    payload = excluded.payload,
    updated_at = excluded.updated_at
  where excluded.updated_at >= journeys.updated_at;
end;
$$;

grant execute on function public.fetch_journey(text) to anon, authenticated;
grant execute on function public.upsert_journey(text, int, jsonb, timestamptz) to anon, authenticated;
