"use client"
import { Box, Flex, VStack, Text, HStack, Icon, Avatar } from "@chakra-ui/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  FiGrid, FiMap, FiBarChart2, FiPlusSquare, 
  FiBell, FiTruck, FiUsers, FiFileText, FiSettings, FiLogOut,
  FiTrash2
} from "react-icons/fi"

const SIDEBAR_ITEMS = [
  { group: "MAIN", items: [
    { name: "Dashboard", href: "/dashboard", icon: FiGrid },
    { name: "Live Map", href: "/dashboard/map", icon: FiMap },
    { name: "Analytics", href: "/dashboard/analytics", icon: FiBarChart2 },
    { name: "Register Device", href: "/dashboard/register", icon: FiPlusSquare },
    { name: "Alerts", href: "/dashboard/alerts", icon: FiBell },
    { name: "Dispatch Tasks", href: "/dashboard/dispatch", icon: FiTruck },
  ]},
  { group: "STAFF MANAGEMENT", items: [
    { name: "Admins", href: "/dashboard/admins", icon: FiUsers },
    { name: "Staffs", href: "/dashboard/staff", icon: FiUsers },
    { name: "Drivers", href: "/dashboard/drivers", icon: FiUsers },
  ]},
  { group: "SYSTEM", items: [
    { name: "Reports", href: "/dashboard/reports", icon: FiFileText },
    { name: "Settings", href: "/dashboard/settings", icon: FiSettings },
  ]}
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <Flex className="min-h-screen bg-[#07080a] text-white font-sans">
      {/* Sidebar */}
      <Box className="w-[280px] bg-[#11131a] border-r border-[#1e2029]/50 flex-shrink-0 flex flex-col justify-between hidden lg:flex shadow-2xl">
        <Box className="overflow-y-auto flex-1 custom-scrollbar">
          <Box p={8} pb={6}>
            <HStack gap={3} className="cursor-pointer group">
              <Box className="bg-[#10b981] p-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-105">
                <FiTrash2 size={22} className="text-white" />
              </Box>
              <Text className="text-[#10b981] font-black text-2xl tracking-tighter">SmartWaste</Text>
            </HStack>
          </Box>
          
          <Box as="nav" className="px-4 pb-8">
            {SIDEBAR_ITEMS.map((section, idx) => (
              <Box key={idx} mb={8}>
                <Text className="text-[10px] font-black text-gray-700 mb-4 ml-4 tracking-[0.2em] uppercase">
                  {section.group}
                </Text>
                <VStack align="stretch" gap={1}>
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link key={item.name} href={item.href}>
                        <HStack
                          className={`px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 group ${
                            isActive 
                              ? "bg-[#10b981]/10 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-[#10b981]/20" 
                              : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                          }`}
                        >
                          <Icon 
                            as={item.icon} 
                            boxSize={5} 
                            className={isActive ? "text-[#10b981]" : "text-gray-600 group-hover:text-gray-300 transition-colors"} 
                          />
                          <Text fontSize="sm" fontWeight={isActive ? "800" : "600"}>{item.name}</Text>
                        </HStack>
                      </Link>
                    )
                  })}
                </VStack>
              </Box>
            ))}

            <Box className="mt-6 px-2">
              <Link href="/login">
                 <HStack className="px-4 py-3 text-[#ff4d4d]/80 hover:bg-[#ff4d4d]/10 hover:text-[#ff4d4d] rounded-2xl cursor-pointer transition-all group">
                    <Icon as={FiLogOut} boxSize={5} className="group-hover:-translate-x-1 transition-transform" />
                    <Text fontSize="sm" fontWeight="800">Logout</Text>
                 </HStack>
              </Link>
            </Box>
          </Box>
        </Box>

        {/* User Profile Area */}
        <Box className="p-4 bg-[#0d0f14]/50 border-t border-[#1e2029]/30">
            <Box className="p-4 bg-[#1e2029]/40 rounded-3xl border border-white/5 hover:bg-[#1e2029]/60 transition-colors cursor-pointer group">
              <HStack gap={4}>
                <Box className="w-11 h-11 bg-[#10b981] rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-[0_8px_16px_rgba(16,185,129,0.2)] border-2 border-white/10 group-hover:scale-105 transition-transform">
                  M
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="900" className="text-white tracking-tight">Matthias Komano</Text>
                  <Text fontSize="xs" className="text-gray-600 font-bold mt-0.5 uppercase tracking-widest text-[9px]">Admin</Text>
                </Box>
              </HStack>
            </Box>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box className="flex-1 flex flex-col min-h-screen overflow-hidden bg-[#07080a]">
        <Box className="flex-1 overflow-y-auto px-6 md:px-10 lg:px-12 py-10">
          <Box className="max-w-[1600px] mx-auto">
            {children}
          </Box>
        </Box>
      </Box>
    </Flex>
  )
}
