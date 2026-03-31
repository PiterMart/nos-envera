"use client";

import React, { useState, useEffect } from "react";
import modalStyles from "../styles/agendaRedirect.module.css";
import { TransitionLink } from "./TransitionLink";

export default function AgendaRedirect() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Open slightly delayed after mount to trigger the slide-up animation
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 400); // matches the CSS slideDown duration
  };

  if (!isOpen) return null;

  return (
    <div className={modalStyles.overlay}>
      <div className={`${modalStyles.modal} ${isClosing ? modalStyles.closing : ''}`} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleClose}
          className={modalStyles.closeButton}
          aria-label="Cerrar"
        >
          ×
        </button>
        <p className={modalStyles.modalTitle}>
          Próximos Eventos
        </p>
        <TransitionLink
          href="/agenda"
          className={modalStyles.modalLink}
          onClick={handleClose}
        >
          AGENDA →
        </TransitionLink>
      </div>
    </div>
  );
}
