"use client"
import { Box, Button, Input, VStack, Heading, Text, Flex, HStack, Icon } from "@chakra-ui/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiGrid, FiMail, FiLock, FiUser, FiBriefcase } from "react-icons/fi"
import { createClient } from "@/utils/supabase/client"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("staff")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")
    setSuccessMsg("")
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          }
        }
      })

      if (error) throw error

      setSuccessMsg("Registration successful! Check your email to verify if required, or sign in.")
      setTimeout(() => {
        router.push("/login")
      }, 3000)

    } catch (error: any) {
      if (error.message.includes('URL are required') || error.message.includes('fetch is not defined')) {
         // Fallback if the user hasn't set up the keys yet
         setSuccessMsg("Form validated successfully. Redirecting to login (Mock)...")
         setTimeout(() => {
           setLoading(false)
           router.push("/login")
         }, 1500)
      } else {
        setErrorMsg(error.message)
        setLoading(false)
      }
    }
  }

  return (
    <Box className="min-h-screen bg-[#0d0f14] flex relative overflow-hidden text-white w-full">
      {/* Abstract Background Elements */}
      <Box className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <Box className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Left side: Register Form */}
      <Flex className="flex-1 items-center justify-center p-8 z-10 w-full min-h-screen">
        <Box className="w-full max-w-[420px]">
          <Box mb={8} className="text-center lg:text-left">
            <HStack className="lg:hidden text-emerald-400 font-bold text-2xl items-center justify-center mb-8">
              <Icon as={FiGrid} boxSize={6} />
              <Text>SmartWaste</Text>
            </HStack>
            <Heading size="2xl" className="text-white mb-2 font-bold tracking-tight">Create an account</Heading>
            <Text className="text-gray-400">Join the smart waste revolution.</Text>
          </Box>
          
          <Box as="form" onSubmit={handleRegister}>
            <VStack gap={5} align="stretch">
              
              <Box>
                <Text className="text-sm font-medium text-gray-300 mb-2">Full Name</Text>
                <Box position="relative">
                   <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={2}>
                      <Icon as={FiUser} className="text-gray-500" />
                   </Box>
                   <Input 
                     type="text" 
                     placeholder="John Doe"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="bg-[#11131a] border-[#1e2029] text-white placeholder-gray-600 focus:border-emerald-500 hover:border-gray-700 rounded-xl p-3 pl-10 w-full transition-colors"
                     required
                   />
                </Box>
              </Box>

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
                <Text className="text-sm font-medium text-gray-300 mb-2">Desired Role</Text>
                <Box position="relative">
                   <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={2}>
                      <Icon as={FiBriefcase} className="text-gray-500" />
                   </Box>
                   <select 
                     value={role}
                     onChange={(e) => setRole(e.target.value)}
                     className="bg-[#11131a] border-[#1e2029] border text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none hover:border-gray-700 rounded-xl p-3 pl-10 w-full transition-colors appearance-none"
                     required
                   >
                     <option value="staff">Staff</option>
                     <option value="admin">Admin</option>
                     <option value="driver">Driver</option>
                   </select>
                </Box>
              </Box>

              <Box>
                <Text className="text-sm font-medium text-gray-300 mb-2">Password</Text>
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
              {successMsg && (
                <Text className="text-emerald-400 text-sm mt-1">{successMsg}</Text>
              )}

              <Button 
                type="submit" 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 pt-3 pb-3 mt-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] h-[48px]"
                loading={loading}
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
            </VStack>
          </Box>

          <Flex align="center" className="my-8">
            <hr className="border-[#1e2029] w-full" />
            <Text className="px-4 text-xs text-gray-500 font-medium">OR</Text>
            <hr className="border-[#1e2029] w-full" />
          </Flex>

          <Text className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-500 font-semibold hover:text-emerald-400 transition-colors">
              Sign in
            </Link>
          </Text>
        </Box>
      </Flex>

      {/* Right side: Branding / Info (Hidden on mobile) */}
      <Flex className="hidden lg:flex flex-1 flex-col justify-center px-16 lg:px-24 z-10 border-l border-[#1e2029] bg-[#0d0f14]/50 backdrop-blur-3xl min-h-screen relative">
        <Box mb={8}>
          <HStack className="text-emerald-400 font-bold text-3xl items-center tracking-wide mb-8">
            <Icon as={FiGrid} boxSize={8} />
            <Text>SmartWaste</Text>
          </HStack>
          <Heading size="3xl" lineHeight="1.2" className="text-white mb-6 font-semibold">
            Predictive AI. <br /> Optimal Routes.
          </Heading>
          <Text className="text-gray-400 text-lg max-w-md leading-relaxed">
            Gain full visibility into your operations. Sign up today and get access to the world's most advanced smart bin ecosystem.
          </Text>
        </Box>
        
        <Box className="mt-8 border border-[#1e2029] bg-black/20 p-6 rounded-2xl max-w-md backdrop-blur-sm">
           <Text className="text-gray-300 italic mb-4">"SmartWaste completely revolutionized how our municipality handles dispatching. Our routes are 30% more efficient now."</Text>
           <Flex align="center" gap={4}>
              <Box className="w-12 h-12 rounded-full overflow-hidden">
                <img src="https://i.pravatar.cc/150?img=32" alt="Reviewer" />
              </Box>
              <Box>
                <Text className="text-white font-medium">Sarah Jenkins</Text>
                <Text className="text-gray-400 text-sm">City Operations Director</Text>
              </Box>
           </Flex>
        </Box>
      </Flex>
    </Box>
  )
}
