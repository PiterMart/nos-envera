"use client";
import React from "react";
import YARLightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function Lightbox({ isOpen, imageSrc, imageAlt, onClose, slides, index = 0 }) {
  const effectiveSlides = slides?.length
    ? slides.map((s) => (typeof s === "string" ? { src: s, alt: "" } : s))
    : imageSrc
      ? [{ src: imageSrc, alt: imageAlt || "" }]
      : [];
  if (!isOpen || !effectiveSlides.length) return null;

  return (
    <YARLightbox
      open={isOpen}
      close={onClose}
      slides={effectiveSlides}
      index={index}
    />
  );
}
