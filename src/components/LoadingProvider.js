"use client";

import { useState, useEffect, useRef } from 'react';
import LoadingScreen from './LoadingScreen';

export default function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const hasInitialLoad = useRef(false);

  useEffect(() => {
    // Only run loading screen on first mount (initial page load), not on route changes
    if (hasInitialLoad.current) return;
    hasInitialLoad.current = true;

    const timer = setTimeout(() => {
      setContentLoaded(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && (
        <LoadingScreen
          onLoadingComplete={handleLoadingComplete}
          isLoading={!contentLoaded}
        />
      )}
      {children}
    </>
  );
}
