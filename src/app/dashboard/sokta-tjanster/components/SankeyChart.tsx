// Sankey-diagram över hela sökprocessen, byggt direkt från utfallsklasserna
// i statistik-RPC:n. Ren SVG utan bibliotek: fyra kolumner, flödesbredd
// proportionell mot antal, direktetiketter med vit halo på varje nod.
//
// Färgroller (validerade mot CVD med dataviz-skillens skript):
// orange = sökta/pågående, blå = intervju, grön = erbjudande/ja,
// slate = neutralt utfall (avslag, tackade nej). Identitet bärs aldrig av
// färg ensam: varje nod har namn + antal.

import type { ApplicationStats } from '@/lib/applications/status';

interface SankeyChartProps {
  stats: ApplicationStats;
}

interface SankeyNode {
  id: string;
  label: string;
  column: number;
  value: number;
  color: string;
  // Beräknas vid layout:
  y?: number;
  height?: number;
  outOffset?: number;
  inOffset?: number;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

const COLOR = {
  applied: '#EA580C',
  interview: '#2563EB',
  offer: '#059669',
  accepted: '#047857',
  waiting: '#FDBA74',
  neutral: '#64748B',
};

function outcomeCount(stats: ApplicationStats, outcome: string): number {
  return stats.byOutcome.find((o) => o.outcome === outcome)?.applications ?? 0;
}

export default function SankeyChart({ stats }: SankeyChartProps) {
  const accepted = outcomeCount(stats, 'accepted');
  const declined = outcomeCount(stats, 'declined');
  const offerPending = outcomeCount(stats, 'offer_pending');
  const rejectedAfterInterview = outcomeCount(stats, 'rejected_after_interview');
  const rejectedNoInterview = outcomeCount(stats, 'rejected_no_interview');
  const inInterview = outcomeCount(stats, 'in_interview');
  const awaiting = outcomeCount(stats, 'awaiting');

  const offerTotal = accepted + declined + offerPending;
  const interviewTotal = offerTotal + rejectedAfterInterview + inInterview;
  const total = stats.totalApplications;

  if (total === 0) return null;

  const nodes: SankeyNode[] = [
    { id: 'sokta', label: 'Sökta', column: 0, value: total, color: COLOR.applied },
    { id: 'intervju', label: 'Intervju', column: 1, value: interviewTotal, color: COLOR.interview },
    { id: 'avslag', label: 'Avslag', column: 1, value: rejectedNoInterview, color: COLOR.neutral },
    { id: 'vantar-svar', label: 'Väntar svar', column: 1, value: awaiting, color: COLOR.waiting },
    { id: 'erbjudande', label: 'Erbjudande', column: 2, value: offerTotal, color: COLOR.offer },
    { id: 'avslag-efter', label: 'Avslag efter intervju', column: 2, value: rejectedAfterInterview, color: COLOR.neutral },
    { id: 'pagaende', label: 'Pågående process', column: 2, value: inInterview, color: COLOR.waiting },
    { id: 'tackade-ja', label: 'Tackade ja', column: 3, value: accepted, color: COLOR.accepted },
    { id: 'tackade-nej', label: 'Tackade nej', column: 3, value: declined, color: COLOR.neutral },
    { id: 'vantar-besked', label: 'Väntar besked', column: 3, value: offerPending, color: COLOR.waiting },
  ].filter((n) => n.value > 0);

  const links: SankeyLink[] = [
    { source: 'sokta', target: 'intervju', value: interviewTotal },
    { source: 'sokta', target: 'avslag', value: rejectedNoInterview },
    { source: 'sokta', target: 'vantar-svar', value: awaiting },
    { source: 'intervju', target: 'erbjudande', value: offerTotal },
    { source: 'intervju', target: 'avslag-efter', value: rejectedAfterInterview },
    { source: 'intervju', target: 'pagaende', value: inInterview },
    { source: 'erbjudande', target: 'tackade-ja', value: accepted },
    { source: 'erbjudande', target: 'tackade-nej', value: declined },
    { source: 'erbjudande', target: 'vantar-besked', value: offerPending },
  ].filter((l) => l.value > 0);

  // Layout: samma skala i alla kolumner så flödesbredder är jämförbara.
  const width = 760;
  const height = 340;
  const nodeWidth = 10;
  const gap = 16;
  const topPad = 26;
  const columnX = [24, 254, 484, 714];

  const columns = [0, 1, 2, 3].map((c) => nodes.filter((n) => n.column === c));
  const usableHeight = height - topPad - 12 - gap * Math.max(...columns.map((col) => col.length - 1), 0);
  const scale = usableHeight / total;

  for (const col of columns) {
    let y = topPad;
    for (const node of col) {
      node.y = y;
      node.height = Math.max(node.value * scale, 3);
      node.outOffset = 0;
      node.inOffset = 0;
      y += node.height + gap;
    }
  }

  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  const ribbons = links
    .map((link) => {
      const source = nodeById.get(link.source);
      const target = nodeById.get(link.target);
      if (!source || !target) return null;
      const thickness = link.value * scale;
      const x0 = columnX[source.column] + nodeWidth;
      const x1 = columnX[target.column];
      const y0 = (source.y ?? 0) + (source.outOffset ?? 0);
      const y1 = (target.y ?? 0) + (target.inOffset ?? 0);
      source.outOffset = (source.outOffset ?? 0) + thickness;
      target.inOffset = (target.inOffset ?? 0) + thickness;
      const mid = (x0 + x1) / 2;
      const path = [
        `M ${x0} ${y0}`,
        `C ${mid} ${y0}, ${mid} ${y1}, ${x1} ${y1}`,
        `L ${x1} ${y1 + thickness}`,
        `C ${mid} ${y1 + thickness}, ${mid} ${y0 + thickness}, ${x0} ${y0 + thickness}`,
        'Z',
      ].join(' ');
      return { path, color: source.color, key: `${link.source}-${link.target}`, value: link.value };
    })
    .filter(Boolean) as { path: string; color: string; key: string; value: number }[];

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[560px]"
        role="img"
        aria-label="Flödesdiagram över sökprocessen, från ansökningar till utfall"
      >
        {ribbons.map((ribbon) => (
          <path key={ribbon.key} d={ribbon.path} fill={ribbon.color} opacity={0.28}>
            <title>{ribbon.value} ansökningar</title>
          </path>
        ))}
        {nodes.map((node) => (
          <g key={node.id}>
            <rect
              x={columnX[node.column]}
              y={node.y}
              width={nodeWidth}
              height={node.height}
              rx={3}
              fill={node.color}
            />
            <text
              x={node.column === 3 ? columnX[node.column] - 6 : columnX[node.column] + nodeWidth + 6}
              y={(node.y ?? 0) - 7}
              textAnchor={node.column === 3 ? 'end' : 'start'}
              fontSize={12}
              fontWeight={600}
              fill="#334155"
              style={{ paintOrder: 'stroke' }}
              stroke="#FFFFFF"
              strokeWidth={3}
            >
              {node.label} · {node.value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
