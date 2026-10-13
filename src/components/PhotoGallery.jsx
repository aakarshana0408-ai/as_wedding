import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { wedding } from '../config/wedding';
import Reveal from './Reveal';

export default function PhotoGallery() {
  const [selected, setSelected] = useState(null);
  const [failed, setFailed] = useState([]);
  const images = wedding.gallery.images;
  if (!wedding.gallery.enabled) return null;
  const available = images.map((photo, index) => photo.src && !failed.includes(index) ? index : null).filter(index => index !== null);
  const navigate = offset => {
    const current = available.indexOf(selected);
    setSelected(available[(current + offset + available.length) % available.length]);
  };
  return <section className="gallery-section paper-section" aria-labelledby="gallery-heading">
    <h2 id="gallery-heading" className="section-label">Our Moments</h2>
    <div className="gallery-grid">{(images.length ? images : [{}, {}, {}]).map((photo, index) => <Reveal key={photo.src || index}>
      {photo.src && !failed.includes(index) ? <button className="gallery-photo" onClick={() => setSelected(index)} aria-label={`View ${photo.alt || 'wedding photograph'}`}>
        <img src={photo.src} alt={photo.alt || 'Wedding photograph'} loading="lazy" onError={() => setFailed(previous => [...previous, index])} />
      </button> : <div className="gallery-placeholder" role="img" aria-label="Wedding photograph placeholder" />}
    </Reveal>)}</div>
    {selected !== null && <dialog className="gallery-dialog" ref={dialog => { if (dialog && !dialog.open) dialog.showModal(); }}
      onCancel={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) setSelected(null); }} aria-label="Wedding photograph">
      <button className="icon-button lightbox-close" onClick={() => setSelected(null)} aria-label="Close photograph" title="Close"><X /></button>
      <img src={images[selected].src} alt={images[selected].alt || 'Wedding photograph'} onError={() => { setFailed(previous => [...previous, selected]); setSelected(null); }} />
      {available.length > 1 && <div className="lightbox-controls">
        <button className="icon-button" aria-label="Previous photograph" title="Previous" onClick={() => navigate(-1)}><ChevronLeft /></button>
        <button className="icon-button" aria-label="Next photograph" title="Next" onClick={() => navigate(1)}><ChevronRight /></button>
      </div>}
    </dialog>}
  </section>;
}
