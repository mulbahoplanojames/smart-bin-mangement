"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { FiUserPlus, FiEye, FiEdit2 } from "react-icons/fi";
import { FaCrown } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdmins() {
      const supabase = createClient();
      
      // Get current logged in user
      const { data: sessionData } = await supabase.auth.getSession();
      setCurrentUserId(sessionData.session?.user.id || null);

      // Fetch all admins
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "admin")
        .order("created_at", { ascending: true }); // Assume the first user is the "Super Admin"

      if (!error) setAdmins(data || []);
      setLoading(false);
    }

    fetchAdmins();
  }, []);

  return (
    <div className="pb-10 max-w-[1200px] mx-auto min-h-[calc(100vh-140px)] flex flex-col">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h1 className="text-white font-[950] tracking-tighter text-4xl leading-none mb-2">System Administrators</h1>
          <p className="text-gray-500 font-bold text-sm">Manage users with root access to the SmartWaste platform.</p>
        </div>
        
        <Button 
          variant="outline"
          className="bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black rounded-xl h-11 px-6 flex items-center gap-2 font-black uppercase text-xs tracking-widest transition-all"
        >
          <FiUserPlus size={16} />
          Register Admin
        </Button>
      </div>

      {/* Table Container */}
      <div className="bg-[#11131a] border border-[#1e2029]/60 rounded-[2rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1a1c25]/30">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 w-1/3">
                  Administrator
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                  Username
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                  Privileges
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                  Date Appointed
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[#1e2029]/60">
              {loading ? (
                // Skeleton Loader
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-6"><Skeleton className="h-10 w-48 bg-[#1a1c25] rounded-xl" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-4 w-24 bg-[#1a1c25] rounded-full" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-6 w-28 bg-[#1a1c25] rounded-lg" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-4 w-24 bg-[#1a1c25] rounded-full" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-6 w-12 bg-[#1a1c25] rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : admins.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-gray-500 font-bold">
                    No administrators found.
                  </td>
                </tr>
              ) : (
                // Admins List
                admins.map((admin, index) => {
                  const isSuperAdmin = index === 0; // Assume first created is the root super admin
                  const isYou = admin.id === currentUserId;
                  const initials = admin.name ? admin.name[0].toUpperCase() : "A";
                  const username = admin.email ? `@${admin.email.split("@")[0]}` : "@admin";

                  return (
                    <tr 
                      key={admin.id} 
                      className="hover:bg-[#1a1c25]/30 transition-colors relative group"
                    >
                      {/* Left Accent Bar for Super Admin */}
                      <td className="px-8 py-6 relative">
                        {isSuperAdmin && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-amber-500 rounded-r-md" />
                        )}
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${
                            isSuperAdmin 
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                              : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          }`}>
                            {initials}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-[950] tracking-tight text-[15px]">
                                {admin.name || "Unknown Admin"}
                              </span>
                              {isYou && (
                                <span className="bg-gray-700/50 text-gray-300 border border-gray-600 border-opacity-50 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-sm">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                              ID: #{admin.id.split("-")[0]}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Username */}
                      <td className="px-8 py-6">
                        <span className="text-gray-400 font-medium text-sm">
                          {username}
                        </span>
                      </td>
                      
                      {/* Privileges Badge */}
                      <td className="px-8 py-6">
                        {isSuperAdmin ? (
                           <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                             <FaCrown size={12} />
                             Super Admin
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1.5 bg-[#1e2029] text-gray-300 border border-white/5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                             Admin
                           </span>
                        )}
                      </td>
                      
                      {/* Date Appointed */}
                      <td className="px-8 py-6">
                        <span className="text-gray-400 font-medium text-sm">
                          {new Date(admin.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: '2-digit', 
                            year: 'numeric' 
                          })}
                        </span>
                      </td>
                      
                      {/* Actions */}
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                            title="View Profile"
                          >
                            <FiEye size={16} />
                          </button>
                          <button 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                            title="Edit Permissions"
                          >
                            <FiEdit2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
