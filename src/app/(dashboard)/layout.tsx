"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  FiGrid, FiMap, FiBarChart2, FiPlusSquare,
  FiBell, FiTruck, FiUsers, FiFileText,
  FiSettings, FiLogOut, FiTrash2,
} from "react-icons/fi"
import { createClient } from "@/utils/supabase/client"

const SIDEBAR_ITEMS = [
  {
    group: "MAIN",
    items: [
      { name: "Dashboard",       href: "/dashboard",          icon: FiGrid },
      { name: "Live Map",        href: "/dashboard/map",      icon: FiMap },
      { name: "Analytics",       href: "/dashboard/analytics", icon: FiBarChart2 },
      { name: "Register Device", href: "/dashboard/register", icon: FiPlusSquare },
      { name: "Alerts",          href: "/dashboard/alerts",   icon: FiBell },
      { name: "Dispatch Tasks",  href: "/dashboard/dispatch", icon: FiTruck },
    ],
  },
  {
    group: "STAFF MANAGEMENT",
    items: [
      { name: "Admins",  href: "/dashboard/admins",   icon: FiUsers },
      { name: "Staff",   href: "/dashboard/staff",    icon: FiUsers },
      { name: "Drivers", href: "/dashboard/drivers",  icon: FiUsers },
    ],
  },
  {
    group: "SYSTEM",
    items: [
      { name: "Reports",  href: "/dashboard/reports",  icon: FiFileText },
      { name: "Settings", href: "/dashboard/settings", icon: FiSettings },
    ],
  },
]

interface UserProfile {
  name: string | null
  email: string | null
  role: string | null
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile>({ name: null, email: null, role: null })
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Try to get the full profile from public.users
      const { data: profile } = await supabase
        .from("users")
        .select("name, email, role")
        .eq("id", session.user.id)
        .single()

      setUser({
        name:  profile?.name  ?? session.user.user_metadata?.name  ?? session.user.email ?? "User",
        email: profile?.email ?? session.user.email ?? null,
        role:  profile?.role  ?? session.user.user_metadata?.role  ?? "staff",
      })
    }
    loadUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  /** Initials from name or email */
  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : (user.email?.[0] ?? "U").toUpperCase()

  const displayName = user.name ?? user.email ?? "Loading…"
  const displayRole = user.role ?? "staff"

  return (
    <div className="min-h-screen bg-[#07080a] text-white font-sans flex">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-[280px] bg-[#11131a] border-r border-[#1e2029]/50 flex-shrink-0 hidden lg:flex flex-col justify-between shadow-2xl">
        <div className="overflow-y-auto flex-1">

          {/* Logo */}
          <div className="p-8 pb-6">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="bg-[#10b981] p-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-105">
                <FiTrash2 size={22} className="text-white" />
              </div>
              <span className="text-[#10b981] font-black text-2xl tracking-tighter">SmartWaste</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-4 pb-8">
            {SIDEBAR_ITEMS.map((section, idx) => (
              <div key={idx} className="mb-8">
                <p className="text-[10px] font-black text-gray-700 mb-4 ml-4 tracking-[0.2em] uppercase">
                  {section.group}
                </p>
                <div className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                      <Link key={item.name} href={item.href}>
                        <div
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 group ${
                            isActive
                              ? "bg-[#10b981]/10 text-white border border-[#10b981]/20"
                              : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                          }`}
                        >
                          <Icon
                            size={20}
                            className={
                              isActive
                                ? "text-[#10b981]"
                                : "text-gray-600 group-hover:text-gray-300 transition-colors"
                            }
                          />
                          <span className={`text-sm ${isActive ? "font-[800]" : "font-[600]"}`}>
                            {item.name}
                          </span>
                          {/* Badge: show alert count when on alerts page */}
                          {item.href === "/dashboard/alerts" && isActive && (
                            <span className="ml-auto bg-[#ef4444] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                              Live
                            </span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Logout */}
            <div className="mt-6 px-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-[#ff4d4d]/80 hover:bg-[#ff4d4d]/10 hover:text-[#ff4d4d] rounded-2xl cursor-pointer transition-all group text-left"
              >
                <FiLogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-[800]">Logout</span>
              </button>
            </div>
          </nav>
        </div>

        {/* User Profile — live from Supabase auth */}
        <div className="p-4 bg-[#0d0f14]/50 border-t border-[#1e2029]/30">
          <div className="p-4 bg-[#1e2029]/40 rounded-3xl border border-white/5 hover:bg-[#1e2029]/60 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-[#10b981] rounded-2xl flex items-center justify-center font-black text-white text-base shadow-[0_8px_16px_rgba(16,185,129,0.2)] border-2 border-white/10 group-hover:scale-105 transition-transform flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-[900] text-white tracking-tight truncate">{displayName}</p>
                <p className="text-[9px] text-gray-600 font-bold mt-0.5 uppercase tracking-widest capitalize">
                  {displayRole}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden bg-[#07080a]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 lg:px-12 py-10">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
