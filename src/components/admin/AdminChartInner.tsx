'use client';

/**
 * Sjalva ritandet. Ligger i egen fil sa att AdminChart kan ladda hela
 * recharts-beroendet lazy i ett stycke: dynamic() pa varje enskild
 * recharts-komponent gar inte, deras proptyper matchar inte Next
 * loader-signatur.
 *
 * All farg laser CSS-variabler. Ingen hex i den har filen.
 */

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { AdminChartProps, AdminSerieRoll } from './AdminChart';

const ROLL_VAR: Record<AdminSerieRoll, string> = {
  primar: 'var(--ink-1)',
  sekundar: 'var(--kant-stark)',
  framhavd: 'var(--accent)',
  positiv: 'var(--positiv)',
  varning: 'var(--varning)',
  fel: 'var(--fel)',
};

const AXEL = { fill: 'var(--ink-3)', fontSize: 12 } as const;

export default function AdminChartInner({
  data,
  xNyckel,
  serier,
  formateraX,
  formateraY,
}: AdminChartProps) {
  // Forklaringen kravs sa snart det finns mer an en serie: identitet far
  // aldrig bara baras av farg.
  const visaForklaring = serier.length > 1;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -16 }}>
        <CartesianGrid vertical={false} stroke="var(--kant)" />

        <XAxis
          dataKey={xNyckel}
          tick={AXEL}
          tickLine={false}
          axisLine={{ stroke: 'var(--kant)' }}
          tickFormatter={formateraX}
          minTickGap={24}
        />
        <YAxis
          tick={AXEL}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={formateraY}
        />

        <Tooltip
          cursor={{ stroke: 'var(--kant-stark)', strokeWidth: 1 }}
          formatter={(v: number | string) =>
            typeof v === 'number' && formateraY ? formateraY(v) : v
          }
          // Tooltipen svavar, alltsa ar shadow-svav ratt skugga har och den
          // enda skuggan i hela diagrammet.
          contentStyle={{
            background: 'var(--panel)',
            border: '1px solid var(--kant)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(28,25,23,.12), 0 1px 2px rgba(28,25,23,.08)',
            fontSize: 13,
            color: 'var(--ink-1)',
          }}
          labelStyle={{ color: 'var(--ink-3)', fontSize: 12 }}
          labelFormatter={(v) => (formateraX ? formateraX(v) : v)}
        />

        {visaForklaring ? (
          <Legend
            verticalAlign="top"
            align="left"
            height={28}
            wrapperStyle={{ fontSize: 13, color: 'var(--ink-3)' }}
          />
        ) : null}

        {/* Staplarna ritas forst sa att linjerna ligger ovanpa dem. */}
        {serier
          .filter((s) => s.typ === 'stapel')
          .map((s) => (
            <Bar
              key={s.nyckel}
              dataKey={s.nyckel}
              name={s.namn}
              fill={ROLL_VAR[s.roll]}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          ))}

        {serier
          .filter((s) => s.typ === 'linje')
          .map((s) => (
            <Line
              key={s.nyckel}
              type="monotone"
              dataKey={s.nyckel}
              name={s.namn}
              stroke={ROLL_VAR[s.roll]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              // En lucka i serien ar en lucka, inte en nolla: GSC-dagar utan
              // svar skrivs som null och linjen ska brytas dar.
              connectNulls={false}
            />
          ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
