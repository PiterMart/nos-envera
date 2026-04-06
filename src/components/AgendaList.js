"use client";

import React, { useMemo } from "react";
import { TransitionLink } from "./TransitionLink";
import AnimatedUnderline from "./AnimatedUnderline";
import { formatDate } from "../lib/eventUtils";

const MONTH_PLACEHOLDER = "—";

function groupByMonth(cards) {
  const groups = [];
  for (const card of cards) {
    let monthString = MONTH_PLACEHOLDER;
    if (card.dates && card.dates.length > 0) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const futureDates = card.dates.filter(d => d.date >= now);
      // Fallback to first date if all are in the past
      const targetDate = futureDates.length > 0 ? futureDates[0].date : card.dates[0].date;
      
      if (targetDate) {
        const formatted = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(targetDate);
        monthString = formatted.charAt(0).toUpperCase() + formatted.slice(1);
      }
    }

    let group = groups.find(g => g.month === monthString);
    if (!group) {
      group = { month: monthString, events: [] };
      groups.push(group);
    }
    group.events.push(card);
  }
  
  return groups.map(g => [g.month, g.events]);
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
  fontFamily: "var(--font-family-base)",
  fontStyle: "normal",
  fontSize: "2rem",
  fontWeight: 600,
  letterSpacing: "1px",
  margin: 0,
  marginLeft: "15vw",
  color: "black",
  textAlign: "left",
};

const dateStyles = {
  fontFamily: "var(--font-family-base)",
  fontSize: "0.95rem",
  color: "#555",
  margin: 0,
  marginTop: "0.25rem",
};

export default function AgendaList({ events, basePath = "/evento" }) {
  const groups = useMemo(() => groupByMonth(events), [events]);

  return (
    <section style={listContainerStyles}>
      {groups.map(([month, groupEvents], idx) => (
        <div key={month} style={{ width: "100%", marginTop: idx === 0 ? 0 : "2rem" }}>
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
              {month}
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
                  if (!d.date) return null;
                  const dateObj = d.date.toDate ? d.date.toDate() : new Date(d.date);
                  if (isNaN(dateObj.getTime())) return null;
                  const formattedDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' }).format(dateObj);
                  return d.time ? `${formattedDate} · ${d.time}hs` : formattedDate;
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
                    {(event.type?.length > 0 || event.directors?.length > 0) && (
                      <p style={{ ...dateStyles, fontStyle: "italic", fontSize: "0.9rem" }}>
                        {[
                          event.type?.length > 0 ? event.type.join(", ") : null,
                          event.directors?.length > 0 ? `Dir: ${event.directors.map(dir => dir.name).join(", ")}` : null
                        ].filter(Boolean).join(" | ")}
                      </p>
                    )}
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
