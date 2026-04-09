"use client"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Collection } from "@/hooks/useDashboardData"

interface AnalyticsOverviewProps {
  data: { name: string; waste: number; trips: number }[]
  collections?: Collection[]
}

export function AnalyticsOverview({ data, collections = [] }: AnalyticsOverviewProps) {
  // Compute real header stats from collections
  const completedCols = collections.filter((c) => c.status === "Completed")
  const totalWaste = completedCols.reduce((sum, c) => sum + c.wasteCollected, 0)
  const totalTrips = completedCols.length
  const pendingCols = collections.filter((c) => c.status === "Pending").length
  const efficiency =
    collections.length > 0
      ? Math.round((completedCols.length / collections.length) * 100)
      : 0

  return (
    <div className="bg-[#11131a] border border-[#1e2029]/60 p-8 rounded-[2rem] h-full flex flex-col group hover:bg-[#1a1c25] hover:border-[#3b82f6]/30 transition-all duration-500">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-white font-[950] tracking-tighter leading-none mb-3 text-2xl">Analytics Overview</h3>
          <div className="flex gap-8 mt-10 flex-wrap">
            <div>
              <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Collected</p>
              <p className="text-white font-[900] tracking-tighter text-2xl">
                {totalWaste.toFixed(1)} <span className="text-gray-600 font-bold text-sm tracking-normal">ton</span>
              </p>
              <p className="text-[#10b981] text-xs font-black mt-2 tracking-tight">{totalTrips} trip{totalTrips !== 1 ? "s" : ""}</p>
            </div>
            <div className="w-px h-12 bg-[#1e2029] hidden sm:block" />
            <div>
              <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Collection Trips</p>
              <p className="text-white font-[900] tracking-tighter text-2xl">{totalTrips}</p>
              <p className="text-[#10b981] text-xs font-black mt-2 tracking-tight">{pendingCols} pending</p>
            </div>
            <div className="w-px h-12 bg-[#1e2029] hidden sm:block" />
            <div>
              <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Efficiency</p>
              <p className="text-white font-[900] tracking-tighter text-2xl">{efficiency}%</p>
              <p className={`text-xs font-black mt-2 tracking-tight ${efficiency >= 80 ? 'text-[#10b981]' : efficiency >= 50 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>
                {efficiency >= 80 ? 'Excellent' : efficiency >= 50 ? 'Moderate' : 'Low'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#1e2029] px-4 py-2 rounded-xl border border-gray-800 cursor-pointer hover:bg-[#2a2c35] transition-colors flex-shrink-0 flex items-center gap-3">
          <span className="text-gray-400 text-[11px] font-[900] uppercase tracking-[0.1em]">This Month</span>
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-500" />
        </div>
      </div>

      <div className="flex-1 min-h-[300px] w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2029" opacity={0.5} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#4a4b51", fontSize: 10, fontWeight: 900 }} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#4a4b51", fontSize: 10, fontWeight: 900 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#11131a", border: "1px solid #333", borderRadius: "16px", padding: "12px" }}
              itemStyle={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}
              cursor={{ stroke: "#333", strokeWidth: 1 }}
            />
            <Area type="monotone" dataKey="waste" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorWaste)" />
            <Area type="monotone" dataKey="trips" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTrips)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-10 mt-10 justify-center">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-4 border-[#10b981] bg-white/5" />
          <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Waste Collected (ton)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-4 border-[#3b82f6] bg-white/5" />
          <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Collection Trips</span>
        </div>
      </div>
    </div>
  )
}
