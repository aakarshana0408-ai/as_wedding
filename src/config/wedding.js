const asset = (filename) => `${import.meta.env?.BASE_URL ?? '/'}${filename}`;

export const wedding = {
  groom: {
    name: 'P. Selvendran', initial: 'S',
    parents: ['Mr. C. Prabakaran', 'Mrs. P. Shanthi'],
    familyLocation: 'Perambalur, Tamil Nadu, India',
    nativePlace: 'Aranarai, Perambalur District & Taluk',
  },
  bride: {
    name: 'R. Asmitha', initial: 'A',
    parents: ['Mr. C. Ravichandran', 'Mrs. R. Sumathi'],
    familyLocation: 'Namakkal, Tamil Nadu, India',
    nativePlace: 'Okkilipatti Village, Tiruchengode Taluk, Namakkal District',
  },
  date: '2026-11-20',
  ceremony: {
    time: '4:30 AM \u2013 6:00 AM', venue: 'Perumal Kovil',
    address: 'Aranarai, Perambalur, Tamil Nadu, India.', googleMapsUrl: null,
    startsAt: '2026-11-20T04:30:00+05:30', timeZone: 'Asia/Kolkata',
  },
  reception: {
    time: '5:00 PM onwards', venue: 'Ganesan Royal Palace (A/C)',
    address: 'Thuraiyur Salai, Perambalur', googleMapsUrl: null,
  },
  media: {
    introVideo: asset('wedding-intro-families-3.mp4'), ornament: asset('tamil-gold-foil-ornament.png'),
    ceremonyBackdrop: asset('tamil-wedding-backdrop.png'), lamp: asset('kuthuvilakku-realistic.png'),
    rings: asset('wedding-rings-jasmine.png'), floral: asset('jasmine-thoranam.png'), petal: asset('jasmine-petal.png'),
    paper: asset('handmade-ivory-paper.png'), silk: asset('wine-silk-texture.png'),
    receptionLamp: asset('reception-hanging-brass-lamp.png'),
    weddingDetailsBackdrop: asset('wedding-details-reference-backdrop.png'),
    monogram: asset('sa-ornate-gold-monogram-transparent.png'),
    monogramLayers: {
      circle: asset('sa-ornate-reveal-circle.png'), branches: asset('sa-ornate-reveal-branches.png'),
      flowers: asset('sa-ornate-reveal-flowers.png'), s: asset('sa-ornate-reveal-s.png'), a: asset('sa-ornate-reveal-a.png'),
    },
    openingBackdrop: asset('tamil-opening-reference.png'),
    openingBackdropWide: asset('tamil-opening-reference-wide.png'),
    openingBackdropTablet: asset('tamil-opening-reference-tablet.png'),
    openingTemple: asset('dravidian-temple-watermark.png'),
    openingCorner: asset('lotus-gold-corner.png'), openingHalo: asset('lotus-embossed-halo.png'),
    closingCouple: asset('closing-watercolor-couple.png'),
    closingGarland: asset('closing-watercolor-garland.png'),
    closingLeaves: asset('closing-watercolor-banana-leaves.png'),
    closingPetal: asset('closing-watercolor-petal.png'),
  },
  gallery: { enabled: false, images: [] },
  countdown: { heading: 'Counting the moments until forever', completeMessage: 'The celebration begins' },
  story: {
    beginnings: ['It started with two people.', 'It grew into a beautiful story.', 'And now, it becomes a lifetime.'],
    parentsInvitation: 'With joyful hearts, we invite you to celebrate our wedding.',
    love: 'A little bit of fate, a lot of love, and a lifetime ahead.',
    celebration: 'Some beginnings are worth celebrating.',
  },
};

export function getMapsUrl(venue = wedding.reception) {
  const query = [venue.venue, venue.address].filter(Boolean).join(', ');
  return venue.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function formatWeddingDate(date = wedding.date, options = {}) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC', ...options,
  }).format(new Date(`${date}T12:00:00Z`));
}

export function compactWeddingDate(date = wedding.date) {
  const [year, month, day] = date.split('-');
  return `${day} \u2022 ${month} \u2022 ${year}`;
}

export function getWeddingDateParts(date = wedding.date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', weekday: 'long', timeZone: 'UTC',
  }).formatToParts(new Date(`${date}T12:00:00Z`));
  return Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
}
