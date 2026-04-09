"use client"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"

// ─── Exact DB column types from schema ────────────────────────────────────────

export interface Bin {
  id: string              // TEXT PRIMARY KEY, e.g. 'BIN-001'
  location: string
  latitude: number
  longitude: number
  fillLevel: number       // quoted "fillLevel" INTEGER 0-100
  status: "Empty" | "Medium" | "Full" | "Overflow" | "Offline"
  created_at: string
}

export interface Collection {
  id: string              // UUID
  driverId: string | null // quoted "driverId" UUID
  route: string
  wasteCollected: number  // quoted "wasteCollected" DOUBLE PRECISION
  status: "Pending" | "Completed"
  timestamp: string
}

export interface Alert {
  id: string              // UUID
  type: "Bin Overflow" | "Sensor Offline" | "Collection Delay" | "Other"
  priority: "High" | "Medium" | "Low"
  binId: string | null    // quoted "binId" TEXT
  status: "Active" | "Acknowledged" | "Resolved"
  timestamp: string
}

export interface AnalyticsPoint {
  name: string    // week label
  waste: number   // total wasteCollected for that week
  trips: number   // number of completed collections for that week
}

export interface DashboardSummary {
  totalBins: number
  collectedToday: number
  avgFillLevel: number
  activeAlerts: number
  totalStaff: number
  pendingCollections: number
}

export interface DashboardData {
  summary: DashboardSummary
  bins: Bin[]
  collections: Collection[]
  alerts: Alert[]
  activeAlerts: Alert[]
  fillDistribution: { range: string; count: number; color: string }[]
  analytics: AnalyticsPoint[]
  loading: boolean
  error: string | null
}

// ─── Empty / loading state ────────────────────────────────────────────────────

const EMPTY_FILL_DISTRIBUTION = [
  { range: "0-20%", count: 0, color: "#10b981" },
  { range: "20-40%", count: 0, color: "#34d399" },
  { range: "40-60%", count: 0, color: "#fbbf24" },
  { range: "60-80%", count: 0, color: "#f59e0b" },
  { range: "80-100%", count: 0, color: "#ef4444" },
]

const INITIAL_STATE: DashboardData = {
  summary: {
    totalBins: 0,
    collectedToday: 0,
    avgFillLevel: 0,
    activeAlerts: 0,
    totalStaff: 0,
    pendingCollections: 0,
  },
  bins: [],
  collections: [],
  alerts: [],
  activeAlerts: [],
  fillDistribution: EMPTY_FILL_DISTRIBUTION,
  analytics: [],
  loading: true,
  error: null,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Group completed collections by ISO week and aggregate totals. */
function buildAnalytics(collections: Collection[]): AnalyticsPoint[] {
  const weekMap: Record<string, { waste: number; trips: number }> = {}

  for (const col of collections) {
    if (col.status !== "Completed") continue
    const date = new Date(col.timestamp)
    // ISO week: YYYY-Www
    const year = date.getFullYear()
    const jan4 = new Date(year, 0, 4)
    const weekNum =
      Math.ceil(((date.getTime() - jan4.getTime()) / 86400000 + jan4.getDay() + 1) / 7)
    const key = `${year}-W${String(weekNum).padStart(2, "0")}`
    if (!weekMap[key]) weekMap[key] = { waste: 0, trips: 0 }
    weekMap[key].waste += col.wasteCollected
    weekMap[key].trips += 1
  }

  // Sort by key and take the last 8 weeks
  return Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([key, val]) => ({
      name: key.replace(/-W/, " W"),
      waste: Math.round(val.waste * 10) / 10,
      trips: val.trips,
    }))
}

/** Calculate fill-level distribution across all bins. */
function buildFillDistribution(bins: Bin[]) {
  return [
    { range: "0-20%",   count: bins.filter((b) => b.fillLevel <= 20).length,                            color: "#10b981" },
    { range: "20-40%",  count: bins.filter((b) => b.fillLevel > 20 && b.fillLevel <= 40).length,        color: "#34d399" },
    { range: "40-60%",  count: bins.filter((b) => b.fillLevel > 40 && b.fillLevel <= 60).length,        color: "#fbbf24" },
    { range: "60-80%",  count: bins.filter((b) => b.fillLevel > 60 && b.fillLevel <= 80).length,        color: "#f59e0b" },
    { range: "80-100%", count: bins.filter((b) => b.fillLevel > 80).length,                             color: "#ef4444" },
  ]
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboardData(): DashboardData {
  const [state, setState] = useState<DashboardData>(INITIAL_STATE)
  const supabase = useRef(createClient()).current

  useEffect(() => {
    async function fetchAll() {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        // Fetch all four tables in parallel
        const [
          { data: rawBins,       error: binsErr },
          { data: rawCollections, error: colsErr },
          { data: rawAlerts,     error: alertsErr },
          { data: rawUsers,      error: usersErr },
        ] = await Promise.all([
          supabase.from("bins").select("*").order("created_at", { ascending: false }),
          supabase.from("collections").select("*").order("timestamp", { ascending: false }),
          supabase.from("alerts").select("*").order("timestamp", { ascending: false }),
          supabase.from("users").select("id, role"),
        ])

        if (binsErr)   throw new Error(`Bins: ${binsErr.message}`)
        if (colsErr)   throw new Error(`Collections: ${colsErr.message}`)
        if (alertsErr) throw new Error(`Alerts: ${alertsErr.message}`)
        // usersErr is non-fatal (admin-only table may be restricted)

        // Normalise quoted column names that Supabase returns as camelCase
        const bins: Bin[] = (rawBins ?? []).map((b) => ({
          ...b,
          fillLevel: b.fillLevel ?? b["fillLevel"] ?? 0,
        }))

        const collections: Collection[] = (rawCollections ?? []).map((c) => ({
          ...c,
          driverId:       c.driverId       ?? c["driverId"]       ?? null,
          wasteCollected: c.wasteCollected  ?? c["wasteCollected"] ?? 0,
        }))

        const alerts: Alert[] = (rawAlerts ?? []).map((a) => ({
          ...a,
          binId: a.binId ?? a["binId"] ?? null,
        }))

        // ── Derived values ──────────────────────────────────────────────────

        const activeAlerts = alerts.filter((a) => a.status === "Active")

        const totalBins = bins.length
        const avgFillLevel = totalBins
          ? bins.reduce((sum, b) => sum + b.fillLevel, 0) / totalBins
          : 0

        // Today's completed collections (user's local date)
        const todayPrefix = new Date().toISOString().split("T")[0]
        const collectedToday = collections
          .filter((c) => c.status === "Completed" && c.timestamp.startsWith(todayPrefix))
          .reduce((sum, c) => sum + c.wasteCollected, 0)

        const pendingCollections = collections.filter((c) => c.status === "Pending").length

        const totalStaff = usersErr
          ? 0
          : (rawUsers ?? []).filter((u) => u.role !== "admin").length

        setState({
          summary: {
            totalBins,
            collectedToday,
            avgFillLevel,
            activeAlerts: activeAlerts.length,
            totalStaff,
            pendingCollections,
          },
          bins,
          collections,
          alerts,
          activeAlerts,
          fillDistribution: buildFillDistribution(bins),
          analytics: buildAnalytics(collections),
          loading: false,
          error: null,
        })
      } catch (err: any) {
        console.error("[useDashboardData]", err)
        setState((prev) => ({ ...prev, loading: false, error: err.message }))
      }
    }

    fetchAll()

    // ── Realtime subscriptions ──────────────────────────────────────────────
    // Re-fetch whenever bins, alerts, or collections change in Supabase
    const channel = supabase
      .channel("dashboard_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bins" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "collections" }, fetchAll)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return state
}
