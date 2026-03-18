"use client";

import Link from "next/link";
import { TransitionLink } from "../../../components/TransitionLink";
import React, { use, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import styles from "../../../styles/page.module.css";

const Lightbox = dynamic(() => import("../../../components/Lightbox"), { ssr: false });
import { firestore } from "../../firebase/firebaseConfig";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

import {
  FALLBACK_IMAGE_WIDE as FALLBACK_IMAGE,
  formatDate,
  normalizeEventDoc,
  eventContainsPerformance,
  eventContainsTraining,
  eventContainsResidency,
} from "../../../lib/eventUtils";

export default function EventDetail({ params }) {
  const { slug } = use(params);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true);
      setError(null);
      setImgLoaded(false);

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
            setError("La actividad encontrada no corresponde a una publicación válida.");
          }
        } else {
          setError("Actividad no encontrada.");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
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
                {performance?.name || "Actividad"}
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
                      width: "50%",
                      flexShrink: 0,
                      backgroundColor: imgLoaded ? "#f0f0f0" : "transparent",
                      backgroundImage: imgLoaded ? "none" : "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                      backgroundSize: imgLoaded ? "auto" : "200% 100%",
                      animation: imgLoaded ? "none" : "shimmer 1.5s infinite",
                      aspectRatio: imgLoaded ? "auto" : "3 / 4",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "var(--border-radius)",
                      transition: "aspect-ratio 0.3s ease",
                      cursor: "pointer",
                    }}
                    onClick={() => setLightboxOpen(true)}
                  >
                    <img
                      src={performance.banner || performance.flyer || FALLBACK_IMAGE}
                      alt={performance.name || "Actividad"}
                      onLoad={() => setImgLoaded(true)}
                      style={{ 
                        minWidth: "5rem", 
                        width: "100%", 
                        height: "auto", 
                        objectFit: "contain", 
                        display: "block",
                        opacity: imgLoaded ? 1 : 0,
                        transition: "opacity 0.3s ease, transform 0.3s ease",
                        transform: "scale(1)",
                      }}
                      onMouseEnter={(e) => {
                        if (imgLoaded) e.currentTarget.style.transform = "scale(1.02)";
                      }}
                      onMouseLeave={(e) => {
                        if (imgLoaded) e.currentTarget.style.transform = "scale(1)";
                      }}
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
                              {artist.memberId ? (
                                <Link
                                  href={`/comunidad/${artist.memberId}`}
                                  style={{ color: "#444", textDecoration: "none", borderBottom: "1px solid #444" }}
                                >
                                  {artist.name}
                                </Link>
                              ) : (
                                artist.name
                              )}
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
                              {director.memberId ? (
                                <Link
                                  href={`/comunidad/${director.memberId}`}
                                  style={{ color: "#444", textDecoration: "none", borderBottom: "1px solid #444" }}
                                >
                                  {director.name}
                                </Link>
                              ) : (
                                director.name
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {enriched?.formattedDates?.length ? (
                      <div style={{ textAlign: "left", alignSelf: "flex-start" }}>
                        <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left" }}>Fechas</h2>
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
                            Más Información / Entradas
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </section>

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
                            alt={item.description || `${performance.name || "Actividad"} imagen ${index + 1}`}
                            style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", backgroundColor: "#f0f0f0", borderRadius: "var(--border-radius)" }}
                          />
                          {item.description ? (
                            <figcaption style={{ fontSize: "0.85rem", color: "#666" }}>{item.description}</figcaption>
                          ) : null}
                        </figure>
                      ))}
                    </div>
                  </section>
                ) : null}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    marginTop: "2rem",
                    alignSelf: "flex-end",
                    alignItems: "flex-end",
                  }}
                >
                  {performance.eventTypes?.length ? (
                    <>
                      {eventContainsPerformance(performance.eventTypes) && (
                        <TransitionLink
                          href="/performances"
                          direction="back"
                          style={{
                            textDecoration: "none",
                            fontSize: "0.9rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            color: "#222",
                            borderBottom: "1px solid #222",
                            textAlign: "right",
                            display: "inline-block",
                          }}
                        >
                          ← Perfos
                        </TransitionLink>
                      )}
                      {eventContainsTraining(performance.eventTypes) && (
                        <TransitionLink
                          href="/formaciones"
                          direction="back"
                          style={{
                            textDecoration: "none",
                            fontSize: "0.9rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            color: "#222",
                            borderBottom: "1px solid #222",
                            textAlign: "right",
                            display: "inline-block",
                          }}
                        >
                          ← Formación
                        </TransitionLink>
                      )}
                      {eventContainsResidency(performance.eventTypes) && (
                        <TransitionLink
                          href="/residencias"
                          direction="back"
                          style={{
                            textDecoration: "none",
                            fontSize: "0.9rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            color: "#222",
                            borderBottom: "1px solid #222",
                            textAlign: "right",
                            display: "inline-block",
                          }}
                        >
                          ← Residencias
                        </TransitionLink>
                      )}
                    </>
                  ) : null}
                  <TransitionLink
                    href="/archivo"
                    direction="back"
                    style={{
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "#222",
                      borderBottom: "1px solid #222",
                      textAlign: "right",
                      display: "inline-block",
                    }}
                  >
                    ← archivo
                  </TransitionLink>
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
                      textAlign: "right",
                      display: "inline-block",
                    }}
                  >
                    ← agenda
                  </TransitionLink>
                </div>

                {lightboxOpen && (
                  <Lightbox
                    isOpen={lightboxOpen}
                    imageSrc={performance.banner || performance.flyer || FALLBACK_IMAGE}
                    imageAlt={performance.name || "Actividad"}
                    onClose={() => setLightboxOpen(false)}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
