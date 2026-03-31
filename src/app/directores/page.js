import Image from "next/image";
import AnimatedPageHeader from "../../components/AnimatedPageHeader";

export const metadata = {
  title: "Directores | Artwings",
  description: "Conoce a los directores de ARTWINGS, visionarios que guían la dirección curatorial y estratégica de nuestro espacio.",
};

export default function Directores() {
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
              <AnimatedPageHeader loaded={true}>DIRECTORES</AnimatedPageHeader>
              
              <p style={{lineHeight: '1.5rem', textAlign: 'justify', marginTop: '2rem'}}>
                Los directores de ARTWINGS son visionarios del arte contemporáneo que guían la dirección curatorial y estratégica de nuestro espacio.
              </p>
              
              <p style={{lineHeight: '1.5rem', textAlign: 'justify'}}>
                Con años de experiencia en el mundo del arte, nuestros directores aportan una perspectiva única que combina innovación artística con compromiso social, liderando la transformación del panorama cultural.
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
