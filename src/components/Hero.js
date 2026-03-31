'use client';
import React, { useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import styles from '../styles/Hero.module.css';

export default function Hero() {
  const wrapperRef = useRef(null);
  const rafId = useRef(null);
  const isDraggingRef = useRef(false);

  // Smooth easing function for gentler edge transitions
  const smoothEase = useCallback((t) => {
    const clamped = Math.max(0, Math.min(1, Math.abs(t)));
    return clamped * (2 - clamped);
  }, []);

  // Apply tilt directly to the DOM node — zero React re-renders
  const applyTilt = useCallback((tiltX, tiltY) => {
    if (!wrapperRef.current) return;
    wrapperRef.current.style.transform =
      `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  }, []);

  const updateTilt = useCallback((clientX, clientY) => {
    const el = wrapperRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normalizedX = (clientX - centerX) / (rect.width / 2);
    const normalizedY = (clientY - centerY) / (rect.height / 2);

    const easedX = smoothEase(normalizedX) * Math.sign(normalizedX);
    const easedY = smoothEase(normalizedY) * Math.sign(normalizedY);

    const tiltX = easedY * -15;
    const tiltY = easedX * 15;

    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      applyTilt(tiltX, tiltY);
    });
  }, [smoothEase, applyTilt]);

  const handleMouseMove = useCallback((e) => {
    updateTilt(e.clientX, e.clientY);
  }, [updateTilt]);

  const handleMouseEnter = useCallback(() => {
    wrapperRef.current?.classList.add(styles.hovering);
  }, []);

  const handleMouseLeave = useCallback(() => {
    wrapperRef.current?.classList.remove(styles.hovering);
    if (rafId.current) cancelAnimationFrame(rafId.current);
    applyTilt(0, 0);
  }, [applyTilt]);

  // Touch event handlers for mobile drag
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      wrapperRef.current?.classList.add(styles.hovering);
      const touch = e.touches[0];
      updateTilt(touch.clientX, touch.clientY);
    }
  }, [updateTilt]);

  const handleTouchMove = useCallback((e) => {
    if (isDraggingRef.current && e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      updateTilt(touch.clientX, touch.clientY);
    }
  }, [updateTilt]);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    wrapperRef.current?.classList.remove(styles.hovering);
    if (rafId.current) cancelAnimationFrame(rafId.current);
    applyTilt(0, 0);
  }, [applyTilt]);

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.heroImageContainer}>
        <div
          ref={wrapperRef}
          className={styles.heroImageWrapper}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
            touchAction: 'pan-y',
          }}
        >
          <Image
            src="/NV_Logo3D_5.png"
            alt="Nos en Vera Logo"
            width={800}
            height={600}
            className={styles.heroImage}
            priority
          />
        </div>
      </div>
    </section>
  );
}

