import { ArrowDown } from 'lucide-react';
import { wedding, formatWeddingDate } from '../config/wedding';
import { Petals, DecorativeImage, Ornament } from './Decorations';
import WeddingMonogram from './WeddingMonogram';
import Reveal from './Reveal';

export default function MonogramReveal({ active }) {
  return <section id="invitation" data-scroll-scene className={`opening paper-section ${active ? 'ceremony-reveal' : ''}`} aria-labelledby="couple-names">
    <div className="opening-scene">
      <picture className="opening-artwork" aria-hidden="true">
        <source media="(min-width: 1301px)" srcSet={wedding.media.openingBackdropWide} />
        <source media="(min-width: 901px)" srcSet={wedding.media.openingBackdropTablet} />
        <DecorativeImage src={wedding.media.openingBackdrop} className="opening-temple" eager />
      </picture>
      <Petals count={4} />
      <div className="opening-inner">
        <div className="opening-monogram-stage">
          <WeddingMonogram artwork={wedding.media.openingMonogram} referenceFrame />
        </div>
        <div className="opening-signature">
          <h1 id="couple-names" className="opening-names">
            <span className="name-mask groom-reveal"><span>{wedding.groom.name}</span></span>
            <span className="opening-ampersand">
              <span className="ampersand-rule" aria-hidden="true" />
              <span>&amp;</span>
              <span className="ampersand-rule" aria-hidden="true" />
            </span>
            <span className="name-mask bride-reveal"><span>{wedding.bride.name}</span></span>
          </h1>
          <div className="opening-date">
            <div className="date-engraving" aria-hidden="true"><Ornament eager /></div>
            <time dateTime={wedding.date}>{formatWeddingDate().toUpperCase()}</time>
            <div className="date-engraving date-engraving--lower" aria-hidden="true"><Ornament eager /></div>
          </div>
        </div>
        <Reveal className="opening-message" group enabled={active}>
          <p className="opening-story" data-reveal-step="0">
            {wedding.story.beginnings.map((sentence, index) => <span key={sentence}>{index > 0 && ' '}{sentence}</span>)}
          </p>
          <div className="opening-story-seal" data-reveal-step="1" aria-hidden="true"><Ornament eager /></div>
        </Reveal>
      </div>
    </div>
    <Reveal id="invitation-message" className="opening-invitation" group enabled={active}>
      <p className="invitation-copy" data-reveal-step="0">{wedding.story.invitation}</p>
      <a className="scroll-cue" href="#wedding" aria-label="Discover our celebration">
        <span>Discover our celebration</span><ArrowDown size={17} strokeWidth={1} aria-hidden="true" />
      </a>
    </Reveal>
  </section>;
}
