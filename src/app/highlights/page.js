"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../../styles/page.module.css";
import { firestore } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const FALLBACK_IMAGE = "https://via.placeholder.com/600x800.png?text=Performance";

export default function Highlights() {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHighlightedPerformances = async () => {
      setLoading(true);
      setError(null);

      try {
        const performancesRef = collection(firestore, "performances");
        const snapshot = await getDocs(performancesRef);
        const items = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((item) => {
            if (typeof item.isFeatured === "boolean") {
              return item.isFeatured;
            }
            if (typeof item.isFeatured === "string") {
              return item.isFeatured.toLowerCase() === "true";
            }
            return false;
          });
        setPerformances(items);
      } catch (err) {
        console.error("Error fetching highlighted performances:", err);
        setError("No se pudieron cargar las performances destacadas.");
        setPerformances([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlightedPerformances();
  }, []);

  const cards = useMemo(() => {
    const extractYear = (performance) => {
      const fromDatesArray = performance?.dates?.find?.((entry) => entry?.date);
      if (fromDatesArray) {
        const dateValue = fromDatesArray.date;
        if (dateValue?.toDate) {
          return dateValue.toDate().getFullYear();
        }
        const parsed = new Date(dateValue);
        if (!isNaN(parsed.getTime())) {
          return parsed.getFullYear();
        }
      }

      const fallbackDate = performance?.openingDate || performance?.date;
      if (fallbackDate) {
        if (fallbackDate?.toDate) {
          return fallbackDate.toDate().getFullYear();
        }
        const parsed = new Date(fallbackDate);
        if (!isNaN(parsed.getTime())) {
          return parsed.getFullYear();
        }
      }

      return null;
    };

    return performances.map((performance) => {
      const imageUrl = performance.banner || performance.flyer || performance.gallery?.[0]?.url || FALLBACK_IMAGE;
      const title = performance.name || performance.title || "Performance";
      const year = extractYear(performance);
      const slug = performance.slug || performance.id;
      return { id: performance.id, imageUrl, title, year, slug };
    });
  }, [performances]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.page_container}>
          <div className={styles.artists_page}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
                width: "100%",
                margin: "auto",
                maxWidth: "1000px",
                marginTop: "5rem",
              }}
            >
              <header style={{ textAlign: "center" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: "300", marginBottom: "1rem" }}>Highlights</h1>
                <p style={{ lineHeight: "1.5rem", textAlign: "justify" }}>
                  Highlights presenta una selección curada de lo más destacado en arte contemporáneo, incluyendo exposiciones notables, obras excepcionales y eventos culturales de relevancia.
                </p>
                <p style={{ lineHeight: "1.5rem", textAlign: "justify" }}>
                  Esta sección destaca las tendencias emergentes, movimientos artísticos importantes y momentos clave en el mundo del arte que merecen especial atención.
                </p>
              </header>

              {loading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>Cargando performances destacadas...</div>
              ) : error ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "#c00" }}>{error}</div>
              ) : cards.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                  <p>No hay performances destacadas por ahora.</p>
                </div>
              ) : (
                <section
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "2rem",
                    justifyItems: "center",
                    width: "100%",
                  }}
                >
                  {cards.map((card) => (
                    <Link
                      href={`/performance/${card.slug}`}
                      key={card.id}
                      style={{
                        width: "100%",
                        maxWidth: "280px",
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
                          {card.year ? (
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
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}



