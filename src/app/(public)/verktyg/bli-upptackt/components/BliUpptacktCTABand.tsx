import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { GRAD } from './shared'

export default function BliUpptacktCTABand() {
  return (
    <section className="py-14 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-[32px] px-6 py-12 sm:px-12 text-center text-white"
          style={{ background: GRAD }}
        >
          <div
            aria-hidden="true"
            className="absolute -top-10 -right-8 w-56 h-56 rounded-full"
            style={{ background: 'rgba(255,255,255,.14)', filter: 'blur(34px)' }}
          />
          <h2 className="relative text-[26px] sm:text-4xl font-black tracking-tight mb-3">
            Redo att bli hittad i stället för att leta?
          </h2>
          <p className="relative text-base text-white/90 max-w-[54ch] mx-auto mb-6">
            Skapa din profil på några minuter. Du väljer själv när du vill synas, och du väljer alltid vem du svarar.
          </p>
          <Link
            href="/register"
            className="relative group inline-flex items-center gap-2 bg-white text-orange-700 font-black text-base rounded-2xl px-7 py-3.5 hover:scale-[1.02] transition-transform"
          >
            Skapa min profil gratis
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
          </Link>
          <div className="relative mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[13px] text-white/90">
            <span>Anonym tills du tackar ja</span>
            <span aria-hidden="true">·</span>
            <span>Klart på minuter</span>
            <span aria-hidden="true">·</span>
            <span>Stäng av när du vill</span>
          </div>
        </div>
      </div>
    </section>
  )
}
