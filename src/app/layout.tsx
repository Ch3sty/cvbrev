import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/ui/navbar'
import Link from 'next/link' // *** Importera Link ***
import { Facebook, Instagram } from 'lucide-react' // *** Importera sociala ikoner ***
import Script from 'next/script'
import { GA_MEASUREMENT_ID } from '@/lib/gtag'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { Suspense } from 'react' // <-- *** IMPORTERAD Suspense ***

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  // Behåll din befintliga metadata
  title: 'CVBrev - Skapa personliga ansökningsbrev med AI',
  description: 'Generera professionella och personliga ansökningsbrev baserade på ditt CV och jobbannonser',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv" className="h-full"> {/* Säkerställ att html tar full höjd */}
      <body className={`${inter.className} bg-navy-900 text-white flex flex-col min-h-full`}> {/* Använd flexbox för att trycka ner footer */}
        <Navbar />

        {/* *** GoogleAnalytics inlindad i Suspense *** */}
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>

        <main className="flex-grow"> {/* Låt main växa och ta upp plats */}
          {children}
        </main>

        {/* === NY FOTER START === */}
        <footer className="bg-navy-950 border-t border-navy-700/50 mt-auto">
          <div className="container px-4 py-12 mx-auto"> {/* Ökad padding */}
            <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-3 md:text-left">

              {/* Kolumn 1: Om CVbrev */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-white">CVbrev.se</h3>
                <p className="text-sm text-gray-400">
                  Skapa professionella CV:n och personliga brev snabbt och enkelt med hjälp av AI.
                </p>
              </div>

              {/* Kolumn 2: Snabblänkar */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-white">Snabblänkar</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="text-sm text-gray-400 transition-colors hover:text-pink-500">Hem</Link>
                  </li>
                  <li>
                    <Link href="/funktioner" className="text-sm text-gray-400 transition-colors hover:text-pink-500">Funktioner</Link>
                  </li>
                   <li>
                    <Link href="/priser" className="text-sm text-gray-400 transition-colors hover:text-pink-500">Priser</Link>
                  </li>
                   <li>
                    <Link href="/artiklar" className="text-sm text-gray-400 transition-colors hover:text-pink-500">Artiklar</Link>
                  </li>
                  {/* Lägg till fler relevanta länkar här */}
                </ul>
              </div>

              {/* Kolumn 3: Sociala medier & Legal */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-white">Följ Oss</h3>
                <div className="flex justify-center mb-6 space-x-4 md:justify-start">
                  {/* FIX: Added missing <a> tag */}
                  <a
                    href="https://www.facebook.com/CVbrev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="CVbrev på Facebook"
                    className="text-gray-400 transition-colors hover:text-pink-500"
                  >
                    <Facebook size={24} />
                  </a>
                  {/* FIX: Added missing <a> tag */}
                  <a
                    href="https://www.instagram.com/cvbrev.se/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="CVbrev på Instagram"
                    className="text-gray-400 transition-colors hover:text-pink-500"
                  >
                    <Instagram size={24} />
                  </a>
                </div>
                 <h3 className="mb-4 text-lg font-semibold text-white">Legal</h3>
                 <ul className="space-y-2">
                  <li>
                    <Link href="/integritetspolicy" className="text-sm text-gray-400 transition-colors hover:text-pink-500">Integritetspolicy</Link>
                  </li>
                   <li>
                    <Link href="/anvandarvillkor" className="text-sm text-gray-400 transition-colors hover:text-pink-500">Användarvillkor</Link>
                  </li>
                 </ul>
              </div>
            </div>

            {/* Copyright-rad längst ner */}
            <div className="pt-8 mt-10 text-sm text-center text-gray-500 border-t border-navy-700/50">
              © {new Date().getFullYear()} CVbrev. Alla rättigheter förbehållna.
            </div>
          </div>
        </footer>
        {/* === NY FOTER SLUT === */}

        {/* Google Analytics Script-taggar */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </body>
    </html>
  )
}