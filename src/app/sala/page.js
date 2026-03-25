import React from 'react';
import styles from '../../styles/page.module.css';
import SalaClient from './SalaClient';

export const metadata = {
  title: 'Sala | Nos en Vera',
  description: 'Características y equipamiento técnico de la sala de Nos en Vera',
};

export default function SalaPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.page_container}>
          <SalaClient />
        </div>
      </main>
    </div>
  );
}
