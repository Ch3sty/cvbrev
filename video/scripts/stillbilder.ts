// Renderar kontrollbilder ur båda formaten: npm run stillbilder [-- 60 195 ...]
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const RUTOR = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));
const STANDARD = [60, 84, 105, 195, 285, 330, 375, 405, 450, 525, 585, 645, 705, 750, 795, 807, 885];

const main = async () => {
  const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
  for (const id of (process.env.FORMAT ? [process.env.FORMAT] : ['Tester169', 'Tester45'])) {
    const composition = await selectComposition({ serveUrl, id });
    for (const frame of RUTOR.length ? RUTOR : STANDARD) {
      const output = path.resolve(`out/stills/${id}-${String(frame).padStart(3, '0')}.png`);
      await renderStill({ composition, serveUrl, output, frame });
      console.log(output);
    }
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
