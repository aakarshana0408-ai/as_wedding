export function createBackgroundMusic(audio, onChange, { start, end }) {
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) {
    throw new RangeError('Music requires a valid source segment.');
  }
  let attempted = false;
  let disposed = false;
  let completed = false;
  let retryOnInteraction = false;
  let request = 0;
  let savedPosition = start;
  let pendingPosition = start;

  const report = status => { if (!disposed) onChange(status); };
  const cue = () => {
    if (pendingPosition === null || audio.readyState < 1) return;
    audio.currentTime = pendingPosition;
    pendingPosition = null;
  };
  const save = () => {
    if (audio.currentTime >= start) savedPosition = Math.min(end, audio.currentTime);
  };
  const playing = () => { if (!audio.paused) report('playing'); };
  const paused = () => { save(); request += 1; report(completed || audio.ended ? 'ended' : 'paused'); };
  const ended = () => {
    completed = true;
    savedPosition = end;
    request += 1;
    if (!audio.paused) audio.pause();
    report('ended');
  };
  const timeUpdate = () => { save(); if (audio.currentTime >= end) ended(); };
  const unavailable = () => { save(); request += 1; report('unavailable'); };
  audio.loop = false;
  audio.addEventListener('loadedmetadata', cue);
  audio.addEventListener('playing', playing);
  audio.addEventListener('pause', paused);
  audio.addEventListener('ended', ended);
  audio.addEventListener('timeupdate', timeUpdate);
  audio.addEventListener('error', unavailable);
  cue();

  function play() {
    if (disposed || completed || audio.ended) return Promise.resolve(false);
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
      if (audio.error) { pendingPosition = savedPosition; audio.load(); }
      cue();
      return Promise.resolve(audio.play()).then(() => {
        if (disposed || current !== request || audio.paused) return false;
        report('playing');
        return true;
      }, failed);
    } catch (error) {
      return Promise.resolve(failed(error));
    }
  }

  function pause() {
    if (disposed) return;
    retryOnInteraction = false;
    save();
    request += 1;
    audio.pause();
    report(completed ? 'ended' : 'paused');
  }

  function startOnce() {
    if (disposed || attempted || completed || audio.ended) return Promise.resolve(false);
    attempted = true;
    return play();
  }

  return {
    startOnce,
    pause,
    resumeFromInteraction() {
      if (disposed || completed || audio.ended || !retryOnInteraction || !audio.paused) return Promise.resolve(false);
      return play();
    },
    async startIntro(video, isCurrent = () => true) {
      if (disposed || !isCurrent()) return false;
      // Audible autoplay must never hold up the muted film.
      void startOnce();
      try {
        await video.play();
        return !disposed && isCurrent();
      } catch (error) {
        if (!disposed && isCurrent()) pause();
        throw error;
      }
    },
    toggle() {
      if (disposed || completed || audio.ended) return Promise.resolve(false);
      attempted = true;
      if (!audio.paused) {
        pause();
        return Promise.resolve(false);
      }
      return play();
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      request += 1;
      audio.removeEventListener('loadedmetadata', cue);
      audio.removeEventListener('playing', playing);
      audio.removeEventListener('pause', paused);
      audio.removeEventListener('ended', ended);
      audio.removeEventListener('timeupdate', timeUpdate);
      audio.removeEventListener('error', unavailable);
      audio.pause();
    },
  };
}
