import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import { wedding, getMapsUrl, formatWeddingDate, compactWeddingDate, getWeddingDateParts } from '../src/config/wedding.js';
import { createVenueQr } from '../src/lib/venueQr.js';

test('the opening keeps the connected story passage and invitation message exactly', () => {
  assert.deepEqual(wedding.story.beginnings, [
    'It started with two people.',
    'It grew into a beautiful story.',
    'And now, it becomes a lifetime.',
  ]);
  assert.equal(wedding.story.beginnings.join(' '), 'It started with two people. It grew into a beautiful story. And now, it becomes a lifetime.');
  assert.equal(wedding.story.invitation, 'Together with the blessings of our families and elders, we joyfully invite you to join us as we begin our sacred journey together.');
});

for (const [setting, filename] of [['openingCorner', 'lotus-gold-corner.png'], ['openingHalo', 'lotus-embossed-halo.png']]) {
  test(`the opening ${setting} uses real transparent bitmap artwork`, () => {
    assert.ok(wedding.media[setting].endsWith(`/${filename}`));
    const artwork = PNG.sync.read(readFileSync(new URL(`../assets/${filename}`, import.meta.url)));
    assert.ok(artwork.width >= 1024 && artwork.height >= 1024);
    let transparentPixels = 0;
    let visiblePixels = 0;
    for (let i = 3; i < artwork.data.length; i += 4) {
      if (artwork.data[i] === 0) transparentPixels += 1;
      if (artwork.data[i] > 128) visiblePixels += 1;
    }
    const pixels = artwork.width * artwork.height;
    assert.ok(transparentPixels > pixels * 0.4);
    assert.ok(visiblePixels > pixels * 0.03);
  });
}

test('the A & S opening uses high-resolution square artwork with transparent negative space', () => {
  assert.equal(wedding.bride.initial, 'A');
  assert.equal(wedding.groom.initial, 'S');
  assert.match(wedding.media.monogram, /\/as-botanical-gold-monogram\.png$/);
  const artwork = PNG.sync.read(readFileSync(new URL('../assets/as-botanical-gold-monogram.png', import.meta.url)));
  assert.equal(artwork.width, artwork.height);
  assert.ok(artwork.width >= 1024);
  let transparentPixels = 0;
  let visiblePixels = 0;
  for (let i = 3; i < artwork.data.length; i += 4) {
    if (artwork.data[i] === 0) transparentPixels += 1;
    if (artwork.data[i] > 128) visiblePixels += 1;
  }
  assert.ok(transparentPixels > artwork.width * artwork.height * 0.5);
  assert.ok(visiblePixels > artwork.width * artwork.height * 0.05);
});

test('the temple watermark is a high-resolution portrait bitmap, separate from the unchanged monogram', () => {
  assert.match(wedding.media.openingTemple, /\/dravidian-temple-watermark\.png$/);
  assert.notEqual(wedding.media.openingTemple, wedding.media.monogram);
  const image = PNG.sync.read(readFileSync(new URL('../assets/dravidian-temple-watermark.png', import.meta.url)));
  assert.ok(image.width >= 1024 && image.height > image.width);
});

test('the reference opening has separate portrait and desktop photographic scenes', () => {
  for (const [setting, filename, orientation] of [
    ['openingBackdrop', 'tamil-opening-reference.png', 'portrait'],
    ['openingBackdropTablet', 'tamil-opening-reference-tablet.png', 'portrait'],
    ['openingBackdropWide', 'tamil-opening-reference-wide.png', 'landscape'],
  ]) {
    assert.ok(wedding.media[setting].endsWith(`/${filename}`));
    const artwork = PNG.sync.read(readFileSync(new URL(`../assets/${filename}`, import.meta.url)));
    assert.ok(artwork.width >= 900 && artwork.height >= 1000);
    assert.equal(artwork.height > artwork.width, orientation === 'portrait');
    assert.notEqual(wedding.media[setting], wedding.media.introVideo);
  }
});

test('the jasmine opening monogram has true transparency without replacing the intro fallback artwork', () => {
  assert.match(wedding.media.openingMonogram, /\/as-jasmine-gold-monogram\.png$/);
  assert.notEqual(wedding.media.openingMonogram, wedding.media.monogram);
  const artwork = PNG.sync.read(readFileSync(new URL('../assets/as-jasmine-gold-monogram.png', import.meta.url)));
  assert.equal(artwork.width, artwork.height);
  assert.ok(artwork.width >= 1024);
  let transparentPixels = 0;
  for (let i = 3; i < artwork.data.length; i += 4) {
    if (artwork.data[i] === 0) transparentPixels += 1;
  }
  assert.ok(transparentPixels > artwork.width * artwork.height * 0.5);
});

test('the reception QR decodes to the supplied venue search', async () => {
  const destination = getMapsUrl();
  const parsed = new URL(destination);
  assert.equal(parsed.searchParams.get('query'), 'Ganesan Royal Palace (A/C), Thuraiyur Salai, Perambalur');
  const qr = await createVenueQr(wedding.reception);
  const png = PNG.sync.read(Buffer.from(qr.split(',')[1], 'base64'));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  assert.equal(decoded?.data, destination);
});

test('the wedding details and QR use the same exact supplied temple address', async () => {
  const destination = getMapsUrl(wedding.ceremony);
  const parsed = new URL(destination);
  const exactAddress = 'Perumal Kovil, Aranarai, Perambalur, Tamil Nadu, India.';
  assert.equal(parsed.searchParams.get('query'), exactAddress);
  assert.equal([wedding.ceremony.venue, wedding.ceremony.address].join(', '), exactAddress);
  assert.notEqual(destination, getMapsUrl(wedding.reception));
  assert.ok(!destination.includes('undefined'));
  const qr = await createVenueQr(wedding.ceremony);
  const png = PNG.sync.read(Buffer.from(qr.split(',')[1], 'base64'));
  assert.equal(png.width, 768);
  assert.deepEqual(Array.from(png.data.subarray(0, 4)), [255, 255, 255, 255]);
  assert.equal(jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data, destination);
});

test('a supplied verified map URL overrides the search', () => {
  const supplied = 'https://maps.app.goo.gl/example';
  assert.equal(getMapsUrl({ ...wedding.reception, googleMapsUrl: supplied }), supplied);
  assert.equal(getMapsUrl({ ...wedding.ceremony, googleMapsUrl: supplied }), supplied);
});

test('confirmed family details and invitation wording are retained without qualifications', () => {
  assert.equal(wedding.story.parentsInvitation, 'Together with the blessings of our beloved parents, we joyfully invite you to join us as we begin our sacred journey together.');
  assert.deepEqual(wedding.groom.parents, ['Mr. C. Priyagaran', 'Mrs. P. Santhi']);
  assert.deepEqual(wedding.bride.parents, ['Mr. C. Ravichandran', 'Mrs. R. Sumathi']);
  assert.equal(wedding.groom.nativePlace, 'Aranarai, Perambalur District & Taluk');
  assert.equal(wedding.bride.nativePlace, 'Okkilipatti Village, Tiruchengode Taluk, Namakkal District');
  assert.match(wedding.story.invitation, /^Together with the blessings/);
  assert.ok(!('portrait' in wedding.groom));
  assert.ok(!('portrait' in wedding.bride));
  assert.doesNotMatch(JSON.stringify(wedding), /B\.E\.|M\.Sc\.|MS \(UK\)|jobTitle|employment/);
});

test('date formatting retains the supplied day independently of timezone', () => {
  assert.equal(formatWeddingDate(), '20 November 2026');
  assert.equal(formatWeddingDate(wedding.date, { weekday: 'long' }), 'Friday, 20 November 2026');
  assert.equal(compactWeddingDate(), '20 \u2022 11 \u2022 2026');
  assert.deepEqual(getWeddingDateParts(), { weekday: 'Friday', day: '20', month: 'November', year: '2026' });
  assert.equal(wedding.countdown.heading, 'Counting the moments until forever');
});

test('the art-direction update preserves the supplied film and confirmed event details', () => {
  assert.match(wedding.media.introVideo, /\/wedding-intro-final\.mp4$/);
  assert.equal(wedding.ceremony.venue, 'Perumal Kovil');
  assert.equal(wedding.ceremony.address, 'Aranarai, Perambalur, Tamil Nadu, India.');
  assert.equal(wedding.ceremony.time, '4:30 AM \u2013 6:00 AM');
  assert.equal(wedding.ceremony.startsAt, '2026-11-20T04:30:00+05:30');
  assert.equal(wedding.ceremony.timeZone, 'Asia/Kolkata');
  assert.equal(wedding.reception.venue, 'Ganesan Royal Palace (A/C)');
  assert.equal(wedding.reception.address, 'Thuraiyur Salai, Perambalur');
  assert.equal(wedding.reception.time, '5:00 PM onwards');
  assert.match(wedding.media.rings, /\/wedding-rings-jasmine\.png$/);
});
