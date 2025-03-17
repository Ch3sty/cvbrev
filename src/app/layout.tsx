import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/ui/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CVBrev - Skapa personliga ansökningsbrev med AI',
  description: 'Generera professionella och personliga ansökningsbrev baserade på ditt CV och jobbannonser',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <body className={`${inter.className} bg-navy-900 text-white`}>
        <Navbar />
        <main>
          {children}
        </main>
        <footer className="py-8 mt-auto text-center bg-navy-950">
          <div className="container px-4 mx-auto">
            <p className="text-gray-400">
              © {new Date().getFullYear()} CVBrev. Alla rättigheter förbehållna.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}