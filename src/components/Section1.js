'use client';
import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import styles from '../styles/Section1.module.css';
import pageStyles from '../styles/page.module.css';
import AnimatedPageHeader from './AnimatedPageHeader';

export default function Section1() {
  const [loaded, setLoaded] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setLoaded(true);
      },
      { threshold: 0.2 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div ref={headerRef} style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
          <AnimatedPageHeader loaded={loaded}>SOMOS</AnimatedPageHeader>
        </div>
        <p className={pageStyles.pageSubtext} style={{ marginBottom: '2rem', maxWidth: '1000px' }}>
          Nos en Vera es un espacio de convergencia y creación colectiva en el campo de la performance. Una plataforma para la investigación, la producción, la exhibición y el desarrollo de prácticas escénicas.
        </p>
        <div className={styles.imageWrapper}>
          <Image
            src="/SomosNosEnvera.jpg"
            alt="Section image"
            width={600}
            height={800}
            className={styles.image}
            priority
          />
        </div>
        <p className={styles.paragraph}>
          Fundado por Dominique Melhem en 2023 en el barrio de Villa Crespo, Ciudad Autónoma de Buenos Aires, Nos en Vera es un espacio de investigación en artes y prácticas performativas, dedicado a la producción, exhibición y el desarrollo artístico. Una plataforma para la experimentación y el cruce de lenguajes, que busca generar nuevas relaciones dentro del universo de las artes escénicas, fomentando el intercambio y la colaboración entre artistas de diversas disciplinas.
        </p>
        <p className={styles.paragraph}>
          Nos en Vera se consolidó como un punto de encuentro entre la comunidad local, artistas nacionales e internacionales, promoviendo la visibilización de creadorxs tanto emergentes como de trayectoria. A través de un enfoque que privilegia la investigación y el proceso artístico, ofrece residencias de creación, donde las premisas son definidas por los propios artistas en función de sus intereses e inquietudes.
        </p>
        <p className={styles.paragraph}>
          Además, en su área de formación, Nos en Vera es sede de seminarios, talleres, laboratorios y prácticas colectivas abiertas, diseñados para ampliar el acceso a experiencias artísticas innovadoras y fortalecer redes de intercambio. Nuestra sala de prácticas funciona como un laboratorio, donde se materializan y exploran nuevas formas de producción artística, promoviendo la afectación mutua en el diálogo entre cuerpos y territorios.
        </p>
        <p className={styles.paragraph}>
          Comprometidxs con el desarrollo de estrategias innovadoras que respondan a los desafíos de nuestro tiempo, impulsamos programas de residencias y eventos públicos, generando espacios de encuentro que potencien el diálogo, la reflexión y la experimentación dentro de la escena independiente local e internacional.
        </p>
      </div>
    </section>
  );
}
