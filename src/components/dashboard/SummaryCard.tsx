"use client"
import { Box, Flex, Text, Heading, Icon } from "@chakra-ui/react"
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

export function SummaryCard({
  title,
  value,
  sub,
  stat,
  statLabel,
  statColor,
  icon,
  iconBg,
  iconColor
}: SummaryCardProps) {
  return (
    <Box className="bg-[#11131a] border border-[#1e2029]/60 p-7 rounded-[2rem] group hover:bg-[#1a1c25] hover:border-[#10b981]/30 transition-all duration-500 cursor-default">
      <Flex justify="space-between" align="center" mb={10}>
        <Text className="text-gray-500 font-bold text-[11px] tracking-[0.15em] uppercase">{title}</Text>
        <Box className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 ${iconBg} ${iconColor} shadow-inner`}>
          <Icon as={icon} boxSize={6} />
        </Box>
      </Flex>
      <Flex align="baseline" gap={2} mb={2}>
        <Heading size="3xl" className="text-white font-[950] tracking-tighter leading-none">{value}</Heading>
        {sub && <Text className="text-gray-600 font-black text-xs tracking-widest uppercase">{sub}</Text>}
      </Flex>
      <Flex align="center" gap={3}>
        <Box className="flex items-center gap-1.5">
            <Text className={`text-[12px] font-black tracking-tight ${statColor}`}>{stat}</Text>
            <Text className="text-[12px] text-gray-700 font-black uppercase tracking-tight">{statLabel}</Text>
        </Box>
      </Flex>
      
      {/* Subtle indicator bar */}
      <Box className="w-full h-1.5 bg-gray-900/50 rounded-full mt-6 overflow-hidden">
          <Box className={`h-full rounded-full ${iconColor.replace('text-', 'bg-')} opacity-40`} style={{ width: '40%' }} />
      </Box>
    </Box>
  )
}
