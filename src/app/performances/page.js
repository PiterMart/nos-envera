"use client";
import styles from "../../styles/page.module.css";
import React, { useEffect, useMemo, useState } from "react";
import { firestore } from "../firebase/firebaseConfig";
import Grid from "../../components/grid";
import AnimatedPageSection from "../../components/AnimatedPageSection";
import { collection, getDocs, query, where } from "firebase/firestore";

import {
  PERFORMANCE_TYPES,
  parseDateEntry,
  extractYear,
  sortByYearDesc,
} from "../../lib/eventUtils";

export default function Perfos() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const q = query(
          collection(firestore, "events"),
          where("event_type", "array-contains", PERFORMANCE_TYPES[0])
        );
        const snapshot = await getDocs(q);
        const documents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const filtered = documents
          .map((eventDoc) => {
            const dates = Array.isArray(eventDoc.dates)
              ? eventDoc.dates.map(parseDateEntry).filter(Boolean)
              : [];

            const imageUrl = eventDoc.banner || eventDoc.flyer || eventDoc.gallery?.[0]?.url || null;
            const slug = eventDoc.slug || eventDoc.id;
            const title = eventDoc.name || eventDoc.title || "Presentación";
            const year = extractYear(dates) ?? "—";

            return {
              id: eventDoc.id,
              title,
              slug,
              imageUrl,
              year,
            };
          })
          .filter(Boolean);

        setEvents(filtered);
      } catch (fetchError) {
        console.error("Error fetching perfos:", fetchError);
        setError("No pudimos cargar las perfos en este momento.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const cards = useMemo(() => {
    return [...events].sort(sortByYearDesc);
  }, [events]);

  return (
    <div className={styles.page}>
      <div className={styles.page_container}>
        <div className={styles.homepage_container} style={{ paddingTop: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", margin: "auto" }}>
            <AnimatedPageSection
              title="PERFOS"
              subtext="Las exhibiciones y performance son instancias abiertas al público, que permiten el despliegue de obras de artistas contemporánexs, en compromiso con una escena viva, en diálogo con la comunidad y fortalecen la circulación de nuevas prácticas."
              loaded={!loading}
            />

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>Cargando perfos...</div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#c00" }}>{error}</div>
            ) : cards.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                <p>No hay perfos registradas todavía.</p>
              </div>
            ) : (
              <Grid cards={cards} tight hoverOverlay basePath="/archivo" yearHeadingClassName={styles.pageHeader} loaded={!loading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
