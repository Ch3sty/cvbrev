// src/app/page.tsx
import Link from 'next/link'
import { headers } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'

export default async function Home() {
  const headersList = headers()
  const cookieStore = headersList.get('cookie')
  
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section */}
      <section className="relative pb-20 overflow-hidden bg-gradient-to-b from-navy-900 to-navy-800">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10"></div>
        
        <div className="container relative px-4 py-16 mx-auto text-center md:py-32">
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            Skapa personliga <span className="text-pink-500">ansökningsbrev</span> med AI
          </h1>
          
          <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-300">
            Generera professionella och personliga ansökningsbrev baserade på ditt CV och jobbannonsen på sekunder.
          </p>
          
          <div className="flex flex-col justify-center gap-4 mt-10 sm:flex-row">
            {session ? (
              <Link 
                href="/create-letter"
                className="px-8 py-4 text-lg font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700"
              >
                Skapa brev nu
              </Link>
            ) : (
              <>
                <Link 
                  href="/register"
                  className="px-8 py-4 text-lg font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700"
                >
                  Kom igång
                </Link>
                <Link 
                  href="/login"
                  className="px-8 py-4 text-lg font-medium text-white transition-colors border border-white rounded-md hover:bg-white hover:bg-opacity-10"
                >
                  Logga in
                </Link>
              </>
            )}
          </div>
          
          <div className="relative max-w-4xl mx-auto mt-16">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg blur-lg opacity-50"></div>
            <div className="relative p-1 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg">
              <img 
                src="/images/app-preview.png" 
                alt="CVBrev applikation" 
                className="w-full rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-20 bg-navy-900">
        <div className="container px-4 mx-auto">
          <h2 className="mb-16 text-3xl font-bold text-center text-white sm:text-4xl">
            Så fungerar det
          </h2>
          
          <div className="grid gap-10 md:grid-cols-3">
            <div className="p-6 text-center bg-navy-800 rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-pink-600 rounded-full">1</div>
              <h3 className="mb-3 text-xl font-semibold text-white">Ladda upp ditt CV</h3>
              <p className="text-gray-300">
                Ladda upp ditt CV i PDF, DOCX eller TXT-format. 
                Vår AI extraherar all viktig information.
              </p>
            </div>
            
            <div className="p-6 text-center bg-navy-800 rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-pink-600 rounded-full">2</div>
              <h3 className="mb-3 text-xl font-semibold text-white">Lägg till jobbannonsen</h3>
              <p className="text-gray-300">
                Klistra in jobbannonsen för 
                tjänsten du söker. Välj önskad ton för ditt brev.
              </p>
            </div>
            
            <div className="p-6 text-center bg-navy-800 rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-pink-600 rounded-full">3</div>
              <h3 className="mb-3 text-xl font-semibold text-white">Få ditt personliga brev</h3>
              <p className="text-gray-300">
                Vår AI genererar ett skräddarsytt  
                ansökningsbrev på sekunder. Redigera och spara.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits section */}
      <section className="py-20 bg-navy-800">
        <div className="container px-4 mx-auto">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
                Öka dina chanser att få drömjobbet
              </h2>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-gray-300">
                    <strong className="text-white">Spara tid</strong> - Generera ett professionellt brev på sekunder istället för timmar
                  </p>
                </li>
                
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-gray-300">
                    <strong className="text-white">Personligt anpassat</strong> - Matchar dina färdigheter med arbetskraven
                  </p>
                </li>
                
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-gray-300">
                    <strong className="text-white">Professionell tonalitet</strong> - Välj mellan olika stilar som passar tjänsten
                  </p>
                </li>
                
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-gray-300">
                    <strong className="text-white">Enkel redigering</strong> - Anpassa det genererade brevet efter dina önskemål
                  </p>
                </li>
              </ul>
              
              <div className="mt-8">
                <Link 
                  href={session ? "/create-letter" : "/register"}
                  className="inline-flex items-center px-6 py-3 font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700"
                >
                  {session ? "Skapa brev" : "Registrera dig gratis"}
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg blur-lg opacity-30"></div>
              <div className="relative p-8 text-center bg-navy-900 rounded-lg shadow-xl">
                <h3 className="mb-6 text-2xl font-bold text-white">Vad våra användare säger</h3>
                
                <div className="mb-6">
                  <p className="italic text-gray-300">
                    "CVBrev hjälpte mig att få tre intervjuer på en vecka! 
                    De personliga breven gjorde verkligen skillnad."
                  </p>
                  <p className="mt-2 font-semibold text-white">Sofia L.</p>
                </div>
                
                <div className="mb-6">
                  <p className="italic text-gray-300">
                    "Jag sparar timmar på varje ansökan och får mycket bättre respons från rekryterare."
                  </p>
                  <p className="mt-2 font-semibold text-white">Johan K.</p>
                </div>
                
                <div className="flex justify-center mt-4 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-purple-600">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Redo att förbättra dina jobbansökningar?
          </h2>
          
          <p className="max-w-2xl mx-auto mb-8 text-xl text-white text-opacity-90">
            Skapa ditt första personliga ansökningsbrev redan idag. Gratis att komma igång!
          </p>
          
          <Link 
            href={session ? "/create-letter" : "/register"}
            className="inline-flex items-center px-8 py-4 text-lg font-medium text-pink-600 transition-colors bg-white rounded-md hover:bg-gray-100"
          >
            {session ? "Skapa brev nu" : "Kom igång gratis"}
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}