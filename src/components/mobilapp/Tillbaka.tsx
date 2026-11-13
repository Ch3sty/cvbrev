'use client';

/**
 * Tillbakapilen i toppraden (konceptets toppradTillbaka). Går ett steg bakåt
 * i historiken när appen kom hit inifrån, annars till Idag, så att pilen
 * aldrig lämnar appen.
 */
import { useRouter } from 'next/navigation';
import { APP_FLIK } from '@/lib/mobilapp/appvag';
import { IkonTillbaka } from './ikoner';

export default function Tillbaka() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="tk-ik tk-tryck"
      aria-label="Tillbaka"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.replace(APP_FLIK.idag);
      }}
    >
      <IkonTillbaka />
    </button>
  );
}
