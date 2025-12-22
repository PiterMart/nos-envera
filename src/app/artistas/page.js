"use client";
import styles from "../../styles/page.module.css";
import Image from "next/image";

export default function Artistas() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.page_container}>
          <div className={styles.logoContainer}>
            <Image
              src="/artwingslogo.png"
              alt="ARTWINGS Logo"
              width={400}
              height={200}
              className={styles.logo}
              priority
            />
          </div>
          <div className={styles.artists_page}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', margin: "auto", maxWidth: '800px', marginTop: '5rem'}}>
              <header className={styles.pageHeaderSmall}>
                <h1>Artistas</h1>
              </header>
              
              <p style={{lineHeight: '1.5rem', textAlign: 'justify', marginTop: '2rem'}}>
                Nuestra selección de artistas representa una diversidad de voces, técnicas y perspectivas que enriquecen el panorama del arte contemporáneo.
              </p>
              
              <p style={{lineHeight: '1.5rem', textAlign: 'justify'}}>
                Cada artista presenta una visión única que desafía convenciones y abre nuevos diálogos en el mundo del arte, contribuyendo al ecosistema creativo de ARTWINGS.
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer className={styles.footer}>
      </footer>
    </div>
  );
}



