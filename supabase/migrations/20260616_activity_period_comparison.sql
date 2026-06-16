-- Period-jämförelse per funktion: denna period (senaste N dgr) vs föregående
-- lika långa period. Driver KPI-kortens delta-rad på /admin/activity.
-- SECURITY INVOKER → ärver is_admin()-RLS via admin_activity_feed.
CREATE OR REPLACE FUNCTION public.get_activity_period_comparison(days integer DEFAULT 30)
RETURNS TABLE (funktion text, denna_period bigint, forra_perioden bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    funktion,
    count(*) FILTER (WHERE tidpunkt >= now() - (days || ' days')::interval) AS denna_period,
    count(*) FILTER (WHERE tidpunkt >= now() - (2 * days || ' days')::interval
                     AND tidpunkt <  now() - (days || ' days')::interval) AS forra_perioden
  FROM public.admin_activity_feed
  GROUP BY funktion;
$$;

-- Utöka daily-vyn till 90 dgr så tidsgrafen kan följa periodväljaren.
CREATE OR REPLACE VIEW public.admin_activity_daily AS
SELECT
  (date_trunc('day', tidpunkt))::date AS dag,
  funktion,
  count(*) AS handelser
FROM public.admin_activity_feed
WHERE tidpunkt > now() - interval '90 days'
GROUP BY 1, 2;
