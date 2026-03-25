"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import styles from "../../styles/page.module.css";
import { TransitionLink } from "../../components/TransitionLink";

const BREAKPOINT_SM = 480;
const BREAKPOINT_MD = 768;

// Seeded RNG for deterministic shuffle
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledIndices(n, seed = 12345) {
  const rng = mulberry32(seed);
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ComunidadClient({ memberNames }) {
  const [memberLayouts, setMemberLayouts] = useState({});
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isOrdered, setIsOrdered] = useState(true);
  const [listFade, setListFade] = useState(1);
  const [justDragged, setJustDragged] = useState(false);
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const containerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, id: null });
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!memberNames.length || isOrdered) {
      setMemberLayouts({});
      return;
    }

    const n = memberNames.length;
    const isMobile = width < BREAKPOINT_SM;
    const isTablet = width >= BREAKPOINT_SM && width < BREAKPOINT_MD;

    let cols;
    if (isMobile) cols = 2;
    else if (isTablet) cols = 3;
    else cols = Math.max(1, Math.ceil(Math.sqrt(n * 1.2)));

    const rows = Math.ceil(n / cols);
    const cellW = isMobile ? 96 / cols : 90 / cols;
    const cellH = 85 / rows;
    const padLeft = isMobile ? 2 : 5;
    const padTop = 7;

    const layoutRng = mulberry32(45678);
    const cellIndices = shuffledIndices(n);

    const inset = 0.02 * cellW;
    const layouts = memberNames.reduce((acc, { id }, index) => {
      const cellIndex = cellIndices[index];
      const col = cellIndex % cols;
      const row = Math.floor(cellIndex / cols);
      const jitterW = (layoutRng() - 0.5) * cellW * (isMobile ? 0.1 : 0.5);
      const jitterH = (layoutRng() - 0.5) * cellH * (isMobile ? 0.1 : 0.5);
      const left = padLeft + col * cellW + inset + jitterW;
      const top = padTop + (row + 0.5) * cellH + jitterH;

      acc[id] = {
        top: `${Math.max(2, Math.min(96, top))}%`,
        left: `${Math.max(2, Math.min(96, left))}%`,
        rotation: layoutRng() * 40 - 20,
        scale: 0.9 + layoutRng() * 0.4,
      };
      return acc;
    }, {});

    setMemberLayouts(layouts);
  }, [memberNames, isOrdered, width]);

  const scatterLayout = useMemo(() => {
    const n = memberNames.length;
    if (!n || isOrdered) return { minHeightVh: 70 };
    const isM = width < BREAKPOINT_SM;
    const isT = width >= BREAKPOINT_SM && width < BREAKPOINT_MD;
    const cols = isM ? 2 : isT ? 3 : Math.max(1, Math.ceil(Math.sqrt(n * 1.2)));
    const rows = Math.ceil(n / cols);
    const minHeightVh = isM && rows > 6 ? Math.min(110, 70 + (rows - 6) * 4) : 70;
    return { minHeightVh };
  }, [memberNames.length, isOrdered, width]);

  const startDrag = (clientX, clientY, id) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const layout = memberLayouts[id];
    if (!layout) return;

    dragStartRef.current = { x: clientX, y: clientY, id };
    hasDraggedRef.current = false;

    const x = ((clientX - containerRect.left) / containerRect.width) * 100;
    const y = ((clientY - containerRect.top) / containerRect.height) * 100;

    setDragOffset({ x: x - parseFloat(layout.left), y: y - parseFloat(layout.top) });
    setDragging(id);
  };

  useEffect(() => {
    if (!dragging || !containerRef.current) return;

    const updatePosition = (clientX, clientY) => {
      const dx = Math.abs(clientX - dragStartRef.current.x);
      const dy = Math.abs(clientY - dragStartRef.current.y);
      if (dx > 5 || dy > 5) hasDraggedRef.current = true;

      const containerRect = containerRef.current.getBoundingClientRect();
      const x = ((clientX - containerRect.left) / containerRect.width) * 100;
      const y = ((clientY - containerRect.top) / containerRect.height) * 100;

      setMemberLayouts((prev) => ({
        ...prev,
        [dragging]: {
          ...prev[dragging],
          left: `${Math.max(0, Math.min(100, x - dragOffset.x))}%`,
          top: `${Math.max(0, Math.min(100, y - dragOffset.y))}%`,
        },
      }));
    };

    const handleMouseMove = (e) => updatePosition(e.clientX, e.clientY);
    const handleMouseUp = () => {
      const wasDragging = hasDraggedRef.current;
      setDragging(null);
      if (wasDragging) {
        setJustDragged(true);
        setTimeout(() => setJustDragged(false), 300);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, dragOffset]);

  const groups = useMemo(() => {
    return Object.entries(
      memberNames.reduce((acc, member) => {
        const letter = (member.name?.[0] || "#").toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(member);
        return acc;
      }, {})
    ).sort(([a], [b]) => a.localeCompare(b));
  }, [memberNames]);

  return (
    <div style={{ opacity: listFade, transition: "opacity 0.25s ease" }}>
      {isOrdered ? (
        <div style={{ columnCount: width < BREAKPOINT_SM ? 2 : 4, columnGap: "2rem", width: "100%", textAlign: "left" }}>
          {groups.map(([letter, members]) => (
            <div key={letter} style={{ breakInside: "avoid", marginBottom: "1rem" }}>
              <div style={{
                fontFamily: "var(--font-family-base)",
                fontSize: "3.75rem",
                fontWeight: 600,
                borderBottom: "2px solid black",
                marginBottom: "0.5rem",
              }}>
                {letter}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {members.map(({ id, name, slug, team }) => {
                  const basePath = team === true ? "/somos" : "/comunidad";
                  const href = slug ? `${basePath}/${slug}` : `${basePath}/${id}`;
                  return (
                    <li key={id}>
                      <TransitionLink
                        href={href}
                        className={styles.memberLink}
                        style={{
                          fontSize: width < BREAKPOINT_SM ? "1rem" : "1.2rem",
                          fontWeight: 700,
                          fontFamily: "var(--font-paragraph)",
                          fontStyle: "italic",
                          textDecoration: "none",
                          color: "#000",
                          display: "block",
                        }}
                      >
                        {name}
                      </TransitionLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul
          ref={containerRef}
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            width: "100%",
            position: "relative",
            minHeight: `${scatterLayout.minHeightVh}vh`,
          }}
        >
          {memberNames.map(({ id, name, slug, team }) => {
            const layout = memberLayouts[id];
            const isDragging = dragging === id;
            const basePath = team === true ? "/somos" : "/comunidad";
            const href = slug ? `${basePath}/${slug}` : `${basePath}/${id}`;

            return (
              <li
                key={id}
                style={{
                  position: "absolute",
                  top: layout?.top ?? "50%",
                  left: layout?.left ?? "10%",
                  transform: `rotate(${layout?.rotation ?? 0}deg) scale(${layout?.scale ?? 1})`,
                  zIndex: isDragging ? 10 : 1,
                  userSelect: "none",
                }}
              >
                <TransitionLink
                  href={href}
                  className={styles.memberLink}
                  onMouseDown={(e) => startDrag(e.clientX, e.clientY, id)}
                  onClick={(e) => {
                    if (hasDraggedRef.current || justDragged) e.preventDefault();
                  }}
                  style={{
                    fontSize: width < BREAKPOINT_SM ? "1rem" : "1.2rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-paragraph)",
                    fontStyle: "italic",
                    textDecoration: "none",
                    color: "#000",
                    cursor: "move",
                  }}
                >
                  {name}
                </TransitionLink>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
