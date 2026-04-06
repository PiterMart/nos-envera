"use client";
import React, { useState, useEffect } from "react";
import styles from "../styles/page.module.css";
import { TransitionLink } from "./TransitionLink";
import { motion, AnimatePresence } from "framer-motion";

export default function HomepageAgendaSlider({ events }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!events || events.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, 6000); // 6 seconds per event

    return () => clearInterval(intervalId);
  }, [events]);

  if (!events || events.length === 0) return null;

  const currentEvent = events[currentIndex];

  return (
    <div className={styles.agendaSliderContainer}>
      {events.length > 1 && (
        <div className={styles.agendaSliderDots}>
          {events.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: idx === currentIndex ? "black" : "#ccc",
                transition: "background-color 0.3s ease"
              }}
            />
          ))}
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEvent.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              width: "100%",
              textAlign: "left",
              alignItems: "flex-start",
              border: "1px solid black",
              padding: "1.5rem",
              backgroundColor: "white",
            }}
          >
            <TransitionLink
              href={`/evento/${currentEvent.slug}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                width: "100%",
              }}
            >
              <h3
                style={{
                  fontWeight: 600,
                  letterSpacing: "1px",
                  marginBottom: 0,
                  fontFamily: "var(--font-family-base)",
                  fontSize: "2rem",
                }}
              >
                {currentEvent.title}
              </h3>
              {currentEvent.dateString && (
                <p
                  style={{
                    fontFamily: "var(--font-family-base)",
                    fontSize: "1.1rem",
                    color: "#555",
                    margin: 0,
                  }}
                >
                  {currentEvent.dateString}
                </p>
              )}
              {(currentEvent.type || currentEvent.directors) && (
                <p
                  style={{
                    fontFamily: "var(--font-family-base)",
                    fontSize: "0.95rem",
                    color: "#555",
                    margin: 0,
                    fontStyle: "italic",
                    marginTop: "-0.5rem"
                  }}
                >
                  {[
                    currentEvent.type?.length > 0 ? currentEvent.type.join(", ") : null,
                    currentEvent.directors?.length > 0 ? `Dir: ${currentEvent.directors.map(dir => dir.name).join(", ")}` : null
                  ].filter(Boolean).join(" | ")}
                </p>
              )}
            </TransitionLink>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
