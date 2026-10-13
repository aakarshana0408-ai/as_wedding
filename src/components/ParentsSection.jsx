import { wedding } from '../config/wedding';
import { MaterialSurface } from './Decorations';
import { ParentsFrame, ParentsRule } from './ParentsLinework';
import Reveal from './Reveal';

export default function ParentsSection() {
  return <section id="parents" data-scroll-scene className="parents-section paper-section" aria-label="Our parents">
    <MaterialSurface />
    <ParentsFrame />
    <div className="parents-inner">
      <Reveal className="parents-message" group>
        <p data-reveal-step="0">{wedding.story.parentsInvitation}</p>
        <div data-reveal-step="1"><ParentsRule /></div>
      </Reveal>
      <div className="family-groups">
        <Reveal className="parent-block" group delay={100}><h2 className="section-label" data-reveal-step="0">PARENTS OF THE GROOM</h2>
          {wedding.groom.parents.map((name, index) => <p key={name} data-reveal-step={index + 1}>{name}</p>)}
        </Reveal>
        <Reveal className="parent-divider" delay={300}>
          <ParentsRule />
        </Reveal>
        <Reveal className="parent-block" group delay={420}><h2 className="section-label" data-reveal-step="0">PARENTS OF THE BRIDE</h2>
          {wedding.bride.parents.map((name, index) => <p key={name} data-reveal-step={index + 1}>{name}</p>)}
        </Reveal>
      </div>
    </div>
  </section>;
}
