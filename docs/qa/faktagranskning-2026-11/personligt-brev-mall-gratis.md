# Faktagranskning: content/artiklar/personligt-brev-mall-gratis.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, artikeln lovar på flera ställen att brevet från vårt verktyg kan laddas ner gratis som PDF, vilket är fel. Två uppgifter om andra källor i tabellen är också fel.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 28 (frontmatter), 342 (FAQ) | "Vill du ha en färdig PDF kan du bygga ditt brev med vårt verktyg och ladda ner det direkt. Allt är gratis" | fel (produkt) | Att ladda ner brev (`letter_download`) ingår bara i Premium. Gratisnivån ger ett brev och sedan ett i veckan, att läsa men inte ladda ner. Föreslagen text: "Vill du ha en färdig PDF bygger du brevet i vårt verktyg. Brevet går att läsa gratis, och nedladdning som PDF ingår i Premium (149 kr i månaden). Exemplen läser du utan konto." | src/lib/access/features.ts (letter_download), src/app/(public)/priser/page.tsx |
| 35 | "ett verktyg som genererar ett första utkast som du laddar ner som PDF" | fel (produkt) | Samma sak: nedladdningen är Premium. Föreslagen text: "... ett verktyg som skriver ett första utkast på din annons (nedladdning som PDF ingår i Premium)". | Som ovan |
| 133 | Tabellraden "Vårt mallbibliotek ... Format: Webb, PDF via verktyg" | fel (produkt) | PDF via verktyget är Premium. Föreslagen text: "Webb (PDF i Premium)". | Som ovan |
| 260 | "Du svarar på frågor, får ett anpassat utkast, redigerar och laddar ner som PDF. Vårt verktyg jobbar så" | fel (produkt, delvis) | Nedladdningssteget gäller bara Premium. Lägg till "(nedladdning i Premium)" eller stryk "och laddar ner som PDF" i meningen om vårt verktyg. | Som ovan |
| 153–154, 170 | "Resume.io, Novoresume: Word, PDF (freemium) ... vattenstämpel i gratisversionen" | fel (Resume.io) / obelagt (Novoresume) | Resume.io:s gratisplan ger bara nedladdning i TXT-format. PDF och DOCX kräver betalplan, och någon vattenstämpel nämns inte. För Novoresume är uppgifterna om vattenstämpel motstridiga, men personliga brev (Cover Letter Maker) går inte att ladda ner gratis. Föreslagen text: "Vackra mallar, men PDF-nedladdning kräver betalning". | https://resume.io/pricing |
| 138 | Tabellraden "Arbetsförmedlingen: Webb, PDF" | fel (format) | Arbetsförmedlingen erbjuder tre brevmallar att ladda ner i Word-format, inte PDF. Ändra till "Webb, Word". | https://arbetsformedlingen.se/for-arbetssokande/cv-ansokan-och-intervju/skriva-personligt-brev |
| 168 | "KTH, Lund, Linköping och flera andra erbjuder mallar via sina karriärservice-sidor" | obelagt | Inte kontrollerat lärosäte för lärosäte i denna omgång. Antingen kontrollerar vi de tre namngivna, eller så skriver vi "Många lärosäten erbjuder ...". | Ingen källa |

## Belagda påståenden
- 89 yrkesspecifika brevexempel som går att läsa utan konto (rad 5, 12, 22, 35, 132, 162, 302): BREV_GALLERI har 89 poster (src/app/(public)/exempel/components/galleri-data.ts).
- "Båda är gratis att börja använda" (rad 302): stämmer, eftersom gratisnivån ger ett brev.
- Arbetsförmedlingen rekommenderar max en A4-sida: https://arbetsformedlingen.se/for-arbetssokande/cv-ansokan-och-intervju/skriva-personligt-brev
- Branschexemplen (Klarna, Handelsbanken, Espresso House, Backaskolan) är illustrativa citat i ett exempelformat och påstår inget om bolagen. (Stavning: "Hagastan" på rad 204 bör vara "Hagastaden".)

## Rättning (omgång 1, 2026-11-15)
- Rad 28 och 342 (FAQ i frontmatter och FAQ-blocket): rättat. Ny text: exemplen läses utan konto, brevet byggs i verktyget och går att läsa gratis, nedladdning som PDF ingår i Premium (149 kr i månaden). "Allt är gratis" struket. Frågan oförändrad.
- Rad 35 (snabbsvaret): rättat till "ett verktyg som skriver ett första utkast på din annons (nedladdning som PDF ingår i Premium)".
- Rad 133 (tabellen): rättat till "Webb (PDF i Premium)".
- Rad 260: lagt till "(nedladdning som PDF ingår i Premium)" i meningen om vårt verktyg. Länken kvar.
- Rad 153–154 och 170 (Resume.io, Novoresume): vattenstämpeln struken. Tabellen: "Word, PDF (mot betalning)" och "Vacker design, men PDF-nedladdning kräver betalning". Brödtexten: "Vackra mallar, men PDF-nedladdning kräver betalning. Värt att kolla, men räkna inte med att gratisversionen räcker hela vägen till en färdig fil."
- Rad 138 (Arbetsförmedlingen): rättat till "Webb, Word". Brödtexten om Arbetsförmedlingens guide kompletterad med "tre brevmallar att ladda ner i Word".
- Rad 168 (KTH, Lund, Linköping): omskrivet till "Många lärosäten erbjuder mallar via sina karriärtjänster."
- Stavning rad 204: "Hagastan" rättat till "Hagastaden".
- `updated: "2026-11-15"` tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden berörs inte, inte omgjord. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
GODKÄND. Rättningarna kontrollerade mot källorna: Arbetsförmedlingen har tre brevmallar i Word (.docx) och skriver max en A4-sida; Resume.io:s gratisplan laddar bara ner TXT, PDF kräver betalplan (https://resume.io/pricing); Novoresumes Cover Letter Maker är Premium och brev-PDF kräver uppgradering. PDF-nedladdning av brev står som Premium 149 kr/mån på alla ställen, frontmatter-FAQ och FAQ-block identiska, Hagastaden rättat, inga veckopaket eller Dagspass. Notering utan krav: Novoresume tillåter gratis nedladdning av ett ensidigt CV som PDF, så meningen gäller brev, vilket är artikelns ämne; att Novoresume erbjuder Word-export (tabellen "Word, PDF") har jag inte kunnat belägga, raden fanns före rättningen. Överväg "PDF (mot betalning)".

## Svar till samordnaren
personligt-brev-mall-gratis, GODKÄND, inga brister (notering: Word-formatet för Novoresume obelagt, kvar från före rättningen).
