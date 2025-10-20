import React, { useState } from "react";
import styles from "../../../styles/page.module.css";
import Image from "next/image";

const PictureLayout = ({ slide }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0); 

  const handleImageClick = () => {
    setPhotoIndex(0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className={styles.artist_page_image_container}>
        <Image
          src={slide.image}
          alt={slide.title}
          style={{ width: "100%", cursor: "pointer" }} 
          onClick={handleImageClick} 
          width={0}
          height={0}
          sizes="100vw"
          placeholder="empty"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default PictureLayout;
