import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const source = PNG.sync.read(readFileSync(new URL('../assets/sa-monogram-reference.png', import.meta.url)));
const crop = { left: 22, top: 24, size: 272 };
const matte = [251, 250, 248];
const goldBlue = 20;
const images = Object.fromEntries(['full', 'arc', 'botanicals', 'letters'].map(key => [key,
  new PNG({ width: crop.size, height: crop.size })]));

for (let y = 0; y < crop.size; y += 1) {
  for (let x = 0; x < crop.size; x += 1) {
    const sx = x + crop.left;
    const sy = y + crop.top;
    const sourceIndex = (sy * source.width + sx) * 4;
    const index = (y * crop.size + x) * 4;
    const blueDeficit = matte[2] - source.data[sourceIndex + 2];
    if (blueDeficit < 5) continue;

    // Unmatte the screenshot's antialiasing; never resize, trace or redraw the artwork.
    const alpha = Math.min(1, blueDeficit / (matte[2] - goldBlue));
    const pixel = matte.map((background, channel) => Math.max(0, Math.min(255,
      Math.round((source.data[sourceIndex + channel] - (1 - alpha) * background) / alpha))));
    pixel.push(Math.round(alpha * source.data[sourceIndex + 3]));

    const angle = Math.atan2(sy - 155, sx - 157) * 180 / Math.PI;
    const onArc = Math.abs(Math.hypot(sx - 157, sy - 155) - 109) <= 4.5
      && ((angle >= -124 && angle <= 30) || (angle >= 76 && angle <= 135));
    const botanical = sy >= 157 && sx <= 82 + (sy - 157) * 0.37;
    const layer = botanical ? 'botanicals' : onArc ? 'arc' : 'letters';
    images.full.data.set(pixel, index);
    images[layer].data.set(pixel, index);
  }
}

for (const [layer, png] of Object.entries(images)) {
  const filename = layer === 'full' ? 'sa-monogram.png' : `sa-monogram-${layer}.png`;
  writeFileSync(new URL(`../assets/${filename}`, import.meta.url), PNG.sync.write(png));
}
