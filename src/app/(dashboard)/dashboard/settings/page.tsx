"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { FiUser, FiSliders, FiSave } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Simple Tailwind Toggle Switch Component
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button 
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors duration-300 ${
        checked ? 'bg-emerald-500' : 'bg-[#1e2029]'
      }`}
    >
      <div 
        className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
          checked ? 'translate-x-5 shadow-sm' : 'translate-x-0'
        }`} 
      />
    </button>
  );
}

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Preferences (Mocked as Local State, typically saved to a user_preferences table)
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [darkMode, setDarkMode] = useState(false); // Design shows it OFF
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        setUserId(session.user.id);

        const { data, error } = await supabase
          .from("users")
          .select("name, role")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        
        setName(data.name || "");
        // Capitalize role for UI
        const roleFormatted = data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : "Staff";
        setRole(roleFormatted);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    
    try {
      // 1. Update Profile Table (Name)
      const { error: profileError } = await supabase
        .from("users")
        .update({ name })
        .eq("id", userId);
        
      if (profileError) throw profileError;

      // 2. Update Auth User (Password) if provided
      if (password.trim() !== "") {
        const { error: authError } = await supabase.auth.updateUser({
          password: password
        });
        if (authError) throw authError;
        setPassword(""); // Clear input after successful change
      }

      toast.success("Account details saved successfully.");
    } catch (error: any) {
      toast.error(`Error saving changes: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-10 max-w-[1200px] mx-auto min-h-[calc(100vh-140px)] flex flex-col space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-white font-[950] tracking-tighter text-4xl leading-none mb-2">Settings</h1>
        <p className="text-gray-500 font-bold text-sm">Manage your account preferences and system configurations.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <Skeleton className="lg:col-span-7 h-[400px] rounded-[2.5rem] bg-[#11131a]" />
           <Skeleton className="lg:col-span-5 h-[400px] rounded-[2.5rem] bg-[#11131a]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Col: Account Details */}
          <div className="lg:col-span-7 bg-[#11131a] border border-[#1e2029]/60 rounded-[2.5rem] p-10 shadow-2xl flex flex-col">
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-[#1e2029]/60">
                <div className="bg-[#10b981]/10 p-1.5 rounded-full border border-[#10b981]/20">
                   <FiUser size={18} className="text-[#10b981]" />
                </div>
                <h2 className="text-white text-xl font-[950] tracking-tighter">Account Details</h2>
            </div>

            <div className="space-y-8 flex-1">
                {/* Full Name */}
                <div>
                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                        Full Name
                    </label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full h-14 bg-[#0a0b0f] border border-[#1e2029] rounded-2xl px-6 text-sm text-white font-bold tracking-tight outline-none focus:border-emerald-500/50 transition-colors"
                    />
                </div>

                {/* Role & Password Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                            Role
                        </label>
                        <input 
                            type="text" 
                            disabled
                            value={role}
                            className="w-full h-14 bg-[#1e2029]/30 border border-[#1e2029] rounded-2xl px-6 text-sm text-gray-400 font-bold tracking-tight opacity-70 cursor-not-allowed"
                        />
                        <p className="text-gray-600 text-[10px] mt-2 font-bold tracking-tight">Contact Super Admin to change roles.</p>
                    </div>
                    <div>
                        <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                            New Password
                        </label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Leave blank to keep current"
                            className="w-full h-14 bg-[#0a0b0f] border border-[#1e2029] rounded-2xl px-6 text-sm text-white font-bold tracking-tight outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Action Bottom */}
            <div className="pt-8">
                <Button 
                   onClick={handleSave}
                   disabled={saving}
                   className="h-12 bg-[#10b981] hover:bg-emerald-500 text-black rounded-xl px-8 font-black text-xs uppercase tracking-widest transition-all gap-2"
                >
                    <FiSave size={16} />
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
          </div>

          {/* Right Col: System Preferences */}
          <div className="lg:col-span-5 bg-[#11131a] border border-[#1e2029]/60 rounded-[2.5rem] p-10 shadow-2xl flex flex-col h-fit">
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-[#1e2029]/60">
                <div className="bg-indigo-500/10 p-1.5 rounded-full border border-indigo-500/20">
                   <FiSliders size={18} className="text-indigo-400" />
                </div>
                <h2 className="text-white text-xl font-[950] tracking-tighter">System Preferences</h2>
            </div>

            <div className="space-y-8">
               {/* Pref 1 */}
               <div className="flex items-center justify-between gap-4">
                  <div>
                     <p className="text-white text-sm font-[950] tracking-tight mb-1">Email Notifications</p>
                     <p className="text-gray-500 text-xs font-medium leading-snug">Receive daily route summaries.</p>
                  </div>
                  <Toggle checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
               </div>

               {/* Pref 2 */}
               <div className="flex items-center justify-between gap-4">
                  <div>
                     <p className="text-white text-sm font-[950] tracking-tight mb-1">Critical SMS Alerts</p>
                     <p className="text-gray-500 text-xs font-medium leading-snug">Immediate text for bins &gt; 90%.</p>
                  </div>
                  <Toggle checked={smsNotif} onChange={() => setSmsNotif(!smsNotif)} />
               </div>

               {/* Pref 3 */}
               <div className="flex items-center justify-between gap-4">
                  <div>
                     <p className="text-white text-sm font-[950] tracking-tight mb-1">Dark Mode UI</p>
                     <p className="text-gray-500 text-xs font-medium leading-snug">Lock system to dark theme.</p>
                  </div>
                  <Toggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
               </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
