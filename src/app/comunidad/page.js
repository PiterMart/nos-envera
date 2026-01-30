"use client";
import styles from "../../styles/page.module.css";
import detailStyles from "../../styles/equipoDetail.module.css";
import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

const BREAKPOINT_SM = 480;
const BREAKPOINT_MD = 768;

// Seeded RNG for deterministic shuffle (same order on resize)
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

export default function Comunidad() {
  const [memberNames, setMemberNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberLayouts, setMemberLayouts] = useState({});
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isOrdered, setIsOrdered] = useState(false);
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

  // Initialize layouts when memberNames, width, or isOrdered change
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

    const jitterFactor = isMobile ? 0.1 : isTablet ? 0.25 : 0.5;
    const rotationRange = isMobile ? 8 : isTablet ? 16 : 20;
    const scaleMin = isMobile ? 0.88 : 0.9;
    const scaleRange = isMobile ? 0.12 : 0.4;

    const layoutRng = mulberry32(45678);
    const cellIndices = shuffledIndices(n);

    const inset = 0.02 * cellW;
    const layouts = memberNames.reduce((acc, { id }, index) => {
      const cellIndex = cellIndices[index];
      const col = cellIndex % cols;
      const row = Math.floor(cellIndex / cols);
      const jitterW = (layoutRng() - 0.5) * cellW * jitterFactor;
      const jitterH = (layoutRng() - 0.5) * cellH * jitterFactor;
      const left = padLeft + col * cellW + inset + jitterW;
      const top = padTop + (row + 0.5) * cellH + jitterH;
      const randomRotation = layoutRng() * 2 * rotationRange - rotationRange;
      const randomScale = scaleMin + layoutRng() * scaleRange;

      acc[id] = {
        top: `${Math.max(2, Math.min(96, top))}%`,
        left: `${Math.max(2, Math.min(96, left))}%`,
        rotation: randomRotation,
        scale: randomScale,
      };
      return acc;
    }, {});

    setMemberLayouts(layouts);
  }, [memberNames, isOrdered, width]);

  useEffect(() => {
    const fetchMemberNames = async () => {
      try {
        const membersQuery = query(
          collection(firestore, "members"),
          orderBy("name", "asc")
        );
        const snapshot = await getDocs(membersQuery);
        // Include all members (both team and comunidad) and include slug
        const names = snapshot.docs
          .map((docSnapshot) => {
            const data = docSnapshot.data();
            return {
              id: docSnapshot.id,
              name: data?.name ?? docSnapshot.id,
              slug: data?.slug,
              team: data?.team,
            };
          })
          .filter((member) => member.name); // Only exclude members without names
        setMemberNames(names);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("No se pudieron cargar los nombres de la comunidad.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberNames();
  }, []);

  // Handle mouse and touch move for dragging
  useEffect(() => {
    if (!dragging || !containerRef.current) return;

    const updatePosition = (clientX, clientY) => {
      // Check if we've moved significantly (more than 5px) to consider it a drag
      const dx = Math.abs(clientX - dragStartRef.current.x);
      const dy = Math.abs(clientY - dragStartRef.current.y);
      if (dx > 5 || dy > 5) {
        hasDraggedRef.current = true;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const x = ((clientX - containerRect.left) / containerRect.width) * 100;
      const y = ((clientY - containerRect.top) / containerRect.height) * 100;

      setMemberLayouts((prev) => {
        if (!prev[dragging]) return prev;
        
        return {
          ...prev,
          [dragging]: {
            ...prev[dragging],
            left: `${Math.max(0, Math.min(100, x - dragOffset.x))}%`,
            top: `${Math.max(0, Math.min(100, y - dragOffset.y))}%`,
          },
        };
      });
    };

    const handleMouseMove = (e) => {
      e.preventDefault();
      updatePosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePosition(touch.clientX, touch.clientY);
      }
    };

    const handleMouseUp = () => {
      const wasDragging = hasDraggedRef.current;
      setDragging(null);
      setDragOffset({ x: 0, y: 0 });
      
      if (wasDragging) {
        setJustDragged(true);
        // Reset after a delay to allow click handler to check
        setTimeout(() => {
          setJustDragged(false);
          hasDraggedRef.current = false;
          dragStartRef.current = { x: 0, y: 0, id: null };
        }, 300);
      } else {
        // Reset after a delay to allow click handler to check
        setTimeout(() => {
          hasDraggedRef.current = false;
          dragStartRef.current = { x: 0, y: 0, id: null };
        }, 50);
      }
    };

    const handleTouchEnd = () => {
      const wasDragging = hasDraggedRef.current;
      setDragging(null);
      setDragOffset({ x: 0, y: 0 });
      
      if (wasDragging) {
        setJustDragged(true);
        // Reset after a delay to allow click handler to check
        setTimeout(() => {
          setJustDragged(false);
          hasDraggedRef.current = false;
          dragStartRef.current = { x: 0, y: 0, id: null };
        }, 300);
      } else {
        // Reset after a delay to allow click handler to check
        setTimeout(() => {
          hasDraggedRef.current = false;
          dragStartRef.current = { x: 0, y: 0, id: null };
        }, 50);
      }
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: false });
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [dragging, dragOffset]);

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

  const startDrag = (clientX, clientY, id, e) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const layout = memberLayouts[id];
    if (!layout) return;

    // Store initial position for drag detection in ref
    dragStartRef.current = { x: clientX, y: clientY, id };
    hasDraggedRef.current = false;

    // Get current position in container coordinates (percentage)
    const x = ((clientX - containerRect.left) / containerRect.width) * 100;
    const y = ((clientY - containerRect.top) / containerRect.height) * 100;
    
    // Get element's current position
    const elementX = parseFloat(layout.left) || 0;
    const elementY = parseFloat(layout.top) || 0;
    
    // Calculate offset from touch/click point to element position
    const offsetX = x - elementX;
    const offsetY = y - elementY;

    setDragOffset({ x: offsetX, y: offsetY });
    setDragging(id);
  };

  return (
    <div
      className={styles.page}
      style={{ position: "relative", minHeight: "100vh", zIndex: 1 }}
    >
      {/* <img
        src="/NV-isologo.png"
        alt="Nos en Vera Isologo"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "40vw",
          width: "320px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      /> */}
      <div className={styles.page_container} style={{ position: "relative", zIndex: 2, maxWidth: "1200px", margin: "0 auto" }}>
        <header className={styles.pageHeader}>
          <h1>COMUNIDAD</h1>
        </header>
        <div
          className={styles.homepage_container}
          style={{ paddingTop: "2rem" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              width: "100%",
              margin: 0,
              padding: width < BREAKPOINT_SM ? "0 0.75rem" : "0 1.5rem",
            }}
          >
            {isLoading && (
              <p style={{ textAlign: "center", color: "#666" }}>Cargando…</p>
            )}

            {error && (
              <p style={{ textAlign: "center", color: "#c00" }}>{error}</p>
            )}

            {!isLoading && !error && (
              <>
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setIsOrdered(!isOrdered)}
                    className={styles.ordenarButtonBreathing}
                    style={{
                      background: "none",
                      border: "2px solid black",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      font: "inherit",
                      padding: "0.5rem 1rem",
                      margin: 0,
                      fontWeight: 700,
                      fontSize: "1.5rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {isOrdered ? "Desordenar" : "Ordenar"}
                  </button>
                </div>
                {isOrdered ? (
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      width: "100%",
                      display: "grid",
                      gridTemplateColumns:
                        width < BREAKPOINT_SM
                          ? "repeat(2, 1fr)"
                          : "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: "0.5rem 1rem",
                      textAlign: "left",
                    }}
                  >
                    {memberNames.map(({ id, name, slug, team }) => {
                      const basePath = team === true ? "/equipo" : "/comunidad";
                      const href = slug ? `${basePath}/${slug}` : `${basePath}/${id}`;
                      return (
                        <li
                          key={id}
                          style={{
                            padding: "0.25rem 0",
                          }}
                        >
                          <Link
                            href={href}
                            className={styles.memberLink}
                            style={{
                              fontSize: width < BREAKPOINT_SM ? "1rem" : "1.2rem",
                              fontWeight: 700,
                              fontFamily:
                                "'Avenir Next Medium', 'Avenir Next', 'AvenirNext-Medium', 'AvenirNext', sans-serif",
                              color: "#000",
                              textDecoration: "none",
                              display: "block",
                              textAlign: "left",
                            }}
                          >
                            {name}
                          </Link>
                        </li>
                      );
                    })}
                    {memberNames.length === 0 && (
                      <li
                        style={{
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                          padding: "1rem",
                          backgroundColor: "#fafafa",
                          textAlign: "center",
                          color: "#666",
                        }}
                      >
                        No hay miembros registrados todavía.
                      </li>
                    )}
                  </ul>
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
                      touchAction: dragging ? "none" : "auto",
                    }}
                  >
                    {memberNames.map(({ id, name, slug, team }) => {
                      const layout = memberLayouts[id];
                      const isDragging = dragging === id;
                      const basePath = team === true ? "/equipo" : "/comunidad";
                      const href = slug ? `${basePath}/${slug}` : `${basePath}/${id}`;

                      return (
                        <li
                          key={id}
                          style={{
                            border: "none",
                            borderRadius: 0,
                            padding: 0,
                            backgroundColor: "transparent",
                            position: "absolute",
                            top: layout?.top ?? "50%",
                            left: layout?.left ?? "10%",
                            right: layout?.right,
                            transform: `rotate(${
                              layout?.rotation ?? 0
                            }deg) scale(${layout?.scale ?? 1})`,
                            transformOrigin: "left center",
                            zIndex: isDragging ? 10 : 1,
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            touchAction: "none",
                            WebkitTouchCallout: "none",
                          }}
                        >
                          <Link
                            href={href}
                            className={styles.memberLink}
                            draggable="false"
                            onMouseDown={(e) => {
                              startDrag(e.clientX, e.clientY, id, e);
                            }}
                            onTouchStart={(e) => {
                              if (e.touches.length > 0) {
                                const touch = e.touches[0];
                                startDrag(touch.clientX, touch.clientY, id, e);
                              }
                            }}
                            onClick={(e) => {
                              // Only navigate if we didn't drag
                              if (hasDraggedRef.current || justDragged) {
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                              }
                            }}
                            style={{
                              fontSize: width < BREAKPOINT_SM ? "1rem" : "1.2rem",
                              fontWeight: 700,
                              fontFamily:
                                "'Avenir Next Medium', 'Avenir Next', 'AvenirNext-Medium', 'AvenirNext', sans-serif",
                              color: "#000",
                              textDecoration: "none",
                              whiteSpace: "nowrap",
                              textAlign: "left",
                              cursor: "move",
                              display: "block",
                              pointerEvents: "auto",
                            }}
                          >
                            {name}
                          </Link>
                        </li>
                      );
                    })}
                    {memberNames.length === 0 && (
                        <li
                        style={{
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                          padding: "1rem",
                          backgroundColor: "#fafafa",
                          textAlign: "center",
                          color: "#666",
                        }}
                      >
                        No hay miembros registrados todavía.
                      </li>
                    )}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}