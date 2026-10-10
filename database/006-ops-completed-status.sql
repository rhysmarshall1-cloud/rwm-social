CREATE OR REPLACE FUNCTION public.social_post_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path TO ''
AS $function$
declare photo_path text;
begin
 if TG_OP='UPDATE' then
  if new.company_id is distinct from old.company_id or new.business_id is distinct from old.business_id then raise exception 'Post business cannot change'; end if;
  if old.status='approved' and (new.caption is distinct from old.caption or new.title is distinct from old.title or new.photo_paths is distinct from old.photo_paths or new.destinations is distinct from old.destinations or new.planned_at is distinct from old.planned_at or new.service is distinct from old.service) then new.status='draft'; end if;
 end if;
 if new.source_job_id is not null and not exists(select 1 from public.jobs where id=new.source_job_id and company_id=new.company_id and lower(status)='completed') then raise exception 'Source must be a completed job in this company'; end if;
 for photo_path in select value from jsonb_each_text(new.photo_paths) loop
  if photo_path not like new.company_id::text||'/'||new.business_id::text||'/%' or photo_path like '%..%' then raise exception 'Photo must belong to the post business'; end if;
 end loop;
 if new.status='approved' and 'instagram'=any(new.destinations) and new.photo_paths='{}'::jsonb then raise exception 'Instagram posts require a photo'; end if;
 new.updated_at=clock_timestamp(); return new;
end;$function$;