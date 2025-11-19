"use client";
import React, { useState } from 'react';
import styles from '../styles/acquireDialog.module.css';

const AcquireDialog = ({ isOpen, onClose, artwork, artist }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/acquire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          artworkTitle: artwork?.title,
          artistName: artist?.name
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          country: '',
          city: '',
          message: ''
        });
        // Close dialog after 2 seconds
        setTimeout(() => {
          onClose();
          setSubmitStatus(null);
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <button
          onClick={onClose}
          className={styles.closeButton}
        >
          ×
        </button>

        <h2 className={styles.title}>
          Adquirir &ldquo;{artwork?.title}&rdquo;
        </h2>

        {artist && (
          <p className={styles.subtitle}>
            por {artist.name}
          </p>
        )}

        {submitStatus === 'success' && (
          <div className={`${styles.alert} ${styles.alertSuccess}`}>
            ¡Gracias por tu interés! Te contactaremos pronto.
          </div>
        )}

        {submitStatus === 'error' && (
          <div className={`${styles.alert} ${styles.alertError}`}>
            Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Nombre completo <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Correo electrónico <span className={styles.required}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Número de teléfono <span style={{ fontWeight: "200", color: "#707984"}} >(opcional)</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                País <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Ciudad <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Mensaje
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows="4"
              placeholder="Cuéntanos sobre tu interés en esta obra..."
              className={styles.textarea}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar consulta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcquireDialog;
