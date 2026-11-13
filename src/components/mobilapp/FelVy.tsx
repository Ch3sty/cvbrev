/**
 * När motorns status inte gick att läsa (webbens X1): vyn står kvar med en
 * ärlig mening och ett nytt försök, aldrig en tom sida.
 */
import { Topprad } from './Topprad';

export default function FelVy({ titel, initial }: { titel: string; initial: string }) {
  return (
    <>
      <Topprad titel={titel} initial={initial} />
      <div className="tk-tomt" role="alert">
        <h2 className="tk-h2">Vi kunde inte läsa dina resultat just nu</h2>
        <p className="tk-p">Inget är förlorat. Försök igen om en stund.</p>
        <a href="" className="tk-knapp morkt tk-tryck" style={{ maxWidth: 240, marginTop: 8 }}>
          Försök igen
        </a>
      </div>
    </>
  );
}
