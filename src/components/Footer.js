'use client';
import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../styles/Footer.module.css";

export default function Footer() {
  const currentPath = usePathname();

  const pages = [
    { name: 'NOS', path: '/sobre-nv' },
    { name: 'PERFOS', path: '/perfos' },
    { name: 'HIGHLIGHTS', path: '/highlights' },
    { name: 'COMUNIDAD', path: '/comunidad' },
    { name: 'EQUIPO', path: '/equipo' },
    { name: 'FORMACIÓN', path: '/formacion' },
    { name: 'RESIDENCIAS', path: '/residencias' },
    { name: 'PRENSA', path: '/prensa' },
  ];

  const isCurrent = (path) => {
    return currentPath === path;
  };

  // Contact information
  const contactInfo = {
    address: 'Vera 1350, CABA',
    instagram: 'https://www.instagram.com/nos.envera/',
    googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3186.1273239064344!2d-58.44721922424102!3d-34.591744056866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb514ed5492fd%3A0x41f3b6a42bf47ba4!2sNos%20en%20Vera!5e1!3m2!1ses!2sar!4v1762973636288!5m2!1ses!2sar',
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Navigation Links */}
        <div className={styles.footerNav}>
          <ul>
            {pages.map((page, index) => (
              <li key={index}>
                <Link
                  href={page.path}
                  className={isCurrent(page.path) ? styles.page_current : ''}
                  onClick={scrollToTop}
                >
                  {page.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Information */}
        <div className={styles.footerContact}>
          <div className={styles.contactSection}>
            <h3 className={styles.contactTitle}>CONTACTO</h3>
            <div className={styles.contactInfo}>
              {contactInfo.instagram && (
                <p>
                  <a 
                    href={contactInfo.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.contactLink}
                  >
                    @nos.envera
                  </a>
                </p>
              )}
            </div>
          </div>

          <div className={styles.locationSection}>
            <h3 className={styles.contactTitle}>UBICACIÓN</h3>
            <div className={styles.locationInfo}>
              {contactInfo.address && (
                <p className={styles.address}>{contactInfo.address}</p>
              )}
              {contactInfo.googleMapsEmbed && (
                <div className={styles.mapContainer}>
                  <iframe
                    src={contactInfo.googleMapsEmbed}
                    width="100%"
                    height="300"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Nos en Vera - Ubicación"
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.footerCopyright}>
          <p>&copy; {new Date().getFullYear()} Nos en Vera. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
