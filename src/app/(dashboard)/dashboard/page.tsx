"use client"
import {
  FiSearch, FiBell, FiCalendar, FiTrash2, FiTruck,
  FiPieChart, FiAlertTriangle, FiPlusSquare, FiUsers,
  FiFileText, FiClock,
} from "react-icons/fi"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview"
import { FillLevelDistribution } from "@/components/dashboard/FillLevelDistribution"
import { HardwareVisualizer } from "@/components/dashboard/HardwareVisualizer"
import { ActivityList } from "@/components/dashboard/ActivityList"
import { LiveBinOverview } from "@/components/dashboard/LiveBinOverview"
import { useDashboardData } from "@/hooks/useDashboardData"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"

// ─── Skeleton loader shown while data is fetching ────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="pb-10 space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[160px] rounded-[2rem] bg-[#11131a]" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[2.1fr_1fr] gap-8">
        <Skeleton className="h-[400px] rounded-[2rem] bg-[#11131a]" />
        <Skeleton className="h-[400px] rounded-[2rem] bg-[#11131a]" />
      </div>
      <Skeleton className="h-[480px] rounded-[2rem] bg-[#11131a]" />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DashboardOverview() {
  const data = useDashboardData()
  const { summary, bins, loading, error } = data
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      const name =
        session.user.user_metadata?.name ??
        session.user.email?.split("@")[0] ??
        "there"
      setUserName(name)
    })
  }, [])

  // Format today's date dynamically
  const today = new Date().toLocaleDateString("en-US", {
    month: "short", day: "2-digit", year: "numeric",
  })

  return (
    <div className="pb-10">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 lg:mb-12">
        <div>
          <h1 className="text-white font-black tracking-tighter mb-1 text-2xl sm:text-3xl">
            {userName ? `Welcome back, ${userName}! 👋` : "Dashboard Overview 📊"}
          </h1>
          <p className="text-gray-500 font-bold text-sm">
            Monitor your waste management system in real-time.
          </p>
        </div>
        {/* Search + controls — search always shown, bell/calendar hidden on mobile (shown in topbar) */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 lg:w-72">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 z-10"
              size={16}
            />
            <Input
              placeholder="Search..."
              className="bg-[#11131a] border-[#1e2029]/60 text-gray-300 placeholder:text-gray-700 focus-visible:border-[#10b981] rounded-xl pl-11 h-11 w-full"
            />
          </div>
          {/* These are hidden on mobile — user can access them from the mobile topbar */}
          <Button
            variant="outline"
            size="icon"
            className="hidden sm:flex bg-[#11131a] border-[#1e2029]/60 h-11 w-11 rounded-xl hover:bg-white/5 transition-colors flex-shrink-0"
          >
            <FiBell size={17} className="text-gray-400" />
          </Button>
          <Button
            variant="outline"
            className="hidden md:flex bg-[#11131a] border-[#1e2029]/60 h-11 px-4 rounded-xl hover:bg-white/5 items-center gap-2 text-gray-300 transition-colors flex-shrink-0"
          >
            <FiCalendar size={16} />
            <span className="text-xs font-[900] tracking-tight uppercase">{today}</span>
          </Button>
        </div>
      </div>

      {/* ── Error banner ───────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-bold">
          ⚠️ Failed to load some data: {error}. Check your Supabase environment variables or run the schema SQL.
        </div>
      )}

      {/* ── Skeleton while loading ──────────────────────────────────────────── */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* ── Summary Cards ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 lg:mb-10">
            {/* 1. Total Bins — from bins table */}
            <SummaryCard
              title="Total Bins"
              value={summary.totalBins}
              stat={summary.totalBins > 0 ? `${summary.totalBins} registered` : "No bins yet"}
              statLabel=""
              statColor="text-[#10b981]"
              icon={FiTrash2}
              iconBg="bg-[#10b981]/10"
              iconColor="text-[#10b981]"
            />
            {/* 2. Waste Collected Today — from collections table (today, Completed) */}
            <SummaryCard
              title="Collected Today"
              value={summary.collectedToday.toFixed(1)}
              sub="ton"
              stat={summary.collectedToday > 0 ? "Active today" : "No collections today"}
              statLabel=""
              statColor="text-[#3b82f6]"
              icon={FiTruck}
              iconBg="bg-[#3b82f6]/10"
              iconColor="text-[#3b82f6]"
            />
            {/* 3. Average Fill Level — from bins table */}
            <SummaryCard
              title="Fill Level (Avg.)"
              value={`${Math.round(summary.avgFillLevel)}%`}
              stat={
                summary.avgFillLevel >= 80
                  ? "⚠ Critical"
                  : summary.avgFillLevel >= 50
                  ? "Moderate"
                  : "Healthy"
              }
              statLabel=""
              statColor={
                summary.avgFillLevel >= 80
                  ? "text-[#ef4444]"
                  : summary.avgFillLevel >= 50
                  ? "text-[#f59e0b]"
                  : "text-[#10b981]"
              }
              icon={FiPieChart}
              iconBg="bg-[#f59e0b]/10"
              iconColor="text-[#f59e0b]"
            />
            {/* 4. Active Alerts — from alerts table (status = 'Active') */}
            <SummaryCard
              title="Active Alerts"
              value={summary.activeAlerts}
              stat={summary.activeAlerts > 0 ? "Needs attention" : "All clear"}
              statLabel=""
              statColor={summary.activeAlerts > 0 ? "text-[#ef4444]" : "text-[#10b981]"}
              icon={FiAlertTriangle}
              iconBg="bg-[#ef4444]/10"
              iconColor="text-[#ef4444]"
            />
          </div>

          {/* ── Secondary summary row ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 lg:mb-10">
            {/* 5. Pending Collections — from collections table (status = 'Pending') */}
            <SummaryCard
              title="Pending Collections"
              value={summary.pendingCollections}
              stat={summary.pendingCollections > 0 ? "Awaiting dispatch" : "None pending"}
              statLabel=""
              statColor={summary.pendingCollections > 0 ? "text-[#f59e0b]" : "text-[#10b981]"}
              icon={FiClock}
              iconBg="bg-[#f59e0b]/10"
              iconColor="text-[#f59e0b]"
            />
            {/* 6. Total Staff — from users table (role != 'admin') */}
            <SummaryCard
              title="Total Staff"
              value={summary.totalStaff}
              stat={summary.totalStaff > 0 ? "Active members" : "No staff yet"}
              statLabel=""
              statColor="text-purple-400"
              icon={FiUsers}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-400"
            />
          </div>

          {/* ── Live Map & Fill Distribution ─────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-[2.1fr_1fr] gap-4 sm:gap-6 lg:gap-8 mb-8 lg:mb-10">
            {/* bins with lat/lng fed to map */}
            <LiveBinOverview bins={data.bins} />
            {/* distribution computed from bins.fillLevel */}
            <FillLevelDistribution data={data.fillDistribution} />
          </div>

          {/* ── Hardware Visualizer — first bin ─────────────────────────────── */}
          <div className="mb-10">
            <HardwareVisualizer bin={bins[0] ?? null} allBins={bins} />
          </div>

          {/* ── Analytics (from collections) & Activity Lists ────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.4fr_0.8fr_0.8fr] gap-4 sm:gap-6 lg:gap-8 mb-10 lg:mb-14">
            {/* chart from real collections grouped by week */}
            <AnalyticsOverview data={data.analytics} collections={data.collections} />
            {/* recent active alerts */}
            <ActivityList
              title="Recent Alerts"
              items={data.activeAlerts.slice(0, 5)}
              type="alert"
            />
            {/* recent collections (any status) */}
            <ActivityList
              title="Recent Collections"
              items={data.collections.slice(0, 5)}
              type="collection"
            />
          </div>

          {/* ── Quick Actions ────────────────────────────────────────────────── */}
          <div>
            <p className="text-white font-[950] text-2xl mb-8 tracking-tighter">Quick Actions</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              {[
                { title: "Register New Bin",   desc: "Add a new smart bin",      icon: FiPlusSquare, bg: "bg-[#10b981]/10",   color: "text-[#10b981]" },
                { title: "Add Driver",          desc: "Register a new driver",   icon: FiTruck,      bg: "bg-[#3b82f6]/10",   color: "text-[#3b82f6]" },
                { title: "Add Staff",           desc: "Invite new staff member", icon: FiUsers,      bg: "bg-purple-500/10",  color: "text-purple-400" },
                { title: "Generate Report",     desc: "Download system report",  icon: FiFileText,   bg: "bg-amber-500/10",   color: "text-amber-400" },
              ].map((action, i) => {
                const Icon = action.icon
                return (
                  <div
                    key={i}
                    className="bg-[#11131a] border border-[#1e2029]/60 p-6 rounded-[2rem] hover:bg-[#1a1c25] hover:border-white/10 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${action.bg} ${action.color}`}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-white text-sm font-black tracking-tight">{action.title}</p>
                        <p className="text-gray-600 text-xs font-bold mt-1 tracking-tight">{action.desc}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
