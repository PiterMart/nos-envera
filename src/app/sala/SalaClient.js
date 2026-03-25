"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Lightbox from '../../components/Lightbox';
import styles from '../../styles/Sala.module.css';
import AnimatedPageHeader from '../../components/AnimatedPageHeader';

const IMAGES = [
  '/espacio/NosEnvera-Fabrica1.jpg',
  '/espacio/NosEnvera-Fabrica2.jpg',
  '/espacio/NosEnvera-Fabrica3.jpg',
  '/espacio/NosEnvera-Fabrica4.jpg',
];

function CarouselImage({ src, alt, onClick }) {
  const [aspectRatio, setAspectRatio] = useState(3 / 4); // Default fallback

  const handleLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setAspectRatio(naturalWidth / naturalHeight);
    }
  };

  return (
    <div
      className={styles.carouselItem}
      style={{ '--aspect-ratio': aspectRatio }}
      onClick={onClick}
    >
      <Image
        src={src}
        alt={alt}
        className={styles.carouselImage}
        fill
        sizes="(max-width: 768px) 85vw, 400px"
        onLoad={handleLoad}
      />
    </div>
  );
}

export default function SalaClient() {
  const [loaded, setLoaded] = useState(false);
  const headerRef = useRef(null);
  const trackRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const lightboxSlides = IMAGES.map(src => ({ src, alt: `Sala foto ${src.split('/').pop()} - Nos Envera` }));

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setLoaded(true);
      },
      { threshold: 0.2 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  const handleMouseMove = (e) => {
    if (window.innerWidth <= 768) return;

    const element = e.currentTarget;
    const { left, width } = element.getBoundingClientRect();
    const x = e.clientX - left;

    const edgePercentage = 0.15;
    const scrollSpeed = 5;

    clearInterval(scrollIntervalRef.current);

    if (x < width * edgePercentage) {
      scrollIntervalRef.current = setInterval(() => {
        if (trackRef.current) trackRef.current.scrollBy({ left: -scrollSpeed, behavior: 'auto' });
      }, 16);
    } else if (x > width * (1 - edgePercentage)) {
      scrollIntervalRef.current = setInterval(() => {
        if (trackRef.current) trackRef.current.scrollBy({ left: scrollSpeed, behavior: 'auto' });
      }, 16);
    }
  };

  const handleMouseLeave = () => {
    clearInterval(scrollIntervalRef.current);
  };

  useEffect(() => {
    return () => clearInterval(scrollIntervalRef.current);
  }, []);

  return (
    <div className={styles.container}>
      <div ref={headerRef} style={{ marginBottom: '2rem' }}>
        <AnimatedPageHeader loaded={loaded}>SALA</AnimatedPageHeader>
      </div>

      {/* Intro Section - Similar to EventClient.js */}
      <section className={styles.responsiveSection}>
        <div className={styles.responsiveImageContainer}>
          <Image
            src={IMAGES[0]}
            alt="Sala principal - Nos Envera"
            width={800}
            height={1000}
            className={styles.image}
            priority
          />
        </div>

        <div className={styles.textContainer}>
          <p className={styles.paragraph}>
            La sala se encuentra en planta baja. Tiene una superficie total de 140 m² y una capacidad de hasta 120 personas de pie. Cuenta con sala principal, hall y oficina y sistema de sonido e iluminación profesional.
          </p>
          <p className={styles.paragraph}>
            El espacio es accesible y cuenta con baños adaptados para personas con movilidad reducida.
          </p>
          <ul className={styles.list}>
            <li>Superficie total: 140 m²</li>
            <li>Capacidad: hasta 120 personas de pie</li>
            <li>Ambientes: sala principal, hall, oficina</li>
            <li>WiFi</li>
            <li>Ambiente climatizado en invierno</li>
            <li>Espacio es accesible con baños adaptados para personas con movilidad reducida.</li>
          </ul>

          <h3 style={{ fontSize: '1rem', fontStyle: 'italic', margin: '0' }}>Sonido:</h3>
          <ul className={styles.list} style={{ marginTop: '0.5rem' }}>
            <li>Sistema 2.1 Db Technologies 503</li>
            <li>2 trípodes móviles</li>
            <li>Mixer Yamaha MG10XU</li>
            <li>Micrófono Shure SM58</li>
          </ul>

          <h3 style={{ fontSize: '1rem', fontStyle: 'italic', margin: '1rem 0 0 0' }}>Iluminación:</h3>
          <ul className={styles.list} style={{ marginTop: '0.5rem' }}>
            <li>Sistema uniforme de luminarias a techo con tonalidades frías, cálidas y ambientes</li>
            <li>3 Tachos Led PLS-PAR 546 flat * 54 LED X 3w RGB * Control: auto/sonido/DMX/Master - slave *</li>
            <li>Canales DMX: 8* Ángulo 25°</li>
            <li>1 Tacho Led PLS PAR 544 RGB LED de 4W 3-in-1 RGB Ángulo: 25° * 5200Lm Modo: Auto/Sound/DMX/Master</li>
            <li>1 soporte trípode iluminación DJ Luces T 1,2 para 8 tachos</li>
            <li>Consola Dmx 512 Operator 192 Canales Controlador 240 Pasos para tachos de luz</li>
          </ul>
        </div>
      </section>

      {/* Gallery Section - Carousel */}
      <section className={styles.carouselContainer} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <div className={styles.carouselTrack} ref={trackRef}>
          {IMAGES.map((src, idx) => (
            <CarouselImage
              key={idx}
              src={src}
              alt={`Sala foto ${idx + 1} - Nos Envera`}
              onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
            />
          ))}
        </div>
      </section>

      {/* Maps Section - Limited to 500px, Left aligned */}
      <section className={styles.section}>
        <div className={styles.mapContainer}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1642.067332152843!2d-58.4357497!3d-34.5947387!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb590740a6b71%3A0xe5469abb20188686!2sVera%20845%2C%20C1414%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1711388543210!5m2!1ses-419!2sar"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Google Maps Location"
          ></iframe>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          isOpen={lightboxOpen}
          slides={lightboxSlides}
          index={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}


