function FamilyCard({ family, person, initial, tone }) {
  const hasBothParents = Boolean(family.mother);

  return (
    <article className={`wedding-family-card ${tone}`}>
      <div className="wedding-family-monogram" aria-hidden="true">
        {initial}
      </div>
      <div>
        <span>{family.label}</span>
        <p>{hasBothParents ? 'Parents of' : family.relation}</p>
        <h3>{family.father}</h3>
        {hasBothParents && (
          <>
            <em>&amp;</em>
            <h3>{family.mother}</h3>
          </>
        )}
      </div>
      <p className="wedding-family-note">
        Requesting your heartfelt duas for {person}
      </p>
    </article>
  );
}

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
