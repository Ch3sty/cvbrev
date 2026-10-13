import React from 'react';
import { Composition, continueRender, delayRender, staticFile } from 'remotion';
import { FPS, SEK } from './anim';
import { TesterVideo } from './Video';
import { Prov } from './v3/Prov';
import { Hel } from './v3/Hel';
import { SajtVideo } from './v3/Sajt';

// Typsnitten är produktens självhostade variabelsnitt (src/assets/fonts).
const typsnitt = delayRender('Laddar typsnitten');
Promise.all([
  new FontFace('Inter', `url(${staticFile('fonts/InterVariable.woff2')}) format('woff2')`, { weight: '100 900' }).load(),
  new FontFace('Schibsted Grotesk', `url(${staticFile('fonts/SchibstedGrotesk-Variable.woff2')}) format('woff2')`, { weight: '400 900' }).load(),
])
  .then((fonter) => {
    fonter.forEach((f) => (document.fonts as unknown as Set<FontFace>).add(f));
    continueRender(typsnitt);
  })
  .catch((e) => {
    console.error(e);
    continueRender(typsnitt);
  });

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Tester169" component={TesterVideo} durationInFrames={SEK * FPS} fps={FPS} width={1920} height={1080} defaultProps={{ format: '169' as const }} />
    <Composition id="Tester45" component={TesterVideo} durationInFrames={SEK * FPS} fps={FPS} width={1080} height={1350} defaultProps={{ format: '45' as const }} />
    <Composition id="Prov169" component={Prov} durationInFrames={312} fps={FPS} width={1920} height={1080} />
    <Composition id="Tester3" component={Hel} durationInFrames={900} fps={FPS} width={1920} height={1080} />
    <Composition id="Sajt169" component={SajtVideo} durationInFrames={585} fps={FPS} width={1920} height={1080} defaultProps={{ format: '169' as const }} />
    <Composition id="Sajt916" component={SajtVideo} durationInFrames={585} fps={FPS} width={1080} height={1920} defaultProps={{ format: '916' as const }} />
  </>
);
