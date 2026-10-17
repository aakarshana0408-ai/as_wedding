import { useEffect, useImperativeHandle, useRef } from 'react';
import { wedding } from '../config/wedding';
import { createBackgroundMusic } from '../lib/backgroundMusic';

export default function BackgroundMusic({ onStatusChange, ref }) {
  const audioRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    const controller = createBackgroundMusic(audioRef.current, onStatusChange, wedding.music);
    controllerRef.current = controller;
    const unlock = event => {
      if (!event.isTrusted || event.target instanceof Element && event.target.closest('.music-toggle')) return;
      void controller.resumeFromInteraction();
    };
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);
    void controller.startOnce();
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
      controllerRef.current = null;
      controller.destroy();
    };
  }, [onStatusChange]);

  useImperativeHandle(ref, () => ({
    startFromInteraction: () => controllerRef.current?.resumeFromInteraction(),
    startIntro: (video, isCurrent) => controllerRef.current?.startIntro(video, isCurrent),
    toggle: () => controllerRef.current?.toggle(),
  }), []);

  return <audio ref={audioRef} src={wedding.media.backgroundMusic} preload="auto" hidden aria-hidden="true" />;
}
