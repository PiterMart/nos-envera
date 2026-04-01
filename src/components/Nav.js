'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { TransitionLink } from './TransitionLink';
import styles from '../styles/nav.module.css';
import { NAV_PAGES } from '../constants/navigation';

function easeOutBounce(x) {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
}

export default function Nav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openSubMenu, setOpenSubMenu] = useState(null);
    const currentPath = usePathname();
    const logoRef = useRef(null);
    const animRef = useRef(null);

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

    useEffect(() => {
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    const handleNavigation = (page, e) => {
        setIsMenuOpen(false);
        setOpenSubMenu(null);
    };

    const scrollToFooter = (e) => {
        e.preventDefault();
        setIsMenuOpen(false);
        setOpenSubMenu(null);
        const footer = document.getElementById('footer');
        if (footer) {
            footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const runBounceAnimation = () => {
        const el = logoRef.current;
        if (!el || animRef.current) return;

        const duration = 850;
        const pressDuration = 60;
        const startTime = performance.now();
        el.style.transition = 'none';

        const tick = (now) => {
            const elapsed = now - startTime;
            if (elapsed >= duration) {
                el.style.transform = 'scale(1)';
                el.style.transition = '';
                animRef.current = null;
                return;
            }

            let scale;
            if (elapsed < pressDuration) {
                const t = elapsed / pressDuration;
                scale = 0.5 - 0.08 * t;
            } else {
                const t = Math.min(1, (elapsed - pressDuration) / (duration - pressDuration));
                const eased = easeOutBounce(t);
                scale = 0.92 + 0.2 * eased;
            }
            el.style.transform = `scale(${scale})`;
            animRef.current = requestAnimationFrame(tick);
        };
        animRef.current = requestAnimationFrame(tick);
    };

    const toggleMenu = () => {
        runBounceAnimation();
        setIsMenuOpen((prev) => {
            if (prev) setOpenSubMenu(null);
            return !prev;
        });
    };

    const isCurrent = (path) => {
        return currentPath === path;
    };

    return (
        <>
            <div className={`${styles.nav} ${isMenuOpen ? styles.nav_active : ''}`}>
                <div className={`${styles.nav_list} ${isMenuOpen ? styles.nav_list_active : ''}`} id="navMenu">
                    <ul>
                        {NAV_PAGES.map((page, index) => (
                            <li key={index} className={page.children ? styles.nav_item_with_children : ''}>
                                {page.children ? (
                                    <div className={styles.nav_dropdown_container}>
                                        <button 
                                            className={`${styles.nav_dropdown_button} ${openSubMenu === index ? styles.nav_dropdown_active : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setOpenSubMenu(openSubMenu === index ? null : index);
                                            }}
                                        >
                                            {page.name}
                                        </button>
                                        <div className={`${styles.nav_submenu} ${openSubMenu === index ? styles.nav_submenu_open : ''}`}>
                                            {page.children.map((child, idx) => (
                                                <TransitionLink
                                                    key={idx}
                                                    href={child.path}
                                                    className={`${styles.nav_submenu_link} ${isCurrent(child.path) ? styles.page_current : ''}`}
                                                    onClick={(e) => handleNavigation(child, e)}
                                                >
                                                    {child.name}
                                                </TransitionLink>
                                            ))}
                                        </div>
                                    </div>
                                ) : page.path === '/contacto' ? (
                                    <a
                                        href="#footer"
                                        onClick={scrollToFooter}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {page.name}
                                    </a>
                                ) : (
                                    <TransitionLink
                                        href={page.path}
                                        className={isCurrent(page.path) ? styles.page_current : ''}
                                        onClick={(e) => handleNavigation(page, e)}
                                    >
                                        {page.name}
                                    </TransitionLink>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <button 
                    ref={logoRef}
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

