'use client';
import React, { useState } from 'react';
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
        { name: 'PRENSA', path: '/prensa' },
        { name: 'CONTACTO', path: '/contacto' },
    ];


    const handleNavigation = (page, e) => {
        // All pages are now standalone pages, no homepage sections
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
            </div>
        </>
    );
}