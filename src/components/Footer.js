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
          {/* 1. SEGUINOS - Instagram */}
          <div className={styles.footerCol}>
            <h3 className={styles.contactTitle}>Seguinos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={socialInfo.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Instagram"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
                <span>Instagram</span>
              </a>
              <a
                href={socialInfo.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="YouTube"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" />
                </svg>
                <span>YouTube</span>
              </a>
            </div>
          </div>

          {/* 2. SUSCRIBITE - newsletter */}
          <div className={styles.footerCol}>
            <h3 className={styles.contactTitle}>Suscribite</h3>
            <MailchimpForm compact />
          </div>

          {/* 3. CONTACTANOS - email */}
          <div className={styles.footerCol}>
            <h3 className={styles.contactTitle}>Contactanos</h3>
            <p>
              <a href="mailto:nos.envera@gmail.com" className={styles.contactLink}>nos.envera@gmail.com</a>
            </p>
          </div>

          {/* 4. NOS - nav */}
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
        </div>

        {/* Copyright */}
        <div className={styles.footerCopyright}>
          <p>&copy; {new Date().getFullYear()} Nos en Vera. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

