'use client';

import { ReactNode, useState } from 'react';

/**
 * ConversionSankey — flödesdiagram (Sankey-stil, NVIDIA-look) för funnel-resan.
 *
 * Custom SVG, inget bibliotek. Varje steg är en vertikal nod vars höjd ∝ värde.
 * Mellan stegen flödar ett band (bredd ∝ antal som går vidare); vid varje
 * övergång grenar ett avhopps-band NEDÅT till en grå "hoppade av"-nod. Flödet är
 * bevarande: vidare + avhopp = föregående steg, precis som i en äkta Sankey.
 */
export interface SankeyStage {
  name: string;
  value: number;
  fill: string;
  icon?: ReactNode;
  conversionFromPrev: number;
}

interface Props {
  stages: SankeyStage[];
}

// SVG-koordinatsystem (skalar responsivt via viewBox).
const W = 1000;
const H = 420;
const PAD_TOP = 40;
const PAD_BOTTOM = 130; // plats för avhopps-noder + etiketter under
const NODE_W = 26;
const MIN_NODE_H = 8;
const DROP_NODE_H = 22;

// Mjuk S-kurva mellan två vertikala kanter (x1→x2), band med tjocklek.
function ribbonPath(x1: number, yTop1: number, yBot1: number, x2: number, yTop2: number, yBot2: number): string {
  const cx = (x1 + x2) / 2;
  return [
    `M ${x1} ${yTop1}`,
    `C ${cx} ${yTop1}, ${cx} ${yTop2}, ${x2} ${yTop2}`,
    `L ${x2} ${yBot2}`,
    `C ${cx} ${yBot2}, ${cx} ${yBot1}, ${x1} ${yBot1}`,
    'Z',
  ].join(' ');
}

export default function ConversionSankey({ stages }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  if (stages.length === 0 || (stages[0]?.value ?? 0) === 0) {
    return <div className="py-12 text-center text-sm text-slate-400">Ingen funnel-data</div>;
  }

  const maxVal = stages[0].value;
  const usableH = H - PAD_TOP - PAD_BOTTOM;
  const axisMid = PAD_TOP + usableH / 2; // noderna centreras kring denna linje
  const colGap = (W - NODE_W) / (stages.length - 1);

  // Geometri per nod (centrerad vertikalt).
  const nodes = stages.map((s, i) => {
    const h = Math.max((s.value / maxVal) * usableH, MIN_NODE_H);
    const x = i * colGap;
    return { ...s, i, x, h, top: axisMid - h / 2, bot: axisMid + h / 2, scale: h / Math.max(s.value, 1) };
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px]" style={{ height: 'auto' }}>
        <defs>
          {nodes.slice(0, -1).map((n, i) => {
            const next = nodes[i + 1];
            return (
              <linearGradient key={i} id={`flow-${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={n.fill} stopOpacity={0.55} />
                <stop offset="100%" stopColor={next.fill} stopOpacity={0.55} />
              </linearGradient>
            );
          })}
        </defs>

        {/* Flödesband mellan stegen + avhopps-grenar */}
        {nodes.slice(0, -1).map((n, i) => {
          const next = nodes[i + 1];
          const dimmed = hover !== null && hover !== i;

          // Huvudflöde: lämnar n med höjd = next.value-skala, ansluter till nästa nodens fulla höjd.
          const carryH = next.value * n.scale; // hur stor del av n som går vidare (i n:s skala)
          const x1 = n.x + NODE_W;
          const x2 = next.x;
          // Huvudflödet utgår från övre delen av n (top-aligned mot kvarvarande).
          const mainTop1 = n.top;
          const mainBot1 = n.top + carryH;
          const mainTop2 = next.top;
          const mainBot2 = next.bot;

          // Avhopp: resten av n, grenar nedåt till en grå nod under axeln.
          const dropped = n.value - next.value;
          const dropTop1 = mainBot1;
          const dropBot1 = n.bot;
          const dropNodeX = (x1 + x2) / 2;
          const dropY = H - PAD_BOTTOM + 36;

          return (
            <g key={i} opacity={dimmed ? 0.25 : 1} style={{ transition: 'opacity 0.2s' }}
               onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {/* Huvudflöde */}
              <path d={ribbonPath(x1, mainTop1, mainBot1, x2, mainTop2, mainBot2)} fill={`url(#flow-${i})`} />

              {/* Avhopps-gren (grå, nedåt) */}
              {dropped > 0 && (
                <>
                  <path
                    d={ribbonPath(x1, dropTop1, dropBot1, dropNodeX - 30, dropY, dropY + Math.max(dropped * n.scale, 6))}
                    fill="#cbd5e1"
                    fillOpacity={0.5}
                  />
                  <text x={dropNodeX - 24} y={dropY - 6} className="fill-slate-400" style={{ fontSize: 12, fontWeight: 600 }}>
                    −{dropped}
                  </text>
                  <text x={dropNodeX - 24} y={dropY + 10} className="fill-slate-400" style={{ fontSize: 11 }}>
                    hoppade av
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* Noder + etiketter */}
        {nodes.map((n) => (
          <g key={n.i}>
            <rect x={n.x} y={n.top} width={NODE_W} height={n.h} rx={4} fill={n.fill} />
            {/* Etikett ovanför noden */}
            <text x={n.x + NODE_W / 2} y={n.top - 22} textAnchor="middle" className="fill-slate-700" style={{ fontSize: 13, fontWeight: 600 }}>
              {n.name}
            </text>
            <text x={n.x + NODE_W / 2} y={n.top - 6} textAnchor="middle" className="fill-slate-900" style={{ fontSize: 15, fontWeight: 700 }}>
              {n.value}
            </text>
            {/* Konvertering från föregående, under noden */}
            {n.i > 0 && (
              <text x={n.x + NODE_W / 2} y={n.bot + 18} textAnchor="middle" style={{ fontSize: 11, fontWeight: 600, fill: n.fill }}>
                {n.conversionFromPrev.toFixed(0)}%
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
