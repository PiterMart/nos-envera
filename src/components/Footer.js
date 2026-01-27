'use client';
import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../styles/Footer.module.css";
import RecentEvents from './RecentEvents';

export default function Footer() {
  const currentPath = usePathname();

  const pages = [
    { name: 'NOS', path: '/' },
    { name: 'PERFOS', path: '/perfos' },
    { name: 'HIGHLIGHTS', path: '/highlights' },
    { name: 'COMUNIDAD', path: '/comunidad' },
    { name: 'EQUIPO', path: '/equipo' },
    { name: 'FORMACIÓN', path: '/formacion' },
    { name: 'RESIDENCIAS', path: '/residencias' },
    { name: 'ARTÍCULOS', path: '/articulos' },
    { name: 'CONTACTO', path: '/contacto' },
  ];

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
        </div>

        {/* Copyright */}
        <div className={styles.footerCopyright}>
          <p>&copy; {new Date().getFullYear()} Nos en Vera. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
