"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  FiFileText,
  FiDownloadCloud,
  FiSettings,
  FiClock,
  FiLock,
  FiChevronDown,
  FiRefreshCw,
} from "react-icons/fi";
import {
  BsFileEarmarkText,
  BsFileEarmarkPdf,
  BsFileEarmarkSpreadsheet,
} from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ReportsPage() {
  const [format, setFormat] = useState<"csv" | "pdf" | "excel">("csv");
  const [source, setSource] = useState("Hardware & Bin Status Report");
  const [isGenerating, setIsGenerating] = useState(false);

  // Default to covering the last 30 days
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const supabase = createClient();

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select a valid date range.");
      return;
    }

    setIsGenerating(true);

    try {
      let dataToExport: any[] = [];
      let filename = `report_${format}`;

      if (source === "Hardware & Bin Status Report") {
        // Query the bins table
        const { data, error } = await supabase
          .from("bins")
          .select("*")
          .gte("created_at", `${startDate}T00:00:00Z`)
          .lte("created_at", `${endDate}T23:59:59Z`);

        if (error) throw error;

        dataToExport = (data || []).map((b) => ({
          "Bin ID": b.id,
          Location: b.location,
          "Fill Level %": b.fillLevel,
          Status: b.status,
          Latitude: b.latitude,
          Longitude: b.longitude,
          "Registration Date": new Date(b.created_at).toLocaleDateString(),
        }));
        filename = `bins_status_${startDate}_to_${endDate}.csv`;
      } else if (source === "System Alert History") {
        // Query the alerts table joined with bins
        const { data, error } = await supabase
          .from("alerts")
          .select(`*, bins(location)`)
          .gte("timestamp", `${startDate}T00:00:00Z`)
          .lte("timestamp", `${endDate}T23:59:59Z`);

        if (error) throw error;

        dataToExport = (data || []).map((a: any) => ({
          "Alert ID": a.id,
          Type: a.type,
          Priority: a.priority,
          Status: a.status,
          "Bin ID": a.binId,
          "Bin Location": a.bins?.location || "N/A",
          "Date Triggered": new Date(a.timestamp).toLocaleString(),
        }));
        filename = `alerts_history_${startDate}_to_${endDate}.csv`;
      } else if (source === "Route & Collection Efficiency") {
        // Query collections and resolve driver names
        const { data, error } = await supabase
          .from("collections")
          .select(`*, driver:users(name)`)
          .gte("timestamp", `${startDate}T00:00:00Z`)
          .lte("timestamp", `${endDate}T23:59:59Z`);

        if (error) throw error;

        dataToExport = (data || []).map((c: any) => ({
          "Collection ID": c.id,
          "Driver Assigned": c.driver?.name || "Unassigned",
          "Assigned Route": c.route,
          "Waste Collected (Tons)": c.wasteCollected,
          "Job Status": c.status,
          "Date Completed": new Date(c.timestamp).toLocaleString(),
        }));
        filename = `collections_${startDate}_to_${endDate}.csv`;
      } else if (source === "Staff Performance Metrics") {
        // Query users
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .gte("created_at", `${startDate}T00:00:00Z`)
          .lte("created_at", `${endDate}T23:59:59Z`);

        if (error) throw error;

        dataToExport = (data || []).map((u: any) => ({
          "User ID": u.id,
          Name: u.name,
          Email: u.email,
          "System Role": u.role,
          "Joined Date": new Date(u.created_at).toLocaleDateString(),
        }));
        filename = `staff_registry_${startDate}_to_${endDate}.csv`;
      }

      if (dataToExport.length === 0) {
        toast.error("No data found for the selected date range.");
        setIsGenerating(false);
        return;
      }

      // Automatically fallback to CSV formatting for actual browser execution
      if (format !== "csv") {
        toast.info(
          `Generating as CSV instead, complex ${format.toUpperCase()} generation is pending backend implementation.`,
        );
      }

      // Convert JSON Array to raw CSV string
      const headers = Object.keys(dataToExport[0]).join(",");
      const csvRows = dataToExport.map(
        (row) =>
          Object.values(row)
            .map((val) => `"${val}"`)
            .join(","), // Wrap values in quotes to escape commas
      );
      const csvContent = [headers, ...csvRows].join("\n");

      // Trigger Browser Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Generated ${dataToExport.length} records successfully.`);
    } catch (e: any) {
      toast.error(`Error generating report: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pb-10 max-w-[1200px] mx-auto min-h-[calc(100vh-140px)] flex flex-col space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <FiFileText className="text-yellow-400" size={24} />
          <h1 className="text-white font-[950] tracking-tighter text-4xl leading-none">
            System Reports
          </h1>
        </div>
        <p className="text-gray-500 font-bold text-sm">
          Generate, export, and download comprehensive network and staff data.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Configuration Engine */}
        <div className="lg:col-span-7 bg-[#11131a] border border-[#1e2029]/60 rounded-[2.5rem] p-10 shadow-2xl flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <FiSettings size={20} className="text-yellow-400" />
            <h2 className="text-white text-xl font-[950] tracking-tighter">
              Configuration Engine
            </h2>
          </div>

          <div className="space-y-8 flex-1">
            {/* Data Source */}
            <div>
              <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                1. Select Data Source
              </label>
              <div className="relative group">
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full h-14 bg-[#0a0b0f] border border-[#1e2029] rounded-2xl px-6 text-sm text-white font-bold tracking-tight appearance-none outline-none focus:border-yellow-400/50 transition-colors cursor-pointer"
                >
                  <option>Hardware & Bin Status Report</option>
                  <option>Route & Collection Efficiency</option>
                  <option>Staff Performance Metrics</option>
                  <option>System Alert History</option>
                </select>
                <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-yellow-400 transition-colors pointer-events-none" />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                  Start Date
                </label>
                <div className="relative group">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-14 bg-[#0a0b0f] border border-[#1e2029] rounded-2xl px-6 text-sm text-white font-bold tracking-tight appearance-none outline-none focus:border-yellow-400/50 transition-colors cursor-pointer"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                  End Date
                </label>
                <div className="relative group">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-14 bg-[#0a0b0f] border border-[#1e2029] rounded-2xl px-6 text-sm text-white font-bold tracking-tight appearance-none outline-none focus:border-yellow-400/50 transition-colors cursor-pointer"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>
            </div>

            {/* Output Format */}
            <div>
              <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                2. Output Format
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setFormat("csv")}
                  className={`h-28 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden ${
                    format === "csv"
                      ? "bg-emerald-500/5 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)] text-[#10b981]"
                      : "bg-[#0a0b0f] border-[#1e2029] text-gray-500 hover:border-gray-600 hover:text-white"
                  }`}
                >
                  <BsFileEarmarkText size={28} />
                  <span
                    className={`text-xs font-black tracking-tight ${format === "csv" ? "text-[#10b981]" : "text-gray-400"}`}
                  >
                    CSV Data
                  </span>
                </button>
                <button
                  onClick={() => setFormat("pdf")}
                  className={`h-28 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden ${
                    format === "pdf"
                      ? "bg-red-500/5 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)] text-[#ef4444]"
                      : "bg-[#0a0b0f] border-[#1e2029] text-gray-500 hover:border-gray-600 hover:text-white"
                  }`}
                >
                  <BsFileEarmarkPdf size={28} />
                  <span
                    className={`text-xs font-black tracking-tight ${format === "pdf" ? "text-white" : "text-gray-400"}`}
                  >
                    PDF Document
                  </span>
                </button>
                <button
                  onClick={() => setFormat("excel")}
                  className={`h-28 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden ${
                    format === "excel"
                      ? "bg-blue-500/5 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)] text-[#3b82f6]"
                      : "bg-[#0a0b0f] border-[#1e2029] text-gray-500 hover:border-gray-600 hover:text-white"
                  }`}
                >
                  <BsFileEarmarkSpreadsheet size={28} />
                  <span
                    className={`text-xs font-black tracking-tight ${format === "excel" ? "text-white" : "text-gray-400"}`}
                  >
                    Excel Sheet
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-8 mt-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-16 bg-yellow-400 hover:bg-yellow-500 text-black rounded-2xl font-black text-sm uppercase tracking-widest transition-all gap-3"
            >
              {isGenerating ? (
                <>
                  <FiRefreshCw size={20} className="animate-spin" />
                  Compiling Data...
                </>
              ) : (
                <>
                  <FiDownloadCloud size={20} />
                  Generate & Download Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Col: Export Log */}
        <div className="lg:col-span-5 bg-[#11131a] border border-[#1e2029]/60 rounded-[2.5rem] p-10 shadow-2xl flex flex-col">
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-[#1e2029]/60">
            <FiClock size={20} className="text-emerald-400" />
            <h2 className="text-white text-xl font-[950] tracking-tighter">
              System Data Insights
            </h2>
          </div>

          <div className="flex-1 space-y-8">
            <div className="bg-[#0a0b0f] bg-opacity-50 rounded-2xl p-6 border border-[#1e2029]/60">
              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                All reports are pulled directly from live telemetry systems and
                the raw Supabase database in real-time.
              </p>
            </div>

            <div className="bg-[#0a0b0f] bg-opacity-50 rounded-2xl p-6 border border-[#1e2029]/60">
              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                Applying accurate date constraints ensures lightweight exports
                and keeps your local data focused on actionable metrics.
              </p>
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-8 bg-yellow-400/5 border border-yellow-400/10 rounded-2xl p-5 flex gap-4">
            <FiLock className="text-yellow-400 shrink-0 mt-0.5" size={16} />
            <div>
              <h4 className="text-yellow-400 text-xs font-black tracking-widest uppercase mb-1.5">
                Data Security Note
              </h4>
              <p className="text-gray-500 text-xs font-bold leading-relaxed">
                All exported records contain sensitive operational data. Ensure
                downloaded files are stored on secure, encrypted local drives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
