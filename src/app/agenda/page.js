import React from "react";
import styles from "../../styles/page.module.css";
import { firestore } from "../firebase/firebaseConfig";
import AgendaList from "../../components/AgendaList";
import AnimatedPageSection from "../../components/AnimatedPageSection";
import { collection, getDocs } from "firebase/firestore";
import {
  FALLBACK_IMAGE,
  parseDateEntry,
  extractYear,
  eventHasDateInCurrentMonth,
  hasFutureDate,
  sortByYearDesc,
} from "../../lib/eventUtils";

export const metadata = {
  title: "Agenda | Próximas Actividades",
  description: "Consulta las próximas actividades abiertas a la comunidad en Nos en Vera: funciones, aperturas y formación.",
};

async function getAgendaEvents() {
  try {
    const snapshot = await getDocs(collection(firestore, "events"));
    const documents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return documents
      .map((eventDoc) => {
        const dates = Array.isArray(eventDoc.dates)
          ? eventDoc.dates.map(parseDateEntry).filter(Boolean)
          : [];

        const imageUrl = eventDoc.banner || eventDoc.flyer || eventDoc.gallery?.[0]?.url || FALLBACK_IMAGE;
        const slug = eventDoc.slug || eventDoc.id;
        const title = eventDoc.name || eventDoc.title || "Evento";
        const year = extractYear(dates) ?? "—";

        return {
          id: eventDoc.id,
          title,
          slug,
          imageUrl,
          year,
          dates,
        };
      })
      .filter((event) => hasFutureDate(event.dates))
      .sort(sortByYearDesc);
  } catch (err) {
    console.error("Error fetching agenda on server:", err);
    return [];
  }
}

export default async function AgendaPage() {
  const events = await getAgendaEvents();

  return (
    <div className={styles.page}>
      <div className={styles.page_container}>
        <div className={styles.homepage_container} style={{ paddingTop: "2rem" }}>
          <div className={styles.contentMaxWidth} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <AnimatedPageSection
              title="AGENDA"
              subtext="Estas son las próximas actividades abiertas a la comunidad que ofrece Nos en Vera: funciones, aperturas de procesos y espacios de formación."
              loaded={true}
            />

            {events.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                <p>No hay actividades próximas programadas.</p>
              </div>
            ) : (
              <AgendaList events={events} basePath="/evento" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
