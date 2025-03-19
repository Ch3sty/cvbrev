'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, Star, CheckCircle, FileText, Upload, MessageSquare } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Effektivitetsdata för grafen
const effectivenessData = [
  { 
    name: 'Standard CV', 
    interviewRate: 12, 
    responseRate: 25,
    fill: '#94a3b8'
  },
  { 
    name: 'Generellt brev', 
    interviewRate: 18, 
    responseRate: 40,
    fill: '#9333ea'
  },
  { 
    name: 'CVBrev AI', 
    interviewRate: 34, 
    responseRate: 65,
    fill: '#ec4899'
  },
];

// Graf-komponent
function CVBrevEffectivenessChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={effectivenessData}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
        <XAxis dataKey="name" tick={{ fill: '#e2e8f0' }} />
        <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: '#e2e8f0' }} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
          formatter={(value) => [`${value}%`]} 
        />
        <Legend />
        <Bar dataKey="responseRate" name="Svarsfrekvens" fill="#9333ea" barSize={40} radius={[4, 4, 0, 0]} />
        <Bar dataKey="interviewRate" name="Intervjufrekvens" fill="#ec4899" barSize={40} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function Home() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function getSession() {
      try {
        setIsLoading(true);
        
        try {
          // Använd den korrekta funktionen createClient från din fil
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          const { data } = await supabase.auth.getSession();
          setSession(data.session);
        } catch (error) {
          console.error('Kunde inte hämta session:', error);
          setSession(null);
        } finally {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Allmänt fel i getSession:', error);
        setIsLoading(false);
      }
    }
    
    getSession();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-navy-950">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white">Laddar...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-navy-950">
      {/* Hero section with gradient background */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 to-navy-800">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 to-navy-800/50"></div>
        
        <div className="container relative px-4 py-16 mx-auto lg:py-24">
          <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Skriv <span className="text-pink-500">personligt brev</span> med AI
              </h1>
              
              <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-300 lg:mx-0">
                Få professionella, personliga ansökningsbrev som matchar ditt CV med jobbannonsen – på bara några sekunder.
              </p>
              
              <div className="flex flex-col justify-center gap-4 mt-8 sm:flex-row lg:justify-start">
                {session ? (
                  <Link 
                    href="/create-letter"
                    className="inline-flex items-center px-8 py-4 text-lg font-medium text-white transition-all duration-300 bg-pink-600 rounded-md shadow-lg hover:bg-pink-700 hover:shadow-xl group"
                  >
                    Skapa brev nu
                    <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/register"
                      className="inline-flex items-center px-8 py-4 text-lg font-medium text-white transition-all duration-300 bg-pink-600 rounded-md shadow-lg hover:bg-pink-700 hover:shadow-xl group"
                    >
                      Kom igång
                      <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <Link 
                      href="/login"
                      className="inline-flex items-center px-8 py-4 text-lg font-medium text-white transition-colors border border-white rounded-md hover:bg-white hover:bg-opacity-10"
                    >
                      Logga in
                    </Link>
                  </>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 mt-8 lg:justify-start">
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 mr-2 text-pink-500" />
                  <span>Personligt anpassat</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 mr-2 text-pink-500" />
                  <span>100% AI-genererat</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 mr-2 text-pink-500" />
                  <span>Enkelt att redigera</span>
                </div>
              </div>
            </div>
            
            <div className="order-first lg:order-last">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-3xl blur-xl opacity-30"></div>
                <div className="relative flex justify-center p-8 lg:p-0">
                  <img 
                    src="/cvbrev.png" 
                    alt="CVBrev AI Assistant" 
                    className="w-40 lg:w-64 animate-bounce" 
                    style={{ animationDuration: '6s' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How it works section */}
      <section className="py-16 bg-navy-900 lg:py-24">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Tre enkla steg till ditt personliga brev
            </h2>
            <p className="text-xl text-gray-300">
              Vår användarvänliga process gör det enkelt att skapa professionella ansökningsbrev.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-pink-600 to-pink-500 rounded-full">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-center text-white">Ladda upp ditt CV</h3>
              <p className="text-center text-gray-300">
                Ladda upp ditt CV i PDF, DOCX eller TXT-format. 
                Vår AI extraherar all viktig information.
              </p>
            </div>
            
            <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-center text-white">Lägg till jobbannonsen</h3>
              <p className="text-center text-gray-300">
                Klistra in jobbannonsen för 
                tjänsten du söker. Välj önskad ton för ditt brev.
              </p>
            </div>
            
            <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-center text-white">Få ditt personliga brev</h3>
              <p className="text-center text-gray-300">
                Vår AI genererar ett skräddarsytt  
                ansökningsbrev på sekunder. Redigera och spara.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing plans */}
      <section className="py-16 bg-navy-950 lg:py-24">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Välj plan som passar dig
            </h2>
            <p className="text-xl text-gray-300">
              Flexibla lösningar för alla dina ansökningsbehov
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Free plan */}
            <div className="overflow-hidden transition-all duration-300 bg-navy-800 border border-gray-700 rounded-xl hover:border-pink-500 hover:translate-y-[-8px]">
              <div className="p-6">
                <h3 className="mb-2 text-2xl font-bold text-white">Gratis</h3>
                <p className="mb-6 text-gray-400">Perfekt för tillfälliga ansökningar</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">0 kr</span>
                  <span className="text-gray-400"> / månad</span>
                </div>
                
                <ul className="mb-8 space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                    <span className="text-gray-300">2 brev per månad</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                    <span className="text-gray-300">Grundläggande anpassning</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                    <span className="text-gray-300">Standard AI-generering</span>
                  </li>
                </ul>
                
                <Link 
                  href="/register"
                  className="flex justify-center w-full px-6 py-3 font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700"
                >
                  Kom igång
                </Link>
              </div>
            </div>
            
            {/* Standard plan */}
            <div className="overflow-hidden transition-all duration-300 bg-navy-800 border border-gray-700 rounded-xl hover:border-pink-500 hover:translate-y-[-8px]">              
              <div className="p-6">
                <h3 className="mb-2 text-2xl font-bold text-white">Standard</h3>
                <p className="mb-6 text-gray-400">För aktiva jobbsökande</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">99 kr</span>
                  <span className="text-gray-400"> / månad</span>
                </div>
                
                <ul className="mb-8 space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                    <span className="text-gray-300">Obegränsade brev</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                    <span className="text-gray-300">Flera tonaliteter</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                    <span className="text-gray-300">Spara mallar</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                    <span className="text-gray-300">Avancerad AI-generering</span>
                  </li>
                </ul>
                
                <Link 
                  href="/register?plan=standard"
                  className="flex justify-center w-full px-6 py-3 font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700"
                >
                  Välj Standard
                </Link>
              </div>
            </div>
            
            {/* Premium plan - med ren header-design */}
            <div className="relative overflow-hidden transition-all duration-300 bg-navy-800 border-2 border-pink-500 rounded-xl hover:translate-y-[-8px]">
              {/* Ren header för POPULÄRASTE utan trianglar */}
              <div className="w-full bg-pink-600 py-2 flex items-center justify-center text-white font-semibold">
                POPULÄRASTE
              </div>
              
              <div className="p-8">
                <h3 className="mb-2 text-2xl font-bold text-white">Premium</h3>
                <p className="mb-6 text-gray-400">För professionella jobbsökande</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">169 kr</span>
                  <span className="text-gray-400"> / månad</span>
                </div>
                
                <ul className="mb-8 space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                    <span className="text-gray-300">Allt i Standard</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                    <span className="text-gray-300">Prioriterad support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                    <span className="text-gray-300">Premium AI-modell</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                    <span className="text-gray-300">CV-feedback</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                    <span className="text-gray-300">Intervjutipsgenererare</span>
                  </li>
                </ul>
                
                <Link 
                  href="/register?plan=premium"
                  className="flex justify-center w-full px-6 py-3 font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700"
                >
                  Välj Premium
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits section with testimonials and graph */}
      <section className="py-16 bg-navy-900 lg:py-24">
        <div className="container px-4 mx-auto">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
                Öka dina chanser att få drömjobbet
              </h2>
              
              {/* Success Rate Graph */}
              <div className="p-4 mb-8 bg-navy-800 rounded-lg">
                <h3 className="mb-4 text-xl font-semibold text-white">Effektivitet med personliga brev</h3>
                <div className="relative h-64">
                  <CVBrevEffectivenessChart />
                </div>
                <p className="mt-3 text-sm text-gray-400 text-center">Källa: Intern användarundersökning bland 500+ användare</p>
              </div>
              
              <ul className="space-y-6">
                <li className="flex items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="mb-1 text-xl font-semibold text-white">Personligt anpassat</h3>
                    <p className="text-gray-300">Varje brev är unikt anpassat efter ditt CV och den specifika jobbannonsen, vilket visar rekryterare att du är rätt kandidat för tjänsten.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="mb-1 text-xl font-semibold text-white">Professionell tonalitet</h3>
                    <p className="text-gray-300">Välj mellan olika tonaliteter och stilar för att skapa ett personligt brev som passar den specifika tjänsten och företagskulturen.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="mb-1 text-xl font-semibold text-white">Enkel redigering</h3>
                    <p className="text-gray-300">Anpassa det genererade brevet efter dina specifika önskemål med vårt användarvänliga redigeringsverktyg.</p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-8">
                <Link 
                  href={session ? "/create-letter" : "/register"}
                  className="inline-flex items-center px-6 py-3 font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700 group"
                >
                  {session ? "Skapa brev" : "Registrera dig nu"}
                  <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-xl blur-lg opacity-20"></div>
              <div className="relative p-8 bg-navy-800 rounded-xl">
                <h3 className="mb-6 text-2xl font-bold text-center text-white">Vad våra användare säger</h3>
                
                <div className="mb-8 space-y-6">
                  <div className="p-4 transition-colors bg-navy-700 rounded-lg hover:bg-navy-600">
                    <p className="mb-4 italic text-gray-300">
                      "CVBrev hjälpte mig att få tre intervjuer på en vecka! 
                      De personliga breven gjorde verkligen skillnad."
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">Sofia L.</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 transition-colors bg-navy-700 rounded-lg hover:bg-navy-600">
                    <p className="mb-4 italic text-gray-300">
                      "Jag sparar otroligt mycket tid per ansökan och får mycket bättre respons från rekryterare nu."
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">Johan K.</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 transition-colors bg-navy-700 rounded-lg hover:bg-navy-600">
                    <p className="mb-4 italic text-gray-300">
                      "Äntligen ett verktyg som faktiskt förstår vad rekryterare letar efter. Mina ansökningar sticker verkligen ut nu!"
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">Maria B.</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-purple-600 lg:py-20">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Redo att förbättra dina jobbansökningar?
          </h2>
          
          <p className="max-w-2xl mx-auto mb-8 text-xl text-white text-opacity-90">
            Skapa ditt första personliga ansökningsbrev redan idag. Gratis att komma igång!
          </p>
          
          <Link 
            href={session ? "/create-letter" : "/register"}
            className="inline-flex items-center px-8 py-4 text-lg font-medium text-pink-600 transition-colors bg-white rounded-md shadow-lg hover:bg-gray-100 group"
          >
            {session ? "Skapa brev nu" : "Kom igång gratis"}
            <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}