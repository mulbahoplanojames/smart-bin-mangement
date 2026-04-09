"use client"
import { IconType } from "react-icons"

interface QuickActionCardProps {
  title: string
  description: string
  icon: IconType
  iconBg: string
  iconColor: string
}

export function QuickActionCard({ title, description, icon: Icon, iconBg, iconColor }: QuickActionCardProps) {
  return (
    <div className="bg-[#11131a] border border-[#1e2029] p-4 rounded-2xl cursor-pointer hover:bg-[#1a1c25] hover:border-[#33353b] transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6 ${iconBg} ${iconColor}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-white text-sm font-black tracking-tight">{title}</p>
          <p className="text-gray-500 text-[11px] font-bold">{description}</p>
        </div>
      </div>
    </div>
  )
}
