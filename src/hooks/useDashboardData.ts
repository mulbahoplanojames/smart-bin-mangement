"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export interface DashboardData {
  summary: {
    totalBins: number
    collectedToday: number
    avgFillLevel: number
    activeAlerts: number
  }
  bins: any[]
  collections: any[]
  alerts: any[]
  fillDistribution: { range: string, count: number, color: string }[]
  analytics: { name: string, waste: number, trips: number }[]
  loading: boolean
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    summary: { totalBins: 1, collectedToday: 0, avgFillLevel: 0, activeAlerts: 0 },
    bins: [],
    collections: [],
    alerts: [],
    fillDistribution: [
      { range: "0-20%", count: 1, color: "#10b981" },
      { range: "20-40%", count: 0, color: "#10b981" },
      { range: "40-60%", count: 0, color: "#fbbf24" },
      { range: "60-80%", count: 0, color: "#f59e0b" },
      { range: "80-100%", count: 0, color: "#ef4444" },
    ],
    analytics: [
      { name: "May 1", waste: 120, trips: 60 },
      { name: "May 8", waste: 150, trips: 80 },
      { name: "May 15", waste: 130, trips: 70 },
      { name: "May 22", waste: 210, trips: 100 },
      { name: "May 28", waste: 245, trips: 120 },
    ],
    loading: true
  })

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: bins } = await supabase.from('bins').select('*')
        const { data: alerts } = await supabase.from('alerts').select('*').eq('status', 'Active')
        const { data: collections } = await supabase.from('collections').select('*').order('timestamp', { ascending: false })
        
        // Calculate Summary
        const totalBins = bins?.length || 0
        const avgFillLevel = bins?.length ? bins.reduce((acc, b) => acc + b.fillLevel, 0) / bins.length : 0
        const activeAlerts = alerts?.length || 0
        
        // Today's collections
        const today = new Date().toISOString().split('T')[0]
        const collectedToday = collections
          ?.filter(c => c.timestamp.startsWith(today))
          .reduce((acc, c) => acc + c.wasteCollected, 0) || 0

        // Calculate distribution
        const dist = [
          { range: "0-20%", count: bins?.filter(b => b.fillLevel <= 20).length || 0, color: "#10b981" },
          { range: "20-40%", count: bins?.filter(b => b.fillLevel > 20 && b.fillLevel <= 40).length || 0, color: "#10b981" },
          { range: "40-60%", count: bins?.filter(b => b.fillLevel > 40 && b.fillLevel <= 60).length || 0, color: "#fbbf24" },
          { range: "60-80%", count: bins?.filter(b => b.fillLevel > 60 && b.fillLevel <= 80).length || 0, color: "#f59e0b" },
          { range: "80-100%", count: bins?.filter(b => b.fillLevel > 80).length || 0, color: "#ef4444" },
        ]

        setData({
          summary: { totalBins, collectedToday, avgFillLevel, activeAlerts },
          bins: bins || [],
          collections: collections || [],
          alerts: alerts || [],
          fillDistribution: dist,
          analytics: data.analytics, // Keep mock for now or calculate from collections
          loading: false
        })
      } catch (error) {
        console.error("Dashboard Fetch Error:", error)
        setData(prev => ({ ...prev, loading: false }))
      }
    }

    fetchData()
    
    // Subscribe to realtime changes
    const binsChannel = supabase.channel('realtime_bins')
      .on('postgres_changes', { event: '*', table: 'bins', schema: 'public' }, () => fetchData())
      .subscribe()
      
    return () => {
      supabase.removeChannel(binsChannel)
    }
  }, [])

  return data
}
