'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import styles from '../styles/Banner.module.css';

export default function Banner() {
  const stripRef = useRef(null);
  const [tileWidth, setTileWidth] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startTranslateXRef = useRef(0);

  const clampTranslate = useCallback((value) => {
    let v = value;
    if (v > 0) return 0;
    if (tileWidth > 0) {
      while (v <= -tileWidth) v += tileWidth;
    }
    return v;
  }, [tileWidth]);

  useEffect(() => {
    const updateWidth = () => {
      if (stripRef.current && stripRef.current.children[0]) {
        const width = stripRef.current.children[0].offsetWidth;
        if (width > 0) setTileWidth(width);
      }
    };
    
    updateWidth();
    const interval = setInterval(updateWidth, 500);
    window.addEventListener('resize', updateWidth);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const handlePointerDown = useCallback(
    (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      startXRef.current = clientX;
      startTranslateXRef.current = translateX;
      setIsDragging(true);
    },
    [translateX]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const delta = clientX - startXRef.current;
      const newValue = clampTranslate(startTranslateXRef.current + delta);
      setTranslateX(newValue);
    },
    [isDragging, clampTranslate]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => {
      e.preventDefault();
      handlePointerMove(e);
    };
    const onUp = () => handlePointerUp();
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return (
    <div className={styles.bannerWrapper}>
      <div
        ref={stripRef}
        className={`${styles.bannerStrip} ${isDragging ? styles.dragging : ''}`}
        style={{ transform: `translateX(${translateX}px)` }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        {/* Three copies for seamless infinite loop on desktop; position recycles at tile boundary */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bannergothwindowszyntax.png"
          alt=""
          className={styles.bannerImage}
          draggable={false}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bannergothwindowszyntax.png"
          alt=""
          className={styles.bannerImage}
          draggable={false}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bannergothwindowszyntax.png"
          alt=""
          className={styles.bannerImage}
          draggable={false}
        />
      </div>
    </div>
  );
}
