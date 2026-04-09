"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FiAlertCircle, FiCheckCircle, FiSend, FiTruck, FiUser } from "react-icons/fi";
import type { Bin, Collection, User } from "@/hooks/useDashboardData";

export default function DispatchTasksPage() {
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [criticalBins, setCriticalBins] = useState<Bin[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [recentCollections, setRecentCollections] = useState<any[]>([]);
  const [selectedBins, setSelectedBins] = useState<string[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>("");

  const supabase = createClient();

  const fetchData = async () => {
    try {
      // 1. Fetch critical bins (Full or Overflow OR fillLevel >= 90)
      const { data: binsData } = await supabase
        .from("bins")
        .select("*")
        .or(`status.in.(Full,Overflow),"fillLevel".gte.90`);
      
      // 2. Fetch drivers
      const { data: driversData } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("role", "driver");
      
      // 3. Fetch recent completed collections
      const { data: collectionsData } = await supabase
        .from("collections")
        .select(`
          *,
          bins: "binId" (location),
          drivers: "driverId" (name)
        `)
        .eq("status", "Completed")
        .order("timestamp", { ascending: false })
        .limit(10);

      setCriticalBins(binsData || []);
      setDrivers(driversData || []);
      setRecentCollections(collectionsData || []);
    } catch (error) {
      console.error("Error fetching dispatch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Realtime subscription for bins and collections
    const channel = supabase.channel("dispatch-page")
      .on("postgres_changes", { event: "*", schema: "public", table: "bins" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "collections" }, fetchData)
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSelectBin = (id: string) => {
    setSelectedBins(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedBins.length === criticalBins.length) {
      setSelectedBins([]);
    } else {
      setSelectedBins(criticalBins.map(b => b.id));
    }
  };

  const handleDispatch = async () => {
    if (selectedBins.length === 0) {
      toast.error("Please select at least one bin.");
      return;
    }
    if (!selectedDriver) {
      toast.error("Please select a driver for the assignment.");
      return;
    }

    setDispatching(true);
    try {
      const inserts = selectedBins.map(binId => {
        const bin = criticalBins.find(b => b.id === binId);
        return {
          binId: binId,
          driverId: selectedDriver,
          route: bin?.location || "Kigali Route",
          status: "Pending",
          wasteCollected: 0
        };
      });

      const { error } = await supabase.from("collections").insert(inserts);
      if (error) throw error;

      toast.success(`Dispatched ${selectedBins.length} assignment${selectedBins.length !== 1 ? "s" : ""} to the driver.`);
      setSelectedBins([]);
      setSelectedDriver("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to dispatch tasks.");
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="pb-10 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-white font-[950] tracking-tighter text-4xl mb-2">Dispatch Tasks</h1>
        <p className="text-gray-500 font-bold text-sm">Assign multiple critical bins to your field drivers at once.</p>
      </div>

      {/* 1. Critical Bins Section */}
      <div className="bg-[#11131a] border border-[#1e2029]/60 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 text-indigo-400 mb-8">
            <FiAlertCircle size={20} />
            <h3 className="font-black uppercase tracking-[0.2em] text-xs">Critical Bins Requiring Pickup</h3>
        </div>

        {/* Assignment Tool */}
        <div className="bg-[#07080a]/50 border border-[#1e2029]/60 p-6 rounded-3xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6 w-full md:w-auto">
              <span className="text-white font-black text-sm whitespace-nowrap">Assign Selected To:</span>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger className="bg-[#11131a] border-[#1e2029] w-full md:w-64 h-12 rounded-xl text-gray-300">
                  <SelectValue placeholder="-- Select a Driver --" />
                </SelectTrigger>
                <SelectContent className="bg-[#11131a] border-[#1e2029] text-white">
                  {drivers.map(driver => (
                    <SelectItem key={driver.id} value={driver.id}>
                       <div className="flex items-center gap-2">
                         <FiUser className="text-gray-500" />
                         <span>{driver.name}</span>
                       </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
           </div>
           <Button 
             onClick={handleDispatch}
             disabled={dispatching || selectedBins.length === 0}
             className="w-full md:w-auto h-12 px-8 bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white font-black rounded-xl flex items-center gap-2 transition-all shadow-[0_5px_15px_rgba(59,130,246,0.3)]"
           >
              {dispatching ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiSend size={18} />
                  Dispatch Selected Tasks
                </>
              )}
           </Button>
        </div>

        {/* Bins Table */}
        <div className="bg-[#07080a]/30 border border-[#1e2029]/30 rounded-3xl overflow-hidden">
          <Table>
            <TableHeader className="bg-[#1e2029]/20">
              <TableRow className="border-b border-[#1e2029]/40 hover:bg-transparent">
                <TableHead className="w-16">
                  <div className="flex items-center justify-center">
                     <input 
                       type="checkbox" 
                       className="w-5 h-5 rounded-lg accent-[#3b82f6]" 
                       onChange={handleSelectAll}
                       checked={criticalBins.length > 0 && selectedBins.length === criticalBins.length}
                     />
                  </div>
                </TableHead>
                <TableHead className="text-gray-500 font-black text-[10px] uppercase tracking-widest px-6 py-5">Location / Bin Serial</TableHead>
                <TableHead className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Fill Level</TableHead>
                <TableHead className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Current Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i} className="border-b border-[#1e2029]/20">
                    <TableCell colSpan={4} className="p-4"><Skeleton className="h-10 w-full bg-[#1e2029]/40 rounded-xl" /></TableCell>
                  </TableRow>
                ))
              ) : criticalBins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">No pending bins require collection right now!</p>
                  </TableCell>
                </TableRow>
              ) : (
                criticalBins.map((bin) => (
                  <TableRow key={bin.id} className="border-b border-[#1e2029]/20 hover:bg-white/5 transition-colors">
                    <TableCell className="w-16">
                      <div className="flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded-lg accent-[#3b82f6]" 
                          checked={selectedBins.includes(bin.id)}
                          onChange={() => handleSelectBin(bin.id)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div>
                        <p className="text-white font-[950] text-sm tracking-tight">{bin.location}</p>
                        <p className="text-gray-500 text-[10px] font-black uppercase mt-1 tracking-widest">{bin.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-[#1e2029] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${bin.fillLevel >= 90 ? 'bg-[#ef4444]' : 'bg-[#f59e0b]'}`}
                            style={{ width: `${bin.fillLevel}%` }}
                          />
                        </div>
                        <span className="text-white font-black text-xs">{bin.fillLevel}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${bin.fillLevel >= 90 ? "bg-[#ef4444]" : "bg-[#f59e0b]"} animate-pulse`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${bin.fillLevel >= 90 ? "text-[#ef4444]" : "text-[#f59e0b]"}`}>
                          {bin.fillLevel >= 90 ? "Critical" : "Warning"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 2. Recently Emptied Section */}
      <div className="bg-[#11131a] border border-[#1e2029]/60 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden min-h-[400px]">
        <div className="flex items-center gap-3 text-emerald-400 mb-10">
            <FiCheckCircle size={20} />
            <h3 className="font-black uppercase tracking-[0.2em] text-xs">Recently Emptied Bins</h3>
        </div>

        <div className="bg-[#07080a]/30 border border-[#1e2029]/30 rounded-3xl overflow-hidden">
          <Table>
            <TableHeader className="bg-[#1e2029]/20">
              <TableRow className="border-b border-[#1e2029]/40 hover:bg-transparent">
                <TableHead className="text-gray-500 font-black text-[10px] uppercase tracking-widest px-8 py-5">Location / Bin Serial</TableHead>
                <TableHead className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Emptied By</TableHead>
                <TableHead className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(2)].map((_, i) => (
                  <TableRow key={i} className="border-b border-[#1e2029]/20">
                    <TableCell colSpan={3} className="p-4"><Skeleton className="h-10 w-full bg-[#1e2029]/40 rounded-xl" /></TableCell>
                  </TableRow>
                ))
              ) : recentCollections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-48 text-center">
                    <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">No bins have been marked as collected yet.</p>
                  </TableCell>
                </TableRow>
              ) : (
                recentCollections.map((col) => (
                  <TableRow key={col.id} className="border-b border-[#1e2029]/20 hover:bg-white/5">
                    <TableCell className="px-8 py-5">
                      <div>
                        <p className="text-white font-[950] text-sm tracking-tight">{col.bins?.location || "Unknown Location"}</p>
                        <p className="text-gray-500 text-[10px] font-black uppercase mt-1 tracking-widest">{col.binId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[#10b981]/10 rounded-lg flex items-center justify-center text-[#10b981]">
                           <FiTruck size={14} />
                        </div>
                        <span className="text-gray-300 font-black text-xs uppercase tracking-tight">{col.drivers?.name || "System"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg">
                        <FiCheckCircle className="text-[#10b981]" size={12} />
                        <span className="text-[#10b981] text-[9px] font-black uppercase tracking-widest">Collected</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
