"use client"
import { useEffect, useState, useRef } from "react";
import { firestore, storage } from "./firebaseConfig";
import { getDocs, collection, doc, updateDoc, Timestamp, getDoc, setDoc } from "firebase/firestore";  
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../../styles/uploader.module.css";
import { deleteObject } from "firebase/storage";
import imageCompression from 'browser-image-compression';

export default function PerformanceUploader() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [artistCatalog, setArtistCatalog] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [communityMembers, setCommunityMembers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    subtitle: "",
    description: [],
    isFeatured: false,
    directors: [],
    artists: [],
    dates: [{ date: null, time: "" }],
    address: "",
    googleMapsLink: "",
    slug: "",
  });
  const [existingGallery, setExistingGallery] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imageDescriptions, setImageDescriptions] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [deletedExistingImages, setDeletedExistingImages] = useState([]);
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [flyerImage, setFlyerImage] = useState(null);
  const [flyerPreview, setFlyerPreview] = useState(null);
  const [directorInput, setDirectorInput] = useState("");
  const [artistInput, setArtistInput] = useState("");
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const flyerInputRef = useRef(null);
  
  // Drag and drop states
  const [isBannerDragOver, setIsBannerDragOver] = useState(false);
  const [isFlyerDragOver, setIsFlyerDragOver] = useState(false);
  const [isGalleryDragOver, setIsGalleryDragOver] = useState(false);

  // Compression options reference
  const compressionOptions = {
    maxSizeMB: 3,       // Maximum file size in MB
    maxWidthOrHeight: 1920, // Maximum dimension (width/height)
    useWebWorker: true,   // Use web worker for better performance
    fileType: 'image/webp', // Optional: convert to webp
    initialQuality: 1,  // Optional: initial quality (0-1)
  };

  /*  FETCHING STUFF */
  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const artistSnapshot = await getDocs(collection(firestore, "artists"));
        const catalog = artistSnapshot.docs.map((doc) => ({
          id: doc.id,
          slug: doc.id,
          ...doc.data(),
        }));

        setArtistCatalog(catalog);
      } catch (error) {
        console.error("Error fetching artist data:", error);
      }
    };

    const fetchPerformances = async () => {
      try {
        const performancesSnapshot = await getDocs(collection(firestore, "performances"));
        const performancesList = performancesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPerformances(performancesList);
      } catch (error) {
        console.error("Error fetching performances:", error);
      }
    };

    const fetchCommunityMembers = async () => {
      try {
        const membersSnapshot = await getDocs(collection(firestore, "members"));
        const membersList = membersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCommunityMembers(membersList);
      } catch (error) {
        console.error("Error fetching community members:", error);
      }
    };

    fetchArtistData();
    fetchPerformances();
    fetchCommunityMembers();
  }, []);
  

  const getArtistNameFromCatalog = (slug) => {
    if (!slug) return "";
    const found = artistCatalog.find((artist) => artist.slug === slug || artist.id === slug);
    const candidate = found?.name || found?.fullName || slug;
    return typeof candidate === "string" ? candidate.trim() : slug;
  };


  /* HANDLERS */

  const deleteImageFromStorage = async (imageUrl) => {
    try {
      // Extract the storage path from the download URL
      // Firebase Storage URLs have the format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
      const urlObj = new URL(imageUrl);
      const pathParts = urlObj.pathname.split('/o/');
      
      if (pathParts.length < 2) {
        console.error("Invalid Firebase Storage URL format:", imageUrl);
        return;
      }
      
      const pathEncoded = pathParts[1];
      const path = decodeURIComponent(pathEncoded);
      
      const imageRef = ref(storage, path);
      await deleteObject(imageRef);
      console.log("Successfully deleted image from storage:", path);
    } catch (error) {
      console.error("Error deleting image from storage:", imageUrl, error);
      // Don't throw error - allow the operation to continue even if deletion fails
    }
  };

  const handlePerformanceSelection = async (performanceId) => {
    setSelectedPerformance(performanceId);
    if (!performanceId) {
      resetForm();
      return;
    }
  
    try {
      const performanceDoc = await getDoc(doc(firestore, "performances", performanceId));
      if (performanceDoc.exists()) {
        const data = performanceDoc.data();
        
        const mappedDates = Array.isArray(data.dates)
          ? data.dates
              .map((entry) => ({
                date: entry?.date
                  ? entry.date.toDate
                    ? entry.date.toDate()
                    : new Date(entry.date)
                  : null,
                time: entry?.time || "",
              }))
              .filter((entry) => entry.date instanceof Date && !isNaN(entry.date.getTime()) || entry.time)
          : [];

        const fallbackDates = mappedDates.length > 0
          ? mappedDates
          : [
              {
                date: data.openingDate?.toDate
                  ? data.openingDate.toDate()
                  : data.openingDate
                  ? new Date(data.openingDate)
                  : null,
                time: data.receptionTime || "",
              },
            ];

        const mappedDirectors = Array.isArray(data.directors)
          ? data.directors
              .map((entry) => ({
                memberId: entry?.memberId || null,
                name: (entry?.name || "").trim(),
              }))
              .filter((entry) => entry.name)
          : [];

        const fallbackDirectors = mappedDirectors.length > 0
          ? mappedDirectors
          : data.curator
          ? [{ memberId: null, name: String(data.curator).trim() }]
          : [];

        const mappedArtists = Array.isArray(data.artists)
          ? data.artists
              .map((entry) => {
                if (!entry) return null;
                if (typeof entry === "string") {
                  const name = entry.trim();
                  return name ? { memberId: null, name } : null;
                }

                const explicitName = (entry.name || entry.artistName || "").trim();
                const legacySlug = entry.artistSlug || entry.slug || entry.id;
                const resolvedName = explicitName || getArtistNameFromCatalog(legacySlug);

                if (!resolvedName) {
                  return null;
                }

                return {
                  memberId: entry.memberId || null,
                  name: resolvedName,
                };
              })
              .filter((entry) => entry && entry.name)
          : [];

        const fallbackArtists = mappedArtists.length > 0 ? mappedArtists : [];

        // Combine all form data into a single setFormData call
        setFormData({
          name: data.name,
          subtitle: data.subtitle || "",
          description: data.description || [],
          isFeatured: data.isFeatured || false,
          dates:
            fallbackDates.filter((entry) => entry.date instanceof Date && !isNaN(entry.date.getTime()) || entry.time).length > 0
              ? fallbackDates.map((entry) => ({
                  date: entry.date instanceof Date && !isNaN(entry.date.getTime()) ? entry.date : null,
                  time: entry.time || "",
                }))
              : [{ date: null, time: "" }],
          directors: fallbackDirectors,
          artists: fallbackArtists,
          address: data.address || "",
          googleMapsLink: data.googleMapsLink || "",
          slug: data.slug || generateSlug(data.name),
        });
        setDirectorInput("");
        setArtistInput("");
  
        const existingGalleryData = data.gallery || [];
        setExistingGallery(existingGalleryData);
        setImagePreviews(existingGalleryData.map(img => img.url));
        setImageDescriptions(existingGalleryData.map(img => img.description || ''));
        setBannerPreview(data.banner || null);
        setFlyerPreview(data.flyer || null);
      }
    } catch (error) {
      console.error("Error loading performance data:", error);
      setError("No se pudo cargar la performance.");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { name, dates } = formData;
      const sanitizedDates = (dates || [])
        .map((entry) => ({
          date: entry?.date ? new Date(entry.date) : null,
          time: entry?.time ? entry.time.trim() : "",
        }))
        .filter((entry) => entry.date instanceof Date && !isNaN(entry.date.getTime()) || entry.time);

      if (!name || sanitizedDates.length === 0) {
        throw new Error("Por favor agrega al menos una fecha y horario validos.");
      }

      if (sanitizedDates.some((entry) => !(entry.date instanceof Date) || isNaN(entry.date.getTime()) || !entry.time)) {
        throw new Error("Cada funcion debe tener una fecha y un horario.");
      }

      const slug = generateSlug(name);
      
      // Generate performance ID - use existing ID if updating, otherwise create new one
      const performanceId = selectedPerformance || doc(collection(firestore, "performances")).id;

      let bannerUrl;
      try {
        bannerUrl = await uploadBannerImage(performanceId);
      } catch (error) {
        throw new Error("La imagen del banner no se pudo procesar: " + error.message);
      }

      let flyerUrl;
      try {
        flyerUrl = await uploadFlyerImage(performanceId);
      } catch (error) {
        throw new Error("El flyer no se pudo procesar: " + error.message);
      }
  
      let galleryData = [];
      try {
        if (newImages.length > 0 || deletedExistingImages.length > 0) {
          galleryData = await uploadImages(performanceId);
        } else if (selectedPerformance) {
          galleryData = existingGallery;
        }
      } catch (error) {
        throw new Error("La galeria no se pudo procesar: " + error.message);
      }

      const directorsSanitized = (formData.directors || [])
        .map((entry) => ({
          memberId: entry?.memberId || null,
          name: (entry?.name || "").trim(),
        }))
        .filter((entry) => entry.name);

      const artistsSanitized = (formData.artists || [])
        .map((entry) => ({
          memberId: entry?.memberId || null,
          name: (entry?.name || "").trim(),
        }))
        .filter((entry) => entry.name);

      const performanceData = {
        ...formData,
        slug,
        banner: bannerUrl,
        flyer: flyerUrl,
        gallery: galleryData,
        dates: sanitizedDates.map((entry) => ({
          date: Timestamp.fromDate(new Date(entry.date)),
          time: entry.time,
        })),
        directors: directorsSanitized,
        artists: artistsSanitized,
        openingDate: null,
        closingDate: null,
        receptionDate: null,
        receptionTime: "",
      };

      if (selectedPerformance) {
        await updateDoc(doc(firestore, "performances", selectedPerformance), performanceData);
        if (deletedExistingImages.length > 0) {
          await Promise.all(
            deletedExistingImages.map(url => 
              deleteImageFromStorage(url).catch(error => {
                console.error("Failed to delete image:", url, error);
              })
            )
          );
        }
        setSuccess("¡Performance actualizada con exito!");
      } else {
        // Use setDoc instead of addDoc to use the pre-generated ID
        await setDoc(doc(firestore, "performances", performanceId), performanceData);
        setSuccess("¡Performance creada con exito!");
      }

      resetForm();
      setDeletedExistingImages([]);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "No se pudo guardar la performance.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
    
    // Create previews for new images only
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    // Initialize descriptions for new images
    setImageDescriptions(prev => [...prev, ...Array(files.length).fill('')]);
  };

  const handleScheduleDateChange = (index, date) => {
    setFormData((prev) => {
      const updatedDates = [...(prev.dates || [])];
      updatedDates[index] = {
        ...updatedDates[index],
        date: date || null,
      };
      return { ...prev, dates: updatedDates };
    });
  };

  const handleScheduleTimeChange = (index, time) => {
    setFormData((prev) => {
      const updatedDates = [...(prev.dates || [])];
      updatedDates[index] = {
        ...updatedDates[index],
        time: time || "",
      };
      return { ...prev, dates: updatedDates };
    });
  };

  const addScheduleEntry = () => {
    setFormData((prev) => ({
      ...prev,
      dates: [...(prev.dates || []), { date: null, time: "" }],
    }));
  };

  const removeScheduleEntry = (index) => {
    setFormData((prev) => ({
      ...prev,
      dates: (() => {
        const remaining = (prev.dates || []).filter((_, i) => i !== index);
        return remaining.length > 0 ? remaining : [{ date: null, time: "" }];
      })(),
    }));
  };

  const handleManualDirectorAdd = () => {
    const name = directorInput.trim();
    if (!name) return;
    setFormData((prev) => ({
      ...prev,
      directors: [...(prev.directors || []), { memberId: null, name }],
    }));
    setDirectorInput("");
  };

  const handleCommunityDirectorAdd = (memberId) => {
    if (!memberId) return;
    const member = communityMembers.find((m) => m.id === memberId);
    if (!member) return;
    setFormData((prev) => {
      const alreadyIncluded = (prev.directors || []).some((director) => director.memberId === memberId);
      if (alreadyIncluded) {
        return prev;
      }
      return {
        ...prev,
        directors: [...(prev.directors || []), { memberId, name: member.name || member.slug || member.id }],
      };
    });
  };

  const handleDirectorRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      directors: (prev.directors || []).filter((_, i) => i !== index),
    }));
  };

  const availableCommunityDirectors = communityMembers.filter(
    (member) => !(formData.directors || []).some((director) => director.memberId === member.id)
  );

  const handleManualArtistAdd = () => {
    const name = artistInput.trim();
    if (!name) return;
    setFormData((prev) => ({
      ...prev,
      artists: [...(prev.artists || []), { memberId: null, name }],
    }));
    setArtistInput("");
  };

  const handleCommunityArtistAdd = (memberId) => {
    if (!memberId) return;
    const member = communityMembers.find((m) => m.id === memberId);
    if (!member) return;
    setFormData((prev) => {
      const alreadyIncluded = (prev.artists || []).some((artist) => artist.memberId === memberId);
      if (alreadyIncluded) {
        return prev;
      }
      return {
        ...prev,
        artists: [...(prev.artists || []), { memberId, name: member.name || member.slug || member.id }],
      };
    });
  };

  const handleArtistRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      artists: (prev.artists || []).filter((_, i) => i !== index),
    }));
  };

  const availableCommunityArtists = communityMembers.filter(
    (member) => !(formData.artists || []).some((artist) => artist.memberId === member.id)
  );

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleBannerFile(file);
    }
  };

  const handleFlyerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFlyerFile(file);
    }
  };

  // Banner Drag and Drop Handlers
  const handleBannerFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setBannerImage(file);
      setBannerPreview(URL.createObjectURL(file));
    } else {
      setError('Selecciona un archivo de imagen valido para el banner.');
    }
  };

  const handleBannerDragOver = (e) => {
    e.preventDefault();
    setIsBannerDragOver(true);
  };

  const handleBannerDragLeave = (e) => {
    e.preventDefault();
    setIsBannerDragOver(false);
  };

  const handleBannerDrop = (e) => {
    e.preventDefault();
    setIsBannerDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleBannerFile(files[0]);
    }
  };

  // Flyer Drag and Drop Handlers
  const handleFlyerFile = (file) => {
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      setFlyerImage(file);
      setFlyerPreview(URL.createObjectURL(file));
    } else {
      setError('Selecciona un archivo de imagen o video valido para el flyer.');
    }
  };

  const handleFlyerDragOver = (e) => {
    e.preventDefault();
    setIsFlyerDragOver(true);
  };

  const handleFlyerDragLeave = (e) => {
    e.preventDefault();
    setIsFlyerDragOver(false);
  };

  const handleFlyerDrop = (e) => {
    e.preventDefault();
    setIsFlyerDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFlyerFile(files[0]);
    }
  };

  // Gallery Drag and Drop Handlers
  const handleGalleryDragOver = (e) => {
    e.preventDefault();
    setIsGalleryDragOver(true);
  };

  const handleGalleryDragLeave = (e) => {
    e.preventDefault();
    setIsGalleryDragOver(false);
  };

  const handleGalleryDrop = (e) => {
    e.preventDefault();
    setIsGalleryDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      setNewImages(prev => [...prev, ...files]);
      
      // Create previews for new images only
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      
      // Initialize descriptions for new images
      setImageDescriptions(prev => [...prev, ...Array(files.length).fill('')]);
    }
  };

  const uploadBannerImage = async (performanceId) => {
    if (!bannerImage) return bannerPreview;
  
    try {
      const compressedFile = await imageCompression(bannerImage, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 2000,
        useWebWorker: true,
      });
  
      const bannerRef = ref(storage, `performances/${performanceId}/images/${performanceId}_banner`);
      await uploadBytes(bannerRef, compressedFile);
      return await getDownloadURL(bannerRef);
    } catch (error) {
      console.error("Error compressing banner image:", error);
      throw new Error("Banner image upload failed");
    }
  };

  const uploadFlyerImage = async (performanceId) => {
    if (!flyerImage) return flyerPreview;
  
    try {
      // Check if it's a video file
      const isVideo = flyerImage.type.startsWith('video/');
      const fileExtension = isVideo ? flyerImage.name.split('.').pop() : 'webp';
      
      if (isVideo) {
        // For videos, upload without compression
        const flyerRef = ref(storage, `performances/${performanceId}/flyer/${performanceId}_flyer.${fileExtension}`);
        await uploadBytes(flyerRef, flyerImage);
        return await getDownloadURL(flyerRef);
      } else {
        // For images, compress
        const compressedFile = await imageCompression(flyerImage, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1500,
          useWebWorker: true,
        });
  
        const flyerRef = ref(storage, `performances/${performanceId}/flyer/${performanceId}_flyer`);
        await uploadBytes(flyerRef, compressedFile);
        return await getDownloadURL(flyerRef);
      }
    } catch (error) {
      console.error("Error uploading flyer:", error);
      throw new Error("Flyer upload failed");
    }
  };

  const handleImageDescriptionChange = (index, value) => {
    const updatedDescriptions = [...imageDescriptions];
    updatedDescriptions[index] = value || "";
    setImageDescriptions(updatedDescriptions);
  };

  const handleDeleteImage = (index) => {
    // Check if it's an existing image (from Firestore)
    const isExistingImage = index < existingGallery.length;
  
    if (isExistingImage) {
      // Add to deleted images list for storage cleanup
      setDeletedExistingImages(prev => [...prev, existingGallery[index].url]);
      // Remove from existing gallery
      setExistingGallery(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove from new images list
      const newIndex = index - existingGallery.length;
      setNewImages(prev => prev.filter((_, i) => i !== newIndex));
    }
  
    // Remove from previews and descriptions
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageDescriptions(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleDescriptionChange = (index, value) => {
    const updatedDescriptions = [...imageDescriptions];
    updatedDescriptions[index] = value;
    setImageDescriptions(updatedDescriptions);
  };

// Modified uploadImages with compression
const uploadImages = async (performanceId) => {
  // Filter out deleted existing images
  const remainingExisting = existingGallery.filter(
    img => !deletedExistingImages.includes(img.url)
  );

  // Upload and compress new images
  const newGalleryEntries = await Promise.all(
    newImages.map(async (file, index) => {
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 5,
          maxWidthOrHeight: 3000,
          useWebWorker: true,
        });

        const imageRef = ref(storage, `performances/${performanceId}/images/${performanceId}_gallery_${Date.now()}_${index}`);
        await uploadBytes(imageRef, compressedFile);
        const url = await getDownloadURL(imageRef);
        
        return {
          url,
          description: imageDescriptions[existingGallery.length + index] || ''
        };
      } catch (error) {
        console.error("Error compressing image:", error);
        throw new Error(`No se pudo subir la imagen ${index + 1}`);
      }
    })
  );

  // Update descriptions for remaining existing images
  const updatedExisting = remainingExisting.map((img, index) => ({
    ...img,
    description: imageDescriptions[index] || img.description
  }));

  return [...updatedExisting, ...newGalleryEntries];
};
  
  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  };

  const resetForm = () => {
    // Clean up object URLs to prevent memory leaks
    if (bannerPreview && bannerImage instanceof File) {
      URL.revokeObjectURL(bannerPreview);
    }
    if (flyerPreview && flyerImage instanceof File) {
      URL.revokeObjectURL(flyerPreview);
    }
    imagePreviews.forEach((preview, index) => {
      if (newImages[index] instanceof File) {
        URL.revokeObjectURL(preview);
      }
    });

    setFormData({
      name: "",
      subtitle: "",
      description: [],
      isFeatured: false,
      directors: [],
      artists: [],
      dates: [{ date: null, time: "" }],
      address: "",
      googleMapsLink: "",
      slug: "",
    });
    setImageDescriptions([]);
    setImagePreviews([]);
    setSelectedPerformance(null);
    setBannerImage(null);
    setBannerPreview(null);
    setFlyerImage(null);
    setFlyerPreview(null);
    setExistingGallery([]);
    setNewImages([]);
    setDirectorInput("");
    setArtistInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
    if (flyerInputRef.current) {
      flyerInputRef.current.value = "";
    }
  };

  // Cleanup effect for preview URLs
  useEffect(() => {
    return () => {
      if (bannerPreview && bannerImage instanceof File) {
        URL.revokeObjectURL(bannerPreview);
      }
      if (flyerPreview && flyerImage instanceof File) {
        URL.revokeObjectURL(flyerPreview);
      }
      imagePreviews.forEach((preview, index) => {
        if (newImages[index] instanceof File) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [bannerPreview, bannerImage, flyerPreview, flyerImage, imagePreviews, newImages]);

  const addNewPerformance = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
  
    try {
      const { name, dates } = formData;
      const sanitizedDates = (dates || [])
        .map((entry) => ({
          date: entry?.date ? new Date(entry.date) : null,
          time: entry?.time ? entry.time.trim() : "",
        }))
        .filter((entry) => entry.date instanceof Date && !isNaN(entry.date.getTime()) || entry.time);

      if (!name || sanitizedDates.length === 0) {
        throw new Error("Por favor agrega al menos una fecha y horario validos.");
      }

      if (sanitizedDates.some((entry) => !(entry.date instanceof Date) || isNaN(entry.date.getTime()) || !entry.time)) {
        throw new Error("Cada funcion debe tener una fecha y un horario.");
      }

      const slug = generateSlug(name);
      
      // Generate performance ID before uploading images
      const performanceId = doc(collection(firestore, "performances")).id;

      const galleryData = await uploadImages(performanceId);
      if (!galleryData) throw new Error("La carga de imagenes fallo.");

      const bannerUrl = await uploadBannerImage(performanceId);
      const flyerUrl = await uploadFlyerImage(performanceId);

      const directorsSanitized = (formData.directors || [])
        .map((entry) => ({
          memberId: entry?.memberId || null,
          name: (entry?.name || "").trim(),
        }))
        .filter((entry) => entry.name);

      const artistsSanitized = (formData.artists || [])
        .map((entry) => ({
          memberId: entry?.memberId || null,
          name: (entry?.name || "").trim(),
        }))
        .filter((entry) => entry.name);

      const newPerformanceData = {
        ...formData,
        slug,
        gallery: galleryData,
        banner: bannerUrl,
        flyer: flyerUrl,
        dates: sanitizedDates.map((entry) => ({
          date: Timestamp.fromDate(new Date(entry.date)),
          time: entry.time,
        })),
        directors: directorsSanitized,
        artists: artistsSanitized,
        openingDate: null,
        closingDate: null,
        receptionDate: null,
        receptionTime: "",
      };
  

      console.log("Artists guardados:", artistsSanitized);

      console.log("Datos de la performance:", newPerformanceData);
  

      // Use setDoc instead of addDoc to use the pre-generated ID
      await setDoc(doc(firestore, "performances", performanceId), newPerformanceData);
  

      setSuccess("¡Performance creada con exito!");
      resetForm();
    } catch (error) {
      console.error("Error adding document:", error);
      setError("No se pudo agregar la performance. Intentalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <div className={styles.form}>
      <div>
        <p className={styles.subtitle}>SELECCIONA UNA PERFORMANCE PARA EDITAR</p>
        <select
          value={selectedPerformance || ""}
          onChange={(e) => handlePerformanceSelection(e.target.value)}
        >
          <option value="">Crear nueva performance</option>
          {performances.map((performance) => (
            <option key={performance.id} value={performance.id}>
              {performance.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Performance ID Display */}
      {selectedPerformance && (
        <div className={styles.artistIdDisplay}>
          <span className={styles.artistIdLabel}>ID de la performance:</span>
          <span className={styles.artistIdValue}>{selectedPerformance}</span>
        </div>
      )}

      {/* Performance Basic Information Container */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Informacion de la performance</h3>
        <div className={styles.artistInfoContainer}>
        <div className={styles.inputGroup}>
          <p className={styles.subtitle}>TITULO DE LA PERFORMANCE</p>
          <input
            name="name"
            placeholder="Titulo de la performance"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className={styles.inputGroup}>
          <p className={styles.subtitle}>SUBTITULO</p>
          <input
            name="subtitle"
            placeholder="Subtitulo de la performance (opcional)"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          />
        </div>

        <div className={styles.inputGroup}>
          <p className={styles.subtitle}>DIRECTORES</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Agregar director manualmente"
                value={directorInput}
                onChange={(e) => setDirectorInput(e.target.value)}
                style={{ flex: '1 1 200px' }}
              />
              <button
                type="button"
                onClick={handleManualDirectorAdd}
                disabled={!directorInput.trim()}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: directorInput.trim() ? 'pointer' : 'not-allowed', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px' }}
              >
                Agregar
              </button>
            </div>

            {communityMembers.length > 0 && (
              <select
                defaultValue=""
                onChange={(e) => {
                  const memberId = e.target.value;
                  if (memberId) {
                    handleCommunityDirectorAdd(memberId);
                    e.target.value = "";
                  }
                }}
                style={{ maxWidth: '100%', padding: '0.5rem' }}
              >
                <option value="">Seleccionar director desde la comunidad</option>
                {availableCommunityDirectors.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name || member.slug || member.id}
                  </option>
                ))}
              </select>
            )}

            {(formData.directors || []).length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(formData.directors || []).map((director, index) => (
                  <div
                    key={`${director.memberId || 'manual'}-${index}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid #ccc',
                      padding: '0.5rem 0.75rem',
                    }}
                  >
                    <span>
                      {director.name}
                      {director.memberId ? ' (comunidad)' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDirectorRemove(index)}
                      style={{ background: 'transparent', border: 'none', color: '#c00', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className={styles.helpText}>Puedes seleccionar directores desde la comunidad o agregarlos manualmente.</p>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <p className={styles.subtitle}>DESCRIPCION</p>
          <textarea
            name="description"
            placeholder="Escribe la descripcion de la performance (un parrafo por linea)"
            value={formData.description.join('\n')}
            onChange={(e) => setFormData({ ...formData, description: e.target.value.split('\n').filter(p => p.trim()) })}
          />
          <p className={styles.helpText}>Cada linea se convertira en un parrafo independiente. Presiona Enter para crear nuevos parrafos.</p>
        </div>

        <div className={styles.inputGroup}>
          <p className={styles.subtitle}>PERFORMANCE DESTACADA</p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              style={{ cursor: 'pointer' }}
            />
            <span>Resaltar esta performance en la pagina principal</span>
          </label>
        </div>
        </div>
      </div>

      {/* Dates & Times Container */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Fechas y horarios</h3>
        <div className={styles.artistInfoContainer}>
          {(formData.dates || []).map((schedule, index) => (
            <div key={`schedule-${index}`} className={styles.profileAndBasicInfoRow}>
              <div className={styles.inputGroup}>
                <p className={styles.subtitle}>FECHA</p>
                <DatePicker
                  selected={schedule.date}
                  onChange={(date) => handleScheduleDateChange(index, date)}
                  placeholderText="Selecciona la fecha"
                />
              </div>

              <div className={styles.inputGroup}>
                <p className={styles.subtitle}>HORARIO</p>
                <input
                  type="time"
                  value={schedule.time || ""}
                  onChange={(e) => handleScheduleTimeChange(index, e.target.value)}
                />
              </div>

              {formData.dates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeScheduleEntry(index)}
                  style={{ alignSelf: 'flex-end', padding: '0.5rem 1rem', backgroundColor: 'transparent', border: '1px solid #ccc', cursor: 'pointer', height: 'fit-content' }}
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addScheduleEntry}
            style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px' }}
          >
            Agregar otra funcion
          </button>
          <p className={styles.helpText}>Puedes agregar multiples fechas y horarios para la performance.</p>
        </div>
      </div>

      {/* Location Information Container */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Ubicacion</h3>
        <div className={styles.artistInfoContainer}>
        <div className={styles.inputGroup}>
          <p className={styles.subtitle}>DIRECCION</p>
          <input
            name="address"
            placeholder="Direccion de la performance"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className={styles.inputGroup}>
          <p className={styles.subtitle}>ENLACE DE GOOGLE MAPS</p>
          <input
            name="googleMapsLink"
            type="url"
            placeholder="https://maps.google.com/..."
            value={formData.googleMapsLink}
            onChange={(e) => setFormData({ ...formData, googleMapsLink: e.target.value })}
          />
          <p className={styles.helpText}>
            Pega el enlace de Google Maps para una navegacion facil
          </p>
        </div>
        </div>
      </div>

      {/* Images Container */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Imagenes</h3>
        <div className={styles.artistInfoContainer}>
        {/* Banner and Flyer Row */}
        <div className={styles.profileAndBasicInfoRow}>
          {/* Banner Image */}
          <div className={styles.inputGroup}>
            <p className={styles.subtitle}>IMAGEN DEL BANNER</p>
            <div
              className={`${styles.profilePictureDropZone} ${isBannerDragOver ? styles.dragOver : ''}`}
              onDragOver={handleBannerDragOver}
              onDragLeave={handleBannerDragLeave}
              onDrop={handleBannerDrop}
              onClick={() => bannerInputRef.current?.click()}
            >
              {bannerPreview ? (
                <div className={styles.profilePicturePreview}>
                  <img 
                    src={bannerPreview} 
                    alt="Vista previa del banner" 
                    className={styles.profilePreviewImage}
                  />
                  <div className={styles.profilePictureOverlay}>
                    <span>Haz clic o arrastra para cambiar</span>
                  </div>
                </div>
              ) : (
                <div className={styles.profilePicturePlaceholder}>
                  <p>Arrastra y suelta la imagen del banner aqui</p>
                  <p>o haz clic para buscar</p>
                  <small>Tamano maximo: 2000px de ancho</small>
                </div>
              )}
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Flyer Image/Video */}
          <div className={styles.inputGroup}>
            <p className={styles.subtitle}>FLYER (IMAGEN O VIDEO)</p>
            <div
              className={`${styles.profilePictureDropZone} ${isFlyerDragOver ? styles.dragOver : ''}`}
              onDragOver={handleFlyerDragOver}
              onDragLeave={handleFlyerDragLeave}
              onDrop={handleFlyerDrop}
              onClick={() => flyerInputRef.current?.click()}
            >
              {flyerPreview ? (
                <div className={styles.profilePicturePreview}>
                  {flyerImage?.type?.startsWith('video/') ? (
                    <video
                      src={flyerPreview}
                      controls
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  ) : (
                    <img 
                      src={flyerPreview} 
                      alt="Vista previa del flyer" 
                      className={styles.profilePreviewImage}
                    />
                  )}
                  <div className={styles.profilePictureOverlay}>
                    <span>Haz clic o arrastra para cambiar</span>
                  </div>
                </div>
              ) : (
                <div className={styles.profilePicturePlaceholder}>
                  <p>Arrastra y suelta el flyer aqui</p>
                  <p>o haz clic para buscar</p>
                  <small>Se aceptan imagenes o videos</small>
                </div>
              )}
            </div>
            <input
              ref={flyerInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFlyerChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Performance Gallery Images */}
        <div className={styles.inputGroup}>
          <p className={styles.subtitle}>IMAGENES DE LA GALERIA DE LA PERFORMANCE</p>
          <div
            className={`${styles.cvDropZone} ${isGalleryDragOver ? styles.dragOver : ''}`}
            onDragOver={handleGalleryDragOver}
            onDragLeave={handleGalleryDragLeave}
            onDrop={handleGalleryDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={styles.cvFilePlaceholder}>
              <p>Arrastra y suelta imagenes de la galeria aqui</p>
              <p>o haz clic para buscar</p>
              <small>Se permiten multiples imagenes</small>
            </div>
          </div>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={handleFileChange} 
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          
          {imagePreviews.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <p className={styles.subtitle}>IMAGENES SUBIDAS ({imagePreviews.length})</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '1rem' }}>
                {imagePreviews.map((preview, index) => (
                  <div key={`image-${index}`} className={styles.imageContainer} style={{ display: 'flex', flexDirection: 'column', width: '300px', border: '1px solid gray', padding: '1rem' }}>
                    <img 
                      src={preview} 
                      alt={`Vista previa ${index + 1}`} 
                      className={styles.previewImage}
                      style={{width: '100%', height: 'auto', objectFit: 'cover', maxHeight: '300px', marginBottom: 'auto'}}
                    />
                    <textarea
                      value={imageDescriptions[index] || ''}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                      className={styles.imageDescription}
                      placeholder="Descripcion de la imagen..."
                      style={{ marginTop: '1rem', width: '100%', minHeight: '60px', maxHeight: '100px', resize: 'vertical' }}
                    />
                    <button
                      type="button"
                      style={{color: "red", marginTop: '0.5rem', cursor: 'pointer', padding: '0.5rem'}}
                      onClick={() => handleDeleteImage(index)}
                    >
                      ELIMINAR
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Artists Container */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Artistas</h3>
        <div className={styles.artistInfoContainer}>
          <div className={styles.inputGroup}>
            <p className={styles.subtitle}>ARTISTAS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Agregar artista manualmente"
                  value={artistInput}
                  onChange={(e) => setArtistInput(e.target.value)}
                  style={{ flex: '1 1 200px' }}
                />
                <button
                  type="button"
                  onClick={handleManualArtistAdd}
                  disabled={!artistInput.trim()}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: artistInput.trim() ? 'pointer' : 'not-allowed', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px' }}
                >
                  Agregar
                </button>
              </div>

              {communityMembers.length > 0 && (
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const memberId = e.target.value;
                    if (memberId) {
                      handleCommunityArtistAdd(memberId);
                      e.target.value = "";
                    }
                  }}
                  style={{ maxWidth: '100%', padding: '0.5rem' }}
                >
                  <option value="">Seleccionar artista desde la comunidad</option>
                  {availableCommunityArtists.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name || member.slug || member.id}
                    </option>
                  ))}
                </select>
              )}

              {(formData.artists || []).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(formData.artists || []).map((artist, index) => (
                    <div
                      key={`${artist.memberId || 'manual'}-${index}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid #ccc',
                        padding: '0.5rem 0.75rem',
                      }}
                    >
                      <span>
                        {artist.name}
                        {artist.memberId ? ' (comunidad)' : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleArtistRemove(index)}
                        style={{ background: 'transparent', border: 'none', color: '#c00', cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className={styles.helpText}>Puedes seleccionar artistas desde la comunidad o agregarlos manualmente.</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ margin: 'auto'}}>
      <p className={styles.subtitle}> TODO LISTO? </p>
      <button type="button" onClick={handleSubmit} disabled={loading}>
        {loading ? (selectedPerformance ? "Actualizando..." : "Subiendo...") : (selectedPerformance ? "ACTUALIZAR PERFORMANCE" : "AGREGAR PERFORMANCE")}
      </button>


      </div>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </div>
  );
}