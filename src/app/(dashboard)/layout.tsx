"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  FiGrid, FiMap, FiBarChart2, FiPlusSquare,
  FiBell, FiTruck, FiUsers, FiFileText,
  FiSettings, FiLogOut, FiTrash2, FiMenu, FiX,
} from "react-icons/fi"
import { createClient } from "@/utils/supabase/client"

// ─── Navigation config ────────────────────────────────────────────────────────
type Role = "admin" | "staff" | "driver";

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  roles?: Role[]; // If omitted, visible to everyone
}

interface SidebarGroup {
  group: string;
  roles?: Role[]; // If omitted, all roles can potentially see the group (depending on items)
  items: SidebarItem[];
}

const SIDEBAR_ITEMS: SidebarGroup[] = [
  {
    group: "MAIN",
    items: [
      { name: "Dashboard",       href: "/dashboard",           icon: FiGrid },
      { name: "Live Map",        href: "/dashboard/map",       icon: FiMap },
      { name: "Analytics",       href: "/dashboard/analytics", icon: FiBarChart2, roles: ["admin", "staff"] },
      { name: "Register Device", href: "/dashboard/register",  icon: FiPlusSquare, roles: ["admin"] },
      { name: "Alerts",          href: "/dashboard/alerts",    icon: FiBell, roles: ["admin", "staff"] },
      { name: "Dispatch Tasks",  href: "/dashboard/dispatch",  icon: FiTruck, roles: ["admin"] },
    ],
  },
  {
    group: "STAFF MANAGEMENT",
    roles: ["admin"],
    items: [
      { name: "Admins",  href: "/dashboard/admins",  icon: FiUsers },
      { name: "Staff",   href: "/dashboard/staff",   icon: FiUsers },
      { name: "Drivers", href: "/dashboard/drivers", icon: FiUsers },
    ],
  },
  {
    group: "SYSTEM",
    items: [
      { name: "Reports",  href: "/dashboard/reports",  icon: FiFileText, roles: ["admin", "staff"] },
      { name: "Settings", href: "/dashboard/settings", icon: FiSettings },
    ],
  },
]

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
  name: string | null
  email: string | null
  role: string | null
}

// ─── Sidebar content (shared between desktop + mobile drawer) ─────────────────
function SidebarContent({
  pathname,
  user,
  onLinkClick,
  onLogout,
}: {
  pathname: string
  user: UserProfile
  onLinkClick?: () => void
  onLogout: () => void
}) {
  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : (user.email?.[0] ?? "U").toUpperCase()

  const displayName = user.name ?? user.email ?? "Loading…"
  const displayRole = (user.role ?? "staff") as Role

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex-shrink-0 p-8 pb-6">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="bg-[#10b981] p-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-105">
            <FiTrash2 size={22} className="text-white" />
          </div>
          <span className="text-[#10b981] font-black text-2xl tracking-tighter">SmartWaste</span>
        </div>
      </div>

      {/* Navigation — scrollable area */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
        <nav>
          {SIDEBAR_ITEMS.map((section, idx) => {
            // Filter section by role
            if (section.roles && !section.roles.includes(displayRole)) return null;

            // Filter items by role
            const visibleItems = section.items.filter(
              (item) => !item.roles || item.roles.includes(displayRole)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="mb-8">
                <p className="text-[10px] font-black text-gray-700 mb-4 ml-4 tracking-[0.2em] uppercase">
                  {section.group}
                </p>
                <div className="flex flex-col gap-1">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                      <Link key={item.name} href={item.href} onClick={onLinkClick}>
                        <div
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 group ${
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
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#ff4d4d]/80 hover:bg-[#ff4d4d]/10 hover:text-[#ff4d4d] rounded-2xl cursor-pointer transition-all group text-left"
          >
            <FiLogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-[800]">Logout</span>
          </button>
        </div>
      </div>

      {/* User profile — always visible at the bottom */}
      <div className="flex-shrink-0 p-4 bg-[#0d0f14]/50 border-t border-[#1e2029]/30">
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
    </div>
  )
}

// ─── Layout ─────────────────────────────────────────────────────────────────── 
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile>({ name: null, email: null, role: null })
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close drawer when route changes
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Close drawer on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Load user from Supabase
  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    // Outer shell: full screen, does NOT scroll — children scroll independently
    <div className="h-screen bg-[#07080a] text-white font-sans flex overflow-hidden">

      {/* ── Desktop Sidebar — fixed height, its own scroll ─────────────────── */}
      <aside className="hidden lg:flex flex-col w-[280px] flex-shrink-0 bg-[#11131a] border-r border-[#1e2029]/50 shadow-2xl h-full">
        <SidebarContent
          pathname={pathname}
          user={user}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Mobile: Backdrop ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Drawer Sidebar ─────────────────────────────────────────── */}
      <aside
        ref={drawerRef}
        className={`fixed top-0 left-0 z-50 h-full w-[280px] bg-[#11131a] border-r border-[#1e2029]/50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile navigation"
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-5 right-5 w-9 h-9 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all z-10"
          aria-label="Close menu"
        >
          <FiX size={18} />
        </button>

        <SidebarContent
          pathname={pathname}
          user={user}
          onLinkClick={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Main Area (scrollable) ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* Mobile Top-bar */}
        <header className="flex-shrink-0 lg:hidden flex items-center gap-4 px-4 py-4 bg-[#11131a] border-b border-[#1e2029]/50 shadow-sm">
          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all flex-shrink-0"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <FiMenu size={20} />
          </button>

          {/* Brand on mobile top-bar */}
          <div className="flex items-center gap-2">
            <div className="bg-[#10b981] p-1.5 rounded-lg shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <FiTrash2 size={16} className="text-white" />
            </div>
            <span className="text-[#10b981] font-black text-lg tracking-tighter">SmartWaste</span>
          </div>

          {/* Spacer + notification bell on mobile */}
          <div className="ml-auto flex items-center gap-3">
            <button className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all">
              <FiBell size={16} />
            </button>
            {/* Avatar initials */}
            <div className="w-9 h-9 bg-[#10b981] rounded-xl flex items-center justify-center font-black text-white text-sm border-2 border-white/10">
              {user.name
                ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
                : (user.email?.[0] ?? "U").toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 lg:py-10">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
