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
                style={{
                  borderBottom: "1px solid #e0e0e0",
                  padding: "0.5rem 0",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleExpanded(notaItem.id)}
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
                      visibleSubtitles.has(`subtitle-${notaItem.id}`)
                        ? styles.sectionSubtitleVisible
                        : ""
                    }`}
                    data-subtitle-id={`subtitle-${notaItem.id}`}
                    style={{
                      display: "block",
                      fontSize: "1.2rem",
                      lineHeight: "1.4rem",
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
                    {notaItem.subtitle && (
                      <p style={{ fontWeight: "500" }}>{notaItem.subtitle}</p>
                    )}

                    {notaItem.coverImage && (
                      <div
                        style={{
                          marginTop: "0.25rem",
                          marginBottom: "0.5rem",
                          maxWidth: "100%",
                        }}
                      >
                        <img
                          src={notaItem.coverImage}
                          alt={notaItem.title}
                          style={{
                            width: "100%",
                            maxHeight: "280px",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </div>
                    )}

                    {notaItem.date && (
                      <p style={{ color: "#666" }}>
                        {formatNotaDate(notaItem.date)}
                      </p>
                    )}

                    {notaItem.description && (
                      <p style={{ lineHeight: "1.6rem", marginBottom: "0.5rem" }}>
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
  );
}
