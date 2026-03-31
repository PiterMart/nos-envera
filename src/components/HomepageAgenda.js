import React from 'react';
import Image from "next/image";
import { firestore } from "../app/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { TransitionLink } from "./TransitionLink";
import styles from "../styles/page.module.css";
import {
  FALLBACK_IMAGE_WIDE as FALLBACK_IMAGE,
  parseDateEntry,
  hasFutureDate,
  formatDate,
} from "../lib/eventUtils";

async function getNextAgendaEvent() {
  try {
    const snapshot = await getDocs(collection(firestore, "events"));
    const documents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const futureEvents = documents
      .map((eventDoc) => {
        const dates = Array.isArray(eventDoc.dates)
          ? eventDoc.dates.map(parseDateEntry).filter(Boolean)
          : [];
        return { ...eventDoc, id: eventDoc.id, parsedDates: dates };
      })
      .filter((event) => hasFutureDate(event.parsedDates));

    if (futureEvents.length === 0) return null;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Sort by earliest future date
    futureEvents.sort((a, b) => {
      const dateA = a.parsedDates.find(d => d.date >= now)?.date || new Date(9999,0,1);
      const dateB = b.parsedDates.find(d => d.date >= now)?.date || new Date(9999,0,1);
      return dateA - dateB;
    });

    const nextEvent = futureEvents[0];
    const imageUrl = nextEvent.banner || nextEvent.flyer || nextEvent.gallery?.[0]?.url || FALLBACK_IMAGE;

    const dateString = (nextEvent.parsedDates || [])
      .map(d => {
        const formattedStr = formatDate(d.date);
        const timeStr = d.time ? ` a las ${d.time}` : "";
        return formattedStr ? `${formattedStr}${timeStr}` : null;
      })
      .filter(Boolean)
      .join(" | ");

    return {
      id: nextEvent.id,
      title: nextEvent.name || nextEvent.title || "Evento",
      subtitle: nextEvent.subtitle || "",
      description: Array.isArray(nextEvent.description) ? nextEvent.description : typeof nextEvent.description === 'string' ? nextEvent.description.split('\n') : [],
      slug: nextEvent.slug || nextEvent.id,
      imageUrl,
      dateString
    };
  } catch (err) {
    console.error("Error fetching agenda for homepage:", err);
    return null;
  }
}

export default async function HomepageAgenda() {
  const event = await getNextAgendaEvent();

  if (!event) return null;

  return (
    <div className={styles.responsiveSection} style={{ width: "100%", padding: "4rem 0", display: "flex", flexDirection: "row", gap: "0", alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, paddingRight: "3rem" }}>
        <h2 style={{ fontFamily: "var(--font-family-base)", fontSize: "4.5rem", fontWeight: 600, letterSpacing: "1px", margin: 0, textTransform: "uppercase", lineHeight: 1 }}>AGENDA</h2>
        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "1.5rem" }}>
          <TransitionLink
            href="/agenda"
            style={{
              textDecoration: "none",
              fontSize: "0.95rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#222",
              borderBottom: "1px solid #222",
              display: "inline-block",
              paddingBottom: "0.2rem"
            }}
          >
            → ver agenda completa
          </TransitionLink>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", flex: 1, textAlign: "left", alignItems: "flex-start", borderLeft: "1px solid black", paddingLeft: "3rem" }}>
          <TransitionLink href={`/evento/${event.slug}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 className={styles.eventTitle} style={{ fontWeight: 600, letterSpacing: "1px", marginBottom: 0, fontFamily: "var(--font-family-base)", fontSize: "2rem !important" }}>
              {event.title}
            </h3>
            {event.dateString && (
              <p style={{ fontFamily: "var(--font-family-base)", fontSize: "1.1rem", color: "#555", margin: 0 }}>
                {event.dateString}
              </p>
            )}
            {event.subtitle && (
              <p style={{ fontSize: "1.1rem", color: "#444", margin: 0, textAlign: "left" }}>
                {event.subtitle}
              </p>
            )}
          </TransitionLink>

          {event.description?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", lineHeight: "1.7", textAlign: "left", marginTop: "0.5rem" }}>
              {event.description.slice(0, 2).map((paragraph, index) => (
                <p key={`desc-${index}`} style={{ margin: 0, textAlign: "left" }}>
                  {paragraph}
                </p>
              ))}
              {event.description.length > 2 && (
                <TransitionLink href={`/evento/${event.slug}`} style={{ color: "#222", fontWeight: 600, textDecoration: "none", alignSelf: "flex-start", borderBottom: "1px solid black" }}>
                  Ver más
                </TransitionLink>
              )}
            </div>
          ) : null}
        </div>
    </div>
  );
}
