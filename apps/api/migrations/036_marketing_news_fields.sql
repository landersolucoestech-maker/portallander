alter table marketing_contents add column if not exists body text not null default '';

update marketing_contents
set body=coalesce(nullif(trim(creative_config #>> '{bodyText,text}'),''),nullif(trim(creative_config #>> '{subtitle,text}'),''),'')
where body='';

alter table marketing_contents rename column hashtags to hashtags_legacy;
alter table marketing_contents add column hashtags text[] not null default '{}'::text[];

update marketing_contents m
set hashtags=coalesce((
  select array_agg(tag order by ordinal)
  from (
    select distinct on (lower(tag)) tag,ordinal
    from (
      select case when left(cleaned,1)='#' then lower(cleaned) else '#'||lower(cleaned) end as tag,ordinal
      from regexp_split_to_table(coalesce(m.hashtags_legacy,''),'[\s,]+') with ordinality as parts(raw,ordinal)
      cross join lateral (select trim(raw) as cleaned) normalized
      where cleaned<>'' and regexp_replace(cleaned,'^#+','') ~ '^[[:alnum:]_]+$'
    ) candidate
    order by lower(tag),ordinal
  ) unique_tags
  where ordinal<=5
),'{}'::text[]);

alter table marketing_contents drop column hashtags_legacy;

create or replace function marketing_hashtags_are_valid(tags text[])
returns boolean
language sql
immutable
as $$
  select cardinality(tags)<=5
    and not exists(select 1 from unnest(tags) tag where tag !~ '^#[[:alnum:]_]+$')
    and (select count(*) from unnest(tags))=(select count(distinct lower(tag)) from unnest(tags) tag);
$$;

alter table marketing_contents drop constraint if exists marketing_contents_hashtags_valid;
alter table marketing_contents add constraint marketing_contents_hashtags_valid check(marketing_hashtags_are_valid(hashtags));
