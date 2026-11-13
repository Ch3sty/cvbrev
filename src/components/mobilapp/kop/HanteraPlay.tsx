'use client';

/** "Hantera i Google Play" i kontot: öppnar Play-appens prenumerationer. */
import { oppnaPlayPrenumerationer } from '../skal-kop';

export default function HanteraPlay() {
  return (
    <button type="button" className="tk-knapp ljus liten tk-tryck" style={{ marginTop: 12 }} onClick={oppnaPlayPrenumerationer}>
      Hantera i Google Play
    </button>
  );
}
