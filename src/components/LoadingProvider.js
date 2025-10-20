"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LoadingScreen from './LoadingScreen';

export default function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Reset loading state on route change
    setIsLoading(true);
    setContentLoaded(false);
    
    // Simulate content loading
    const timer = setTimeout(() => {
      setContentLoaded(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname]);

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
