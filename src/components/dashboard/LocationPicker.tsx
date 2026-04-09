"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";

// Custom icon for the picker
const pickerIcon = L.divIcon({
  className: "custom-picker-icon",
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-10 h-10 rounded-full bg-[#10b981]/20 animate-pulse"></div>
      <div class="w-5 h-5 rounded-full border-2 border-white shadow-lg relative z-10 bg-[#10b981]"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Component to handle map interactions from props
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPos?: [number, number];
  viewMode: "dark" | "satellite";
  zoom: number;
}

function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const TILES = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

export default function LocationPicker({ onLocationSelect, initialPos, viewMode, zoom }: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<[number, number] | null>(initialPos || null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialPos) {
      setPos(initialPos);
    }
  }, [initialPos]);

  if (!mounted) return null;

  const center: [number, number] = pos || [-1.9441, 30.0619];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%", background: "#07080a" }}
      zoomControl={false}
    >
      <TileLayer
        attribution={viewMode === "dark" 
            ? '&copy; <a href="https://carto.com/attributions">CARTO</a>'
            : 'Tiles &copy; Esri &mdash; HQ Imagery'
        }
        url={TILES[viewMode]}
      />
      
      <MapController center={center} zoom={zoom} />
      
      <ClickHandler onLocationSelect={(lat, lng) => {
        setPos([lat, lng]);
        onLocationSelect(lat, lng);
      }} />

      {pos && <Marker position={pos} icon={pickerIcon} />}
    </MapContainer>
  );
}
