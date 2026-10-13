import { useEffect, useState } from 'react';
import { wedding, getMapsUrl } from '../config/wedding';
import { createVenueQr } from '../lib/venueQr';
import { DecorativeImage, MaterialSurface } from './Decorations';
import Reveal from './Reveal';

export default function ReceptionSection() {
  const [qr, setQr] = useState('');
  const [qrError, setQrError] = useState(false);
  const mapsUrl = getMapsUrl(wedding.reception);
  useEffect(() => {
    let active = true;
    createVenueQr(wedding.reception).then(url => { if (active) setQr(url); })
      .catch(() => { if (active) setQrError(true); });
    return () => { active = false; };
  }, []);
  return <section id="reception" data-scroll-scene className="reception-section" aria-labelledby="reception-heading">
    <MaterialSurface />
    <DecorativeImage src={wedding.media.floral} className="reception-floral" parallax={3} />
    <div className="reception-frame" aria-hidden="true" />
    <Reveal className="reception-copy" group><h2 id="reception-heading" className="section-label" data-reveal-step="0">The Reception</h2>
      <div className="reception-details" data-reveal-step="1">
        <p className="reception-time">{wedding.reception.time}</p><span className="fine-rule" aria-hidden="true" />
        <h3>{wedding.reception.venue}</h3><p className="reception-address">{wedding.reception.address}</p>
      </div>
      <div className="reception-location" data-reveal-step="2">
        <a className="reception-qr" href={mapsUrl} target="_blank" rel="noopener noreferrer"
          aria-label={`Open ${wedding.reception.venue} in Google Maps`}>
          {qr ? <img src={qr} width="768" height="768" alt={`QR code for ${wedding.reception.venue} in Google Maps`} />
            : <span className="qr-loading" role="status">{qrError ? 'Open in Google Maps' : 'Preparing location'}</span>}
        </a>
        <p className="qr-caption">SCAN TO FIND THE RECEPTION VENUE</p>
      </div>
    </Reveal>
  </section>;
}
