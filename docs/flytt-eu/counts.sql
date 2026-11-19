select 'rader|'||c.oid::regclass::text||'|'||(xpath('/row/c/text()', query_to_xml('select count(*) as c from '||c.oid::regclass, false, true, '')))[1]::text from pg_class c where c.relnamespace='public'::regnamespace and c.relkind in ('r','p') 
union all select 'rader|auth.users|'||count(*) from auth.users
union all select 'rader|auth.identities|'||count(*) from auth.identities
union all select 'rader|supabase_migrations.schema_migrations|'||count(*) from supabase_migrations.schema_migrations
union all select 'storage|'||bucket_id||'|'||count(*)||'|'||sum((metadata->>'size')::bigint) from storage.objects group by bucket_id
union all select 'bucket|'||id||'|'||public||'|'||coalesce(file_size_limit::text,'-')||'|'||coalesce(allowed_mime_types::text,'-') from storage.buckets
union all select 'funktioner_public|'||count(*) from pg_proc p where pronamespace='public'::regnamespace and not exists(select 1 from pg_depend d where d.objid=p.oid and d.deptype='e')
union all select 'funktion|'||p.oid::regprocedure::text||'|'||md5(pg_get_functiondef(p.oid)) from pg_proc p where pronamespace='public'::regnamespace and prokind in ('f','p') and not exists(select 1 from pg_depend d where d.objid=p.oid and d.deptype='e')
union all select 'triggers|'||tgrelid::regclass||'|'||count(*) from pg_trigger where not tgisinternal and (tgrelid::regclass::text !~ '\.' or tgrelid::regclass::text ~ '^auth\.users$') group by tgrelid
union all select 'policys|'||schemaname||'.'||tablename||'|'||count(*) from pg_policies where schemaname in ('public','storage') group by schemaname, tablename
union all select 'rls_pa|'||c.oid::regclass||'|'||c.relrowsecurity||'|'||c.relforcerowsecurity from pg_class c where c.relnamespace='public'::regnamespace and c.relkind in ('r','p')
union all select 'vyer|'||count(*) from pg_class where relnamespace='public'::regnamespace and relkind in ('v','m')
union all select 'index|'||count(*) from pg_class where relnamespace='public'::regnamespace and relkind='i'
union all select 'publikation|'||tablename from pg_publication_tables where pubname='supabase_realtime'
union all select 'sekvens|'||schemaname||'.'||sequencename||'|'||coalesce(last_value,0) from pg_sequences where schemaname='public'
union all select 'vault|'||name from vault.secrets
union all select 'cron|'||jobname||'|'||schedule from cron.job
union all select 'acl|'||c.oid::regclass||'|'||coalesce(c.relacl::text,'-') from pg_class c where c.relnamespace='public'::regnamespace and c.relkind in ('r','v','m','p')
union all select 'constraint|'||conrelid::regclass||'|'||count(*) from pg_constraint where connamespace='public'::regnamespace group by conrelid
order by 1;
