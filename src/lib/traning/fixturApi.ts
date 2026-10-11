// src/lib/traning/fixturApi.ts
// =============================================================================
// Ett PassApi mot fixturer, för förhandsvisningen för utvecklare
// (/dashboard/tester/forhandsvisning-pass, våg 3b). Frågorna är riktiga
// V7-frågor ur banken, blandade och dömda på servern när sidan byggdes;
// här finns bara det klienten behöver för att spela upp ett pass: var rätt
// svar står (visat index), regeln och misstaget per visat alternativ.
//
// Används aldrig i produktionen: förhandsvisningen finns bara med
// NODE_ENV=development eller TRANING_FORHANDSVISNING=1.
// =============================================================================

import type { Aterkoppling, Avslut, PassApi, Sessionsvy, Traningsstatus } from './klient';

export interface FixturFacit {
  rattVisat: number;
  regel: string;
  /** Misstaget per visat index, null för rätt svar. */
  misstag: (string | null)[];
  family: string | null;
}

export interface Fixtur {
  /** Sessionen när passet startar (eller där förhandsvisningen börjar). */
  vy: Sessionsvy;
  facit: Record<string, FixturFacit>;
  /** Avslutet med exempeltalen. Rätt, antal och tempo räknas om ur svaren. */
  avslut: Avslut;
  status: Traningsstatus;
  /** Fördröjning per anrop i ms, så att väntlägena syns. */
  fordrojning?: number;
}

const vanta = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function fixturApi(f: Fixtur): PassApi {
  let vy: Sessionsvy = structuredClone(f.vy);
  const ms = f.fordrojning ?? 120;
  const antalNya = vy.typ === 'matning' ? Math.max(1, vy.antal - vy.smakprov) : vy.antal;

  function aterkoppling(qid: string, vald: number | null, vetInte: boolean, tid: number): Aterkoppling {
    const fa = f.facit[qid];
    const correct = !vetInte && vald === fa.rattVisat;
    return {
      correct,
      vetInte,
      rattVisat: fa.rattVisat,
      regel: fa.regel,
      misstag: correct || vetInte || vald == null ? null : fa.misstag[vald] ?? null,
      tid_s: tid,
    };
  }

  function avslutadVy(): Sessionsvy {
    const per = new Map(vy.besvarade.map((b) => [b.q_id, b]));
    return {
      ...vy,
      avslutad: true,
      aktuell: null,
      aterkoppling: Object.fromEntries(
        vy.fragor
          .filter((q) => per.has(q.id))
          .map((q) => {
            const b = per.get(q.id)!;
            return [q.id, aterkoppling(q.id, b.valdVisat, b.vetInte, b.tid_s)];
          })
      ),
      genomgang: vy.fragor.map((q) => {
        const fa = f.facit[q.id];
        const b = per.get(q.id);
        const fel = b && b.valdVisat != null && b.valdVisat !== fa.rattVisat;
        return { ...q, rattVisat: fa.rattVisat, family: fa.family, misstag: fel ? fa.misstag[b!.valdVisat!] ?? null : null };
      }),
    };
  }

  return {
    async skapa() {
      await vanta(ms);
      return { ok: true, session: structuredClone(vy) };
    },
    async svara(inp) {
      await vanta(ms);
      const fa = f.facit[inp.questionId];
      if (!fa) return { ok: false, status: 400, fel: 'fel_fraga' };
      if (vy.besvarade.some((b) => b.q_id === inp.questionId)) return { ok: false, status: 409, fel: 'redan_besvarad' };
      const vetInte = inp.vetInte === true;
      const tidenUte = inp.tidenUte === true;
      const vald = vetInte || tidenUte ? null : inp.selectedIndex;
      vy = {
        ...vy,
        besvarade: [...vy.besvarade, { q_id: inp.questionId, valdVisat: vald, vetInte, tidenUte, tid_s: inp.timeSpent }],
      };
      const at = aterkoppling(inp.questionId, vald, vetInte, inp.timeSpent);
      const visas = vy.typ === 'pass' || vy.typ === 'riktat';
      if (visas) vy = { ...vy, aterkoppling: { ...(vy.aterkoppling ?? {}), [inp.questionId]: at } };
      const besvarade = vy.besvarade.length;
      return { ok: true, aterkoppling: visas ? at : null, nasta: null, besvarade, antal: vy.antal, klar: besvarade >= antalNya };
    },
    async slutfor() {
      await vanta(ms * 3);
      const klar = avslutadVy();
      const svar = klar.besvarade;
      const ratt = svar.filter((b) => klar.aterkoppling?.[b.q_id]?.correct).length + (vy.typ === 'matning' ? vy.smakprov : 0);
      const over = svar.filter((b) => b.tid_s > vy.budget_s).length;
      const tid_s = svar.reduce((s, b) => s + b.tid_s, 0);
      // Passets familjer och en nivå som följer svaren, så att rubriken går
      // ihop med talen när förhandsvisningen klickas igenom. Motorns riktiga
      // formel (niva.ts) körs inte här; det här är bara en fixtur.
      const perFamilj = new Map<string, { ratt: number; antal: number }>();
      for (const b of svar) {
        const fam = f.facit[b.q_id]?.family;
        if (!fam) continue;
        const x = perFamilj.get(fam) ?? { ratt: 0, antal: 0 };
        x.antal += 1;
        if (klar.aterkoppling?.[b.q_id]?.correct) x.ratt += 1;
        perFamilj.set(fam, x);
      }
      const passet = [...perFamilj.entries()].map(([family, x]) => ({
        family,
        ratt: x.ratt,
        antal: x.antal,
        andel: x.antal ? x.ratt / x.antal : 0,
        ratt_men_langsamma: 0,
      }));
      const arPass = vy.typ === 'pass' || vy.typ === 'general';
      const fore = f.avslut.niva_fore;
      const delta = svar.length ? Math.max(-0.5, Math.min(0.5, Math.round((ratt / svar.length - 0.6) * 10) / 10)) : 0;
      const avslut: Avslut = {
        ...f.avslut,
        ratt: Math.min(ratt, f.avslut.antal),
        over_tid: Math.min(over, f.avslut.antal),
        snitt_s: svar.length ? Math.round(tid_s / svar.length) : f.avslut.snitt_s,
        tid_s,
        niva_efter: arPass && fore != null ? Math.round((fore + delta) * 10) / 10 : f.avslut.niva_efter,
        familjer: arPass ? { ...f.avslut.familjer, passet } : f.avslut.familjer,
      };
      vy = klar;
      return { ok: true, avslut };
    },
    async session() {
      await vanta(ms);
      return structuredClone(vy);
    },
    async status() {
      await vanta(ms);
      return f.status;
    },
  };
}
