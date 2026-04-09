"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Bin } from "@/hooks/useDashboardData";
import { useEffect, useState } from "react";

// Helper to create custom colored div icons for Leaflet
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full opacity-40 animate-ping" style="background-color: ${color}"></div>
        <div class="w-4 h-4 rounded-full border-2 border-white shadow-lg relative z-10" style="background-color: ${color}; box-shadow: 0 0 10px ${color}"></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Component to handle map interactions from props
function MapController({ center, zoom, layerType }: { center: [number, number], zoom: number, layerType: "dark" | "satellite" }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);

  return null;
}

interface MapComponentProps {
  bins: Bin[];
  viewMode: "dark" | "satellite";
  zoom: number;
}

export const getStatusColor = (fillLevel: number, status?: string) => {
  if (status === "Offline") return "#6b7280";
  if (fillLevel >= 90) return "#ef4444"; // Critical (Red)
  if (fillLevel >= 50) return "#f59e0b"; // Warning (Orange)
  return "#10b981"; // Safe (Green)
};

const TILES = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

export default function MapComponent({ bins, viewMode, zoom }: MapComponentProps) {
  const [mounted, setMounted] = useState(false);
  const center: [number, number] = [-1.9441, 30.0619]; // Kigali Center

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%", background: "#07080a" }}
      zoomControl={false}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution={viewMode === "dark" 
          ? '&copy; <a href="https://carto.com/attributions">CARTO</a>'
          : 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
        url={TILES[viewMode]}
      />

      <MapController center={center} zoom={zoom} layerType={viewMode} />

      {bins.map((bin) => {
        const color = getStatusColor(bin.fillLevel, bin.status);
        
        return (
          <Marker
            key={bin.id}
            position={[bin.latitude, bin.longitude]}
            icon={createCustomIcon(color)}
          >
            <Popup className="custom-popup" offset={[0, -5]}>
              <div className="bg-[#11131a] text-white p-1 min-w-[120px]">
                <div className="flex items-center justify-between mb-2">
                   <p className="font-black text-xs uppercase tracking-widest">{bin.id}</p>
                   <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                </div>
                <p className="text-[10px] text-gray-500 font-bold mb-3">{bin.location}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-black uppercase">Fill Level</span>
                  <span className="text-xs font-[950]" style={{ color }}>{bin.fillLevel}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                   <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${bin.fillLevel}%`, backgroundColor: color }} />
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
