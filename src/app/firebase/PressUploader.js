"use client";

import { useCallback, useEffect, useState } from "react";
import { firestore } from "./firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../../styles/uploader.module.css";

const createEmptyForm = () => ({
  title: "",
  subtitle: "",
  date: null,
  description: "",
  links: [{ title: "", url: "" }],
});

export default function PressUploader() {
  const [formData, setFormData] = useState(() => createEmptyForm());
  const [pressDocs, setPressDocs] = useState([]);
  const [selectedPressId, setSelectedPressId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchPressDocuments = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(firestore, "press"));
      const documents = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          const rawDate = data.date;
          const parsedDate =
            rawDate && typeof rawDate.toDate === "function"
              ? rawDate.toDate()
              : rawDate
              ? new Date(rawDate)
              : null;

          const linksFromData = Array.isArray(data.links)
            ? data.links.map((entry) => ({
                title: (entry?.title || "").trim(),
                url: (entry?.url || "").trim(),
              }))
            : typeof data.link === "string" && data.link.trim()
            ? [{ title: "", url: data.link.trim() }]
            : [];

          return {
            id: docSnap.id,
            title: data.title || "Sin título",
            subtitle: data.subtitle || "",
            links: linksFromData,
            link: linksFromData[0]?.url || "",
            description: data.description || "",
            date: parsedDate,
          };
        })
        .sort((a, b) => {
          const timeA = a.date instanceof Date ? a.date.getTime() : 0;
          const timeB = b.date instanceof Date ? b.date.getTime() : 0;
          return timeB - timeA;
        });

      setPressDocs(documents);
    } catch (err) {
      console.error("Error fetching press documents:", err);
      setError("No se pudieron cargar los articulos de prensa.");
    }
  }, []);

  useEffect(() => {
    fetchPressDocuments();
  }, [fetchPressDocuments]);

  const resetForm = () => {
    setFormData(createEmptyForm());
    setSelectedPressId("");
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
    setSuccess(null);
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      date: date || null,
    }));
    setError(null);
    setSuccess(null);
  };

  const handleLinkChange = (index, field, value) => {
    setFormData((prev) => {
      const links = [...(prev.links || [])];
      if (!links[index]) {
        links[index] = { title: "", url: "" };
      }
      links[index] = {
        ...links[index],
        [field]: value,
      };
      return {
        ...prev,
        links,
      };
    });
    setError(null);
    setSuccess(null);
  };

  const addLinkField = () => {
    setFormData((prev) => ({
      ...prev,
      links: [...(prev.links || []), { title: "", url: "" }],
    }));
    setError(null);
    setSuccess(null);
  };

  const removeLinkField = (index) => {
    setFormData((prev) => {
      const links = (prev.links || []).filter((_, i) => i !== index);
      return {
        ...prev,
        links: links.length > 0 ? links : createEmptyForm().links,
      };
    });
    setError(null);
    setSuccess(null);
  };

  const handlePressSelection = async (pressId) => {
    setError(null);
    setSuccess(null);

    if (!pressId) {
      resetForm();
      setError(null);
      setSuccess(null);
      return;
    }

    setSelectedPressId(pressId);

    try {
      const pressDoc = await getDoc(doc(firestore, "press", pressId));

      if (!pressDoc.exists()) {
        setError("No se encontro el articulo seleccionado.");
        resetForm();
        return;
      }

      const data = pressDoc.data();
      const rawDate = data.date;
      const parsedDate =
        rawDate && typeof rawDate.toDate === "function"
          ? rawDate.toDate()
          : rawDate
          ? new Date(rawDate)
          : null;

      setFormData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        date:
          parsedDate instanceof Date && !Number.isNaN(parsedDate.getTime())
            ? parsedDate
            : null,
        description: data.description || "",
        links: (() => {
          if (Array.isArray(data.links) && data.links.length > 0) {
            return data.links.map((entry) => ({
              title: (entry?.title || "").trim(),
              url: (entry?.url || "").trim(),
            }));
          }
          if (typeof data.link === "string" && data.link.trim()) {
            return [{ title: "", url: data.link.trim() }];
          }
          return createEmptyForm().links;
        })(),
      });
    } catch (err) {
      console.error("Error loading press document:", err);
      setError("No se pudo cargar el articulo seleccionado.");
    }
  };

  const handleSubmit = async (event) => {
    event?.preventDefault?.();

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const trimmedTitle = formData.title.trim();
      const trimmedSubtitle = formData.subtitle.trim();
      const trimmedDescription = formData.description.trim();
      const selectedDate = formData.date instanceof Date ? formData.date : null;
      const sanitizedLinks = (formData.links || [])
        .map((entry) => ({
          title: (entry?.title || "").trim(),
          url: (entry?.url || "").trim(),
        }))
        .filter((entry) => entry.url);

      if (!trimmedTitle) {
        throw new Error("El titulo es obligatorio.");
      }

      if (!selectedDate || Number.isNaN(selectedDate.getTime())) {
        throw new Error("Selecciona una fecha valida.");
      }

      if (sanitizedLinks.length === 0) {
        throw new Error("Agrega al menos un enlace valido.");
      }

      const pressId = selectedPressId || doc(collection(firestore, "press")).id;

      const payload = {
        title: trimmedTitle,
        subtitle: trimmedSubtitle,
        description: trimmedDescription,
        date: Timestamp.fromDate(selectedDate),
        links: sanitizedLinks,
        link: sanitizedLinks[0]?.url || "",
      };

      if (selectedPressId) {
        await updateDoc(doc(firestore, "press", pressId), payload);
        setSuccess("¡Articulo actualizado con exito!");
      } else {
        await setDoc(doc(firestore, "press", pressId), payload);
        setSuccess("¡Articulo creado con exito!");
        resetForm();
      }

      await fetchPressDocuments();
    } catch (err) {
      console.error("Error saving press document:", err);
      setError(err.message || "No se pudo guardar el articulo de prensa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div>
        <p className={styles.subtitle}>Selecciona un articulo de prensa para editar</p>
        <select
          value={selectedPressId}
          onChange={(event) => handlePressSelection(event.target.value)}
        >
          <option value="">Crear nuevo articulo</option>
          {pressDocs.map((press) => (
            <option key={press.id} value={press.id}>
              {press.title}
              {press.date
                ? ` (${press.date.toLocaleDateString("es-ES")})`
                : ""}
            </option>
          ))}
        </select>
      </div>

      {selectedPressId && (
        <div className={styles.artistIdDisplay}>
          <span className={styles.artistIdLabel}>ID del articulo:</span>
          <span className={styles.artistIdValue}>{selectedPressId}</span>
        </div>
      )}

      <div className={styles.artistInfoContainer}>
        <div className={styles.inputGroup}>
          <p className={styles.subtitle}>Titulo</p>
          <input
            name="title"
            placeholder="Titulo del articulo"
            value={formData.title}
            onChange={handleInputChange("title")}
          />
        </div>

        <div className={styles.inputGroup}>
          <p className={styles.subtitle}>Subtitulo</p>
          <input
            name="subtitle"
            placeholder="Subtitulo del articulo (opcional)"
            value={formData.subtitle}
            onChange={handleInputChange("subtitle")}
          />
        </div>

        <div className={styles.inputGroup}>
          <p className={styles.subtitle}>Fecha</p>
          <DatePicker
            selected={formData.date}
            onChange={handleDateChange}
            placeholderText="Selecciona la fecha de publicacion"
            dateFormat="dd/MM/yyyy"
            isClearable
          />
        </div>

        <div className={styles.inputGroup}>
          <p className={styles.subtitle}>Enlaces</p>
          {(formData.links || []).map((linkEntry, index) => (
            <div
              key={`press-link-${index}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                padding: "0.75rem",
                border: "1px solid #d7d7d7",
                marginBottom: "1rem",
              }}
            >
              <input
                type="text"
                placeholder="Titulo del enlace (opcional)"
                value={linkEntry.title || ""}
                onChange={(event) =>
                  handleLinkChange(index, "title", event.target.value)
                }
              />
              <input
                type="url"
                placeholder="https://..."
                value={linkEntry.url || ""}
                onChange={(event) =>
                  handleLinkChange(index, "url", event.target.value)
                }
                required
              />
              {(formData.links || []).length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLinkField(index)}
                  style={{
                    alignSelf: "flex-end",
                    padding: "0.25rem 0.75rem",
                    background: "transparent",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  Eliminar enlace
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addLinkField}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              textTransform: "uppercase",
              fontSize: "0.85rem",
              letterSpacing: "0.5px",
            }}
          >
            Agregar otro enlace
          </button>
          <p className={styles.helpText}>
            Puedes agregar multiples enlaces relacionados con el articulo.
          </p>
        </div>

        <div className={styles.inputGroup}>
          <p className={styles.subtitle}>Descripcion</p>
          <textarea
            name="description"
            placeholder="Resumen del articulo o notas adicionales"
            value={formData.description}
            onChange={handleInputChange("description")}
            rows={4}
          />
          <p className={styles.helpText}>
            Este texto se mostrara junto al articulo en la pagina de prensa.
          </p>
        </div>
      </div>

      <div style={{ margin: "auto" }}>
        <p className={styles.subtitle}>¿Todo listo?</p>
        <button type="submit" disabled={loading}>
          {loading
            ? selectedPressId
              ? "Actualizando..."
              : "Guardando..."
            : selectedPressId
            ? "Actualizar articulo"
            : "Agregar articulo"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </form>
  );
}

