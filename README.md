# Selvendhiran & Asmitha Wedding Invitation

A local React + Vite + Tailwind CSS wedding invitation. The supplied intro video is preserved unchanged. There is no music player or added audio.

## Run Locally

Requires Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite, normally http://localhost:5173. Vite uses another available port when 5173 is occupied.

```sh
npm run build
npm run preview
npm test
```

The build is written to `dist/`. This project does not automatically publish or deploy.

VS Code Live Server can also serve the invitation: run `npm run build`, then open the project root or `dist/index.html` with Live Server. The root automatically opens the compiled invitation. Run the build again after source edits; use Vite for automatic updates while editing. Build assets use relative paths, so `dist/` can be served from a subdirectory.

## Personalize

Edit `src/config/wedding.js` for all names, parents, dates, venues, times, media paths and story text. The opening uses bespoke A & S gold-foil artwork; replace `media.monogram` with new artwork when changing its initials. Native places are retained as reference information but are not displayed.

Vite serves the `assets/` directory at the URL root. The latest supplied `final.mp4` is preserved unchanged at `assets/wedding-intro-final.mp4`, configured as `/wedding-intro-final.mp4`. All decorative asset paths are in the same configuration.

- Replace the video by changing `media.introVideo` or replacing the file at that path. Set it to `null` for an animated stationery opening.
- The latest supplied film plays once, muted, without recolouring. A fixed full-viewport container and `object-fit: cover` fill every screen edge without letterboxing, padding or borders; the portrait footage is cropped as needed for different aspect ratios. Landscape framing is slightly lower to retain more of the temple entrance with the gopuram. Mobile uses dynamic viewport height with a `100vh` fallback. The Enter Invitation button appears only when autoplay is blocked. A missing film uses the stationery opening and enters automatically.
- The portrait/couple section is removed. Names remain in the opening and closing compositions.
- The A & S opening reveals its thin circle, botanical branches and intertwined metallic letters in sequence, then the names and date. Complementary SVG masks reveal a transparent photographic-style bitmap, not typed initials or vector ornamentation. Reduced-motion preferences reveal the complete composition immediately.
- The mobile-first opening is composed as Tamil Hindu wedding stationery: a softly faded Dravidian gopuram and carved-pillar background, a quiet kolam threshold, a restrained jasmine/mango-leaf thoranam, a double gold frame, the original A & S monogram, burgundy calligraphic names and a refined date. Outer floral corners, the extra circular floral halo and the large side flourish have been removed; thin gold rules flank the ampersand. The monogram, name positions, typography and reveal timing are preserved. Small-height phone layouts use compact fixed-size type and artwork; content can scroll naturally without clipping. The temple is generated architectural artwork, not a photograph of a verified event venue. The supplied full-screen intro is unchanged.
- The single countdown appears directly beneath the date and ceremony details in the wedding date reveal, not on the closing page. It targets `ceremony.startsAt`: `2026-11-20T04:30:00+05:30`, explicitly 4:30 AM in `Asia/Kolkata` (23:00 UTC on 19 November). Preserve an explicit timezone offset when changing this value. The timer recomputes from the actual clock every second, refreshes when the tab becomes visible, and cleans up its interval/listener on unmount. At the target it displays "THE CELEBRATION BEGINS" without negative values. Its initial loading state is identical for server and client rendering.
- Set `gallery.enabled: true` and populate `gallery.images` with `{ src: '/photo.jpg', alt: 'Meaningful description' }` objects. An enabled empty gallery shows replaceable frames. The gallery is disabled initially.
- Each event has one genuine, clickable QR inside its own section. The wedding details and QR both use the exact address "Perumal Kovil, Aranarai, Perambalur, Tamil Nadu, India." from `ceremony.venue` and `ceremony.address`. The reception QR searches "Ganesan Royal Palace (A/C), Thuraiyur Salai, Perambalur". Set `ceremony.googleMapsUrl` or `reception.googleMapsUrl` only when you have a verified venue URL. Neither search is a verified exact pin; each QR and its tap destination use the same event-specific URL.
- The redundant standalone location section and its navigation link are removed. The compact 184px QR codes remain beneath their respective venue details, and the countdown's placement and functionality are unchanged.
- Content and controls remain usable if decorative images fail. Reduced-motion preferences skip the ceremonial motion.

## Scroll Experience

The header retains its existing dimensions and menu controls while staying at the top of the viewport. Its small A & S logo starts hidden with its layout space reserved and is removed from keyboard focus until visible. A one-shot IntersectionObserver waits until scrolling moves the opening upward and brings the second section into view, then reveals the logo with a 780ms fade and 4px upward movement. It remains visible afterwards. Reduced-motion preferences reveal it without motion; the large central monogram is unchanged.

Scrolling remains native for touch, wheel, trackpad and keyboard input; no scroll library, snapping or extra scroll lock is added. Navigation uses native smooth anchor scrolling with a single 88px desktop / 72px mobile offset, without doubled section margins.

Reveals share one IntersectionObserver and run once, using 680-780ms opacity/transform transitions. Related text appears in small coordinated groups; gold rules and the date frame unfold without changing layout. The opening monogram and name animations are retained, while the connected story/invitation text now responds to viewport entry. The countdown has its own entrance but remains mounted and keeps updating while off-screen.

One additional scene observer and a single passive, frame-limited scroll listener add up to 8px of depth to the temple watermark and 2-3px to selected botanical artwork. Foreground content, QR codes, borders and the supplied intro film do not receive parallax. Textures emerge gently and an ivory veil dissolves into the existing burgundy closing background. Reduced-motion preferences show all content immediately, disable parallax and use instant anchor navigation; preference changes and unmounts clean up observers, listeners and animation frames. The settled design, approved media and confirmed details are preserved.

## Components

`src/components/` contains reusable invitation sections, the video opening, monogram reveal, viewport reveals and decorations. `src/lib/venueQr.js` is the shared QR generator, also decoded by the automated tests. `src/index.css` defines the invitation typography, animations and responsive layout. Tailwind v4 is configured through the official Vite plugin in `vite.config.js` and the `@theme` block in CSS; a legacy Tailwind configuration file is not needed.

The invitation uses warm ivory (`#F8F1E8`), burgundy (`#54172D`), restrained antique-gold rules (`#B18A45`) and dark-brown serif event details. The opening keeps the A & S monogram, names and date without a title or tagline. Its three story sentences form one connected paragraph, followed directly by the invitation message in the same section. There is no separate story section, chapter numbering or story artwork; opening height follows its content. The existing love quote follows without a placeholder gap. The parents composition keeps the full beloved-parents blessing and all four names in a compact, symmetrical layout. Custom fine-line kolam panels, temple-inspired corners and lotus dividers enrich the preserved ivory paper and double gold frame without added images or rings. The borders and linework trace once on viewport entry, with staggered name reveals and an immediate reduced-motion presentation. The existing wedding section is now one framed Tamil wedding date reveal: "Our Wedding", Friday, a prominent burgundy 20, November and 2026, followed by the confirmed muhurtham and temple. Existing carved-temple, brass-lamp, garland and kolam artwork surrounds the ivory date card, with restrained gold-foil corners. Its burgundy countdown band is attached beneath the ceremony details, with four columns or a two-by-two grid on narrow phones. Wedding and reception QR codes remain inside their respective event sections with white quiet space; the redundant standalone location section is removed. The rich burgundy closing (`#32121F`) retains its message, names, date and realistic brass-lamp still image, without a second countdown. The supplied film, monogram reveal and established animation logic are unchanged. All degrees and professional information are excluded.

## Artwork

The existing gold-foil ornament, wedding backdrop, brass lamp and supplied film are retained. `dravidian-temple-watermark.png`, `as-botanical-gold-monogram.png`, `lotus-gold-corner.png`, `lotus-embossed-halo.png`, `story-jasmine-buds.png`, `story-gold-jasmine-vine.png`, `wedding-rings-jasmine.png`, `jasmine-thoranam.png`, `jasmine-petal.png`, `handmade-ivory-paper.png` and `wine-silk-texture.png` are generated photographic-style decorative assets, not photographs of the couple or verified venue photographs. The lamp uses the existing still image, not generated live flame video.

Asset generation briefs: engraved champagne-gold wedding bands on sparse jasmine; a fresh jasmine and mango-leaf thoranam with a small lotus; and a single natural jasmine petal. All were generated using the built-in image-generation tool with transparent backgrounds.

Full prompts and saved asset paths are recorded in [assets/ARTWORK.md](assets/ARTWORK.md).

Fonts: Great Vibes, Cormorant Garamond and Manrope are served locally from `assets/fonts/`, with their OFL license files. Dependencies: React, Vite, Tailwind CSS, Lucide React for functional controls, and `qrcode`. Tests decode a QR with `jsqr` and check dates and map configuration.

Reference documentation: [Vite](https://vite.dev/guide/), [Tailwind's Vite integration](https://tailwindcss.com/docs/installation/using-vite), and [node-qrcode](https://github.com/soldair/node-qrcode).
