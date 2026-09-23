/**
 * Cookie-samtycket som server-HTML och ett inline-skript, utan React på
 * klienten.
 *
 * Förut ritades bannern av react-cookie-consent i rot-layoutens klientlager,
 * och biblioteket, hanterarna och state för när bannern fick visas låg i
 * varje publik sidas JavaScript. Nu står markeringen i en <template> i
 * server-HTML:en, och skriptet nedan (under 1 kB) gör tre saker:
 *
 *  1. Har besökaren redan accepterat skickas samtycket till GTM direkt,
 *     tidigare än förut (då väntade det på hydreringen).
 *  2. Saknas ett svar klonas bannern in i body när sidan är ledig, som förut
 *     med schemaläggningen i client-layout. Ett fast element som flyttar sig
 *     räknas som layoutskifte, och på flödessidorna flyttar globals.css upp
 *     bannern ovanför foten först när flödet hydrerat; väntar vi till efter
 *     första målningen står den direkt på sin slutliga plats.
 *  3. Knapparna sparar svaret i samma cookie som biblioteket använde
 *     (cvBrevCookieConsent, "true" eller "false", 180 dygn), så ingen som
 *     redan svarat får frågan igen.
 *
 * Bannern klonas in utanför Reacts träd, så hydreringen rör den aldrig.
 * Under /admin visas den inte (spec-admin-tydlighet, punkt 5).
 */

const COOKIE = 'cvBrevCookieConsent'
const DYGN = 180

const SKRIPT = `(function(){
var N=${JSON.stringify(COOKIE)};
function las(){var m=document.cookie.match(new RegExp('(?:^|; )'+N+'=([^;]*)'));return m?m[1]:null}
function ge(v){(window.dataLayer=window.dataLayer||[]).push(['consent','update',{analytics_storage:v,ad_storage:v,ad_user_data:v,ad_personalization:v}])}
function gtagKo(v){window.gtag?window.gtag('consent','update',{analytics_storage:v,ad_storage:v,ad_user_data:v,ad_personalization:v}):ge(v)}
var svar=las();
if(svar==='true')gtagKo('granted');
if(svar!==null)return;
function visa(){
if(location.pathname.indexOf('/admin')===0||document.getElementById('jc-samtycke'))return;
var t=document.getElementById('jc-samtycke-mall');if(!t||!t.content)return;
var el=t.content.firstElementChild.cloneNode(true);
el.addEventListener('click',function(e){
var b=e.target&&e.target.closest?e.target.closest('[data-samtycke]'):null;if(!b)return;
var ja=b.getAttribute('data-samtycke')==='true';
document.cookie=N+'='+ja+';max-age=${DYGN * 86400};path=/;SameSite=Lax'+(location.protocol==='https:'?';Secure':'');
gtagKo(ja?'granted':'denied');
if(el.parentNode)el.parentNode.removeChild(el);
});
document.body.appendChild(el);
}
if('requestIdleCallback' in window)requestIdleCallback(visa,{timeout:2500});else setTimeout(visa,1500);
})();`

/**
 * Markeringen som sträng. En <template> med JSX-barn går inte att hydrera:
 * webbläsaren lägger barnen i template.content, inte i DOM-trädet, så React
 * hittade ett tomt element och kastade fel 418 på varje sida. Med
 * dangerouslySetInnerHTML jämför React inte innehållet.
 */
const MARKERING = [
  '<div id="jc-samtycke" class="cookie-banner-container" role="region" aria-label="Cookies">',
  '<div class="cookie-banner-content">',
  '<p class="cookie-banner-rubrik">Vi använder cookies</p>',
  '<p class="cookie-banner-text">För att göra plattformen bättre. ',
  '<a href="/integritetspolicy#cookies" aria-label="Läs mer om hur vi använder cookies i vår integritetspolicy">Läs mer</a></p>',
  '</div>',
  '<div class="cookie-banner-buttons">',
  '<button type="button" id="rcc-decline-button" data-samtycke="false" aria-label="Avvisa cookies">Avvisa</button>',
  '<button type="button" id="rcc-confirm-button" data-samtycke="true" aria-label="Acceptera cookies">Acceptera</button>',
  '</div>',
  '</div>',
].join('')

export default function CookieBanner() {
  return (
    <>
      <template id="jc-samtycke-mall" dangerouslySetInnerHTML={{ __html: MARKERING }} />
      <script dangerouslySetInnerHTML={{ __html: SKRIPT }} />
    </>
  )
}
