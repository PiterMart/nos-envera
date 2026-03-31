import Image from "next/image";
import AnimatedPageHeader from "../../components/AnimatedPageHeader";

export const metadata = {
  title: "Historia | Artwings",
  description: "Descubre la evolución de ARTWINGS: nuestra misión de conectar el arte contemporáneo con el impacto social.",
};

export default function Historia() {
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
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', margin: "auto", marginTop: '5rem'}}>
              <AnimatedPageHeader loaded={true}>HISTORIA</AnimatedPageHeader>
              
              <p style={{lineHeight: '1.5rem', textAlign: 'justify', marginTop: '2rem'}}>
                La historia de ARTWINGS está marcada por la evolución de una visión que conecta el arte contemporáneo con el impacto social, creando puentes entre la expresión creativa y la transformación colectiva.
              </p>
              
              <p style={{lineHeight: '1.5rem', textAlign: 'justify'}}>
                Desde nuestros inicios, hemos trabajado para establecer un espacio donde artistas emergentes y voces alternativas encuentren una plataforma para compartir sus narrativas íntimas y desafiar las convenciones del mundo del arte establecido.
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
