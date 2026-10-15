import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { wedding } from '../config/wedding';

const links = [['Invitation', '#invitation'], ['Celebrations', '#wedding']];
export default function Header({ active = false }) {
  const [open, setOpen] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  useEffect(() => {
    const close = event => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  useEffect(() => {
    if (!active || logoVisible) return;
    const opening = document.getElementById('invitation');
    const nextSection = document.querySelector('.love-section');
    if (!opening || !nextSection) return;
    let disposed = false;
    let observer;
    const revealLogo = () => {
      if (disposed || opening.getBoundingClientRect().top >= 0
        || nextSection.getBoundingClientRect().top >= window.innerHeight) return;
      setLogoVisible(true);
      observer?.disconnect();
    };
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(revealLogo, { threshold: [0, 0.08, 1] });
      observer.observe(opening);
      observer.observe(nextSection);
    } else {
      window.addEventListener('scroll', revealLogo, { passive: true });
      revealLogo();
    }
    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener('scroll', revealLogo);
    };
  }, [active, logoVisible]);
  return <header className={`invitation-header ${logoVisible ? 'is-past-opening' : ''}`}>
    <a className={`header-initials ${logoVisible ? 'is-visible' : ''}`} href="#invitation"
      aria-label="Back to the invitation" aria-hidden={!logoVisible} tabIndex={logoVisible ? 0 : -1}>
      <span>{wedding.groom.initial}</span>{' '}<span className="header-ampersand">&amp;</span>{' '}<span>{wedding.bride.initial}</span>
    </a>
    <button className="menu-button icon-button" aria-label={open ? 'Close menu' : 'Open menu'} title={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open} aria-controls="invitation-navigation" onClick={() => setOpen(value => !value)}>
      {open ? <X size={21} /> : <Menu size={23} strokeWidth={1} />}
    </button>
    <nav id="invitation-navigation" className={open ? 'is-open' : ''} aria-label="Invitation sections">
      {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
    </nav>
  </header>;
}
