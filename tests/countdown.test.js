import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { wedding } from '../src/config/wedding.js';
import { getCountdown } from '../src/lib/countdown.js';

const target = wedding.ceremony.startsAt;
const targetTime = Date.parse(target);

test('muhurtham starts at 4:30 AM IST, equivalent to 23:00 UTC the previous day', () => {
  assert.equal(wedding.ceremony.timeZone, 'Asia/Kolkata');
  assert.equal(targetTime, Date.parse('2026-11-19T23:00:00Z'));
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: wedding.ceremony.timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(targetTime);
  const fields = Object.fromEntries(parts.map(part => [part.type, part.value]));
  assert.equal(`${fields.year}-${fields.month}-${fields.day}`, wedding.date);
  assert.equal(fields.weekday, 'Friday');
  assert.equal(`${fields.hour}:${fields.minute}`, '04:30');
});

test('remaining time is dynamically split into all four units', () => {
  const seconds = 41 * 86400 + 3 * 3600 + 12 * 60 + 8;
  assert.deepEqual(getCountdown(target, targetTime - seconds * 1000), {
    days: 41, hours: 3, minutes: 12, seconds: 8, complete: false,
  });
});

test('one-second rollover updates days, hours, minutes and seconds together', () => {
  assert.deepEqual(getCountdown(target, targetTime - 86401000), {
    days: 1, hours: 0, minutes: 0, seconds: 1, complete: false,
  });
  assert.deepEqual(getCountdown(target, targetTime - 86400000), {
    days: 1, hours: 0, minutes: 0, seconds: 0, complete: false,
  });
  assert.deepEqual(getCountdown(target, targetTime - 86399000), {
    days: 0, hours: 23, minutes: 59, seconds: 59, complete: false,
  });
});

test('the countdown finishes at the exact target and never becomes negative', () => {
  assert.equal(getCountdown(target, targetTime - 1).seconds, 1);
  assert.equal(getCountdown(target, targetTime - 1).complete, false);
  for (const now of [targetTime, targetTime + 1, targetTime + 86400000]) {
    assert.deepEqual(getCountdown(target, now), {
      days: 0, hours: 0, minutes: 0, seconds: 0, complete: true,
    });
  }
});

test('visitor timezones do not change the ceremony target', () => {
  const code = `import { getCountdown } from './src/lib/countdown.js';
    process.stdout.write(JSON.stringify(getCountdown('${target}', Date.parse('2026-11-19T22:59:59Z'))));`;
  for (const timezone of ['Asia/Kolkata', 'America/New_York', 'Europe/London', 'Pacific/Auckland']) {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', code], {
      encoding: 'utf8', env: { ...process.env, TZ: timezone },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), { days: 0, hours: 0, minutes: 0, seconds: 1, complete: false });
  }
});

test('invalid dates are rejected instead of rendering NaN', () => {
  assert.throws(() => getCountdown('not-a-date'), RangeError);
  assert.throws(() => getCountdown(target, NaN), RangeError);
});
