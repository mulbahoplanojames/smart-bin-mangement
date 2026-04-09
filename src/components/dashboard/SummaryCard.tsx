"use client"
import { IconType } from "react-icons"

interface SummaryCardProps {
  title: string
  value: string | number
  sub?: string
  stat: string
  statLabel: string
  statColor: string
  icon: IconType
  iconBg: string
  iconColor: string
}

export function SummaryCard({ title, value, sub, stat, statLabel, statColor, icon: Icon, iconBg, iconColor }: SummaryCardProps) {
  return (
    <div className="bg-[#11131a] border border-[#1e2029]/60 p-7 rounded-[2rem] group hover:bg-[#1a1c25] hover:border-[#10b981]/30 transition-all duration-500 cursor-default">
      <div className="flex justify-between items-center mb-10">
        <p className="text-gray-500 font-bold text-[11px] tracking-[0.15em] uppercase">{title}</p>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-inner ${iconBg} ${iconColor}`}>
          <Icon size={24} />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-white font-[950] tracking-tighter leading-none text-4xl">{value}</span>
        {sub && <span className="text-gray-600 font-black text-xs tracking-widest uppercase">{sub}</span>}
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-[12px] font-black tracking-tight ${statColor}`}>{stat}</span>
        <span className="text-[12px] text-gray-700 font-black uppercase tracking-tight">{statLabel}</span>
      </div>

      {/* Indicator bar */}
      <div className="w-full h-1.5 bg-gray-900/50 rounded-full mt-6 overflow-hidden">
        <div className={`h-full rounded-full opacity-40 ${iconColor.replace("text-", "bg-")}`} style={{ width: "40%" }} />
      </div>
    </div>
  )
}
