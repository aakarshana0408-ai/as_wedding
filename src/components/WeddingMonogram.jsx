import { useId, useState } from 'react';
import { wedding } from '../config/wedding';

export default function WeddingMonogram({ animated = true, artwork = wedding.media.monogram, referenceFrame = false }) {
  const id = `wedding-monogram-${useId().replace(/:/g, '')}`;
  const [failed, setFailed] = useState(false);
  if (failed || !artwork) return null;
  const cx = referenceFrame ? 500 : 510;
  const cy = referenceFrame ? 500 : 493;
  const radius = referenceFrame ? 443 : 426;
  const strokeWidth = referenceFrame ? 44 : 32;

  return <div className={`monogram ${animated ? '' : 'monogram--static'}`}
    role="img" aria-label={`${wedding.bride.initial} and ${wedding.groom.initial} intertwined gold wedding monogram`}>
    <img className="monogram-preload" src={artwork} alt="" aria-hidden="true"
      width="1254" height="1254" decoding="async" onError={() => setFailed(true)} />
    <svg viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
      <defs>
        <image id={`${id}-art`} href={artwork} width="1000" height="1000" />
        {/* Complementary masks stage the photographic artwork, not substitute vector lettering. */}
        <mask id={`${id}-circle`} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000" style={{ maskType: 'luminance' }}>
          <circle className="monogram-circle-trace" cx={cx} cy={cy} r={radius} fill="none" stroke="white" strokeWidth={strokeWidth}
            pathLength="1" transform={`rotate(-90 ${cx} ${cy})`} />
        </mask>
        <mask id={`${id}-branches`} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000" style={{ maskType: 'luminance' }}>
          <rect width="1000" height="1000" fill="white" />
          <circle cx={cx} cy={cy} r="365" fill="black" />
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="black" strokeWidth={strokeWidth} />
        </mask>
        <mask id={`${id}-letters`} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000" style={{ maskType: 'luminance' }}>
          <circle cx={cx} cy={cy} r="365" fill="white" />
        </mask>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff5da" stopOpacity="0.6" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-foil`} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">
          <use href={`#${id}-art`} />
        </mask>
      </defs>
      <use href={`#${id}-art`} mask={`url(#${id}-circle)`} className="monogram-circle-art" />
      <use href={`#${id}-art`} mask={`url(#${id}-branches)`} className="monogram-botanicals" />
      <g mask={`url(#${id}-letters)`}>
        <use href={`#${id}-art`} className="monogram-letters" />
        <g mask={`url(#${id}-foil)`}>
          <rect className="monogram-light" x="-250" y="0" width="260" height="1000" fill={`url(#${id}-light)`} />
        </g>
      </g>
    </svg>
  </div>;
}
