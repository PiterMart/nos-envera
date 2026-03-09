'use client';
import React from 'react';
import { TransitionLink } from './TransitionLink';
import { usePathname } from "next/navigation";
import styles from "../styles/Footer.module.css";
import RecentEvents from './RecentEvents';
import { NAV_PAGES } from '../constants/navigation';

export default function Footer() {
  const currentPath = usePathname();

  const isCurrent = (path) => {
    return currentPath === path;
  };

  // Social media information
  const socialInfo = {
    instagram: 'https://www.instagram.com/nos.envera/',
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.footerContent}>
        <RecentEvents />
        {/* Navigation Links and Social Media */}
        <div className={styles.footerNavSocial}>
          <div className={styles.footerNav}>
            <ul>
              {NAV_PAGES.map((page, index) => (
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
        <div className={styles.footerSocial}>
          <a
            href={socialInfo.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            aria-label="Instagram"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            @nos.envera
          </a>
        </div>

        {/* Copyright */}
        <div className={styles.footerCopyright}>
          <p>&copy; {new Date().getFullYear()} Nos en Vera. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

