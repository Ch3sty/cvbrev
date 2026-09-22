'use client';

/**
 * Sjalva ritandet. Ligger i egen fil sa att AdminChart kan ladda hela
 * recharts-beroendet lazy i ett stycke: dynamic() pa varje enskild
 * recharts-komponent gar inte, deras proptyper matchar inte Next
 * loader-signatur.
 *
 * All farg laser CSS-variabler. Ingen hex i den har filen.
 *
 * Markregler (dataviz-skillen): staplar hogst 24 px tjocka med 4 px rundad
 * dataande, linjer 2 px utan prickar utom vid hover, ytor med panelfargad
 * 2 px kant som avstand mellan lagren, rutnat i hårlinje och bara i en
 * riktning.
 */

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  Cell,
  LabelList,
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
  mellan: 'var(--ink-3)',
  framhavd: 'var(--accent)',
  positiv: 'var(--positiv)',
  varning: 'var(--varning)',
  fel: 'var(--fel)',
};

const AXEL = { fill: 'var(--ink-3)', fontSize: 12 } as const;

/** Rollen for en rad ur fargNyckel, med seriens roll som reserv. */
function radRoll(rad: Record<string, unknown>, nyckel: string | undefined, reserv: AdminSerieRoll): string {
  const v = nyckel ? rad[nyckel] : undefined;
  if (typeof v === 'string' && v in ROLL_VAR) return ROLL_VAR[v as AdminSerieRoll];
  return ROLL_VAR[reserv];
}

export default function AdminChartInner({
  data,
  xNyckel,
  serier,
  formateraX,
  formateraY,
  yAxisWidth = 56,
  liggande = false,
  fargNyckel,
  etiketter = false,
  yDoman,
}: AdminChartProps) {
  // Forklaringen kravs sa snart det finns mer an en serie: identitet far
  // aldrig bara baras av farg. Med fargNyckel bar raderna identiteten, och
  // sidan ritar da sin egen forklaring for paketen.
  const visaForklaring = serier.length > 1;

  const tooltipFormat = (v: number | string) =>
    typeof v === 'number' && formateraY ? formateraY(v) : v;

  const tooltipStil = {
    background: 'var(--panel)',
    border: '1px solid var(--kant)',
    borderRadius: 8,
    // Tooltipen svavar, alltsa ar shadow-svav ratt skugga har och den enda
    // skuggan i hela diagrammet.
    boxShadow: '0 8px 24px rgba(28,25,23,.12), 0 1px 2px rgba(28,25,23,.08)',
    fontSize: 13,
    color: 'var(--ink-1)',
  } as const;

  const staplar = serier.filter((s) => s.typ === 'stapel');
  const linjer = serier.filter((s) => s.typ === 'linje');
  const ytor = serier.filter((s) => s.typ === 'yta');

  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* Ingen negativ margin.left. Den drog in axeln under plotytan och
          klippte etiketten fran vanster: "600 kr" lastes som "00 kr". Bredden
          styrs av yAxisWidth i stallet, vilket ar en bredd och inte ett
          hack. */}
      <ComposedChart
        data={data}
        layout={liggande ? 'vertical' : 'horizontal'}
        margin={{ top: 8, right: etiketter && liggande ? 48 : 4, bottom: 0, left: 0 }}
        barCategoryGap={liggande ? 6 : undefined}
      >
        <CartesianGrid vertical={liggande} horizontal={!liggande} stroke="var(--kant)" />

        {liggande ? (
          <>
            <XAxis
              type="number"
              tick={AXEL}
              tickLine={false}
              axisLine={false}
              tickFormatter={formateraY}
              domain={yDoman ?? [0, 'auto']}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey={xNyckel}
              tick={AXEL}
              tickLine={false}
              axisLine={{ stroke: 'var(--kant)' }}
              width={yAxisWidth}
              tickFormatter={formateraX}
              interval={0}
            />
          </>
        ) : (
          <>
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
              width={yAxisWidth}
              tickFormatter={formateraY}
              domain={yDoman}
              allowDecimals={false}
            />
          </>
        )}

        <Tooltip
          cursor={
            staplar.length && !linjer.length && !ytor.length
              ? { fill: 'var(--insunken)' }
              : { stroke: 'var(--kant-stark)', strokeWidth: 1 }
          }
          formatter={tooltipFormat}
          contentStyle={tooltipStil}
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

        {/* Ytorna ritas forst och staplas alltid: en del-av-helhet over tid.
            Kanten i panelfargen ar det tva pixlar breda avstandet mellan
            lagren, i stallet for en ritad ram. */}
        {ytor.map((s) => (
          <Area
            key={s.nyckel}
            type="monotone"
            dataKey={s.nyckel}
            name={s.namn}
            stackId="yta"
            fill={ROLL_VAR[s.roll]}
            fillOpacity={0.85}
            stroke="var(--panel)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--panel)' }}
            connectNulls={false}
            isAnimationActive={false}
          />
        ))}

        {/* Staplarna ritas fore linjerna sa att linjerna ligger ovanpa dem. */}
        {staplar.map((s) => (
          <Bar
            key={s.nyckel}
            dataKey={s.nyckel}
            name={s.namn}
            fill={ROLL_VAR[s.roll]}
            stackId={s.stackId}
            radius={liggande ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            maxBarSize={24}
            isAnimationActive={false}
          >
            {fargNyckel
              ? data.map((rad, i) => (
                  <Cell key={`${s.nyckel}-${i}`} fill={radRoll(rad, fargNyckel, s.roll)} />
                ))
              : null}
            {etiketter ? (
              <LabelList
                dataKey={s.nyckel}
                position={liggande ? 'right' : 'top'}
                formatter={(v: unknown) =>
                  typeof v === 'number' ? (formateraY ? formateraY(v) : v.toLocaleString('sv-SE')) : ''
                }
                style={{ fill: 'var(--ink-2)', fontSize: 12 }}
              />
            ) : null}
          </Bar>
        ))}

        {linjer.map((s) => (
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
