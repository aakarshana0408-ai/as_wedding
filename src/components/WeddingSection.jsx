import { useEffect, useState } from 'react';
import { wedding, formatWeddingDate, getWeddingDateParts, getMapsUrl } from '../config/wedding';
import { createVenueQr } from '../lib/venueQr';
import { DecorativeImage, MaterialSurface } from './Decorations';
import Reveal from './Reveal';
import WeddingCountdown from './WeddingCountdown';

export default function WeddingSection() {
  const date = getWeddingDateParts();
  const [qr, setQr] = useState('');
  const [qrError, setQrError] = useState(false);
  const mapsUrl = getMapsUrl(wedding.ceremony);
  const venueAddress = [wedding.ceremony.venue, wedding.ceremony.address].filter(Boolean).join(', ');
  useEffect(() => {
    let active = true;
    createVenueQr(wedding.ceremony).then(url => { if (active) setQr(url); })
      .catch(() => { if (active) setQrError(true); });
    return () => { active = false; };
  }, []);
  return <section id="wedding" data-scroll-scene className="wedding-section" aria-labelledby="wedding-heading">
      <MaterialSurface />
      <DecorativeImage src={wedding.media.ceremonyBackdrop} className="ceremony-art" />
      <div className="ceremony-frame" aria-hidden="true" />
      <Reveal className="wedding-date-card" group>
        <MaterialSurface />
        <div className="date-face" data-reveal-step="0">
          <DecorativeImage src={wedding.media.openingCorner} className="date-corner date-corner--first" />
          <DecorativeImage src={wedding.media.openingCorner} className="date-corner date-corner--last" />
          <h2 id="wedding-heading" className="section-label">OUR WEDDING</h2>
          <time className="wedding-date" dateTime={wedding.date} aria-label={formatWeddingDate(wedding.date, { weekday: 'long' })}>
            <span className="date-weekday">{date.weekday}</span>
            <span className="date-numeral">{date.day}</span>
            <span className="date-month">{date.month}</span>
            <span className="date-year">{date.year}</span>
          </time>
        </div>
        <div className="wedding-ceremony" data-reveal-step="1">
          <span className="fine-rule" aria-hidden="true" />
          <p className="section-label">MUHURTHAM</p>
          <p className="event-time">{wedding.ceremony.time}</p>
          <p className="event-venue">{venueAddress}</p>
          <div className="ceremony-location">
            <a className="ceremony-qr" href={mapsUrl} target="_blank" rel="noopener noreferrer"
              aria-label={`Open ${venueAddress} in Google Maps`}>
              {qr ? <img src={qr} width="768" height="768" alt={`QR code for ${venueAddress} in Google Maps`} />
                : <span className="qr-loading" role="status">{qrError ? 'Open in Google Maps' : 'Preparing location'}</span>}
            </a>
            <p className="qr-caption">SCAN TO FIND THE VENUE</p>
          </div>
        </div>
        <WeddingCountdown />
      </Reveal>
  </section>;
}
