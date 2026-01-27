'use client';
import styles from "../../styles/page.module.css";
import FooterStyles from "../../styles/Footer.module.css";

export default function Contacto() {
  const contactInfo = {
    address: 'Vera 1350, CABA',
    instagram: 'https://www.instagram.com/nos.envera/',
    googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3186.1273239064344!2d-58.44721922424102!3d-34.591744056866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb514ed5492fd%3A0x41f3b6a42bf47ba4!2sNos%20en%20Vera!5e1!3m2!1ses!2sar!4v1762973636288!5m2!1ses!2sar',
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.page_container}>
          <header className={styles.pageHeaderSmall}>
            <h1>Contacto</h1>
          </header>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%', maxWidth: '1200px', margin: 'auto', marginTop: '2rem' }}>
            {/* Contact Information */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              <div>
                <h3 className={FooterStyles.contactTitle} style={{ marginBottom: '1rem' }}>CONTACTO</h3>
                <div className={FooterStyles.contactInfo}>
                  {contactInfo.instagram && (
                    <p>
                      <a 
                        href={contactInfo.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={FooterStyles.contactLink}
                      >
                        @nos.envera
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className={FooterStyles.contactTitle} style={{ marginBottom: '1rem' }}>UBICACIÓN</h3>
                <div className={FooterStyles.locationInfo}>
                  {contactInfo.address && (
                    <p className={FooterStyles.address}>{contactInfo.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Map */}
            {contactInfo.googleMapsEmbed && (
              <div className={FooterStyles.mapContainer}>
                <iframe
                  src={contactInfo.googleMapsEmbed}
                  width="100%"
                  height="400"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Nos en Vera - Ubicación"
                ></iframe>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
