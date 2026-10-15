import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const source = PNG.sync.read(readFileSync(new URL('../assets/sa-ornate-gold-monogram-transparent.png', import.meta.url)));
const layers = Object.fromEntries(['circle', 'branches', 'flowers', 's', 'a'].map(name =>
  [name, new PNG({ width: source.width, height: source.height })]));

const flowers = [
  [262, 234, 68, 68], [217, 351, 72, 63], [363, 166, 30, 37],
  [403, 203, 31, 20], [510, 188, 29, 24], [520, 225, 28, 20],
  [370, 272, 32, 22], [322, 282, 30, 24], [331, 327, 30, 22],
  [169, 260, 20, 30], [198, 278, 16, 25], [103, 374, 33, 24],
  [122, 432, 26, 32], [174, 498, 22, 33], [154, 574, 25, 32],
  [144, 600, 15, 23], [1080, 784, 68, 57], [1019, 844, 30, 40],
  [1084, 897, 39, 25], [1122, 875, 35, 34], [1028, 951, 46, 28],
  [928, 1018, 37, 39], [877, 997, 22, 31], [958, 923, 22, 33],
  [1092, 646, 18, 23], [1075, 601, 22, 28], [1093, 517, 18, 31],
  [1120, 560, 18, 30], [1149, 647, 23, 22], [1183, 677, 17, 27],
  [1040, 755, 22, 22],
];
const aStem = [[739, 370], [845, 682], [871, 769], [905, 845], [939, 860],
  [972, 861], [972, 883], [789, 883], [789, 861], [814, 858], [827, 845],
  [830, 829], [820, 788], [786, 680], [702, 478], [699, 477], [639, 491],
  [630, 508], [630, 526], [638, 531], [645, 529], [651, 527], [653, 535],
  [646, 542], [637, 542], [628, 537], [622, 530], [621, 517], [625, 501],
  [637, 486], [653, 477], [680, 469], [700, 467]];
const aLeftStroke = [[738, 373], [745, 407], [650, 650], [610, 748],
  [570, 796], [535, 818], [523, 816], [552, 792], [591, 740], [620, 675],
  [665, 560], [702, 468]];
const aCrossbar = [[500, 706], [506, 686], [528, 668], [550, 667],
  [566, 680], [580, 702], [607, 721], [630, 730], [664, 732], [710, 711],
  [759, 679], [806, 650], [852, 631], [883, 624], [915, 625], [941, 635],
  [963, 654], [976, 678], [975, 705], [961, 730], [938, 749], [912, 762],
  [880, 767], [847, 765], [811, 757], [775, 742], [738, 721], [705, 701]];

function insidePolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function nearStroke(x, y, points, radius) {
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i];
    const dx = bx - ax, dy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    if ((x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2 <= radius ** 2) return true;
  }
  return false;
}

// These regions only assign existing pixels; they never paint or unmatte artwork.
for (let y = 0; y < source.height; y++) {
  for (let x = 0; x < source.width; x++) {
    const index = (y * source.width + x) * 4;
    if (!source.data[index + 3]) continue;
    const botanical = (x < 560 && y < 300) || (x < 375 && y < 540)
      || (x < 280 && y < 650) || (x > 995 && y > 430)
      || (x > 800 && y > 900);
    const flower = botanical && flowers.some(([cx, cy, rx, ry]) =>
      ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1);
    const onCircle = Math.abs(Math.hypot((x - 604) / 492, (y - 594) / 477) - 1) * 480 <= 7;
    const ornament = x >= 535 && x <= 720 && (y < 245 || y > 945);
    let name;
    if (flower) name = 'flowers';
    else if (onCircle || ornament) name = 'circle';
    else if (botanical) name = 'branches';
    else if (x < 290 || x > 990 || y < 310 || y > 935) name = 'circle';
    else if (x > 716 || insidePolygon(x, y, aStem) || insidePolygon(x, y, aLeftStroke)
      || nearStroke(x, y, aCrossbar, 9)) name = 'a';
    else name = 's';
    layers[name].data.set(source.data.subarray(index, index + 4), index);
  }
}

for (const [name, image] of Object.entries(layers)) {
  writeFileSync(new URL(`../assets/sa-ornate-reveal-${name}.png`, import.meta.url), PNG.sync.write(image));
}
