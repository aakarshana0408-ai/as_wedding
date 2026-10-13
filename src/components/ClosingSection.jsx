import { wedding, compactWeddingDate } from '../config/wedding';
import { DecorativeImage, Petals, MaterialSurface, Ornament } from './Decorations';
import Reveal from './Reveal';

export default function ClosingSection() {
  return <footer data-scroll-scene className="closing-section" aria-label={wedding.story.closing}>
    <MaterialSurface silk />
    <div className="closing-frame" aria-hidden="true">
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner =>
        <DecorativeImage key={corner} src={wedding.media.openingCorner}
          className={`closing-corner closing-corner--${corner}`} />)}
      {['left', 'right'].map(side => <div key={side} className={`closing-side closing-side--${side}`}>
        <Ornament />
      </div>)}
    </div>
    <DecorativeImage src={wedding.media.floral} className="closing-floral" parallax={2} />
    <Petals count={4} />
    <div className="closing-composition">
      <Reveal className="closing-lamp-mount" delay={120}><DecorativeImage src={wedding.media.lamp} className="closing-lamp" /></Reveal>
      <Reveal className="closing-copy" group delay={160}><p className="closing-quote" data-reveal-step="0">{wedding.story.closing}</p>
        <span className="fine-rule" aria-hidden="true" />
        <p className="closing-names" data-reveal-step="1"><span>{wedding.groom.name}</span><i>&amp;</i><span>{wedding.bride.name}</span></p>
        <p className="closing-date" data-reveal-step="2"><time dateTime={wedding.date}>{compactWeddingDate()}</time></p>
      </Reveal>
    </div>
  </footer>;
}
