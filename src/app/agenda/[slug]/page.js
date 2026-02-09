"use client";

import Link from "next/link";
import { TransitionLink } from "../../../components/TransitionLink";
import React, { use, useEffect, useMemo, useState } from "react";
import styles from "../../../styles/page.module.css";
import { firestore } from "../../firebase/firebaseConfig";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

const FALLBACK_IMAGE = "https://via.placeholder.com/1600x900.png?text=Performance";
const PERFORMANCE_TYPES = ["Presentación", "Presentacion", "presentación", "presentacion", "performance"];
const RESIDENCY_TYPE = "Residencia";
const TRAINING_TYPES = ["Formación", "Formacion", "training"];

const isLikelyVideo = (url = "") => {
  return url.toLowerCase().endsWith(".mp4") || url.toLowerCase().includes("mime=video");
};

const formatDate = (value) => {
  if (!value) return null;

  let date;
  if (value?.toDate) {
    date = value.toDate();
  } else {
    date = new Date(value);
  }

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

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

const eventContainsResidency = (eventTypes) =>
  eventTypes.some((type) => type.toLowerCase() === RESIDENCY_TYPE.toLowerCase());

const eventContainsTraining = (eventTypes) =>
  eventTypes.some((type) => 
    TRAINING_TYPES.some((trainingType) => 
      type.toLowerCase() === trainingType.toLowerCase()
    )
  );

const eventContainsPerformanceOrResidencyOrTraining = (eventTypes) =>
  eventContainsPerformance(eventTypes) || eventContainsResidency(eventTypes) || eventContainsTraining(eventTypes);

const normalizeArrayOfPeople = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") {
        const name = item.trim();
        return name ? { name } : null;
      }
      if (item && typeof item === "object") {
        const name = String(item.name || item.fullName || item.displayName || item.slug || "").trim();
        return name ? { ...item, name } : null;
      }
      return null;
    })
    .filter(Boolean);
};

const normalizeDescription = (value) => {
  if (Array.isArray(value)) {
    return value.map((paragraph) => (typeof paragraph === "string" ? paragraph : "")).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value.split("\n").map((paragraph) => paragraph.trim()).filter(Boolean);
  }
  return [];
};

const normalizeGallery = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") {
        return { url: item, description: "" };
      }
      if (typeof item === "object" && item.url) {
        return { url: item.url, description: item.description || "" };
      }
      return null;
    })
    .filter(Boolean);
};

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

const normalizeEventDoc = (docData, docId) => {
  if (!docData) return null;

  const eventTypes = normalizeEventTypes(docData.event_type || docData.eventType || docData.type);
  if (!eventContainsPerformanceOrResidencyOrTraining(eventTypes)) {
    return null;
  }

  const dates = Array.isArray(docData.dates) ? docData.dates.map(parseDateEntry).filter(Boolean) : [];
  const rawPurchaseLink = docData.purchase_link || docData.purchaseLink || "";
  const purchaseLink =
    typeof rawPurchaseLink === "string" ? rawPurchaseLink.trim() : "";

  return {
    id: docId,
    name: docData.name || docData.title || "Presentación",
    subtitle: docData.subtitle || "",
    description: normalizeDescription(docData.description),
    artists: normalizeArrayOfPeople(docData.artists),
    directors: normalizeArrayOfPeople(docData.directors),
    dates,
    address: docData.address || "",
    googleMapsLink: docData.googleMapsLink || "",
    purchaseLink,
    slug: docData.slug || docId,
    banner: docData.banner || "",
    flyer: docData.flyer || "",
    gallery: normalizeGallery(docData.gallery),
    eventTypes,
  };
};

export default function PerformanceDetail({ params }) {
  const { slug } = use(params);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true);
      setError(null);

      try {
        const docRef = doc(firestore, "events", slug);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const normalized = normalizeEventDoc(snapshot.data(), snapshot.id);
          if (normalized) {
            setPerformance(normalized);
            setLoading(false);
            return;
          }
        }

        const slugQuery = query(
          collection(firestore, "events"),
          where("slug", "==", slug)
        );
        const slugSnapshot = await getDocs(slugQuery);
        if (!slugSnapshot.empty) {
          const docMatch = slugSnapshot.docs[0];
          const normalized = normalizeEventDoc(docMatch.data(), docMatch.id);
          if (normalized) {
            setPerformance(normalized);
          } else {
            setError("La actividad encontrada no corresponde a una performance, residencia o formación.");
          }
        } else {
          setError("Actividad no encontrada.");
        }
      } catch (err) {
        console.error("Error fetching performance:", err);
        setError("Ocurrió un error al cargar la actividad.");
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [slug]);

  const enriched = useMemo(() => {
    if (!performance) return null;

    const firstDate = performance?.dates?.find?.((entry) => entry?.date) || null;
    const formattedDates = (performance?.dates || [])
      .map((entry) => {
        const formattedDate = formatDate(entry?.date);
        const time = entry?.time;
        if (!formattedDate && !time) return null;
        return {
          dateLabel: formattedDate,
          time,
        };
      })
      .filter(Boolean);

    const year = formatDate(firstDate?.date)?.split(" ").pop() || null;

    return {
      ...performance,
      formattedDates,
      year,
    };
  }, [performance]);

  return (
    <div className={styles.page}>
      <div className={styles.page_container}>
        <div className={styles.homepage_container} style={{ paddingTop: "2rem" }}>
          <div
            className={styles.contentMaxWidth}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              marginBottom: "10rem",
            }}
          >
            <header className={styles.pageHeaderSmall} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", marginBottom: 0 }}>
              <h1 style={{ fontWeight: 600, letterSpacing: "1px", marginBottom: 0 }}>
                {performance?.name || "Performance"}
                {enriched?.year ? (
                  <span style={{ fontSize: "1.5rem", fontWeight: 400, color: "#666", marginLeft: "0.5rem" }}>
                    · {enriched.year}
                  </span>
                ) : null}
              </h1>
            </header>

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>Cargando actividad…</div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#c00" }}>{error}</div>
            ) : !performance ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                No encontramos la actividad solicitada.
              </div>
            ) : (
              <>
                <section className={styles.responsiveSection} style={{ display: "flex", flexDirection: "row", gap: "1.5rem", alignItems: "flex-start" }}>
                  <div
                    className={styles.responsiveImageContainer}
                    style={{
                      minWidth: "5rem",
                      maxWidth: "50%",
                      flexShrink: 0,
                      backgroundColor: "#f0f0f0",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={performance.banner || performance.flyer || FALLBACK_IMAGE}
                      alt={performance.name || "Performance"}
                      style={{ minWidth: "5rem", width: "100%", height: "auto", objectFit: "contain", display: "block" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", flex: 1, textAlign: "left", alignItems: "flex-start" }}>
                    {performance.subtitle ? (
                      <p style={{ fontSize: "1.1rem", color: "#444", margin: 0, textAlign: "left" }}>{performance.subtitle}</p>
                    ) : null}

                    {performance.description?.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", lineHeight: "1.7", textAlign: "left" }}>
                        {performance.description.map((paragraph, index) => (
                          <p key={`desc-${index}`} style={{ margin: 0, textAlign: "left" }}>
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : null}

                    {performance.artists?.length ? (
                      <div style={{ textAlign: "left", alignSelf: "flex-start" }}>
                        <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left" }}>Artistas</h2>
                        <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0 0", display: "flex", flexDirection: "column", gap: "0.35rem", textAlign: "left" }}>
                          {performance.artists.map((artist, index) => (
                            <li key={`artist-${index}`} style={{ color: "#444", textAlign: "left" }}>
                              {artist.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {performance.directors?.length ? (
                      <div style={{ textAlign: "left", alignSelf: "flex-start" }}>
                        <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left" }}>Directores</h2>
                        <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0 0", display: "flex", flexDirection: "column", gap: "0.35rem", textAlign: "left" }}>
                          {performance.directors.map((director, index) => (
                            <li key={`director-${index}`} style={{ color: "#444", textAlign: "left" }}>
                              {director.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {enriched?.formattedDates?.length ? (
                      <div style={{ textAlign: "left", alignSelf: "flex-start" }}>
                        <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left" }}>Funciones</h2>
                        <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0 0", display: "flex", flexDirection: "column", gap: "0.35rem", textAlign: "left" }}>
                          {enriched.formattedDates.map((entry, index) => (
                            <li key={`date-${index}`} style={{ color: "#444", textAlign: "left" }}>
                              {entry.dateLabel || "Fecha por confirmar"}
                              {entry.time ? ` · ${entry.time}` : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {(performance.address || performance.googleMapsLink || performance.purchaseLink) ? (
                      <div style={{ textAlign: "left", alignSelf: "flex-start" }}>
                        <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left" }}>Ubicación</h2>
                        {performance.address ? (
                          <p style={{ color: "#444", marginTop: "0.5rem", textAlign: "left" }}>{performance.address}</p>
                        ) : null}
                        {performance.googleMapsLink ? (
                          <a
                            href={performance.googleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-block",
                              marginTop: "0.75rem",
                              paddingBottom: "0.2rem",
                              borderBottom: "1px solid #222",
                              fontSize: "0.9rem",
                              letterSpacing: "0.5px",
                              color: "#222",
                              textDecoration: "none",
                              textAlign: "left",
                            }}
                          >
                            Ver en Google Maps
                          </a>
                        ) : null}
                        {performance.purchaseLink ? (
                          <a
                            href={performance.purchaseLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-block",
                              marginTop: "0.75rem",
                              padding: "0.6rem 1.2rem",
                              backgroundColor: "#111",
                              color: "#fff",
                              textDecoration: "none",
                              letterSpacing: "0.5px",
                              fontSize: "0.85rem",
                              textTransform: "uppercase",
                              textAlign: "left",
                            }}
                          >
                            Comprar entradas
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </section>
{/* 
                {performance.flyer ? (
                  <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Flyer</h2>
                    {isLikelyVideo(performance.flyer) ? (
                      <video
                        controls
                        style={{ width: "100%", maxHeight: "60vh", backgroundColor: "#000" }}
                      >
                        <source src={performance.flyer} type="video/mp4" />
                        Tu navegador no soporta la reproducción de video.
                      </video>
                    ) : (
                      <img
                        src={performance.flyer}
                        alt={`${performance.name || "Performance"} flyer`}
                        style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", backgroundColor: "#fafafa" }}
                      />
                    )}
                  </section>
                ) : null} */}

                {performance.gallery?.length ? (
                  <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Galería</h2>
                    <div
                      style={{
                        display: "grid",
                        gap: "1.5rem",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                      }}
                    >
                      {performance.gallery.map((item, index) => (
                        <figure key={`gallery-${index}`} style={{ margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          <img
                            src={item.url}
                            alt={item.description || `${performance.name || "Performance"} imagen ${index + 1}`}
                            style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", backgroundColor: "#f0f0f0" }}
                          />
                          {item.description ? (
                            <figcaption style={{ fontSize: "0.85rem", color: "#666" }}>{item.description}</figcaption>
                          ) : null}
                        </figure>
                      ))}
                    </div>
                  </section>
                ) : null}

                <TransitionLink
                  href="/agenda"
                  direction="back"
                  style={{
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#222",
                    borderBottom: "1px solid #222",
                    marginTop: "2rem",
                    alignSelf: "flex-end",
                    textAlign: "right",
                    display: "inline-block",
                    marginLeft: "auto",
                  }}
                >
                  ← Volver al archivo
                </TransitionLink>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


