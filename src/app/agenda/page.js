"use client";
import styles from "../../styles/page.module.css";
import React, { useEffect, useMemo, useState } from "react";
import { firestore } from "../firebase/firebaseConfig";
import Grid from "../../components/grid";
import AnimatedPageSection from "../../components/AnimatedPageSection";
import { collection, getDocs } from "firebase/firestore";

import {
  FALLBACK_IMAGE,
  parseDateEntry,
  extractYear,
  eventHasDateInCurrentMonth,
} from "../../lib/eventUtils";

export default function Agenda() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const snapshot = await getDocs(collection(firestore, "events"));
        const documents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const processed = documents
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
          .filter(Boolean)
          .filter((event) => eventHasDateInCurrentMonth(event.dates))
          .map(({ dates: _dates, ...event }) => event);

        setEvents(processed);
      } catch (fetchError) {
        console.error("Error fetching events:", fetchError);
        setError("No pudimos cargar los eventos en este momento.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const cards = useMemo(() => {
    return events
      .map((event) => ({
        id: event.id,
        title: event.title,
        slug: event.slug,
        imageUrl: event.imageUrl,
        year: event.year,
      }))
      .sort((a, b) => {
        if (a.year === "—" && b.year !== "—") return 1;
        if (a.year !== "—" && b.year === "—") return -1;
        return String(b.year).localeCompare(String(a.year));
      });
  }, [events]);

  return (
    <div className={styles.page}>
      <div className={styles.page_container}>
        <div className={styles.homepage_container} style={{ paddingTop: "2rem" }}>
          <div className={styles.contentMaxWidth} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <AnimatedPageSection
              title="AGENDA"
              subtext="Estas son las próximas actividades abiertas a la comunidad que ofrece Nos en Vera: funciones, aperturas de procesos y espacios de formación. "
              loaded={!loading}
            />

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>Cargando eventos...</div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#c00" }}>{error}</div>
            ) : cards.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                <p>No hay eventos este mes.</p>
              </div>
            ) : (
              <Grid cards={cards} hideImages={true} basePath="/evento" loaded={!loading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
