"use client";
import styles from "../../styles/page.module.css";

export default function Contact() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div style={{ padding: "10rem 1rem 1rem 1rem", margin: "auto" }}>
          
          <div className={styles.page_container} style={{ marginTop: "7rem", margin: 'auto' }}>
            <div className={styles.sedes} style={{justifyContent: 'center', gap: '1.5rem'}}>
              <p style={{fontSize: '3.5rem', fontWeight: '300', lineHeight: '4rem'}}>CONTACT US</p>
              <div className={styles.sedeCard}>
              <p><a href="mailto:info@artwings.art">info@artwings.art</a></p>
                    <p><a href="tel:+491721736434">+49 172 1736434</a></p>
                    <p><a href="https://www.instagram.com/artwings111/" target="_blank" rel="noopener noreferrer">@artwings111</a></p>
                <div className={styles.sedeCardText} style={{ height: "auto", width: "auto"}}>
                  <p style={{fontSize: '2.5rem', fontWeight: '300', lineHeight: '4rem'}}>Direktorenhaus</p>
                  <div style={{display: 'flex', flexDirection: 'column', fontSize: '1rem'}}>
                    <p>Am Krögel 2, 10179 Berlin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
