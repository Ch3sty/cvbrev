/**
 * Det en kalkylator säger om sitt resultat, i en form som delningstexten,
 * OG-bilden och den delade sidans metadata kan läsa.
 */
export interface Sammanfattning {
  /** Kalkylatorns korta namn: "Lön efter skatt 2026". */
  namn: string
  /** Det stora talet, färdigformaterat: "26 912 kr". */
  tal: string
  /** Vad talet är: "kvar i handen per månad". */
  enhet: string
  /** En rad med förutsättningarna: "35 000 kr i lön i Stockholm, skattetabell 31". */
  rad: string
  /** Källan, synlig på sidan och i bilden. */
  kalla: string
}
