"use client"
import type { Alert, Collection } from "@/hooks/useDashboardData"
import { FiArrowRight } from "react-icons/fi"

const ALERT_PRIORITY_COLOR: Record<string, string> = {
  High:   "bg-[#ef4444]",
  Medium: "bg-[#f59e0b]",
  Low:    "bg-[#10b981]",
}

const COLLECTION_STATUS_COLOR: Record<string, string> = {
  Completed: "bg-[#10b981]",
  Pending:   "bg-[#f59e0b]",
}

interface ActivityListProps {
  title: string
  items: Alert[] | Collection[]
  type?: "alert" | "collection"
}

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function ActivityList({ title, items, type = "alert" }: ActivityListProps) {
  return (
    <div className="bg-[#11131a] border border-[#1e2029]/60 p-7 rounded-[2rem] h-full flex flex-col group hover:bg-[#1a1c25] transition-all duration-500">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-white font-[950] tracking-tighter text-xl">{title}</h3>
        <div className="flex items-center gap-1.5 cursor-pointer group/all hover:text-white transition-colors">
          <span className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] group-hover/all:text-white transition-colors">
            View All
          </span>
          <FiArrowRight size={11} className="text-gray-700 group-hover/all:text-white transition-colors" />
        </div>
      </div>

      {/* Count badge */}
      {items.length > 0 && (
        <div className="mb-6 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${type === "alert" ? "bg-[#ef4444]" : "bg-[#3b82f6]"} animate-pulse`} />
          <span className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">
            {items.length} {type === "alert" ? "active alert" : "collection"}
            {items.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 opacity-30">
            <div className="w-14 h-14 bg-gray-900/50 rounded-3xl mb-4 flex items-center justify-center border border-gray-800">
              <div className="w-3 h-3 bg-gray-700/50 rounded-full animate-pulse" />
            </div>
            <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.2em] text-center">
              No recent <br /> activity
            </p>
          </div>
        ) : (
          items.map((item: any, i) => {
            const isAlert = type === "alert"
            const dotColor = isAlert
              ? ALERT_PRIORITY_COLOR[item.priority] ?? "bg-[#ef4444]"
              : COLLECTION_STATUS_COLOR[item.status] ?? "bg-[#3b82f6]"

            const primaryText = isAlert
              ? item.type                                     // "Bin Overflow" etc.
              : item.route                                    // route name

            const secondaryText = isAlert
              ? `${item.priority} Priority · ${item.binId ?? "No Bin"}`
              : `${item.status} · ${item.wasteCollected?.toFixed(1) ?? "0"} ton`

            return (
              <div
                key={item.id ?? i}
                className="flex items-center gap-4 p-4 bg-[#1e2029]/30 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-[#1e2029]/50 transition-all cursor-pointer group/item"
              >
                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[13px] font-[900] tracking-tight truncate">
                    {primaryText || "Activity"}
                  </p>
                  <p className="text-gray-600 text-[11px] font-bold mt-0.5 truncate">{secondaryText}</p>
                </div>

                {/* Time */}
                <span className="text-gray-700 text-[10px] font-black flex-shrink-0">
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
