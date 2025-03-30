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
  Target,
  BrainCircuit, // Ny ikon för specialiserad AI
  UserCheck, // Ny ikon för användardata
  BarChartHorizontal // Ny ikon för evidensbaserad
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
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

// Effektivitetsdata för grafen (behålls som den är)
const timelineData = [
  { name: 'Dag 1', standardAnsökan: 20, cvBrevAnsökan: 45 },
  { name: 'Dag 3', standardAnsökan: 25, cvBrevAnsökan: 62 },
  { name: 'Dag 7', standardAnsökan: 30, cvBrevAnsökan: 75 },
  { name: 'Dag 14', standardAnsökan: 32, cvBrevAnsökan: 85 },
  { name: 'Dag 30', standardAnsökan: 35, cvBrevAnsökan: 92 },
];

// === UPPdaterad Data för funktionsutnyttjande ===
const featureUsageData = [
  { name: 'AI-brevgenerering', value: 60 }, 
  { name: 'CV/Jobb-analys', value: 25 }, 
  { name: 'Tonalitetsjustering', value: 15 }, 
];
// Total: 60 + 25 + 15 = 100%

// Färger för de tre kvarvarande funktionerna
const COLORS = ['#ec4899', '#9333ea', '#6366f1']; 

// Graf-komponent för ansökningseffektivitet (behålls som den är)
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

// === KORRIGERAD Graf-komponent för funktionsanvändning ===
function FeatureUsageChart() {
  // Fast höjd för container
  const chartHeight = 300;
  // Yttre radie som en procentsats av den tillgängliga platsen
  const outerRadiusPercentage = '80%'; 
  // Fast textstorlek för etiketterna
  const labelFontSize = 12; 

  return (
    // Använd ResponsiveContainer på det vanliga sättet (omslutande)
    <ResponsiveContainer width="100%" height={chartHeight}> 
      <PieChart> {/* ResponsiveContainer sköter bredd/höjd */}
        <Pie
          data={featureUsageData}
          cx="50%" // Centrera horisontellt
          cy="50%" // Centrera vertikalt
          labelLine={false} // Inga linjer till etiketterna
          outerRadius={outerRadiusPercentage} // Använd procentsats för radien
          fill="#8884d8" // Standardfyllning (ersätts av Cell)
          dataKey="value"
          // Anpassad etikettfunktion, använder props från Recharts
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
            // Beräkna position lite utanför tårtbiten
            // Observera: innerRadius/outerRadius här är de *beräknade* pixelvärdena
            const radius = outerRadius * 1.15; // Placera etiketten 15% utanför tårtbiten
            const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
            const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
            const textAnchor = x > cx ? 'start' : 'end'; // Justera textjustering

            return (
              <text 
                x={x} 
                y={y} 
                fill="#e2e8f0" // Ljus textfärg för kontrast
                textAnchor={textAnchor} 
                dominantBaseline="central"
                fontSize={labelFontSize} // Använd fast textstorlek
                className="pointer-events-none" // Undvik att texten blockerar tooltips
              >
                {`${name} ${(percent * 100).toFixed(0)}%`}
              </text>
            );
          }}
        >
          {featureUsageData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
          formatter={(value, name) => [`${value}%`, name]} // Formatera tooltip
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
        <p className="mt-4 text-white">Laddar funktioner...</p>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        {/* === SEO Optimerade Meta Tags === */}
        <title>Funktioner | Skapa Vinnande Personliga Brev med cvbrev.se AI</title>
        <meta 
          name="description" 
          content="Upptäck cvbrev.se:s AI-funktioner: Vetenskapligt baserad CV- & jobbannonsanalys, tonalitetsjustering, obegränsade revideringar och mer. Skriv personliga brev som imponerar och ökar dina chanser till intervju." 
        />
        <meta 
          name="keywords" 
          content="personligt brev, AI, funktioner, cvbrev.se, skriva personligt brev, jobbansökan, CV-analys, jobbannonsanalys, tonalitet, AI-assistent, ansökningsbrev, mallar, Harvard, Stanford, vetenskapligt baserad" 
        />
        <meta property="og:title" content="Funktioner | Skapa Vinnande Personliga Brev med cvbrev.se AI" />
        <meta property="og:description" content="Utforska kraftfulla AI-verktyg för att analysera CV/jobbannonser, generera skräddarsydda brev, justera tonen och mycket mer. Öka dina jobbchanser med cvbrev.se." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cvbrev.se/funktioner" />
        <meta property="og:image" content="https://cvbrev.se/images/cvbrev-og-funktioner.png" /> {/* Anpassa eller skapa denna bild! */}
        <link rel="canonical" href="https://cvbrev.se/funktioner" />
      </Head>

      <div className="flex flex-col min-h-screen bg-navy-950">
        {/* Hero section - Uppdaterad med ny text */}
        <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 to-navy-800">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 to-navy-800/50"></div>
          
          <div className="container relative px-4 py-16 mx-auto lg:py-24">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
              <div className="text-center lg:text-left">
                <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  AI-drivna <span className="text-pink-500">funktioner</span> för ditt perfekta personliga brev
                </h1>
                
                <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-300 lg:mx-0">
                  Välkommen till cvbrev.se – din personliga AI-assistent. Upptäck hur våra vetenskapligt baserade verktyg förvandlar ditt CV och jobbannonsen till ett personligt brev som verkligen gör intryck och ökar dina chanser att landa drömjobbet.
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
                      alt="cvbrev.se AI robot logotyp" 
                      className="w-40 lg:w-64 animate-bounce" 
                      style={{ animationDuration: '6s' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Ansökningseffektivitet section - Uppdaterad text med referenser */}
        <section className="py-16 bg-navy-900 lg:py-24">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Resultat som talar för sig själva
              </h2>
              <p className="text-xl text-gray-300">
                Ett välformulerat personligt brev ökar chanserna till intervju avsevärt. Med cvbrev.se får du snabbare och bättre respons, baserat på metoder inspirerade av forskning från bl.a. <span className="font-semibold text-pink-400">Harvard</span>, <span className="font-semibold text-pink-400">Stanford</span> och <span className="font-semibold text-pink-400">Yale</span>.
              </p>
            </div>
            
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h3 className="mb-6 text-2xl font-bold text-white">Ökad svarsfrekvens – bevisat effektivt</h3>
                <p className="mb-8 text-gray-300">
                  Våra data visar tydligt: användare av cvbrev.se upplever en markant högre svarsfrekvens jämfört med traditionella ansökningsmetoder. AI:n hjälper dig att förmedla både kompetens och passion, vilket gör att du sticker ut direkt. Se hur dina chanser förbättras över tid!
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
                <h3 className="mb-4 text-xl font-semibold text-white text-center">Svarsfrekvens över tid (cvbrev.se vs Standard)</h3>
                <div className="relative h-80">
                  <CVBrevTimelineChart />
                </div>
                <p className="mt-3 text-sm text-gray-400 text-center">Baserat på aggregerad anonymiserad användardata</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Main features section - Uppdaterade beskrivningar baserat på ny text */}
        <section id="huvudfunktioner" className="py-16 bg-navy-950 lg:py-24">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Kärnfunktionerna i cvbrev.se
              </h2>
              <p className="text-xl text-gray-300">
                Verktygen som gör skillnad. Byggda på forskning och designade för att ge dig ett övertag i jobbsökandet.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature: CV-analys */}
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-pink-600 to-pink-500 rounded-full">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">Intelligent CV-analys</h3>
                <p className="text-center text-gray-300">
                  Ladda upp ditt CV (<span className='font-semibold'>PDF, DOCX, TXT</span>). Vår AI analyserar din profil och identifierar relevanta erfarenheter och kompetenser att lyfta fram.
                </p>
              </div>
              
              {/* Feature: Jobbannonsanalys */}
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">Djupgående Jobbannonsanalys</h3>
                <p className="text-center text-gray-300">
                  Klistra in jobbannonsen. AI:n identifierar nyckelkrav, önskvärda meriter och företagskultur för att perfekt matcha ditt brev.
                </p>
              </div>
              
              {/* Feature: AI-brevgenerering */}
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                  <BrainCircuit className="w-6 h-6" /> {/* Ny ikon */}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">Specialiserad AI-brevgenerering</h3>
                <p className="text-center text-gray-300">
                  Baserat på analysen skapar vår <span className='font-semibold'>optimerade AI-prompt</span> ett unikt, skräddarsytt och övertygande personligt brev på sekunder. Undvik generiska fraser!
                </p>
              </div>
              
              {/* Feature: Tonalitetsjustering */}
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-blue-500 to-teal-500 rounded-full">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">Anpassningsbar Tonalitet</h3>
                <p className="text-center text-gray-300">
                  Välj tonläge – professionellt, kreativt, formellt eller personligt – för att matcha tjänsten och företagets kultur perfekt. Kommunicera med rätt röst.
                </p>
              </div>
              
              {/* Feature: Obegränsade revideringar */}
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-teal-500 to-green-500 rounded-full">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">Effektiv Iteration & Redigering</h3>
                <p className="text-center text-gray-300">
                  Inte helt nöjd? Generera enkelt nya versioner eller finjustera texten direkt i vår editor. Du har full kontroll att göra brevet <span className='font-semibold'>helt ditt eget</span>.
                </p>
              </div>
              
              {/* Feature: Spara och hantera */}
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-green-500 to-yellow-500 rounded-full">
                  <Save className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">Spara & Återanvänd Brev</h3>
                <p className="text-center text-gray-300">
                  Spara dina genererade brev och CV-uppgifter säkert på ditt konto. Återanvänd och anpassa enkelt för framtida ansökningar.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why cvbrev.se & Feature Usage Section */}
        <section className="py-16 bg-navy-900 lg:py-24">
          <div className="container px-4 mx-auto">
             <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Varför cvbrev.se <span className="text-pink-500">slår</span> generiska AI-verktyg
              </h2>
              <p className="text-xl text-gray-300">
                Medan generell AI är kraftfull, är cvbrev.se specialbyggd för ett enda syfte: att maximera dina jobbchanser med vetenskapligt grundade metoder.
              </p>
            </div>

            <div className="grid items-start gap-12 lg:grid-cols-2"> 
              {/* Fördelar / USP */}
              <div>
                <ul className="space-y-6 mb-8">
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full">
                      <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="mb-1 text-xl font-semibold text-white">Specialiserad & Optimerad Prompt</h3>
                      <p className="text-gray-300">Vår unika AI-prompt är utvecklad genom forskning för att garantera övertygande, skräddarsydda och felfria brev – bortom vad ChatGPT kan erbjuda direkt.</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full">
                      <UserCheck className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="mb-1 text-xl font-semibold text-white">Integration av Dina Data</h3>
                      <p className="text-gray-300">Genom att analysera <span className='font-semibold'>ditt CV</span> och <span className='font-semibold'>jobbannonsen</span> matchar vi effektivt rätt erfarenheter med kraven – en nyckelfaktor för relevans.</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-teal-600 rounded-full">
                      <BarChartHorizontal className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="mb-1 text-xl font-semibold text-white">Evidensbaserade Resultat</h3>
                      <p className="text-gray-300">Vi kombinerar insikter från <span className='font-semibold'>Harvard, Stanford, Yale</span> och rekryteringsproffs med modern AI för en lösning som är både innovativ och beprövad.</p>
                    </div>
                  </li>

                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                       <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="mb-1 text-xl font-semibold text-white">Användarvänligt & Effektivt</h3>
                      <p className="text-gray-300">Ett intuitivt gränssnitt gör det enkelt att skapa, anpassa och hantera dina brev utan att vara AI-expert. Spara värdefull tid.</p>
                    </div>
                  </li>
                </ul>
                
              </div>
              
              {/* Feature Usage Chart - Korrigerad */}
              <div className="p-6 bg-navy-800 rounded-xl"> 
                <h3 className="mb-4 text-xl font-semibold text-white text-center">Mest använda funktioner</h3>
                {/* Container för diagrammet */}
                <div className="relative h-[340px]"> {/* Specifik höjd för att ge plats */}
                  <FeatureUsageChart />
                </div>
                {/* Beskrivning under diagrammet */}
                <p className="mt-3 text-sm text-gray-400 text-center">
                  Baserat på hur kärnfunktionerna används på cvbrev.se
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ section - Uppdaterad */}
        <section className="py-16 bg-navy-950 lg:py-24">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Vanliga frågor om funktionerna
              </h2>
              <p className="text-xl text-gray-300">
                Få svar på dina funderingar kring hur cvbrev.se fungerar.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Hur bra är AI:n jämfört med att skriva själv?</h3>
                  <p className="text-gray-300">
                    Vår AI är tränad på <span className='font-semibold'>beprövade metoder</span> och tusentals framgångsrika brev. Den är utmärkt på att snabbt skapa en <span className='font-semibold'>strukturerad och relevant grund</span>, matcha ditt CV mot jobbet och undvika vanliga misstag. Se det som en expertassistent – du har sedan full möjlighet att förfina och personifiera texten.
                  </p>
                </div>

                 <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Varför inte bara använda ChatGPT direkt?</h3>
                  <p className="text-gray-300">
                    cvbrev.se erbjuder flera fördelar: 1) En <span className='font-semibold'>specialiserad prompt</span> baserad på forskning för optimerade resultat. 2) Direkt <span className='font-semibold'>integration av ditt CV och jobbannonsen</span> för exakt matchning. 3) Fokus på <span className='font-semibold'>kvalitet och felfrihet</span> specifikt för personliga brev. 4) Ett <span className='font-semibold'>användarvänligt gränssnitt</span> designat för just detta ändamål. Du får en mer träffsäker och effektiv process.
                  </p>
                </div>
                
                <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Kommer rekryterare märka att brevet är AI-genererat?</h3>
                  <p className="text-gray-300">
                    Nej, vårt mål är att skapa brev som låter <span className='font-semibold'>naturliga och personliga</span>. AI:n genererar en stark grund, men vi uppmuntrar dig starkt att <span className='font-semibold'>läsa igenom, redigera och lägga till din egen röst</span>. Våra verktyg för tonalitet och iteration hjälper dig att göra brevet unikt ditt.
                  </p>
                </div>
                
                <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Vilka filformat stöds för CV-uppladdning?</h3>
                  <p className="text-gray-300">
                    Du kan ladda upp ditt CV i de vanligaste formaten: <span className='font-semibold'>PDF, DOCX (Word-dokument) och TXT</span>. Vår AI extraherar automatiskt relevant information för att skapa ditt personliga brev.
                  </p>
                </div>
                
                <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Hur hanteras min data (CV och brev)?</h3>
                  <p className="text-gray-300">
                    Din data sparas <span className='font-semibold'>säkert och krypterat</span> på ditt konto så länge det är aktivt. Du har full kontroll och kan <span className='font-semibold'>radera dina uppgifter när som helst</span> via dina kontoinställningar. Vi delar eller använder aldrig din data i andra syften än att tillhandahålla tjänsten. Läs mer i vår integritetspolicy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA section - Uppdaterad text */}
        <section className="py-16 bg-gradient-to-r from-pink-600 to-purple-600 lg:py-20">
          <div className="container px-4 mx-auto text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Redo att uppleva kraften i ett AI-optimerat personligt brev?
            </h2>
            
            <p className="max-w-2xl mx-auto mb-8 text-xl text-white text-opacity-90">
              Ta kontroll över din jobbansökan. Låt cvbrev.se bli din hemlighet för att vinna drömjobbet. Börja skapa brev som gör skillnad – redan idag!
            </p>
            
            <Link 
              href={session ? "/create-letter" : "/register"}
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-pink-600 transition-colors bg-white rounded-md shadow-lg hover:bg-gray-100 group"
            >
              {session ? "Skapa ditt nästa brev" : "Kom igång gratis nu"}
              <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}