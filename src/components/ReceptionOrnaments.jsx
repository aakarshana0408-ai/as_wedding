function Corner({ className = '' }) {
  return <svg className={`reception-corner ${className}`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <path d="M7 33C7 20 15 10 32 7M14 22C5 22 3 15 4 7C12 9 17 14 14 22ZM18 16C13 8 17 3 23 1C27 9 24 14 18 16ZM23 13C26 6 32 6 37 8C34 15 29 17 23 13ZM10 27C4 25 1 28 2 34C8 35 12 32 10 27Z" />
  </svg>;
}

export function ReceptionCorners() {
  return <>{['top-left', 'top-right', 'bottom-right', 'bottom-left'].map(corner =>
    <Corner key={corner} className={`reception-corner--${corner}`} />)}</>;
}

export function ReceptionFrame() {
  const arch = 'M16 300V246Q16 226 34 220C38 186 69 172 98 170C105 138 124 127 152 130C170 82 212 62 265 72C284 36 337 28 400 0C463 28 516 36 535 72C588 62 630 82 648 130C676 127 695 138 702 170C731 172 762 186 766 220Q784 226 784 246V300';
  return <div className="reception-frame" aria-hidden="true">
    <div className="reception-outer-border">
      <ReceptionCorners />
      {['left', 'right'].map(side => <svg key={side} className={`reception-border-flower reception-border-flower--${side}`} viewBox="0 0 24 32" focusable="false">
        <path d="M12 2C5 6 7 10 12 13C17 10 19 6 12 2ZM12 15C8 10 4 12 2 16C4 20 8 22 12 17C16 22 20 20 22 16C20 12 16 10 12 15ZM12 19C7 22 5 26 12 30C19 26 17 22 12 19Z" />
      </svg>)}
    </div>
    <div className="reception-arch">
      <svg className="reception-arch-cap" viewBox="0 0 800 300" focusable="false">
        <path d={arch} /><path d={arch} transform="translate(6 7) scale(.985)" />
      </svg>
      <div className="reception-arch-legs">
        <Corner className="reception-corner--bottom-left" /><Corner className="reception-corner--bottom-right" />
      </div>
    </div>
  </div>;
}

export function ReceptionGanesha() {
  return <svg className="reception-ganesha" viewBox="0 0 100 140" aria-hidden="true" focusable="false">
    <path d="M45 14C42 9 45 6 50 2C55 6 58 9 55 14M36 24C37 16 43 13 50 13C57 13 63 16 64 24M34 29Q50 22 66 29M37 22Q50 17 63 22M35 33Q50 28 65 33" />
    <path d="M35 35C28 30 24 31 19 31L23 44Q26 49 34 49M65 35C72 30 76 31 81 31L77 44Q74 49 66 49M39 35C33 39 35 47 38 53L37 64M61 35C67 39 65 47 62 53L61 64M41 40L44 41M56 41L59 40M46 47C48 54 43 61 44 68M55 47L54 66C54 72 49 74 49 79C49 86 58 86 61 79M35 53Q29 54 30 64M65 53Q71 54 70 64" />
    <path d="M30 58Q24 58 23 69L18 70L16 62L12 64L15 75Q21 79 29 74M70 58Q76 58 77 69L82 70L84 62L88 64L85 75Q79 79 71 74M30 75C12 68 8 83 18 95C27 106 41 104 50 96C59 104 73 106 82 95C92 83 88 68 70 75M34 74Q38 82 39 91M66 74Q62 82 61 91M50 100Q40 106 47 112Q53 115 55 108M50 113C57 117 56 122 50 125C44 122 43 117 50 113M50 127Q43 133 50 138Q57 133 50 127" />
  </svg>;
}

export function ReceptionDivider({ className = '' }) {
  return <div className={`reception-divider ${className}`} aria-hidden="true">
    <span /><svg viewBox="0 0 32 36" focusable="false">
      <path d="M16 2C8 9 11 15 16 21C21 15 24 9 16 2ZM15 23C7 23 3 17 3 10C11 11 15 16 15 23ZM17 23C25 23 29 17 29 10C21 11 17 16 17 23ZM7 25Q16 33 25 25M16 23V34M11 31Q16 36 21 31" />
    </svg><span />
  </div>;
}
