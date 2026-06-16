-- Aggregat-vyer för /admin/activity-visualiseringen. Bygger på admin_activity_feed
-- så de ärver dess data (och RLS via is_admin()-policyerna på bastabellerna).

-- 1. Per funktion: totalt, slutförda, unika användare, senaste 7 dagar.
--    Driver KPI-korten och funktionsfördelnings-stapeln.
CREATE OR REPLACE VIEW public.admin_activity_by_function AS
SELECT
  funktion,
  count(*) AS totalt,
  count(*) FILTER (WHERE slutford) AS slutforda,
  count(DISTINCT user_id) AS unika_anv,
  count(*) FILTER (WHERE tidpunkt > now() - interval '7 days') AS senaste_7d,
  max(tidpunkt) AS senast
FROM public.admin_activity_feed
GROUP BY funktion;

-- 2. Per dag + funktion (senaste 30 dgr). Driver aktivitet-över-tid-grafen.
--    Pivoteras klientsidigt till en rad/dag med en nyckel per funktion.
CREATE OR REPLACE VIEW public.admin_activity_daily AS
SELECT
  (date_trunc('day', tidpunkt))::date AS dag,
  funktion,
  count(*) AS handelser
FROM public.admin_activity_feed
WHERE tidpunkt > now() - interval '30 days'
GROUP BY 1, 2;
