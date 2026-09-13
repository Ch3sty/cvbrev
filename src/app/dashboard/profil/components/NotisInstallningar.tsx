'use client';

/**
 * Notisinställningar i profilen (profil-spec, sektion 4).
 *
 * Två rader, två routes. Veckosammanfattningen är det enda mail vi skickar
 * som inte handlar om pengar. Kvotpåminnelserna styr livscykelrunnern och
 * kampanjutskicken via quota_emails_opt_out.
 *
 * Mail om konto och betalningar går alltid, och det står i ingressen så att
 * ingen tror att växlarna stänger av kvittot på en dragning. Toggles i ink.
 */

import { useState } from 'react';
import { ToggleSwitch } from './ProfileField';

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
  /** Lägena, lästa på servern ur profiles.weekly_digest_opt_out respektive quota_emails_opt_out. */
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
    <section id="konto" className="scroll-mt-24 rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <h2 className="text-kort text-ink-1">Mail från oss</h2>
      <p className="mt-1 text-sm leading-[22px] text-ink-2">
        Mail om ditt konto och dina betalningar skickas alltid.
      </p>

      <div className="mt-4 space-y-3">
        {ROWS.map((row) => (
          <MailRow key={row.key} config={row} initialOptOut={initialByKey[row.key] ?? false} />
        ))}
      </div>
    </section>
  );
}

function MailRow({ config, initialOptOut }: { config: MailRowConfig; initialOptOut: boolean }) {
  // Läget kommer server-läst som prop, så växeln är färdig i första HTML.
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
    <div className="rounded-lg border border-kant p-3">
      <div className="flex min-h-11 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-1">{config.title}</p>
          <p className="mt-0.5 text-meta text-ink-3">{config.body}</p>
        </div>

        <ToggleSwitch checked={enabled} onChange={toggle} disabled={saving} label={config.ariaLabel} />
      </div>

      {error && <p className="mt-2 text-meta text-fel">{error}</p>}
    </div>
  );
}
