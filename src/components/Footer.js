'use client';
import React from 'react';
import { TransitionLink } from './TransitionLink';
import { usePathname } from "next/navigation";
import styles from "../styles/Footer.module.css";
import MailchimpForm from './MailchimpForm';
import { NAV_PAGES } from '../constants/navigation';

export default function Footer() {
  const currentPath = usePathname();

  const isCurrent = (path) => {
    return currentPath === path;
  };

  const socialInfo = {
    instagram: 'https://www.instagram.com/nos.envera/',
    youtube: 'https://www.youtube.com/@NosEnVera-Youtube',
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerMainRow}>
          {/* 1. SEGUINOS */}
          <div className={styles.footerCol}>
            <div style={{ marginBottom: '0rem' }}>
              <h3 className={styles.contactTitle}>Seguinos</h3>
              <div className={`${styles.footerIndent} ${styles.footerSubtext}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a
                  href={socialInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Instagram"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <span> → Instagram</span>
                </a>
                <a
                  href={socialInfo.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="YouTube"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <span> → YouTube</span>
                </a>
              </div>
            </div>
          </div>

          {/* 3. CONTACTANOS */}
          <div className={styles.footerCol}>
            <div style={{ marginBottom: '0rem' }}>
              <h3 className={styles.contactTitle}>ContactANOS</h3>
              <p className={`${styles.footerIndent} ${styles.footerSubtext}`}>
                <a href="mailto:nos.envera@gmail.com" className={styles.contactLink}> → nos.envera@gmail.com</a>
              </p>
            </div>
          </div>

          {/* 4. UBICACION */}
          <div className={styles.footerCol}>
            <div>
              <h3 className={styles.contactTitle}>Ubicación</h3>
              <a
                href="https://maps.app.goo.gl/x3uyNJrSMe7eSQqm8"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.contactLink} ${styles.footerIndent} ${styles.footerSubtext}`}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', textDecoration: 'none' }}
              >
                <span> → Vera 1350 - Villa Crespo - CABA</span>
              </a>
            </div>
          </div>
          {/* 2. SUSCRIBITE */}
          <div className={styles.footerCol}>
            <div>
              <h3 className={styles.contactTitle}>Suscribite</h3>
              <div className={`${styles.footerIndent} ${styles.footerSubtext}`}>
                <MailchimpForm compact />
              </div>
            </div>
          </div>
          {/* 3. NOS - nav */}
          {/* <div className={styles.footerCol}>
            <TransitionLink href="/" onClick={scrollToTop} style={{ display: 'block', marginBottom: '0' }}>
              <h3 className={styles.contactTitle}>NOS</h3>
            </TransitionLink>
            <ul className={`${styles.footerNavList} ${styles.footerIndent} ${styles.footerSubtext}`}>
              {NAV_PAGES.filter((page) => page.path !== '/' && page.path !== '/contacto').map((page, index) => (
                <li key={index}>
                  <TransitionLink
                    href={page.path}
                    className={isCurrent(page.path) ? styles.page_current : ''}
                    onClick={scrollToTop}
                  >
                    {page.name}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </div> */}
        </div>

        {/* Copyright */}
        <div className={styles.footerCopyright}>
          <p>&copy; {new Date().getFullYear()} Nos en Vera. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

