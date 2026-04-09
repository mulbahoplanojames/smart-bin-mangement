"use client"
import { Box, Flex, Heading, Text, HStack } from "@chakra-ui/react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

const data = [
  { name: "May 1", waste: 120, trips: 60 },
  { name: "May 8", waste: 150, trips: 80 },
  { name: "May 15", waste: 130, trips: 70 },
  { name: "May 22", waste: 210, trips: 100 },
  { name: "May 28", waste: 245, trips: 120 },
]

interface AnalyticsOverviewProps {
  data: { name: string, waste: number, trips: number }[]
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  return (
    <Box className="bg-[#11131a] border border-[#1e2029]/60 p-8 rounded-[2rem] h-full flex flex-col group hover:bg-[#1a1c25] hover:border-[#3b82f6]/30 transition-all duration-500">
      <Flex justify="space-between" align="center" mb={10}>
        <Box>
            <Heading size="md" className="text-white font-[950] tracking-tighter leading-none mb-3 text-2xl">Analytics Overview</Heading>
            <Flex gap={8} mt={10} flexWrap="wrap">
                <Box>
                    <Text className="text-gray-700 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Collected</Text>
                    <Heading size="md" className="text-white font-[900] tracking-tighter text-2xl">245.6 <Text as="span" className="text-gray-600 font-bold text-sm tracking-normal">ton</Text></Heading>
                    <Text className="text-[#10b981] text-xs font-black mt-2 tracking-tight">+15.6%</Text>
                </Box>
                <Box className="w-[1px] h-12 bg-[#1e2029] hidden sm:block" />
                <Box>
                    <Text className="text-gray-700 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Collection Trips</Text>
                    <Heading size="md" className="text-white font-[900] tracking-tighter text-2xl">89</Heading>
                    <Text className="text-[#10b981] text-xs font-black mt-2 tracking-tight">+7.2%</Text>
                </Box>
                <Box className="w-[1px] h-12 bg-[#1e2029] hidden sm:block" />
                <Box>
                    <Text className="text-gray-700 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Efficiency</Text>
                    <Heading size="md" className="text-white font-[900] tracking-tighter text-2xl">94.2%</Heading>
                    <Text className="text-[#10b981] text-xs font-black mt-2 tracking-tight">+3.1%</Text>
                </Box>
            </Flex>
        </Box>
        <Box className="bg-[#1e2029] px-4 py-2 rounded-xl border border-gray-800 cursor-pointer hover:bg-[#2a2c35] transition-colors flex-shrink-0 flex items-center gap-3">
            <Text className="text-gray-400 text-[11px] font-[900] uppercase tracking-[0.1em]">This Month</Text>
            <Box className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-500" />
        </Box>
      </Flex>

      <Box className="flex-1 min-h-[300px] w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2029" opacity={0.5} />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#4a4b51', fontSize: 10, fontWeight: 900 }} 
                dy={15}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#4a4b51', fontSize: 10, fontWeight: 900 }}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#11131a', border: '1px solid #333', borderRadius: '16px', padding: '12px' }}
                itemStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}
                cursor={{ stroke: '#333', strokeWidth: 1 }}
            />
            <Area type="monotone" dataKey="waste" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorWaste)" />
            <Area type="monotone" dataKey="trips" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTrips)" />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
      
      <HStack gap={10} mt={10} justify="center">
          <HStack gap={3}>
              <Box className="w-4 h-4 rounded-full border-4 border-[#10b981] bg-white/5" />
              <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Waste Collected (ton)</Text>
          </HStack>
          <HStack gap={3}>
              <Box className="w-4 h-4 rounded-full border-4 border-[#3b82f6] bg-white/5" />
              <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Collection Trips</Text>
          </HStack>
      </HStack>
    </Box>
  )
}

