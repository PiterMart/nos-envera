"use client";
import React from 'react';
import Image from 'next/image';
import { TransitionLink } from './TransitionLink';

export default function SalaRedirect() {
  return (
    <div style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)", padding: "4rem 0", display: "flex", flexDirection: "column", gap: "2rem", alignItems: "center" }}>
      <div style={{ width: "100%", position: "relative", height: "60vh", overflow: "hidden" }}>
        <Image
          src="/espacio/SalaNosEnvera3.jpg"
          alt="Espacio Nos en Vera - Sala"
          fill
          style={{ objectFit: "cover" }}
          sizes="100vw"
          priority
        />
      </div>
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
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
            textAlign: "center"
          }}
        >
          sala →
        </TransitionLink>
      </div>
    </div>
  );
}
