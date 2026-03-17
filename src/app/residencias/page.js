"use client";
import styles from "../../styles/page.module.css";
import React, { useEffect, useMemo, useState } from "react";
import { firestore } from "../firebase/firebaseConfig";
import Grid from "../../components/grid";
import AnimatedPageSection from "../../components/AnimatedPageSection";
import { collection, getDocs, query, where } from "firebase/firestore";

import {
  RESIDENCY_TYPE,
  parseDateEntry,
  extractYear,
  sortByYearDesc,
} from "../../lib/eventUtils";

export default function Residencias() {
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
          where("event_type", "array-contains", RESIDENCY_TYPE)
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
            const title = eventDoc.name || eventDoc.title || "Residencia";
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
        console.error("Error fetching residencias:", fetchError);
        setError("No pudimos cargar las residencias en este momento.");
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
              title="RESIDENCIAS"
              subtext="Con un enfoque que privilegia la investigación y el proceso artístico, Nos en Vera ofrece residencias de creación en las que cada artista define sus propias premisas de trabajo. Incentivamos a lxs artistas residentes a realizar aperturas públicas de sus procesos creativos. Estas instancias habilitan espacios de prueba y experimentación, en diálogo con la comunidad y con quienes se acercan al espacio."
              loaded={!loading}
            />

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>Cargando residencias...</div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#c00" }}>{error}</div>
            ) : cards.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                <p>No hay residencias registradas todavía.</p>
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
