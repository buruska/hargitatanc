"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

type LocationsMapProps = {
  locations: string[];
};

type GeocodedLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

const geocodeCache = new Map<string, GeocodedLocation | null>();

export function LocationsMap({ locations }: LocationsMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty">("loading");

  useEffect(() => {
    if (!mapElementRef.current || locations.length === 0) {
      setStatus("empty");
      return;
    }

    let isCancelled = false;
    let map: import("leaflet").Map | undefined;

    async function initializeMap() {
      const L = await import("leaflet");
      if (isCancelled || !mapElementRef.current) return;

      map = L.map(mapElementRef.current, { scrollWheelZoom: false }).setView([46, 25], 7);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const geocodedLocations = (
        await Promise.all(
          locations.map(async (name): Promise<GeocodedLocation | null> => {
            if (geocodeCache.has(name)) return geocodeCache.get(name) ?? null;

            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ro&q=${encodeURIComponent(name)}`,
                { headers: { Accept: "application/json" } },
              );
              if (!response.ok) {
                geocodeCache.set(name, null);
                return null;
              }

              const results = (await response.json()) as Array<{ lat: string; lon: string }>;
              if (!results[0]) {
                geocodeCache.set(name, null);
                return null;
              }

              const geocodedLocation = {
                name,
                latitude: Number(results[0].lat),
                longitude: Number(results[0].lon),
              };
              geocodeCache.set(name, geocodedLocation);
              return geocodedLocation;
            } catch {
              geocodeCache.set(name, null);
              return null;
            }
          }),
        )
      ).filter((location): location is GeocodedLocation => location !== null);

      if (isCancelled || !map) return;

      const pinIcon = L.divIcon({
        className: "",
        html: '<span class="block size-4 rounded-full border-[3px] border-surface-strong bg-thread-red shadow-[0_1px_4px_rgb(33_31_27_/_55%)]"></span>',
        iconAnchor: [8, 8],
        iconSize: [16, 16],
      });
      const bounds = L.latLngBounds([]);

      geocodedLocations.forEach((location) => {
        const coordinates = L.latLng(location.latitude, location.longitude);
        L.marker(coordinates, { icon: pinIcon }).addTo(map!).bindPopup(location.name);
        bounds.extend(coordinates);
      });

      if (bounds.isValid()) map.fitBounds(bounds, { maxZoom: 12, padding: [35, 35] });
      setStatus(geocodedLocations.length > 0 ? "ready" : "empty");
    }

    void initializeMap();

    return () => {
      isCancelled = true;
      map?.remove();
    };
  }, [locations]);

  return (
    <div className="relative h-full min-h-[430px] bg-surface-strong">
      <div className="h-full min-h-[430px] w-full" ref={mapElementRef} />
      {status === "loading" ? (
        <div className="absolute inset-0 z-[500] grid place-items-center bg-surface-strong text-sm font-bold text-muted">
          Helyszínek betöltése…
        </div>
      ) : null}
      {status === "empty" ? (
        <div className="absolute inset-0 z-[500] grid place-items-center bg-surface-strong p-6 text-center text-sm font-bold text-muted">
          A helyszínek nem jeleníthetők meg a térképen.
        </div>
      ) : null}
    </div>
  );
}
