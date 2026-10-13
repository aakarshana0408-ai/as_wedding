import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { wedding } from '../config/wedding';
import WeddingMonogram from './WeddingMonogram';
import useReducedMotion from '../hooks/useReducedMotion';

export default function IntroVideo({ onReveal, onComplete }) {
  const videoRef = useRef(null);
  const started = useRef(false);
  const [mode, setMode] = useState(wedding.media.introVideo ? 'video' : 'fallback');
  const [playing, setPlaying] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const reduced = useReducedMotion();

  const enter = useCallback(async () => {
    if (started.current) return;
    started.current = true;
    // Hold the last film frame while the opening's fonts and artwork prepare.
    const artwork = Array.from(document.querySelectorAll('.opening img'), image => image.decode().catch(() => {}));
    await Promise.race([
      Promise.all([document.fonts.ready, ...artwork]),
      new Promise(resolve => window.setTimeout(resolve, 1200)),
    ]);
    onReveal();
    requestAnimationFrame(() => requestAnimationFrame(() => setLeaving(true)));
  }, [onReveal]);

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
    const timer = window.setTimeout(onComplete, reduced ? 50 : 3300);
    return () => window.clearTimeout(timer);
  }, [leaving, reduced, onComplete]);

  useEffect(() => {
    if (mode !== 'video' || playing) return;
    const timer = window.setTimeout(() => {
      if (!started.current && videoRef.current?.readyState === 0) setMode('fallback');
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [mode, playing]);

  return <div className={`intro-overlay ${leaving ? 'is-leaving' : ''}`} aria-label="Wedding opening film"
    onTransitionEnd={event => {
      if (leaving && event.target === event.currentTarget && event.propertyName === 'opacity') onComplete();
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
