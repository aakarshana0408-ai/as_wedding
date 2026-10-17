import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { wedding } from '../config/wedding';
import WeddingMonogram from './WeddingMonogram';
import useReducedMotion from '../hooks/useReducedMotion';

export default function IntroVideo({ onStart, onReveal, onComplete, leaving = false, ref }) {
  const videoRef = useRef(null);
  const started = useRef(false);
  const completed = useRef(false);
  const run = useRef(0);
  const pending = useRef(null);
  const playbackStarted = useRef(false);
  const [mode, setMode] = useState(wedding.media.introVideo ? 'video' : 'fallback');
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [starting, setStarting] = useState(false);
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

  const begin = useCallback((fromInteraction = false) => {
    if (leaving || started.current || playbackStarted.current) return Promise.resolve(false);
    if (pending.current && !fromInteraction) return pending.current;
    const id = ++run.current;
    const current = () => run.current === id && !started.current;
    const video = mode === 'video' ? videoRef.current : null;
    setStarting(true);
    const request = onStart(video, current, fromInteraction).then(success => {
      if (!current()) return false;
      setNeedsInteraction(!success);
      if (success) {
        playbackStarted.current = true;
        if (mode === 'fallback') setPlaying(true);
      }
      return success;
    }).catch(error => {
      if (!current() || error.name === 'AbortError') return false;
      if (video?.error || error.name === 'NotSupportedError') setMode('fallback');
      else setNeedsInteraction(true);
      return false;
    }).finally(() => {
      if (current()) { pending.current = null; setStarting(false); }
    });
    pending.current = request;
    return request;
  }, [leaving, mode, onStart]);

  useImperativeHandle(ref, () => ({ start: () => begin(true) }), [begin]);

  useEffect(() => {
    if (leaving) return;
    void begin();
    return () => {
      run.current += 1;
      pending.current = null;
      videoRef.current?.pause();
    };
  }, [leaving, mode, begin]);

  useEffect(() => {
    // Prepare only the opening's critical artwork and type while the film plays.
    for (const image of document.querySelectorAll('.opening img:not([loading="lazy"])')) {
      image.decode().catch(() => {});
    }
    document.fonts.load('1em "Great Vibes"').catch(() => {});
    document.fonts.load('1em "Cormorant Garamond"').catch(() => {});
  }, []);

  useEffect(() => {
    if (mode !== 'fallback' || !playing) return;
    const timer = window.setTimeout(enter, reduced ? 500 : 2800);
    return () => window.clearTimeout(timer);
  }, [mode, playing, enter, reduced]);

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
    }, 30000);
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
    {(needsInteraction || starting) && !playing && !leaving && <button type="button" className="intro-start"
      onClick={() => { void begin(true); }} aria-label="Play invitation with music" aria-busy={starting}>
      <span className="intro-start-label"><Play size={16} strokeWidth={1.4} aria-hidden="true" />{starting ? 'Starting...' : 'Play'}</span>
    </button>}
  </div>;
}
