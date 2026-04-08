import React from "react";
import styles from "../../styles/page.module.css";
import { firestore } from "../firebase/firebaseConfig";
import AnimatedPageSection from "../../components/AnimatedPageSection";
import { collection, getDocs } from "firebase/firestore";
import ArchivoClient from "./ArchivoClient";
import {
  FALLBACK_IMAGE,
  normalizeEventTypes,
  parseDateEntry,
  extractYear,
} from "../../lib/eventUtils";

export const metadata = {
  title: "Archivo | Memoria del Espacio",
  description: "Registro de cada obra, proceso y actividad que ha tenido lugar en Nos en Vera desde su inicio en 2023.",
};

export const revalidate = 3600; // revalidate every hour

async function getEvents() {
  try {
    const snapshot = await getDocs(collection(firestore, "events"));
    return snapshot.docs.map((docSnap) => {
      const eventDoc = docSnap.data();
      const eventTypes = normalizeEventTypes(eventDoc.event_type || eventDoc.eventType || eventDoc.type);
      const dates = Array.isArray(eventDoc.dates) ? eventDoc.dates.map(parseDateEntry).filter(Boolean) : [];
      const imageUrl = eventDoc.banner || eventDoc.flyer || eventDoc.gallery?.[0]?.url || FALLBACK_IMAGE;
      const slug = eventDoc.slug || docSnap.id;
      const title = eventDoc.name || eventDoc.title || "Evento";
      const year = extractYear(dates) ?? "—";

      return {
        id: docSnap.id,
        title,
        slug,
        imageUrl,
        year,
        eventTypes,
        dates,
      };
    });
  } catch (err) {
    console.error("Error fetching events on server:", err);
    return [];
  }
}

export default async function ArchivoPage() {
  const events = await getEvents();

  return (
    <div className={styles.page}>
      <div className={styles.page_container}>
        <div className={styles.homepage_container} style={{ paddingTop: "2rem" }}>
          <div className={styles.contentMaxWidth} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <AnimatedPageSection
              title="ARCHIVO"
              subtext="Este es un archivo en constante construcción y crecimiento. Guarda registro de cada obra, proceso y actividad que tuvo lugar en nuestro espacio desde su inicio en 2023 hasta el presente."
              loaded={true}
            />
            <ArchivoClient initialEvents={events} />
          </div>
        </div>
      </div>
    </div>
  );
}
