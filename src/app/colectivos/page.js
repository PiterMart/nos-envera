"use client";
import styles from "../../styles/page.module.css";
import Image from "next/image";

export default function Colectivos() {
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
              <h1 style={{fontSize: '2.5rem', fontWeight: '300', marginBottom: '2rem'}}>Colectivos</h1>
              
              <p style={{lineHeight: '1.5rem', textAlign: 'justify', marginTop: '2rem'}}>
                Los colectivos artísticos representan la fuerza colaborativa del arte contemporáneo, donde múltiples voces se unen para crear obras y proyectos que trascienden las perspectivas individuales.
              </p>
              
              <p style={{lineHeight: '1.5rem', textAlign: 'justify'}}>
                En esta sección destacamos colectivos que están redefiniendo el panorama artístico a través de prácticas colaborativas, activismos culturales y propuestas innovadoras que desafían los límites tradicionales del arte.
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



