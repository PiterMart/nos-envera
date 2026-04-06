"use client";
import React from 'react';
import Image from 'next/image';
import { TransitionLink } from './TransitionLink';

export default function SalaRedirect() {
  return (
    <div style={{ width: "100%", padding: "4rem 0", display: "flex", flexDirection: "column", gap: "2rem", alignItems: "flex-start" }}>
      <div style={{ width: "100%", position: "relative", height: "450px", borderRadius: "10px", overflow: "hidden" }}>
        <Image
          src="/espacio/NosEnvera-Fabrica1.jpg"
          alt="Espacio Nos en Vera - Sala"
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 100vw, 1200px"
        />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
        <TransitionLink
          href="/sala"
          style={{
            textDecoration: "none",
            fontSize: "3rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "#222",
            borderBottom: "1px solid #222",
            display: "inline-block",
            fontWeight: "600",
          }}
        >
          sala →
        </TransitionLink>
      </div>
    </div>
  );
}
