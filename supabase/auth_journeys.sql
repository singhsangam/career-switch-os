-- Auth-backed journeys (run in SQL Editor after the original schema).
-- Same email login on phone + laptop = same progress automatically.

create table if not exists public.user_journeys (
  user_id uuid primary key references auth.users (id) on delete cascade,
  schema_version int not null default 1,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.user_journeys enable row level security;

revoke all on public.user_journeys from anon, authenticated;

create policy "user_journeys_select_own"
  on public.user_journeys for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_journeys_insert_own"
  on public.user_journeys for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "user_journeys_update_own"
  on public.user_journeys for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on public.user_journeys to authenticated;

-- Convenience RPCs (also enforce auth.uid())
create or replace function public.fetch_my_journey()
returns table (schema_version int, payload jsonb, updated_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select j.schema_version, j.payload, j.updated_at
  from public.user_journeys j
  where j.user_id = auth.uid();
$$;

create or replace function public.upsert_my_journey(
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
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.user_journeys (user_id, schema_version, payload, updated_at)
  values (auth.uid(), p_schema, p_payload, coalesce(p_updated, now()))
  on conflict (user_id) do update
  set
    schema_version = excluded.schema_version,
    payload = excluded.payload,
    updated_at = excluded.updated_at
  where excluded.updated_at >= user_journeys.updated_at;
end;
$$;

grant execute on function public.fetch_my_journey() to authenticated;
grant execute on function public.upsert_my_journey(int, jsonb, timestamptz) to authenticated;
