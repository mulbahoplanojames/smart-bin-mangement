"use client";

import dynamic from "next/dynamic";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { FiMaximize2, FiLayers, FiPlus, FiMinus, FiMapPin, FiImage } from "react-icons/fi";
import { useState } from "react";

// Dynamic import for the MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(
  () => import("@/components/dashboard/MapComponent"),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-[2rem] bg-[#11131a]" />
  }
);

export default function LiveMapPage() {
  const { bins, loading } = useDashboardData();
  const [viewMode, setViewMode] = useState<"dark" | "satellite">("dark");
  const [zoom, setZoom] = useState(14);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 20));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 1));
  const toggleViewMode = () => setViewMode(prev => prev === "dark" ? "satellite" : "dark");

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
            <h1 className="text-white font-black tracking-tighter text-3xl">Live Fleet Radar</h1>
          </div>
          <p className="text-gray-500 font-bold text-sm">
            Real-time telemetry and geographical distribution of Kigali smart bins.
          </p>
        </div>

        {/* Legend / Status Toggles */}
        <div className="flex flex-wrap items-center gap-3 bg-[#11131a]/50 p-2 rounded-2xl border border-[#1e2029]/60">
          {[
            { label: "Safe", color: "#10b981" },
            { label: "Warning", color: "#fbbf24" },
            { label: "Critical", color: "#ef4444" },
            { label: "Dispatched", color: "#3b82f6" },
          ].map((status) => (
            <div key={status.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: status.color }} 
              />
              <span className="text-gray-400 text-xs font-black uppercase tracking-widest">{status.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-[#11131a] border border-[#1e2029]/60 rounded-[2.5rem] p-4 shadow-2xl overflow-hidden group">
        <div className="w-full h-full rounded-[2rem] overflow-hidden border border-[#1e2029]/40 relative">
          <MapComponent bins={bins} viewMode={viewMode} zoom={zoom} />
          
          {/* Top Right: View Mode Toggle & Custom Zoom Controls */}
          <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3">
            {/* View Mode Switcher */}
            <div className="bg-[#11131a] border border-[#1e2029] rounded-xl shadow-2xl p-1.5 flex flex-col gap-1.5">
              <button 
                onClick={() => setViewMode("dark")}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${viewMode === "dark" ? "bg-[#10b981] text-white shadow-[0_0_15px_#10b981]" : "text-gray-500 hover:text-white"}`}
                title="Default (Dark) View"
              >
                <FiMapPin size={20} />
              </button>
              <button 
                onClick={() => setViewMode("satellite")}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${viewMode === "satellite" ? "bg-[#10b981] text-white shadow-[0_0_15px_#10b981]" : "text-gray-500 hover:text-white"}`}
                title="Satellite (2D House) View"
              >
                <FiImage size={20} />
              </button>
            </div>

            {/* Custom Zoom Controls */}
            <div className="bg-[#11131a] border border-[#1e2029] rounded-xl shadow-2xl p-1.5 flex flex-col gap-1.5">
              <button 
                onClick={handleZoomIn}
                className="w-10 h-10 bg-white/5 border border-white/5 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                title="Zoom In"
              >
                <FiPlus size={20} />
              </button>
              <button 
                onClick={handleZoomOut}
                className="w-10 h-10 bg-white/5 border border-white/5 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                title="Zoom Out"
              >
                <FiMinus size={20} />
              </button>
            </div>

            {/* Maximize Toggle (Feature placeholder) */}
            <button className="w-13 h-13 bg-[#11131a] border border-[#1e2029] text-gray-400 hover:text-white rounded-xl flex items-center justify-center shadow-2xl transition-all hover:bg-[#1a1c25]">
              <FiLayers size={18} />
            </button>
          </div>

          {/* Bottom Left: Location Label Overlay */}
          <div className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
             <div className="bg-[#11131a]/60 backdrop-blur-xl border border-[#1e2029] px-6 py-3 rounded-2xl shadow-2xl">
                <span className="text-[24px] text-white/20 font-black tracking-[0.5em] uppercase select-none">KIGALI</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
