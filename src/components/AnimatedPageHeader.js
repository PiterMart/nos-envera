"use client";

import React from "react";
import styles from "../styles/page.module.css";
import AnimatedUnderline from "./AnimatedUnderline";
import { formatSyllabicTitle } from "../lib/titleUtils";

const sharedTransition = "0.6s cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Page header with an underline that animates left-to-right on load.
 * The underline growth is tied to the `loaded` prop so it acts as a loading bar:
 * when content finishes loading, pass loaded={true} to trigger the animation.
 *
 * @param {string} children - The title text (e.g. "PERFOS")
 * @param {boolean} loaded - When true, the underline animates to full width. Tie to your page's loading state.
 * @param {string} [className] - Optional extra class (e.g. styles.pageHeader)
 */
export default function AnimatedPageHeader({ children, loaded = false, className = "" }) {
  const headerClass = [styles.pageHeader, styles.animatedPageHeader, className]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClass}>
      <h1
        style={{
          opacity: loaded ? 1 : 0,
          transition: `opacity ${sharedTransition}`,
        }}
      >
        {formatSyllabicTitle(children)}
      </h1>
      <AnimatedUnderline loaded={loaded} className={styles.animatedUnderline} />
    </header>
  );
}
