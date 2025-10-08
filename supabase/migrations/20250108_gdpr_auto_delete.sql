-- P2: GDPR-kompatibel auto-radering av testrelaterade data
-- Raderar data äldre än 12 månader varje natt kl. 03:00 UTC

-- 1. Aktivera pg_cron extension för schemalagda jobb
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Skapa en funktion för att radera gammal testdata
CREATE OR REPLACE FUNCTION delete_old_test_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_results INTEGER;
  deleted_answers INTEGER;
BEGIN
  -- Radera test_results äldre än 12 månader
  DELETE FROM test_results
  WHERE completed_at < NOW() - INTERVAL '12 months';
  GET DIAGNOSTICS deleted_results = ROW_COUNT;

  -- Radera test_user_answers äldre än 12 månader
  DELETE FROM test_user_answers
  WHERE answered_at < NOW() - INTERVAL '12 months';
  GET DIAGNOSTICS deleted_answers = ROW_COUNT;

  -- Logga resultatet (kan ses i Supabase logs)
  RAISE NOTICE 'GDPR auto-delete: Removed % test_results and % test_user_answers older than 12 months',
    deleted_results, deleted_answers;
END;
$$;

-- 3. Schemalägg funktionen att köras varje natt kl. 03:00 UTC
-- Kommentera ut detta om pg_cron inte är aktiverat i din Supabase-plan
SELECT cron.schedule(
  'gdpr-delete-old-test-data',     -- Jobbnamn
  '0 3 * * *',                      -- Cron schedule: 03:00 varje dag
  'SELECT delete_old_test_data();'  -- SQL kommando att köra
);

-- 4. Grant execute-rättigheter på funktionen till authenticated users (optional)
-- Detta är säkert eftersom funktionen är SECURITY DEFINER och bara raderar gammal data
GRANT EXECUTE ON FUNCTION delete_old_test_data() TO authenticated;

-- 5. Kommentar för framtida underhåll
COMMENT ON FUNCTION delete_old_test_data() IS
'GDPR-kompatibel auto-radering av testdata äldre än 12 månader. Körs automatiskt varje natt kl. 03:00 UTC via pg_cron.';

-- 6. Verifiera att jobbet är skapat (kör denna query manuellt för att kontrollera)
-- SELECT * FROM cron.job WHERE jobname = 'gdpr-delete-old-test-data';

-- ALTERNATIV: Om pg_cron inte finns tillgängligt, använd istället en Edge Function
-- som anropas via cron-job.org eller liknande extern scheduler.
-- Edge Function kod finns i kommentaren nedan:

/*
// supabase/functions/gdpr-cleanup/index.ts

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Verify request is from authorized source (add API key check)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  // Delete old test_results
  const { data: resultsData, error: resultsError } = await supabase
    .from('test_results')
    .delete()
    .lt('completed_at', twelveMonthsAgo.toISOString())

  // Delete old test_user_answers
  const { data: answersData, error: answersError } = await supabase
    .from('test_user_answers')
    .delete()
    .lt('answered_at', twelveMonthsAgo.toISOString())

  return new Response(
    JSON.stringify({
      success: true,
      deleted_results: resultsData?.length || 0,
      deleted_answers: answersData?.length || 0
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
*/
