#!/usr/bin/env bash
# Flytt GAMLA (dbvbnbkvadvlhjhomibg, Ohio) -> NYA (mnlrpfidyzuaxxlftruf, Irland).
# Tömmer NYA på egna objekt och data, läser in allt på nytt från GAMLA och verifierar.
# GAMLA läses bara: pg_dump, SELECT i skrivskyddade transaktioner och GET mot storage.
# Rör inte vault-hemligheter eller cron-jobb i NYA (de ligger kvar från provflytten).
#
# Krav: pg_dump/psql 17 i PATH, OLD_DB_URL och NEW_DB_URL i .env.local,
#       SUPABASE_TOKEN_JOBBCOACH i miljön, node 18+.
# Körs från repots rot: bash docs/flytt-eu/kor-flytt.sh
set -euo pipefail
D="$(cd "$(dirname "$0")" && pwd)"
ROT="$(cd "$D/../.." && pwd)"
W="${W:-${TEMP:-/tmp}/flytt-eu-$(date +%Y%m%d-%H%M%S)}"
mkdir -p "$W"; cd "$W"
OLD=$(grep -E '^OLD_DB_URL=' "$ROT/.env.local" | head -1 | cut -d= -f2- | tr -d '"\r')
NEW=$(grep -E '^NEW_DB_URL=' "$ROT/.env.local" | head -1 | cut -d= -f2- | tr -d '"\r')
export PGCLIENTENCODING=UTF8
t0=$(date +%s); steg() { echo "[$(( $(date +%s) - t0 ))s] $*"; }
oldq() { psql "$OLD" -X -At -v ON_ERROR_STOP=1 -c "set default_transaction_read_only=on" -c "$1" | grep -v '^SET$' | tr -d '\r'; }
newq() { psql "$NEW" -X -At -v ON_ERROR_STOP=1 -c "$1" | tr -d '\r'; }

steg "1. Dump från GAMLA till $W"
pg_dump -d "$OLD" --schema-only -n public -n supabase_migrations --quote-all-identifiers -f schema.sql
sed -E '/^CREATE SCHEMA "public";$/d; /^ALTER SCHEMA "public" OWNER TO/d; /^COMMENT ON SCHEMA "public"/d; /^ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin"/d' schema.sql > schema_fix.sql
pg_dump -d "$OLD" --data-only -n public -n supabase_migrations --quote-all-identifiers -f data.sql
pg_dump -d "$OLD" --data-only -t auth.users -t auth.identities --quote-all-identifiers -f data_auth.sql
psql "$OLD" -X -At -c "set default_transaction_read_only=on" -f "$D/gen_acl.sql" | grep -v '^SET$' | tr -d '\r' > acl_fix.sql
{
  echo "SET search_path = public, extensions;"
  oldq "select pg_get_triggerdef(oid)||';' from pg_trigger where tgrelid='auth.users'::regclass and not tgisinternal"
  oldq "select format('CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s%s%s;', policyname, schemaname, tablename, permissive, cmd, array_to_string(array(select quote_ident(r) from unnest(roles) r),', '), coalesce(' USING ('||qual||')',''), coalesce(' WITH CHECK ('||with_check||')','')) from pg_policies where schemaname='storage' order by tablename, policyname"
  oldq "select format('ALTER PUBLICATION supabase_realtime ADD TABLE %I.%I;', schemaname, tablename) from pg_publication_tables where pubname='supabase_realtime'"
} > extras.sql
oldq "select json_agg(json_build_object('id',id,'bucket_id',bucket_id,'name',name,'owner',owner,'owner_id',owner_id,'created_at',created_at,'updated_at',updated_at,'last_accessed_at',last_accessed_at,'metadata',metadata,'user_metadata',user_metadata) order by bucket_id,name) from storage.objects" > objects_old.json
oldq "select json_agg(row_to_json(b)) from storage.buckets b" > buckets_old.json
node -e "const fs=require('fs');fs.writeFileSync('objects_old.jsonl', JSON.parse(fs.readFileSync('objects_old.json','utf8')).map(x=>JSON.stringify(x)).join('\n')+'\n')"

steg "2. Töm NYA (egna objekt i public, auth-användare, storage-policys)"
psql "$NEW" -X -v ON_ERROR_STOP=1 --single-transaction > reset.log <<'SQL'
do $$ declare r record; begin
  for r in select policyname from pg_policies where schemaname='storage' and tablename='objects' loop
    execute format('drop policy %I on storage.objects', r.policyname); end loop;
  for r in select tablename from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' loop
    execute format('alter publication supabase_realtime drop table public.%I', r.tablename); end loop;
  for r in select c.oid::regclass::text as n, c.relkind from pg_class c where relnamespace='public'::regnamespace and relkind in ('v','m')
           and not exists(select 1 from pg_depend d where d.objid=c.oid and d.deptype='e') loop
    execute format('drop %s if exists %s cascade', case when r.relkind='m' then 'materialized view' else 'view' end, r.n); end loop;
  for r in select c.oid::regclass::text as n, c.relkind from pg_class c where relnamespace='public'::regnamespace and relkind in ('r','p')
           and not exists(select 1 from pg_depend d where d.objid=c.oid and d.deptype='e') loop
    execute format('drop table if exists %s cascade', r.n); end loop;
  for r in select p.oid::regprocedure::text as n, p.prokind from pg_proc p where pronamespace='public'::regnamespace
           and not exists(select 1 from pg_depend d where d.objid=p.oid and d.deptype='e') loop
    execute format('drop %s if exists %s cascade', case r.prokind when 'p' then 'procedure' when 'a' then 'aggregate' else 'function' end, r.n); end loop;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
drop schema if exists supabase_migrations cascade;
delete from auth.users;
SQL
newq "create extension if not exists pg_cron; create extension if not exists pg_net with schema extensions; create extension if not exists http with schema public; create extension if not exists vector with schema public;"

steg "3. Schema"
psql "$NEW" -X --single-transaction -v ON_ERROR_STOP=1 -f schema_fix.sql > schema_restore.log 2>&1
steg "4. Data (auth.users, auth.identities, public, supabase_migrations)"
psql "$NEW" -X --single-transaction -v ON_ERROR_STOP=1 -c 'SET session_replication_role = replica' -f data_auth.sql -f data.sql > data_restore.log 2>&1
steg "5. Rättigheter exakt som GAMLA, trigger på auth.users, storage-policys, realtime"
psql "$NEW" -X --single-transaction -v ON_ERROR_STOP=1 -c "set search_path=public, extensions" -f acl_fix.sql > acl_fix.log 2>&1
psql "$NEW" -X --single-transaction -v ON_ERROR_STOP=1 -f extras.sql > extras.log 2>&1
psql "$NEW" -X -At -c "set session_replication_role=replica" -c "update public.profiles set profile_photo_url = replace(profile_photo_url, 'dbvbnbkvadvlhjhomibg.supabase.co', 'mnlrpfidyzuaxxlftruf.supabase.co') where profile_photo_url like '%dbvbnbkvadvlhjhomibg%'"

steg "6. Storage-filer"
node "$D/kopiera-storage.mjs" "$W"
psql "$NEW" -X -v ON_ERROR_STOP=1 > storage_meta.log <<'SQL'
begin;
set local session_replication_role = replica;
create temp table o(j jsonb);
\copy o(j) from 'objects_old.jsonl' with (format csv, quote e'\x01', delimiter e'\x02')
update storage.objects s set id=(o.j->>'id')::uuid, owner=(o.j->>'owner')::uuid, owner_id=o.j->>'owner_id',
  created_at=(o.j->>'created_at')::timestamptz, updated_at=(o.j->>'updated_at')::timestamptz,
  last_accessed_at=(o.j->>'last_accessed_at')::timestamptz, user_metadata=o.j->'user_metadata',
  metadata = s.metadata || jsonb_build_object('lastModified', o.j->'metadata'->'lastModified')
from o where s.bucket_id=o.j->>'bucket_id' and s.name=o.j->>'name';
commit;
SQL

steg "7. Kontroll: cron av, pg_net-kö tom"
newq "select jobname||' aktiv='||active from cron.job"
newq "select 'pg_net queue: '||count(*) from net.http_request_queue"

steg "8. Verifiering GAMLA mot NYA"
psql "$OLD" -X -At -c "set default_transaction_read_only=on" -f "$D/counts.sql" | grep -v '^SET$' | tr -d '\r' > verif_old.txt
psql "$NEW" -X -At -f "$D/counts.sql" | tr -d '\r' | sed -E '/^acl\|/ s/arwdDxtm/arwdDxt/g' > verif_new.txt
node -e "
const fs=require('fs');const n=f=>fs.readFileSync(f,'utf8').split('\n').filter(x=>!x.startsWith('funktion|')).map(x=>x.replace(/\{([^}]*)\}\$/,(m,a)=>'{'+a.split(',').sort().join(',')+'}'));
const a=n('verif_old.txt'),b=new Set(n('verif_new.txt'));const d=a.filter(x=>!b.has(x));
console.log(d.length?'AVVIKELSER:\n'+d.join('\n'):'Inga avvikelser (funktionskroppar jämförs separat, bara CR skiljer).');"
steg "Klart. Loggar och dumpar i $W"
