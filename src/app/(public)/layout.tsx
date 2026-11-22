import LandingNavbar from '@/components/landing/LandingNavbar';
import { MegaMeny, MobilMenyKropp } from '@/components/landing/LandingNavbarMega';
import { KampanjRadPublik } from '@/components/kampanj/Kampanj';

/**
 * Layout för alla publika sidor (besokare som inte är inloggade i dashboard).
 * Monterar LandingNavbar högst upp så alla sidor i denna route group ärver den
 * automatiskt.
 *
 * Route group `(public)` påverkar inte URL:en — src/app/(public)/funktioner/page.tsx
 * är fortfarande /funktioner.
 *
 * Publikt omgång 3: menyns innehåll ("Vad vi erbjuder" och telefonmenyn)
 * ritas här på servern och skickas in som props, så att texten och talen
 * inte hamnar i klientens JavaScript. Menyn tar sidans färg (<Sida farg>
 * i src/components/publikt/v3, annars gissad ur adressen).
 */
// Default för hela den publika delen: exempel, mallar, verktygssidor och
// insikter byggs alla av innehåll i repot. Ett dygn räcker, och en enskild
// sida kan sätta ett eget värde om den behöver kortare. Utan detta renderade
// varje publik sida om per besök, vilket är det som drev ISR-läsningarna och
// origin-trafiken.
export const revalidate = 86400;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingNavbar mega={<MegaMeny />} mobil={<MobilMenyKropp />} />
      {/* Under menyn, inte ovanför: menyn är sticky och mobilmenyn räknar
          med 64 px från toppen. Raden rullar bort med sidan. */}
      <KampanjRadPublik />
      {children}
    </>
  );
}
