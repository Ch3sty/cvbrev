'use client';

/**
 * Appens inloggning (proxyn skriver om appens /login hit). Första start, när
 * onboardingen inte är gjord i appen, visar startskärmen ett ögonblick och
 * går sedan till onboardingen (/register, som i appen är /app/valkommen).
 * Annars inloggningen i appens design, och efter den Idag.
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { APP_FLIK } from '@/lib/mobilapp/appvag';
import { lasMinne, sparaMinne } from '@/lib/mobilapp/onboarding';
import { Startskarm } from '../onboarding/Bilder';
import KontoVy from './KontoVy';

export default function LoggaIn({ redirect }: { redirect: string | null }) {
  const router = useRouter();
  const [lage, setLage] = useState<'laddar' | 'login'>('laddar');

  useEffect(() => {
    if (!lasMinne().klar) {
      router.replace('/register');
      return;
    }
    setLage('login');
  }, [router]);

  if (lage === 'laddar') return <Startskarm />;

  return (
    <KontoVy
      lage="logga-in"
      niva={null}
      planText="planen"
      nyHref="/register"
      onKlar={() => {
        sparaMinne({ klar: true });
        router.replace(redirect ?? APP_FLIK.idag);
        router.refresh();
      }}
    />
  );
}
