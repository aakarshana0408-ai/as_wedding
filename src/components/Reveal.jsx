import { useEffect, useRef, useState } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';
import { observeReveal } from '../lib/scrollMotion';

export default function Reveal({ children, className = '', direction = '', delay = 0, group = false, enabled = true, as: Tag = 'div', ...props }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!enabled || visible) return;
    if (reduced || !('IntersectionObserver' in window)) { setVisible(true); return; }
    return observeReveal(ref.current, () => setVisible(true));
  }, [reduced, enabled, visible]);
  return <Tag {...props} ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${group ? 'reveal--group' : ''} ${direction ? `reveal--${direction}` : ''} ${className}`}
    style={{ '--reveal-delay': `${delay}ms` }}>{children}</Tag>;
}
