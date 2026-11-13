import { Metadata } from 'next';
import Link from 'next/link';
import PubliktSida from '@/components/publikt/PubliktSida';
import Textmall from '@/components/publikt/innehall/Textmall';

// Sidan som Google Play kräver för kontoradering (appen Testklar). Den ska
// gå att nå utan att appen är installerad och säga vad som raderas.

export const metadata: Metadata = {
  title: 'Radera ditt konto | jobbcoach.ai',
  description:
    'Så raderar du ditt konto hos jobbcoach.ai och i appen Testklar: på webben, i appen eller via mejl. Vi går igenom vad som raderas och vad som sparas.',
  alternates: {
    canonical: '/radera-konto',
  },
};

const RUBRIKER = [
  { id: 'pa-webben', text: 'På webben' },
  { id: 'i-appen', text: 'I appen Testklar' },
  { id: 'via-mejl', text: 'Via mejl' },
  { id: 'vad-raderas', text: 'Vad som raderas' },
  { id: 'prenumeration', text: 'Om du har Premium' },
];

export default function RaderaKontoSida() {
  return (
    <PubliktSida>
      <Textmall titel="Radera ditt konto" smula="Radera konto" andrad="2026-11-13" rubriker={RUBRIKER}>
        <section>
          <p>
            Du kan radera ditt konto hos jobbcoach.ai när du vill. Samma konto gäller på webben och i appen
            Testklar, så raderar du det på ett ställe är det borta på båda.
          </p>
        </section>

        <section>
          <h2 id="pa-webben">På webben</h2>
          <ol>
            <li>
              <Link href="/login">Logga in</Link> på jobbcoach.ai.
            </li>
            <li>
              Gå till <Link href="/dashboard/installningar">Inställningar</Link>.
            </li>
            <li>Välj Radera mitt konto, skriv &quot;radera mitt konto&quot; och tryck på Radera permanent.</li>
          </ol>
        </section>

        <section>
          <h2 id="i-appen">I appen Testklar</h2>
          <ol>
            <li>Tryck på din profilbild uppe till höger.</li>
            <li>Välj Radera konto längst ner och bekräfta.</li>
          </ol>
        </section>

        <section>
          <h2 id="via-mejl">Via mejl</h2>
          <p>
            Kommer du inte åt kontot? Mejla <a href="mailto:support@jobbcoach.ai">support@jobbcoach.ai</a> från
            den adress du registrerade dig med, så raderar vi kontot åt dig inom 30 dagar.
          </p>
        </section>

        <section>
          <h2 id="vad-raderas">Vad som raderas</h2>
          <p>
            Allt som hör till kontot raderas direkt: profil och e-post, testresultat, nivåer och planer, CV,
            personliga brev, sparade jobb och inställningar för påminnelser. Det går inte att ångra.
          </p>
          <p>
            Kvitton och betalningsuppgifter som bokföringslagen kräver att vi sparar ligger kvar hos vår
            betalleverantör så länge lagen säger, men kopplas inte längre till något konto hos oss.
          </p>
        </section>

        <section>
          <h2 id="prenumeration">Om du har Premium</h2>
          <p>
            Köpte du Premium på webben avslutas prenumerationen automatiskt när kontot raderas. Köpte du den i
            appen via Google Play hanteras den av Google: avsluta den i Google Play under Prenumerationer, annars
            fortsätter Google att dra pengar.
          </p>
        </section>
      </Textmall>
    </PubliktSida>
  );
}
