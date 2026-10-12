import FamilyCard from './FamilyCard';

export default function FamilyDetails({ data }) {
  return (
    <section className="wedding-families">
      <header className="wedding-section-heading">
        <span>Together With Their Families</span>
        <h2>A Union of Two Kinships</h2>
        <p>
          Request your esteemed company and blessings on this momentous
          celebration
        </p>
      </header>
      <div className="wedding-family-grid">
        <FamilyCard
          family={data.families.groom}
          person={data.couple.groom}
          initial="G"
          tone="groom"
        />
        <FamilyCard
          family={data.families.bride}
          person={data.couple.bride}
          initial="B"
          tone="bride"
        />
      </div>
    </section>
  );
}
