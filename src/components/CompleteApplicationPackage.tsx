import Link from 'next/link'
import { FileText, Mail, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

interface CompleteApplicationPackageProps {
  currentType: 'cv' | 'personligt-brev'
  yrke: string
  slug: string
}

/**
 * CompleteApplicationPackage - Sektion som visar båda exemplen
 *
 * Placeras efter FAQ, före footer.
 * Desktop: 2-kolumns grid
 * Mobil: Stacked layout
 */
export default function CompleteApplicationPackage({
  currentType,
  yrke,
  slug,
}: CompleteApplicationPackageProps) {
  const isCV = currentType === 'cv'

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Skapa ett komplett ansökningspaket
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Ett starkt {isCV ? 'CV' : 'personligt brev'} ökar dina chanser. Men utan{' '}
              {isCV ? 'ett skräddarsytt personligt brev' : 'ett ATS-optimerat CV'} missar du
              möjligheter. Se hur du skapar en komplett ansökan för {yrke.toLowerCase()}.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* CV Card */}
            <div
              className={`rounded-2xl p-6 md:p-8 border-2 transition-all ${
                isCV
                  ? 'bg-gradient-to-br from-cyan-50 to-indigo-50 border-cyan-200'
                  : 'bg-white border-slate-200 hover:border-cyan-300 hover:shadow-lg'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isCV
                      ? 'bg-gradient-to-br from-cyan-600 to-indigo-600'
                      : 'bg-slate-100'
                  }`}
                >
                  <FileText className={`w-6 h-6 ${isCV ? 'text-white' : 'text-slate-600'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900">CV-exempel</h3>
                  <p className="text-sm text-slate-500">{yrke}</p>
                </div>
              </div>

              {isCV ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Du är här</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                      ATS-optimerad struktur
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                      Branschspecifika nyckelord
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                      Kvantifierade resultat
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Se hur du strukturerar ett ATS-optimerat CV med rätt nyckelord och
                    kvantifierade resultat för {yrke.toLowerCase()}.
                  </p>
                  <Link href={`/cv-exempel/${slug}`}>
                    <button className="w-full px-4 py-3 min-h-[48px] bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 touch-manipulation focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2">
                      <FileText className="w-4 h-4" />
                      Se CV-exempel
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Personligt Brev Card */}
            <div
              className={`rounded-2xl p-6 md:p-8 border-2 transition-all ${
                !isCV
                  ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
                  : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-lg'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    !isCV
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                      : 'bg-slate-100'
                  }`}
                >
                  <Mail className={`w-6 h-6 ${!isCV ? 'text-white' : 'text-slate-600'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900">Personligt brev</h3>
                  <p className="text-sm text-slate-500">{yrke}</p>
                </div>
              </div>

              {!isCV ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Du är här</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      Engagerande inledning
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      Rätt tonalitet och längd
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      Stark avslutning
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Se hur du skriver ett övertygande personligt brev som kompletterar
                    ditt CV och får dig till intervju.
                  </p>
                  <Link href={`/personligt-brev-exempel/${slug}`}>
                    <button className="w-full px-4 py-3 min-h-[48px] bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 touch-manipulation focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                      <Mail className="w-4 h-4" />
                      Se personligt brev
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 md:mt-12 text-center">
            <p className="text-sm text-slate-500 mb-4">
              Redo att skapa din egen ansökan?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/cv-mallar">
                <button className="px-6 py-3 min-h-[48px] bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 touch-manipulation">
                  <Sparkles className="w-4 h-4" />
                  Skapa CV
                </button>
              </Link>
              <Link href="/dashboard/skapa-brev">
                <button className="px-6 py-3 min-h-[48px] bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 touch-manipulation">
                  <Sparkles className="w-4 h-4" />
                  Skapa personligt brev
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
