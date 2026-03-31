"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "../../styles/page.module.css";
import Grid from "../../components/grid";
import {
  eventContainsPerformance,
  eventContainsTraining,
  eventContainsResidency,
  isPastEvent,
} from "../../lib/eventUtils";

const FILTER_OPTIONS = [
  { value: "all", label: "TODOS" },
  { value: "perfos", label: "PERFOS" },
  { value: "formacion", label: "FORMACIÓN" },
  { value: "residencias", label: "RESIDENCIAS" },
];

export default function ArchivoClient({ initialEvents }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [centeredItemWidth, setCenteredItemWidth] = useState(null);
  const [frameLeft, setFrameLeft] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const sliderRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 769);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      let matchesType = true;
      if (activeFilter === "perfos") matchesType = eventContainsPerformance(event.eventTypes);
      else if (activeFilter === "formacion") matchesType = eventContainsTraining(event.eventTypes);
      else if (activeFilter === "residencias") matchesType = eventContainsResidency(event.eventTypes);

      if (!matchesType) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        if (!(event.title || "").toLowerCase().includes(query)) return false;
      }

      // ONLY RENDER EVENTS THAT ALREADY PASSED (exclusive to Agenda)
      if (!isPastEvent(event.dates)) return false;

      return true;
    });
  }, [initialEvents, activeFilter, searchQuery]);

  const cards = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      if (a.year === "—" && b.year !== "—") return 1;
      if (a.year !== "—" && b.year === "—") return -1;
      return String(b.year).localeCompare(String(a.year));
    });
  }, [filteredEvents]);

  const updateActiveFromScroll = useCallback(() => {
    const container = sliderRef.current;
    if (!container || isDesktop) return;
    const items = itemRefs.current;
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

    setActiveFilter(FILTER_OPTIONS[best].value);
  }, [isDesktop]);

  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;
    const onScroll = () => requestAnimationFrame(updateActiveFromScroll);
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [updateActiveFromScroll]);

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

  return (
    <>
      <div className={`${styles.agendaFilterSliderWrap} ${styles.agendaFilterAlignContent} ${styles.desktopFilterOnly}`}>
        <div ref={sliderRef} className={styles.agendaFilterSlider} role="tablist">
          <div className={styles.agendaFilterTrack}>
            {FILTER_OPTIONS.map((opt, index) => (
              <div key={opt.value} ref={(el) => (itemRefs.current[index] = el)} className={styles.agendaFilterItem} role="tab" aria-selected={activeFilter === opt.value}>
                <button type="button" className={styles.navButton} onClick={() => setActiveFilter(opt.value)}>
                  {opt.label}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.agendaFilterFrame} style={{ width: centeredItemWidth ?? undefined, left: frameLeft, transform: "none" }} aria-hidden />
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", width: "100%", alignItems: "flex-start" }}>
        <div className={`${styles.mobileFilterOnly} ${styles.agendaFilterAlignContent}`} style={{ flex: "0 0 calc(50% - 0.5rem)" }}>
          <div style={{ display: "flex", flexDirection: "column", border: "2px solid black", borderRadius: "var(--border-radius)", overflow: "hidden" }}>
            <button type="button" className={styles.navButton} style={{ width: "100%", justifyContent: "space-between", display: "flex", alignItems: "center" }} onClick={() => setMobileFilterOpen(!mobileFilterOpen)}>
              <span style={{ fontWeight: 600, textTransform: "uppercase" }}>{FILTER_OPTIONS.find((o) => o.value === activeFilter)?.label || "FILTRAR"}</span>
              <span>{mobileFilterOpen ? "▲" : "▼"}</span>
            </button>
            {mobileFilterOpen && (
              <div style={{ display: "flex", flexDirection: "column", borderTop: "2px solid black" }}>
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={`mb-${opt.value}`}
                    type="button"
                    className={styles.navButton}
                    style={{ width: "100%", textAlign: "left", fontWeight: activeFilter === opt.value ? 600 : 400, backgroundColor: activeFilter === opt.value ? "#f0f0f0" : "transparent" }}
                    onClick={() => { setActiveFilter(opt.value); setMobileFilterOpen(false); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, marginTop: isDesktop ? "-1rem" : "0" }}>
          <input
            type="text"
            placeholder="Buscar en el archivo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", height: "42px", padding: "0.5rem 1rem", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "var(--border-radius)", boxSizing: "border-box" }}
          />
        </div>
      </div>

      {cards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
          <p>{searchQuery.trim() ? "No hay resultados para tu búsqueda." : "No hay eventos registrados todavía."}</p>
        </div>
      ) : (
        <Grid key={activeFilter} cards={cards} hideImages={true} basePath="/evento" loaded={true} />
      )}
    </>
  );
}
