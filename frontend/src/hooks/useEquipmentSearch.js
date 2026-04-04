// frontend/src/hooks/useEquipmentSearch.js
// Drop this file into: frontend/src/hooks/useEquipmentSearch.js

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import Fuse from "fuse.js";

/**
 * Fuse.js config tuned for agricultural equipment search.
 *
 * Keys and weights:
 *  - name        → highest priority (tractor, rotavator, etc.)
 *  - category    → "Harvesting", "Irrigation", etc.
 *  - description → longer text, lower weight
 *  - location    → so farmers can search by village/district
 *  - ownerName   → search by owner name
 *
 * threshold 0.35 → catches typos like "tracktor" → "tractor"
 *                  but won't return irrelevant garbage
 */
const FUSE_OPTIONS = {
  keys: [
    { name: "name", weight: 0.45 },
    { name: "category", weight: 0.20 },
    { name: "description", weight: 0.15 },
    { name: "location", weight: 0.12 },
    { name: "ownerName", weight: 0.08 },
  ],
  threshold: 0.35,
  includeScore: true,
  includeMatches: true,   // lets you highlight matched text
  ignoreLocation: true,   // search full string, not just start
  minMatchCharLength: 2,
  useExtendedSearch: false,
};

/**
 * useEquipmentSearch
 *
 * @param {Array}  equipments   - full list of equipment objects from your API
 * @param {Object} filters      - { category, priceMin, priceMax, available }
 * @returns {Object}            - { query, setQuery, results, isSearching, totalCount, searchTime }
 *
 * Usage inside browse/page.js:
 *   const { query, setQuery, results, isSearching } = useEquipmentSearch(equipments, filters);
 */
// Haversine formula for distance in km between two lat/lng points
function getDistanceKm(lat1, lng1, lat2, lng2) {
  if (
    typeof lat1 !== "number" ||
    typeof lng1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lng2 !== "number"
  )
    return null;
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getEquipmentCoords(item) {
  if (item.locationCoords && typeof item.locationCoords.lat === "number") {
    return item.locationCoords;
  }
  if (
    item.location &&
    typeof item.location === "object" &&
    Array.isArray(item.location.coordinates) &&
    item.location.coordinates.length === 2
  ) {
    return { lat: item.location.coordinates[1], lng: item.location.coordinates[0] };
  }
  return null;
}

export function useEquipmentSearch(equipments = [], filters = {}) {
  const [query, setQuery] = useState("");
  const debounceTimerRef = useRef(null);

  // Build fuse instance only when equipments list changes (not on every keystroke)
  const fuse = useMemo(() => new Fuse(equipments, FUSE_OPTIONS), [equipments]);

  const results = useMemo(() => {
    let list;

    if (!query.trim()) {
      list = equipments.map((item) => ({ item, score: 0, matches: [] }));
    } else {
      list = fuse.search(query.trim());
    }

    // ── Apply hard filters on top of fuzzy results ──────────────────────────
    if (filters.category && filters.category !== "all") {
      list = list.filter(
        (r) =>
          r.item.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.priceMin !== undefined && filters.priceMin !== "") {
      list = list.filter(
        (r) => Number(r.item.pricePerDay) >= Number(filters.priceMin)
      );
    }

    if (filters.priceMax !== undefined && filters.priceMax !== "") {
      list = list.filter(
        (r) => Number(r.item.pricePerDay) <= Number(filters.priceMax)
      );
    }

    if (filters.available) {
      list = list.filter((r) => r.item.isAvailable === true);
    }

    // If user location is present and equipment has coordinates, add .distance
    if (filters.userCoords && typeof filters.userCoords.lat === "number") {
      list = list.map((r) => {
        const coords = getEquipmentCoords(r.item);
        if (coords) {
          r.item.distance = getDistanceKm(
            filters.userCoords.lat,
            filters.userCoords.lng,
            coords.lat,
            coords.lng
          );
        } else {
          r.item.distance = null;
        }
        return r;
      });
      // Optionally sort by distance if a flag is set (let browse page handle sort)
    }

    const searchTime = "0.0";
    return { list, searchTime };
  }, [query, equipments, fuse, filters]);

  // Debounced setter — waits 200ms before updating query state
  // so we don't re-run Fuse on every single keystroke
  const debouncedSetQuery = useCallback((val) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => setQuery(val), 200);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    query,
    setQuery: debouncedSetQuery,
    setQueryImmediate: setQuery,          // use this if you want instant search
    results: results.list,               // [{ item, score, matches }]
    searchTime: results.searchTime,      // e.g. "1.2"
    totalCount: results.list.length,
    isSearching: query.trim().length > 0,
  };
}
