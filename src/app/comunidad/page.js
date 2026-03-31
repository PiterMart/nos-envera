import React from "react";
import Image from "next/image";
import styles from "../../styles/page.module.css";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import AnimatedPageSection from "../../components/AnimatedPageSection";
import ComunidadClient from "./ComunidadClient";

export const metadata = {
  title: "Comunidad | Red Artística",
  description: "Explora el mapa de la comunidad Nos en Vera: artistas, investigadorxs y colaboradorxs que dan vida a nuestro espacio.",
};

async function getMembers() {
  try {
    const membersQuery = query(collection(firestore, "members"), orderBy("name", "asc"));
    const snapshot = await getDocs(membersQuery);
    return snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data?.name ?? docSnap.id,
          slug: data?.slug,
          team: data?.team,
        };
      })
      .filter((m) => m.name);
  } catch (err) {
    console.error("Error fetching members on server:", err);
    return [];
  }
}

export default async function ComunidadPage() {
  const members = await getMembers();

  return (
    <div className={styles.page} style={{ position: "relative", minHeight: "100vh", zIndex: 1 }}>
      <div className={styles.page_container} style={{ position: "relative", zIndex: 2 }}>
        <AnimatedPageSection
          title="COMUNIDAD"
          subtext="Esta sección reúne las biografías de artistas, investigadorxs y colaboradorxs que mantienen activo Nos en Vera, como un mapa de la comunidad que lo hace posible."
          loaded={true}
        />

        <div className={styles.homepage_container} style={{ paddingTop: "0" }}>
          <div className={styles.comunidadWrapper}>
            <ComunidadClient memberNames={members} />
          </div>
        </div>

        <div style={{ width: "100%", marginTop: "2rem", marginBottom: "2rem" }}>
          <Image
            src="/23 PRACTICAS DE SINCRONIZ - perfo.jpg"
            alt="23 Prácticas de sincronización"
            width={1200}
            height={800}
            style={{ width: "100%", height: "auto", display: "block" }}
            className={styles.image_container}
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
      </div>
    </div>
  );
}