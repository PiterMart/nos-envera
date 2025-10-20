"use client";
import ArtistsList from "../firebase/ArtistsList";
import styles from "../../styles/page.module.css";

export default function ArtistsListPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main} style={{ maxWidth: "1500px", paddingTop: "10rem" }}>
        <div style={{ width: "100%", padding: "1rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
          <p className={styles.title}>ALL ARTISTS</p>
          <ArtistsList />
        </div>
      </main>
    </div>
  );
}
