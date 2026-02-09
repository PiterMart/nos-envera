'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import styles from '../styles/Hero.module.css';

export default function Hero() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef(null);
  const rafId = useRef(null);

  // Smooth easing function for gentler edge transitions
  const smoothEase = useCallback((t) => {
    // Clamp t between 0 and 1
    const clamped = Math.max(0, Math.min(1, Math.abs(t)));
    // Use a smoother curve that reduces intensity at edges
    // This creates a gentler transition: faster in center, slower at edges
    return clamped * (2 - clamped);
  }, []);

  const updateTilt = useCallback((clientX, clientY) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = clientX - centerX;
    const mouseY = clientY - centerY;

    // Normalize position (-1 to 1)
    const normalizedX = mouseX / (rect.width / 2);
    const normalizedY = mouseY / (rect.height / 2);

    // Apply smooth easing for gentler edge transitions
    const easedX = smoothEase(normalizedX) * Math.sign(normalizedX);
    const easedY = smoothEase(normalizedY) * Math.sign(normalizedY);

    // Calculate tilt angles (max 15 degrees) with eased values
    const tiltX = easedY * -15;
    const tiltY = easedX * 15;

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      setTilt({ x: tiltX, y: tiltY });
    });
  }, [smoothEase]);

  const handleMouseMove = useCallback((e) => {
    updateTilt(e.clientX, e.clientY);
  }, [updateTilt]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    setTilt({ x: 0, y: 0 });
  }, []);

  // Touch event handlers for mobile drag
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setIsHovering(true);
      const touch = e.touches[0];
      updateTilt(touch.clientX, touch.clientY);
    }
  }, [updateTilt]);

  const handleTouchMove = useCallback((e) => {
    if (isDragging && e.touches.length === 1) {
      e.preventDefault(); // Prevent scrolling while dragging
      const touch = e.touches[0];
      updateTilt(touch.clientX, touch.clientY);
    }
  }, [isDragging, updateTilt]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setIsHovering(false);
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    setTilt({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.heroImageContainer}>
        <div
          ref={imageRef}
          className={`${styles.heroImageWrapper} ${isHovering ? styles.hovering : ''}`}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            touchAction: 'pan-y', // Allow vertical scrolling but prevent horizontal scrolling during drag
          }}
        >
          <Image
            src="/NV_Logo3D_4.png"
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
