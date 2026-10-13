let observer;
const callbacks = new Map();

function releaseObserver() {
  if (!callbacks.size && observer) {
    observer.disconnect();
    observer = undefined;
  }
}

export function observeReveal(element, reveal) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    reveal();
    return () => {};
  }
  if (!observer) {
    const current = new window.IntersectionObserver(entries => {
      if (observer !== current) return;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const callback = callbacks.get(entry.target);
        if (!callback) continue;
        callbacks.delete(entry.target);
        current.unobserve(entry.target);
        callback();
      }
      releaseObserver();
    }, { threshold: 0.08, rootMargin: '0px 0px -16px 0px' });
    observer = current;
  }
  callbacks.set(element, reveal);
  observer.observe(element);
  return () => {
    callbacks.delete(element);
    observer?.unobserve(element);
    releaseObserver();
  };
}

export function getParallaxOffset(top, height, viewport, distance) {
  if (![top, height, viewport, distance].every(Number.isFinite) || height <= 0 || viewport <= 0) return 0;
  const progress = Math.max(0, Math.min(1, (viewport - top) / (viewport + height)));
  return (progress * 2 - 1) * Math.max(0, Math.min(8, distance));
}
