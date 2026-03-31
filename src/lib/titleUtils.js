import React from 'react';

const SYLLABLE_MAP = {
  "PERFORMANCE": ["PERFOR", "MANCE"],
  "COMUNIDAD": ["COMU", "NIDAD"],
  "FORMACIONES": ["FORMA", "CIÓNES"],
  "FORMACIÓN": ["FORMA", "CIÓ", "NES"],
  "FORMACION": ["FORMA", "CIÓ", "NES"],
  "RESIDENCIAS": ["RESI", "DENCIAS"],
};

/**
 * Utility to format titles with custom syllabic breaking for mobile stacking.
 * @param {string} title - The title text to format.
 * @param {string} className - The CSS class for syllables (defaults to 'syllable').
 * @returns {React.ReactNode} - React node with syllables wrapped in spans.
 */
export function formatSyllabicTitle(title, className = 'syllable') {
  if (typeof title !== 'string') return title;

  const upperTitle = title.toUpperCase().trim();
  if (SYLLABLE_MAP[upperTitle]) {
    return SYLLABLE_MAP[upperTitle].map((syllable, index) => (
      <span key={index} className={className}>{syllable}</span>
    ));
  }

  return title;
}
