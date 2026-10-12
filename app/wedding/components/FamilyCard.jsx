export default function FamilyCard({ family, person, initial, tone }) {
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
