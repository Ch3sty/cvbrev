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
  ReferenceArea,
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
  cv: 'var(--diagram-cv)',
  test: 'var(--diagram-test)',
  allt: 'var(--ink-1)',
};

/** Forsta, mittersta och sista x-vardet: diagramregeln punkt 1. */
function treTicks(data: Array<Record<string, unknown>>, xNyckel: string): Array<string | number> {
  if (!data.length) return [];
  const varden = data.map((r) => r[xNyckel] as string | number);
  if (varden.length <= 3) return varden;
  return [varden[0], varden[Math.floor((varden.length - 1) / 2)], varden[varden.length - 1]];
}

/** Index for seriens sista punkt med ett tal, eller -1. */
function sistaIndex(data: Array<Record<string, unknown>>, nyckel: string): number {
  for (let i = data.length - 1; i >= 0; i--) {
    const v = data[i][nyckel];
    if (typeof v === 'number' && Number.isFinite(v)) return i;
  }
  return -1;
}

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
  enhet,
  matstart,
  matstartText,
  efterslap,
  slutvarde = true,
}: AdminChartProps) {
  // Enheten pa y-axeln nar sidan inte formaterar sjalv (diagramregeln).
  const fy: ((v: number) => string) | undefined =
    formateraY ?? (enhet ? (v: number) => `${v.toLocaleString('sv-SE')} ${enhet}` : undefined);
  const ticks = liggande ? undefined : treTicks(data, xNyckel);
  const forstaX = data.length ? (data[0][xNyckel] as string) : undefined;
  const sistaX = data.length ? (data[data.length - 1][xNyckel] as string) : undefined;
  const foreMatstart = matstart
    ? data.filter((r) => String(r[xNyckel]) < matstart).map((r) => r[xNyckel] as string)
    : [];

  /** Etikett vid seriens slutpunkt, bara pa sista punkten med ett tal. */
  const slutEtikett = (nyckel: string) => {
    const sista = sistaIndex(data, nyckel);
    // eslint-disable-next-line react/display-name
    return (p: any) => {
      if (p?.index !== sista || typeof p?.value !== 'number') return null;
      const x = Number(p.x ?? 0) + (Number(p.width ?? 0) || 0) / 2;
      const y = Number(p.y ?? 0) - 8;
      return (
        <text x={x} y={y} textAnchor={sista === data.length - 1 ? 'end' : 'middle'} fill="var(--ink-1)" fontSize={12} fontWeight={500}>
          {fy ? fy(p.value) : p.value.toLocaleString('sv-SE')}
        </text>
      );
    };
  };
  // Forklaringen kravs sa snart det finns mer an en serie: identitet far
  // aldrig bara baras av farg. Med fargNyckel bar raderna identiteten, och
  // sidan ritar da sin egen forklaring for paketen.
  const visaForklaring = serier.length > 1;

  const tooltipFormat = (v: number | string) =>
    typeof v === 'number' && fy ? fy(v) : v;

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
        margin={{ top: slutvarde && !liggande ? 20 : 8, right: etiketter && liggande ? 48 : 8, bottom: 0, left: 0 }}
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
              tickFormatter={fy}
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
              ticks={ticks}
              interval={0}
            />
            <YAxis
              tick={AXEL}
              tickLine={false}
              axisLine={false}
              width={yAxisWidth}
              tickFormatter={fy}
              domain={yDoman}
              allowDecimals={false}
            />
          </>
        )}

        {/* Gra zon fore matstart: dagarna ar inte matta, alltsa inte noll. */}
        {!liggande && foreMatstart.length && forstaX ? (
          <ReferenceArea
            x1={forstaX}
            x2={foreMatstart[foreMatstart.length - 1]}
            fill="var(--insunken)"
            fillOpacity={1}
            stroke="none"
            ifOverflow="extendDomain"
            label={{
              value: matstartText ?? `mäts från ${formateraX && matstart ? formateraX(matstart) : matstart}`,
              position: 'insideTopLeft',
              fill: 'var(--ink-3)',
              fontSize: 12,
            }}
          />
        ) : null}

        {/* Gra zon i slutet: kallan har inte levererat dagarna an. */}
        {!liggande && efterslap && sistaX ? (
          <ReferenceArea
            x1={efterslap.fran}
            x2={sistaX}
            fill="var(--insunken)"
            fillOpacity={1}
            stroke="none"
            ifOverflow="extendDomain"
            label={{ value: efterslap.text, position: 'insideTopRight', fill: 'var(--ink-3)', fontSize: 12 }}
          />
        ) : null}

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
          >
            {slutvarde ? <LabelList dataKey={s.nyckel} content={slutEtikett(s.nyckel)} /> : null}
          </Area>
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
                  typeof v === 'number' ? (fy ? fy(v) : v.toLocaleString('sv-SE')) : ''
                }
                style={{ fill: 'var(--ink-2)', fontSize: 12 }}
              />
            ) : slutvarde && !liggande ? (
              <LabelList dataKey={s.nyckel} content={slutEtikett(s.nyckel)} />
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
            isAnimationActive={false}
          >
            {slutvarde ? <LabelList dataKey={s.nyckel} content={slutEtikett(s.nyckel)} /> : null}
          </Line>
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
