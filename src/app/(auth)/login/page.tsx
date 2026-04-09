"use client"
import { Box, Button, Input, VStack, Heading, Text, Flex, HStack, Icon } from "@chakra-ui/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiGrid, FiMail, FiLock } from "react-icons/fi"
import { createClient } from "@/utils/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push("/dashboard")
    } catch (error: any) {
      if (error.message.includes('URL are required') || error.message.includes('fetch is not defined')) {
         // Fallback if the user hasn't set up the keys yet but wants to see the layout
         setTimeout(() => {
           setLoading(false)
           router.push("/dashboard")
         }, 1000)
      } else {
        setErrorMsg(error.message)
        setLoading(false)
      }
    }
  }

  return (
    <Box className="min-h-screen bg-[#0d0f14] flex relative overflow-hidden text-white w-full">
      {/* Abstract Background Elements */}
      <Box className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <Box className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Left side: Branding / Info (Hidden on mobile) */}
      <Flex className="hidden lg:flex flex-1 flex-col justify-center px-16 lg:px-24 z-10 border-r border-[#1e2029] bg-[#0d0f14]/50 backdrop-blur-3xl min-h-screen relative">
        <Box mb={8}>
          <HStack className="text-emerald-400 font-bold text-3xl items-center tracking-wide mb-8">
            <Icon as={FiGrid} boxSize={8} />
            <Text>SmartWaste</Text>
          </HStack>
          <Heading size="3xl" lineHeight="1.2" className="text-white mb-6 font-semibold">
            Intelligent waste <br /> management for <br /> modern cities.
          </Heading>
          <Text className="text-gray-400 text-lg max-w-md leading-relaxed">
            Monitor real-time fill levels, optimize collection routes, and manage your IoT-connected bin fleet from a single centralized dashboard.
          </Text>
        </Box>
        
        <HStack gap={4} className="mt-8">
          <AvatarGroup />
          <Box>
            <Flex className="text-amber-400 text-sm mb-1 uppercase tracking-widest font-bold">Trusted by</Flex>
            <Text className="text-gray-300 font-medium">Over 50+ Municipalities</Text>
          </Box>
        </HStack>
      </Flex>

      {/* Right side: Login Form */}
      <Flex className="flex-1 items-center justify-center p-8 z-10 w-full min-h-screen">
        <Box className="w-full max-w-[420px]">
          <Box mb={8} className="text-center lg:text-left">
            <HStack className="lg:hidden text-emerald-400 font-bold text-2xl items-center justify-center mb-8">
              <Icon as={FiGrid} boxSize={6} />
              <Text>SmartWaste</Text>
            </HStack>
            <Heading size="2xl" className="text-white mb-2 font-bold tracking-tight">Welcome back</Heading>
            <Text className="text-gray-400">Please enter your details to sign in.</Text>
          </Box>
          
          <Box as="form" onSubmit={handleLogin}>
            <VStack gap={5} align="stretch">
              <Box>
                <Text className="text-sm font-medium text-gray-300 mb-2">Email address</Text>
                <Box position="relative">
                   <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={2}>
                      <Icon as={FiMail} className="text-gray-500" />
                   </Box>
                   <Input 
                     type="email" 
                     placeholder="admin@smartwaste.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="bg-[#11131a] border-[#1e2029] text-white placeholder-gray-600 focus:border-emerald-500 hover:border-gray-700 rounded-xl p-3 pl-10 w-full transition-colors"
                     required
                   />
                </Box>
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text className="text-sm font-medium text-gray-300">Password</Text>
                  <Text className="text-sm font-medium text-emerald-500 hover:text-emerald-400 cursor-pointer transition-colors">Forgot Password?</Text>
                </Flex>
                <Box position="relative">
                   <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={2}>
                      <Icon as={FiLock} className="text-gray-500" />
                   </Box>
                   <Input 
                     type="password" 
                     placeholder="••••••••"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="bg-[#11131a] border-[#1e2029] text-white placeholder-gray-600 focus:border-emerald-500 hover:border-gray-700 rounded-xl p-3 pl-10 w-full transition-colors"
                     required
                   />
                </Box>
              </Box>

              {errorMsg && (
                <Text className="text-red-400 text-sm mt-1">{errorMsg}</Text>
              )}

              <Button 
                type="submit" 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 pt-3 pb-3 mt-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] h-[48px]"
                loading={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </VStack>
          </Box>

          <Flex align="center" className="my-8">
            <hr className="border-[#1e2029] w-full" />
            <Text className="px-4 text-xs text-gray-500 font-medium">OR</Text>
            <hr className="border-[#1e2029] w-full" />
          </Flex>

          <Text className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-emerald-500 font-semibold hover:text-emerald-400 transition-colors">
              Sign up
            </Link>
          </Text>
        </Box>
      </Flex>
    </Box>
  )
}

function AvatarGroup() {
  return (
    <Flex>
      {[1, 2, 3, 4].map((i) => (
        <Box 
          key={i}
          className={`w-10 h-10 rounded-full border-2 border-[#0d0f14] bg-gray-800 -ml-3 flex items-center justify-center overflow-hidden z-[${10-i}]`}
        >
          <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" />
        </Box>
      ))}
    </Flex>
  )
}
