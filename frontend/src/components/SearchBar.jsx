// frontend/src/components/SearchBar.jsx
// Drop this file into: frontend/src/components/SearchBar.jsx

"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";

/**
 * SearchBar — reusable fuzzy search input for AgriShare.
 *
 * Props:
 *  @prop {Function} onSearch      - called with the current query string
 *  @prop {string}   placeholder   - input placeholder text
 *  @prop {string}   className     - extra Tailwind classes for the wrapper
 *  @prop {boolean}  loading       - shows a spinner when true
 *  @prop {boolean}  autoFocus     - focus input on mount
 *  @prop {Array}    suggestions   - optional list of { _id, name } for dropdown
 *  @prop {Function} onSelect      - called when a suggestion is clicked
 *
 * Example (in browse/page.js):
 *   <SearchBar
 *     onSearch={setQueryImmediate}
 *     placeholder="Search tractor, rotavator, pump…"
 *     suggestions={results.slice(0, 5).map(r => r.item)}
 *     onSelect={(item) => router.push(`/equipment/${item._id}`)}
 *   />
 */
export default function SearchBar({
  onSearch,
  placeholder = "Search equipment, location…",
  className = "",
  loading = false,
  autoFocus = false,
  suggestions = [],
  onSelect,
}) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);
    onSearch?.(val);
    setOpen(val.trim().length > 0 && suggestions.length > 0);
  };

  const handleClear = () => {
    setValue("");
    onSearch?.("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleSelect = (item) => {
    setValue(item.name);
    onSearch?.(item.name);
    onSelect?.(item);
    setOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Escape") handleClear();
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {/* ── Input wrapper ── */}
      <div className="flex items-center gap-2 rounded-xl border border-border-light bg-surface px-4 py-2.5 shadow-sm transition-all duration-200 focus-within:border-primary-accent focus-within:ring-2 focus-within:ring-primary-accent/20">
        {loading ? (
          <Loader2 size={18} className="shrink-0 animate-spin text-primary-accent" />
        ) : (
          <Search size={18} className="shrink-0 text-primary-accent" />
        )}

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(value.trim().length > 0 && suggestions.length > 0)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
        />

        {value && (
          <button
            onClick={handleClear}
            className="text-text-tertiary transition-colors hover:text-text-secondary"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Suggestions dropdown ── */}
      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border-light bg-surface shadow-lg backdrop-blur-sm">
          {suggestions.map((item) => (
            <li key={item._id}>
              <button
                onMouseDown={() => handleSelect(item)} // mousedown fires before blur
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-background-hover"
              >
                {/* Small equipment icon placeholder */}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-accent/10 text-xs font-semibold text-primary-accent">
                  {item.name?.[0]?.toUpperCase() ?? "E"}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-text-primary">
                    {item.name}
                  </p>
                  {item.category && (
                    <p className="text-xs text-text-tertiary">{item.category}</p>
                  )}
                </div>
                {item.pricePerDay && (
                  <span className="ml-auto shrink-0 text-xs font-semibold text-primary-accent">
                    ₹{item.pricePerDay}/day
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
