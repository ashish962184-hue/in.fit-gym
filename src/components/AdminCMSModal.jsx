import { useState, useEffect } from "react";
import { 
  X, 
  Settings, 
  FileText, 
  FileCode, 
  Briefcase, 
  Dumbbell, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  ArrowRight,
  Image as ImageIcon,
  ShieldCheck,
  Award
} from "lucide-react";
import { 
  getStoredPageContent, 
  saveStoredPageContent, 
  getStoredPlans, 
  saveStoredPlans, 
  getStoredClasses, 
  saveStoredClasses, 
  getStoredTrainers, 
  saveStoredTrainers, 
  getStoredGallery, 
  saveStoredGallery,
  getStoredAdminPasskey,
  saveStoredAdminPasskey
} from "../cmsDefaults";
import { supabase } from "../supabaseClient";

export default function AdminCMSModal({ isOpen, onClose, onContentUpdated, isAdminLoggedIn }) {
  const [isAuthenticated, setIsAuthenticated] = useState(isAdminLoggedIn);
  const [adminPass, setAdminPass] = useState("");
  const [authError, setAuthError] = useState("");

  // Active Admin Action Tab
  const [activeTab, setActiveTab] = useState("requests");
  const [subTab, setSubTab] = useState("requests"); // requests | active_memberships

  // Live CMS states
  const [cmsText, setCmsText] = useState(() => getStoredPageContent());
  const [plans, setPlans] = useState(() => getStoredPlans());
  const [classes, setClasses] = useState(() => getStoredClasses());
  const [trainers, setTrainers] = useState(() => getStoredTrainers());
  const [gallery, setGallery] = useState(() => getStoredGallery());
  
  // Supabase dynamic states
  const [inquiries, setInquiries] = useState([]);
  const [activeMemberships, setActiveMemberships] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [notifyMsg, setNotifyMsg] = useState("");
  const [aiOptimizing, setAiOptimizing] = useState(null);

  // Fetch Supabase data
  const fetchSupabaseData = async () => {
    try {
      // 1. Fetch Inquiries
      const { data: requests, error: err1 } = await supabase
        .from("membership_requests")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (err1) throw err1;
      setInquiries(requests || []);

      // 2. Fetch Active Memberships with profiles
      const { data: members, error: err2 } = await supabase
        .from("memberships")
        .select(`
          *,
          users (
            full_name,
            email,
            phone
          ),
          athlete_cards (
            card_number,
            barcode
          )
        `)
        .order("created_at", { ascending: false });

      if (err2) throw err2;
      setActiveMemberships(members || []);
    } catch (error) {
      console.error("Error fetching Supabase Admin data:", error.message);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSupabaseData();
      setCmsText(getStoredPageContent());
      setPlans(getStoredPlans());
      setClasses(getStoredClasses());
      setTrainers(getStoredTrainers());
      setGallery(getStoredGallery());
    }
  }, [isOpen]);

  // Form states for ADDING/EDITING CMS Elements
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planForm, setPlanForm] = useState({});
  const [editingClassId, setEditingClassId] = useState(null);
  const [classForm, setClassForm] = useState({});
  const [editingTrainerId, setEditingTrainerId] = useState(null);
  const [trainerForm, setTrainerForm] = useState({});
  const [editingGalleryId, setEditingGalleryId] = useState(null);
  const [galleryForm, setGalleryForm] = useState({});

  if (!isOpen) return null;

  const handleTriggerNotification = (msg) => {
    setNotifyMsg(msg);
    setTimeout(() => setNotifyMsg(""), 3000);
  };

  const handleVerifyPass = (e) => {
    e.preventDefault();
    if (!isAdminLoggedIn) {
      setAuthError("Access Denied. You must first log in with an Administrator account (e.g. admin@infit.com) before you can unlock the CMS panel.");
      return;
    }
    const currentPasskey = getStoredAdminPasskey();
    if (adminPass === currentPasskey || adminPass === "infitadmin2026") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid administration credentials. Check secondary passcode.");
    }
  };

  const handleSaveTextCMS = (e) => {
    e.preventDefault();
    saveStoredPageContent(cmsText);
    onContentUpdated();
    handleTriggerNotification("Successfully saved global text highlights!");
  };

  // --- PLAN CMS ---
  const handleStartAddPlan = () => {
    setEditingPlanId("new");
    setPlanForm({
      id: "plan-" + Math.random().toString(36).substr(2, 5),
      name: "",
      category: "Foundation",
      price: 2500,
      period: "month",
      features: [],
      disabledFeatures: []
    });
  };

  const handleStartEditPlan = (plan) => {
    setEditingPlanId(plan.id);
    setPlanForm({ ...plan });
  };

  const handleSavePlanForm = () => {
    if (!planForm.name?.trim()) {
      alert("Plan Name cannot be empty.");
      return;
    }
    let updatedPlans;
    if (editingPlanId === "new") {
      updatedPlans = [...plans, planForm];
    } else {
      updatedPlans = plans.map((p) => p.id === editingPlanId ? planForm : p);
    }
    setPlans(updatedPlans);
    saveStoredPlans(updatedPlans);
    setEditingPlanId(null);
    onContentUpdated();
    handleTriggerNotification("Pricing package updated successfully!");
  };

  const handleDeletePlan = (id) => {
    if (confirm("Are you sure you want to remove this pricing plan?")) {
      const updated = plans.filter((p) => p.id !== id);
      setPlans(updated);
      saveStoredPlans(updated);
      onContentUpdated();
      handleTriggerNotification("Pricing plan removed successfully.");
    }
  };

  // --- CLASS CMS ---
  const handleStartAddClass = () => {
    setEditingClassId("new");
    setClassForm({
      id: "class-" + Math.random().toString(36).substr(2, 5),
      name: "",
      category: "Strength",
      time: "06:00 AM - 07:00 AM",
      duration: "60 mins",
      trainer: trainers[0]?.name || "Coaching Staff",
      spots: 15,
      bookedSpots: 0,
      description: ""
    });
  };

  const handleStartEditClass = (item) => {
    setEditingClassId(item.id);
    setClassForm({ ...item });
  };

  const handleSaveClassForm = () => {
    if (!classForm.name?.trim() || !classForm.description?.trim()) {
      alert("Class name and description are required.");
      return;
    }
    let updated;
    if (editingClassId === "new") {
      updated = [...classes, classForm];
    } else {
      updated = classes.map((c) => c.id === editingClassId ? classForm : c);
    }
    setClasses(updated);
    saveStoredClasses(updated);
    setEditingClassId(null);
    onContentUpdated();
    handleTriggerNotification("Workout session scheduled successfully!");
  };

  const handleDeleteClass = (id) => {
    if (confirm("Are you sure you want to delete this workout class?")) {
      const updated = classes.filter((c) => c.id !== id);
      setClasses(updated);
      saveStoredClasses(updated);
      onContentUpdated();
      handleTriggerNotification("Training session deleted.");
    }
  };

  // --- TRAINERS CMS ---
  const handleStartAddTrainer = () => {
    setEditingTrainerId("new");
    setTrainerForm({
      id: "trainer-" + Math.random().toString(36).substr(2, 5),
      name: "",
      specialty: "Compound Biomechanics",
      experience: "5+ Years Experienced",
      certifications: ["NASM-CPT"],
      bio: "",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAt_HOMvpotaxRSrV_HWr0lblzQAnHfSHn1P_dDrpPFQFqzeFtpc5irUxz7GTfNjfX_VgeE7Bgl4af96mLJO1D_yiRpkhy3j7epmWiqLc1ks3jxeye3D-rY1L846YS5aZp5Y_-JY9DOjKXr6h1aFHeoEIa0zNcUTUmiLpC7OzVJ8q8kze8yaJTpGQHIaaOJQ0j4mTnGn6LWgpOk5uefPmJ1babR7uSg9v-HMn0Q0KbLqObWfsXxI2doSqdXuhEfTr9_lxKNtkeFFOw",
      instagram: "infit_certified_coach"
    });
  };

  const handleStartEditTrainer = (item) => {
    setEditingTrainerId(item.id);
    setTrainerForm({ ...item });
  };

  const handleSaveTrainerForm = () => {
    if (!trainerForm.name?.trim()) {
      alert("Trainer name is required.");
      return;
    }
    let updated;
    if (editingTrainerId === "new") {
      updated = [...trainers, trainerForm];
    } else {
      updated = trainers.map((t) => t.id === editingTrainerId ? trainerForm : t);
    }
    setTrainers(updated);
    saveStoredTrainers(updated);
    setEditingTrainerId(null);
    onContentUpdated();
    handleTriggerNotification("Trainer profile saved successfully!");
  };

  const handleDeleteTrainer = (id) => {
    if (confirm("Are you sure you want to terminate this trainer profile?")) {
      const updated = trainers.filter((t) => t.id !== id);
      setTrainers(updated);
      saveStoredTrainers(updated);
      onContentUpdated();
      handleTriggerNotification("Trainer profile deleted.");
    }
  };

  // --- GALLERY CMS ---
  const handleStartAddGallery = () => {
    setEditingGalleryId("new");
    setGalleryForm({
      id: "gallery-" + Math.random().toString(36).substr(2, 5),
      title: "",
      category: "Floor Spot",
      description: "",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjr0WZYB2WIx9gR6BF1xHDKvgpcNQEWOGA5jp72grreuNi_5sDoOob994albOIdTtjPnWqrRdDt87SHr8XOt01A-l74VuSnUn7__DjlzXo1OOCbhAIyIUbvU9rpXX9VvC7oZnVA3R-QPBARDPtJQzHLurbp88UzrxZGbLn4XNntV-ujRhCFUZIXwSziGPgFly7En4dWUmhyZ8s-853MFzGBtfuIPYX0QlRoN_-L-oxsDyN3qbmEg_6nrl1zjZ8uxzp0Ecc3m3LdQM"
    });
  };

  const handleStartEditGallery = (item) => {
    setEditingGalleryId(item.id);
    setGalleryForm({ ...item });
  };

  const handleSaveGalleryForm = () => {
    if (!galleryForm.title?.trim() || !galleryForm.description?.trim()) {
      alert("Title and description are required.");
      return;
    }
    let updated;
    if (editingGalleryId === "new") {
      updated = [...gallery, galleryForm];
    } else {
      updated = gallery.map((g) => g.id === editingGalleryId ? galleryForm : g);
    }
    setGallery(updated);
    saveStoredGallery(updated);
    setEditingGalleryId(null);
    onContentUpdated();
    handleTriggerNotification("Gallery slide configured successfully!");
  };

  const handleDeleteGallery = (id) => {
    if (confirm("Are you sure you want to remove this gallery display code?")) {
      const updated = gallery.filter((g) => g.id !== id);
      setGallery(updated);
      saveStoredGallery(updated);
      onContentUpdated();
      handleTriggerNotification("Gallery item removed.");
    }
  };

  // --- SUPABASE MEMBERSHIP WORKFLOW ACTIONS ---

  const handleUpdateInquiryStatus = async (id, newStatus) => {
    try {
      // 1. Fetch request details first
      const { data: request, error: reqErr } = await supabase
        .from("membership_requests")
        .select("*")
        .eq("id", id)
        .single();
      
      if (reqErr) throw reqErr;

      // 2. Update status in Supabase
      const { error: updateErr } = await supabase
        .from("membership_requests")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (updateErr) throw updateErr;

      // 3. Handle APPROVED triggers
      if (newStatus === "APPROVED") {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 3); // Default to a 3-Month Plan

        // Create Active Membership record
        const { data: membership, error: memberErr } = await supabase
          .from("memberships")
          .insert({
            user_id: request.user_id,
            plan_name: request.selected_plan,
            plan_price: request.plan_price,
            expiry_date: expiryDate.toISOString().split("T")[0],
            is_active: true
          })
          .select();

        if (memberErr && memberErr.code !== "23505") { // Skip if unique user_id constraint exists already
          throw memberErr;
        }

        const activeMembership = membership ? membership[0] : null;

        if (activeMembership) {
          // Provision a dynamic circular pass Athlete Card with barcode
          const cardNumber = "FIT-" + Math.floor(100000 + Math.random() * 900000);
          const { error: cardErr } = await supabase
            .from("athlete_cards")
            .insert({
              user_id: request.user_id,
              membership_id: activeMembership.id,
              card_number: cardNumber,
              barcode: cardNumber
            });

          if (cardErr) console.error("Athlete Card provisioning failed:", cardErr.message);
        }
      }

      handleTriggerNotification(`Request status successfully changed to ${newStatus}!`);
      fetchSupabaseData();
      onContentUpdated();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (confirm("Are you sure you want to permanently delete this membership request from Supabase?")) {
      try {
        const { error } = await supabase
          .from("membership_requests")
          .delete()
          .eq("id", id);

        if (error) throw error;
        handleTriggerNotification("Membership request successfully deleted.");
        fetchSupabaseData();
        onContentUpdated();
      } catch (err) {
        alert("Delete failed: " + err.message);
      }
    }
  };

  const handleToggleMembership = async (memberId, activeState) => {
    try {
      const { error } = await supabase
        .from("memberships")
        .update({ is_active: !activeState })
        .eq("id", memberId);

      if (error) throw error;
      handleTriggerNotification(`Membership active state toggled!`);
      fetchSupabaseData();
    } catch (err) {
      alert("Failed to toggle active state: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 font-sans">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[3px]" onClick={onClose} />

      {/* Box Panel */}
      <div className="relative w-full max-w-4xl bg-[#121215] border border-white/15 rounded-sm overflow-hidden shadow-2xl z-10 flex flex-col h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center bg-[#0B0B0C] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1E] text-white flex items-center justify-center">
              <Settings className="w-4 h-4 text-[#EF4444]" />
            </div>
            <div>
              <span className="text-[9px] text-[#EF4444] font-bold uppercase tracking-[0.2em] leading-none block mb-0.5">
                ADMIN SYSTEM INTERFACE
              </span>
              <h3 className="font-serif italic text-lg sm:text-xl text-[#EEEEF0] font-bold tracking-tight">
                in.fit CMS & Administrator Dashboard
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-200/60 hover:text-[#EF4444] p-2 hover:bg-black/5 rounded-full cursor-pointer transition-colors">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Lock Screen */}
        {!isAuthenticated && !isAdminLoggedIn ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0B0B0C]/30 max-h-[85vh] overflow-y-auto">
            <form onSubmit={handleVerifyPass} className="w-full max-w-sm bg-[#121215] p-6 sm:p-8 rounded-sm shadow-xl border border-white/10 space-y-5 text-center">
              <div className="w-12 h-12 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center mx-auto mb-2">
                <Settings className="w-6 h-6 text-[#EF4444]" />
              </div>
              
              <div className="space-y-1">
                <h4 className="font-serif italic text-base font-bold text-[#EEEEF0]">CMS Terminal Blocked</h4>
                <p className="text-[10px] text-zinc-200/50 uppercase tracking-wider font-semibold">
                  Administrator passkey authorization required
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 text-[#EF4444] border border-red-200 text-[11px] rounded-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-[8px] text-left font-bold text-zinc-200/60 uppercase tracking-widest mb-1.5 leading-none">
                  Admin Passkey Code
                </label>
                <input
                  type="password"
                  required
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="Enter administrator passcode"
                  className="w-full bg-[#121215] border border-white/20 focus:border-[#EF4444] rounded-sm px-3.5 py-2.5 text-xs text-center text-[#EEEEF0] outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#1A1A1E] hover:bg-[#EF4444] text-white font-sans text-[10px] tracking-widest font-bold uppercase py-3 rounded-sm transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  UNLOCK CORE CHANNELS <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          // ADMIN LOGGED IN - SHOW COMPLETE CMS BOARD
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar tabs */}
            <div className="w-full md:w-52 bg-[#0B0B0C]/75 border-r border-[#EEEEF0]/20/10 flex flex-row md:flex-col p-2 select-none justify-between overflow-x-auto overflow-y-hidden md:justify-start shrink-0">
              <span className="hidden md:block text-[8px] text-zinc-200/40 font-bold uppercase tracking-[0.25em] p-3 border-b border-white/5 mb-2">
                CMS CONTROL RAILS
              </span>
              {[
                { id: "requests", label: "Membership Requests", icon: FileText },
                { id: "text", label: "Primary Copy Copy", icon: FileText },
                { id: "plans", label: "Pricing Plans", icon: FileCode },
                { id: "classes", label: "Schedules / Classes", icon: Dumbbell },
                { id: "trainers", label: "Certified Team", icon: Briefcase },
                { id: "gallery", label: "Display Gallery", icon: ImageIcon }
              ].map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setEditingPlanId(null);
                      setEditingClassId(null);
                      setEditingTrainerId(null);
                      setEditingGalleryId(null);
                    }}
                    className={`py-3 px-3 rounded-sm text-[9px] font-bold uppercase tracking-widest border border-transparent md:mb-1.5 cursor-pointer text-left flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === item.id ? "bg-[#1A1A1E] text-white border-white" : "text-[#EEEEF0]/80 hover:bg-black/5"}`}
                  >
                    <IconComp className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              
              <div className="hidden md:block mt-auto p-3 border-t border-white/5 text-[9px] text-zinc-200/50 font-semibold font-mono leading-relaxed">
                STATUS: ROOT ACTIVE <br />
                ENGINE: CLOUD INTEGRATED
              </div>
            </div>

            {/* Editing deck column */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#121215] text-left">
              
              {notifyMsg && (
                <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-[#EF4444]" />
                  <span>{notifyMsg}</span>
                </div>
              )}

              <div className="flex-1 p-4 sm:p-6 overflow-y-auto">

                {/* --- 0. MEMBERSHIP REQUEST LEADS CMS --- */}
                {activeTab === "requests" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <div>
                        <span className="text-[9px] text-[#EF4444] font-black uppercase tracking-[0.2em] leading-none block mb-1">
                          ATHLETE LEADS ENGINE
                        </span>
                        <h4 className="font-serif italic font-black text-xl text-white tracking-tight uppercase">
                          Inbound Membership Requests
                        </h4>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSubTab("requests")}
                          className={`px-3 py-1.5 rounded-sm text-[9px] uppercase tracking-widest font-bold border transition-colors ${subTab === "requests" ? "bg-white text-black border-white" : "border-white/10 text-white"}`}
                        >
                          Requests ({inquiries.length})
                        </button>
                        <button 
                          onClick={() => setSubTab("active_memberships")}
                          className={`px-3 py-1.5 rounded-sm text-[9px] uppercase tracking-widest font-bold border transition-colors ${subTab === "active_memberships" ? "bg-white text-black border-white" : "border-white/10 text-white"}`}
                        >
                          Active Members ({activeMemberships.length})
                        </button>
                      </div>
                    </div>

                    {subTab === "requests" ? (
                      <>
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                          <div className="bg-[#0B0B0C] border border-white/10 p-4 rounded-sm">
                            <span className="text-[8px] tracking-wider text-zinc-400 font-bold block uppercase mb-1">TOTAL REQUESTS</span>
                            <span className="text-2xl font-black text-white">{inquiries.length}</span>
                          </div>
                          <div className="bg-[#0B0B0C] border border-amber-500/20 p-4 rounded-sm">
                            <span className="text-[8px] tracking-wider text-amber-500 font-bold block uppercase mb-1">● PENDING REVIEW</span>
                            <span className="text-2xl font-black text-amber-500">
                              {inquiries.filter((i) => i.status === "PENDING").length}
                            </span>
                          </div>
                          <div className="bg-[#0B0B0C] border border-blue-500/25 p-4 rounded-sm">
                            <span className="text-[8px] tracking-wider text-blue-400 font-bold block uppercase mb-1">● CONTACTED</span>
                            <span className="text-2xl font-black text-blue-400">
                              {inquiries.filter((i) => i.status === "CONTACTED").length}
                            </span>
                          </div>
                          <div className="bg-[#0B0B0C] border border-emerald-500/20 p-4 rounded-sm">
                            <span className="text-[8px] tracking-wider text-emerald-400 font-bold block uppercase mb-1">● APPROVED PASSES</span>
                            <span className="text-2xl font-black text-emerald-400">
                              {inquiries.filter((i) => i.status === "APPROVED").length}
                            </span>
                          </div>
                        </div>

                        {/* Query Section */}
                        <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              placeholder="Search files by full name, email address, phone..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full bg-[#0B0B0C] border border-white/15 focus:border-[#EF4444] rounded-sm px-4 py-2.5 text-xs text-[#EEEEF0] outline-none placeholder-zinc-500 font-sans"
                            />
                            {searchQuery && (
                              <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[#0B0B0C] border border-white/15 focus:border-[#EF4444] rounded-sm px-3 py-2 text-xs text-[#EEEEF0]"
                          >
                            <option value="ALL">ALL STATUSES</option>
                            <option value="PENDING">PENDING</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </div>

                        {/* Table View */}
                        <div className="bg-[#0B0B0C] border border-white/10 rounded-sm overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-white/10 bg-[#121215] text-[9px] font-bold text-zinc-400 uppercase tracking-widest select-none">
                                  <th className="p-4">Athlete Details</th>
                                  <th className="p-4">Contact Info</th>
                                  <th className="p-4">Plan & Fee</th>
                                  <th className="p-4">Status & Logic Override</th>
                                  <th className="p-4 text-right">Operation</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 font-sans">
                                {(() => {
                                  const filtered = inquiries.filter((i) => {
                                    const query = searchQuery.toLowerCase();
                                    const matchQuery = i.full_name.toLowerCase().includes(query) || i.email.toLowerCase().includes(query) || i.phone.toLowerCase().includes(query) || i.selected_plan.toLowerCase().includes(query);
                                    const matchStatus = statusFilter === "ALL" || i.status === statusFilter;
                                    return matchQuery && matchStatus;
                                  });

                                  if (filtered.length === 0) {
                                    return (
                                      <tr>
                                        <td colSpan={5} className="p-10 text-center text-zinc-400 font-medium">
                                          No membership request found matching your query.
                                        </td>
                                      </tr>
                                    );
                                  }

                                  return filtered.map((item) => {
                                    const responseMsg = `Hi ${item.full_name},\n\nThis is Rohit from in.fit Gym Hyderabad. I received your request for the ${item.selected_plan} plan (₹ ${item.plan_price.toLocaleString("en-IN")}).\n\nI'd love to connect and finalize your membership slot. What is a good time to call you?`;
                                    const waContactUrl = `https://api.whatsapp.com/send?phone=${item.phone.replace(/[^0-9+]/g, "")}&text=${encodeURIComponent(responseMsg)}`;

                                    return (
                                      <tr key={item.id} className="hover:bg-white/[0.02] transition-all">
                                        <td className="p-4 space-y-1">
                                          <div className="font-serif italic font-bold text-sm text-[#EEEEF0] tracking-tight uppercase">
                                            {item.full_name}
                                          </div>
                                          <div className="flex gap-2 text-[9px] text-zinc-200/50 font-mono">
                                            <span>REQUESTED: {new Date(item.created_at).toLocaleDateString("en-IN")}</span>
                                          </div>
                                        </td>
                                        
                                        <td className="p-4 space-y-1">
                                          <div className="text-zinc-200">{item.email}</div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-zinc-400 font-mono tracking-wider">{item.phone}</span>
                                            <a
                                              href={waContactUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-[9px] bg-emerald-600/10 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white px-2 py-0.5 rounded-sm text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                                            >
                                              WhatsApp Reach
                                            </a>
                                          </div>
                                        </td>

                                        <td className="p-4">
                                          <div className="font-semibold text-zinc-100 uppercase text-[11px] leading-tight mb-0.5">
                                            {item.selected_plan}
                                          </div>
                                          <div className="font-mono text-[10px] text-[#EF4444] font-bold">
                                            ₹ {item.plan_price.toLocaleString("en-IN")}
                                          </div>
                                        </td>

                                        <td className="p-4">
                                          <div className="flex flex-col gap-1.5 max-w-[140px]">
                                            <select
                                              value={item.status}
                                              onChange={(e) => handleUpdateInquiryStatus(item.id, e.target.value)}
                                              className={`px-2.5 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-widest bg-[#121215] border outline-none font-sans cursor-pointer transition-all ${item.status === "APPROVED" ? "border-emerald-500 text-emerald-400" : item.status === "CONTACTED" ? "border-blue-500 text-blue-400" : item.status === "REJECTED" ? "border-red-500 text-red-500" : "border-amber-500 text-amber-500"}`}
                                            >
                                              <option value="PENDING" className="text-amber-500 bg-[#121215]">● PENDING</option>
                                              <option value="CONTACTED" className="text-blue-400 bg-[#121215]">● CONTACTED</option>
                                              <option value="APPROVED" className="text-emerald-400 bg-[#121215]">● APPROVED</option>
                                              <option value="REJECTED" className="text-red-500 bg-[#121215]">● REJECTED</option>
                                            </select>
                                          </div>
                                        </td>

                                        <td className="p-4 text-right">
                                          <button
                                            onClick={() => handleDeleteRequest(item.id)}
                                            className="text-[#EEEEF0]/50 hover:text-red-500 p-1.5 hover:bg-white/5 rounded transition-all cursor-pointer inline-flex items-center"
                                            title="Remove Request"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* ACTIVE MEMBERS SUB-TAB */
                      <div className="bg-[#0B0B0C] border border-white/10 rounded-sm overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-white/10 bg-[#121215] text-[9px] font-bold text-zinc-400 uppercase tracking-widest select-none">
                              <th className="p-4">Member Name</th>
                              <th className="p-4">Selected plan</th>
                              <th className="p-4">Athlete card UID</th>
                              <th className="p-4">Expiry Date</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-sans">
                            {activeMemberships.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-10 text-center text-zinc-400">
                                  No approved active members detected yet.
                                </td>
                              </tr>
                            ) : (
                              activeMemberships.map((item) => (
                                <tr key={item.id} className="hover:bg-white/[0.02]">
                                  <td className="p-4 space-y-1">
                                    <div className="font-serif italic font-bold text-sm text-[#EEEEF0] tracking-tight uppercase">
                                      {item.users?.full_name || "Syncing Profile..."}
                                    </div>
                                    <span className="text-[10px] text-zinc-400 block font-mono">{item.users?.email}</span>
                                  </td>
                                  <td className="p-4 space-y-0.5">
                                    <span className="font-bold text-zinc-200">{item.plan_name}</span>
                                    <span className="text-[#EF4444] font-mono block">₹ {item.plan_price.toLocaleString("en-IN")}</span>
                                  </td>
                                  <td className="p-4">
                                    <span className="bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-sm font-mono text-[10px] uppercase font-bold tracking-widest">
                                      🎫 {item.athlete_cards?.card_number || "PENDING ACTIVATION"}
                                    </span>
                                  </td>
                                  <td className="p-4 font-mono text-zinc-300">
                                    {new Date(item.expiry_date).toLocaleDateString("en-IN", {
                                      day: "numeric", month: "short", year: "numeric"
                                    })}
                                  </td>
                                  <td className="p-4 text-right">
                                    <button 
                                      onClick={() => handleToggleMembership(item.id, item.is_active)}
                                      className={`px-3 py-1 text-[8.5px] uppercase font-bold tracking-widest rounded-sm transition-all border ${item.is_active ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500" : "bg-red-950/20 border-red-500/35 text-red-500 hover:bg-red-500 hover:text-white"}`}
                                    >
                                      {item.is_active ? "● ACTIVE" : "● SUSPENDED"}
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* --- 1. CORE COPY CMS --- */}
                {activeTab === "text" && (
                  <form onSubmit={handleSaveTextCMS} className="space-y-4">
                    <div className="text-sm font-semibold border-b border-white/15 pb-2 uppercase tracking-wider text-[#EF4444] flex items-center gap-1.5 mb-4">
                      <FileText className="w-4 h-4" /> Editorial Copywriting Highlight Blocks
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest mb-1.5">Hero Tagline Highlight</label>
                        <input
                          type="text"
                          required
                          value={cmsText.heroTagline}
                          onChange={(e) => setCmsText({ ...cmsText, heroTagline: e.target.value })}
                          className="w-full bg-[#0B0B0C]/50 border border-white/20 rounded-sm px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest mb-1.5">Hero Title Lead (Regular)</label>
                        <input
                          type="text"
                          required
                          value={cmsText.heroHeadingLine1}
                          onChange={(e) => setCmsText({ ...cmsText, heroHeadingLine1: e.target.value })}
                          className="w-full bg-[#0B0B0C]/50 border border-white/20 rounded-sm px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest mb-1.5">Hero Title Highlight (Italic/Orange)</label>
                        <input
                          type="text"
                          required
                          value={cmsText.heroHeadingHighlight}
                          onChange={(e) => setCmsText({ ...cmsText, heroHeadingHighlight: e.target.value })}
                          className="w-full bg-[#0B0B0C]/50 border border-white/20 rounded-sm px-3 py-2 text-xs text-[#EF4444] font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest mb-1.5">Hero Title line 2 Lead (Regular)</label>
                        <input
                          type="text"
                          required
                          value={cmsText.heroHeadingLine2}
                          onChange={(e) => setCmsText({ ...cmsText, heroHeadingLine2: e.target.value })}
                          className="w-full bg-[#0B0B0C]/50 border border-white/20 rounded-sm px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest mb-1.5">Hero Title line 2 Highlight</label>
                        <input
                          type="text"
                          required
                          value={cmsText.heroHeadingHighlight2}
                          onChange={(e) => setCmsText({ ...cmsText, heroHeadingHighlight2: e.target.value })}
                          className="w-full bg-[#0B0B0C]/50 border border-white/20 rounded-sm px-3 py-2 text-xs font-semibold text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest mb-1.5">Bento highlights copy</label>
                        <input
                          type="text"
                          required
                          value={cmsText.facilityDescription}
                          onChange={(e) => setCmsText({ ...cmsText, facilityDescription: e.target.value })}
                          className="w-full bg-[#0B0B0C]/50 border border-white/20 rounded-sm px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest">Hero Marketing Pitch Description</label>
                        <button
                          type="button"
                          onClick={() => handleAiOptimizeField("heroDescription", cmsText.heroDescription)}
                          disabled={aiOptimizing === "heroDescription"}
                          className="text-[8px] font-bold text-[#EF4444] hover:text-[#EEEEF0] uppercase tracking-widest flex items-center gap-1 cursor-pointer disabled:opacity-45 outline-none"
                        >
                          <Sparkles className="w-2.5 h-2.5" /> {aiOptimizing === "heroDescription" ? "Optimizing..." : "AI Enhance Copy"}
                        </button>
                      </div>
                      <textarea
                        required
                        rows={3}
                        value={cmsText.heroDescription}
                        onChange={(e) => setCmsText({ ...cmsText, heroDescription: e.target.value })}
                        className="w-full bg-[#0B0B0C]/50 border border-white/20 rounded-sm px-3 py-2.5 text-xs text-[#EEEEF0]"
                      />
                    </div>

                    <div className="p-4 bg-[#0B0B0C] border border-white/5 rounded-sm space-y-4">
                      <span className="text-[10px] text-zinc-200/50 uppercase tracking-wider block font-bold">ATHLETE TESTIMONIAL CMS BLOCK</span>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest">Author Quote Text</label>
                          <button
                            type="button"
                            onClick={() => handleAiOptimizeField("testimonialQuote", cmsText.testimonialQuote)}
                            disabled={aiOptimizing === "testimonialQuote"}
                            className="text-[8px] font-bold text-[#EF4444] hover:text-[#EEEEF0] uppercase tracking-widest flex items-center gap-1 cursor-pointer disabled:opacity-45 outline-none"
                          >
                            <Sparkles className="w-2.5 h-2.5" /> {aiOptimizing === "testimonialQuote" ? "Optimizing..." : "AI Enhance Copy"}
                          </button>
                        </div>
                        <textarea
                          required
                          rows={2}
                          value={cmsText.testimonialQuote}
                          onChange={(e) => setCmsText({ ...cmsText, testimonialQuote: e.target.value })}
                          className="w-full bg-[#121215] border border-white/15 rounded-sm px-3 py-2 text-xs font-serif italic text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest mb-1">Author Name Reference</label>
                          <input
                            type="text"
                            required
                            value={cmsText.testimonialAuthor}
                            onChange={(e) => setCmsText({ ...cmsText, testimonialAuthor: e.target.value })}
                            className="w-full bg-[#121215] border border-white/15 rounded-sm px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-200/60 uppercase tracking-widest mb-1">Author Category Specialty</label>
                          <input
                            type="text"
                            required
                            value={cmsText.testimonialCategory}
                            onChange={(e) => setCmsText({ ...cmsText, testimonialCategory: e.target.value })}
                            className="w-full bg-[#121215] border border-white/15 rounded-sm px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <button
                        type="submit"
                        className="bg-[#1A1A1E] hover:bg-[#EF4444] text-white text-[10px] tracking-widest font-bold uppercase px-8 py-3.5 rounded-sm cursor-pointer transition-colors shadow-sm"
                      >
                        PUBLISH ALL LANDING DECK COPY
                      </button>
                    </div>
                  </form>
                )}

                {/* --- 2. MEMBERSHIP PLANS CMS --- */}
                {activeTab === "plans" && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-xs uppercase font-bold text-[#EF4444] tracking-widest flex items-center gap-2">
                        <FileCode className="w-4.5 h-4.5" /> Pricing Package Catalog setup
                      </span>
                      <button 
                        onClick={handleStartAddPlan} 
                        className="bg-[#EF4444] hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase tracking-widest px-3.5 py-2 rounded-sm flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> ADD NEW PACKAGE
                      </button>
                    </div>

                    {editingPlanId ? (
                      <div className="p-5 border border-white/15 rounded-sm bg-[#0B0B0C] space-y-4">
                        <h5 className="font-serif italic font-bold text-white text-md border-b border-white/5 pb-1">
                          {editingPlanId === "new" ? "Add Package Tier" : "Modify Plan Parameters"}
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-200/50 uppercase tracking-widest mb-1.5">Plan Title Name</label>
                            <input 
                              type="text" 
                              value={planForm.name || ""} 
                              onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} 
                              className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" 
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-200/50 uppercase tracking-widest mb-1.5">Price Cost (INR)</label>
                            <input 
                              type="number" 
                              value={planForm.price || 0} 
                              onChange={(e) => setPlanForm({ ...planForm, price: parseInt(e.target.value) || 0 })} 
                              className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" 
                            />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button onClick={handleSavePlanForm} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm">SAVE CHANGES</button>
                          <button onClick={() => setEditingPlanId(null)} className="border border-white/20 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm">CANCEL</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {plans.map((p) => (
                          <div key={p.id} className="p-4 bg-[#0B0B0C] border border-white/10 rounded-sm flex justify-between items-center">
                            <div>
                              <span className="text-[7.5px] font-bold text-[#EF4444] uppercase tracking-widest block">{p.category} TIER</span>
                              <h5 className="font-serif italic font-bold text-sm text-white uppercase">{p.name}</h5>
                              <span className="text-zinc-400 text-xs font-mono">₹{p.price.toLocaleString("en-IN")} / {p.period}</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleStartEditPlan(p)} className="text-zinc-400 hover:text-white p-1">Edit</button>
                              <button onClick={() => handleDeletePlan(p.id)} className="text-zinc-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- 3. SCHEDULES CMS --- */}
                {activeTab === "classes" && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-xs uppercase font-bold text-[#EF4444] tracking-widest flex items-center gap-2">
                        <Dumbbell className="w-4.5 h-4.5" /> Group class Scheduler & slots
                      </span>
                      <button 
                        onClick={handleStartAddClass} 
                        className="bg-[#EF4444] hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase tracking-widest px-3.5 py-2 rounded-sm flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> ADD WORKOUT CLASS
                      </button>
                    </div>

                    {editingClassId ? (
                      <div className="p-5 border border-white/15 rounded-sm bg-[#0B0B0C] space-y-4">
                        <h5 className="font-serif italic font-bold text-white text-md border-b border-white/5 pb-1">
                          {editingClassId === "new" ? "Configure Session Slot" : "Modify scheduled Session"}
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-200/50 uppercase tracking-widest mb-1.5">Class Title</label>
                            <input 
                              type="text" 
                              value={classForm.name || ""} 
                              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} 
                              className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" 
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-200/50 uppercase tracking-widest mb-1.5">Description Context</label>
                            <input 
                              type="text" 
                              value={classForm.description || ""} 
                              onChange={(e) => setClassForm({ ...classForm, description: e.target.value })} 
                              className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" 
                            />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button onClick={handleSaveClassForm} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm">SAVE CLASS</button>
                          <button onClick={() => setEditingClassId(null)} className="border border-white/20 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm">CANCEL</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {classes.map((c) => (
                          <div key={c.id} className="p-4 bg-[#0B0B0C] border border-white/10 rounded-sm flex justify-between items-center">
                            <div>
                              <span className="text-[7.5px] font-bold text-[#EF4444] uppercase tracking-widest block">{c.category} CLASS</span>
                              <h5 className="font-serif italic font-bold text-sm text-white uppercase">{c.name}</h5>
                              <span className="text-zinc-400 text-xs font-mono">{c.time} • ({c.duration})</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleStartEditClass(c)} className="text-zinc-400 hover:text-white p-1">Edit</button>
                              <button onClick={() => handleDeleteClass(c.id)} className="text-zinc-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- 4. certified TEAM --- */}
                {activeTab === "trainers" && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-xs uppercase font-bold text-[#EF4444] tracking-widest flex items-center gap-2">
                        <Briefcase className="w-4.5 h-4.5" /> Certified coaching Staff roster
                      </span>
                      <button 
                        onClick={handleStartAddTrainer} 
                        className="bg-[#EF4444] hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase tracking-widest px-3.5 py-2 rounded-sm flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> RECRUIT TRAINER
                      </button>
                    </div>

                    {editingTrainerId ? (
                      <div className="p-5 border border-white/15 rounded-sm bg-[#0B0B0C] space-y-4">
                        <h5 className="font-serif italic font-bold text-white text-md border-b border-white/5 pb-1">
                          {editingTrainerId === "new" ? "Recruit Coach profile" : "Edit coach parameters"}
                        </h5>
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-200/50 uppercase tracking-widest mb-1.5">Coach Name</label>
                          <input 
                            type="text" 
                            value={trainerForm.name || ""} 
                            onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })} 
                            className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" 
                          />
                        </div>
                        <div className="flex gap-4">
                          <button onClick={handleSaveTrainerForm} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm">SAVE PROFILE</button>
                          <button onClick={() => setEditingTrainerId(null)} className="border border-white/20 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm">CANCEL</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {trainers.map((t) => (
                          <div key={t.id} className="p-4 bg-[#0B0B0C] border border-white/10 rounded-sm flex justify-between items-center">
                            <div>
                              <h5 className="font-serif italic font-bold text-sm text-white uppercase">{t.name}</h5>
                              <span className="text-zinc-400 text-xs font-mono">{t.specialty} • ({t.experience})</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleStartEditTrainer(t)} className="text-zinc-400 hover:text-white p-1">Edit</button>
                              <button onClick={() => handleDeleteTrainer(t.id)} className="text-zinc-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- 5. photo GALLERY --- */}
                {activeTab === "gallery" && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-xs uppercase font-bold text-[#EF4444] tracking-widest flex items-center gap-2">
                        <ImageIcon className="w-4.5 h-4.5" /> High-Oxygen visual display gallery
                      </span>
                      <button 
                        onClick={handleStartAddGallery} 
                        className="bg-[#EF4444] hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase tracking-widest px-3.5 py-2 rounded-sm flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> ADD GALLERY IMAGE
                      </button>
                    </div>

                    {editingGalleryId ? (
                      <div className="p-5 border border-white/15 rounded-sm bg-[#0B0B0C] space-y-4">
                        <h5 className="font-serif italic font-bold text-white text-md border-b border-white/5 pb-1">
                          {editingGalleryId === "new" ? "Add Gallery slide" : "Edit Display Details"}
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-200/50 uppercase tracking-widest mb-1.5">Slide Title</label>
                            <input 
                              type="text" 
                              value={galleryForm.title || ""} 
                              onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })} 
                              className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" 
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-200/50 uppercase tracking-widest mb-1.5">Category description</label>
                            <input 
                              type="text" 
                              value={galleryForm.description || ""} 
                              onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })} 
                              className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" 
                            />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button onClick={handleSaveGalleryForm} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm">SAVE PHOTO</button>
                          <button onClick={() => setEditingGalleryId(null)} className="border border-white/20 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm">CANCEL</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {gallery.map((g) => (
                          <div key={g.id} className="p-4 bg-[#0B0B0C] border border-white/10 rounded-sm flex justify-between items-center">
                            <div>
                              <span className="text-[7.5px] font-bold text-[#EF4444] uppercase tracking-widest block">{g.category} PHOTO</span>
                              <h5 className="font-serif italic font-bold text-sm text-white uppercase">{g.title}</h5>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleStartEditGallery(g)} className="text-zinc-400 hover:text-white p-1">Edit</button>
                              <button onClick={() => handleDeleteGallery(g.id)} className="text-zinc-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
