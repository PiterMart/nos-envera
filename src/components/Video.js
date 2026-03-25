'use client';
import { useRef, useEffect, useState } from 'react';
import styles from '../styles/Video.module.css';
import Image from 'next/image';
import Banner from './Banner';
import Section1 from './Section1';

export default function Video({ children }) {
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const mainVideo = videoRef.current;

    if (mainVideo) {
      mainVideo.playbackRate = 1.0;
      const handleCanPlay = () => {
        setVideoLoaded(true);
      };
      const handleError = () => {
        console.error('Error loading video, displaying fallback image.');
        setVideoLoaded(false);
      };

      mainVideo.addEventListener('canplaythrough', handleCanPlay);
      mainVideo.addEventListener('error', handleError);

      return () => {
        mainVideo.removeEventListener('canplaythrough', handleCanPlay);
        mainVideo.removeEventListener('error', handleError);
      };
    }
  }, []);

  return (
    <div className={styles.videoWrapper}>
      {/* Main video background - first 100vh */}
      <div className={styles.videoContainer}>
        {/* {!videoLoaded && (
          <Image
            src="/Zytnax_knight_duomodimilano32.jpg"
            alt="Zyntax Knight"
            fill
            className={styles.fallbackImage}
            priority
          />
        )} */}

        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className={`${styles.backgroundVideo} ${videoLoaded ? styles.videoLoaded : ''}`}
        >
          <source src="/resumen nv para web.mp4" type="video/mp4" />
        </video>

        {/* Overlay and interactive elements go here */}
        {children}
      </div>

      {/* Banner overlapping bottom of video */}
      {/* <Banner /> */}

      {/* Section: What can I help you with? */}
      {/* <Section1 /> */}

    </div>
  );
}


