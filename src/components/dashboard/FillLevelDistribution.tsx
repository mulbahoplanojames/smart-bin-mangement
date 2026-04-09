"use client"
import { BarChart, Bar, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface FillLevelDistributionProps {
  data: { range: string; count: number; color: string }[]
}

export function FillLevelDistribution({ data }: FillLevelDistributionProps) {
  const total = data.reduce((acc, item) => acc + item.count, 0) || 1

  return (
    <div className="bg-[#11131a] border border-[#1e2029]/60 p-8 rounded-[2rem] h-full flex flex-col group hover:bg-[#1a1c25] hover:border-[#10b981]/30 transition-all duration-500">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-white font-[950] tracking-tighter leading-none text-2xl">Fill Level Distribution</h3>
        <div className="bg-[#1e2029] px-4 py-2 rounded-xl border border-gray-800 cursor-pointer hover:bg-[#2a2c35] transition-colors flex items-center gap-3">
          <span className="text-gray-400 text-[11px] font-[900] uppercase tracking-[0.1em]">This Week</span>
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-500" />
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center py-6">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              contentStyle={{ backgroundColor: "#11131a", border: "1px solid #333", borderRadius: "16px", padding: "12px" }}
              itemStyle={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}
            />
            <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.count > 0 ? entry.color : "#1a1b24"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between mt-8 px-2">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
            <div
              className="w-3 h-3 rounded-md shadow-sm"
              style={{ backgroundColor: item.color, opacity: item.count > 0 ? 1 : 0.2 }}
            />
            <p className="text-[10px] text-gray-700 font-black tracking-widest uppercase">{item.range}</p>
            <p className="text-[16px] text-white font-[950] tracking-tighter">
              {Math.round((item.count / total) * 100)}%
            </p>
            <p className="text-[10px] text-gray-800 font-black">({item.count})</p>
          </div>
        ))}
      </div>
    </div>
  )
}
