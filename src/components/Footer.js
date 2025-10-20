import Link from "next/link";
import styles from "../styles/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* <h2>ARTWINGS</h2>
        <p>Redefining artistic boundaries in Berlin and beyond</p> */}
        <div className={styles.footerLinks}>
          <Link href="/artists">Artists</Link>
          <Link href="/exhibitions">Exhibitions</Link>
          <Link href="/fairs">Fairs</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
