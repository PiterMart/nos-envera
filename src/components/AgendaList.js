"use client";

import React, { useMemo } from "react";
import { TransitionLink } from "./TransitionLink";
import AnimatedUnderline from "./AnimatedUnderline";
import { formatDate } from "../lib/eventUtils";

const YEAR_PLACEHOLDER = "—";

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

const listContainerStyles = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  width: "100%",
};

const agendaItemStyles = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  borderBottom: "1px solid black",
  paddingBottom: "0.75rem",
  paddingTop: "0.75rem",
  width: "100%",
  transition: "opacity 0.2s ease",
};

const titleStyles = {
  fontFamily: "var(--font-grid-card)",
  fontStyle: "italic",
  fontSize: "1.25rem",
  fontWeight: 400,
  letterSpacing: "0.5px",
  margin: 0,
  color: "black",
};

const dateStyles = {
  fontFamily: "var(--font-family-base)",
  fontSize: "0.95rem",
  color: "#555",
  margin: 0,
  marginTop: "0.25rem",
};

export default function AgendaList({ events, basePath = "/evento" }) {
  const groups = useMemo(() => groupByYear(events), [events]);

  return (
    <section style={listContainerStyles}>
      {groups.map(([year, groupEvents], idx) => (
        <div key={year} style={{ width: "100%", marginTop: idx === 0 ? 0 : "2rem" }}>
          <header
            style={{
              marginBottom: "1rem",
              display: "flex",
              alignItems: "flex-end",
              gap: "0.5rem",
              width: "100%",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-family-base)",
                margin: 0,
                marginBottom: "-1vh",
                fontSize: "3.75rem",
                fontWeight: 600,
                letterSpacing: "0.5px",
                textAlign: "left",
              }}
            >
              {year}
            </h2>
            <AnimatedUnderline
              loaded={true}
              style={{
                flex: 1,
                minWidth: 0,
                borderTop: "2px solid black",
              }}
            />
          </header>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {groupEvents.map((event) => {
              const dateString = (event.dates || [])
                .map((d) => {
                  const formattedStr = formatDate(d.date);
                  const timeStr = d.time ? ` a las ${d.time}` : "";
                  return formattedStr ? `${formattedStr}${timeStr}` : null;
                })
                .filter(Boolean)
                .join(" | ");

              return (
                <TransitionLink
                  key={event.id}
                  href={`${basePath}/${event.slug}`}
                  style={{ textDecoration: "none", width: "100%" }}
                  className="agendaLinkHover"
                >
                  <article style={agendaItemStyles}>
                    <h3 style={titleStyles}>{event.title}</h3>
                    {dateString && <p style={dateStyles}>{dateString}</p>}
                  </article>
                </TransitionLink>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
