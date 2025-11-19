'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from '../styles/nav.module.css';

export default function Nav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const currentPath = usePathname();

    const pages = [
        { name: 'NOS', path: '/sobre-nv' },
        { name: 'PERFOS', path: '/perfos' },
        { name: 'HIGHLIGHTS', path: '/highlights' },
        { name: 'COMUNIDAD', path: '/comunidad' },
        { name: 'EQUIPO', path: '/equipo' },
        { name: 'FORMACIÓN', path: '/formacion' },
        { name: 'RESIDENCIAS', path: '/residencias' },
        { name: 'ARTÍCULOS', path: '/articulos' },
        { name: 'CONTACTO', path: '/contacto', isFooter: true },
    ];

    // Scroll to footer when hash is present in URL (e.g., after navigation)
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === '#footer') {
                setTimeout(() => {
                    const footer = document.getElementById('footer');
                    if (footer) {
                        footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 300); // Delay to allow page to render
            }
        };

        // Check on mount and path change
        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [currentPath]);

    const handleNavigation = (page, e) => {
        setIsMenuOpen(false);
        
        // If it's the CONTACTO button, scroll to footer instead of navigating
        if (page.isFooter) {
            e.preventDefault();
            
            // Small delay to ensure menu closes smoothly
            setTimeout(() => {
                const footer = document.getElementById('footer');
                if (footer) {
                    footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Update URL without triggering navigation
                    window.history.pushState(null, '', '#footer');
                }
            }, 100);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const isCurrent = (path) => {
        // Apply current styling to the active page
        return currentPath === path;
    };

    return (
        <>
            <Link href="/">
                <Image
                    src="/NV-logotypo.png"
                    alt="Nos en Vera"
                    width={120}
                    height={48}
                    className={styles.nav_logo}
                    priority={true}
                    quality={100}
                    unoptimized={true}
                />
            </Link>
            <div className={styles.nav}>
                <button className={`${styles.navButton} ${isMenuOpen ? styles.open : ''}`} onClick={toggleMenu}>
                    <span className={styles.bar}></span>
                    <span className={styles.bar}></span>
                    <span className={styles.bar}></span>
                </button>
                <div className={`${styles.nav_list} ${isMenuOpen ? styles.nav_list_active : ''}`} id="navMenu">
                    <ul>
                        {pages.map((page, index) => (
                            <li key={index}>
                                {page.isFooter ? (
                                    <a
                                        href="#footer"
                                        onClick={(e) => handleNavigation(page, e)}
                                    >
                                        {page.name}
                                    </a>
                                ) : (
                                    <Link
                                        href={page.path}
                                        className={isCurrent(page.path) ? styles.page_current : ''}
                                        onClick={(e) => handleNavigation(page, e)}
                                    >
                                        {page.name}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}