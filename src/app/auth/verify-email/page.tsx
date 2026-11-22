// app/auth/verify-email/page.tsx
//
// Publikt omgång 3: samma kort som Logga in (skissen inloggning). Logiken och
// texterna är dagens; tankstrecket i "Nytt mejl skickat" är bytt mot komma.
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Ikon } from '@/components/publikt/v3/Ikon';
import { AuthKortSkal, AuthRad, MejlIkon } from '../_delar/AuthKortSkal';

export default function VerifyEmailPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string; fullName: string } | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sidan är landningen för länken i mejlet. Vi pollar tills Supabase säger
  // att adressen är bekräftad och skickar då användaren vidare till appen.
  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled || !data.user) return;

      setUser({
        id: data.user.id,
        email: data.user.email || '',
        fullName: (data.user.user_metadata?.full_name as string) || '',
      });

      if (data.user.email_confirmed_at) {
        clearInterval(timer);
        router.push('/dashboard?verified=1');
        router.refresh();
      }
    };

    check();
    const timer = setInterval(check, 4000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [supabase, router]);

  const handleResend = async () => {
    if (!user) return;
    setResending(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          fullName: user.fullName,
          userId: user.id,
          isInvitation: false,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Kunde inte skicka mejlet');
      }
      setResent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthKortSkal>
      <h1 className="rg-h1">Bekräfta din e-postadress</h1>
      <div className="rg-skickat">
        <i>
          <MejlIkon />
        </i>
        <span>
          Vi har skickat ett mejl{user?.email ? <> till <strong>{user.email}</strong></> : ''}.
          Klicka på länken i mejlet för att bekräfta ditt konto.
        </span>
      </div>

      {/* Du kan börja jobba direkt: bekräftelsen är inte blockerande */}
      <Link href="/dashboard" className="p3-knapp p3-knapp-bred">
        Fortsätt till appen
        <Ikon namn="pil" />
      </Link>

      {resent ? (
        <AuthRad ton="bra">
          <p>Nytt mejl skickat, kolla din inkorg</p>
        </AuthRad>
      ) : (
        <button type="button" onClick={handleResend} disabled={resending || !user} className="rg-lank">
          {resending ? 'Skickar...' : 'Skicka mejlet igen'}
        </button>
      )}
      {error ? (
        <AuthRad ton="fel">
          <p>{error}</p>
        </AuthRad>
      ) : null}

      <p className="rg-juridik">Ser du inget mejl? Kontrollera din skräppostmapp.</p>

      <p className="rg-byt">
        <Link href="/login">Tillbaka till inloggning</Link>
      </p>
    </AuthKortSkal>
  );
}
