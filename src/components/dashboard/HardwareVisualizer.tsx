"use client";
import { useState } from "react"
import { FiTrash2, FiExternalLink, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { Bin } from "@/hooks/useDashboardData"

interface HardwareVisualizerProps {
  bin: Bin | null;
  allBins?: Bin[]
}

export function HardwareVisualizer({ bin, allBins = [] }: HardwareVisualizerProps) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  // Use either the overridden bin or the one selected by the user
  const activeBin = allBins.length > 0 ? allBins[selectedIdx] : bin
  const fillLevel = activeBin?.fillLevel ?? 0;
  const location = activeBin?.location ?? "N/A";
  const serialNumber = activeBin?.id ?? "SN-00000";
  const status = activeBin?.status ?? "Empty"

  const fillColor =
    fillLevel >= 80 ? "#ef4444" :
    fillLevel >= 60 ? "#f59e0b" :
    fillLevel >= 40 ? "#fbbf24" :
    "#10b981"

  return (
    <div className="bg-[#11131a] border border-[#1e2029]/60 p-8 rounded-[2rem] w-full relative overflow-hidden group hover:bg-[#1a1c25] hover:border-[#10b981]/30 transition-all duration-500">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-[#10b981]/10 p-2 rounded-lg">
            <FiTrash2 className="text-[#10b981]" size={18} />
          </div>
          <h3 className="text-white font-[950] tracking-tighter text-2xl">
            Real-Time Hardware Visualizer
          </h3>
        </div>
        <div className="flex items-center gap-2 text-gray-500 hover:text-white cursor-pointer transition-colors">
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">
            View All Registered Bins
          </span>
          <FiExternalLink size={14} />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-12 relative z-10">
        {/* Bin Graphic */}
        <div className="relative w-56 h-72 flex flex-col items-center">
          {/* Cap */}
          <div className="w-36 h-8 bg-[#2a2c35] rounded-t-2xl border-x border-t border-[#3f414d] relative shadow-2xl" />
          <div className="w-44 h-10 bg-[#1e2029] -mt-1 rounded-xl border border-[#33353b] relative z-20 shadow-[-10px_-10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center">
            <span className="text-[10px] text-gray-500 font-black tracking-[0.3em] uppercase">
              {serialNumber}
            </span>
          </div>

          {/* Body */}
          <div className="w-36 h-52 bg-gradient-to-b from-[#1e2029] to-[#0a0b0f] border-x border-b border-[#33353b] -mt-1 rounded-b-3xl relative overflow-hidden shadow-[inset_0_20px_40px_rgba(0,0,0,0.8)]">
            {/* Ridges */}
            <div className="flex justify-evenly h-full px-3 opacity-20">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="w-px h-full bg-white/20" />
              ))}
            </div>
            {/* Fill Level — color driven by actual fillLevel value */}
            <div
              className="absolute bottom-0 left-0 w-full transition-all duration-1000"
              style={{
                height: `${fillLevel}%`,
                background: `linear-gradient(to top, ${fillColor}, ${fillColor}55)`,
                borderTop: `4px solid ${fillColor}`,
                boxShadow: `0 0 40px ${fillColor}40`,
              }}
            />
          </div>

          {/* Wheels */}
          <div className="flex gap-32 absolute -bottom-3">
            <div className="w-6 h-6 bg-black rounded-full border border-gray-900 shadow-xl" />
            <div className="w-6 h-6 bg-black rounded-full border border-gray-900 shadow-xl" />
          </div>
        </div>

        <div className="flex flex-col items-center mt-14 gap-1">
          <span
            className="font-[950] tracking-tighter text-6xl"
            style={{ color: fillColor, textShadow: `0 0 20px ${fillColor}60` }}
          >
            {fillLevel}%
          </span>
          <span className="text-gray-500 text-lg font-black tracking-tight mt-2">{location}</span>
          {/* Status badge */}
          <span
            className="mt-3 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border"
            style={{ color: fillColor, borderColor: `${fillColor}40`, backgroundColor: `${fillColor}10` }}
          >
            {status}
          </span>
          {/* Bin navigator (only when multiple bins exist) */}
          {allBins.length > 1 && (
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={() => setSelectedIdx((i) => Math.max(0, i - 1))}
                disabled={selectedIdx === 0}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
              >
                <FiChevronLeft size={16} />
              </button>
              <span className="text-gray-500 text-xs font-black uppercase tracking-widest">
                {selectedIdx + 1} / {allBins.length}
              </span>
              <button
                onClick={() => setSelectedIdx((i) => Math.min(allBins.length - 1, i + 1))}
                disabled={selectedIdx === allBins.length - 1}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#10b981]/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
