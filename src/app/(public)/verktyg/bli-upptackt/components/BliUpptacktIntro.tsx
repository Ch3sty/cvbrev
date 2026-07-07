/**
 * Liten "Vad är det här?"-ruta direkt efter hero. Förklarar hela konceptet i
 * klarspråk för en förstagångsbesökare innan sidan börjar sälja.
 */
export default function BliUpptacktIntro() {
  return (
    <section className="pt-2">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="max-w-[820px] mx-auto text-center bg-white border border-orange-100 rounded-[20px] px-6 py-5"
          style={{ boxShadow: '0 8px 28px -18px rgba(249,115,22,.25)' }}
        >
          <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-orange-700">Vad är det här?</span>
          <p className="text-[15.5px] text-slate-600 leading-relaxed mt-2">
            Du lägger in ditt CV på jobbcoach.ai, gör testerna om du vill, och slår sedan på synlighet. Då kan rekryterare hitta din profil när de letar efter någon med precis din kompetens, utan att du behöver skicka en enda ansökan.
          </p>
        </div>
      </div>
    </section>
  )
}
