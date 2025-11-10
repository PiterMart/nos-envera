"use client"
import Image from "next/image";
import styles from "../../styles/page.module.css";
import React, { useEffect, useState } from "react";

export default function SobreNV() {
  const [visibleSubtitles, setVisibleSubtitles] = useState(new Set());
  const [visibleImages, setVisibleImages] = useState(new Set());

  // Intersection Observer for subtitle and image animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
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

    const subtitleElements = document.querySelectorAll('[data-subtitle-id]');
    const imageElements = document.querySelectorAll('[data-image-id]');
    
    subtitleElements.forEach(el => observer.observe(el));
    imageElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.page_container}>
        <div className={styles.homepage_container} style={{paddingTop: '2rem'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', margin: "auto", maxWidth: '666px'}}>

            {/* Header */}
            <div style={{textAlign: 'center', marginBottom: '3rem'}}>
              <h1 
                className={`${styles.sectionSubtitle} ${visibleSubtitles.has('subtitle1') ? styles.sectionSubtitleVisible : ''}`}
                data-subtitle-id="subtitle1"
                style={{fontSize: '3rem', lineHeight: '3rem', marginBottom: '1rem'}}
              >
                SOBRE NOS EN VERA
              </h1>
            </div>
              {/* Imagen representativa */}
              <div 
                style={{marginTop: '3rem', marginBottom: '2rem', textAlign: 'center'}}
                data-image-id="img1"
                className={`${styles.imageContainer} ${visibleImages.has('img1') ? styles.imageVisible : ''}`}
              >
                <Image
                  src="/FOTO 1.jpg"
                  alt="Espacio Nos en Vera"
                  width={600}
                  height={400}
                  style={{maxWidth: '100%', height: 'auto'}}
                />
              </div>

            {/* Presentación */}
            <div style={{marginBottom: '3rem'}}>
              <p style={{lineHeight: '1.8rem', marginBottom: '1rem'}}>
                Nos en Vera es un espacio de arte y cultura que se dedica a la promoción y desarrollo de artistas emergentes, 
                fomentando la experimentación y el diálogo entre diferentes disciplinas artísticas.
              </p>
              <p style={{lineHeight: '1.8rem', marginBottom: '1rem'}}>
                Nuestro objetivo es crear un ecosistema cultural que conecte artistas, curadores, investigadores y público 
                en un ambiente de colaboración y crecimiento mutuo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


