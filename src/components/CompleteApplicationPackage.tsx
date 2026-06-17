import Link from 'next/link'
import { FileText, Mail, CheckCircle2, ArrowRight, Wand2 } from 'lucide-react'

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

  // Skydd mot trasiga interna länkar (t.ex. /personligt-brev-exempel/undefined).
  // Utan giltig slug renderar vi inget — bättre än att länka till en 404.
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return null

  return (
    <section className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
          Komplett ansökan
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          Skapa hela paketet
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
          Ett starkt {isCV ? 'CV' : 'personligt brev'} ökar dina chanser. Men
          utan {isCV ? 'ett skräddarsytt personligt brev' : 'ett ATS-optimerat CV'}{' '}
          missar du intervjuer. Se hur du bygger en komplett ansökan för{' '}
          {yrke.toLowerCase()}.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
        {/* CV Card */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 md:p-7 transition-all ${
            isCV
              ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-rose-50'
              : 'border-orange-200/60 bg-white hover:border-orange-300 hover:shadow-lg'
          }`}
          style={{
            boxShadow: isCV
              ? '0 12px 32px -12px rgba(249, 115, 22, 0.25)'
              : '0 8px 24px -12px rgba(249, 115, 22, 0.12)',
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background:
                'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
              opacity: isCV ? 1 : 0.5,
            }}
          />

          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: isCV
                  ? 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)'
                  : '#FFF7ED',
                boxShadow: isCV ? '0 6px 14px -4px rgba(220, 38, 38, 0.35)' : 'none',
              }}
            >
              <FileText
                className={`w-6 h-6 ${isCV ? 'text-white' : 'text-orange-700'}`}
                strokeWidth={2.5}
              />
            </div>
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-slate-900 leading-tight">
                CV-exempel
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{yrke}</p>
            </div>
          </div>

          {isCV ? (
            <>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold uppercase tracking-[0.12em] mb-4">
                <CheckCircle2 className="w-3 h-3" strokeWidth={3} />
                Du är här
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0" strokeWidth={2.5} />
                  ATS-optimerad struktur
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0" strokeWidth={2.5} />
                  Branschspecifika nyckelord
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0" strokeWidth={2.5} />
                  Kvantifierade resultat
                </li>
              </ul>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Se hur du strukturerar ett ATS-optimerat CV med rätt nyckelord
                och kvantifierade resultat för {yrke.toLowerCase()}.
              </p>
              <Link href={`/cv-exempel/${slug}`}>
                <button
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl text-white font-bold hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                    boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
                  }}
                >
                  <FileText className="w-4 h-4" strokeWidth={2.5} />
                  Se CV-exempel
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2.5}
                  />
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Personligt Brev Card */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 md:p-7 transition-all ${
            !isCV
              ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-rose-50'
              : 'border-orange-200/60 bg-white hover:border-orange-300 hover:shadow-lg'
          }`}
          style={{
            boxShadow: !isCV
              ? '0 12px 32px -12px rgba(249, 115, 22, 0.25)'
              : '0 8px 24px -12px rgba(249, 115, 22, 0.12)',
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background:
                'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
              opacity: !isCV ? 1 : 0.5,
            }}
          />

          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: !isCV
                  ? 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)'
                  : '#FFF7ED',
                boxShadow: !isCV ? '0 6px 14px -4px rgba(220, 38, 38, 0.35)' : 'none',
              }}
            >
              <Mail
                className={`w-6 h-6 ${!isCV ? 'text-white' : 'text-orange-700'}`}
                strokeWidth={2.5}
              />
            </div>
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-slate-900 leading-tight">
                Personligt brev
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{yrke}</p>
            </div>
          </div>

          {!isCV ? (
            <>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold uppercase tracking-[0.12em] mb-4">
                <CheckCircle2 className="w-3 h-3" strokeWidth={3} />
                Du är här
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0" strokeWidth={2.5} />
                  Engagerande inledning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0" strokeWidth={2.5} />
                  Rätt tonalitet och längd
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0" strokeWidth={2.5} />
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
                <button
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl text-white font-bold hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                    boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
                  }}
                >
                  <Mail className="w-4 h-4" strokeWidth={2.5} />
                  Se personligt brev
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2.5}
                  />
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-2">
        <p className="text-sm text-slate-500 mb-3">Redo att skapa din egen ansökan?</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard/skapa-cv">
            <button
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl text-white font-bold hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
              }}
            >
              <Wand2 className="w-4 h-4" strokeWidth={2.5} />
              Skapa CV
            </button>
          </Link>
          <Link href="/dashboard/skapa-brev">
            <button className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl border-2 border-orange-300 bg-white text-orange-700 font-bold hover:bg-orange-50 transition-all flex items-center justify-center gap-2">
              <Wand2 className="w-4 h-4" strokeWidth={2.5} />
              Skapa personligt brev
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
