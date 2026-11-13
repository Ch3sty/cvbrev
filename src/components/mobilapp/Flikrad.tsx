'use client';

/**
 * Flikraden Idag, Tester, Utveckling (konceptets flikrad()). Står bara i de
 * tre flikarna; passen, Nivåkollen och övningsproven är helskärm och ligger
 * utanför flikarnas layout.
 *
 * Android-tillbaka (konceptet, Android och iOS): från Idag läggs fliken till
 * i historiken, så att tillbaka går hem till Idag. Mellan Tester och
 * Utveckling byts adressen, så tillbaka aldrig vandrar mellan flikar.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_FLIK, appFlik } from '@/lib/mobilapp/appvag';
import { IkonIdag, IkonTester, IkonUtveckling } from './ikoner';
import { haptik } from './skal';

const FLIKAR = [
  { nyckel: 'idag', text: 'Idag', href: APP_FLIK.idag, Ikon: IkonIdag },
  { nyckel: 'tester', text: 'Tester', href: APP_FLIK.tester, Ikon: IkonTester },
  { nyckel: 'utveckling', text: 'Utveckling', href: APP_FLIK.utveckling, Ikon: IkonUtveckling },
] as const;

export default function Flikrad() {
  const aktiv = appFlik(usePathname() ?? '');
  return (
    <nav className="tk-flik" aria-label="Flikar">
      {FLIKAR.map(({ nyckel, text, href, Ikon }) => (
        <Link
          key={nyckel}
          href={href}
          replace={aktiv !== 'idag' && aktiv !== null}
          aria-current={aktiv === nyckel ? 'page' : undefined}
          onClick={() => {
            if (aktiv !== nyckel) haptik('latt');
          }}
        >
          <span className="pill">
            <Ikon />
          </span>
          {text}
        </Link>
      ))}
    </nav>
  );
}
