"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FiBell,
  FiRefreshCw,
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
  FiCheckCircle,
  FiTrash2,
  FiClock,
  FiMapPin,
} from "react-icons/fi";

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

interface Alert {
  id: string;
  type: string;
  priority: "High" | "Medium" | "Low";
  binId: string;
  status: string;
  timestamp: string;
  bins: {
    location: string;
  };
}

const PRIORITY_STYLES = {
  High: {
    icon: FiAlertCircle,
    color: "#ef4444",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-400",
  },
  Medium: {
    icon: FiAlertTriangle,
    color: "#fbbf24",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
  },
  Low: {
    icon: FiInfo,
    color: "#3b82f6",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
  },
};

export default function AlertsPage() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const supabase = createClient();

  const fetchAlerts = async () => {
    try {
      const [alertsRes, binsRes] = await Promise.all([
        supabase
          .from("alerts")
          .select(`*, bins: "binId" (location)`)
          .eq("status", "Active")
          .order("timestamp", { ascending: false }),
        supabase
          .from("bins")
          .select("*")
          .or(`status.in.(Full,Overflow),"fillLevel".gte.90`),
      ]);

      if (alertsRes.error) throw alertsRes.error;
      if (binsRes.error) throw binsRes.error;

      const explicitAlerts = alertsRes.data || [];
      const criticalBins = binsRes.data || [];

      // Avoid duplicate alerts if an explicit alert already exists for the bin
      const existingAlertBinIds = new Set(
        explicitAlerts.map((a: any) => a.binId),
      );

      const implicitAlerts: Alert[] = criticalBins
        .filter((bin: any) => !existingAlertBinIds.has(bin.id))
        .map((bin: any) => ({
          id: `implicit-${bin.id}`,
          type:
            bin.fillLevel >= 100 || bin.status === "Overflow"
              ? "Bin Overflow"
              : "Critical Capacity",
          priority: "High",
          binId: bin.id,
          status: "Active",
          timestamp: new Date().toISOString(), // Use current time for live hardware state
          bins: { location: bin.location },
        }));

      const allAlerts = [...explicitAlerts, ...implicitAlerts].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      setAlerts(allAlerts);
    } catch (error: any) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Realtime subscription for BOTH alerts and bins table
    const channel = supabase
      .channel("alerts-page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        fetchAlerts,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bins" },
        fetchAlerts,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleResolve = async (id: string) => {
    if (id.startsWith("implicit-")) {
      toast.info(
        "This is a live hardware capacity alert. Please assign a Dispatch Task to clear it.",
      );
      return;
    }

    try {
      const { error } = await supabase
        .from("alerts")
        .update({ status: "Resolved" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Alert resolved successfully.");
      fetchAlerts();
    } catch (error: any) {
      toast.error("Failed to resolve alert.");
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchAlerts();
  };

  return (
    <div className="pb-10 max-w-[1000px] mx-auto min-h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FiBell className="text-indigo-400" size={24} />
            <h1 className="text-white font-[950] tracking-tighter text-4xl leading-none">
              System Notifications
            </h1>
          </div>
          <p className="text-gray-500 font-bold text-sm">
            Automated telemetry alerts for critical bin levels and hardware
            outages.
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="bg-[#11131a] border-[#1e2029] text-gray-400 hover:text-white rounded-xl h-11 px-5 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} size={14} />
          Refresh Feed
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6 flex-1">
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-32 w-full rounded-3xl bg-[#11131a]"
            />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        // Empty State: All Systems Nominal
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl bg-[#11131a] border-2 border-dashed border-[#1e2029] rounded-[3rem] p-16 text-center flex flex-col items-center shadow-2xl relative overflow-hidden group">
            <div className="bg-emerald-500/10 p-8 rounded-full mb-8 group-hover:scale-110 transition-transform duration-500">
              <FiCheckCircle className="text-[#10b981]" size={64} />
            </div>
            <h2 className="text-white text-4xl font-[950] tracking-tighter mb-4">
              All Systems Nominal
            </h2>
            <p className="text-gray-500 max-w-md mx-auto font-bold leading-relaxed">
              Telemetry looks good. There are no critical alerts, overflowing
              bins, or offline sensors detected in the network.
            </p>

            {/* Background ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#10b981]/5 rounded-full blur-[100px] pointer-events-none" />
          </div>
        </div>
      ) : (
        // Alerts List
        <div className="space-y-6">
          {alerts.map((alert) => {
            const style =
              PRIORITY_STYLES[alert.priority] || PRIORITY_STYLES.Medium;
            const Icon = style.icon;

            return (
              <div
                key={alert.id}
                className={`bg-[#11131a] border ${style.border} p-8 rounded-[2.5rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-[#1a1c25] transition-all duration-300 shadow-2xl group`}
              >
                <div className="flex items-center gap-6">
                  <div className={`${style.bg} p-5 rounded-2xl`}>
                    <Icon className={style.text} size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className={`${style.text} text-[10px] font-black uppercase tracking-[0.2em]`}
                      >
                        {alert.priority} Priority
                      </span>
                      <span className="text-gray-700 font-bold">•</span>
                      <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        {alert.type}
                      </span>
                    </div>
                    <h3 className="text-white text-2xl font-[950] tracking-tighter mb-2">
                      {alert.type} Detected
                    </h3>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-5">
                      <div className="flex items-center gap-2 text-gray-500">
                        <FiMapPin size={14} className="text-gray-700" />
                        <span className="text-xs font-bold tracking-tight">
                          {alert.bins?.location || "Unknown Location"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <FiClock size={14} className="text-gray-700" />
                        <span className="text-xs font-bold tracking-tight uppercase tracking-widest">
                          {formatRelativeTime(new Date(alert.timestamp))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 font-mono text-[10px]">
                        <span className="text-gray-700">ID:</span>
                        <span>{alert.binId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button
                    onClick={() => handleResolve(alert.id)}
                    className="flex-1 md:flex-none h-12 px-8 bg-emerald-500/10 border border-emerald-500/20 text-[#10b981] hover:bg-emerald-500 hover:text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                    Acknowledge & Resolve
                  </Button>
                  <button className="w-12 h-12 flex items-center justify-center text-gray-700 hover:text-white transition-colors">
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
