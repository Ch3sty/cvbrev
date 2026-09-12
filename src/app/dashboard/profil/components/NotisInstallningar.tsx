'use client';

/**
 * Notisinställningar i profilen (profil-spec, sektion 4).
 *
 * Två rader, två kolumner, två routes. Veckosammanfattningen är det enda mail
 * vi skickar som inte handlar om pengar. Kvotpåminnelserna styr redan
 * livscykelrunnern och kampanjutskicken via quota_emails_opt_out, men saknade
 * hittills gränssnitt helt: systemet respekterade alltså ett val användaren
 * inte kunde göra.
 *
 * Mail om konto och betalningar går alltid, och det står i ingressen så att
 * ingen tror att växlarna stänger av kvittot på en dragning.
 */

import { useState } from 'react';
import { SectionKontoIcon } from './illustrations/SectionIcons';

interface MailRowConfig {
  key: string;
  endpoint: string;
  title: string;
  body: string;
  ariaLabel: string;
}

const ROWS: MailRowConfig[] = [
  {
    key: 'digest',
    endpoint: '/api/email/digest-preference',
    title: 'Veckosammanfattning',
    body: 'En gång i veckan: hur många jobb du sökte, vad som väntar på svar och vilka ansökningar som är värda en påminnelse. Skickas bara när du har ansökningar igång.',
    ariaLabel: 'Veckosammanfattning via mail',
  },
  {
    key: 'quota',
    endpoint: '/api/profile/quota-emails',
    title: 'Påminnelser om din kvot',
    body: 'Mail när dina gratisbrev återställs och när något du använt tagit slut. Av om du hellre håller koll själv.',
    ariaLabel: 'Påminnelser om din kvot via mail',
  },
];

interface NotisInstallningarProps {
  /**
   * Lägena, lästa på servern ur profiles.weekly_digest_opt_out respektive
   * profiles.quota_emails_opt_out. Förut hämtade varje rad sitt eget läge med
   * ett fetch efter hydrering, och båda routerna gjorde ett auth.getUser()
   * före sin enda kolumnfråga. Kolumnerna sitter på samma profilrad som
   * dashboard-layouten redan läst, så de kostar ingenting att skicka hit.
   */
  initialDigestOptOut: boolean;
  initialQuotaOptOut: boolean;
}

export default function NotisInstallningar({
  initialDigestOptOut,
  initialQuotaOptOut,
}: NotisInstallningarProps) {
  const initialByKey: Record<string, boolean> = {
    digest: initialDigestOptOut,
    quota: initialQuotaOptOut,
  };

  return (
    <section
      id="konto"
      className="scroll-mt-24 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <SectionKontoIcon className="h-10 w-10 shrink-0 text-neutral-700 sm:h-12 sm:w-12" />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-neutral-900">Mail från oss</h2>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600">
            Mail om ditt konto och dina betalningar skickas alltid.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {ROWS.map((row) => (
          <MailRow
            key={row.key}
            config={row}
            initialOptOut={initialByKey[row.key] ?? false}
          />
        ))}
      </div>
    </section>
  );
}

function MailRow({
  config,
  initialOptOut,
}: {
  config: MailRowConfig;
  initialOptOut: boolean;
}) {
  // Läget kommer server-läst som prop. Växeln renderas därför färdig redan i
  // första HTML i stället för att dyka upp när ett fetch svarat, och raden
  // har samma höjd före som efter.
  const [optOut, setOptOut] = useState<boolean>(initialOptOut);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    if (saving) return;
    const next = !optOut;

    // Optimistiskt: växeln ska kännas direkt. Vid fel backar vi och säger till.
    setOptOut(next);
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optOut: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setOptOut(!next);
      setError('Inställningen kunde inte sparas. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  const enabled = !optOut;

  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <div className="flex min-h-[44px] items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-900">{config.title}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-neutral-600">
            {config.body}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={config.ariaLabel}
          onClick={toggle}
          disabled={saving}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-60 ${
            enabled ? 'bg-orange-600' : 'bg-neutral-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
