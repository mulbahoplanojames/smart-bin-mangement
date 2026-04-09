interface ActivityListProps {
  title: string
  items: any[]
  type?: 'alert' | 'collection'
}

export function ActivityList({ title, items, type = 'alert' }: ActivityListProps) {
  return (
    <Box className="bg-[#11131a] border border-[#1e2029]/60 p-7 rounded-[2rem] h-full flex flex-col group hover:bg-[#1a1c25] transition-all duration-500">
      <Flex justify="space-between" align="center" mb={10}>
        <Heading size="md" className="text-white font-[950] tracking-tighter text-2xl">{title}</Heading>
        <Box className="flex items-center gap-2 cursor-pointer group/all">
            <Text className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] group-hover/all:text-white transition-colors">View All</Text>
        </Box>
      </Flex>
      
      <VStack gap={4} align="stretch" className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {items.length === 0 ? (
          <Flex direction="column" align="center" justify="center" h="full" py={12} opacity={0.3}>
             <Box className="w-16 h-16 bg-gray-900/50 rounded-3xl mb-4 flex items-center justify-center border border-gray-800">
                <Box className="w-4 h-4 bg-gray-700/50 rounded-full animate-pulse" />
             </Box>
             <Text className="text-gray-700 text-[10px] font-black uppercase tracking-[0.2em] text-center">No recent <br/> activity</Text>
          </Flex>
        ) : (
          items.map((item, i) => (
            <Flex key={i} align="center" gap={4} p={4} className="bg-[#1e2029]/30 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group/item">
               <Box className={`w-2 h-2 rounded-full ${type === 'alert' ? 'bg-[#ef4444]' : 'bg-[#3b82f6]'}`} shadow="lg" />
               <Box flex={1}>
                  <Text className="text-white text-[13px] font-[900] tracking-tight line-clamp-1">{item.type || item.route || "Activity"}</Text>
                  <Text className="text-gray-600 text-[11px] font-bold mt-0.5">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
               </Box>
               <Box className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <Box className="w-6 h-6 bg-white/5 rounded-lg flex items-center justify-center">
                    <Box className="w-1 h-1 bg-gray-500 rounded-full" />
                  </Box>
               </Box>
            </Flex>
          ))
        )}
      </VStack>
    </Box>
  )
}
