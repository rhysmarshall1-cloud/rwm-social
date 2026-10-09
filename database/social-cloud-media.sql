-- Applied after social-foundation.sql. Final policy definitions include the qualified object name.
alter table public.social_posts add column photo_paths jsonb not null default '{}'::jsonb check(jsonb_typeof(photo_paths)='object');
alter table public.social_posts add column service text not null default 'Landscaping';
alter table public.social_posts add column source_job_id bigint references public.jobs(id);
create unique index social_posts_source_job on public.social_posts(company_id,business_id,source_job_id) where source_job_id is not null;
create or replace function public.social_post_updated_at() returns trigger language plpgsql security invoker set search_path='' as $$
declare photo_path text;
begin
 if TG_OP='UPDATE' then
  if new.company_id is distinct from old.company_id or new.business_id is distinct from old.business_id then raise exception 'Post business cannot change'; end if;
  if old.status='approved' and (new.caption is distinct from old.caption or new.title is distinct from old.title or new.photo_paths is distinct from old.photo_paths or new.destinations is distinct from old.destinations or new.planned_at is distinct from old.planned_at or new.service is distinct from old.service) then new.status='draft'; end if;
 end if;
 if new.source_job_id is not null and not exists(select 1 from public.jobs where id=new.source_job_id and company_id=new.company_id and status='completed') then raise exception 'Source must be a completed job in this company'; end if;
 for photo_path in select value from jsonb_each_text(new.photo_paths) loop
  if photo_path not like new.company_id::text||'/'||new.business_id::text||'/%' or photo_path like '%..%' then raise exception 'Photo must belong to the post business'; end if;
 end loop;
 if new.status='approved' and 'instagram'=any(new.destinations) and new.photo_paths='{}'::jsonb then raise exception 'Instagram posts require a photo'; end if;
 new.updated_at=clock_timestamp(); return new;
end;$$;
create trigger social_post_insert before insert on public.social_posts for each row execute function public.social_post_updated_at();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('social-media','social-media',false,3145728,array['image/jpeg','image/png','image/webp']);
create policy social_media_owner_read on storage.objects for select to authenticated
using(bucket_id='social-media' and exists(select 1 from public.social_businesses b join public.company_members m on m.company_id=b.company_id where b.company_id::text=(storage.foldername(storage.objects.name))[1] and b.id::text=(storage.foldername(storage.objects.name))[2] and m.user_id=(select auth.uid()) and m.role='owner' and m.status='active'));
create policy social_media_owner_upload on storage.objects for insert to authenticated
with check(bucket_id='social-media' and exists(select 1 from public.social_businesses b join public.company_members m on m.company_id=b.company_id where b.company_id::text=(storage.foldername(storage.objects.name))[1] and b.id::text=(storage.foldername(storage.objects.name))[2] and m.user_id=(select auth.uid()) and m.role='owner' and m.status='active'));
create policy social_media_owner_delete on storage.objects for delete to authenticated
using(bucket_id='social-media' and exists(select 1 from public.social_businesses b join public.company_members m on m.company_id=b.company_id where b.company_id::text=(storage.foldername(storage.objects.name))[1] and b.id::text=(storage.foldername(storage.objects.name))[2] and m.user_id=(select auth.uid()) and m.role='owner' and m.status='active'));
