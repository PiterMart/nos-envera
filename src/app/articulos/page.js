"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import styles from "../../styles/page.module.css";
import { firestore } from "../firebase/firebaseConfig";

const formatArticleDate = (value) => {
  if (!value) return "";
  try {
    if (typeof value.toDate === "function") {
      const date = value.toDate();
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    return String(value);
  } catch (error) {
    console.error("Failed to format article date:", error);
    return "";
  }
};

export default function ArticlesPage() {
  const [articleItems, setArticleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleSubtitles, setVisibleSubtitles] = useState(new Set());
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const snapshot = await getDocs(collection(firestore, "articles"));
        const items = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data() || {};
            const rawDate = data.date;
            const date =
              rawDate && typeof rawDate.toDate === "function"
                ? rawDate.toDate()
                : rawDate
                ? new Date(rawDate)
                : null;

            const links = Array.isArray(data.links)
              ? data.links
                  .map((entry) => ({
                    title: (entry?.title || "").trim(),
                    url: (entry?.url || "").trim(),
                  }))
                  .filter((entry) => entry.url)
              : typeof data.link === "string" && data.link.trim()
              ? [{ title: "", url: data.link.trim() }]
              : [];

            return {
              id: docSnap.id,
              title: data.title || "Sin título",
              subtitle: data.subtitle || "",
              description: data.description || "",
              links,
              date,
            };
          })
          .sort((a, b) => {
            const aTime = a.date instanceof Date ? a.date.getTime() : 0;
            const bTime = b.date instanceof Date ? b.date.getTime() : 0;
            return bTime - aTime;
          });

        setArticleItems(items);
      } catch (err) {
        console.error("Failed to load article items:", err);
        setError("No se pudieron cargar los artículos. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -50px 0px",
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const subtitleId = entry.target.getAttribute("data-subtitle-id");
          if (subtitleId) {
            setVisibleSubtitles((prev) => new Set([...prev, subtitleId]));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const subtitleElements = document.querySelectorAll("[data-subtitle-id]");
    subtitleElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [articleItems]);

  return (
    <div className={styles.page}>
      <div className={styles.page_container}>
        <div className={styles.homepage_container} style={{ paddingTop: "2rem" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              width: "100%",
              margin: "auto",
              maxWidth: "800px",
            }}
          >
            <header
              className={`${styles.pageHeader} ${
                visibleSubtitles.has("subtitle1")
                  ? styles.sectionSubtitleVisible
                  : ""
              }`}
              data-subtitle-id="subtitle1"
            >
              <h1>ARTÍCULOS</h1>
              <p
                style={{
                  lineHeight: "1.6rem",
                  fontSize: "1.1rem",
                  color: "#666",
                }}
              >
                Entrevistas, notas y artículos sobre Nos en Vera.
              </p>
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {loading && (
                <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                  <p>Cargando artículos...</p>
                </div>
              )}

              {!loading && error && (
                <div style={{ textAlign: "center", padding: "3rem", color: "#c00" }}>
                  <p>{error}</p>
                </div>
              )}

              {!loading && !error && articleItems.length === 0 && (
                <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                  <p>Aún no hay artículos cargados.</p>
                </div>
              )}

              {!loading && !error && articleItems.length > 0 && (
                <ul
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    borderTop: "1px solid #e0e0e0",
                  }}
                >
                  {articleItems.map((articleItem) => {
                    const isExpanded = expandedItems.has(articleItem.id);
                    return (
                      <li
                        key={articleItem.id}
                        style={{
                          borderBottom: "1px solid #e0e0e0",
                          padding: "0.5rem 0",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleExpanded(articleItem.id)}
                          aria-expanded={isExpanded}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            background: "none",
                            border: "none",
                            padding: "0.75rem 0",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "1rem",
                            fontSize: "1.1rem",
                            color: "#111",
                          }}
                        >
                          <span
                            className={`${styles.sectionSubtitle} ${
                              visibleSubtitles.has(`subtitle-${articleItem.id}`)
                                ? styles.sectionSubtitleVisible
                                : ""
                            }`}
                            data-subtitle-id={`subtitle-${articleItem.id}`}
                            style={{
                              display: "block",
                              fontSize: "1.2rem",
                              lineHeight: "1.4rem",
                            }}
                          >
                            {articleItem.title}
                          </span>
                          <span
                            style={{
                              fontSize: "1.5rem",
                              lineHeight: "1",
                              transform: isExpanded ? "rotate(45deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                            }}
                            aria-hidden="true"
                          >
                            +
                          </span>
                        </button>

                        {isExpanded && (
                          <div
                            style={{
                              paddingBottom: "1rem",
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.75rem",
                              fontSize: "0.95rem",
                              color: "#333",
                            }}
                          >
                            {articleItem.subtitle && (
                              <p style={{ fontWeight: "500" }}>{articleItem.subtitle}</p>
                            )}

                            {articleItem.date && (
                              <p style={{ color: "#666" }}>{formatArticleDate(articleItem.date)}</p>
                            )}

                            {articleItem.description && (
                              <p style={{ lineHeight: "1.6rem", marginBottom: "0.5rem" }}>
                                {articleItem.description}
                              </p>
                            )}

                            {articleItem.links && articleItem.links.length > 0 && (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.5rem",
                                }}
                              >
                                {articleItem.links.map((link, linkIndex) => (
                                  <a
                                    key={`${articleItem.id}-link-${linkIndex}`}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      padding: "0.5rem 0",
                                      color: "#0066cc",
                                      textDecoration: "underline",
                                      fontSize: "0.95rem",
                                    }}
                                  >
                                    {link.title || "Ver publicación"}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
