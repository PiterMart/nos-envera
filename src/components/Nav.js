'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { TransitionLink } from './TransitionLink';
import styles from '../styles/nav.module.css';
import { NAV_PAGES } from '../constants/navigation';

export default function Nav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const currentPath = usePathname();

    // Scroll to footer when hash is present in URL
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === '#footer') {
                setTimeout(() => {
                    const footer = document.getElementById('footer');
                    if (footer) {
                        footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 300);
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [currentPath]);

    const handleNavigation = (page, e) => {
        setIsMenuOpen(false);
    };

    const scrollToFooter = (e) => {
        e.preventDefault();
        setIsMenuOpen(false);
        const footer = document.getElementById('footer');
        if (footer) {
            footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const isCurrent = (path) => {
        return currentPath === path;
    };

    return (
        <>
            <div className={`${styles.nav} ${isMenuOpen ? styles.nav_active : ''}`}>
                <div className={`${styles.nav_list} ${isMenuOpen ? styles.nav_list_active : ''}`} id="navMenu">
                    <ul>
                        {NAV_PAGES.flatMap((page, index) => {
                            if (page.children) {
                                return page.children.map((child, idx) => (
                                    <li key={`child-${index}-${idx}`}>
                                        <TransitionLink
                                            href={child.path}
                                            className={isCurrent(child.path) ? styles.page_current : ''}
                                            onClick={(e) => handleNavigation(child, e)}
                                        >
                                            {child.name}
                                        </TransitionLink>
                                    </li>
                                ));
                            } else if (page.path === '/contacto') {
                                return (
                                    <li key={`contact-${index}`}>
                                        <a
                                            href="#footer"
                                            onClick={scrollToFooter}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {page.name}
                                        </a>
                                    </li>
                                );
                            } else {
                                return (
                                    <li key={`page-${index}`}>
                                        <TransitionLink
                                            href={page.path}
                                            className={isCurrent(page.path) ? styles.page_current : ''}
                                            onClick={(e) => handleNavigation(page, e)}
                                        >
                                            {page.name}
                                        </TransitionLink>
                                    </li>
                                );
                            }
                        })}
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
                        quality={75}
                    />
                </button>
            </div>
        </>
    );
}

