"use client"
import { Box, Flex, Heading, Text, VStack, HStack } from "@chakra-ui/react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface FillLevelDistributionProps {
  data: { range: string, count: number, color: string }[]
}

export function FillLevelDistribution({ data }: FillLevelDistributionProps) {
  // Calculate percentages
  const total = data.reduce((acc, item) => acc + item.count, 0) || 1

  return (
    <Box className="bg-[#11131a] border border-[#1e2029]/60 p-8 rounded-[2rem] h-full flex flex-col group hover:bg-[#1a1c25] hover:border-[#10b981]/30 transition-all duration-500">
      <Flex justify="space-between" align="center" mb={10}>
        <Heading size="md" className="text-white font-[950] tracking-tighter leading-none text-2xl">Fill Level Distribution</Heading>
        <Box className="bg-[#1e2029] px-4 py-2 rounded-xl border border-gray-800 cursor-pointer hover:bg-[#2a2c35] transition-colors flex items-center gap-3">
            <Text className="text-gray-400 text-[11px] font-[900] uppercase tracking-[0.1em]">This Week</Text>
            <Box className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-500" />
        </Box>
      </Flex>

      <Box className="flex-1 w-full flex items-center justify-center py-6">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ backgroundColor: '#11131a', border: '1px solid #333', borderRadius: '16px', padding: '12px' }}
                itemStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}
            />
            <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.count > 0 ? entry.color : "#1a1b24"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <HStack justify="space-between" mt={8} className="px-2">
          {data.map((item, i) => (
              <VStack key={i} gap={2} align="center" flex={1}>
                  <Box className="w-3 h-3 rounded-md shadow-sm" bg={item.color} opacity={item.count > 0 ? 1 : 0.2} />
                  <Text className="text-[10px] text-gray-700 font-black tracking-widest uppercase">{item.range}</Text>
                  <Text className="text-[16px] text-white font-[950] tracking-tighter">
                    {Math.round((item.count / total) * 100)}%
                  </Text>
                  <Text className="text-[10px] text-gray-800 font-black">({item.count})</Text>
              </VStack>
          ))}
      </HStack>
    </Box>
  )
}
