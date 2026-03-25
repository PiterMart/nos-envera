// Removed "use client" to allow metadata export. State/effects will be moved to child components.
import styles from "../styles/page.module.css";
import React from "react";
import Hero from "../components/Hero";
import { TransitionLink } from "../components/TransitionLink";
import Highlights from "../components/Highlights";
import Video from "../components/Video";

export const metadata = {
  title: "Inicio",
  description: "Nos en Vera es un espacio de convergencia y creación colectiva en el campo de la performance. Una plataforma para la investigación, la producción, la exhibición y el desarrollo de prácticas escénicas.",
  openGraph: {
    title: "Nos en Vera | Espacio de Performance",
    description: "Plataforma para la investigación, producción y exhibición de artes performáticas.",
    images: ["/NV_Logo3D_4.png"],
  },
};

export default function Home() {
  return (
    <div className={styles.page}>
      <Hero />
      <Video />
      <main className={styles.main}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "4rem 1rem", minHeight: "30vh", gap: "2rem" }}>
          <p className={styles.paragraph} style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
            Nos en Vera es un espacio de convergencia y creación colectiva en el campo de la performance. Una plataforma para la investigación, la producción, la exhibición y el desarrollo de prácticas escénicas.
          </p>
          <TransitionLink
            href="/somos"
            style={{
              textDecoration: "none",
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#222",
              borderBottom: "1px solid #222",
              textAlign: "center",
              display: "inline-block",
              textDecoration: 'none'
            }}
          >
            somos →
          </TransitionLink>
          <Highlights />
        </div>
      </main>
    </div>
  );
}