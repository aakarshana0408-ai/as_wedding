import { useEffect, useState } from 'react';
import { wedding } from '../config/wedding';
import { getCountdown } from '../lib/countdown';
import Reveal from './Reveal';

const units = ['days', 'hours', 'minutes', 'seconds'];

export default function WeddingCountdown() {
  const [remaining, setRemaining] = useState(null);
  const target = wedding.ceremony.startsAt;
  useEffect(() => {
    const update = () => setRemaining(getCountdown(target));
    update();
    const timer = window.setInterval(update, 1000);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, [target]);

  return <Reveal className="wedding-countdown" group delay={80} role="group" aria-labelledby="countdown-heading" aria-busy={!remaining}>
    <h2 id="countdown-heading" className="section-label" data-reveal-step="0">{wedding.countdown.heading}</h2>
    {remaining?.complete ? <p className="countdown-complete" role="status" data-reveal-step="1">{wedding.countdown.completeMessage}</p>
      : <dl className="countdown-grid" data-reveal-step="1" aria-live="off" aria-label="Time remaining until the wedding muhurtham">
        {units.map(unit => <div className="countdown-unit" key={unit}>
          <dt className="countdown-label">{unit}</dt>
          <dd className="countdown-value">{remaining ? String(remaining[unit]).padStart(2, '0') : '--'}</dd>
        </div>)}
      </dl>}
  </Reveal>;
}
