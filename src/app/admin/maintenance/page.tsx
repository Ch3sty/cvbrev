'use client';

import { useState, useEffect } from 'react';
import {
  Trash,
  AlertTriangle,
  Clock,
  Database,
  RefreshCw,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

export default function MaintenancePage() {
  const [days, setDays] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Hämta DB stats
  // Gör fetchDatabaseStats till en useCallback för att kunna använda den i useEffect dependency array
  // och undvika onödiga anrop om 'days' ändras snabbt.
  // Lägg till 'days' som dependency eftersom frågan beror på det.
  const fetchDatabaseStats = React.useCallback(async () => {
    setStatsLoading(true);
    setError(null); // Rensa tidigare fel
    try {
      const supabase = getSupabaseClient();
      const cutoffDateOld = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const cutoffDateRecent = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Hämta antal rader per tabell
      const [
        letterRows,
        activityRows,
        oldActivities,
        recentActivities
      ] = await Promise.all([
        supabase.from('letters').select('id', { count: 'exact', head: true }),
        supabase.from('user_activities').select('id', { count: 'exact', head: true }),
        supabase
          .from('user_activities')
          .select('id', { count: 'exact', head: true })
          .lt('created_at', cutoffDateOld), // Använd beräknat datum
        supabase
          .from('user_activities')
          .select('id', { count: 'exact', head: true })
          .gt('created_at', cutoffDateRecent) // Använd beräknat datum
      ]);

      // Kontrollera fel för varje anrop (bättre felhantering)
      if (letterRows.error) throw letterRows.error;
      if (activityRows.error) throw activityRows.error;
      if (oldActivities.error) throw oldActivities.error;
      if (recentActivities.error) throw recentActivities.error;


      setStats({
        letters: letterRows.count || 0,
        activities: activityRows.count || 0,
        oldActivities: oldActivities.count || 0,
        recentActivities: recentActivities.count || 0
      });
    } catch (error: any) {
      console.error('Fel vid hämtning av statistik:', error);
      setError(`Fel vid hämtning av statistik: ${error.message || 'Okänt fel'}`);
      setStats(null); // Rensa stats vid fel
    } finally {
       setStatsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]); // Lägg till 'days' som dependency

  // Rensa gamla aktiviteter
  const handleCleanup = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null); // Rensa tidigare fel
    try {
      // Använd API-routen istället för direkt Supabase-anrop från klienten
      const response = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days }), // Skicka med antal dagar
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setResult(data.message || `Rensning slutförd! ${data.count} aktiviteter raderades.`);

      // Uppdatera statistik efter lyckad rensning
      fetchDatabaseStats();

    } catch (error: any) {
      console.error('Fel vid rensning:', error);
      setResult(`Ett fel uppstod vid rensning: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Hämta statistik när sidan laddas och när 'days' ändras
  useEffect(() => {
    fetchDatabaseStats();
  }, [fetchDatabaseStats]); // Använd useCallback-versionen som dependency

  // Funktion för att hantera input-ändring
  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
       // Tillåt tom input tillfälligt
      if (value === '') {
          setDays(0); // Sätt till 0 eller annat default/ogiltigt värde temporärt
      } else {
          const numValue = parseInt(value, 10);
           // Validera att det är ett tal och inom gränserna
          if (!isNaN(numValue) && numValue >= 1 && numValue <= 365) {
              setDays(numValue);
          } else if (!isNaN(numValue) && numValue < 1) {
              setDays(1); // Sätt till minimum om mindre än 1
          } else if (!isNaN(numValue) && numValue > 365) {
              setDays(365); // Sätt till maximum om större än 365
          }
          // Om det inte är ett nummer alls händer inget (eller rensa state?)
      }
  };

  // Funktion för när inputfältet tappar fokus (onBlur)
   const handleDaysBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    // Om värdet är ogiltigt (NaN eller 0 från tom input), återställ till ett giltigt värde, t.ex. 30
    if (isNaN(value) || value < 1) {
      setDays(30);
    }
  };


  return (
    <div className="p-6 space-y-8 bg-gray-900 min-h-screen text-gray-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Databasunderhåll</h1>
        <button
          onClick={() => fetchDatabaseStats()} // Anropa fetch funktionen direkt
          disabled={statsLoading}
          className={`flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors duration-150 ${statsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
          {statsLoading ? 'Laddar...' : 'Uppdatera statistik'}
        </button>
      </div>

       {/* Felmeddelande för statistik */}
       {error && !statsLoading && (
         <div className="p-3 rounded-md bg-red-900/30 border-l-4 border-red-500 text-red-200">
           {error}
         </div>
       )}


      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card */}
        {(['letters', 'activities', 'recentActivities', 'oldActivities'] as const).map((key) => {
          const labels: Record<typeof key, string> = {
             letters: 'Totalt antal brev',
             activities: 'Aktiviteter totalt',
             recentActivities: 'Aktiviteter senaste 7 dagar',
             oldActivities: `Aktiviteter äldre än ${days || '?'} dagar`
          };
           const icons: Record<typeof key, React.ElementType> = {
             letters: FileText,
             activities: Database,
             recentActivities: Clock,
             oldActivities: AlertTriangle
           };
           const colors: Record<typeof key, string> = {
               letters: 'text-blue-400',
               activities: 'text-green-400',
               recentActivities: 'text-pink-400',
               oldActivities: 'text-yellow-400'
           };
          const Icon = icons[key];

          return (
             <div key={key} className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 text-sm">{labels[key]}</h3>
                <Icon className={`${colors[key]} w-5 h-5`} />
              </div>
              {statsLoading ? (
                <div className="animate-pulse h-8 bg-gray-700 rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-white">{stats ? stats[key] ?? '?' : '?'}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Rensa aktiviteter */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
          <Trash className="mr-2 text-pink-500" />
          Rensa gamla aktivitetsloggar
        </h2>

        <div className="mb-6 space-y-4">
          <p className="text-gray-300">
            Denna funktion raderar permanenta aktivitetsloggar äldre än det angivna antalet dagar via en säker API-endpoint.
            Aktivitetsloggar används för att spåra användarinteraktioner och felsökning, men kan bli
            väldigt stora över tid. Rensning bör göras med försiktighet.
          </p>

          <div className="flex items-center flex-wrap gap-2">
            <Clock className="text-gray-400 mr-1" />
            <label htmlFor="days-input" className="mr-2 text-white">Radera data äldre än:</label>
            <input
              id="days-input"
              type="number"
              min="1"
              max="365"
              value={days === 0 ? '' : days} // Visa tom sträng om 0
              onChange={handleDaysChange}
              onBlur={handleDaysBlur} // Hantera återställning vid blur
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 w-20 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              aria-describedby="days-description"
            />
            <span className="text-white" id="days-description">dagar</span>
          </div>

          <div className="flex items-start space-x-2 bg-yellow-900/20 border-l-4 border-yellow-500 p-3 rounded-r">
            <AlertTriangle className="text-yellow-500 mr-2 mt-1 flex-shrink-0" />
            <div>
              <p className="text-yellow-200 text-sm font-semibold">
                Varning: Permanent åtgärd!
              </p>
              <p className="text-yellow-300 text-sm mt-1">
                All aktivitetsdata äldre än {days || '?'} dagar kommer att raderas permanent från databasen.
                Detta går inte att ångra. Säkerställ att du valt rätt antal dagar.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Detta påverkar inte sparade brev eller CV:n, endast aktivitetsloggar (`user_activities`).
              </p>
            </div>
          </div>

          {/* Visar info eller varning baserat på antal gamla aktiviteter */}
           {statsLoading ? (
             <div className="animate-pulse h-10 bg-gray-700 rounded w-full"></div>
           ) : stats && stats.oldActivities > 0 ? (
              <div className="flex items-start space-x-2 bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded-r">
                <InfoIcon className="text-blue-400 mr-2 mt-1 flex-shrink-0" />
                <p className="text-blue-200 text-sm">
                  {stats.oldActivities} {stats.oldActivities === 1 ? 'aktivitet' : 'aktiviteter'} äldre än {days || '?'} dagar kommer att rensas.
                </p>
              </div>
            ) : stats && stats.oldActivities === 0 ? (
              <div className="flex items-start space-x-2 bg-green-900/20 border-l-4 border-green-500 p-3 rounded-r">
                <CheckCircle className="text-green-400 mr-2 mt-1 flex-shrink-0" />
                <p className="text-green-200 text-sm">
                  Det finns inga aktiviteter äldre än {days || '?'} dagar att rensa.
                </p>
              </div>
            ) : null /* Visa inget om stats är null (pga fel) */ }
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleCleanup}
            disabled={isLoading || statsLoading || !stats || stats.oldActivities === 0 || days < 1} // Ytterligare disable-villkor
            className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors duration-150 ${
              isLoading || statsLoading || !stats || stats.oldActivities === 0 || days < 1
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                Rensar...
              </>
            ) : (
              <>
                <Trash className="w-4 h-4 mr-2" />
                Rensa {stats?.oldActivities ?? '?'} gamla aktiviteter
              </>
            )}
          </button>

          <button
            onClick={() => setResult(null)}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!result}
          >
            Rensa meddelande
          </button>
        </div>

        {/* Resultat/Felmeddelande från rensning */}
        {result && (
          <div className={`mt-4 p-3 rounded-md text-sm ${
            result.toLowerCase().includes('fel') || result.toLowerCase().includes('error')
              ? 'bg-red-900/30 border-l-4 border-red-500 text-red-200'
              : 'bg-green-900/30 border-l-4 border-green-500 text-green-200'
          }`}>
            {result}
          </div>
        )}
      </div>

      {/* Automatisk rensning info */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
          <Database className="mr-2 text-blue-500" />
          Automatisk rensning (via Supabase Cron)
        </h2>

        <p className="text-gray-300 mb-4">
          För att undvika manuell rensning rekommenderas det att konfigurera ett automatiskt Cron-jobb direkt i Supabase
          som periodiskt raderar gamla aktivitetsloggar. Detta säkerställer att databasen inte växer okontrollerat.
        </p>

        <div className="bg-gray-900 p-4 rounded-md border border-gray-700">
          <h3 className="text-white font-medium mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-pink-400" />
            Exempel SQL för Cron Jobb (via Supabase SQL Editor):
          </h3>
          <pre className="bg-black/50 p-3 rounded text-gray-300 text-sm overflow-x-auto custom-scrollbar">
{`-- 1. Aktivera pg_cron extensionen (om inte redan gjord)
-- Gå till Database > Extensions i Supabase Dashboard och aktivera pg_cron.

-- 2. Skapa en funktion för att ta bort äldre data
CREATE OR REPLACE FUNCTION cleanup_old_activities(retention_days integer DEFAULT 30)
RETURNS void AS $$
BEGIN
  RAISE LOG 'Cron Job: cleanup_old_activities starting. Removing activities older than % days.', retention_days;
  DELETE FROM public.user_activities
  WHERE created_at ${'<'} (NOW() - (retention_days::text || ' days')::interval);

  -- Logga hur många rader som togs bort (valfritt)
  -- GET DIAGNOSTICS row_count = ROW_COUNT;
  -- RAISE LOG 'Cron Job: cleanup_old_activities finished. Removed % rows.', row_count;

EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Cron Job: cleanup_old_activities failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 3. Schemalägg funktionen att köras varje natt kl 03:00 UTC
--    (välj en tidpunkt med låg belastning)
--    '0 3 * * *' betyder: minut 0, timme 3, varje dag, varje månad, varje veckodag.
SELECT cron.schedule(
  'nightly-activity-cleanup', -- Ge jobbet ett unikt namn
  '0 3 * * *',                -- Cron-schemat (t.ex. 03:00 UTC)
  $$SELECT public.cleanup_old_activities(60);$$ -- Anropa funktionen, anpassa antal dagar (här 60)
);

-- (Valfritt) För att se schemalagda jobb:
-- SELECT * FROM cron.job;

-- (Valfritt) För att ta bort ett schemalagt jobb:
-- SELECT cron.unschedule('nightly-activity-cleanup');
`}
          </pre>
          <p className="text-gray-400 mt-3 text-xs">
            Kör detta SQL-skript i Supabase SQL-editor (under Database -> SQL Editor). Anpassa `retention_days` (antal dagar att behålla) i `cron.schedule`-anropet efter behov. Säkerställ att `pg_cron` är aktiverat.
          </p>
        </div>
      </div>
    </div>
  );
}

// Info-ikon component (ingen ändring här)
function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-info" // La till klassnamn för tydlighet
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}