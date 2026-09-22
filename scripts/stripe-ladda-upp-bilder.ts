/** Laddar upp paketbilderna till Stripe, sätter skattekod och arkiverar Jobbsökarveckan. Kör en gång. */
import Stripe from 'stripe';
import { readFile } from 'node:fs/promises';
import { laddaEnv } from './_env';
laddaEnv();
const s = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' });
const TAX = 'txcd_10103000';
const mal: Array<[string, string]> = [
  [process.env.STRIPE_PRICE_CV_WEEK!, 'cv-veckan'],
  [process.env.STRIPE_PRICE_TEST_WEEK!, 'testveckan'],
  [process.env.STRIPE_PRICE_ALL_WEEK!, 'allt-veckan'],
];
(async () => {
  for (const [priceId, namn] of mal) {
    const price = await s.prices.retrieve(priceId);
    const data = await readFile(`public/stripe/${namn}.png`);
    const fil = await s.files.create({ purpose: 'business_logo' as Stripe.FileCreateParams.Purpose, file: { data, name: `${namn}.png`, type: 'application/octet-stream' } });
    const lank = await s.fileLinks.create({ file: fil.id });
    const prod = await s.products.update(price.product as string, { images: [lank.url!], tax_code: TAX });
    console.log(prod.name, '→ bild', lank.url, 'skattekod', prod.tax_code);
  }
  // Arkivera Jobbsökarveckan (gamla STRIPE_PRICE_WEEK)
  const gammal = process.env.STRIPE_PRICE_WEEK;
  if (gammal) {
    const p = await s.prices.retrieve(gammal);
    await s.prices.update(gammal, { active: false });
    const prod = await s.products.update(p.product as string, { active: false });
    console.log('arkiverad:', prod.name);
  }
  process.exit(0);
})().catch(e => { console.error('Misslyckades:', e.message); process.exit(1); });
