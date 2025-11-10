"use client";
import styles from "../../styles/page.module.css";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function Contacto() {
  const [visibleSubtitles, setVisibleSubtitles] = useState(new Set());
  const [visibleImages, setVisibleImages] = useState(new Set());

  // Intersection Observer for animations
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
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', margin: "auto", maxWidth: '800px'}}>

            {/* Header */}
            <div style={{textAlign: 'center', marginBottom: '3rem'}}>
              <h1 
                className={`${styles.sectionSubtitle} ${visibleSubtitles.has('subtitle1') ? styles.sectionSubtitleVisible : ''}`}
                data-subtitle-id="subtitle1"
                style={{fontSize: '3rem', lineHeight: '3rem', marginBottom: '1rem'}}
              >
                CONTACTO
              </h1>
            </div>

            {/* Contact Information */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '3rem'}}>
              
              {/* Main Contact Info */}
              <div style={{
                border: '1px solid #e0e0e0',
                padding: '2rem',
                borderRadius: '8px',
                background: '#fafafa'
              }}>
                <h2 
                  className={`${styles.sectionSubtitle} ${visibleSubtitles.has('subtitle2') ? styles.sectionSubtitleVisible : ''}`}
                  data-subtitle-id="subtitle2"
                  style={{fontSize: '2rem', lineHeight: '2rem', marginBottom: '1.5rem'}}
                >
                  Nos en Vera
                </h2>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  <div>
                    <h3 style={{fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '600'}}>
                      Email
                    </h3>
                    <p>
                      <a href="mailto:info@nosenvera.com" style={{color: '#000', textDecoration: 'none'}}>
                        info@nosenvera.com
                      </a>
                    </p>
                  </div>
                  
                  <div>
                    <h3 style={{fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '600'}}>
                      Teléfono
                    </h3>
                    <p>
                      <a href="tel:+5491123456789" style={{color: '#000', textDecoration: 'none'}}>
                        +54 9 11 2345-6789
                      </a>
                    </p>
                  </div>
                  
                  <div>
                    <h3 style={{fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '600'}}>
                      Dirección
                    </h3>
                    <p>Buenos Aires, Argentina</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div style={{
                border: '1px solid #e0e0e0',
                padding: '2rem',
                borderRadius: '8px',
                background: '#fafafa'
              }}>
                <h2 
                  className={`${styles.sectionSubtitle} ${visibleSubtitles.has('subtitle3') ? styles.sectionSubtitleVisible : ''}`}
                  data-subtitle-id="subtitle3"
                  style={{fontSize: '2rem', lineHeight: '2rem', marginBottom: '1.5rem'}}
                >
                  Redes Sociales
                </h2>
                
                <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                  <a 
                    href="https://www.instagram.com/nosenvera/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'none',
                      color: '#000',
                      border: '1px solid #000',
                      textDecoration: 'none',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      display: 'inline-block'
                    }}
                  >
                    Instagram
                  </a>
                  
                  <a 
                    href="https://www.facebook.com/nosenvera" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'none',
                      color: '#000',
                      border: '1px solid #000',
                      textDecoration: 'none',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      display: 'inline-block'
                    }}
                  >
                    Facebook
                  </a>
                  
                  <a 
                    href="https://www.youtube.com/@nosenvera" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'none',
                      color: '#000',
                      border: '1px solid #000',
                      textDecoration: 'none',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      display: 'inline-block'
                    }}
                  >
                    YouTube
                  </a>
                </div>
              </div>

              {/* About Section */}
              <div style={{
                border: '1px solid #e0e0e0',
                padding: '2rem',
                borderRadius: '8px',
                background: '#fafafa'
              }}>
                <h2 
                  className={`${styles.sectionSubtitle} ${visibleSubtitles.has('subtitle4') ? styles.sectionSubtitleVisible : ''}`}
                  data-subtitle-id="subtitle4"
                  style={{fontSize: '2rem', lineHeight: '2rem', marginBottom: '1.5rem'}}
                >
                  ¿Quieres colaborar?
                </h2>
                
                <p style={{lineHeight: '1.6rem', marginBottom: '1rem'}}>
                  Estamos aquí para conectarnos contigo. Ya seas artista, curador, investigador o simplemente alguien apasionado por el arte contemporáneo, nos encantaría escuchar de ti.
                </p>
                
                <p style={{lineHeight: '1.6rem', marginBottom: '1rem'}}>
                  Ponte en contacto con nosotros para:
                </p>
                
                <ul style={{lineHeight: '1.6rem', paddingLeft: '1.5rem'}}>
                  <li>Colaboraciones artísticas</li>
                  <li>Consultas sobre residencias</li>
                  <li>Participación en talleres y workshops</li>
                  <li>Oportunidades de exhibición</li>
                  <li>Investigaciones y publicaciones</li>
                  <li>Cualquier pregunta relacionada con Nos en Vera</li>
                </ul>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

