"use client";
import React from "react";
import styles from "../styles/page.module.css";
import { TransitionLink } from "./TransitionLink";
import { motion } from "framer-motion";

const text =
  "Nos en Vera es un espacio de convergencia y creación colectiva en el campo de la performance. Una plataforma para la investigación, la producción, la exhibición y el desarrollo de prácticas escénicas.";

export default function HomepageIntro() {
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "4rem 1rem",
        minHeight: "30vh",
        gap: "2rem",
      }}
    >
      <motion.p
        className={styles.paragraph}
        style={{
          textAlign: "left",
          maxWidth: "1200px",
          margin: 0,
          fontSize: "2.5rem",
          lineHeight: "2.5rem",
        }}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        {words.map((word, idx) => (
          <motion.span
            key={idx}
            variants={wordVariants}
            style={{ display: "inline-block", whiteSpace: "pre" }}
          >
            {word}
            {idx < words.length - 1 ? " " : ""}
          </motion.span>
        ))}
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
      >
        <TransitionLink
          href="/somos"
          style={{
            textDecoration: "none",
            fontSize: "3rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "#222",
            borderBottom: "1px solid #222",
            textAlign: "left",
            display: "inline-block",
            fontWeight: "600",
          }}
        >
          somos →
        </TransitionLink>
      </motion.div>
    </div>
  );
}
