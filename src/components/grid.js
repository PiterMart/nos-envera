"use client";

import Link from "next/link";

const gridStyles = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "2rem",
  justifyItems: "center",
  alignItems: "start",
};

const linkStyles = {
  width: "100%",
  maxWidth: "300px",
  textDecoration: "none",
  color: "inherit",
};

const articleStyles = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  textAlign: "left",
};

const imageWrapperStyles = {
  width: "100%",
  overflow: "hidden",
  borderRadius: "10px",
  backgroundColor: "#f0f0f0",
  lineHeight: 0,
};

const imgStyles = {
  width: "100%",
  height: "auto",
  display: "block",
  verticalAlign: "middle",
};

const yearHeadingBase = {
  fontFamily: "var(--font-family-base)",
  margin: 0,
  marginBottom: "0.5rem",
  fontSize: "3.75rem",
  fontWeight: 600,
  letterSpacing: "0.5px",
  textAlign: "left",
  width: "100%",
  paddingBottom: "0.25rem",
  borderBottom: "1px solid black",
};

const YEAR_PLACEHOLDER = "\u2014";
const CARD_DOT = "\u2022";

function groupByYear(cards) {
  const byYear = {};
  for (const card of cards) {
    const y = card.year ?? YEAR_PLACEHOLDER;
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(card);
  }
  const keys = Object.keys(byYear).sort((a, b) => {
    if (a === YEAR_PLACEHOLDER && b !== YEAR_PLACEHOLDER) return 1;
    if (a !== YEAR_PLACEHOLDER && b === YEAR_PLACEHOLDER) return -1;
    return String(b).localeCompare(String(a));
  });
  return keys.map((year) => [year, byYear[year]]);
}

export default function Grid({ cards, hideImages = false }) {
  const groups = groupByYear(cards);
  const dynamicGridStyles = {
    ...gridStyles,
    gap: hideImages ? "0.25rem" : gridStyles.gap,
  };

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
      {groups.map(([year, groupCards], idx) => (
        <div key={year} style={{ width: "100%" }}>
          <h2 style={{ ...yearHeadingBase, marginTop: idx === 0 ? 0 : "1.5rem" }}>{year}</h2>
          <div style={dynamicGridStyles}>
            {groupCards.map((card) => (
              <Link href={`/agenda/${card.slug}`} key={card.id} style={linkStyles}>
                <article style={articleStyles}>
                  {!hideImages && card.imageUrl ? (
                    <div style={imageWrapperStyles}>
                      <img src={card.imageUrl} alt={card.title} style={imgStyles} />
                    </div>
                  ) : null}
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 400, letterSpacing: "0.5px", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ color: "black", fontSize: "0.6em", lineHeight: 1 }}>{CARD_DOT}</span>
                    {card.title}
                  </h3>
                </article>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
