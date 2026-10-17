import { useEffect, useImperativeHandle, useRef } from 'react';
import { wedding } from '../config/wedding';
import { createBackgroundMusic } from '../lib/backgroundMusic';

export default function BackgroundMusic({ enabled = true, introActive = false, onStateChange, ref }) {
  const audioRef = useRef(null);
  const controllerRef = useRef(null);
  const introActiveRef = useRef(introActive);

  useEffect(() => { introActiveRef.current = introActive; }, [introActive]);

  useEffect(() => {
    const controller = createBackgroundMusic(audioRef.current, onStateChange, wedding.music);
    controllerRef.current = controller;
    const unlock = event => {
      if (introActiveRef.current || !event.isTrusted || event.target instanceof Element && event.target.closest('.music-toggle, .intro-overlay')) return;
      void controller.resumeFromInteraction();
    };
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
      controllerRef.current = null;
      controller.destroy();
    };
  }, [onStateChange]);

  useImperativeHandle(ref, () => ({
    startFromInteraction: () => controllerRef.current?.resumeFromInteraction(),
    startIntro: (video, isCurrent, fromInteraction) => controllerRef.current?.startIntro(video, isCurrent, fromInteraction),
    toggle: () => controllerRef.current?.toggle(),
  }), []);

  return <audio ref={audioRef} src={wedding.media.backgroundMusic} muted={!enabled} preload="auto" hidden aria-hidden="true" />;
}
