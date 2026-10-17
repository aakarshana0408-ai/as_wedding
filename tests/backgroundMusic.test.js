import test from 'node:test';
import assert from 'node:assert/strict';
import { createBackgroundMusic } from '../src/lib/backgroundMusic.js';

class AudioStub extends EventTarget {
  paused = true;
  ended = false;
  currentTime = 0;
  loop = true;
  error = null;
  readyState = 1;
  plays = 0;
  pauses = 0;
  loads = 0;
  play() {
    this.plays += 1;
    this.paused = false;
    this.ended = false;
    this.dispatchEvent(new Event('playing'));
    return Promise.resolve();
  }
  pause() {
    this.pauses += 1;
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  }
  load() { this.loads += 1; this.error = null; }
}

const segment = { start: 20, end: 80 };
const create = (audio, onChange) => createBackgroundMusic(audio, onChange, segment);

test('music cues once without enabling a whole-file loop over the silent lead-in', async () => {
  const audio = new AudioStub();
  const states = [];
  const music = create(audio, state => states.push(state));
  assert.equal(audio.plays, 0);
  assert.equal(audio.loop, false);
  assert.equal(audio.currentTime, 20);
  await music.startOnce();
  audio.currentTime = 38;
  await music.startOnce();
  assert.equal(audio.plays, 1);
  assert.equal(audio.currentTime, 38);
  assert.equal(states.at(-1), 'playing');
  music.destroy();
});

test('pausing and resuming preserve the excerpt position and suppress later automatic starts', async () => {
  const audio = new AudioStub();
  const states = [];
  const music = create(audio, state => states.push(state));
  await music.startOnce();
  audio.currentTime = 24.5;
  await music.toggle();
  assert.equal(states.at(-1), 'paused');
  await music.startOnce();
  assert.equal(audio.paused, true);
  await music.toggle();
  assert.equal(audio.currentTime, 24.5);
  assert.equal(audio.plays, 2);
  music.destroy();
});

test('blocked playback is handled and the toggle can retry without an unhandled rejection', async () => {
  const audio = new AudioStub();
  const states = [];
  const music = create(audio, state => states.push(state));
  const play = audio.play.bind(audio);
  audio.play = () => Promise.reject(Object.assign(new Error('Gesture needed'), { name: 'NotAllowedError' }));
  assert.equal(await music.startOnce(), false);
  assert.equal(states.at(-1), 'blocked');
  assert.equal(await music.startOnce(), false);
  audio.play = play;
  assert.equal(await music.toggle(), true);
  assert.equal(states.at(-1), 'playing');
  music.destroy();
});

test('music repeats the selected passage after natural completion and the toggle remains usable', async () => {
  const audio = new AudioStub();
  const states = [];
  const music = create(audio, state => states.push(state));
  await music.startOnce();
  audio.currentTime = 80;
  audio.ended = true;
  audio.pause();
  assert.equal(states.at(-1), 'playing', 'the natural end must not flash a muted state');
  audio.dispatchEvent(new Event('ended'));
  assert.equal(states.at(-1), 'playing');
  assert.equal(audio.currentTime, 20);
  assert.equal(audio.paused, false);
  assert.equal(audio.plays, 2);
  assert.equal(audio.loads, 0);
  await music.startOnce();
  assert.equal(audio.plays, 2);
  audio.currentTime = 26.75;
  await music.toggle();
  assert.equal(audio.paused, true);
  await music.toggle();
  assert.equal(audio.currentTime, 26.75);
  assert.equal(audio.paused, false);
  music.destroy();
});

test('blocked default-on music starts on the next interaction without re-cueing', async () => {
  const audio = new AudioStub();
  const music = create(audio, () => {});
  const play = audio.play.bind(audio);
  audio.play = () => Promise.reject(Object.assign(new Error('Gesture needed'), { name: 'NotAllowedError' }));
  await music.startOnce();
  audio.currentTime = 21.5;
  audio.play = play;
  assert.equal(await music.resumeFromInteraction(), true);
  assert.equal(audio.currentTime, 21.5);
  assert.equal(await music.resumeFromInteraction(), false);
  assert.equal(audio.plays, 1);
  music.destroy();
});

test('ordinary interactions never resume music that a guest deliberately paused', async () => {
  const audio = new AudioStub();
  const music = create(audio, () => {});
  await music.startOnce();
  audio.currentTime = 31;
  await music.toggle();
  assert.equal(await music.resumeFromInteraction(), false);
  assert.equal(audio.paused, true);
  assert.equal(audio.currentTime, 31);
  assert.equal(audio.plays, 1);
  await music.toggle();
  assert.equal(audio.currentTime, 31);
  music.destroy();
});

test('repeated gestures do not duplicate a pending autoplay retry', async () => {
  const audio = new AudioStub();
  const music = create(audio, () => {});
  audio.play = () => Promise.reject(Object.assign(new Error('Blocked'), { name: 'NotAllowedError' }));
  await music.startOnce();
  let resolve;
  let attempts = 0;
  audio.play = () => { attempts += 1; return new Promise(done => { resolve = done; }); };
  const pending = music.resumeFromInteraction();
  assert.equal(await music.resumeFromInteraction(), false);
  assert.equal(attempts, 1);
  audio.paused = false;
  resolve();
  assert.equal(await pending, true);
  music.destroy();
});

test('a deliberate pause at the segment boundary cannot be undone by late end events or page interactions', async () => {
  const audio = new AudioStub();
  const music = create(audio, () => {});
  await music.startOnce();
  music.pause();
  audio.currentTime = 80;
  audio.ended = true;
  audio.dispatchEvent(new Event('timeupdate'));
  audio.dispatchEvent(new Event('ended'));
  assert.equal(await music.resumeFromInteraction(), false);
  assert.equal(audio.currentTime, 80);
  assert.equal(audio.plays, 1);
  music.destroy();
  assert.equal(await music.resumeFromInteraction(), false);
});

test('cleanup pauses playback, removes listeners and ignores a pending play resolution', async () => {
  const audio = new AudioStub();
  let resolve;
  audio.play = () => { audio.paused = false; return new Promise(done => { resolve = done; }); };
  const states = [];
  const music = create(audio, state => states.push(state));
  const pending = music.startOnce();
  music.destroy();
  resolve();
  await pending;
  audio.dispatchEvent(new Event('playing'));
  audio.dispatchEvent(new Event('error'));
  assert.equal(audio.paused, true);
  assert.deepEqual(states, []);
  assert.equal(await music.toggle(), false);
});

test('a pause invalidates an in-flight play promise', async () => {
  const audio = new AudioStub();
  let resolve;
  audio.play = () => { audio.paused = false; return new Promise(done => { resolve = done; }); };
  const states = [];
  const music = create(audio, state => states.push(state));
  const pending = music.startOnce();
  await music.toggle();
  resolve();
  await pending;
  assert.equal(states.at(-1), 'paused');
  music.destroy();
});

test('a transient media error can be retried without resetting other invitation state', async () => {
  const audio = new AudioStub();
  const states = [];
  const music = create(audio, state => states.push(state));
  audio.error = {};
  audio.dispatchEvent(new Event('error'));
  assert.equal(states.at(-1), 'unavailable');
  await music.toggle();
  assert.equal(audio.loads, 1);
  assert.equal(states.at(-1), 'playing');
  music.destroy();
});

test('intro startup uses the same music player and does not re-cue an already paused position', async () => {
  const audio = new AudioStub();
  const music = create(audio, () => {});
  const play = audio.play.bind(audio);
  audio.play = () => { audio.currentTime = 20.05; return play(); };
  const calls = [];
  const video = { play: () => { calls.push(audio.currentTime); return Promise.resolve(); } };
  await music.startIntro(video);
  assert.deepEqual(calls, [20.05]);
  audio.currentTime = 27.25;
  await music.toggle();
  audio.play = play;
  await music.toggle();
  assert.equal(audio.currentTime, 27.25);
  assert.equal(calls.length, 1, 'music toggles must not replay the video');
  music.destroy();
});

test('blocked music does not prevent the muted intro video from starting', async () => {
  const audio = new AudioStub();
  audio.play = () => Promise.reject(Object.assign(new Error('Blocked'), { name: 'NotAllowedError' }));
  const music = create(audio, () => {});
  let plays = 0;
  await music.startIntro({ play: () => { plays += 1; return Promise.resolve(); } });
  assert.equal(plays, 1);
  assert.equal(audio.currentTime, 20);
  music.destroy();
});

test('pending audio autoplay never delays the intro or restarts it after skipping', async () => {
  const audio = new AudioStub();
  let resolve;
  audio.play = () => { audio.paused = false; return new Promise(done => { resolve = done; }); };
  const music = create(audio, () => {});
  let current = true;
  let videoPlays = 0;
  const pending = music.startIntro({ play: () => { videoPlays += 1; return Promise.resolve(); } }, () => current);
  assert.equal(videoPlays, 1, 'the video must start without waiting for audio');
  assert.equal(await pending, true, 'intro startup must not await the audio promise');
  current = false;
  resolve();
  await Promise.resolve();
  assert.equal(videoPlays, 1);
  music.destroy();
});

test('a cancelled intro startup cannot play either media element', async () => {
  const audio = new AudioStub();
  const music = create(audio, () => {});
  let videoPlays = 0;
  assert.equal(await music.startIntro({ play: () => { videoPlays += 1; } }, () => false), false);
  assert.equal(videoPlays, 0);
  assert.equal(audio.plays, 0);
  music.destroy();
});

test('late video rejection after cleanup cannot pause a newer audio session', async () => {
  const audio = new AudioStub();
  const music = create(audio, () => {});
  let reject;
  let current = true;
  const pending = music.startIntro({ play: () => new Promise((_, failed) => { reject = failed; }) }, () => current);
  current = false;
  reject(Object.assign(new Error('Cancelled'), { name: 'AbortError' }));
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(audio.pauses, 0);
  music.destroy();
});

test('an intro playback failure never stops the independent music player', async () => {
  const audio = new AudioStub();
  const states = [];
  const music = create(audio, state => states.push(state));
  await assert.rejects(music.startIntro({ play: () => Promise.reject(new Error('Video unavailable')) }), /Video unavailable/);
  assert.equal(audio.paused, false);
  assert.equal(audio.pauses, 0);
  assert.equal(states.at(-1), 'playing');
  music.destroy();
});

test('a browser playback interruption can resume on an interaction without overriding a manual mute', async () => {
  const audio = new AudioStub();
  const music = create(audio, () => {});
  await music.startOnce();
  audio.currentTime = 35.625;
  audio.pause();
  assert.equal(await music.resumeFromInteraction(), true);
  assert.equal(audio.currentTime, 35.625);
  music.pause();
  assert.equal(await music.resumeFromInteraction(), false);
  assert.equal(audio.paused, true);
  music.destroy();
});

test('source boundaries repeat only the selected passage without pausing or reloading', async () => {
  const audio = new AudioStub();
  const states = [];
  const music = create(audio, state => states.push(state));
  await music.startOnce();
  audio.currentTime = 80;
  audio.dispatchEvent(new Event('timeupdate'));
  assert.equal(audio.paused, false);
  assert.equal(states.at(-1), 'playing');
  assert.equal(audio.currentTime, 20);
  assert.equal(audio.plays, 1);
  assert.equal(audio.pauses, 0);
  assert.equal(audio.loads, 0);
  audio.currentTime = 20.4;
  audio.dispatchEvent(new Event('ended'));
  assert.equal(audio.currentTime, 20.4, 'a queued end event cannot repeat an already restarted passage');
  music.destroy();
});

test('multiple natural repeats preserve the same player and never enter a finished state', async () => {
  const audio = new AudioStub();
  const states = [];
  const music = create(audio, state => states.push(state));
  await music.startOnce();
  for (let cycle = 0; cycle < 3; cycle += 1) {
    audio.currentTime = 80;
    audio.ended = true;
    audio.pause();
    audio.dispatchEvent(new Event('ended'));
    assert.equal(audio.currentTime, 20);
    assert.equal(audio.paused, false);
  }
  assert.equal(audio.plays, 4);
  assert.equal(audio.loads, 0);
  assert.ok(states.every(state => state === 'playing'));
  music.destroy();
});

test('invalid source segments are rejected', () => {
  assert.throws(() => createBackgroundMusic(new AudioStub(), () => {}, { start: 20, end: 19 }), RangeError);
});
