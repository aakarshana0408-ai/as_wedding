import { useEffect, useState } from 'react';
import { wedding, getMapsUrl } from '../config/wedding';
import { createVenueQr } from '../lib/venueQr';
import { DecorativeImage, MaterialSurface } from './Decorations';
import Reveal from './Reveal';
import { ReceptionCorners, ReceptionDivider, ReceptionFrame, ReceptionGanesha } from './ReceptionOrnaments';

export default function ReceptionSection() {
  const [qr, setQr] = useState('');
  const [qrError, setQrError] = useState(false);
  const mapsUrl = getMapsUrl(wedding.reception);
  const [venueName, venueFacility] = wedding.reception.venue.split(/ (?=\(A\/C\)$)/);
  useEffect(() => {
    let active = true;
    createVenueQr(wedding.reception).then(url => { if (active) setQr(url); })
      .catch(() => { if (active) setQrError(true); });
    return () => { active = false; };
  }, []);
  return <section id="reception" data-scroll-scene className="reception-section" aria-labelledby="reception-heading">
    <MaterialSurface />
    <div className="reception-composition">
      <ReceptionFrame />
      {['left', 'right'].map(side => <DecorativeImage key={side} src={wedding.media.receptionLamp}
        className={`reception-hanging-lamp reception-hanging-lamp--${side}`} />)}
      <Reveal className="reception-copy" group>
        <div className="reception-introduction" data-reveal-step="0">
          <ReceptionGanesha />
          <h2 id="reception-heading">THE RECEPTION</h2>
          <ReceptionDivider className="reception-divider--heading" />
        </div>
        <div className="reception-time-block" data-reveal-step="1">
          <p className="reception-time">{wedding.reception.time}</p>
          <ReceptionDivider />
        </div>
        <div className="reception-details" data-reveal-step="2">
          <h3>{venueName}{venueFacility && <span className="reception-facility"> {venueFacility}</span>}</h3>
          <p className="reception-address">{wedding.reception.address}</p>
          <ReceptionDivider />
        </div>
        <div className="reception-location" data-reveal-step="3">
          <a className="reception-qr" href={mapsUrl} target="_blank" rel="noopener noreferrer"
            aria-label={`Open ${wedding.reception.venue} in Google Maps`}>
            <ReceptionCorners />
            {qr ? <img src={qr} width="768" height="768" alt={`QR code for ${wedding.reception.venue} in Google Maps`} />
              : <span className="qr-loading" role="status">{qrError ? 'Open in Google Maps' : 'Preparing location'}</span>}
          </a>
          <p className="qr-caption">SCAN OR CLICK TO VIEW THE VENUE</p>
        </div>
        <ReceptionDivider className="reception-divider--last" />
      </Reveal>
    </div>
  </section>;
}
