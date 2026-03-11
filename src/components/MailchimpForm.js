'use client';

import { useState } from 'react';
import styles from '../styles/Footer.module.css';

const MAILCHIMP_URL = 'https://gmail.us18.list-manage.com/subscribe/post?u=96cff0e772c40ecd0ddc1fa1a&id=d187ceb44e&f_id=001aa8e6f0';

export default function MailchimpForm({ compact = false }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      e.preventDefault();
      setStatus('error');
      return;
    }
    setStatus('success');
  };

  return (
    <div>
      {!compact && (
        <>
          <h3 className={styles.contactTitle} style={{ marginBottom: '1rem' }}>SUSCRIBITE A NUESTRO NEWSLETTER</h3>
          <p style={{ fontFamily: 'var(--font-paragraph)', fontStyle: 'italic', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem', color: 'var(--foreground)' }}>
            Recibí novedades sobre exposiciones y eventos.
          </p>
        </>
      )}
      <form
        action={MAILCHIMP_URL}
        method="post"
        target="_blank"
        noValidate
        onSubmit={handleSubmit}
        className={styles.newsletterForm}
      >
        <input
          type="email"
          name="EMAIL"
          required
          placeholder="Tu email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus(null); }}
          className={compact ? styles.newsletterInput : styles.newsletterInputFull}
        />
        <div aria-hidden="true" style={{ position: 'absolute', left: '-5000px' }}>
          <input type="text" name="b_96cff0e772c40ecd0ddc1fa1a_d187ceb44e" tabIndex="-1" defaultValue="" />
        </div>
        <button
          type="submit"
          className={compact ? styles.newsletterButton : styles.newsletterButtonFull}
        >
          Suscribir
        </button>
      </form>
      {status === 'error' && (
        <p className={`${styles.newsletterMessage} ${styles.newsletterMessageError}`}>
          Por favor, ingresá un email válido.
        </p>
      )}
      {status === 'success' && (
        <p className={`${styles.newsletterMessage} ${styles.newsletterMessageSuccess}`}>
          ¡Gracias! Revisá tu casilla para confirmar la suscripción.
        </p>
      )}
    </div>
  );
}
