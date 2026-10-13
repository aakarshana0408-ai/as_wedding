import test from 'node:test';
import assert from 'node:assert/strict';
import { getParallaxOffset, observeReveal } from '../src/lib/scrollMotion.js';

test('parallax remains within eight pixels and is centred in the viewport', () => {
  assert.equal(getParallaxOffset(400, 100, 900, 8), 0);
  assert.equal(getParallaxOffset(900, 100, 900, 8), -8);
  assert.equal(getParallaxOffset(-100, 100, 900, 8), 8);
  assert.equal(getParallaxOffset(-100, 100, 900, 50), 8);
});

test('botanical motion uses its smaller limit and rejects invalid geometry', () => {
  assert.equal(getParallaxOffset(900, 100, 900, 3), -3);
  assert.equal(getParallaxOffset(-100, 100, 900, 2), 2);
  assert.equal(getParallaxOffset(0, 100, 900, -1), 0);
  assert.equal(getParallaxOffset(NaN, 100, 900, 8), 0);
  assert.equal(getParallaxOffset(0, 0, 900, 8), 0);
  assert.equal(getParallaxOffset(0, 100, 0, 8), 0);
});

test('reveals share an observer, fire once, and release it after the final reveal', () => {
  const previous = globalThis.window;
  const instances = [];
  class Observer {
    constructor(callback) { this.callback = callback; this.observed = new Set(); instances.push(this); }
    observe(element) { this.observed.add(element); }
    unobserve(element) { this.observed.delete(element); }
    disconnect() { this.disconnected = true; }
  }
  globalThis.window = { IntersectionObserver: Observer };
  const first = {}, second = {};
  const calls = [];
  const cleanups = [];
  try {
    cleanups.push(observeReveal(first, () => calls.push('first')));
    cleanups.push(observeReveal(second, () => calls.push('second')));
    assert.equal(instances.length, 1);
    instances[0].callback([{ target: first, isIntersecting: false }]);
    assert.deepEqual(calls, []);
    instances[0].callback([{ target: first, isIntersecting: true }]);
    assert.deepEqual(calls, ['first']);
    assert.equal(instances[0].observed.size, 1);
    instances[0].callback([{ target: second, isIntersecting: true }]);
    assert.deepEqual(calls, ['first', 'second']);
    assert.equal(instances[0].disconnected, true);
    instances[0].callback([{ target: first, isIntersecting: true }]);
    assert.deepEqual(calls, ['first', 'second']);
  } finally {
    cleanups.forEach(cleanup => cleanup());
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
});

test('unmount cleanup ignores queued observations without leaking the observer', () => {
  const previous = globalThis.window;
  let instance, calls = 0;
  globalThis.window = { IntersectionObserver: class {
    constructor(callback) { this.callback = callback; instance = this; }
    observe() {}
    unobserve() {}
    disconnect() { this.disconnected = true; }
  } };
  try {
    const element = {};
    const cleanup = observeReveal(element, () => calls++);
    cleanup();
    instance.callback([{ target: element, isIntersecting: true }]);
    assert.equal(calls, 0);
    assert.equal(instance.disconnected, true);
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
});

test('missing IntersectionObserver shows content immediately', () => {
  const previous = globalThis.window;
  globalThis.window = {};
  try {
    let visible = false;
    const cleanup = observeReveal({}, () => { visible = true; });
    assert.equal(visible, true);
    assert.doesNotThrow(cleanup);
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
});
