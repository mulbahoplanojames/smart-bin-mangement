"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { FiUserPlus, FiEye, FiEdit2, FiTruck } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DriverUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDrivers() {
      const supabase = createClient();
      
      const { data: sessionData } = await supabase.auth.getSession();
      setCurrentUserId(sessionData.session?.user.id || null);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "driver")
        .order("created_at", { ascending: false }); 

      if (!error) setDrivers(data || []);
      setLoading(false);
    }

    fetchDrivers();
  }, []);

  return (
    <div className="pb-10 max-w-[1200px] mx-auto min-h-[calc(100vh-140px)] flex flex-col">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h1 className="text-white font-[950] tracking-tighter text-4xl leading-none mb-2">Fleet Drivers</h1>
          <p className="text-gray-500 font-bold text-sm">Manage field personnel, route drivers, and fleet assignments.</p>
        </div>
        
        <Button 
          variant="outline"
          className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl h-11 px-6 flex items-center gap-2 font-black uppercase text-xs tracking-widest transition-all"
        >
          <FiUserPlus size={16} />
          Register Driver
        </Button>
      </div>

      {/* Table Container */}
      <div className="bg-[#11131a] border border-[#1e2029]/60 rounded-[2rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1a1c25]/30">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 w-1/3">
                  Driver Full Name
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                  Username
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                  Role
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                  Join Date
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
              ) : drivers.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center">
                     <div className="flex flex-col items-center justify-center opacity-50">
                        <FiTruck size={32} className="text-gray-500 mb-4" />
                        <p className="text-gray-500 font-bold">No dispatch drivers registered in the system.</p>
                     </div>
                  </td>
                </tr>
              ) : (
                // Drivers List
                drivers.map((user) => {
                  const isYou = user.id === currentUserId;
                  const initials = user.name ? user.name[0].toUpperCase() : "D";
                  const username = user.email ? `@${user.email.split("@")[0]}` : "@driver";

                  return (
                    <tr 
                      key={user.id} 
                      className="hover:bg-[#1a1c25]/30 transition-colors relative group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border bg-[#1e2029] text-gray-300 border-white/5">
                            {initials}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-[950] tracking-tight text-[15px]">
                                {user.name || "Unknown Driver"}
                              </span>
                              {isYou && (
                                <span className="bg-gray-700/50 text-gray-300 border border-gray-600 border-opacity-50 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-sm">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                              ID: #{user.id.split("-")[0]}
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
                      
                      {/* Role Badge */}
                      <td className="px-8 py-6">
                         <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                           Field Driver
                         </span>
                      </td>
                      
                      {/* Date Joined */}
                      <td className="px-8 py-6">
                        <span className="text-gray-400 font-medium text-sm">
                          {new Date(user.created_at).toLocaleDateString('en-US', { 
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
