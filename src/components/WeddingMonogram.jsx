import { useId, useState } from 'react';
import { wedding } from '../config/wedding';

export default function WeddingMonogram({ animated = true }) {
  const [failed, setFailed] = useState(false);
  const [layersFailed, setLayersFailed] = useState(false);
  const maskId = useId();
  const layers = wedding.media.monogramLayers;
  const layered = animated && !layersFailed && ['circle', 'branches', 'flowers', 's', 'a'].every(name => layers?.[name]);
  if (failed || !wedding.media.monogram) return null;

  return <div className={`monogram ${animated ? layered ? 'monogram--layered' : 'monogram--fallback' : 'monogram--static'}`}
    role="img" aria-label={`${wedding.groom.initial} and ${wedding.bride.initial} intertwined gold wedding monogram`}>
    <img className="monogram-artwork" src={wedding.media.monogram} alt="" aria-hidden="true"
      width="1254" height="1254" loading="eager" fetchPriority="high" decoding="async" onError={() => setFailed(true)} />
    {layered && <div className="monogram-layers" aria-hidden="true">
      <svg className="monogram-masks" aria-hidden="true" focusable="false">
        <defs>
          <mask id={`${maskId}-circle`} maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1">
            <g transform={`scale(${1 / 1254})`}>
              <path className="monogram-circle-trace" pathLength="1" d="M604 117A492 477 0 1 1 604 1071A492 477 0 1 1 604 117" />
              <rect className="monogram-finial monogram-finial--top" x="535" y="0" width="190" height="245" fill="white" />
              <rect className="monogram-finial monogram-finial--bottom" x="535" y="945" width="190" height="309" fill="white" />
            </g>
          </mask>
          <mask id={`${maskId}-branches`} maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1">
            <g transform={`scale(${1 / 1254})`}>
              <path className="monogram-branch-trace" pathLength="1" d="M132 650C110 495 170 350 260 265S450 165 550 215" />
              <path className="monogram-branch-trace" pathLength="1" d="M800 1055C980 1030 1085 900 1100 750S1090 570 1160 440" />
            </g>
          </mask>
        </defs>
      </svg>
      {['circle', 'branches', 'flowers', 's', 'a'].map(name => <img key={name}
        className={`monogram-layer monogram-layer--${name} ${name === 's' || name === 'a' ? `monogram-letter monogram-letter--${name}` : ''}`}
        src={layers[name]} alt="" width="1254" height="1254" loading="eager" fetchPriority="high" decoding="async"
        style={name === 'circle' || name === 'branches' ? {
          maskImage: `url("#${maskId}-${name}")`, WebkitMaskImage: `url("#${maskId}-${name}")`,
        } : undefined}
        onError={() => setLayersFailed(true)} />)}
    </div>}
  </div>;
}
