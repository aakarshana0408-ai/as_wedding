import { useCallback, useEffect, useRef, useState } from 'react';
import { wedding } from '../config/wedding';
import WeddingMonogram from './WeddingMonogram';
import useReducedMotion from '../hooks/useReducedMotion';

export default function IntroVideo({ onStart, onReveal, onComplete, leaving = false }) {
  const videoRef = useRef(null);
  const started = useRef(false);
  const completed = useRef(false);
  const [mode, setMode] = useState(wedding.media.introVideo ? 'video' : 'fallback');
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const reduced = useReducedMotion();

  const enter = useCallback(event => {
    if (started.current || leaving) return;
    started.current = true;
    onReveal(event);
  }, [leaving, onReveal]);

  const complete = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (leaving || mode !== 'video') return;
    const video = videoRef.current;
    let current = true;
    onStart(video, () => current).catch(error => {
      if (!current || error.name === 'AbortError') return;
      if (video.error || error.name === 'NotSupportedError') setMode('fallback');
      else enter();
    });
    return () => { current = false; video.pause(); };
  }, [leaving, mode, onStart, enter]);

  useEffect(() => {
    // Prepare only the opening's critical artwork and type while the film plays.
    for (const image of document.querySelectorAll('.opening img:not([loading="lazy"])')) {
      image.decode().catch(() => {});
    }
    document.fonts.load('1em "Great Vibes"').catch(() => {});
    document.fonts.load('1em "Cormorant Garamond"').catch(() => {});
  }, []);

  useEffect(() => {
    if (mode !== 'fallback') return;
    const timer = window.setTimeout(enter, reduced ? 500 : 2800);
    return () => window.clearTimeout(timer);
  }, [mode, enter, reduced]);

  useEffect(() => {
    if (!leaving) return;
    started.current = true;
    videoRef.current?.pause();
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
      <video ref={videoRef} src={wedding.media.introVideo} muted playsInline preload="auto"
        aria-label="Wedding invitation opening film" onEnded={enter}
        onLoadedData={() => setReady(true)}
        onPlaying={() => { setPlaying(true); setMode('video'); }} onError={() => setMode('fallback')} />
    </div>}
    {((!ready && !playing) || mode === 'fallback') && <div className="intro-stationery" aria-hidden="true">
      <WeddingMonogram animated={false} />
      <span className="fine-rule" />
    </div>}
  </div>;
}
