'use client';

/**
 * Arket på Analys-sidan (CV-rummet steg 4, skissen Analys): hennes CV i sin
 * mall, med numrerade markeringar där fynden sitter.
 *
 * CV:t ritas med samma HTML och samma delade minne som Ditt CV och Mallar
 * (useEgenMall, egnaMallar.ts); tills det är hämtat står katalogbilden, så
 * arket är aldrig tomt. När iframen laddat mäts avsnitten med
 * avsnittsmätningen (Dokument/matning.ts). En roll pekas ut genom att leta
 * upp rolltiteln i erfarenhetsavsnittet; går den inte att hitta markeras
 * hela avsnittet. Markeringar under första sidan ritas inte (arket visar
 * sida ett).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MallKort } from '@/lib/cv/mallar/kontrakt';
import { A4_KVOT, matDokument, medSkala, type Matning } from '@/components/cv/Dokument/matning';
import { useEgenMall, type EgetCv } from '@/components/cv/Dokument/egnaMallar';

export interface ArkMarkering {
  nr: number;
  /** Avsnittet; "fler" (projekt, certifikat) markeras inte. */
  sektion: 'profil' | 'erfarenhet' | 'kompetenser' | 'utbildning' | 'fler';
  roll?: { titel: string; foretag: string };
  /** Första fyndet: koppar och puls. */
  nu?: boolean;
}

interface Ruta {
  nr: number;
  nu: boolean;
  x: number;
  y: number;
  b: number;
  h: number;
}

/** Rollens övre kant (i bredder) i erfarenhetsavsnittet, eller null. */
function rollensTopp(doc: Document, titel: string, fran: number, till: number, efter: number): number | null {
  const t = titel.trim().toLowerCase();
  if (t.length < 2) return null;
  const rr = doc.documentElement.getBoundingClientRect();
  const bredd = rr.width || 1;
  // Bäst: ett element som börjar med titeln ("Projektledare" ska inte träffa
  // "Senior Projektledare"). Annars ett som innehåller den.
  let borjar: number | null = null;
  let innehaller: number | null = null;
  for (const el of Array.from(doc.body?.querySelectorAll<HTMLElement>('*') ?? [])) {
    if (el.children.length > 3) continue;
    const txt = (el.textContent ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (!txt.includes(t) || txt.length > t.length + 120) continue;
    const r = el.getBoundingClientRect();
    if (r.height === 0) continue;
    const y = (r.top - rr.top) / bredd;
    if (y < fran - 0.005 || y > till || y <= efter) continue;
    if (txt.startsWith(t)) {
      if (borjar === null || y < borjar) borjar = y;
    } else if (innehaller === null || y < innehaller) {
      innehaller = y;
    }
  }
  return borjar ?? innehaller;
}

function rutorUr(doc: Document, m: Matning, markeringar: ArkMarkering[]): Ruta[] {
  const ut: Ruta[] = [];
  const avsnitt = (s: ArkMarkering['sektion']) => m.rubriker.find((r) => (r.sektion as string) === s) ?? null;

  // Rollerna: i ordning nedåt i avsnittet, var och en till nästa roll.
  const erf = avsnitt('erfarenhet');
  const roller = markeringar.filter((x) => x.sektion === 'erfarenhet' && x.roll?.titel);
  const toppar = new Map<number, number>();
  if (erf) {
    const fran = erf.avsnitt.y;
    const till = erf.avsnitt.y + erf.avsnitt.h;
    let efter = fran - 0.01;
    const hittade: { nr: number; y: number }[] = [];
    for (const r of roller) {
      const y = rollensTopp(doc, r.roll!.titel, fran, till, -1);
      if (y !== null) hittade.push({ nr: r.nr, y });
    }
    hittade.sort((a, b) => a.y - b.y);
    for (const h of hittade) {
      if (h.y <= efter) continue;
      toppar.set(h.nr, h.y);
      efter = h.y;
    }
  }
  // Alla rolltoppar i avsnittet (också de utan fynd) avgränsar rutorna.
  const allaToppar = [...toppar.values()].sort((a, b) => a - b);

  for (const x of markeringar) {
    const a = avsnitt(x.sektion);
    if (!a) continue;
    let box = { x: a.x, y: a.y, b: Math.max(a.b, a.avsnitt.b), h: a.avsnitt.y + a.avsnitt.h - a.y };
    if (x.sektion === 'erfarenhet' && toppar.has(x.nr)) {
      const y = toppar.get(x.nr)!;
      const nasta = allaToppar.find((t) => t > y + 0.005);
      const slut = nasta ?? a.avsnitt.y + a.avsnitt.h;
      box = { x: a.avsnitt.x, y: y - 0.006, b: Math.max(a.b, a.avsnitt.b), h: Math.max(0.03, slut - y - 0.012) };
    }
    if (box.y >= A4_KVOT - 0.02) continue;
    box.h = Math.min(box.h, A4_KVOT - box.y - 0.01);
    ut.push({ nr: x.nr, nu: Boolean(x.nu), ...box });
  }
  return ut;
}

export default function AnalysArk({
  mall,
  cv,
  markeringar,
  alt,
}: {
  mall: MallKort;
  cv: EgetCv | null;
  markeringar: ArkMarkering[];
  alt: string;
}) {
  const html = useEgenMall(cv, mall.id, true);
  const ramRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [laddad, setLaddad] = useState(false);
  const [bredd, setBredd] = useState(0);
  const [rutor, setRutor] = useState<Ruta[]>([]);

  useEffect(() => setLaddad(false), [html]);

  const mat = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.body) return;
    try {
      setRutor(rutorUr(doc, matDokument(doc), markeringar));
    } catch {
      setRutor([]);
    }
  }, [markeringar]);

  useEffect(() => {
    const el = ramRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      setBredd(el.clientWidth);
      if (laddad) mat();
    });
    ro.observe(el);
    setBredd(el.clientWidth);
    return () => ro.disconnect();
  }, [laddad, mat]);

  return (
    <div className="relative">
      <div ref={ramRef} className="cv4-ark" role="img" aria-label={alt} data-egen={html && laddad ? '' : undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mall.bild.stor} alt="" decoding="async" />
        {html ? (
          <iframe
            ref={frameRef}
            srcDoc={medSkala(html)}
            title=""
            tabIndex={-1}
            scrolling="no"
            aria-hidden="true"
            onLoad={() => {
              setLaddad(true);
              // Mallens typsnitt och zoom sätter sig efter load.
              window.setTimeout(mat, 80);
              window.setTimeout(mat, 400);
            }}
          />
        ) : null}
        {laddad && bredd > 0
          ? rutor.map((r) => (
              <span
                key={`r${r.nr}`}
                className="cv4-ruta"
                data-nu={r.nu ? '' : undefined}
                aria-hidden="true"
                style={{ left: r.x * bredd - 6, top: r.y * bredd - 4, width: r.b * bredd + 12, height: r.h * bredd + 8 }}
              />
            ))
          : null}
      </div>
      {laddad && bredd > 0
        ? rutor.map((r) => (
            <span
              key={`n${r.nr}`}
              className="cv4-nal"
              data-nu={r.nu ? '' : undefined}
              aria-hidden="true"
              style={{ left: 0, top: r.y * bredd + Math.min(18, (r.h * bredd) / 2) - 14 }}
            >
              {r.nu ? <span className="cv4-halo" /> : null}
              {r.nr}
            </span>
          ))
        : null}
    </div>
  );
}
