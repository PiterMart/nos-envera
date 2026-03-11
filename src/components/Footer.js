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
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerMainRow}>
          {/* Column 1: CONTACTANOS - email, IG, newsletter */}
          <div className={styles.footerCol}>
            <h3 className={styles.contactTitle}>Contactanos</h3>
            <p>
              <a href="mailto:nos.envera@gmail.com" className={styles.contactLink}>nos.envera@gmail.com</a>
            </p>
            <a
              href={socialInfo.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Instagram"
              style={{ display: 'inline-flex', marginBottom: '1rem' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <div className={styles.newsletterBlock}>
              <h4 className={styles.newsletterTitle}>SUSCRIBITE A NUESTRO NEWSLETTER</h4>
              <MailchimpForm compact />
            </div>
          </div>

          {/* Column 2: NAV */}
          <div className={styles.footerCol}>
            <TransitionLink href="/" onClick={scrollToTop} style={{ display: 'block', marginBottom: '0.75rem' }}>
              <h3 className={styles.contactTitle}>NOS</h3>
            </TransitionLink>
            <ul className={styles.footerNavList}>
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
          </div>

          {/* Column 3: UBICACION - map underneath title */}
          <div className={styles.footerCol}>
            <h3 className={styles.contactTitle}>Ubicación</h3>
            <p className={styles.address}>Vera 1350, CABA</p>
            <div className={styles.mapContainer}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3186.1273239064344!2d-58.44721922424102!3d-34.591744056866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb514ed5492fd%3A0x41f3b6a42bf47ba4!2sNos%20en%20Vera!5e0!3m2!1ses!2sar!4v1762973636288!5m2!1ses!2sar"
                width="100%"
                height="250"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Nos en Vera - Ubicación"
              ></iframe>
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

