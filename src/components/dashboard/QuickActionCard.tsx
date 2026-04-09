"use client"
import { Box, Flex, Text, Heading, Icon, VStack } from "@chakra-ui/react"
import { IconType } from "react-icons"

interface QuickActionCardProps {
  title: string
  description: string
  icon: IconType
  iconBg: string
  iconColor: string
}

export function QuickActionCard({
  title,
  description,
  icon,
  iconBg,
  iconColor
}: QuickActionCardProps) {
  return (
    <Box className="bg-[#11131a] border border-[#1e2029] p-4 rounded-2xl flex-1 cursor-pointer hover:bg-[#1a1c25] hover:border-[#33353b] transition-all duration-300 group">
      <Flex align="center" gap={4}>
        <Box className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6 ${iconBg} ${iconColor}`}>
          <Icon as={icon} />
        </Box>
        <Box>
           <Text className="text-white text-sm font-black tracking-tight">{title}</Text>
           <Text className="text-gray-500 text-[11px] font-bold">{description}</Text>
        </Box>
      </Flex>
    </Box>
  )
}
