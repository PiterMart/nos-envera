'use client';
import React from 'react';
import Image from 'next/image';
import styles from '../styles/Section1.module.css';

export default function Section1() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.imageWrapper}>
          <Image
            src="/dominiq.jpg"
            alt="Section image"
            width={600}
            height={800}
            className={styles.image}
            priority
          />
        </div>
        <div className={styles.content}>
          <h2 className={styles.title}>Sobre Nos Envera</h2>
          <p className={styles.paragraph}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute 
            irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
            deserunt mollit anim id est laborum.
          </p>
        </div>
      </div>
    </section>
  );
}
