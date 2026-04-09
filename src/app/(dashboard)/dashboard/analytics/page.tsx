"use client";

import { useMemo } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { FiTrendingUp, FiAlertTriangle, FiActivity, FiMapPin, FiBarChart2, FiPieChart } from "react-icons/fi";
import { getStatusColor } from "@/components/dashboard/MapComponent";

export default function AnalyticsPage() {
  const { bins, loading } = useDashboardData();

  // 1. Compute Summary Stats
  const stats = useMemo(() => {
    if (!bins) return { total: 0, critical: 0, avgFill: 0 };
    const total = bins.filter(b => b.status !== "Offline").length;
    const critical = bins.filter(b => b.status !== "Offline" && b.fillLevel >= 90).length;
    const avgFill = total > 0 
      ? Math.round(bins.reduce((acc, b) => acc + (b.fillLevel || 0), 0) / bins.length) 
      : 0;
    
    return { total, critical, avgFill };
  }, [bins]);

  // 2. Format Data for Bar Chart (Top 15 locations by fill level)
  const barData = useMemo(() => {
    if (!bins) return [];
    return [...bins]
      .sort((a, b) => b.fillLevel - a.fillLevel)
      .slice(0, 15)
      .map(b => ({
        name: b.location.split(',')[0], // Shorten name
        fill: b.fillLevel,
        color: getStatusColor(b.fillLevel, b.status)
      }));
  }, [bins]);

  // 3. Format Data for Pie Chart (System Health)
  const pieData = useMemo(() => {
    if (!bins) return [];
    const safe = bins.filter(b => b.status !== "Offline" && b.fillLevel < 50).length;
    const warning = bins.filter(b => b.status !== "Offline" && b.fillLevel >= 50 && b.fillLevel < 90).length;
    const critical = bins.filter(b => b.status !== "Offline" && b.fillLevel >= 90).length;

    return [
      { name: "Safe", value: safe, color: "#10b981" },
      { name: "Warning", value: warning, color: "#fbbf24" },
      { name: "Critical", value: critical, color: "#ef4444" },
    ].filter(d => d.value > 0);
  }, [bins]);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="flex justify-between gap-6">
          <Skeleton className="h-40 w-full rounded-[2rem] bg-[#11131a]" />
          <Skeleton className="h-40 w-full rounded-[2rem] bg-[#11131a]" />
          <Skeleton className="h-40 w-full rounded-[2rem] bg-[#11131a]" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-[2.5rem] bg-[#11131a]" />
      </div>
    );
  }

  return (
    <div className="pb-10 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
            <FiActivity className="text-indigo-400" size={24} />
            <h1 className="text-white font-[950] tracking-tighter text-4xl">System Analytics</h1>
        </div>
        <p className="text-gray-500 font-bold text-sm">Real-time telemetry and capacity overview of all smart bins.</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Active Bins */}
        <div className="bg-[#11131a] border border-[#1e2029]/60 p-8 rounded-[2rem] flex items-center gap-6 shadow-2xl group hover:bg-[#1a1c25] transition-all duration-500">
           <div className="bg-indigo-500/10 p-5 rounded-2xl">
              <FiBarChart2 className="text-indigo-400" size={28} />
           </div>
           <div>
              <p className="text-[#64748b] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Active Bins</p>
              <h2 className="text-white text-5xl font-[950] tracking-tight">{stats.total}</h2>
           </div>
        </div>

        {/* Critical Bins */}
        <div className="bg-[#11131a] border border-[#1e2029]/60 p-8 rounded-[2rem] flex items-center gap-6 shadow-2xl group hover:bg-[#1a1c25] transition-all duration-500">
           <div className="bg-red-500/10 p-5 rounded-2xl">
              <FiAlertTriangle className="text-red-400" size={28} />
           </div>
           <div>
              <p className="text-[#64748b] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Critical Bins</p>
              <h2 className="text-white text-5xl font-[950] tracking-tight">{stats.critical}</h2>
           </div>
        </div>

        {/* Avg Fill Level */}
        <div className="bg-[#11131a] border border-[#1e2029]/60 p-8 rounded-[2rem] flex items-center gap-6 shadow-2xl group hover:bg-[#1a1c25] transition-all duration-500">
           <div className="bg-emerald-500/10 p-5 rounded-2xl">
              <FiTrendingUp className="text-emerald-400" size={28} />
           </div>
           <div>
              <p className="text-[#64748b] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Average Fill Level</p>
              <h2 className="text-white text-5xl font-[950] tracking-tight">{stats.avgFill}%</h2>
           </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Location Fill Levels (Left) */}
        <div className="lg:col-span-8 bg-[#11131a] border border-[#1e2029]/60 rounded-[2.5rem] p-10 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <FiMapPin size={18} className="text-indigo-400" />
                    <h3 className="text-white font-black text-lg tracking-tight">Location Fill Levels (Top 15)</h3>
                </div>
            </div>

            <div className="flex-1 w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2029" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 900 }}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 900 }} 
                            domain={[0, 100]}
                        />
                        <RechartsTooltip 
                             contentStyle={{ backgroundColor: "#11131a", border: "1px solid #1e2029", borderRadius: "12px", color: "#fff" }}
                             itemStyle={{ color: "#fff", fontWeight: 900 }}
                        />
                        <Bar 
                            dataKey="fill" 
                            radius={[6, 6, 0, 0]} 
                            barSize={24}
                        >
                            {barData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* System Health (Right) */}
        <div className="lg:col-span-4 bg-[#11131a] border border-[#1e2029]/60 rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <FiPieChart size={18} className="text-emerald-400" />
                    <h3 className="text-white font-black text-lg tracking-tight">System Health</h3>
                </div>
            </div>

            <div className="flex-1 w-full h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                            contentStyle={{ backgroundColor: "#11131a", border: "1px solid #1e2029", borderRadius: "12px" }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                
                {/* Center Text for Donut Chart */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-[#64748b] text-[10px] font-black uppercase tracking-widest">Efficiency</p>
                    <p className="text-white text-3xl font-[950] tracking-tighter">
                        {bins.length > 0 ? Math.round((stats.total / bins.length) * 100) : 0}%
                    </p>
                </div>
            </div>

            {/* Custom Legend for System Health */}
            <div className="w-full space-y-3 mt-8">
                {pieData.map((item) => (
                    <div key={item.name} className="flex justify-between items-center bg-[#07080a]/50 p-3 rounded-xl border border-[#1e2029]/40">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-gray-400 text-xs font-black tracking-widest uppercase">{item.name}</span>
                        </div>
                        <span className="text-white font-black text-sm">{Math.round((item.value / stats.total) * 100)}%</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
