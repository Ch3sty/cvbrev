'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head' // Importera Head för SEO
import { 
  ChevronRight, 
  Star, 
  CheckCircle, 
  FileText, 
  Upload, 
  MessageSquare, 
  Lock, // Ikon för låsta funktioner
  Zap, // Ikon för obegränsat/premium
  Save, // Ikon för sparade brev
  Clock, // För tidslinjegraf
  Target, // För tidslinjegraf
  Lightbulb, // För tonalitet
  BrainCircuit // *** Lägg till den saknade ikonen här ***
} from 'lucide-react' 
import { 
  LineChart, // Byt till LineChart
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

// === Data för LINJEdiagram (från funktioner-sidan) ===
const timelineData = [
  { name: 'Dag 1', standardAnsökan: 20, cvBrevAnsökan: 45 },
  { name: 'Dag 3', standardAnsökan: 25, cvBrevAnsökan: 62 },
  { name: 'Dag 7', standardAnsökan: 30, cvBrevAnsökan: 75 },
  { name: 'Dag 14', standardAnsökan: 32, cvBrevAnsökan: 85 },
  { name: 'Dag 30', standardAnsökan: 35, cvBrevAnsökan: 92 },
];

// === Graf-komponent: LINJEdiagram (från funktioner-sidan) ===
function CVBrevTimelineChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={timelineData}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }} // Justerad vänstermarginal
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
        <XAxis dataKey="name" tick={{ fill: '#e2e8f0' }} />
        <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: '#e2e8f0' }} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
          formatter={(value, name) => [`${value}%`, name === 'standardAnsökan' ? 'Standard ansökningar' : 'cvbrev.se ansökningar']} 
        />
        <Legend wrapperStyle={{ color: '#e2e8f0' }} />
        <Line 
          type="monotone" 
          dataKey="standardAnsökan" 
          name="Standard ansökningar" 
          stroke="#94a3b8" 
          strokeWidth={2}
          dot={{ r: 5 }}
          activeDot={{ r: 8 }}
        />
        <Line 
          type="monotone" 
          dataKey="cvBrevAnsökan" 
          name="cvbrev.se ansökningar" 
          stroke="#ec4899" 
          strokeWidth={3}
          dot={{ r: 5, strokeWidth: 2 }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}


export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function getSession() {
      try {
        setIsLoading(true);
        
        try {
          const { getSupabaseClient } = await import('@/lib/supabase/client-manager');
          const supabase = getSupabaseClient();
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
    <> 
      <Head>
        {/* === SEO Optimerade Meta Tags === */}
        <title>Skapa Personligt Brev med AI | cvbrev.se - Få Drömjobbet Snabbare</title>
        <meta 
          name="description" 
          content="Använd cvbrev.se:s AI för att skapa professionella, skräddarsydda personliga brev på sekunder. Ladda upp CV, klistra in jobbannons – få ett brev som sticker ut och ökar dina jobbchanser!" 
        />
        <meta 
          name="keywords" 
          content="personligt brev, AI, skriva personligt brev, cvbrev, jobbansökan, ansökningsbrev, AI-assistent, CV-matchning, gratis personligt brev, premium personligt brev" 
        />
        <meta property="og:title" content="Skapa Personligt Brev med AI | cvbrev.se" />
        <meta property="og:description" content="Förvandla ditt CV och jobbannonsen till ett vinnande personligt brev med vår intelligenta AI. Testa gratis!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cvbrev.se" /> 
        <meta property="og:image" content="https://cvbrev.se/images/cvbrev-og-main.png" /> {/* Byt till en relevant OG-bild för startsidan */}
        <link rel="canonical" href="https://cvbrev.se" />
      </Head>

      <div className="flex flex-col min-h-screen bg-navy-950">
        {/* Hero section - Uppdaterad text */}
        <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 to-navy-800">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 to-navy-800/50"></div>
          
          <div className="container relative px-4 py-16 mx-auto lg:py-24">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
              <div className="text-center lg:text-left">
                <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  Skriv <span className="text-pink-500">Personligt Brev</span> med Vår AI-Assistent
                </h1>
                
                <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-300 lg:mx-0">
                  Förvandla ditt CV och jobbannonsen till ett unikt, professionellt personligt brev på sekunder. Öka dina chanser att landa drömjobbet!
                </p>
                
                <div className="flex flex-col justify-center gap-4 mt-8 sm:flex-row lg:justify-start">
                  {session ? (
                    <Link 
                      href="/create-letter"
                      className="inline-flex items-center px-8 py-4 text-lg font-medium text-white transition-all duration-300 bg-pink-600 rounded-md shadow-lg hover:bg-pink-700 hover:shadow-xl group"
                    >
                      Skapa ditt brev nu
                      <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  ) : (
                    <>
                      <Link 
                        href="/register"
                        className="inline-flex items-center px-8 py-4 text-lg font-medium text-white transition-all duration-300 bg-pink-600 rounded-md shadow-lg hover:bg-pink-700 hover:shadow-xl group"
                      >
                        Kom igång gratis
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
                
                {/* Uppdaterade fördelar */}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-8 lg:justify-start">
                  <div className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 mr-2 text-pink-500" />
                    <span>Skräddarsytt för varje jobb</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 mr-2 text-pink-500" />
                    <span>Vetenskapligt baserad metod</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 mr-2 text-pink-500" />
                    <span>Snabbt & Enkelt</span>
                  </div>
                </div>
              </div>
              
              <div className="order-first lg:order-last">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-3xl blur-xl opacity-30"></div>
                  <div className="relative flex justify-center p-8 lg:p-0">
                    <img 
                      src="/cvbrev.png" 
                      alt="cvbrev.se AI logotyp" 
                      className="w-40 lg:w-64 animate-bounce" 
                      style={{ animationDuration: '6s' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* How it works section - Förbättrade boxar */}
        <section className="py-16 bg-navy-900 lg:py-24">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Tre enkla steg till ditt personliga brev
              </h2>
              <p className="text-xl text-gray-300">
                Vår intelligenta AI gör processen smidig – från CV till färdigt brev.
              </p>
            </div>
            
            {/* Uppdaterade boxar med border och tydligare hover */}
            <div className="grid gap-8 md:grid-cols-3">
              <div className="p-8 transition-all duration-300 bg-navy-800 border border-navy-700 rounded-xl hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-2">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-pink-600 to-pink-500 rounded-full shadow-lg">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">1. Ladda upp ditt CV</h3>
                <p className="text-center text-gray-300">
                  Importera ditt CV (<span className="font-medium">PDF, DOCX, TXT</span>). Vår AI analyserar direkt dina erfarenheter och kompetenser.
                </p>
              </div>
              
              <div className="p-8 transition-all duration-300 bg-navy-800 border border-navy-700 rounded-xl hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-2">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">2. Klistra in Jobbannons</h3>
                <p className="text-center text-gray-300">
                  Ange texten från jobbannonsen. AI:n identifierar nyckelkraven och matchar dem mot din profil.
                </p>
              </div>
              
              <div className="p-8 transition-all duration-300 bg-navy-800 border border-navy-700 rounded-xl hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">3. Få ditt AI-brev</h3>
                <p className="text-center text-gray-300">
                  Få ett skräddarsytt utkast på sekunder. Justera tonalitet (Premium), redigera och spara ditt färdiga brev.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing plans - Uppdaterad struktur och innehåll */}
        <section className="py-16 bg-navy-950 lg:py-24">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Välj planen som passar dig
              </h2>
              <p className="text-xl text-gray-300">
                Starta gratis eller lås upp full potential med Premium.
              </p>
            </div>
            
            {/* Centrerad grid för två planer */}
            <div className="grid max-w-4xl gap-8 mx-auto lg:grid-cols-2">
              {/* Free plan */}
              <div className="flex flex-col overflow-hidden transition-all duration-300 bg-navy-800 border border-gray-700 rounded-xl hover:border-gray-500 hover:translate-y-[-8px]">
                <div className="p-8 flex-grow"> {/* p-8 för mer luft, flex-grow */}
                  <h3 className="mb-2 text-2xl font-bold text-white">Gratis</h3>
                  <p className="mb-6 text-gray-400">Perfekt för att testa och skriva enstaka brev</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">0 kr</span>
                    {/* <span className="text-gray-400"> / månad</span> */}
                  </div>
                  
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-start">
                      <MessageSquare className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">5 Brevgenereringar / vecka</span>
                    </li>
                    <li className="flex items-start">
                      <Save className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">2 Sparade brev</span>
                    </li>
                     <li className="flex items-start">
                      <Upload className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">1 CV-uppladdning</span>
                    </li>
                    <li className="flex items-start">
                      <Lock className="w-5 h-5 mr-3 text-gray-500 shrink-0" /> {/* Låsikon */}
                      <span className="text-gray-500">AI-optimerad tonalitet (Premium)</span>
                    </li>
                  </ul>
                </div>
                  
                <div className="p-8 pt-0"> {/* Separat div för knapp för alignment */}
                  <Link 
                    href="/register"
                    className="flex justify-center w-full px-6 py-3 font-medium text-white transition-colors bg-gray-600 rounded-md hover:bg-gray-500"
                  >
                    Kom igång gratis
                  </Link>
                </div>
              </div>
              
              {/* Premium plan */}
              <div className="relative flex flex-col overflow-hidden transition-all duration-300 bg-navy-800 border-2 border-pink-500 rounded-xl hover:translate-y-[-8px] shadow-lg shadow-pink-500/10">
                {/* Ren header för POPULÄRASTE */}
                <div className="w-full bg-pink-600 py-2 flex items-center justify-center text-white font-semibold">
                  PREMIUM
                </div>
                
                <div className="p-8 flex-grow"> {/* p-8 för mer luft, flex-grow */}
                  <h3 className="mb-2 text-2xl font-bold text-white">Premium</h3>
                  <p className="mb-6 text-gray-400">Alla funktioner, obegränsad användning</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">149 kr</span> {/* Uppdaterat pris */}
                    <span className="text-gray-400"> / månad</span>
                  </div>
                  
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-start">
                      <Zap className="w-5 h-5 mr-3 text-pink-500 shrink-0" /> {/* Ikon för obegränsat */}
                      <span className="text-gray-300">Obegränsad brevgenerering</span>
                    </li>
                     <li className="flex items-start">
                      <Save className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">Obegränsade sparade brev</span>
                    </li>
                     <li className="flex items-start">
                      <Upload className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">Obegränsade CV-uppladdningar</span>
                    </li>
                    <li className="flex items-start">
                      <Lightbulb className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">AI-optimerad tonalitet</span>
                    </li>
                    {/* Lägg eventuellt till fler *faktiska* premiumfördelar här om de finns */}
                    {/* <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 text-pink-500 shrink-0" />
                      <span className="text-gray-300">Prioriterad support</span>
                    </li> */}
                  </ul>
                </div>
                
                <div className="p-8 pt-0"> {/* Separat div för knapp */}
                  <Link 
                    href="/register?plan=premium" // Antaget att detta leder till premium-köp/registrering
                    className="flex justify-center w-full px-6 py-3 font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700"
                  >
                    Välj Premium
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits section with NEW graph and testimonials */}
        <section className="py-16 bg-navy-900 lg:py-24">
          <div className="container px-4 mx-auto">
             <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Varför ett Skräddarsytt Brev Ger Resultat
              </h2>
              <p className="text-xl text-gray-300">
                Vår AI-metod, inspirerad av forskning från ledande universitet, hjälper dig att sticka ut och få snabbare svar.
              </p>
            </div>

            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                {/* Success Rate Graph - Byt till linjediagram */}
                <div className="p-6 mb-12 bg-navy-800 rounded-xl">
                  <h3 className="mb-4 text-xl font-semibold text-white text-center">Svarsfrekvens över tid (cvbrev.se vs Standard)</h3>
                  <div className="relative h-80"> {/* Samma höjd som på funktioner */}
                    <CVBrevTimelineChart /> {/* Använd den nya graf-komponenten */}
                  </div>
                  <p className="mt-3 text-sm text-gray-400 text-center">Baserat på aggregerad anonymiserad användardata</p>
                </div>
                
                {/* Uppdaterade fördelar baserat på text */}
                <ul className="space-y-8">
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="mb-1 text-xl font-semibold text-white">Perfekt Matchning</h3>
                      <p className="text-gray-300">AI:n analyserar både ditt CV och jobbannonsen för att skapa ett brev som direkt adresserar arbetsgivarens behov och lyfter dina mest relevanta meriter.</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full"> {/* Annan färg för variation */}
                      <BrainCircuit className="w-5 h-5 text-white" /> {/* Ikon från funktioner */}
                    </div>
                    <div className="ml-4">
                      <h3 className="mb-1 text-xl font-semibold text-white">Vetenskapligt Grundad AI</h3>
                      <p className="text-gray-300">Byggd på insikter från bl.a. Harvard och Stanford samt rekryteringsexperter för att maximera dina chanser att fånga intresset.</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full"> {/* Annan färg */}
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="mb-1 text-xl font-semibold text-white">Spara Tid & Energi</h3>
                      <p className="text-gray-300">Slipp timmar av skrivkramp. Få ett högkvalitativt utkast på sekunder och lägg din tid på att förbereda dig för intervjun istället.</p>
                    </div>
                  </li>
                </ul>
                
              </div>
              
              {/* Testimonials Section (Behålls som den är) */}
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
        
        {/* CTA section - Uppdaterad */}
        <section className="py-16 bg-gradient-to-r from-pink-600 to-purple-600 lg:py-20">
          <div className="container px-4 mx-auto text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Redo att skriva ditt bästa personliga brev någonsin?
            </h2>
            
            <p className="max-w-2xl mx-auto mb-8 text-xl text-white text-opacity-90">
              Låt vår AI hjälpa dig att imponera på arbetsgivare. Skapa ditt konto och testa gratis idag!
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
    </>
  );
}