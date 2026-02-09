import { useEffect, useState } from 'react';
import styles from '../styles/LoadingScreen.module.css';

export default function LoadingScreen({ onLoadingComplete, isLoading = true }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsFadingOut(true);

      const timeout = setTimeout(() => {
        onLoadingComplete?.();
      }, 600);

      return () => clearTimeout(timeout);
    }
  }, [isLoading, onLoadingComplete]);

  return (
    <div
      className={`${styles.loadingContainer} ${
        isFadingOut ? styles.fadeOut : ''
      }`}
    >
    </div>
  );
}