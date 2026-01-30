"use client"
import Image from "next/image";
import styles from "../styles/page.module.css";
import React, { useEffect, useState, useRef } from "react";
import Lightbox from "../components/Lightbox";
import Link from "next/link";
import Hero from "../components/Hero";
import Section1 from "../components/Section1";

export default function Home() {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState({ src: '', alt: '' });
  const [draggedImage, setDraggedImage] = useState(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [imagePositions, setImagePositions] = useState({});
  const [visibleSubtitles, setVisibleSubtitles] = useState(new Set());
  const [visibleImages, setVisibleImages] = useState(new Set());

  const openLightbox = (imageSrc, imageAlt) => {
    setLightboxImage({ src: imageSrc, alt: imageAlt });
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  // Handle mouse/touch down events
  const handleDragStart = (e, imageId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    setDragStartPos({ x: clientX, y: clientY });
    setDraggedImage(imageId);
  };

  // Handle mouse/touch move events
  const handleDragMove = (e) => {
    if (!draggedImage) return;
    
    e.preventDefault();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - dragStartPos.x;
    const deltaY = clientY - dragStartPos.y;
    
    setImagePositions(prev => ({
      ...prev,
      [draggedImage]: {
        x: (prev[draggedImage]?.x || 0) + deltaX,
        y: (prev[draggedImage]?.y || 0) + deltaY
      }
    }));
    
    // Update start position for next frame
    setDragStartPos({ x: clientX, y: clientY });
  };

  // Handle mouse/touch up events
  const handleDragEnd = () => {
    setDraggedImage(null);
  };


  // Add global event listeners for drag
  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleDragMove(e);
    const handleGlobalTouchMove = (e) => handleDragMove(e);
    const handleGlobalMouseUp = () => handleDragEnd();
    const handleGlobalTouchEnd = () => handleDragEnd();

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [draggedImage, dragStartPos]);

  // Intersection Observer for subtitle and image animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2, // Trigger when 20% of element is visible
      rootMargin: '0px 0px -50px 0px'
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const subtitleId = entry.target.getAttribute('data-subtitle-id');
          const imageId = entry.target.getAttribute('data-image-id');
          
          if (subtitleId) {
            setVisibleSubtitles(prev => new Set([...prev, subtitleId]));
          }
          
          if (imageId) {
            setVisibleImages(prev => new Set([...prev, imageId]));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all elements with data-subtitle-id or data-image-id attributes
    const subtitleElements = document.querySelectorAll('[data-subtitle-id]');
    const imageElements = document.querySelectorAll('[data-image-id]');
    
    subtitleElements.forEach(el => observer.observe(el));
    imageElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.page}>
      <Hero />
      <div style={{ height: '100vh', width: '100%' }} aria-hidden="true" />
      <Section1 />
      <Image src="/nv1.jpg" alt="Section image" width={1000} height={1000} className={styles.fullWidthImage} />
      <Image src="/nv2.jpg" alt="Section image" width={1000} height={1000} className={styles.fullWidthImage} />
      <main className={styles.main}>
      </main>

      {/* Lightbox Component */}
      <Lightbox
        isOpen={isLightboxOpen}
        imageSrc={lightboxImage.src}
        imageAlt={lightboxImage.alt}
        onClose={closeLightbox}
      />
    </div>
  );
}