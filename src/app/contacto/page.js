'use client';
import Image from "next/image";
import styles from "../../styles/page.module.css";
import FooterStyles from "../../styles/Footer.module.css";
import MailchimpForm from "../../components/MailchimpForm";

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
          <header className={styles.pageHeader}>
            <h1>CONTACTO</h1>
          </header>
          <p className={styles.pageSubtext}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula ut dictum pharetra, nisi nunc fringilla magna, in commodo elit erat nec turpis. Ut pharetra augue nec augue. Nam elit magna, hendrerit sit amet, tincidunt ac, viverra sed, nulla. Donec porta diam eu massa. Quisque diam lorem, interdum vitae, dapibus ac, scelerisque.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%', marginTop: '2rem' }}>
            {/* Contact Information */}
            <div className={FooterStyles.footerContact}>
              <div>
                <h3 className={FooterStyles.contactTitle} style={{ marginBottom: '1rem' }}>MAIL</h3>
                <div className={FooterStyles.contactInfo}>
                  <p>
                    <a href="mailto:nos.envera@gmail.com">nos.envera@gmail.com</a>
                  </p>
                </div>

                <h3 className={FooterStyles.contactTitle} style={{ marginBottom: '1rem', marginTop: '2rem' }}>INSTAGRAM</h3>
                <div className={FooterStyles.contactInfo}>
                  <a
                    href="https://www.instagram.com/nos.envera/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: 'var(--foreground)', transition: 'color 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#E1306C'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--foreground)'; }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                    </svg>
                    <span style={{ fontSize: '1rem' }}>@nos.envera</span>
                  </a>
                </div>
              </div>
              <MailchimpForm />
            </div>

            {/* Map */}
            {contactInfo.googleMapsEmbed && (
              <div className={FooterStyles.mapContainer}>
                <div>
                  <h3 className={FooterStyles.contactTitle} style={{ marginBottom: '1rem' }}>UBICACIÓN</h3>
                  <div className={FooterStyles.locationInfo}>
                    {contactInfo.address && (
                      <p className={FooterStyles.address}>{contactInfo.address}</p>
                    )}
                  </div>
                </div>
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
