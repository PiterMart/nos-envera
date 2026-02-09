'use client';

import React from 'react';
import { TransitionLink } from './TransitionLink';
import styles from '../styles/Section3.module.css';
import pageStyles from '../styles/page.module.css';

export default function Section3() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>CONOCE</h1>
          <h1>NUESTRA</h1>
          <TransitionLink
            href="/agenda"
            className={`${pageStyles.ordenarButtonBreathing} ${styles.titleButton}`}
          >
            AGENDA 2026
          </TransitionLink>
        </header>
      </div>
    </section>
  );
}
