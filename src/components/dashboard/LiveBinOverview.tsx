"use client";

import type { Bin } from "@/hooks/useDashboardData";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FiPlus, FiMinus, FiMapPin, FiImage } from "react-icons/fi";

import { getStatusColor } from "./MapComponent"

// Dynamic import for the Map component
const MapComponent = dynamic(
  () => import("@/components/dashboard/MapComponent"),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-2xl bg-[#07080a]" />
  }
);

interface LiveBinOverviewProps {
  bins?: Bin[];
}

export function LiveBinOverview({ bins = [] }: LiveBinOverviewProps) {
  const [viewMode, setViewMode] = useState<"dark" | "satellite">("dark");
  const [zoom, setZoom] = useState(13);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 20));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 1));

  // Compute status counts for the legend using the new logic
  const stats = {
    Safe: bins.filter(b => b.status !== "Offline" && b.fillLevel < 50).length,
    Warning: bins.filter(b => b.status !== "Offline" && b.fillLevel >= 50 && b.fillLevel < 90).length,
    Critical: bins.filter(b => b.status !== "Offline" && b.fillLevel >= 90).length,
    Offline: bins.filter(b => b.status === "Offline").length,
  };

  const LEGEND = [
    { label: "Safe", color: "#10b981", count: stats.Safe },
    { label: "Warning", color: "#f59e0b", count: stats.Warning },
    { label: "Critical", color: "#ef4444", count: stats.Critical },
    { label: "Offline", color: "#6b7280", count: stats.Offline },
  ];

  return (
    <div className="bg-[#11131a] border border-[#1e2029]/60 p-8 rounded-[2rem] h-full flex flex-col group hover:bg-[#1a1c25] hover:border-[#10b981]/30 transition-all duration-500 cursor-default">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white font-[950] tracking-tighter leading-none text-2xl">Live Bin Overview</h3>
          <p className="text-gray-600 text-xs font-bold mt-1 tracking-widest uppercase">
            {bins.length} bin{bins.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <span className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors">
          View All
        </span>
      </div>

      {/* Actual Leaflet Map Container */}
      <div className="flex-1 w-full rounded-3xl overflow-hidden border border-[#1e2029]/80 relative bg-[#0a0b0f] shadow-2xl min-h-[320px]">
        <div className="w-full h-full relative">
          <MapComponent bins={bins} viewMode={viewMode} zoom={zoom} />
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <div className="bg-[#11131a]/80 backdrop-blur-md border border-[#1e2029] rounded-xl p-1 flex flex-col gap-1 shadow-2xl">
              <button 
                onClick={() => setViewMode("dark")}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${viewMode === "dark" ? "bg-[#10b981] text-white shadow-[0_0_10px_#10b981]" : "text-gray-500 hover:text-white"}`}
                title="Dark View"
              >
                <FiMapPin size={16} />
              </button>
              <button 
                onClick={() => setViewMode("satellite")}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${viewMode === "satellite" ? "bg-[#10b981] text-white shadow-[0_0_10px_#10b981]" : "text-gray-500 hover:text-white"}`}
                title="Satellite View"
              >
                <FiImage size={16} />
              </button>
            </div>
            <div className="bg-[#11131a]/80 backdrop-blur-md border border-[#1e2029] rounded-xl p-1 flex flex-col gap-1 shadow-2xl">
              <button onClick={handleZoomIn} className="w-9 h-9 hover:bg-white/5 text-gray-500 hover:text-white rounded-lg flex items-center justify-center transition-all">
                <FiPlus size={16} />
              </button>
              <button onClick={handleZoomOut} className="w-9 h-9 hover:bg-white/5 text-gray-500 hover:text-white rounded-lg flex items-center justify-center transition-all">
                <FiMinus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Dynamic Legend */}
      <div className="flex flex-wrap gap-4 mt-6">
        {LEGEND.map((item) => (
          item.count > 0 && (
            <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 bg-[#1e2029]/30 rounded-xl border border-white/5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-none">
                {item.label} ({item.count})
              </span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
