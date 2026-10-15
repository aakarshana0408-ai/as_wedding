import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { wedding } from '../config/wedding';
import WeddingMonogram from './WeddingMonogram';
import useReducedMotion from '../hooks/useReducedMotion';

export default function IntroVideo({ onReveal, onComplete, leaving = false }) {
  const videoRef = useRef(null);
  const started = useRef(false);
  const completed = useRef(false);
  const [mode, setMode] = useState(wedding.media.introVideo ? 'video' : 'fallback');
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();

  const enter = useCallback(() => {
    if (started.current || leaving) return;
    started.current = true;
    onReveal();
  }, [leaving, onReveal]);

  const complete = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Prepare only the opening's critical artwork and type while the film plays.
    for (const image of document.querySelectorAll('.opening img:not([loading="lazy"])')) {
      image.decode().catch(() => {});
    }
    document.fonts.load('1em "Great Vibes"').catch(() => {});
    document.fonts.load('1em "Cormorant Garamond"').catch(() => {});
  }, []);

  useEffect(() => {
    if (mode !== 'video') return;
    let disposed = false;
    videoRef.current?.play().catch(error => {
      if (disposed || started.current) return;
      const unavailable = videoRef.current?.error || error.name === 'NotSupportedError';
      setMode(current => current === 'fallback' || unavailable ? 'fallback'
        : error.name === 'AbortError' ? current : 'blocked');
    });
    return () => { disposed = true; };
  }, [mode]);

  useEffect(() => {
    if (mode !== 'fallback') return;
    const timer = window.setTimeout(enter, reduced ? 500 : 2800);
    return () => window.clearTimeout(timer);
  }, [mode, enter, reduced]);

  useEffect(() => {
    if (!leaving) return;
    started.current = true;
    const timer = window.setTimeout(complete, reduced ? 50 : 700);
    return () => window.clearTimeout(timer);
  }, [leaving, reduced, complete]);

  useEffect(() => {
    if (mode !== 'video' || playing) return;
    const timer = window.setTimeout(() => {
      if (!started.current && videoRef.current?.readyState === 0) setMode('fallback');
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [mode, playing]);

  return <div className={`intro-overlay ${leaving ? 'is-leaving' : ''}`} aria-label="Wedding opening film"
    onTransitionEnd={event => {
      if (leaving && event.target === event.currentTarget && event.propertyName === 'opacity') complete();
    }}>
    {mode !== 'fallback' && <div className="intro-film">
      <video ref={videoRef} src={wedding.media.introVideo} muted playsInline autoPlay preload="auto"
        aria-label="Wedding invitation opening film" onEnded={enter}
        onPlaying={() => { setPlaying(true); setMode('video'); }} onError={() => setMode('fallback')} />
    </div>}
    {(!playing || mode === 'fallback') && <div className="intro-stationery" aria-hidden="true">
      <WeddingMonogram animated={false} />
      <span className="fine-rule" />
    </div>}
    {mode === 'blocked' && !leaving && <button className="enter-invitation" onClick={enter}>
      Enter Invitation <ArrowRight size={16} aria-hidden="true" />
    </button>}
  </div>;
}
