import Reveal from './Reveal';

export function ParentsDividerOrnament() {
  return <svg className="parents-divider-ornament" viewBox="0 0 48 20" aria-hidden="true" focusable="false">
    <path d="M24 2C17 2 16 10 10 10C4 10 4 18 10 18C17 18 17 10 24 10C31 10 31 2 38 2C44 2 44 10 38 10C32 10 31 18 24 18C17 18 17 10 10 10C4 10 4 2 10 2C17 2 17 10 24 10C31 10 31 18 38 18C44 18 44 10 38 10C32 10 31 2 24 2Z" />
  </svg>;
}

function TempleCorner({ corner }) {
  return <svg className={`parents-corner parents-corner--${corner}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <path pathLength="1" d="M7 58V19Q7 7 19 7H58M13 52V22Q13 13 22 13H52" />
    <path pathLength="1" d="M17 40V24H24V17H40M23 40V30H30V23H40" />
  </svg>;
}

export function ParentsFrame() {
  return <Reveal className="parents-frame" group aria-hidden="true">
    <svg className="parents-border" aria-hidden="true" focusable="false">
      <rect className="parents-border-outer" pathLength="1" />
      <rect className="parents-border-inner" pathLength="1" />
    </svg>
    {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => <TempleCorner key={corner} corner={corner} />)}
  </Reveal>;
}

export function ParentsRule() {
  return <div className="parents-rule" aria-hidden="true"><span /></div>;
}
