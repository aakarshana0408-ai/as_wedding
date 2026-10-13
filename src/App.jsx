import { useCallback, useEffect, useRef, useState } from 'react';
import { wedding, formatWeddingDate } from './config/wedding';
import IntroVideo from './components/IntroVideo';
import MonogramReveal from './components/MonogramReveal';
import Header from './components/Header';
import LoveSection from './components/LoveSection';
import ParentsSection from './components/ParentsSection';
import WeddingSection from './components/WeddingSection';
import ReceptionSection from './components/ReceptionSection';
import PhotoGallery from './components/PhotoGallery';
import ClosingSection from './components/ClosingSection';
import useCinematicScroll from './hooks/useCinematicScroll';

export default function App() {
  const siteRef = useRef(null);
  const [phase, setPhase] = useState('intro');
  const [revealing, setRevealing] = useState(false);
  useCinematicScroll(siteRef, phase === 'open');
  const reveal = useCallback(() => setPhase('transition'), []);
  const finish = useCallback(() => { setPhase('open'); setRevealing(true); }, []);
  useEffect(() => {
    document.title = `${wedding.groom.name} weds ${wedding.bride.name} | Wedding Invitation`;
    document.querySelector('meta[name="description"]').content = `${wedding.groom.name} weds ${wedding.bride.name}. ${formatWeddingDate()}. A Tamil wedding invitation.`;
  }, []);
  useEffect(() => {
    document.body.classList.toggle('invitation-locked', phase !== 'open');
    return () => document.body.classList.remove('invitation-locked');
  }, [phase]);
  return <>
    <a href="#main-invitation" className="skip-link" onClick={finish}>Skip to invitation</a>
    {phase !== 'open' && <IntroVideo onReveal={reveal} onComplete={finish} />}
    <div ref={siteRef} className={`invitation-site ${phase === 'intro' ? 'is-waiting' : 'is-ready'}`} inert={phase !== 'open'}>
      <Header active={phase === 'open'} /><main id="main-invitation">
        <MonogramReveal active={revealing} />
        {phase === 'open' && <><LoveSection /><ParentsSection /><WeddingSection /><ReceptionSection /><PhotoGallery /></>}
      </main>
      {phase === 'open' && <ClosingSection />}
    </div>
  </>;
}
