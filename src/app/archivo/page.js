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
    if (activeFilter === "all") {
      return events;
    }

    return events.filter((event) => {
      if (activeFilter === "perfos") {
        return eventContainsPerformance(event.eventTypes);
      }
      if (activeFilter === "formacion") {
        return eventContainsTraining(event.eventTypes);
      }
      if (activeFilter === "residencias") {
        return eventContainsResidency(event.eventTypes);
      }
      return true;
    });
  }, [events, activeFilter]);

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
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    const items = itemRefs.current;
    let closestIndex = 0;
    let closestDist = Infinity;
    items.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const elCenter = rect.left + rect.width / 2;
      const dist = Math.abs(elCenter - containerCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    });
    const value = FILTER_OPTIONS[closestIndex]?.value;
    if (value != null) setActiveFilter(value);
    const centeredEl = itemRefs.current[closestIndex];
    if (centeredEl) {
      const w = centeredEl.getBoundingClientRect().width;
      setCenteredItemWidth(w);
    }
  }, []);

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
    if (!isDesktop) return;
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
              subtext="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.."
              loaded={!loading}
            />

            <div className={styles.agendaFilterSliderWrap}>
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
                  ...(isDesktop ? { left: frameLeft, transform: "none" } : {}),
                }}
                aria-hidden
              />
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>Cargando eventos...</div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#c00" }}>{error}</div>
            ) : cards.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                <p>
                  {activeFilter === "all"
                    ? "No hay eventos registrados todavía."
                    : activeFilter === "perfos"
                    ? "No hay perfos registradas todavía."
                    : activeFilter === "formacion"
                    ? "No hay formaciones registradas todavía."
                    : "No hay residencias registradas todavía."}
                </p>
              </div>
            ) : (
              <Grid key={activeFilter} cards={cards} hideImages={true} basePath="/archivo" loaded={!loading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
