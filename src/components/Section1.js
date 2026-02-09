'use client';
import React from 'react';
import Image from 'next/image';
import styles from '../styles/Section1.module.css';
import pageStyles from '../styles/page.module.css';

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
          <header className={pageStyles.pageHeader}>
            <h1>SOBRE NOS ENVERA</h1>
          </header>
          <p className={styles.paragraph}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
            irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
            deserunt mollit anim id est laborum.
          </p>
          <p className={styles.paragraph}>
            Curabitur pretium tincidunt lacus. Nulla facilisi. Ut convallis, sem sit amet interdum
            consectetuer, odio augue aliquam leo, nec dapibus tortor nibh sed augue. Integer eu magna
            sit amet metus fermentum posuere. Morbi sit amet nulla sed dolor elementum imperdiet.
            Quisque fermentum. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur
            ridiculus mus. Pellentesque adipiscing eros ut libero.
          </p>
          <p className={styles.paragraph}>
            Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus
            et ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue, elit erat
            euismod orci, ac placerat dolor lectus quis orci. Suspendisse potenti. Nunc feugiat mi
            a tellus consequat imperdiet. Vestibulum sapien proin quam etiam ultrices. Suspendisse
            in justo eu magna luctus suscipit.
          </p>
        </div>
      </div>
    </section>
  );
}
