"use client"
import { Box, Flex, Heading, Text, Icon, HStack, VStack } from "@chakra-ui/react"
import { FiTrash2, FiExternalLink } from "react-icons/fi"

interface HardwareVisualizerProps {
  bin: any
}

export function HardwareVisualizer({ bin }: HardwareVisualizerProps) {
  const fillLevel = bin?.fillLevel || 0
  const location = bin?.location || "N/A"
  const serialNumber = bin?.id || "SN-00000"

  return (
    <Box className="bg-[#11131a] border border-[#1e2029]/60 p-8 rounded-[2rem] w-full relative overflow-hidden group hover:bg-[#1a1c25] hover:border-[#10b981]/30 transition-all duration-500">
      <Flex justify="space-between" align="center" mb={12}>
        <HStack gap={3}>
            <Box className="bg-[#10b981]/10 p-2 rounded-lg">
                <Icon as={FiTrash2} className="text-[#10b981]" />
            </Box>
            <Heading size="md" className="text-white font-[950] tracking-tighter text-2xl">Real-Time Hardware Visualizer</Heading>
        </HStack>
        <HStack gap={2} className="text-gray-500 hover:text-white cursor-pointer transition-colors group/link">
            <Text className="text-[11px] font-black uppercase tracking-[0.2em]">View All Registered Bins</Text>
            <Icon as={FiExternalLink} boxSize={3.5} />
        </HStack>
      </Flex>

      <Flex direction="column" align="center" justify="center" p={12} className="relative z-10">
        {/* Mock Generic Bin Graphic */}
        <Box className="relative w-56 h-72 flex flex-col items-center">
            {/* Bin Cap */}
            <Box className="w-36 h-8 bg-[#2a2c35] rounded-t-2xl border-x border-t border-[#3f414d] relative shadow-2xl" />
            <Box className="w-44 h-10 bg-[#1e2029] -mt-1 rounded-xl border border-[#33353b] relative z-20 shadow-[-10px_-10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center">
                <Text className="text-[10px] text-gray-500 font-black tracking-[0.3em] uppercase">{serialNumber}</Text>
            </Box>
            
            {/* Bin Body */}
            <Box className="w-36 h-52 bg-gradient-to-b from-[#1e2029] to-[#0a0b0f] border-x border-b border-[#33353b] -mt-1 rounded-b-3xl relative overflow-hidden shadow-[inset_0_20px_40px_rgba(0,0,0,0.8)]">
                {/* Vertical Ridges */}
                <Flex justify="space-evenly" h="full" px={3} opacity={0.2}>
                    {[1,2,3,4,5,6,7].map(i => (
                        <Box key={i} className="w-px h-full bg-white/20" />
                    ))}
                </Flex>
                
                {/* Liquid / Fill Indicator */}
                <Box 
                    className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#10b981] to-[#10b981]/40 border-t-4 border-[#10b981] transition-all duration-1000 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                    style={{ height: `${fillLevel}%` }} 
                />
            </Box>
            
            {/* Base */}
            <HStack gap={32} className="absolute -bottom-3">
                <Box className="w-6 h-6 bg-black rounded-full border border-gray-900 shadow-xl" />
                <Box className="w-6 h-6 bg-black rounded-full border border-gray-900 shadow-xl" />
            </HStack>
        </Box>

        <VStack mt={14} gap={1}>
            <Heading size="4xl" className="text-[#10b981] font-[950] tracking-tighter text-6xl drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">{fillLevel}%</Heading>
            <Text className="text-gray-500 text-lg font-black tracking-tight mt-2">{location}</Text>
        </VStack>
      </Flex>

      {/* Background Ambience */}
      <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#10b981]/5 rounded-full blur-[120px] pointer-events-none" />
    </Box>
  )
}
