'use client';

import React from 'react';

/**
 * Wraps page content so the View Transitions API can animate it.
 * Give the wrapper a view-transition-name so the browser captures old/new states.
 */
export default function PageTransitionWrapper({ children }) {
  return (
    <div
      style={{
        viewTransitionName: 'page-content',
        width: '100%',
        minHeight: '100%',
      }}
    >
      {children}
    </div>
  );
}
