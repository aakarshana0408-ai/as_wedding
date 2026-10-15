import { wedding, formatWeddingDate, getWeddingDateParts } from '../config/wedding';
import { DecorativeImage, MaterialSurface } from './Decorations';
import Reveal from './Reveal';

export default function ClosingSection() {
  const date = getWeddingDateParts();
  const month = formatWeddingDate(wedding.date, { day: undefined, month: 'short', year: undefined }).toUpperCase();
  return <footer data-scroll-scene className="closing-section" aria-label="Wedding announcement">
    <MaterialSurface />
    <div className="closing-botanicals" aria-hidden="true">
      {['left', 'right'].map(side => <div key={side} className={`closing-edge closing-edge--${side}`}>
        <DecorativeImage src={wedding.media.closingGarland} className="closing-garland" />
        <DecorativeImage src={wedding.media.closingLeaves} className="closing-leaves" />
      </div>)}
      {[0, 1, 2, 3, 4].map(index => <DecorativeImage key={index} src={wedding.media.closingPetal}
        className={`closing-painted-petal closing-painted-petal--${index}`} />)}
    </div>
    <Reveal className="closing-attire" delay={80}>
      <DecorativeImage src={wedding.media.closingCouple} className="closing-attire-image" />
    </Reveal>
    <Reveal className="closing-copy" group delay={180}>
      <p className="closing-save-date" data-reveal-step="0">Save the Date</p>
      <p className="closing-name closing-groom" data-reveal-step="1">{wedding.groom.name.toUpperCase()}</p>
      <p className="closing-connector" data-reveal-step="2">and</p>
      <p className="closing-name closing-bride" data-reveal-step="3">{wedding.bride.name.toUpperCase()}</p>
      <p className="closing-married" data-reveal-step="4">ARE GETTING MARRIED</p>
      <p className="closing-date" data-reveal-step="5">
        <time dateTime={wedding.date} aria-label={formatWeddingDate()}>
          <span>{month}</span><span className="closing-date-separator" aria-hidden="true"> | </span>
          <span className="closing-date-day">{date.day}</span><span className="closing-date-separator" aria-hidden="true"> | </span><span>{date.year}</span>
        </time>
      </p>
      <p className="closing-weekday" data-reveal-step="6">{date.weekday.toUpperCase()}</p>
      <p className="closing-muhurtham" data-reveal-step="7">{wedding.ceremony.time}</p>
    </Reveal>
  </footer>;
}
