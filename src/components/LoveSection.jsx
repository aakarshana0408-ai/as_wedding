import { wedding } from '../config/wedding';
import Reveal from './Reveal';
import { MaterialSurface } from './Decorations';

export default function LoveSection() {
  return <section id="love" data-scroll-scene className="love-section" aria-label="A lifetime ahead">
    <MaterialSurface silk />
    <span className="fine-rule" aria-hidden="true" />
    <Reveal as="blockquote">{wedding.story.love}</Reveal>
  </section>;
}
