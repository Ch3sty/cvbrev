/**
 * Cookie-samtycket som server-HTML och två små inline-skript, utan React på
 * klienten (beslut-banners-2026-10-12, avsnitt 2).
 *
 * Bannern står i server-HTML:en från början, med sin slutliga storlek och
 * plats. Förut låg den i en <template> och klonades in när sidan var ledig.
 * Då målades den sist av allt, och på glesa sidor blev den sidans
 * LCP-element: LCP flyttade från 0,8 till 2,1 s för varje ny besökare. Ett
 * element som målas i första bilden får LCP-tid lika med första målningen,
 * och med 12 px text och 44 px knappar är det aldrig sidans största.
 *
 * Publika sidor CDN-cachas ett dygn, så servern kan inte veta om besökaren
 * redan svarat. Därför står bannern i HTML:en för alla, och den som svarat
 * döljs före första målningen:
 *
 *  1. SamtyckeHuvud ligger i <head>. Finns cookien cvBrevCookieConsent, eller
 *     står vi under /admin, sätter det data-samtycke="svarat" på <html>, och
 *     globals.css döljer bannern med display: none. Inget har målats än, så
 *     ingen ser den och inget skiftar. Cachen påverkas inte: HTML:en är
 *     densamma för alla.
 *  2. Skriptet direkt efter bannern skickar ett redan givet ja till GTM och
 *     sparar svaret vid klick: samma cookie som förut ("true" eller "false",
 *     180 dygn), samma GTM-uppdatering, och bannern tas bort.
 *
 * Markeringen är en sträng i ett omslag med dangerouslySetInnerHTML, så
 * React jämför aldrig innehållet vid hydreringen och bryr sig inte om att
 * skriptet tar bort bannern ur DOM.
 */

const COOKIE = 'cvBrevCookieConsent'
const DYGN = 180

/** Körs i <head> före första målningen. */
const HUVUDSKRIPT = `try{if(document.cookie.match(/(?:^|; )${COOKIE}=/)||location.pathname.indexOf('/admin')===0)document.documentElement.setAttribute('data-samtycke','svarat')}catch(e){}`

const SKRIPT = `(function(){
var N=${JSON.stringify(COOKIE)};
function las(){var m=document.cookie.match(new RegExp('(?:^|; )'+N+'=([^;]*)'));return m?m[1]:null}
function ge(v){(window.dataLayer=window.dataLayer||[]).push(['consent','update',{analytics_storage:v,ad_storage:v,ad_user_data:v,ad_personalization:v}])}
function gtagKo(v){window.gtag?window.gtag('consent','update',{analytics_storage:v,ad_storage:v,ad_user_data:v,ad_personalization:v}):ge(v)}
var el=document.getElementById('jc-samtycke');
var svar=las();
if(svar==='true')gtagKo('granted');
if(svar!==null||location.pathname.indexOf('/admin')===0){if(el&&el.parentNode)el.parentNode.removeChild(el);return}
if(!el)return;
el.addEventListener('click',function(e){
var b=e.target&&e.target.closest?e.target.closest('[data-samtycke]'):null;if(!b)return;
var ja=b.getAttribute('data-samtycke')==='true';
document.cookie=N+'='+ja+';max-age=${DYGN * 86400};path=/;SameSite=Lax'+(location.protocol==='https:'?';Secure':'');
gtagKo(ja?'granted':'denied');
document.documentElement.setAttribute('data-samtycke','svarat');
if(el.parentNode)el.parentNode.removeChild(el);
});
})();`

/**
 * En rad text och två lika stora knappar (beslutet: rubriken är struken, den
 * sa samma sak som texten och var bannerns största textyta). Avvisa och
 * Acceptera har samma storlek och samma vikt.
 */
const MARKERING = [
  '<div id="jc-samtycke" class="cookie-banner-container" role="region" aria-label="Cookies">',
  '<p class="cookie-banner-text">Vi använder cookies för att göra tjänsten bättre. ',
  '<a href="/integritetspolicy#cookies" aria-label="Läs mer om hur vi använder cookies i vår integritetspolicy">Läs mer</a></p>',
  '<div class="cookie-banner-buttons">',
  '<button type="button" id="rcc-decline-button" data-samtycke="false" aria-label="Avvisa cookies">Avvisa</button>',
  '<button type="button" id="rcc-confirm-button" data-samtycke="true" aria-label="Acceptera cookies">Acceptera</button>',
  '</div>',
  '</div>',
].join('')

/** Läggs i rot-layoutens <head>. */
export function SamtyckeHuvud() {
  return <script dangerouslySetInnerHTML={{ __html: HUVUDSKRIPT }} />
}

export default function CookieBanner() {
  return (
    <>
      <div id="jc-samtycke-rot" dangerouslySetInnerHTML={{ __html: MARKERING }} />
      <script dangerouslySetInnerHTML={{ __html: SKRIPT }} />
    </>
  )
}
