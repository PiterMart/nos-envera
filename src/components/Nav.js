'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from '../styles/nav.module.css';

export default function Nav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const currentPath = usePathname();

    // Same routes as Footer.js
    const pages = [
        { name: 'NOS', path: '/' },
        { name: 'AGENDA', path: '/agenda' },
        { name: 'SOMOS', path: '/equipo' },
        { name: 'COMUNIDAD', path: '/comunidad' },
        { name: 'PERFORMANCES', path: '/performances' },
        { name: 'FORMACIONES', path: '/formaciones' },
        { name: 'RESIDENCIAS', path: '/residencias' },
        { name: 'ARCHIVO', path: '/archivo' },
        { name: 'CONTACTO', path: '/contacto' },
        { name: 'HIGHLIGHTS', path: '/highlights' },
    ];
    // Links no longer used (kept for reference):
    // { name: 'PERFOS', path: '/perfos' },
    // { name: 'FORMACIÓN', path: '/formacion' },
    // { name: 'RESIDENCIAS', path: '/residencias' },
    // { name: 'ARTÍCULOS', path: '/articulos' },

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
            <div className={`${styles.nav} ${isMenuOpen ? styles.nav_active : ''}`}>
                <div className={`${styles.nav_list} ${isMenuOpen ? styles.nav_list_active : ''}`} id="navMenu">
                    <ul>
                        {pages.map((page, index) => (
                            <li key={index}>
                                <Link
                                    href={page.path}
                                    className={isCurrent(page.path) ? styles.page_current : ''}
                                    onClick={(e) => handleNavigation(page, e)}
                                >
                                    {page.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <button 
                    className={styles.nav_logo_button} 
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <Image
                        src="/NV_Iso3D_4.png"
                        alt="Nos en Vera Menu"
                        width={120}
                        height={120}
                        className={styles.nav_logo_image}
                        priority={true}
                        quality={100}
                        unoptimized={true}
                    />
                </button>
            </div>
        </>
    );
}
