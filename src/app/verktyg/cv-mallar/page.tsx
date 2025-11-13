'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight, CheckCircle, Download, FileText, Upload, Eye,
  Crown, Shield, Zap, Target, TrendingUp, Star, Clock,
  ChevronDown, ChevronUp, Award, AlertTriangle, Sparkles,
  Users, BarChart3, BookOpen
} from 'lucide-react'

// Components
import PremiumNavbar from '@/components/PremiumNavbar'
import CVTemplateDemo from '@/components/CVTemplateDemo'
import Breadcrumb from '@/components/Breadcrumb'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'

export default function CVMallarLandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'modern' | 'traditional' | 'creative'>('all')

  // Filter templates by category
  const filteredTemplates = selectedCategory === 'all'
    ? SIMPLE_TEMPLATES
    : SIMPLE_TEMPLATES.filter(t => t.category === selectedCategory)

  // Schema.org markups
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Professionella CV-mallar från Jobbcoach.ai",
    "description": "8 professionella CV-mallar inklusive 2 gratis och 6 premium. ATS-optimerade mallar för svenska arbetsmarknaden.",
    "numberOfItems": 8,
    "itemListElement": SIMPLE_TEMPLATES.map((template, idx) => ({
      "@type": "Product",
      "position": idx + 1,
      "name": `${template.name} CV-mall`,
      "description": template.description,
      "category": template.category,
      "brand": {
        "@type": "Brand",
        "name": "Jobbcoach.ai"
      },
      "offers": {
        "@type": "Offer",
        "price": template.tier === 'free' ? "0" : "149",
        "priceCurrency": "SEK",
        "availability": "https://schema.org/InStock",
        "url": `https://jobbcoach.ai/verktyg/cv-mallar#${template.id}`
      }
    }))
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Är CV-mallarna verkligen gratis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, två av våra mallar är helt gratis utan dolda avgifter eller tidsbegränsningar. Du kan ladda ner dem som PDF och använda direkt. Om du vill ha tillgång till alla 8 mallar och Word-format ingår det i Premium."
        }
      },
      {
        "@type": "Question",
        "name": "Vilka format kan jag ladda ner?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Gratis mallar kommer som PDF. Premium-medlemmar får både PDF och Word-dokument. PDF är perfekt för att skicka in ansökningar eftersom layouten ser likadan ut överallt, medan Word gör det enkelt att uppdatera information senare."
        }
      },
      {
        "@type": "Question",
        "name": "Kan jag anpassa mallarna?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, du kan ändra all text, justera avsnitt och anpassa innehållet efter varje jobb du söker. Grundlayouten och designen förblir professionell medan du har full kontroll över vad som står. Premium ger fler anpassningsmöjligheter."
        }
      },
      {
        "@type": "Question",
        "name": "Vad är skillnaden mellan gratis och premium?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Gratis ger dig 2 solida mallar som PDF. Premium ger alla 8 exklusiva mallar, både PDF och Word-format, obegränsade nedladdningar och tillgång till alla andra verktyg på plattformen. Du får också nya mallar när vi släpper dem."
        }
      },
      {
        "@type": "Question",
        "name": "Hur laddar jag ner min mall?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Välj en mall, ladda upp ditt befintliga CV så fylls mallen automatiskt. Förhandsgranska resultatet och klicka sedan på nedladdningsknappen. Filen sparas direkt på din dator och är redo att skickas till arbetsgivare."
        }
      },
      {
        "@type": "Question",
        "name": "Fungerar mallarna med Word?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Premium-mallar levereras som redigerbara Word-dokument där du kan ändra allt innehåll. Layouten och designen är redan fixad så du slipper krångla med formatering. Öppna, redigera och spara – det bara fungerar."
        }
      },
      {
        "@type": "Question",
        "name": "Är mallarna ATS-vänliga?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, alla våra mallar är byggda för att fungera med ATS-system (Applicant Tracking Systems). Det betyder att automatiska system kan läsa din information korrekt och du inte sorteras bort av tekniska skäl. Strukturen är testad mot vanliga rekryteringsplattformar."
        }
      },
      {
        "@type": "Question",
        "name": "Kan jag lägga till foto?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, vissa mallar har plats för profilbild om du vill använda det. I Sverige är foto frivilligt och praxis varierar mellan branscher. Du bestämmer själv om du vill inkludera bild eller lämna det utrymmet tomt."
        }
      },
      {
        "@type": "Question",
        "name": "Hur många mallar finns det?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Vi har 8 professionella mallar totalt. 2 är gratis för alla, och 6 exklusiva premium-mallar för medlemmar. Varje mall finns i olika stilar – moderna, traditionella och kreativa – så det finns något för alla branscher."
        }
      },
      {
        "@type": "Question",
        "name": "Behöver jag skapa konto?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, du behöver ett gratis konto för att ladda upp ditt CV och hämta mallar. Det tar 30 sekunder att registrera dig. Kontot låter dig också spara dina CV:n och komma tillbaka för att ladda ner igen om du behöver."
        }
      }
    ]
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Så laddar du ner en professionell CV-mall från Jobbcoach.ai",
    "description": "Ladda ner gratis eller premium CV-mallar som Word eller PDF på 3 enkla steg",
    "totalTime": "PT3M",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Välj din CV-mall",
        "text": "Bläddra igenom våra 8 professionella CV-mallar. Filtrera efter stil (Modern, Traditionell, Kreativ) eller välj en av våra 2 helt gratis mallar: Modern Minimal eller Klassisk Professionell.",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Fyll i ditt CV-innehåll",
        "text": "Fyll i dina uppgifter direkt i formuläret, importera från LinkedIn eller ladda upp ditt befintliga CV. Förhandsgranska hur ditt CV ser ut i vald mall i realtid.",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Ladda ner som Word eller PDF",
        "text": "Välj format: PDF för direktinlämning till rekryterare (bästa resultat med ATS-system) eller Word för fortsatt redigering. Klicka 'Ladda ner' och ditt professionella CV är klart på 60 sekunder.",
        "position": 3
      }
    ]
  }

  const breadcrumbItems = [
    { name: 'Hem', href: '/' },
    { name: 'Verktyg', href: '/verktyg' },
    { name: 'CV-Mallar', href: '/verktyg/cv-mallar' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Schema.org markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <PremiumNavbar />

      <div className="container mx-auto px-4 pt-24">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div>
                <motion.h1
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Gratis CV-mallar som får dig till intervju
                </motion.h1>

                <motion.p
                  className="text-xl text-slate-600 mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Professionellt designade mallar som passar alla branscher – ladda ner direkt som PDF eller Word och börja ansöka idag.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Link
                    href="/dashboard/cv-mallar"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 inline-flex items-center justify-center gap-2"
                  >
                    Välj din mall
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="#exempel"
                    className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl border-2 border-slate-200 hover:border-blue-600 transition-all duration-300 inline-flex items-center justify-center gap-2"
                  >
                    Se exempel
                  </Link>
                </motion.div>

                <motion.div
                  className="flex flex-wrap items-center gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>8 professionella mallar</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>14 000+ nedladdningar</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>ATS-kompatibla</span>
                  </div>
                </motion.div>
              </div>

              {/* Right: Animated demo */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <CVTemplateDemo />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Känner du igen dig?
              </h2>
              <p className="text-lg text-slate-600">
                De vanligaste problemen som gör att ditt CV inte får respons
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: AlertTriangle,
                  title: 'Ditt CV ser oproffsigt ut',
                  description: 'Ett rörig layout med dålig typografi får rekryterare att tappa intresset på 6 sekunder. Även om du har perfekt erfarenhet sorteras du bort innan någon läst ditt innehåll. Designen måste signalera kompetens innan orden gör det.',
                },
                {
                  icon: Shield,
                  title: 'Automatiska system sorterar bort dig',
                  description: 'Över 75% av företagen använder system som läser CV:n innan någon människa ser dem. Fel struktur eller komplex formatering gör att ditt CV inte kan läsas – och då hamnar du aldrig i högen. Du förlorar jobb du aldrig visste att du var kvalificerad för.',
                },
                {
                  icon: Clock,
                  title: 'Du slösar timmar i Word',
                  description: 'Att försöka få tabeller, marginaler och rubriker att se bra ut i Word är frustrerande. Efter tre timmar ser det fortfarande inte professionellt ut. Den tiden ska du lägga på att skriva bra innehåll istället.',
                }
              ].map((problem, idx) => (
                <motion.div
                  key={idx}
                  className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                    <problem.icon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{problem.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{problem.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Overview Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Välj CV-mall efter stil: Modern, traditionell, kreativ
              </h2>
              <p className="text-lg text-slate-600">
                Alla mallar är indelade i tre stilkategorier baserat på design och yrkesinriktning
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  category: 'Modern',
                  description: 'Ren och luftig design med tydlig typografi. Perfekt för dig som söker jobb inom tech, konsult eller moderna företag där visuell professionalism värderas.',
                  roles: ['IT-utvecklare och systemarkitekter', 'Affärskonsulter och projektledare', 'Marknadsförare och produktchefer'],
                  gradient: 'from-blue-600 to-cyan-600',
                  icon: Zap
                },
                {
                  category: 'Traditionell',
                  description: 'Klassisk och pålitlig struktur som fungerar överallt. Passar dig som söker inom traditionella branscher där seriös och beprövad stil uppskattas mer än experimenterande design.',
                  roles: ['Ekonomer och revisorer', 'Jurister och HR-specialister', 'Läkare och vårdpersonal'],
                  gradient: 'from-slate-700 to-slate-600',
                  icon: Shield
                },
                {
                  category: 'Kreativ',
                  description: 'Visuellt stark design som visar personlighet. För dig som arbetar inom kreativa områden där CV:t ska vara en smakprov på din förmåga att skapa något vackert och genomtänkt.',
                  roles: ['Grafiska designers och art directors', 'UX/UI-designers och webbutvecklare', 'Innehållsskapare och copywriters'],
                  gradient: 'from-purple-600 to-pink-600',
                  icon: Sparkles
                }
              ].map((cat, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${cat.gradient} rounded-xl flex items-center justify-center mb-4`}>
                    <cat.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{cat.category}</h3>
                  <p className="text-slate-600 mb-4 text-sm leading-relaxed">{cat.description}</p>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Passar för:</p>
                    <ul className="space-y-1">
                      {cat.roles.map((role, roleIdx) => (
                        <li key={roleIdx} className="text-xs text-slate-600 flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{role}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Template Gallery Section */}
      <section id="exempel" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Alla våra 8 professionella CV-mallar
              </h2>
              <p className="text-lg text-slate-600">
                Välj mellan moderna, traditionella och kreativa designer
              </p>
            </div>

            {/* Category filter */}
            <div className="flex justify-center gap-2 mb-12">
              {[
                { id: 'all', label: 'Alla mallar' },
                { id: 'modern', label: 'Modern' },
                { id: 'traditional', label: 'Traditionell' },
                { id: 'creative', label: 'Kreativ' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Templates grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredTemplates.map((template, idx) => (
                <motion.div
                  key={template.id}
                  className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                >
                  {/* Template preview */}
                  <div className="aspect-[3/4] relative bg-white p-4">
                    <Image
                      src={template.imagePath}
                      alt={`${template.name} CV-mall`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>

                  {/* Template info */}
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 mb-1">{template.name}</h3>
                    <p className="text-xs text-slate-600 mb-3">{template.description}</p>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        template.tier === 'free'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {template.tier === 'free' ? 'Gratis' : 'Premium'}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                        {template.category === 'modern' ? 'Modern' : template.category === 'traditional' ? 'Traditionell' : 'Kreativ'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link
                href="/dashboard/cv-mallar"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
              >
                Börja skapa ditt CV
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ATS Compatibility Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Fungerar med rekryteringssystem
              </h2>
              <p className="text-lg text-slate-600">
                De flesta företag använder system som läser CV:n automatiskt innan någon rekryterare ser dem. Våra mallar är byggda för att passa dessa system perfekt, så din information alltid kommer fram.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Target,
                  title: 'Korrekt struktur',
                  description: 'Rubriker, datum och listor är formaterade så system kan läsa dem rätt. Ingen information försvinner eller tolkas fel.'
                },
                {
                  icon: Zap,
                  title: 'Rätt nyckelord-placering',
                  description: 'Din erfarenhet och kompetens hamnar där systemen förväntar sig att hitta dem. Det ökar chansen att du rankas högt.'
                },
                {
                  icon: Shield,
                  title: 'Läsbar för både system och människor',
                  description: 'Designen ser professionell ut för rekryterare samtidigt som den fungerar tekniskt för automatisk screening.'
                }
              ].map((benefit, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-xl p-6 border border-slate-200"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gratis vs Premium Comparison */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Gratis vs Premium: Vilken CV-mall passar dig?
              </h2>
              <p className="text-lg text-slate-600">
                Börja gratis eller få obegränsad tillgång med Premium
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <motion.div
                className="p-8 bg-slate-50 rounded-2xl border-2 border-slate-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Gratis mallar</h3>
                  <p className="text-4xl font-bold text-slate-900 mb-1">
                    0 kr
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    '2 professionella mallar',
                    'PDF-nedladdning',
                    'ATS-kompatibel struktur',
                    'Grundläggande anpassning',
                    'Fungerar för alla branscher',
                    'Ingen tidsbegränsning',
                    'Inga dolda avgifter'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="w-full block text-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all duration-300"
                >
                  Hämta gratis mall
                </Link>
              </motion.div>

              {/* Premium Plan */}
              <motion.div
                className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-300 relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-full">
                  Mest Populär
                </div>

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Premium-mallar</h3>
                  <p className="text-4xl font-bold text-slate-900 mb-1">
                    149 kr
                    <span className="text-lg font-normal text-slate-600">/månad</span>
                  </p>
                  <p className="text-sm text-slate-600">Ingår i Premium</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    'Alla 8 exklusiva mallar',
                    'PDF och Word-nedladdning',
                    'Avancerad design',
                    'Fullständig anpassning',
                    'Obegränsade nedladdningar',
                    'Prioriterad uppdatering',
                    'Tillgång till nya mallar',
                    'Alla övriga Premium-verktyg'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-900 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/priser"
                  className="w-full block text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                >
                  Uppgradera till Premium
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Vanliga frågor
              </h2>
              <p className="text-lg text-slate-600">
                Svar på de vanligaste frågorna om CV-mallar
              </p>
            </div>

            <div className="space-y-4">
              {faqSchema.mainEntity.map((faq: any, idx: number) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-semibold text-slate-900 pr-4">{faq.name}</span>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-6 pb-4">
                      <p className="text-slate-600 leading-relaxed">{faq.acceptedAnswer.text}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Vad användare säger
              </h2>
              <p className="text-lg text-slate-600">
                Verkliga resultat från jobbsökare som använt våra CV-mallar
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Emma Lindström',
                  role: 'Produktchef',
                  avatar: 'E',
                  quote: 'Gjorde mitt CV i Modern Minimal och fick tre intervjuer samma vecka. Rekryterare kommenterade faktiskt hur professionellt det såg ut. Kan inte tro att det tog under 5 minuter att skapa.',
                  result: '3 intervjuer på en vecka',
                  rating: 5
                },
                {
                  name: 'David Karlsson',
                  role: 'Backend-utvecklare',
                  avatar: 'D',
                  quote: 'Hade gjort mitt CV själv i Word och det såg pinsamt ut. Nordic Professional-mallen fixade allt direkt – struktur, typografi, spacing. Nu känns det som jag skickar in något jag faktiskt kan vara stolt över.',
                  result: 'Nyanställd efter 2 månader',
                  rating: 5
                },
                {
                  name: 'Sara Bergman',
                  role: 'UX-designer',
                  avatar: 'S',
                  quote: 'Som designer var jag skeptisk till mallar, men Creative Minimal är genuint väldesignad. Sparade mig från timmar i InDesign och fungerar perfekt med rekryteringssystem. Rekommenderar starkt.',
                  result: 'Anställd på drömföretaget',
                  rating: 5
                }
              ].map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-600">{testimonial.role}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-slate-700 text-sm mb-4 leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs font-semibold text-green-600">{testimonial.result}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Få ditt professionella CV på 5 minuter
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Sluta slösa timmar på att försöka få Word att se bra ut. Välj en mall som är designad av proffs, ladda upp ditt innehåll och ladda ner direkt. Börja ansöka till jobb med ett CV som faktiskt går igenom.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/dashboard/cv-mallar"
                  className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-slate-50 hover:shadow-2xl transition-all duration-300 inline-flex items-center justify-center gap-2 text-lg"
                >
                  Välj din mall nu
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-6 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Tar 5 minuter från start till färdigt CV</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Fungerar i alla rekryteringssystem</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Gratis att testa, inga kortuppgifter krävs</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
