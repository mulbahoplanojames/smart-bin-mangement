"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FiCpu, FiInfo, FiMapPin, FiWifi, 
  FiCheckCircle, FiPlus, FiMinus, FiImage, FiNavigation 
} from "react-icons/fi";

// Dynamic import for the Map component
const LocationPicker = dynamic(
  () => import("@/components/dashboard/LocationPicker"),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full rounded-2xl bg-[#11131a]" />
  }
);

export default function RegisterDevicePage() {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"dark" | "satellite">("dark");
  const [zoom, setZoom] = useState(14);
  const [formData, setFormData] = useState({
    serialNumber: "",
    binDepth: "50.0",
    locationName: "",
    wasteCategory: "General Waste",
    initialStatus: "Active (Online)",
    latitude: -1.9441,
    longitude: 30.0619
  });

  const supabase = createClient();

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 20));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 1));

  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    const toastId = toast.loading("Fetching your current location...");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData({ ...formData, latitude, longitude });
        setZoom(18); // Zoom in close to user location
        toast.success("Location pinpointed!", { id: toastId });
      },
      (error) => {
        toast.error("Failed to get location. Please enable location permissions.", { id: toastId });
      },
      { enableHighAccuracy: true }
    );
  };

  const handleDeploy = async () => {
    if (!formData.serialNumber || !formData.locationName) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const dbStatus = "Empty"; 

      const { error } = await supabase
        .from("bins")
        .insert({
          id: formData.serialNumber,
          location: formData.locationName,
          latitude: formData.latitude,
          longitude: formData.longitude,
          status: dbStatus,
          fillLevel: 0
        });

      if (error) throw error;

      toast.success("Device deployed successfully! Bin is now live on the network.");
      setFormData({
         ...formData,
         serialNumber: "",
         locationName: ""
      });
    } catch (error: any) {
      console.error("Deployment error:", error);
      toast.error(error.message || "Failed to deploy device. Please check if Serial Number is unique.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-10 max-w-[1000px] mx-auto px-4 md:px-0">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-white font-[950] tracking-tighter text-4xl mb-2">Register Device</h1>
        <p className="text-gray-500 font-bold text-sm">Deploy new hardware to the SmartWaste sensor network.</p>
      </div>

      {/* Main Form Card */}
      <div className="bg-[#11131a] border border-[#1e2029]/60 rounded-[2.5rem] p-6 md:p-12 shadow-2xl relative overflow-hidden group">
        
        {/* Section 1: Hardware Specifications */}
        <div className="mb-12">
          <div className="flex items-center gap-3 text-indigo-400 mb-8">
            <FiCpu size={20} />
            <h3 className="font-black uppercase tracking-[0.2em] text-xs">1. Hardware Specifications</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Hardware Serial Number *</label>
              <Input 
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="e.g., SW-21346" 
                className="bg-[#07080a] border-[#1e2029]/60 h-14 rounded-xl text-white placeholder:text-gray-800"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Bin Depth (CM) *</label>
              <Input 
                value={formData.binDepth}
                onChange={(e) => setFormData({ ...formData, binDepth: e.target.value })}
                placeholder="50.0" 
                className="bg-[#07080a] border-[#1e2029]/60 h-14 rounded-xl text-white placeholder:text-gray-800 font-mono"
              />
            </div>
          </div>
        </div>

        <Separator className="bg-[#1e2029]/40 mb-12" />

        {/* Section 2: Deployment Information */}
        <div className="mb-12">
          <div className="flex items-center gap-3 text-indigo-400 mb-8">
            <FiInfo size={20} />
            <h3 className="font-black uppercase tracking-[0.2em] text-xs">2. Deployment Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-1 space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Location Name *</label>
              <Input 
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                placeholder="e.g., Kigali Heights Main Entrance" 
                className="bg-[#07080a] border-[#1e2029]/60 h-14 rounded-xl text-white placeholder:text-gray-800"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Waste Category</label>
              <Select defaultValue="General Waste">
                <SelectTrigger className="bg-[#07080a] border-[#1e2029]/60 h-14 rounded-xl text-white">
                  <SelectValue placeholder="General Waste" />
                </SelectTrigger>
                <SelectContent className="bg-[#11131a] border-[#1e2029] text-white">
                  <SelectItem value="General Waste">General Waste</SelectItem>
                  <SelectItem value="Recyclables">Recyclables</SelectItem>
                  <SelectItem value="Organic">Organic</SelectItem>
                  <SelectItem value="Hazardous">Hazardous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Initial Status</label>
              <Select defaultValue="Active (Online)">
                <SelectTrigger className="bg-[#07080a] border-[#1e2029]/60 h-14 rounded-xl text-white">
                  <SelectValue placeholder="Active (Online)" />
                </SelectTrigger>
                <SelectContent className="bg-[#11131a] border-[#1e2029] text-white">
                  <SelectItem value="Active (Online)">Active (Online)</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Staging">Staging</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator className="bg-[#1e2029]/40 mb-12" />

        {/* Section 3: Geographical Coordinates */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-3 text-indigo-400">
              <FiMapPin size={20} />
              <h3 className="font-black uppercase tracking-[0.2em] text-xs">3. Geographical Coordinates</h3>
            </div>
            <Button 
                onClick={handleUseCurrentLocation}
                variant="outline"
                className="bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6] hover:bg-[#3b82f6]/20 rounded-xl flex items-center gap-2 px-6 h-11 text-xs font-black uppercase tracking-widest transition-all"
            >
                <FiNavigation size={14} />
                Use My Current Location
            </Button>
          </div>
          
          <div className="bg-[#3b82f6]/5 border border-[#3b82f6]/20 p-4 rounded-xl mb-8 flex items-center gap-3">
              <FiWifi className="text-[#3b82f6]/60" />
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Click anywhere on the map below or use the button above to pinpoint coordinates.</p>
          </div>

          <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-[#1e2029] mb-8 shadow-2xl relative group/map">
            <LocationPicker 
              onLocationSelect={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })} 
              initialPos={[formData.latitude, formData.longitude]}
              viewMode={viewMode}
              zoom={zoom}
            />

            {/* Map Interaction Controls */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                <div className="bg-[#11131a] border border-[#1e2029] rounded-xl p-1 flex flex-col gap-1 shadow-2xl">
                    <button 
                        onClick={() => setViewMode("dark")}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${viewMode === "dark" ? "bg-[#10b981] text-white shadow-[0_0_10px_#10b981]" : "text-gray-500 hover:text-white"}`}
                    >
                        <FiMapPin size={18} />
                    </button>
                    <button 
                        onClick={() => setViewMode("satellite")}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${viewMode === "satellite" ? "bg-[#10b981] text-white shadow-[0_0_10px_#10b981]" : "text-gray-500 hover:text-white"}`}
                    >
                        <FiImage size={18} />
                    </button>
                </div>
                <div className="bg-[#11131a] border border-[#1e2029] rounded-xl p-1 flex flex-col gap-1 shadow-2xl">
                    <button 
                        onClick={handleZoomIn}
                        className="w-9 h-9 hover:bg-white/5 text-gray-500 hover:text-white rounded-lg flex items-center justify-center transition-all"
                    >
                        <FiPlus size={18} />
                    </button>
                    <button 
                        onClick={handleZoomOut}
                        className="w-9 h-9 hover:bg-white/5 text-gray-500 hover:text-white rounded-lg flex items-center justify-center transition-all"
                    >
                        <FiMinus size={18} />
                    </button>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Latitude *</label>
              <Input 
                value={formData.latitude.toFixed(6)}
                readOnly
                className="bg-[#07080a] border-[#1e2029]/60 h-14 rounded-xl text-gray-500 font-mono"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Longitude *</label>
              <Input 
                value={formData.longitude.toFixed(6)}
                readOnly
                className="bg-[#07080a] border-[#1e2029]/60 h-14 rounded-xl text-gray-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-4">
          <Button 
            onClick={handleDeploy}
            disabled={loading}
            className="w-full h-16 bg-[#10b981] hover:bg-[#10b981]/90 text-black font-black text-lg rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-3 group/btn"
          >
            {loading ? (
                <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <FiCheckCircle size={22} className="group-hover:scale-110 transition-transform" />
                Deploy Smart Bin to Network
              </>
            )}
          </Button>
        </div>

        {/* Floating gradient circles for aesthetics */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      </div>
    </div>
  );
}
