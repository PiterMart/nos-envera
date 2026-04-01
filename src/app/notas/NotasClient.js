"use client";

import React, { useEffect, useState } from "react";
import styles from "../../styles/page.module.css";

const formatNotaDate = (value) => {
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
    console.error("Failed to format nota date:", error);
    return "";
  }
};

export default function NotasClient({ initialNotas }) {
  const [notaItems, setNotaItems] = useState(initialNotas || []);
  const [loading, setLoading] = useState(!initialNotas);
  const [error, setError] = useState(null);
  const [visibleSubtitles, setVisibleSubtitles] = useState(new Set());
  const [expandedItems, setExpandedItems] = useState(new Set());

  const setExpanded = (itemId, isExpanded) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (isExpanded) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }
      return next;
    });
  };

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
  }, [notaItems]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
          <p>Cargando notas...</p>
        </div>
      )}

      {!loading && error && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#c00" }}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && notaItems.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
          <p>Aún no hay notas cargadas.</p>
        </div>
      )}

      {!loading && !error && notaItems.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            borderTop: "1px solid #e0e0e0",
          }}
        >
          {notaItems.map((notaItem) => {
            const isExpanded = expandedItems.has(notaItem.id);
            return (
              <li
                key={notaItem.id}
                onMouseEnter={() => setExpanded(notaItem.id, true)}
                onMouseLeave={() => setExpanded(notaItem.id, false)}
                style={{
                  borderBottom: "1px solid black",
                  padding: "0",
                }}
              >
                <div
                  aria-expanded={isExpanded}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "1rem 0 0.5rem 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: "1rem",
                    color: "black",
                  }}
                >
                  <span
                    className={`${styles.sectionSubtitle} ${
                      visibleSubtitles.has(`subtitle-${notaItem.id}`)
                        ? styles.sectionSubtitleVisible
                        : ""
                    }`}
                    data-subtitle-id={`subtitle-${notaItem.id}`}
                    style={{
                      display: "block",
                      fontFamily: "var(--font-grid-card)",
                      fontStyle: "italic",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      lineHeight: "1.3",
                    }}
                  >
                    {notaItem.title}
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
                </div>

                {isExpanded && (
                  <div
                    style={{
                      paddingBottom: "1rem",
                      display: "flex",
                      flexDirection: "row",
                      gap: "1.5rem",
                      fontSize: "0.95rem",
                      color: "#333",
                      alignItems: "flex-start",
                    }}
                  >
                    {notaItem.coverImage && (
                      <div
                        style={{
                          flexShrink: 0,
                          width: "40%",
                          maxWidth: "350px",
                          marginTop: "0.25rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <img
                          src={notaItem.coverImage}
                          alt={notaItem.title}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "40vh",
                            height: "auto",
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      </div>
                    )}

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0" }}>
                      {notaItem.subtitle && (
                        <p style={{ fontWeight: "500", margin: 0 }}>{notaItem.subtitle}</p>
                      )}

                      {notaItem.date && (
                        <p style={{ color: "#666", margin: 0 }}>
                          {formatNotaDate(notaItem.date)}
                        </p>
                      )}

                      {notaItem.description && (
                        <p style={{ lineHeight: "1.6rem", margin: 0 }}>
                          {notaItem.description}
                        </p>
                      )}

                      {notaItem.links && notaItem.links.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                          }}
                        >
                          {notaItem.links.map((link, linkIndex) => (
                            <a
                              key={`${notaItem.id}-link-${linkIndex}`}
                              href={link.url}
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
                                textAlign: "center",
                                alignSelf: "flex-start",
                              }}
                            >
                              VER NOTA
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
