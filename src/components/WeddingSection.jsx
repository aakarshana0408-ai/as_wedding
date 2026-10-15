import { useEffect, useState } from 'react';
import { wedding, formatWeddingDate, getWeddingDateParts, getMapsUrl } from '../config/wedding';
import { createVenueQr } from '../lib/venueQr';
import { DecorativeImage, MaterialSurface, Ornament } from './Decorations';
import Reveal from './Reveal';
import WeddingCountdown from './WeddingCountdown';

function WeddingCorners() {
  return <>{['top-left', 'top-right', 'bottom-right', 'bottom-left'].map(corner =>
    <DecorativeImage key={corner} src={wedding.media.openingCorner} className={`wedding-gold-corner wedding-gold-corner--${corner}`} />)}</>;
}

function WeddingDivider({ className = '' }) {
  return <div className={`wedding-details-divider ${className}`} aria-hidden="true"><span /><Ornament /><span /></div>;
}

export default function WeddingSection() {
  const date = getWeddingDateParts();
  const [qr, setQr] = useState('');
  const [qrError, setQrError] = useState(false);
  const mapsUrl = getMapsUrl(wedding.ceremony);
  const venueAddress = [wedding.ceremony.venue, wedding.ceremony.address].filter(Boolean).join(', ');
  const [village, ...region] = wedding.ceremony.address.split(',').map(part => part.trim());
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
        <div className="wedding-details-design">
          <DecorativeImage src={wedding.media.weddingDetailsBackdrop} className="wedding-details-background" />
          <div className="wedding-details-frame" aria-hidden="true"><WeddingCorners /></div>
          <Reveal className="wedding-details-copy" group>
            <div className="date-face" data-reveal-step="0">
              <h2 id="wedding-heading" className="section-label">OUR WEDDING</h2>
              <WeddingDivider className="wedding-details-divider--heading" />
              <time className="wedding-date" dateTime={wedding.date} aria-label={formatWeddingDate(wedding.date, { weekday: 'long' })}>
                <span className="date-weekday">{date.weekday.toUpperCase()}</span>
                <span className="date-numeral">{date.day}</span>
                <span className="date-month">{date.month.toUpperCase()}</span>
                <span className="date-year">{date.year}</span>
              </time>
            </div>
            <div className="wedding-ceremony" data-reveal-step="1">
              <WeddingDivider />
              <p className="section-label">MUHURTHAM</p>
              <p className="event-time">{wedding.ceremony.time}</p>
              <WeddingDivider />
              <p className="event-venue"><span>{wedding.ceremony.venue}, {village},</span><span>{region.join(', ')}</span></p>
              <div className="ceremony-location">
                <a className="ceremony-qr" href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  aria-label={`Open ${venueAddress} in Google Maps`}>
                  <WeddingCorners />
                  {qr ? <img src={qr} width="768" height="768" alt={`QR code for ${venueAddress} in Google Maps`} />
                    : <span className="qr-loading" role="status">{qrError ? 'Open in Google Maps' : 'Preparing location'}</span>}
                </a>
                <p className="qr-caption">SCAN TO FIND THE VENUE</p>
              </div>
            </div>
            <div data-reveal-step="2"><WeddingDivider className="wedding-details-divider--last" /></div>
          </Reveal>
        </div>
        <WeddingCountdown />
      </Reveal>
  </section>;
}
