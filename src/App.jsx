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
import BackgroundMusic from './components/BackgroundMusic';

export default function App() {
  const siteRef = useRef(null);
  const musicRef = useRef(null);
  const introRef = useRef(null);
  const introPlaybackStarted = useRef(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicStatus, setMusicStatus] = useState('idle');
  const [phase, setPhase] = useState('intro');
  const active = phase !== 'intro';
  useCinematicScroll(siteRef, active);
  const updateMusicState = useCallback(({ enabled, status }) => {
    setMusicEnabled(enabled);
    setMusicStatus(status);
  }, []);
  const reveal = useCallback(event => {
    if (event?.type === 'click' || event?.type === 'keydown') musicRef.current?.startFromInteraction();
    setPhase(current => current === 'intro' ? 'transition' : current);
  }, []);
  const startIntro = useCallback(async (video, isCurrent, fromInteraction) => {
    const success = await musicRef.current.startIntro(video, isCurrent, fromInteraction);
    if (success && isCurrent()) introPlaybackStarted.current = true;
    return success;
  }, []);
  const toggleMusic = () => {
    if (phase === 'intro' && !introPlaybackStarted.current && musicStatus !== 'playing') introRef.current?.start();
    else musicRef.current?.toggle();
  };
  const finish = useCallback(() => setPhase('open'), []);
  useEffect(() => {
    document.title = `${wedding.groom.name} weds ${wedding.bride.name} | Wedding Invitation`;
    document.querySelector('meta[name="description"]').content = `${wedding.groom.name} weds ${wedding.bride.name}. ${formatWeddingDate()}. A Tamil wedding invitation.`;
  }, []);
  useEffect(() => {
    document.body.classList.toggle('invitation-locked', !active);
    return () => document.body.classList.remove('invitation-locked');
  }, [active]);
  return <>
    <a href="#main-invitation" className="skip-link" onClick={event => {
      if (phase !== 'open') { event.preventDefault(); reveal(event); }
    }}>Skip to invitation</a>
    <BackgroundMusic ref={musicRef} enabled={musicEnabled} introActive={phase === 'intro'} onStateChange={updateMusicState} />
    <Header active={active} introVisible={phase !== 'open'} musicEnabled={musicEnabled} musicStatus={musicStatus} onMusicToggle={toggleMusic} />
    {phase !== 'open' && <IntroVideo ref={introRef} leaving={active} onStart={startIntro} onReveal={reveal} onComplete={finish} />}
    <div ref={siteRef} className={`invitation-site ${active ? 'is-ready' : 'is-waiting'}`} inert={!active}>
      <main id="main-invitation">
        <MonogramReveal active={active} />
        <LoveSection /><ParentsSection /><WeddingSection /><ReceptionSection /><PhotoGallery />
      </main>
      <ClosingSection />
    </div>
  </>;
}
