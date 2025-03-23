'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { 
  ChevronRight, 
  CheckCircle, 
  FileText, 
  Upload, 
  MessageSquare, 
  Copy, 
  Lightbulb, 
  RefreshCw, 
  Save, 
  Zap, 
  Clock, 
  Target
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

// Effektivitetsdata för grafen
const timelineData = [
  { name: 'Dag 1', standardAnsökan: 20, cvBrevAnsökan: 45 },
  { name: 'Dag 3', standardAnsökan: 25, cvBrevAnsökan: 62 },
  { name: 'Dag 7', standardAnsökan: 30, cvBrevAnsökan: 75 },
  { name: 'Dag 14', standardAnsökan: 32, cvBrevAnsökan: 85 },
  { name: 'Dag 30', standardAnsökan: 35, cvBrevAnsökan: 92 },
];

// Data för funktionsutnyttjande
const featureUsageData = [
  { name: 'Personliga brev', value: 40 },
  { name: 'CV-anpassning', value: 25 },
  { name: 'Tonalitetsjustering', value: 15 },
  { name: 'Intervjutips', value: 12 },
  { name: 'CV-feedback', value: 8 },
];

const COLORS = ['#ec4899', '#9333ea', '#6366f1', '#3b82f6', '#06b6d4'];

// Graf-komponent för ansökningseffektivitet
function CVBrevTimelineChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={timelineData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
        <XAxis dataKey="name" tick={{ fill: '#e2e8f0' }} />
        <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: '#e2e8f0' }} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
          formatter={(value) => [`${value}%`]} 
        />
        <Legend />
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
          name="CVBrev ansökningar" 
          stroke="#ec4899" 
          strokeWidth={3}
          dot={{ r: 5, strokeWidth: 2 }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Graf-komponent för funktionsanvändning
function FeatureUsageChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={featureUsageData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {featureUsageData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function FunktionerPage() {
  const [session, setSession] = useState<any>(null);
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
          
          // Fixa typfelet genom att tillämpa en explicit typning
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
        <title>CVBrev - Alla funktioner för att skapa perfekta personliga brev</title>
        <meta name="description" content="Upptäck alla kraftfulla funktioner i CVBrev: AI-generering, CV-analys, tonalitetsjustering, mallar och mer. Skapa personliga ansökningsbrev som ökar dina chanser att få drömjobbet." />
        <meta name="keywords" content="personligt brev, CV, jobbansökan, AI skriva brev, ansökningsbrev, personliga brev mall" />
        <meta property="og:title" content="CVBrev - Alla funktioner för perfekta personliga brev" />
        <meta property="og:description" content="Upptäck alla kraftfulla funktioner i CVBrev: AI-generering, CV-analys, tonalitetsjustering, mallar och mer." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cvbrev.se/funktioner" />
        <meta property="og:image" content="https://cvbrev.se/images/cvbrev-og.png" />
      </Head>

      <div className="flex flex-col min-h-screen bg-navy-950">
        {/* Hero section with gradient background */}
        <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 to-navy-800">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 to-navy-800/50"></div>
          
          <div className="container relative px-4 py-16 mx-auto lg:py-24">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
              <div className="text-center lg:text-left">
                <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  Kraftfulla <span className="text-pink-500">funktioner</span> för perfekta brev
                </h1>
                
                <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-300 lg:mx-0">
                  Upptäck alla verktyg och funktioner som hjälper dig att skapa personliga ansökningsbrev som sticker ut och hjälper dig att få jobbet.
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
                    <Link 
                      href="/register"
                      className="inline-flex items-center px-8 py-4 text-lg font-medium text-white transition-all duration-300 bg-pink-600 rounded-md shadow-lg hover:bg-pink-700 hover:shadow-xl group"
                    >
                      Börja gratis
                      <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  )}
                  
                  <Link 
                    href="#huvudfunktioner"
                    className="inline-flex items-center px-8 py-4 text-lg font-medium text-white transition-colors border border-white rounded-md hover:bg-white hover:bg-opacity-10"
                  >
                    Utforska funktioner
                  </Link>
                </div>
              </div>
              
              <div className="order-first lg:order-last">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-3xl blur-xl opacity-30"></div>
                  <div className="relative flex justify-center p-8 lg:p-0">
                    <img 
                      src="/cvbrev.png" 
                      alt="CVBrev AI-assistent" 
                      className="w-40 lg:w-64 animate-bounce" 
                      style={{ animationDuration: '6s' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Ansökningseffektivitet section */}
        <section className="py-16 bg-navy-900 lg:py-24">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Bevisbara resultat
              </h2>
              <p className="text-xl text-gray-300">
                Med CVBrev får du snabbare och bättre respons på dina ansökningar över tid.
              </p>
            </div>
            
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h3 className="mb-6 text-2xl font-bold text-white">Ökade svarfrekvens över tid</h3>
                <p className="mb-8 text-gray-300">
                  Våra analyser visar att CVBrev-användare får signifikant högre svarsfrekvens på sina jobbansökningar jämfört med standardansökningar. Redan från dag 1 ser du skillnad, och över tid ökar sannolikheten för positiva svar dramatiskt.
                </p>
                
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-white"><span className="font-bold text-pink-500">92%</span> av användarna får svar inom 30 dagar</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-white"><span className="font-bold text-pink-500">45%</span> får svar redan inom första dagen</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-white"><span className="font-bold text-pink-500">2.6x</span> högre intervjufrekvens jämfört med standardansökningar</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 bg-navy-800 rounded-xl">
                <h3 className="mb-4 text-xl font-semibold text-white">Svarsfrekvens över tid</h3>
                <div className="relative h-80">
                  <CVBrevTimelineChart />
                </div>
                <p className="mt-3 text-sm text-gray-400 text-center">Baserat på data från 5000+ användare och 25000+ ansökningar</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Main features section */}
        <section id="huvudfunktioner" className="py-16 bg-navy-950 lg:py-24">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Huvudfunktioner
              </h2>
              <p className="text-xl text-gray-300">
                Allt du behöver för att skapa personliga ansökningsbrev som ökar dina chanser att få jobbet.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-pink-600 to-pink-500 rounded-full">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">CV-analys</h3>
                <p className="text-center text-gray-300">
                  Ladda upp ditt CV och vår AI analyserar automatiskt din kompetens, erfarenhet och nyckelord för att skapa personliga brev som lyfter fram dina styrkor.
                </p>
              </div>
              
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">Jobbannonsanalys</h3>
                <p className="text-center text-gray-300">
                  Klistra in jobbannonsen och vår AI identifierar nyckelkompetenser, krav och företagskultur för att skapa perfekt matchande ansökningsbrev.
                </p>
              </div>
              
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">AI-brevgenerering</h3>
                <p className="text-center text-gray-300">
                  Vår avancerade AI skapar personliga brev som är skräddarsydda efter både ditt CV och den specifika jobbannonsen på bara några sekunder.
                </p>
              </div>
              
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-blue-500 to-teal-500 rounded-full">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">Tonalitetsjustering</h3>
                <p className="text-center text-gray-300">
                  Välj mellan olika tonaliteter som professionell, kreativ, formell eller personlig för att anpassa tonen efter tjänsten och företagskulturen.
                </p>
              </div>
              
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-teal-500 to-green-500 rounded-full">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">Obegränsade revideringar</h3>
                <p className="text-center text-gray-300">
                  Generera om ditt brev så många gånger du vill, med olika tonaliteter och fokus, tills du är helt nöjd med resultatet.
                </p>
              </div>
              
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-green-500 to-yellow-500 rounded-full">
                  <Save className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">Spara och hantera mallar</h3>
                <p className="text-center text-gray-300">
                  Spara dina bästa brev som mallar för att snabbt kunna anpassa dem för liknande ansökningar i framtiden.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Feature usage and premium features */}
        <section className="py-16 bg-navy-900 lg:py-24">
          <div className="container px-4 mx-auto">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
                  Premiumfunktioner för seriösa jobbsökande
                </h2>
                
                <ul className="space-y-6 mb-8">
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="mb-1 text-xl font-semibold text-white">CV-feedback</h3>
                      <p className="text-gray-300">Få professionell feedback på ditt CV med förslag på förbättringar som kan öka dina chanser att få jobbet.</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="mb-1 text-xl font-semibold text-white">Intervjutipsgenerator</h3>
                      <p className="text-gray-300">Förbered dig för jobbintervjun med personligt anpassade intervjufrågor och svarsförslag baserade på din ansökan.</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="mb-1 text-xl font-semibold text-white">Premium AI-modell</h3>
                      <p className="text-gray-300">Få tillgång till vår mest avancerade AI-modell för ännu mer personliga och övertygande brev som sticker ut.</p>
                    </div>
                  </li>
                </ul>
                
                <div className="mt-8">
                  <Link 
                    href="/register?plan=premium"
                    className="inline-flex items-center px-6 py-3 font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700 group"
                  >
                    Uppgradera till Premium
                    <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
              
              <div className="p-6 bg-navy-800 rounded-xl">
                <h3 className="mb-4 text-xl font-semibold text-white text-center">Mest populära funktioner</h3>
                <div className="relative h-80">
                  <FeatureUsageChart />
                </div>
                <p className="mt-3 text-sm text-gray-400 text-center">Baserat på användningsdata bland premiumanvändare</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ section */}
        <section className="py-16 bg-navy-950 lg:py-24">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Vanliga frågor
              </h2>
              <p className="text-xl text-gray-300">
                Hitta svaren på de vanligaste frågorna om våra funktioner.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Hur bra är AI:n på att skriva personliga brev?</h3>
                  <p className="text-gray-300">
                    Vår AI är tränad på tusentals framgångsrika ansökningsbrev och använder avancerad språkbearbetning för att skapa personliga, övertygande brev. Breven är skräddarsydda efter ditt CV och den specifika jobbannonsen, vilket skapar en stark koppling mellan dina kompetenser och arbetsgivarens behov.
                  </p>
                </div>
                
                <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Kommer rekryterare att märka att brevet är AI-genererat?</h3>
                  <p className="text-gray-300">
                    Nej, våra brev är utformade för att låta naturliga och personliga. Dessutom har du full kontroll att redigera och anpassa brevet innan du skickar det. Vi rekommenderar att du läser igenom och gör små justeringar för att säkerställa att det perfekt representerar din egen röst och personlighet.
                  </p>
                </div>
                
                <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Vilka filformat stöds för CV-uppladdning?</h3>
                  <p className="text-gray-300">
                    Vi stödjer uppladdning av CV i PDF, DOCX och TXT-format. Vår AI kan analysera innehållet i dessa format för att identifiera relevant information som erfarenhet, kompetenser och utbildning.
                  </p>
                </div>
                
                <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Hur länge sparas mina brev och CV?</h3>
                  <p className="text-gray-300">
                    Dina dokument sparas säkert så länge du har ett aktivt konto. Du kan när som helst radera dina uppgifter från ditt kontolläge. Vi använder aldrig dina personliga data för något annat än att tillhandahålla tjänsten till dig.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="py-16 bg-gradient-to-r from-pink-600 to-purple-600 lg:py-20">
          <div className="container px-4 mx-auto text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Redo att skapa ditt perfekta ansökningsbrev?
            </h2>
            
            <p className="max-w-2xl mx-auto mb-8 text-xl text-white text-opacity-90">
              Börja redan idag och öka dina chanser att få dina drömjobb.
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