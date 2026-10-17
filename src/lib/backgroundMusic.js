export function createBackgroundMusic(audio, onChange, { start, end }) {
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) {
    throw new RangeError('Music requires a valid source segment.');
  }
  let attempted = false;
  let disposed = false;
  let enabled = true;
  let retryOnInteraction = false;
  let request = 0;
  let savedPosition = start;
  let pendingPosition = start;

  const report = status => { if (!disposed) onChange({ status, enabled }); };
  const cue = () => {
    if (pendingPosition === null || audio.readyState < 1) return;
    audio.currentTime = pendingPosition;
    pendingPosition = null;
  };
  const save = () => {
    if (audio.currentTime >= start) savedPosition = Math.min(end, audio.currentTime);
  };
  const playing = () => {
    if (audio.paused) return;
    if (!enabled) { audio.pause(); return; }
    retryOnInteraction = false;
    report('playing');
  };
  const paused = () => {
    if (!audio.paused || audio.ended) return;
    save();
    request += 1;
    retryOnInteraction = enabled;
    report('paused');
  };
  const repeat = () => {
    if (disposed || !enabled || audio.currentTime < end) return;
    // Repeat only the selected passage, never the file's silent first 20 seconds.
    savedPosition = start;
    pendingPosition = start;
    cue();
    if (audio.paused) void play();
  };
  const timeUpdate = () => { save(); repeat(); };
  const unavailable = () => { save(); request += 1; report('unavailable'); };
  audio.muted = false;
  audio.loop = false;
  audio.addEventListener('loadedmetadata', cue);
  audio.addEventListener('playing', playing);
  audio.addEventListener('pause', paused);
  audio.addEventListener('ended', repeat);
  audio.addEventListener('timeupdate', timeUpdate);
  audio.addEventListener('error', unavailable);
  cue();

  function play() {
    if (disposed || !enabled) return Promise.resolve(false);
    const current = ++request;
    const failed = error => {
      if (!disposed && current === request && error.name !== 'AbortError') {
        retryOnInteraction = error.name === 'NotAllowedError';
        report(error.name === 'NotAllowedError' ? 'blocked' : 'unavailable');
      }
      return false;
    };
    try {
      retryOnInteraction = false;
      audio.muted = false;
      if (audio.currentTime >= end) { savedPosition = start; pendingPosition = start; }
      if (audio.error) { pendingPosition = savedPosition; audio.load(); }
      cue();
      return Promise.resolve(audio.play()).then(() => {
        if (disposed || !enabled || current !== request || audio.paused) return false;
        report('playing');
        return true;
      }, failed);
    } catch (error) {
      return Promise.resolve(failed(error));
    }
  }

  function pause() {
    if (disposed) return;
    enabled = false;
    audio.muted = true;
    retryOnInteraction = false;
    save();
    request += 1;
    audio.pause();
    report('paused');
  }

  function startOnce() {
    if (disposed || attempted || !enabled) return Promise.resolve(false);
    attempted = true;
    return play();
  }

  return {
    startOnce,
    pause,
    resumeFromInteraction() {
      if (disposed || !enabled || !retryOnInteraction || !audio.paused) return Promise.resolve(false);
      return play();
    },
    async startIntro(video, isCurrent = () => true) {
      if (disposed || !isCurrent()) return false;
      // Audible autoplay must never hold up the muted film.
      void startOnce();
      await video.play();
      return !disposed && isCurrent();
    },
    toggle() {
      if (disposed) return Promise.resolve(false);
      attempted = true;
      if (enabled) {
        pause();
        return Promise.resolve(false);
      }
      enabled = true;
      audio.muted = false;
      return play();
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      request += 1;
      audio.removeEventListener('loadedmetadata', cue);
      audio.removeEventListener('playing', playing);
      audio.removeEventListener('pause', paused);
      audio.removeEventListener('ended', repeat);
      audio.removeEventListener('timeupdate', timeUpdate);
      audio.removeEventListener('error', unavailable);
      audio.pause();
    },
  };
}
