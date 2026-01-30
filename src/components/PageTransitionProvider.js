'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from '../styles/PageTransitionOverlay.module.css';

const PageTransitionContext = createContext(null);

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) {
    return {
      startTransition: (href) => {},
      startBack: () => {},
    };
  }
  return ctx;
}

const ENTER_DURATION_MS = 400;
const EXIT_DURATION_MS = 400;

export default function PageTransitionProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'entering' | 'exiting'
  const [enteringClass, setEnteringClass] = useState(false); // delay one frame so overlay starts off-screen
  const pendingHref = useRef(null);
  const prevPathname = useRef(pathname);
  const overlayRef = useRef(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const startTransition = useCallback(
    (href) => {
      if (typeof window === 'undefined' || !href || href === pathname) {
        router.push(href);
        return;
      }
      pendingHref.current = href;
      setEnteringClass(false);
      setVisible(true);
      setPhase('entering');
    },
    [pathname, router]
  );

  const startBack = useCallback(() => {
    if (typeof window === 'undefined') {
      router.back();
      return;
    }
    pendingHref.current = '__back';
    setEnteringClass(false);
    setVisible(true);
    setPhase('entering');
  }, [router]);

  // One frame after showing overlay, add entering class so it animates from left
  useEffect(() => {
    if (!visible || phase !== 'entering') return;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEnteringClass(true));
    });
    return () => cancelAnimationFrame(raf);
  }, [visible, phase]);

  // When entering animation is done, navigate
  useEffect(() => {
    if (phase !== 'entering' || !pendingHref.current) return;
    const t = setTimeout(() => {
      if (pendingHref.current === '__back') {
        router.back();
      } else {
        router.push(pendingHref.current);
      }
    }, ENTER_DURATION_MS);
    return () => clearTimeout(t);
  }, [phase, router]);

  // When pathname changes after we navigated, run exit animation
  useEffect(() => {
    if (prevPathname.current === pathname) return;
    const wasPending = pendingHref.current !== null;
    prevPathname.current = pathname;
    if (wasPending && phase === 'entering') {
      setPhase('exiting');
    }
  }, [pathname, phase]);

  // When exiting animation is done, hide overlay
  const handleTransitionEnd = useCallback((e) => {
    if (e.target !== overlayRef.current) return;
    if (e.propertyName !== 'transform') return;
    if (phaseRef.current !== 'exiting') return;
    setPhase('idle');
    setEnteringClass(false);
    setVisible(false);
    pendingHref.current = null;
  }, []);

  // Fallback: if we're stuck in entering (pathname didn't change), still exit after a delay
  useEffect(() => {
    if (phase !== 'entering' || !pendingHref.current) return;
    const fallback = setTimeout(() => {
      setPhase('exiting');
    }, 2000);
    return () => clearTimeout(fallback);
  }, [phase]);

  const value = { startTransition, startBack };

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      {visible && (
        <div
          ref={overlayRef}
          className={`${styles.overlay} ${enteringClass ? styles.entering : ''} ${phase === 'exiting' ? styles.exiting : ''}`}
          onTransitionEnd={handleTransitionEnd}
          aria-hidden
        />
      )}
    </PageTransitionContext.Provider>
  );
}
