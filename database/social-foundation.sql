create table public.social_businesses (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.companies(id) on delete cascade,
 slug text not null check (slug ~ '^[a-z0-9-]+$'),
 name text not null check (length(name) between 1 and 120),
 facebook_url text,
 instagram_url text,
 created_at timestamptz not null default now(),
 unique(company_id,slug),
 unique(company_id,id)
);
create table public.social_posts (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null,
 business_id uuid not null,
 title text not null check(length(title) between 1 and 120),
 caption text not null default '' check(length(caption)<=5000),
 status text not null default 'to_write' check(status in ('to_write','draft','approved')),
 planned_at timestamptz,
 destinations text[] not null default array['facebook','instagram']::text[]
   check(cardinality(destinations)>0 and destinations <@ array['facebook','instagram']::text[]),
 marketing_consent boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 foreign key(company_id,business_id) references public.social_businesses(company_id,id) on delete cascade,
 check(status <> 'approved' or (marketing_consent and length(btrim(caption))>0))
);
create index social_posts_business_calendar on public.social_posts(company_id,business_id,planned_at);
alter table public.social_businesses enable row level security;
alter table public.social_posts enable row level security;
revoke all on public.social_businesses,public.social_posts from anon;
grant select,insert,update,delete on public.social_businesses,public.social_posts to authenticated,service_role;
create policy social_businesses_owner on public.social_businesses for all to authenticated
using (company_id in (select company_id from public.company_members where user_id=(select auth.uid()) and role='owner' and status='active'))
with check (company_id in (select company_id from public.company_members where user_id=(select auth.uid()) and role='owner' and status='active'));
create policy social_posts_owner on public.social_posts for all to authenticated
using (company_id in (select company_id from public.company_members where user_id=(select auth.uid()) and role='owner' and status='active'))
with check (company_id in (select company_id from public.company_members where user_id=(select auth.uid()) and role='owner' and status='active'));
create function public.social_post_updated_at() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
 if new.company_id is distinct from old.company_id or new.business_id is distinct from old.business_id then
 raise exception 'Move content by creating a new post in the destination business';
 end if;
 new.updated_at=now();
 return new;
end;
$$;
revoke all on function public.social_post_updated_at() from public,anon,authenticated;
create trigger social_post_update before update on public.social_posts for each row execute function public.social_post_updated_at();
