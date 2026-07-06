'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Layers, Users, CalendarClock } from 'lucide-react';

/**
 * "Siffror som tål följdfrågor": testintegriteten som förtroendesektion.
 * Testdata är vår enda riktiga differentiator mot LinkedIn, och en testvan
 * rekryterare dömer ut allt om en siffra inte tål en följdfråga. Här är
 * ärligheten själva säljargumentet.
 */
const POINTS = [
  {
    icon: ShieldCheck,
    title: 'Första försöket räknas',
    body: 'Verifierat resultat är kandidatens första slutförda försök på varje nivå. Aldrig det bästa av tjugo, för då mäter man tur, inte förmåga.',
  },
  {
    icon: Layers,
    title: 'Nivån syns alltid',
    body: 'Topp 10 % på expertnivån och topp 10 % på grundnivån är olika saker. Badgen säger alltid vilken nivå siffran gäller.',
  },
  {
    icon: Users,
    title: 'Öppen normgrupp',
    body: '"Topp 8 % av 340 testade" betyder exakt det: jämfört med alla som gjort samma test hos oss, och du ser hur många de är.',
  },
  {
    icon: CalendarClock,
    title: 'Färskhet framgår',
    body: 'Vi visar när testet gjordes. Resultat äldre än två år flaggas, så du vet om det är dags att be kandidaten testa igen.',
  },
];

export default function RekryterareTestIntegritet() {
  return (
    <section className="relative py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Verifierade resultat
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Siffror som tål följdfrågor
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Ett testresultat är bara värt något om det håller för granskning.
            Så här räknar vi, öppet och utan genvägar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto">
          {POINTS.map((p, idx) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3"
                style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
              >
                <p.icon className="w-5 h-5" strokeWidth={2.25} />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-1.5">{p.title}</h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-[15px] font-semibold text-slate-800 mt-10">
          Vi visar hellre en ärlig siffra än en imponerande.
        </p>
      </div>
    </section>
  );
}
