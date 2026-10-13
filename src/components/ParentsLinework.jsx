import Reveal from './Reveal';

function LotusMotif({ className = '' }) {
  return <svg className={`parents-lotus ${className}`} viewBox="0 0 64 34" aria-hidden="true" focusable="false">
    <path d="M8 22C16 24 23 25 32 24C41 25 48 24 56 22M32 24C22 18 23 9 32 3C41 9 42 18 32 24M32 24C18 24 12 18 11 10C23 10 29 15 32 24M32 24C46 24 52 18 53 10C41 10 35 15 32 24M32 24C18 28 7 24 3 17C14 15 25 19 32 24M32 24C46 28 57 24 61 17C50 15 39 19 32 24M20 29Q32 32 44 29" />
  </svg>;
}

function TempleCorner({ corner }) {
  return <svg className={`parents-corner parents-corner--${corner}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <path pathLength="1" d="M7 58V19Q7 7 19 7H58M13 52V22Q13 13 22 13H52" />
    <path pathLength="1" d="M16 23C14 15 16 10 23 9C23 16 20 21 16 23ZM16 23C24 23 29 19 30 13C22 12 17 16 16 23ZM16 23C15 31 12 34 8 37M23 16C31 15 34 12 37 8" />
  </svg>;
}

function KolamPanel({ side }) {
  return <svg className={`parents-kolam parents-kolam--${side}`} viewBox="0 0 100 240" aria-hidden="true" focusable="false">
    <path pathLength="1" d="M50 18C70 18 84 34 84 54C84 76 55 78 50 96C44 116 16 116 16 138C16 158 33 172 50 172C68 172 84 186 84 204C84 225 64 232 50 222C36 232 16 225 16 204C16 186 32 172 50 172C68 172 84 158 84 138C84 116 56 116 50 96C45 78 16 76 16 54C16 34 30 18 50 18Z" />
    <path pathLength="1" d="M50 32C35 42 30 58 43 72C56 86 71 86 72 105C73 123 55 131 50 148C45 165 28 170 28 190C28 204 39 217 50 222C61 217 72 204 72 190C72 170 55 165 50 148C45 131 27 123 28 105C29 86 44 86 57 72C70 58 65 42 50 32Z" />
  </svg>;
}

export function ParentsFrame() {
  return <Reveal className="parents-frame" group aria-hidden="true">
    <svg className="parents-border" aria-hidden="true" focusable="false">
      <rect className="parents-border-outer" pathLength="1" />
      <rect className="parents-border-inner" pathLength="1" />
    </svg>
    {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => <TempleCorner key={corner} corner={corner} />)}
    <KolamPanel side="left" /><KolamPanel side="right" />
    <LotusMotif className="parents-frame-motif parents-frame-motif--top" />
    <LotusMotif className="parents-frame-motif parents-frame-motif--bottom" />
  </Reveal>;
}

export function ParentsRule() {
  return <div className="parents-rule" aria-hidden="true"><span /><LotusMotif /><span /></div>;
}
