with rel as (
  select c.oid, c.oid::regclass::text as nm, case when c.relkind='S' then 'SEQUENCE' else 'TABLE' end as kw, c.relacl as acl
  from pg_class c where relnamespace='public'::regnamespace and relkind in ('r','v','m','p','S')
), fn as (
  select p.oid, 'public.'||p.oid::regprocedure::text as nm, case when p.prokind='p' then 'PROCEDURE' else 'FUNCTION' end as kw, p.proacl as acl
  from pg_proc p where pronamespace='public'::regnamespace and not exists(select 1 from pg_depend d where d.objid=p.oid and d.deptype='e')
), alla as (select * from rel union all select * from fn)
select format('REVOKE ALL ON %s %s FROM PUBLIC, anon, authenticated, service_role;', kw, nm) ||
  coalesce((select string_agg(format(' GRANT %s ON %s %s TO %s%s;', e.privilege_type, a.kw, a.nm,
      case when e.grantee=0 then 'PUBLIC' else quote_ident(e.grantee::regrole::text) end,
      case when e.is_grantable then ' WITH GRANT OPTION' else '' end), '')
    from aclexplode(a.acl) e where e.grantee=0 or e.grantee::regrole::text in ('anon','authenticated','service_role')), '')
from alla a order by nm;
