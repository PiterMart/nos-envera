"use client";
import React from "react";
import YARLightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function Lightbox({ isOpen, imageSrc, imageAlt, onClose }) {
  if (!isOpen || !imageSrc) return null;

  return (
    <YARLightbox
      open={isOpen}
      close={onClose}
      slides={[
        {
          src: imageSrc,
          alt: imageAlt || "",
        },
      ]}
    />
  );
}
