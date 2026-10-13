import { useEffect } from 'react';
import useReducedMotion from './useReducedMotion';
import { getParallaxOffset } from '../lib/scrollMotion';

export default function useCinematicScroll(ref, enabled) {
  const reduced = useReducedMotion();
  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled || reduced || !('IntersectionObserver' in window)) return;
    const scenes = [...root.querySelectorAll('[data-scroll-scene]')];
    const decorations = new Map(scenes.map(scene => [scene, [...scene.querySelectorAll('[data-parallax]')]]));
    const visible = new Set();
    let frame = 0;
    root.classList.add('has-scroll-motion');

    const update = () => {
      frame = 0;
      // Read scene geometry once per frame, then write only decorative transforms.
      const positions = [...visible].map(scene => [scene, scene.getBoundingClientRect()]);
      for (const [scene, bounds] of positions) {
        for (const element of decorations.get(scene)) {
          const offset = getParallaxOffset(bounds.top, bounds.height, window.innerHeight, Number(element.dataset.parallax));
          element.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
        }
      }
    };
    const schedule = () => {
      if (!frame && visible.size && document.visibilityState !== 'hidden') frame = window.requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visible.add(entry.target);
          entry.target.classList.add('scene-entered');
        } else visible.delete(entry.target);
      }
      schedule();
    });
    scenes.forEach(scene => observer.observe(scene));
    const visibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else schedule();
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('visibilitychange', visibilityChange);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', visibilityChange);
      root.classList.remove('has-scroll-motion');
      for (const elements of decorations.values()) elements.forEach(element => element.style.removeProperty('--parallax-y'));
    };
  }, [ref, enabled, reduced]);
}
