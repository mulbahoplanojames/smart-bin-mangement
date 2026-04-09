"use client"
import { Box, Flex, Grid, Heading, Text, Input, HStack, Icon, Button, VStack } from "@chakra-ui/react"
import { FiSearch, FiBell, FiCalendar, FiTrash2, FiTruck, FiPieChart, FiAlertTriangle, FiPlusSquare, FiUsers, FiFileText } from "react-icons/fi"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview"
import { FillLevelDistribution } from "@/components/dashboard/FillLevelDistribution"
import { HardwareVisualizer } from "@/components/dashboard/HardwareVisualizer"
import { ActivityList } from "@/components/dashboard/ActivityList"
import { QuickActionCard } from "@/components/dashboard/QuickActionCard"
import { LiveBinOverview } from "@/components/dashboard/LiveBinOverview"

import { useDashboardData } from "@/hooks/useDashboardData"

export default function DashboardOverview() {
  const data = useDashboardData()
  const { summary, bins, loading } = data

  return (
    <Box pb={10}>
      {/* Header Section */}
      <Flex justify="space-between" align="flex-start" mb={12} direction={{ base: "column", lg: "row" }} gap={6}>
        <Box>
          <Heading size="lg" className="text-white font-black tracking-tighter mb-2 text-3xl">Welcome back, Matthias! 👋</Heading>
          <Text className="text-gray-500 font-bold text-sm">Monitor your waste management system in real-time.</Text>
        </Box>
        <HStack gap={4} w={{ base: "full", lg: "auto" }}>
          <Box position="relative" className="w-full lg:w-72">
            <Icon as={FiSearch} position="absolute" left={4} top="50%" transform="translateY(-50%)" zIndex={2} className="text-gray-600" />
            <Input 
              pl={12} 
              placeholder="Search..." 
              className="bg-[#11131a] border-[#1e2029]/60 w-full h-12 rounded-xl focus:border-[#10b981] text-sm font-bold text-gray-300 transition-all placeholder:text-gray-700" 
            />
          </Box>
          <Button className="bg-[#11131a] border border-[#1e2029]/60 w-12 h-12 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center">
            <Icon as={FiBell} boxSize={5} className="text-gray-400" />
          </Button>
          <Button className="bg-[#11131a] border border-[#1e2029]/60 h-12 px-5 rounded-xl hover:bg-white/5 flex items-center gap-3 text-gray-300 transition-colors">
            <Icon as={FiCalendar} boxSize={5} />
            <Text fontSize="sm" fontWeight="900" className="tracking-tight uppercase text-xs">Apr 09, 2026</Text>
          </Button>
        </HStack>
      </Flex>

      {/* Summary Cards Grid */}
      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }} gap={8} mb={10}>
        <SummaryCard 
          title="Total Bins" 
          value={summary.totalBins} 
          stat="+12.5%" 
          statLabel="vs last month" 
          statColor="text-[#10b981]" 
          icon={FiTrash2} 
          iconBg="bg-[#10b981]/10" 
          iconColor="text-[#10b981]" 
        />
        <SummaryCard 
          title="Collected Today" 
          value={summary.collectedToday.toFixed(0)} 
          sub="ton"
          stat="+8.4%" 
          statLabel="vs yesterday" 
          statColor="text-[#3b82f6]" 
          icon={FiTruck} 
          iconBg="bg-[#3b82f6]/10" 
          iconColor="text-[#3b82f6]" 
        />
        <SummaryCard 
          title="Fill Level (Avg.)" 
          value={`${Math.round(summary.avgFillLevel)}%`} 
          stat="+5.7%" 
          statLabel="vs last month" 
          statColor="text-[#f59e0b]" 
          icon={FiPieChart} 
          iconBg="bg-[#f59e0b]/10" 
          iconColor="text-[#f59e0b]" 
        />
        <SummaryCard 
          title="Alerts" 
          value={summary.activeAlerts} 
          stat="-3" 
          statLabel="vs yesterday" 
          statColor="text-[#ef4444]" 
          icon={FiAlertTriangle} 
          iconBg="bg-[#ef4444]/10" 
          iconColor="text-[#ef4444]" 
        />
      </Grid>

      {/* Main Grid: Map & Bar Chart */}
      <Grid templateColumns={{ base: "1fr", xl: "2.1fr 1fr" }} gap={8} mb={10}>
        <LiveBinOverview />
        <FillLevelDistribution data={data.fillDistribution} />
      </Grid>

      {/* Hardware Visualizer Row */}
      <Box mb={10}>
        <HardwareVisualizer bin={bins[0]} />
      </Box>

      {/* Analytics & Activity Row */}
      <Grid templateColumns={{ base: "1fr", xl: "1.4fr 0.8fr 0.8fr" }} gap={8} mb={14}>
        <AnalyticsOverview data={data.analytics} />
        <ActivityList title="Recent Alerts" items={data.alerts.slice(0, 5)} type="alert" />
        <ActivityList title="Recent Collections" items={data.collections.slice(0, 5)} type="collection" />
      </Grid>

      {/* Quick Actions Panel */}
      <Box>
         <Text className="text-white font-[950] text-2xl mb-8 tracking-tighter">Quick Actions</Text>
         <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }} gap={6}>
            {[
              { title: "Register New Bin", desc: "Add a new smart bin", icon: FiPlusSquare, bg: "bg-[#10b981]/10", color: "text-[#10b981]" },
              { title: "Add Driver", desc: "Register a new driver", icon: FiUsers, bg: "bg-[#3b82f6]/10", color: "text-[#3b82f6]" },
              { title: "Add Staff", desc: "Invite new staff member", icon: FiUsers, bg: "bg-purple-500/10", color: "text-purple-400" },
              { title: "Generate Report", desc: "Download system report", icon: FiFileText, bg: "bg-amber-500/10", color: "text-amber-400" }
            ].map((action, i) => (
              <Box key={i} className="bg-[#11131a] border border-[#1e2029]/60 p-6 rounded-[2rem] hover:bg-[#1a1c25] hover:border-white/10 transition-all duration-300 cursor-pointer group">
                  <Flex align="center" gap={5}>
                      <Box className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${action.bg} ${action.color}`}>
                          <Icon as={action.icon} boxSize={5} />
                      </Box>
                      <Box>
                          <Text className="text-white text-sm font-black tracking-tight">{action.title}</Text>
                          <Text className="text-gray-600 text-xs font-bold mt-1 tracking-tight">{action.desc}</Text>
                      </Box>
                  </Flex>
              </Box>
            ))}
         </Grid>
      </Box>
    </Box>
  )
}
