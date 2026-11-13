'use client';

/**
 * Utan nät i en redan laddad vy (konceptet, Kanterna). Skalets egen felvy
 * (mobilapp/www/fel.html) tar kallstarten utan nät; här säger vi till när
 * nätet försvinner medan appen är öppen. Vyn står kvar, inget försvinner.
 */
import { useEffect, useState } from 'react';

export default function NatVakt() {
  const [utan, setUtan] = useState(false);
  useEffect(() => {
    const satt = () => setUtan(!navigator.onLine);
    satt();
    window.addEventListener('online', satt);
    window.addEventListener('offline', satt);
    return () => {
      window.removeEventListener('online', satt);
      window.removeEventListener('offline', satt);
    };
  }, []);
  if (!utan) return null;
  return (
    <div className="tk-pad" style={{ paddingTop: 4, paddingBottom: 4 }} role="status">
      <div className="tk-banner">
        <span>
          <b>Ingen anslutning</b>
          <span>Passen behöver nät. Din nivå och dina pass är sparade.</span>
        </span>
        <button type="button" onClick={() => window.location.reload()}>
          Försök igen
        </button>
      </div>
    </div>
  );
}
