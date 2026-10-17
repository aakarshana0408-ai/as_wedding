import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { wedding } from '../src/config/wedding.js';

function boxes(bytes, start = 0, end = bytes.length) {
  const result = [];
  for (let offset = start; offset < end;) {
    let size = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const header = size === 1 ? 16 : 8;
    if (size === 1) size = Number(bytes.readBigUInt64BE(offset + 8));
    if (size === 0) size = end - offset;
    assert.ok(size >= header && offset + size <= end, 'valid MPEG-4 box boundaries');
    result.push({ type, offset, data: offset + header, end: offset + size });
    offset += size;
  }
  return result;
}

test('mobile music is the fast-start 60-second excerpt and requires no startup seek', () => {
  assert.match(wedding.media.backgroundMusic, /\/wedding-background-music-mobile\.m4a$/);
  assert.deepEqual(wedding.music, { start: 0, end: 60 });
  const bytes = readFileSync(new URL('../assets/wedding-background-music-mobile.m4a', import.meta.url));
  const root = boxes(bytes);
  const movie = root.find(box => box.type === 'moov');
  const media = root.find(box => box.type === 'mdat');
  assert.ok(movie.offset < media.offset, 'metadata precedes audio for mobile streaming');
  const header = boxes(bytes, movie.data, movie.end).find(box => box.type === 'mvhd');
  assert.equal(bytes[header.data], 0, 'standard version-zero movie header');
  const scale = bytes.readUInt32BE(header.data + 12);
  const duration = bytes.readUInt32BE(header.data + 16) / scale;
  assert.equal(duration, 60);
  assert.ok(media.end - media.data > 1000000, 'the served file contains the selected audio');
});
