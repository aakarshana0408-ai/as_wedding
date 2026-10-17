import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import { wedding, getMapsUrl, formatWeddingDate, compactWeddingDate, getWeddingDateParts } from '../src/config/wedding.js';
import { createVenueQr } from '../src/lib/venueQr.js';

test('the opening keeps the connected story passage without the removed invitation message', () => {
  assert.deepEqual(wedding.story.beginnings, [
    'It started with two people.',
    'It grew into a beautiful story.',
    'And now, it becomes a lifetime.',
  ]);
  assert.equal(wedding.story.beginnings.join(' '), 'It started with two people. It grew into a beautiful story. And now, it becomes a lifetime.');
  assert.ok(!('invitation' in wedding.story));
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

test('the supplied ornate monogram source remains unchanged alongside its transparent cutout', () => {
  assert.equal(wedding.bride.initial, 'A');
  assert.equal(wedding.groom.initial, 'S');
  assert.match(wedding.media.monogram, /\/sa-ornate-gold-monogram-transparent\.png$/);
  const source = readFileSync(new URL('../assets/sa-ornate-gold-monogram.png', import.meta.url));
  assert.equal(createHash('sha256').update(source).digest('hex'), '06a184105e40a9fb6ea42997ba1756b0b6590bbf7cc471ac496328b1fe26868b');
  const artwork = PNG.sync.read(source);
  assert.deepEqual([artwork.width, artwork.height], [1254, 1254]);
  assert.ok(!('monogramArc' in wedding.media));
  assert.ok(!('monogramBotanicals' in wedding.media));
  assert.ok(!('monogramLetters' in wedding.media));
});

test('the active monogram has transparent negative space without losing its gold and white flowers', () => {
  const artwork = PNG.sync.read(readFileSync(new URL('../assets/sa-ornate-gold-monogram-transparent.png', import.meta.url)));
  assert.deepEqual([artwork.width, artwork.height], [1254, 1254]);
  let transparent = 0;
  let opaque = 0;
  let whitePetals = 0;
  for (let i = 0; i < artwork.data.length; i += 4) {
    const [red, green, blue, alpha] = artwork.data.subarray(i, i + 4);
    if (alpha === 0) transparent += 1;
    if (alpha >= 240) opaque += 1;
    if (alpha >= 240 && red >= 220 && green >= 210 && blue >= 185) whitePetals += 1;
  }
  const pixels = artwork.width * artwork.height;
  assert.ok(transparent > pixels * 0.65);
  assert.ok(opaque > pixels * 0.1 && opaque < pixels * 0.25);
  assert.ok(whitePetals > 8000);
  for (const [x, y] of [[0, 0], [1253, 1253], [625, 280], [900, 400], [500, 800]]) {
    assert.equal(artwork.data[(y * artwork.width + x) * 4 + 3], 0);
  }
});

test('the ornate entrance layers partition the unchanged transparent artwork exactly', () => {
  const bytes = readFileSync(new URL('../assets/sa-ornate-gold-monogram-transparent.png', import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '633f7124c7157d23c294bc86a278cb507668842a48a709ec95029d07257fec91');
  const source = PNG.sync.read(bytes);
  const layers = ['circle', 'branches', 'flowers', 's', 'a'].map(name => {
    assert.match(wedding.media.monogramLayers[name], new RegExp(`/sa-ornate-reveal-${name}\\.png$`));
    const image = PNG.sync.read(readFileSync(new URL(`../assets/sa-ornate-reveal-${name}.png`, import.meta.url)));
    assert.deepEqual([image.width, image.height], [source.width, source.height]);
    return image;
  });
  const counts = layers.map(() => 0);
  for (let i = 0; i < source.data.length; i += 4) {
    let owner = -1;
    for (let layer = 0; layer < layers.length; layer++) {
      if (!layers[layer].data[i + 3]) continue;
      assert.equal(owner, -1, 'source pixels must never overlap between layers');
      owner = layer;
      counts[layer]++;
      assert.deepEqual(layers[layer].data.subarray(i, i + 4), source.data.subarray(i, i + 4));
    }
    assert.equal(owner !== -1, source.data[i + 3] > 0, 'every visible source pixel must survive');
  }
  assert.ok(counts.every(count => count > 1000));
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

test('all original gold strokes survive the background removal at their native pixel coordinates', () => {
  const source = PNG.sync.read(readFileSync(new URL('../assets/sa-monogram-reference.png', import.meta.url)));
  const artwork = PNG.sync.read(readFileSync(new URL('../assets/sa-monogram.png', import.meta.url)));
  const matte = [251, 250, 248];
  let compared = 0;
  let error = 0;
  assert.deepEqual([source.width, source.height], [317, 337]);
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const original = (y * source.width + x) * 4;
      if (source.data[original + 2] >= 180) continue;
      assert.ok(x >= 22 && y >= 24 && x < 294 && y < 296);
      const pixel = ((y - 24) * artwork.width + x - 22) * 4;
      const alpha = artwork.data[pixel + 3] / 255;
      assert.ok(alpha > 0);
      for (let channel = 0; channel < 3; channel += 1) {
        const recomposited = artwork.data[pixel + channel] * alpha + matte[channel] * (1 - alpha);
        const difference = Math.abs(recomposited - source.data[original + channel]);
        assert.ok(difference < 3);
        error += difference;
      }
      compared += 1;
    }
  }
  assert.ok(compared > 5000);
  assert.ok(error / (compared * 3) < 0.3);
});

test('arc, botanical and lettering layers exactly partition the supplied monogram pixels', () => {
  const full = PNG.sync.read(readFileSync(new URL('../assets/sa-monogram.png', import.meta.url)));
  const layers = ['arc', 'botanicals', 'letters'].map(name =>
    PNG.sync.read(readFileSync(new URL(`../assets/sa-monogram-${name}.png`, import.meta.url))));
  for (const layer of layers) assert.deepEqual([layer.width, layer.height], [full.width, full.height]);
  for (let i = 0; i < full.data.length; i += 4) {
    const visible = layers.filter(layer => layer.data[i + 3] > 0);
    assert.equal(visible.length, full.data[i + 3] > 0 ? 1 : 0);
    if (visible.length) assert.deepEqual(visible[0].data.subarray(i, i + 4), full.data.subarray(i, i + 4));
  }
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

test('the reception hanging lamp is a separate transparent portrait asset', () => {
  assert.match(wedding.media.receptionLamp, /\/reception-hanging-brass-lamp\.png$/);
  const image = PNG.sync.read(readFileSync(new URL('../assets/reception-hanging-brass-lamp.png', import.meta.url)));
  assert.ok(image.width >= 512 && image.height >= image.width * 1.5);
  let transparent = 0;
  let foreground = 0;
  for (let i = 3; i < image.data.length; i += 4) {
    if (!image.data[i]) transparent++;
    if (image.data[i] >= 200) foreground++;
  }
  const pixels = image.width * image.height;
  assert.ok(transparent > pixels * 0.6);
  assert.ok(foreground > pixels * 0.02);
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

test('the wedding details use a separate tall temple backdrop without replacing the existing ceremony scene', () => {
  assert.match(wedding.media.weddingDetailsBackdrop, /\/wedding-details-reference-backdrop\.png$/);
  assert.match(wedding.media.ceremonyBackdrop, /\/tamil-wedding-backdrop\.png$/);
  const image = PNG.sync.read(readFileSync(new URL('../assets/wedding-details-reference-backdrop.png', import.meta.url)));
  assert.ok(image.width >= 800 && image.height >= image.width * 1.8);
  assert.notEqual(wedding.media.weddingDetailsBackdrop, wedding.media.introVideo);
  assert.notEqual(wedding.media.weddingDetailsBackdrop, wedding.media.monogram);
});

test('a supplied verified map URL overrides the search', () => {
  const supplied = 'https://maps.app.goo.gl/example';
  assert.equal(getMapsUrl({ ...wedding.reception, googleMapsUrl: supplied }), supplied);
  assert.equal(getMapsUrl({ ...wedding.ceremony, googleMapsUrl: supplied }), supplied);
});

test('confirmed family details and invitation wording are retained without qualifications', () => {
  assert.equal(wedding.groom.name, 'P. Selvendran');
  assert.equal(wedding.bride.name, 'R. Asmitha');
  assert.equal(wedding.story.parentsInvitation, 'With joyful hearts, we invite you to celebrate our wedding.');
  assert.deepEqual(wedding.groom.parents, ['Mr. C. Prabakaran', 'Mrs. P. Shanthi']);
  assert.deepEqual(wedding.bride.parents, ['Mr. C. Ravichandran', 'Mrs. R. Sumathi']);
  assert.equal(wedding.groom.familyLocation, 'Perambalur, Tamil Nadu, India');
  assert.equal(wedding.bride.familyLocation, 'Salem, Tamil Nadu, India');
  assert.equal(wedding.groom.nativePlace, 'Aranarai, Perambalur District & Taluk');
  assert.equal(wedding.bride.nativePlace, 'Okkilipatti Village, Tiruchengode Taluk, Namakkal District');
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

test('the closing announcement formats the confirmed November date, weekday and muhurtham', () => {
  const month = formatWeddingDate(wedding.date, { day: undefined, month: 'short', year: undefined }).toUpperCase();
  const date = getWeddingDateParts();
  assert.equal(`${month} | ${date.day} | ${date.year}`, 'NOV | 20 | 2026');
  assert.equal(date.weekday.toUpperCase(), 'FRIDAY');
  assert.equal(wedding.ceremony.time, '4:30 AM \u2013 6:00 AM');
  assert.ok(!('closing' in wedding.story));
});

test('the intro uses the latest supplied film without changing confirmed event details', () => {
  assert.match(wedding.media.introVideo, /\/wedding-intro-families-3\.mp4$/);
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

test('the replacement intro is a byte-for-byte copy of the supplied video', () => {
  const video = readFileSync(new URL('../assets/wedding-intro-families-3.mp4', import.meta.url));
  assert.equal(createHash('sha256').update(video).digest('hex'), '0505019aef25b37ec541359b9408c790578ceeb32b9bdb1d831a2b9678da65ac');
});

test('the closing uses separate transparent watercolor assets rather than a flattened invitation', () => {
  for (const [setting, filename] of [
    ['closingCouple', 'closing-watercolor-couple.png'],
    ['closingGarland', 'closing-watercolor-garland.png'],
    ['closingLeaves', 'closing-watercolor-banana-leaves.png'],
    ['closingPetal', 'closing-watercolor-petal.png'],
  ]) {
    assert.ok(wedding.media[setting].endsWith(`/${filename}`));
    const artwork = PNG.sync.read(readFileSync(new URL(`../assets/${filename}`, import.meta.url)));
    assert.ok(artwork.width >= 800 && artwork.height >= 800);
    let transparentPixels = 0;
    let visiblePixels = 0;
    for (let i = 3; i < artwork.data.length; i += 4) {
      if (artwork.data[i] === 0) transparentPixels += 1;
      if (artwork.data[i] > 128) visiblePixels += 1;
    }
    assert.ok(transparentPixels > artwork.width * artwork.height * 0.2);
    assert.ok(visiblePixels > artwork.width * artwork.height * 0.02);
  }
});
