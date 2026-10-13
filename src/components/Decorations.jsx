import { useState } from 'react';
import { wedding } from '../config/wedding';

export function DecorativeImage({ src, className = '', eager = false, parallax = 0 }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return <img src={src} alt="" aria-hidden="true" className={className} data-parallax={parallax || undefined}
    loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />;
}

export function Ornament({ className = '', eager = false }) {
  return <DecorativeImage src={wedding.media.ornament} className={`gold-ornament ${className}`} eager={eager} />;
}

export function MaterialSurface({ silk = false }) {
  return <DecorativeImage src={silk ? wedding.media.silk : wedding.media.paper}
    className={`material-surface ${silk ? 'material-surface--silk' : ''}`} eager />;
}

export function Petals({ count = 6 }) {
  return <div className="petal-layer" aria-hidden="true">
    {Array.from({ length: count }, (_, index) => <DecorativeImage key={index} src={wedding.media.petal}
      className={`natural-petal natural-petal--${index % 6}`} />)}
  </div>;
}
