"use client"
import type { Bin } from "@/hooks/useDashboardData"

const STATUS_COLOR: Record<string, string> = {
  Empty:    "#10b981",
  Medium:   "#fbbf24",
  Full:     "#f59e0b",
  Overflow: "#ef4444",
  Offline:  "#6b7280",
}

const STATUS_GLOW: Record<string, string> = {
  Empty:    "rgba(16,185,129,0.5)",
  Medium:   "rgba(251,191,36,0.5)",
  Full:     "rgba(245,158,11,0.5)",
  Overflow: "rgba(239,68,68,0.5)",
  Offline:  "rgba(107,114,128,0.3)",
}

interface LiveBinOverviewProps {
  bins?: Bin[]
}

export function LiveBinOverview({ bins = [] }: LiveBinOverviewProps) {
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

      {/* Map */}
      <div className="flex-1 w-full rounded-3xl overflow-hidden border border-[#1e2029]/80 relative bg-[#0a0b0f] shadow-2xl min-h-[320px]">
        <div className="w-full h-full bg-[#07080a] flex items-center justify-center relative">
          {/* Background map texture */}
          <div
            className="absolute inset-0 opacity-40 grayscale contrast-125"
            style={{
              backgroundImage: 'url("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png")',
              backgroundSize: "cover",
              backgroundBlendMode: "multiply",
            }}
          />

          {/* If bins exist, show each as a positioned marker */}
          {bins.length > 0 ? (
            bins.map((bin) => {
              const color = STATUS_COLOR[bin.status] ?? "#10b981"
              const glow  = STATUS_GLOW[bin.status]  ?? "rgba(16,185,129,0.5)"
              return (
                <div key={bin.id} className="relative group/bin">
                  {/* Pulse ring */}
                  {bin.status !== "Offline" && (
                    <div
                      className="w-16 h-16 rounded-full animate-ping absolute -left-4 -top-4"
                      style={{ backgroundColor: `${color}20` }}
                    />
                  )}
                  {/* Dot */}
                  <div
                    className="w-10 h-10 rounded-full border-2 flex items-center justify-center relative cursor-pointer"
                    style={{
                      backgroundColor: `${color}30`,
                      borderColor: color,
                      boxShadow: `0 0 20px ${glow}`,
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#11131a] border border-[#1e2029] px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover/bin:opacity-100 transition-opacity z-10">
                      <p className="text-white text-[11px] font-black uppercase tracking-widest">{bin.id}</p>
                      <p className="text-gray-400 text-[10px] font-bold mt-0.5 truncate max-w-[140px]">{bin.location}</p>
                      <p className="text-[10px] font-black mt-0.5" style={{ color }}>
                        {bin.fillLevel}% — {bin.status}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            // Default Kigali marker when no bins are in DB yet
            <div className="relative">
              <div className="w-20 h-20 bg-[#10b981]/20 rounded-full animate-ping absolute -left-6 -top-6" />
              <div className="w-10 h-10 bg-[#10b981]/30 rounded-full border-2 border-[#10b981] flex items-center justify-center relative shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                <div className="w-4 h-4 bg-[#10b981] rounded-full shadow-[0_0_15px_#10b981]" />
                <div className="absolute -top-12 bg-[#11131a] border border-[#1e2029] px-3 py-1.5 rounded-lg shadow-2xl whitespace-nowrap">
                  <span className="text-white text-[10px] font-black uppercase tracking-widest">Kigali</span>
                </div>
              </div>
            </div>
          )}

          {/* City label watermark */}
          <div className="absolute bottom-8 right-8 pointer-events-none">
            <span className="text-[32px] text-white/5 font-black tracking-[0.3em] uppercase select-none">KIGALI</span>
          </div>

          <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1.5 rounded-lg text-[9px] text-gray-700 font-black border border-white/5 backdrop-blur-xl">
            Leaflet | © CARTO
          </div>
        </div>
      </div>

      {/* Legend */}
      {bins.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-6">
          {Object.entries(STATUS_COLOR).map(([status, color]) => {
            const count = bins.filter((b) => b.status === status).length
            if (count === 0) return null
            return (
              <div key={status} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">
                  {status} ({count})
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
