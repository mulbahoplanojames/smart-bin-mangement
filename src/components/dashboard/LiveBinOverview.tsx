"use client"
import { Box, Flex, Heading, Text, Icon, HStack } from "@chakra-ui/react"
import { FiMap } from "react-icons/fi"
import dynamic from "next/dynamic"

// Import leaflet dynamically to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)

// Standard Kigali Coordinates
const POSITION: [number, number] = [-1.9441, 30.0619]

export function LiveBinOverview() {
  return (
    <Box className="bg-[#11131a] border border-[#1e2029]/60 p-8 rounded-[2rem] h-full flex flex-col group hover:bg-[#1a1c25] hover:border-[#10b981]/30 transition-all duration-500 cursor-default">
      <Flex justify="space-between" align="center" mb={10}>
        <Heading size="md" className="text-white font-[950] tracking-tighter leading-none text-2xl">Live Bin Overview</Heading>
        <Text className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors">View All</Text>
      </Flex>

      <Box className="flex-1 w-full rounded-3xl overflow-hidden border border-[#1e2029]/80 relative bg-[#0a0b0f] shadow-2xl">
        {/* We use a fallback if react-leaflet is not working/installed properly */}
        <Flex className="w-full h-full bg-[#07080a] items-center justify-center relative">
            <Box 
              className="absolute inset-0 opacity-40 grayscale contrast-125" 
              style={{ 
                backgroundImage: 'url("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png")', 
                backgroundSize: 'cover',
                backgroundBlendMode: 'multiply'
              }}
            />
            {/* Kigali City Marker Mock */}
            <Box className="relative">
                <Box className="w-20 h-20 bg-[#10b981]/20 rounded-full animate-ping absolute -left-6 -top-6" />
                <Box className="w-10 h-10 bg-[#10b981]/30 rounded-full border-2 border-[#10b981] flex items-center justify-center relative shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                    <Box className="w-4 h-4 bg-[#10b981] rounded-full shadow-[0_0_15px_#10b981]" />
                    <Box className="absolute -top-12 bg-[#11131a] border border-[#1e2029] px-3 py-1.5 rounded-lg shadow-2xl whitespace-nowrap">
                        <Text className="text-white text-[10px] font-black uppercase tracking-widest">Kigali</Text>
                    </Box>
                </Box>
            </Box>
            
            {/* Map Labels Mock */}
            <Box className="absolute bottom-8 right-8">
                 <Text className="text-[32px] text-white/5 font-black tracking-[0.3em] uppercase select-none">KIGALI</Text>
            </Box>

            <Box className="absolute bottom-4 right-4 bg-black/60 px-3 py-1.5 rounded-lg text-[9px] text-gray-700 font-black border border-white/5 backdrop-blur-xl">
                Leaflet | © CARTO
            </Box>
        </Flex>
      </Box>
    </Box>
  )
}
