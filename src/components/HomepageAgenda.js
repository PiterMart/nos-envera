import React from 'react';
import Image from "next/image";
import { firestore } from "../app/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { TransitionLink } from "./TransitionLink";
import HomepageAgendaSlider from "./HomepageAgendaSlider";
import styles from "../styles/page.module.css";
import {
  FALLBACK_IMAGE_WIDE as FALLBACK_IMAGE,
  parseDateEntry,
  hasFutureDate,
  formatDate,
  normalizeArrayOfPeople,
  normalizeEventTypes,
  PERFORMANCE_TYPES
} from "../lib/eventUtils";

async function getUpcomingAgendaEvents() {
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

    if (futureEvents.length === 0) return [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Sort by earliest future date
    futureEvents.sort((a, b) => {
      const dateA = a.parsedDates.find(d => d.date >= now)?.date || new Date(9999, 0, 1);
      const dateB = b.parsedDates.find(d => d.date >= now)?.date || new Date(9999, 0, 1);
      return dateA - dateB;
    });

    return futureEvents.slice(0, 5).map(event => {
      const imageUrl = event.banner || event.flyer || event.gallery?.[0]?.url || FALLBACK_IMAGE;

      const dateString = (event.parsedDates || [])
        .map(d => {
          if (!d.date) return null;
          const formattedDate = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' }).format(d.date);
          return d.time ? `${formattedDate} ${d.time}` : formattedDate;
        })
        .filter(Boolean)
        .join(" | ");

      return {
        id: event.id,
        title: event.name || event.title || "Evento",
        subtitle: event.subtitle || "",
        description: Array.isArray(event.description) ? event.description : typeof event.description === 'string' ? event.description.split('\n') : [],
        slug: event.slug || event.id,
        imageUrl,
        dateString,
        type: normalizeEventTypes(event.event_type || event.eventType || event.type).map(t =>
          PERFORMANCE_TYPES.some(pt => pt.toLowerCase() === t.toLowerCase()) ? "Performance" : t
        ),
        directors: normalizeArrayOfPeople(event.directors)
      };
    });
  } catch (err) {
    console.error("Error fetching agenda for homepage:", err);
    return [];
  }
}

export default async function HomepageAgenda() {
  const events = await getUpcomingAgendaEvents();

  if (!events || events.length === 0) return null;

  return (
    <div className={styles.responsiveSection} style={{ width: "100%", padding: "4rem 0", display: "flex", flexDirection: "row", gap: "2rem", alignItems: "flex-start", minHeight: '50vh' }}>
      <div style={{ flexShrink: 0, paddingRight: "3rem" }}>
        <h2 style={{ fontFamily: "var(--font-family-base)", fontSize: "4.5rem", fontWeight: 600, letterSpacing: "1px", margin: 0, textTransform: "uppercase", lineHeight: 1 }}>PRÓXIMOS</h2>
        <h2 style={{ fontFamily: "var(--font-family-base)", fontSize: "4.5rem", fontWeight: 600, letterSpacing: "1px", margin: 0, textTransform: "uppercase", lineHeight: 1 }}>EVENTOS</h2>
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
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

      <HomepageAgendaSlider events={events} />
    </div>
  );
}
