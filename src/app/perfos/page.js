"use client";
import styles from "../../styles/page.module.css";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { firestore } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const PERFORMANCE_TYPE = "performance";
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
  eventTypes.some((type) => type.toLowerCase() === PERFORMANCE_TYPE);

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
            const title = eventDoc.name || eventDoc.title || "Performance";
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
            <header style={{ textAlign: "center" }}>
              <h1 style={{ fontSize: "3rem", lineHeight: "3rem", marginBottom: "0.5rem", letterSpacing: "1px" }}>
                PERFOS
              </h1>
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
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "2rem",
                  justifyItems: "center",
                }}
              >
                {cards.map((card) => (
                  <Link
                    href={`/agenda/${card.slug}`}
                    key={card.id}
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <article
                      style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "1 / 1",
                          overflow: "hidden",
                          backgroundColor: "#f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "transform 0.3s ease",
                        }}
                      >
                        <img
                          src={card.imageUrl}
                          alt={card.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </div>
                      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, letterSpacing: "0.5px" }}>
                        {card.title}
                        {card.year && card.year !== "—" ? (
                          <span style={{ fontWeight: 400, color: "#666", marginLeft: "0.35rem" }}>· {card.year}</span>
                        ) : null}
                      </h2>
                    </article>
                  </Link>
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
