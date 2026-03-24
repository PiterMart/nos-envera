'use client';

import React from 'react';
import { TransitionLink } from './TransitionLink';
import styles from '../styles/page.module.css';

/**
 * Reusable back-navigation links with full-width underline styling.
 * @param {Array<{ href: string, label: string }>} links - Array of link objects
 */
export default function BackNavLinks({ links = [] }) {
  if (!links.length) return null;
  return (
    <div className={styles.link_container}>
      {links.map(({ href, label }, index) => (
        <TransitionLink
          key={`${href}-${index}`}
          href={href}
          direction="back"
          className={styles.backNavLink}
        >
          ← {label}
        </TransitionLink>
      ))}
    </div>
  );
}
