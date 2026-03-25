"use client";
import styles from "../../styles/page.module.css";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { firestore } from "../firebase/firebaseConfig";
import Grid from "../../components/grid";
import AnimatedPageSection from "../../components/AnimatedPageSection";
import { collection, getDocs } from "firebase/firestore";

import {
  FALLBACK_IMAGE,
  normalizeEventTypes,
  eventContainsPerformance,
  eventContainsTraining,
  eventContainsResidency,
  parseDateEntry,
  extractYear,
} from "../../lib/eventUtils";

const FILTER_OPTIONS = [
  { value: "all", label: "TODOS" },
  { value: "perfos", label: "PERFOS" },
  { value: "formacion", label: "FORMACIÓN" },
  { value: "residencias", label: "RESIDENCIAS" },
];


export default function Archivo() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [centeredItemWidth, setCenteredItemWidth] = useState(null);
  const [frameLeft, setFrameLeft] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const sliderRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const snapshot = await getDocs(collection(firestore, "events"));
        const documents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const processed = documents
          .map((eventDoc) => {
            const eventTypes = normalizeEventTypes(eventDoc.event_type || eventDoc.eventType || eventDoc.type);

            const dates = Array.isArray(eventDoc.dates)
              ? eventDoc.dates.map(parseDateEntry).filter(Boolean)
              : [];

            const imageUrl = eventDoc.banner || eventDoc.flyer || eventDoc.gallery?.[0]?.url || FALLBACK_IMAGE;
            const slug = eventDoc.slug || eventDoc.id;
            const title = eventDoc.name || eventDoc.title || "Evento";
            const year = extractYear(dates) ?? "—";

            return {
              id: eventDoc.id,
              title,
              slug,
              imageUrl,
              year,
              eventTypes,
            };
          })
          .filter(Boolean);

        setEvents(processed);
      } catch (fetchError) {
        console.error("Error fetching events:", fetchError);
        setError("No pudimos cargar los eventos en este momento.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      let matchesType = true;
      if (activeFilter === "perfos") {
        matchesType = eventContainsPerformance(event.eventTypes);
      } else if (activeFilter === "formacion") {
        matchesType = eventContainsTraining(event.eventTypes);
      } else if (activeFilter === "residencias") {
        matchesType = eventContainsResidency(event.eventTypes);
      }

      if (!matchesType) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        if (!(event.title || "").toLowerCase().includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [events, activeFilter, searchQuery]);

  const cards = useMemo(() => {
    return filteredEvents
      .map((event) => ({
        id: event.id,
        title: event.title,
        slug: event.slug,
        imageUrl: event.imageUrl,
        year: event.year,
      }))
      .sort((a, b) => {
        if (a.year === "—" && b.year !== "—") return 1;
        if (a.year !== "—" && b.year === "—") return -1;
        return String(b.year).localeCompare(String(a.year));
      });
  }, [filteredEvents]);

  const updateActiveFromScroll = useCallback(() => {
    const container = sliderRef.current;
    if (!container) return;
    const wrap = container.parentElement;
    if (!wrap) return;

    // Desktop: filter comes from clicks only. Geometry-based "closest to center" would
    // override the first tab whenever another tab sits nearer the viewport center.
    if (isDesktop) {
      return;
    }

    const items = itemRefs.current;
    let closestIndex = 0;

    const pickClosestToCenter = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      let best = 0;
      let closestDist = Infinity;
      items.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.left + rect.width / 2;
        const dist = Math.abs(elCenter - containerCenter);
        if (dist < closestDist) {
          closestDist = dist;
          best = i;
        }
      });
      return best;
    };

    const hasOverflow = container.scrollWidth > container.clientWidth + 2;
    if (!hasOverflow) {
      return;
    }

    const maxScroll = container.scrollWidth - container.clientWidth;
    // Tight thresholds so "second" tab isn't snapped back to first while still near scroll start
    const atStart = container.scrollLeft < 1;
    const atEnd = maxScroll > 0 && container.scrollLeft > maxScroll - 1;

    if (atStart) {
      closestIndex = 0;
    } else if (atEnd) {
      closestIndex = FILTER_OPTIONS.length - 1;
    } else {
      closestIndex = pickClosestToCenter();
    }

    const value = FILTER_OPTIONS[closestIndex]?.value;
    if (value != null) setActiveFilter(value);
    const centeredEl = itemRefs.current[closestIndex];
    if (centeredEl) {
      const elRect = centeredEl.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      setCenteredItemWidth(elRect.width);
      setFrameLeft(elRect.left - wrapRect.left);
    }
  }, [isDesktop]);

  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;
    let raf = null;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        updateActiveFromScroll();
        raf = null;
      });
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [updateActiveFromScroll]);

  const scrollToIndex = useCallback((index) => {
    const el = itemRefs.current[index];
    if (el) el.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, []);

  useEffect(() => {
    const idx = FILTER_OPTIONS.findIndex((o) => o.value === activeFilter);
    if (idx >= 0 && sliderRef.current) {
      const el = itemRefs.current[idx];
      if (el) el.scrollIntoView({ inline: "center", block: "nearest" });
    }
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      updateActiveFromScroll();
    });
    return () => cancelAnimationFrame(raf);
  }, [updateActiveFromScroll]);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 769);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const idx = FILTER_OPTIONS.findIndex((o) => o.value === activeFilter);
    const el = itemRefs.current[idx];
    const wrap = sliderRef.current?.parentElement;
    if (el && wrap) {
      const wrapRect = wrap.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setFrameLeft(elRect.left - wrapRect.left);
      setCenteredItemWidth(elRect.width);
    }
  }, [activeFilter, isDesktop]);

  const handleFilterClick = useCallback((index) => {
    if (isDesktop) {
      setActiveFilter(FILTER_OPTIONS[index].value);
    } else {
      scrollToIndex(index);
    }
  }, [isDesktop, scrollToIndex]);

  return (
    <div className={styles.page}>
      <div className={styles.page_container}>
        <div className={styles.homepage_container} style={{ paddingTop: "2rem" }}>
          <div className={styles.contentMaxWidth} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <AnimatedPageSection
              title="ARCHIVO"
              subtext="Este es un archivo en constante construcción y crecimiento. Guarda registro de cada obra, proceso y actividad que tuvo lugar en nuestro espacio desde su inicio en 2023 hasta el presente.
El archivo permite volver sobre lo sucedido, leer continuidades, desvíos y transformaciones.
"
              loaded={!loading}
            />

            <div className={`${styles.agendaFilterSliderWrap} ${styles.agendaFilterAlignContent} ${styles.desktopFilterOnly}`}>
              <div
                ref={sliderRef}
                className={styles.agendaFilterSlider}
                role="tablist"
                aria-label="Filtrar agenda"
              >
                <div className={styles.agendaFilterTrack}>
                  {FILTER_OPTIONS.map((opt, index) => (
                    <div
                      key={opt.value}
                      ref={(el) => { itemRefs.current[index] = el; }}
                      className={styles.agendaFilterItem}
                      role="tab"
                      aria-selected={activeFilter === opt.value}
                    >
                      <button
                        type="button"
                        className={styles.navButton}
                        onClick={() => handleFilterClick(index)}
                      >
                        {opt.label}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className={styles.agendaFilterFrame}
                style={{
                  width: centeredItemWidth != null ? centeredItemWidth : undefined,
                  left: frameLeft,
                  transform: "none",
                }}
                aria-hidden
              />
            </div>

            <div className={`${styles.mobileFilterOnly} ${styles.agendaFilterAlignContent}`} style={{ width: "100%", marginBottom: "2rem" }}>
              <div 
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  border: "2px solid black",
                  borderRadius: "var(--border-radius)",
                  overflow: "hidden"
                }}
              >
                <button
                  type="button"
                  className={styles.navButton}
                  style={{ width: "100%", justifyContent: "space-between", display: "flex", alignItems: "center" }}
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                >
                  <span style={{ fontWeight: 600, textTransform: "uppercase" }}>
                    {FILTER_OPTIONS.find(o => o.value === activeFilter)?.label || "FILTRAR"}
                  </span>
                  <span>{mobileFilterOpen ? "▲" : "▼"}</span>
                </button>
                {mobileFilterOpen && (
                  <div style={{ display: "flex", flexDirection: "column", borderTop: "2px solid black" }}>
                    {FILTER_OPTIONS.map((opt) => (
                      <button
                        key={`mb-${opt.value}`}
                        type="button"
                        className={styles.navButton}
                        style={{ 
                          width: "100%", 
                          textAlign: "left", 
                          fontWeight: activeFilter === opt.value ? 600 : 400,
                          backgroundColor: activeFilter === opt.value ? "#f0f0f0" : "transparent"
                        }}
                        onClick={() => {
                          setActiveFilter(opt.value);
                          setMobileFilterOpen(false);
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "1rem", marginTop: "-1rem" }}>
              <input
                type="text"
                placeholder="Buscar en el archivo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 1rem",
                  fontSize: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "var(--border-radius)",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>Cargando eventos...</div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#c00" }}>{error}</div>
            ) : cards.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                <p>
                  {searchQuery.trim()
                    ? "No hay resultados para tu búsqueda."
                    : activeFilter === "all"
                    ? "No hay eventos registrados todavía."
                    : activeFilter === "perfos"
                    ? "No hay perfos registradas todavía."
                    : activeFilter === "formacion"
                    ? "No hay formaciones registradas todavía."
                    : "No hay residencias registradas todavía."}
                </p>
              </div>
            ) : (
              <Grid key={activeFilter} cards={cards} hideImages={true} basePath="/evento" loaded={!loading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
