export function createBackgroundMusic(audio, onChange, { start, end }) {
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) {
    throw new RangeError('Music requires a valid source segment.');
  }
  let attempted = false;
  let initialPlay;
  let disposed = false;
  let enabled = true;
  let playbackStarted = false;
  let retryOnInteraction = false;
  let request = 0;
  let savedPosition = start;
  let pendingPosition = start;

  const report = status => {
    if (disposed) return;
    playbackStarted = status === 'playing';
    onChange({ status, enabled });
  };
  const cue = () => {
    if (pendingPosition === null || audio.readyState < 1) return;
    try {
      if (audio.currentTime !== pendingPosition) audio.currentTime = pendingPosition;
      pendingPosition = null;
    } catch {
      // Mobile media can expose metadata before its seekable range is ready.
    }
  };
  const save = () => {
    if (audio.currentTime >= start) savedPosition = Math.min(end, audio.currentTime);
  };
  const playing = () => {
    if (audio.paused) return;
    if (!enabled) { audio.pause(); return; }
    if (audio.muted) { report('paused'); return; }
    retryOnInteraction = false;
    report('playing');
  };
  const waiting = () => { if (enabled && !audio.paused) report('loading'); };
  const volumeChange = () => { if (audio.muted) report('paused'); };
  const paused = () => {
    if (!audio.paused || audio.ended) return;
    save();
    request += 1;
    retryOnInteraction = enabled;
    report('paused');
  };
  const repeat = () => {
    if (disposed || !enabled || audio.currentTime < end) return;
    // Repeat the selected passage on the same player without reloading it.
    savedPosition = start;
    pendingPosition = start;
    cue();
    if (audio.paused) void play();
  };
  const timeUpdate = () => { save(); repeat(); };
  const unavailable = () => { save(); request += 1; report('unavailable'); };
  audio.defaultMuted = false;
  audio.muted = false;
  audio.loop = false;
  audio.addEventListener('loadedmetadata', cue);
  audio.addEventListener('canplay', cue);
  audio.addEventListener('playing', playing);
  audio.addEventListener('waiting', waiting);
  audio.addEventListener('volumechange', volumeChange);
  audio.addEventListener('pause', paused);
  audio.addEventListener('ended', repeat);
  audio.addEventListener('timeupdate', timeUpdate);
  audio.addEventListener('error', unavailable);
  report('idle');
  cue();

  function play() {
    if (disposed || !enabled) return Promise.resolve(false);
    const current = ++request;
    const failed = error => {
      if (!disposed && current === request) {
        retryOnInteraction = error.name === 'NotAllowedError' || error.name === 'AbortError';
        report(retryOnInteraction ? 'blocked' : 'unavailable');
      }
      return false;
    };
    try {
      retryOnInteraction = false;
      audio.muted = false;
      report('loading');
      if (audio.currentTime >= end) { savedPosition = start; pendingPosition = start; }
      if (audio.error) { pendingPosition = savedPosition; audio.load(); }
      cue();
      return Promise.resolve(audio.play()).then(() => {
        if (disposed || !enabled || current !== request || audio.paused || audio.muted) return false;
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
    if (disposed || !enabled) return Promise.resolve(false);
    if (playbackStarted && !audio.paused) return Promise.resolve(true);
    if (!attempted) {
      attempted = true;
      initialPlay = play();
    }
    return initialPlay ?? Promise.resolve(playbackStarted && !audio.paused);
  }

  return {
    startOnce,
    pause,
    resumeFromInteraction() {
      if (disposed || !enabled || !retryOnInteraction || !audio.paused) return Promise.resolve(false);
      return play();
    },
    async startIntro(video, isCurrent = () => true, fromInteraction = false) {
      if (disposed || !isCurrent()) return false;
      if (enabled) {
        if (fromInteraction) attempted = true;
        const ready = await (fromInteraction ? play() : startOnce());
        if (!ready || disposed || !isCurrent() || enabled && audio.paused) return false;
      }
      await video?.play();
      return !disposed && isCurrent();
    },
    toggle() {
      if (disposed) return Promise.resolve(false);
      attempted = true;
      if (playbackStarted && !audio.paused && !audio.muted) {
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
      audio.removeEventListener('canplay', cue);
      audio.removeEventListener('playing', playing);
      audio.removeEventListener('waiting', waiting);
      audio.removeEventListener('volumechange', volumeChange);
      audio.removeEventListener('pause', paused);
      audio.removeEventListener('ended', repeat);
      audio.removeEventListener('timeupdate', timeUpdate);
      audio.removeEventListener('error', unavailable);
      audio.pause();
    },
  };
}
