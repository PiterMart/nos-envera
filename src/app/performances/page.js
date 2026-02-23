"use client";
import styles from "../../styles/page.module.css";
import React, { useEffect, useMemo, useState } from "react";
import { firestore } from "../firebase/firebaseConfig";
import Grid from "../../components/grid";
import { collection, getDocs } from "firebase/firestore";

const PERFORMANCE_TYPES = ["Presentación", "Presentacion", "presentación", "presentacion", "performance"];
const FALLBACK_IMAGE = "https://via.placeholder.com/600x800.png?text=Performance";

const normalizeEventTypes = (rawTypes) => {
  if (Array.isArray(rawTypes)) {
    return rawTypes.map((type) => String(type).trim()).filter(Boolean);
  }
  if (typeof rawTypes === "string" && rawTypes.trim()) {
    return rawTypes.split(",").map((type) => type.trim()).filter(Boolean);
  }
  return [];
};

const eventContainsPerformance = (eventTypes) =>
  eventTypes.some((type) => 
    PERFORMANCE_TYPES.some((performanceType) => 
      type.toLowerCase() === performanceType.toLowerCase()
    )
  );

const parseDateEntry = (entry) => {
  if (!entry) return null;
  let dateValue = entry.date;
  let parsedDate = null;

  if (dateValue?.toDate) {
    parsedDate = dateValue.toDate();
  } else if (typeof dateValue === "string" || typeof dateValue === "number") {
    const attempt = new Date(dateValue);
    if (!Number.isNaN(attempt.getTime())) {
      parsedDate = attempt;
    }
  } else if (dateValue instanceof Date) {
    parsedDate = dateValue;
  }

  if (parsedDate && Number.isNaN(parsedDate.getTime())) {
    parsedDate = null;
  }

  const time = typeof entry.time === "string" ? entry.time.trim() : "";

  if (!parsedDate && !time) {
    return null;
  }

  return { date: parsedDate, time };
};

const extractYear = (dates = []) => {
  const entry = dates.find((item) => item?.date) || null;
  if (!entry) return null;
  if (entry.date?.toDate) {
    return entry.date.toDate().getFullYear();
  }
  if (entry.date instanceof Date) {
    return entry.date.getFullYear();
  }
  const parsed = new Date(entry.date);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getFullYear();
};

export default function Perfos() {
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

        const filtered = documents
          .map((eventDoc) => {
            const eventTypes = normalizeEventTypes(eventDoc.event_type || eventDoc.eventType || eventDoc.type);
            if (!eventContainsPerformance(eventTypes)) {
              return null;
            }

            const dates = Array.isArray(eventDoc.dates)
              ? eventDoc.dates.map(parseDateEntry).filter(Boolean)
              : [];

            const imageUrl = eventDoc.banner || eventDoc.flyer || eventDoc.gallery?.[0]?.url || FALLBACK_IMAGE;
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
    return events.sort((a, b) => {
      if (a.year === "—" && b.year !== "—") return 1;
      if (a.year !== "—" && b.year === "—") return -1;
      return String(b.year).localeCompare(String(a.year));
    });
  }, [events]);

  return (
    <div className={styles.page}>
      <div className={styles.page_container}>
        <div className={styles.homepage_container} style={{ paddingTop: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", margin: "auto", maxWidth: "1200px" }}>
            <header className={styles.pageHeader}>
              <h1>PERFORMANCES</h1>
            </header>

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>Cargando perfos...</div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#c00" }}>{error}</div>
            ) : cards.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                <p>No hay perfos registradas todavía.</p>
              </div>
            ) : (
              <Grid cards={cards} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
