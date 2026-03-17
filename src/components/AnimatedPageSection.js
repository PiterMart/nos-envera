"use client";

import React from "react";
import AnimatedPageHeader from "./AnimatedPageHeader";
import styles from "../styles/page.module.css";

const subtextTransition = "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Page section with animated title, underline, and optional subtext.
 * Title and underline animate on load; subtext fades in from top with a slight delay.
 *
 * @param {string} title - The page title (e.g. "PERFOS", "ARCHIVO")
 * @param {string} [subtext] - Optional paragraph below the title
 * @param {boolean} loaded - When true, animations run. Tie to your page's loading state.
 */
export default function AnimatedPageSection({ title, subtext, loaded = false }) {
  return (
    <>
      <AnimatedPageHeader loaded={loaded}>{title}</AnimatedPageHeader>
      {subtext != null && subtext !== "" && (
        <p
          className={styles.pageSubtext}
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(-0.5em)",
            transition: subtextTransition,
            transitionDelay: loaded ? "0.3s" : "0s",
          }}
        >
          {subtext}
        </p>
      )}
    </>
  );
}
