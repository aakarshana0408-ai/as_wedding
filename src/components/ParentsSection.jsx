import { wedding } from '../config/wedding';
import { DecorativeImage, MaterialSurface } from './Decorations';
import { ParentsDividerOrnament, ParentsFrame, ParentsRule } from './ParentsLinework';
import Reveal from './Reveal';

function FamilyDetails({ person, label, relationship, delay }) {
  return <Reveal className="parent-block" group delay={delay}>
    <div data-reveal-step="0">
      <p className="section-label">{label}</p>
      <h3 className="family-name">{person.name}</h3>
    </div>
    <div data-reveal-step="1"><ParentsRule /></div>
    <div className="family-details" data-reveal-step="2">
      <p className="family-relationship">{relationship}</p>
      <p className="family-parents"><span>{person.parents[0]}</span>{' '}<span>&amp; {person.parents[1]}</span></p>
      <p className="family-location">{person.familyLocation}</p>
    </div>
  </Reveal>;
}

export default function ParentsSection() {
  return <section id="parents" data-scroll-scene className="parents-section paper-section" aria-labelledby="families-title">
    <MaterialSurface />
    <div className="parents-scenery" aria-hidden="true">
      <DecorativeImage src={wedding.media.openingTemple} className="parents-temple" />
    </div>
    <ParentsFrame />
    <div className="parents-inner">
      <Reveal className="families-heading" group>
        <p className="section-label" data-reveal-step="0">MEET THE FAMILIES</p>
        <h2 id="families-title" data-reveal-step="1">Our Families</h2>
        <div data-reveal-step="1"><ParentsRule /></div>
        <p className="parents-message" data-reveal-step="2">{wedding.story.parentsInvitation}</p>
      </Reveal>
      <div className="family-groups">
        <FamilyDetails person={wedding.groom} label="THE GROOM" relationship="Son of" delay={100} />
        <Reveal className="parent-divider" delay={180}>
          <span className="family-and-rule" aria-hidden="true" />
          <span className="family-and-centre"><span className="family-and">And</span><ParentsDividerOrnament /></span>
          <span className="family-and-rule" aria-hidden="true" />
        </Reveal>
        <FamilyDetails person={wedding.bride} label="THE BRIDE" relationship="Daughter of" delay={160} />
      </div>
    </div>
  </section>;
}
