"use client";

import React from "react";

const UNDERLINE_TRANSITION = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Reusable underline that animates left-to-right (scaleX) when loaded.
 * Use in page headers and year headings.
 *
 * @param {boolean} loaded - When true, the line animates to full width.
 * @param {string} [className] - Optional class (e.g. for page header positioning).
 * @param {object} [style] - Optional style overrides (e.g. flex, borderTop for year heading).
 * @param {string} [transitionDelay] - Optional delay (e.g. "0.15s" for staggered year headings).
 */
export default function AnimatedUnderline({ loaded = false, className = "", style = {}, transitionDelay }) {
  return (
    <div
      className={className}
      style={{
        transformOrigin: "left",
        transform: loaded ? "scaleX(1)" : "scaleX(0)",
        transition: UNDERLINE_TRANSITION,
        ...(transitionDelay && { transitionDelay }),
        ...style,
      }}
      aria-hidden
    />
  );
}
