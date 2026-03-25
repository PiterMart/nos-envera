"use client";

import styles from "../styles/page.module.css";
import React, { useMemo } from "react";
import Grid from "./grid";
import AnimatedPageSection from "./AnimatedPageSection";
import { sortByYearDesc } from "../lib/eventUtils";

export default function EventTypePageClient({
  title,
  subtext,
  initialEvents = [],
  emptyStateText,
  basePath = "/evento"
}) {
  const cards = useMemo(() => {
    return [...initialEvents].sort(sortByYearDesc);
  }, [initialEvents]);

  return (
    <div className={styles.page}>
      <div className={styles.page_container}>
        <div className={styles.homepage_container} style={{ paddingTop: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", margin: "auto" }}>
            <AnimatedPageSection
              title={title.toUpperCase()}
              subtext={subtext}
              loaded={true}
            />

            {cards.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                <p>{emptyStateText}</p>
              </div>
            ) : (
              <Grid cards={cards} tight hoverOverlay basePath={basePath} yearHeadingClassName={styles.pageHeader} loaded={true} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
