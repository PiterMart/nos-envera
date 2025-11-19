"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import styles from "../../../styles/page.module.css";
import { firestore } from "../../firebase/firebaseConfig";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

const FALLBACK_IMAGE = "https://via.placeholder.com/1600x900.png?text=Performance";
const PERFORMANCE_TYPE = "performance";
const RESIDENCY_TYPE = "residency";
const TRAINING_TYPE = "training";

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
  eventTypes.some((type) => type.toLowerCase() === PERFORMANCE_TYPE);

const eventContainsResidency = (eventTypes) =>
  eventTypes.some((type) => type.toLowerCase() === RESIDENCY_TYPE);

const eventContainsTraining = (eventTypes) =>
  eventTypes.some((type) => type.toLowerCase() === TRAINING_TYPE);

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
    name: docData.name || docData.title || "Performance",
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
  const { slug } = params;
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
            style={{
              maxWidth: "960px",
              margin: "0 auto",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h1 style={{ fontSize: "2.5rem", fontWeight: 600, letterSpacing: "1px" }}>
                {performance?.name || "Performance"}
                {enriched?.year ? (
                  <span style={{ fontSize: "1.5rem", fontWeight: 400, color: "#666", marginLeft: "0.5rem" }}>
                    · {enriched.year}
                  </span>
                ) : null}
              </h1>
              <Link
                href={
                  performance?.eventTypes?.some((type) => type.toLowerCase() === RESIDENCY_TYPE)
                    ? "/residencias"
                    : performance?.eventTypes?.some((type) => type.toLowerCase() === TRAINING_TYPE)
                    ? "/formacion"
                    : "/perfos"
                }
                style={{
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "#222",
                  borderBottom: "1px solid #222",
                }}
              >
                Volver al archivo
              </Link>
            </div>

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
                <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 9",
                      backgroundColor: "#f0f0f0",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={performance.banner || performance.flyer || FALLBACK_IMAGE}
                      alt={performance.name || "Performance"}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>

                  {performance.subtitle ? (
                    <p style={{ fontSize: "1.1rem", color: "#444" }}>{performance.subtitle}</p>
                  ) : null}

                  {performance.description?.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", lineHeight: "1.7" }}>
                      {performance.description.map((paragraph, index) => (
                        <p key={`desc-${index}`} style={{ margin: 0 }}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </section>

                <section
                  style={{
                    display: "grid",
                    gap: "1.5rem",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  }}
                >
                  {performance.artists?.length ? (
                    <div>
                      <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Artistas</h2>
                      <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0 0", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        {performance.artists.map((artist, index) => (
                          <li key={`artist-${index}`} style={{ color: "#444" }}>
                            {artist.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {performance.directors?.length ? (
                    <div>
                      <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Directores</h2>
                      <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0 0", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        {performance.directors.map((director, index) => (
                          <li key={`director-${index}`} style={{ color: "#444" }}>
                            {director.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {enriched?.formattedDates?.length ? (
                    <div>
                      <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Funciones</h2>
                      <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0 0", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        {enriched.formattedDates.map((entry, index) => (
                          <li key={`date-${index}`} style={{ color: "#444" }}>
                            {entry.dateLabel || "Fecha por confirmar"}
                            {entry.time ? ` · ${entry.time}` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {(performance.address || performance.googleMapsLink || performance.purchaseLink) ? (
                    <div>
                      <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Ubicación</h2>
                      {performance.address ? (
                        <p style={{ color: "#444", marginTop: "0.5rem" }}>{performance.address}</p>
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
                          }}
                        >
                          Comprar entradas
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </section>

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
                ) : null}

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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


