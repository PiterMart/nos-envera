import { useState, useEffect } from 'react';
import styles from '../styles/LoadingScreen.module.css';

export default function LoadingScreen({ onLoadingComplete, isLoading = true }) {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          onLoadingComplete?.();
        }, 500);
      }, 500);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFading(true);
            setTimeout(() => {
              onLoadingComplete?.();
            }, 500);
          }, 500);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onLoadingComplete, isLoading]);

  return (
    <div className={`${styles.loadingContainer} ${isFading ? styles.fadeOut : ''}`}>
      <div className={styles.logoContainer}>
        <img 
          src="/artwingslogo.png" 
          alt="ARTWINGS Logo" 
          className={styles.logo}
        />
      </div>
      <div className={styles.progressBarContainer}>
        <div 
          className={styles.progressBar} 
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* <div className={styles.progressText}>{progress}%</div> */}
    </div>
  );
} 