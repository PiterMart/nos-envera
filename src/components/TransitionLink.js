'use client';

import React from 'react';
import Link from 'next/link';
import { usePageTransition } from './PageTransitionProvider';

/**
 * Drop-in replacement for next/link for internal navigation.
 * White curtain slides in from left to cover page, then slides out to right when new page is ready.
 */
export function TransitionLink({ href, onClick, children, direction = 'forward', ...rest }) {
  const { startTransition } = usePageTransition();
  const isInternal = href?.startsWith('/') && !href.startsWith('//');

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;
    if (isInternal && href) {
      e.preventDefault();
      startTransition(href);
    }
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}

/**
 * Use for "back" actions (e.g. "Volver a equipo").
 */
export function TransitionBack({ onClick, children, ...rest }) {
  const { startBack } = usePageTransition();

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;
    e.preventDefault();
    startBack();
  };

  return (
    <a href="#" onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
