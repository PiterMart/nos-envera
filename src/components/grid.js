"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { TransitionLink } from "./TransitionLink";

const gridStyles = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(140px, 100%), 1fr))",
  gap: "2rem",
  justifyItems: "center",
  alignItems: "start",
};

const gridStylesTight = {
  ...gridStyles,
  gap: "0.5rem",
  alignItems: "stretch",
};

const linkStyles = {
  width: "100%",
  maxWidth: "300px",
  textDecoration: "none",
  color: "inherit",
};

const articleStyles = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  textAlign: "left",
};

const articleStylesTight = {
  ...articleStyles,
  gap: "0.35rem",
};

const imageWrapperStyles = {
  width: "100%",
  overflow: "hidden",
  borderRadius: "10px",
  backgroundColor: "#f0f0f0",
  lineHeight: 0,
  position: "relative",
  aspectRatio: "3/4",
};

const imageWrapperStylesTight = {
  ...imageWrapperStyles,
  flexShrink: 0,
};

const imagePlaceholderStyles = {
  width: "100%",
  aspectRatio: "3/4",
  borderRadius: "10px",
  backgroundColor: "#e8e8e8",
  flexShrink: 0,
};


const yearHeadingBase = {
  fontFamily: "var(--font-family-base)",
  margin: 0,
  marginBottom: "0.5rem",
  fontSize: "3.75rem",
  fontWeight: 600,
  letterSpacing: "0.5px",
  textAlign: "left",
  width: "100%",
  paddingBottom: "0.25rem",
  borderBottom: "2px solid black",
};

const YEAR_PLACEHOLDER = "\u2014";
const CARD_DOT = "\u2022";

function groupByYear(cards) {
  const byYear = {};
  for (const card of cards) {
    const y = card.year ?? YEAR_PLACEHOLDER;
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(card);
  }
  const keys = Object.keys(byYear).sort((a, b) => {
    if (a === YEAR_PLACEHOLDER && b !== YEAR_PLACEHOLDER) return 1;
    if (a !== YEAR_PLACEHOLDER && b === YEAR_PLACEHOLDER) return -1;
    return String(b).localeCompare(String(a));
  });
  return keys.map((year) => [year, byYear[year]]);
}

const archivoLinkStyles = {
  ...linkStyles,
  maxWidth: "none",
  display: "block",
  width: "100%",
};

const archivoArticleStyles = {
  ...articleStyles,
  width: "100%",
  gap: 0,
  minHeight: "2.5rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  borderBottom: "1px solid black",
  paddingBottom: "0.35rem",
};

const CURSOR_IMAGE_WIDTH = 280;
const CURSOR_IMAGE_HEIGHT = 360;

export default function Grid({ cards, hideImages = false, tight = false, basePath = "/agenda" }) {
  const groups = groupByYear(cards);
  const [cursorImageUrl, setCursorImageUrl] = useState(null);
  const cursorRef = useRef(null);
  const rafRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });

  const dynamicGridStyles = {
    ...(hideImages ? gridStyles : tight ? gridStylesTight : gridStyles),
    gap: hideImages ? "0" : tight ? gridStylesTight.gap : gridStyles.gap,
    ...(hideImages ? { gridTemplateColumns: "1fr", justifyItems: "stretch", alignItems: "stretch" } : {}),
  };

  // Preload all card images so hover swap is instant
  useEffect(() => {
    if (!hideImages || !cards?.length) return;
    const urls = [...new Set(cards.map((c) => c.imageUrl).filter(Boolean))];
    urls.forEach((url) => {
      const img = new window.Image();
      img.src = url;
    });
  }, [hideImages, cards]);

  // Update cursor position via ref (no re-renders) for instant follow
  useEffect(() => {
    if (!hideImages) return;
    const onMove = (e) => {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(() => {
          if (cursorRef.current) {
            cursorRef.current.style.left = `${posRef.current.x}px`;
            cursorRef.current.style.top = `${posRef.current.y}px`;
          }
          rafRef.current = null;
        });
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [hideImages]);

  const showCursorImage = useCallback((url) => setCursorImageUrl(url || null), []);
  const hideCursorImage = useCallback(() => setCursorImageUrl(null), []);

  return (
    <>
      {hideImages && (
        <div
          ref={cursorRef}
          role="presentation"
          aria-hidden
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: CURSOR_IMAGE_WIDTH,
            height: CURSOR_IMAGE_HEIGHT,
            pointerEvents: "none",
            zIndex: 9999,
            opacity: cursorImageUrl ? 1 : 0,
            visibility: cursorImageUrl ? "visible" : "hidden",
            transition: "opacity 0.12s ease-out",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          }}
        >
          {cursorImageUrl && (
            <Image
              key={cursorImageUrl}
              src={cursorImageUrl}
              alt=""
              fill
              sizes={`${CURSOR_IMAGE_WIDTH}px`}
              style={{ objectFit: "cover" }}
              draggable={false}
              unoptimized
            />
          )}
        </div>
      )}
      <section style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
        {groups.map(([year, groupCards], idx) => (
          <div key={year} style={{ width: "100%" }}>
            <h2 style={{ ...yearHeadingBase, marginTop: idx === 0 ? 0 : "1.5rem" }}>{year}</h2>
            <div style={dynamicGridStyles}>
              {groupCards.map((card) => (
                <TransitionLink
                  href={`${basePath}/${card.slug}`}
                  key={card.id}
                  style={hideImages ? archivoLinkStyles : linkStyles}
                  onMouseEnter={hideImages && card.imageUrl ? () => showCursorImage(card.imageUrl) : undefined}
                  onMouseLeave={hideImages ? hideCursorImage : undefined}
                >
                  <article style={hideImages ? archivoArticleStyles : tight ? articleStylesTight : articleStyles}>
                    {!hideImages && card.imageUrl ? (
                      <div style={tight ? imageWrapperStylesTight : imageWrapperStyles}>
                        <Image
                          src={card.imageUrl}
                          alt={card.title}
                          fill
                          sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 300px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ) : !hideImages && tight ? (
                      <div style={imagePlaceholderStyles} aria-hidden />
                    ) : null}
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 400, letterSpacing: "0.5px", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ color: "black", fontSize: "0.6em", lineHeight: 1 }}>{CARD_DOT}</span>
                      {card.title}
                    </h3>
                  </article>
                </TransitionLink>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
