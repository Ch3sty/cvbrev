/**
 * MetricCard: ett stort tal med etikett och jamforelse.
 *
 * Byggd fran grunden pa Traden-tokens (docs/designsystem.md v2 avsnitt 6).
 * Det gamla kortet hade en fargad ikonruta i gula, gra och bla plattor och
 * en pil i en fylld platta. Bada ar borta: ingen ikon i
 * kortet, och delta ar text i text-positiv eller text-fel med en textpil, sa
 * att fargen aldrig ar ensam informationsbarare.
 *
 * datakvalitet ar den valfria meta-raden planen kraver for de tal som bygger
 * pa first_*_at och acquisition_source, som ar obrukbara till fixen ar live
 * plus tva veckor. Skriv noten, ta inte bort talet.
 *
 * Serverkomponent. Den har inget tillstand och behover ingen klientgrans.
 */

import type { ReactNode } from 'react';

export interface MetricCardProps {
  /** Vad talet ar, i ink-3. Till exempel "MRR" eller "Nya konton". */
  etikett: string;
  /**
   * Talet, redan formaterat. Kortet formaterar aldrig sjalv: en krona, en
   * procent och ett antal skrivs olika och sidan vet vilket det ar.
   */
  varde: ReactNode;
  /**
   * Forandringen i procent eller antal. Positiv gar till text-positiv,
   * negativ till text-fel, noll till ink-3. Utelamna nar det inte finns
   * nagon jamforelse, till exempel forsta dagen.
   */
  delta?: number | null;
  /** Deltat som text, redan formaterat, till exempel "12 %" eller "3". */
  deltaText?: string;
  /** Vad jamforelsen gors mot, till exempel "mot i gar". */
  jamforelse?: string;
  /**
   * Nar ett hogre tal ar samre, till exempel misslyckade betalningar eller
   * churn. Vander fargen, inte tecknet.
   */
  inverterad?: boolean;
  /**
   * En andra jamforelse, till exempel "Ner 3 mot samma dag forra veckan".
   * Egen meta-rad under den forsta. Oversikt lanade tidigare
   * datakvalitet-propen till det har, vilket blandade ihop "talet rorde sig"
   * med "talet gar inte att lita pa". Nu ar det tva olika saker.
   */
  andraJamforelse?: string;
  /**
   * Datakvalitetsnot. Visas som en egen meta-rad under jamforelsen. Anvands
   * for tal vars underliggande matning ar kand trasig.
   */
  datakvalitet?: string;
  className?: string;
}

export default function MetricCard({
  etikett,
  varde,
  delta,
  deltaText,
  jamforelse,
  inverterad = false,
  andraJamforelse,
  datakvalitet,
  className,
}: MetricCardProps) {
  const harDelta = typeof delta === 'number' && Number.isFinite(delta);
  const bra = harDelta ? (inverterad ? delta < 0 : delta > 0) : false;
  const daligt = harDelta ? (inverterad ? delta > 0 : delta < 0) : false;

  const deltaKlass = bra
    ? 'text-positiv'
    : daligt
      ? 'text-fel'
      : 'text-ink-3';

  // Pilen foljer talets tecken, inte om det ar bra eller daligt. Farg och
  // riktning sager alltsa tva olika saker, vilket ar meningen.
  const pil = harDelta ? (delta > 0 ? '↑' : delta < 0 ? '↓' : '') : '';

  const text =
    deltaText ??
    (harDelta ? `${Math.abs(delta).toLocaleString('sv-SE')}` : undefined);

  return (
    <div
      className={[
        'rounded-xl border border-kant bg-panel p-4',
        className ?? '',
      ].join(' ')}
    >
      <div className="text-sm font-medium text-ink-3">{etikett}</div>
      <div className="mt-1 text-tal tabular-nums text-ink-1">{varde}</div>

      {text || jamforelse ? (
        <div className="mt-1 text-meta text-ink-3">
          {text ? (
            <span className={`${deltaKlass} tabular-nums`}>
              {pil ? `${pil} ` : ''}
              {text}
            </span>
          ) : null}
          {text && jamforelse ? ' ' : ''}
          {jamforelse}
        </div>
      ) : null}

      {andraJamforelse ? (
        <div className="mt-1 text-meta text-ink-3">{andraJamforelse}</div>
      ) : null}

      {datakvalitet ? (
        <div className="mt-2 text-meta text-ink-3">{datakvalitet}</div>
      ) : null}
    </div>
  );
}
