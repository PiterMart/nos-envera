"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import styles from "../styles/Lightbox.module.css";

export default function Lightbox({ isOpen, imageSrc, imageAlt, onClose }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;
  const ZOOM_STEP = 0.3;

  // Reset zoom when image changes or lightbox closes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  // Close lightbox on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle wheel zoom
  useEffect(() => {
    const handleWheel = (e) => {
      if (!isOpen || !containerRef.current) return;
      
      if (containerRef.current.contains(e.target)) {
        e.preventDefault();
        
        const delta = e.deltaY * -0.01;
        const newScale = Math.min(Math.max(scale + delta, MIN_SCALE), MAX_SCALE);
        
        if (newScale !== scale) {
          // Zoom towards mouse position
          const rect = containerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          const scaleChange = newScale / scale;
          setPosition({
            x: x - (x - position.x) * scaleChange,
            y: y - (y - position.y) * scaleChange
          });
          setScale(newScale);
        }
      }
    };

    if (isOpen) {
      window.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen, scale, position]);

  // Handle mouse drag
  const handleMouseDown = (e) => {
    if (scale > MIN_SCALE) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > MIN_SCALE) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch events for pinch zoom
  const touchDistance = useRef(0);
  const lastTouchCenter = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      touchDistance.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      lastTouchCenter.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
    } else if (e.touches.length === 1 && scale > MIN_SCALE) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const newDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const newScale = Math.min(
        Math.max(scale * (newDistance / touchDistance.current), MIN_SCALE),
        MAX_SCALE
      );
      
      const touchCenter = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };

      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = touchCenter.x - rect.left - rect.width / 2;
        const y = touchCenter.y - rect.top - rect.height / 2;
        
        const scaleChange = newScale / scale;
        setPosition({
          x: x - (x - position.x) * scaleChange,
          y: y - (y - position.y) * scaleChange
        });
      }
      
      setScale(newScale);
      touchDistance.current = newDistance;
      lastTouchCenter.current = touchCenter;
    } else if (e.touches.length === 1 && isDragging && scale > MIN_SCALE) {
      e.preventDefault();
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => {
    const newScale = Math.min(scale + ZOOM_STEP, MAX_SCALE);
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - ZOOM_STEP, MIN_SCALE);
    setScale(newScale);
    if (newScale === MIN_SCALE) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleResetZoom = () => {
    setScale(MIN_SCALE);
    setPosition({ x: 0, y: 0 });
  };

  const handleDoubleClick = () => {
    if (scale > MIN_SCALE) {
      handleResetZoom();
    } else {
      setScale(2);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div 
      className={styles.lightbox} 
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        ref={containerRef}
        className={styles.lightboxContent} 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        style={{
          cursor: scale > MIN_SCALE ? (isDragging ? 'grabbing' : 'grab') : 'default',
          maxWidth: scale > MIN_SCALE ? '100vw' : '90vw',
          maxHeight: scale > MIN_SCALE ? '100vh' : '90vh'
        }}
      >
        <div
          ref={imageRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            transformOrigin: 'center center'
          }}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={1200}
            height={800}
            className={styles.lightboxImage}
            priority
            style={{
              maxWidth: scale === MIN_SCALE ? '90vw' : 'none',
              maxHeight: scale === MIN_SCALE ? '90vh' : 'none',
              width: 'auto',
              height: 'auto',
              pointerEvents: 'none',
              userSelect: 'none'
            }}
            draggable={false}
          />
        </div>

        {/* Close Button */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close lightbox"
        >
          ✕
        </button>

        {/* Zoom Controls */}
        <div className={styles.zoomControls} onClick={(e) => e.stopPropagation()}>
          <button
            className={styles.zoomButton}
            onClick={handleZoomIn}
            disabled={scale >= MAX_SCALE}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            className={styles.zoomButton}
            onClick={handleZoomOut}
            disabled={scale <= MIN_SCALE}
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            className={`${styles.zoomButton} ${styles.resetButton}`}
            onClick={handleResetZoom}
            disabled={scale === MIN_SCALE}
            aria-label="Reset zoom"
          >
            RESET
          </button>
        </div>

        {/* Zoom indicator */}
        {scale > MIN_SCALE && (
          <div className={styles.zoomIndicator}>
            {Math.round(scale * 100)}%
          </div>
        )}
      </div>
    </div>
  );
}
