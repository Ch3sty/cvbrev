'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, FileText, Sparkles } from 'lucide-react'

import PremiumNavbar from '@/components/PremiumNavbar'
import HeroWithSEOIntro from './HeroWithSEOIntro'
import VarforDetFungerar from './VarforDetFungerar'
import TipsSection from './TipsSection'
import FAQSection from './FAQSection'

// SEO: Lazy-load InteractiveCVPreview för bättre Page Speed (client-only, tungt)
const InteractiveCVPreview = dynamic(
  () => import('./InteractiveCVPreview'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl border-2 border-slate-200 p-8 shadow-lg animate-pulse">
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }
)

interface CVExampleData {
  yrke: string
  sokvolym: number
  intro: string
  seoIntro: string
  exempelCV: any
  varforDetFungerar: Array<{
    rubrik: string
    text: string
  }>
  tips: Array<{
    rubrik: string
    text: string
  }>
  faq: Array<{
    fraga: string
    svar: string
  }>
  relaterade: Array<{
    yrke: string
    slug: string
  }>
  kategori: string
}

interface CVExempelPageProps {
  data: CVExampleData
}

export default function CVExempelPage({ data }: CVExempelPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <PremiumNavbar />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-cyan-600 transition-colors">
            Hem
          </Link>
          <span>/</span>
          <Link href="/cv-exempel" className="hover:text-cyan-600 transition-colors">
            CV-exempel
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{data.yrke}</span>
        </nav>
      </div>

      {/* Hero with SEO Intro - ALLTID SYNLIG */}
      <HeroWithSEOIntro
        yrke={data.yrke}
        intro={data.intro}
        seoIntro={data.seoIntro}
      />

      {/* Interaktiv CV Preview - Lazy loaded */}
      <section id="preview" className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Se hur CV:t ser ut
              </h2>
              <p className="text-lg text-slate-600">
                Välj mellan olika mallar och typsnitt för att hitta din perfekta stil
              </p>
            </div>

            <InteractiveCVPreview
              exempelCV={data.exempelCV}
              yrke={data.yrke}
            />
          </div>
        </div>
      </section>

      {/* Varför det fungerar - ALLTID SYNLIGT */}
      <VarforDetFungerar
        items={data.varforDetFungerar}
        yrke={data.yrke}
      />

      {/* Tips - Accordion */}
      <TipsSection
        tips={data.tips}
        yrke={data.yrke}
      />

      {/* FAQ - Accordion med Schema.org */}
      <FAQSection
        faq={data.faq}
        yrke={data.yrke}
      />

      {/* Relaterade Resurser */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Relaterade CV-exempel */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
                Relaterade CV-exempel
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.relaterade.map((rel, idx) => (
                  <Link
                    key={idx}
                    href={`/cv-exempel/${rel.slug}`}
                    className="group bg-gradient-to-br from-cyan-50 to-indigo-50 rounded-xl p-6 border-2 border-transparent hover:border-cyan-600 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg">
                        {rel.yrke}
                      </h3>
                    </div>
                    <p className="text-slate-600 text-sm">
                      Se professionellt CV-exempel för {rel.yrke.toLowerCase()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Användbara verktyg */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
                Skapa ditt eget CV
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  href="/dashboard/cv-mallar"
                  className="group bg-white rounded-xl p-8 border-2 border-slate-200 hover:border-cyan-600 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors">
                        CV-mallar
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        Ladda ner professionella, ATS-optimerade CV-mallar och anpassa efter dina behov
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/skapa-cv"
                  className="group bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white mb-2">
                        Skapa CV med AI
                      </h3>
                      <p className="text-white/90 leading-relaxed">
                        Låt vår AI hjälpa dig skapa ett skräddarsytt, professionellt CV på några minuter
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-cyan-50 via-white to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Redo att skapa ditt CV?
            </h2>
            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
              Använd våra professionella mallar eller låt AI:n hjälpa dig att skapa ett CV som sticker ut
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/cv-mallar">
                <button className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  Ladda ner CV-mallar
                </button>
              </Link>
              <Link href="/dashboard/skapa-cv">
                <button className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl border-2 border-slate-200 hover:border-cyan-600 transition-all flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Skapa med AI
                </button>
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-6">
              Gratis att börja • ATS-optimerat • Professionellt
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
