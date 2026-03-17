"use client";

import { useCallback, useMemo, useRef, useState } from "react";

function relevanceSort(items, query, getLabel) {
  const q = query.toLowerCase().trim();
  if (!q) return items;

  const matches = items.filter((item) => getLabel(item).toLowerCase().includes(q));

  return matches.sort((a, b) => {
    const nameA = getLabel(a).toLowerCase();
    const nameB = getLabel(b).toLowerCase();

    if (nameA === q) return -1;
    if (nameB === q) return 1;

    if (nameA.startsWith(q)) return -1;
    if (nameB.startsWith(q)) return 1;

    const indexA = nameA.indexOf(q);
    const indexB = nameB.indexOf(q);
    if (indexA !== indexB) return indexA - indexB;

    return nameA.localeCompare(nameB);
  });
}

const MAX_VISIBLE = 4;

/**
 * Reusable search-input + dropdown used across admin uploaders.
 *
 * @param {Object[]} items           - Full list of selectable items.
 * @param {Function} onSelect        - Called with the selected item when clicked.
 * @param {string}   placeholder     - Input placeholder text.
 * @param {string}   emptyMessage    - Shown when search yields no results.
 * @param {Function} [getLabel]      - (item) => display string. Defaults to item.name || item.slug || item.id.
 * @param {Function} [getSubtitle]   - (item) => optional subtitle string (shown below label).
 * @param {Function} [getKey]        - (item) => unique key. Defaults to item.id.
 */
export default function SearchableDropdown({
  items,
  onSelect,
  placeholder = "Buscar...",
  emptyMessage = "Sin resultados",
  getLabel = (item) => item.name || item.slug || item.id || "",
  getSubtitle,
  getKey = (item) => item.id,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const dropdownId = useRef(
    `sd-${Math.random().toString(36).slice(2, 8)}`
  ).current;

  const filtered = useMemo(
    () => relevanceSort(items, query, getLabel),
    [items, query, getLabel]
  );

  const topResults = useMemo(() => {
    if (!query.trim() || filtered.length === 0) return [];
    return filtered.slice(0, MAX_VISIBLE);
  }, [filtered, query]);

  const handleSelect = useCallback(
    (item) => {
      onSelect(item);
      setQuery("");
      setOpen(false);
    },
    [onSelect]
  );

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (query.trim()) setOpen(true);
        }}
        onBlur={(e) => {
          setTimeout(() => {
            const related = e.relatedTarget || document.activeElement;
            if (!related || !related.closest(`.${dropdownId}`)) {
              setOpen(false);
            }
          }, 200);
        }}
        style={{
          width: "100%",
          padding: "0.5rem",
          fontSize: "1rem",
          border: "1px solid #ccc",
          borderRadius: "var(--border-radius)",
        }}
      />

      {open && query.trim() && topResults.length > 0 && (
        <div
          className={dropdownId}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "var(--border-radius)",
            marginTop: "0.25rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {topResults.map((item) => (
            <div
              key={getKey(item)}
              onClick={() => handleSelect(item)}
              style={{
                padding: "0.75rem 1rem",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div style={{ fontWeight: "500", color: "#333" }}>
                {getLabel(item)}
              </div>
              {getSubtitle && getSubtitle(item) && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#666",
                    marginTop: "0.25rem",
                  }}
                >
                  {getSubtitle(item)}
                </div>
              )}
            </div>
          ))}
          {filtered.length > MAX_VISIBLE && (
            <div
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                color: "#666",
                borderTop: "1px solid #eee",
                backgroundColor: "#f9f9f9",
              }}
            >
              +{filtered.length - MAX_VISIBLE} más resultados. Usa el campo de
              búsqueda para filtrar.
            </div>
          )}
        </div>
      )}

      {open && query.trim() && topResults.length === 0 && (
        <div
          className={dropdownId}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "var(--border-radius)",
            marginTop: "0.25rem",
            padding: "0.75rem 1rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
            color: "#666",
          }}
        >
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
