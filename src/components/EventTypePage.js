"use client";
import styles from "../styles/page.module.css";
import React, { useEffect, useMemo, useState } from "react";
import { firestore } from "../app/firebase/firebaseConfig";
import Grid from "./grid";
import AnimatedPageSection from "./AnimatedPageSection";
import { collection, getDocs, query, where } from "firebase/firestore";

import {
  parseDateEntry,
  extractYear,
  sortByYearDesc,
} from "../lib/eventUtils";

export default function EventTypePage({
  title,
  subtext,
  eventTypeFilter,
  emptyStateText,
  defaultImageAlt,
  basePath = "/evento"
}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // We use the first element of the filter array for the query (as in the original code)
        // Note: we could use 'array-contains-any' for multiple types if needed.
        const q = query(
          collection(firestore, "events"),
          where("event_type", "array-contains", eventTypeFilter)
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
            const eventTitle = eventDoc.name || eventDoc.title || defaultImageAlt;
            const year = extractYear(dates) ?? "—";

            return {
              id: eventDoc.id,
              title: eventTitle,
              slug,
              imageUrl,
              year,
            };
          })
          .filter(Boolean);

        setEvents(filtered);
      } catch (fetchError) {
        console.error(`Error fetching ${title.toLowerCase()}:`, fetchError);
        setError(`No pudimos cargar las ${title.toLowerCase()} en este momento.`);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [eventTypeFilter, title, defaultImageAlt]);

  const cards = useMemo(() => {
    return [...events].sort(sortByYearDesc);
  }, [events]);

  return (
    <div className={styles.page}>
      <div className={styles.page_container}>
        <div className={styles.homepage_container} style={{ paddingTop: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", margin: "auto" }}>
            <AnimatedPageSection
              title={title.toUpperCase()}
              subtext={subtext}
              loaded={!loading}
            />

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>Cargando {title.toLowerCase()}...</div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#c00" }}>{error}</div>
            ) : cards.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                <p>{emptyStateText}</p>
              </div>
            ) : (
              <Grid cards={cards} tight hoverOverlay basePath={basePath} yearHeadingClassName={styles.pageHeader} loaded={!loading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
