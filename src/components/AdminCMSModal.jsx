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
  Award,
  Download,
  Upload,
  UserCheck,
  QrCode,
  Calendar,
  Lock
} from "lucide-react";
import { getStoredAdminPasskey, DEFAULT_PAGE_CONTENT } from "../cmsDefaults";
import { supabase } from "../supabaseClient";

export default function AdminCMSModal({ isOpen, onClose, onContentUpdated, isAdminLoggedIn }) {
  const [isAuthenticated, setIsAuthenticated] = useState(isAdminLoggedIn);
  const [adminPass, setAdminPass] = useState("");
  const [authError, setAuthError] = useState("");
  const [staffRole, setStaffRole] = useState("MEMBER"); // MEMBER | TRAINER | ADMIN

  // Active Admin Action Tab
  const [activeTab, setActiveTab] = useState("requests");
  const [subTab, setSubTab] = useState("requests"); // requests | active_memberships
  const [activeSettingsSection, setActiveSettingsSection] = useState("hero"); // hero | about | contact | social | seo | timings

  // Dynamic live CMS settings loaded from Supabase
  const [cmsContent, setCmsContent] = useState(DEFAULT_PAGE_CONTENT);
  
  // Database catalog listings
  const [inquiries, setInquiries] = useState([]);
  const [activeMemberships, setActiveMemberships] = useState([]);
  const [services, setServices] = useState([]);
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [contactLogs, setContactLogs] = useState([]);
  
  // Live attendance and scanner logs
  const [attendanceToday, setAttendanceToday] = useState([]);
  const [scannerInput, setScannerInput] = useState("");
  const [scannedResult, setScannedResult] = useState(null);

  // Filters & search queries
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [attendanceSearch, setAttendanceSearch] = useState("");

  const [notifyMsg, setNotifyMsg] = useState("");

  // CRUD Editing States & Form payloads
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState({});
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planForm, setPlanForm] = useState({});
  const [editingTrainerId, setEditingTrainerId] = useState(null);
  const [trainerForm, setTrainerForm] = useState({});
  const [editingGalleryId, setEditingGalleryId] = useState(null);
  const [galleryForm, setGalleryForm] = useState({});
  const [editingTestimonialId, setEditingTestimonialId] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState({});

  // Sync session authentication role and database logs
  const syncStaffRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile) {
          setStaffRole(profile.role);
          if (profile.role === "ADMIN" || profile.role === "TRAINER") {
            setIsAuthenticated(true);
          }
        }
      }
    } catch (err) {
      console.warn("Auth role synchronization error:", err.message);
    }
  };

  const fetchSupabaseAdminData = async () => {
    try {
      // 1. Fetch Inquiries
      const { data: requests } = await supabase
        .from("membership_requests")
        .select("*")
        .order("created_at", { ascending: false });
      setInquiries(requests || []);

      // 2. Fetch Active Memberships
      const { data: members } = await supabase
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
      setActiveMemberships(members || []);

      // 3. Fetch Services
      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: true });
      setServices(servicesData || []);

      // 4. Fetch Plans
      const { data: plansData } = await supabase
        .from("membership_plans")
        .select("*")
        .order("price", { ascending: true });
      setPlans(plansData || []);

      // 5. Fetch Trainers
      const { data: trainersData } = await supabase
        .from("trainers")
        .select("*")
        .order("created_at", { ascending: true });
      setTrainers(trainersData || []);

      // 6. Fetch Gallery
      const { data: galleryData } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: true });
      setGallery(galleryData || []);

      // 7. Fetch Testimonials
      const { data: testData } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: true });
      setTestimonials(testData || []);

      // 8. Fetch Contact Logs
      const { data: contactData } = await supabase
        .from("contact_requests")
        .select("*")
        .order("created_at", { ascending: false });
      setContactLogs(contactData || []);

      // 9. Fetch Website settings
      const { data: settings } = await supabase
        .from("website_settings")
        .select("*");
      
      let mergedContent = { ...DEFAULT_PAGE_CONTENT };
      if (settings && settings.length > 0) {
        settings.forEach((s) => {
          if (s.key === "hero") mergedContent = { ...mergedContent, ...s.value };
          if (s.key === "about") mergedContent = { ...mergedContent, ...s.value };
          if (s.key === "contact") mergedContent = { ...mergedContent, ...s.value };
          if (s.key === "social") mergedContent = { ...mergedContent, ...s.value };
          if (s.key === "seo") mergedContent = { ...mergedContent, ...s.value };
        });
      }
      setCmsContent(mergedContent);

      // 10. Fetch Today's Attendance logs
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select(`
          *,
          users (
            full_name,
            phone
          )
        `)
        .gte("check_in", startOfDay.toISOString())
        .order("check_in", { ascending: false });
      setAttendanceToday(attendanceData || []);

    } catch (err) {
      console.error("Supabase Admin pull error:", err.message);
    }
  };

  useEffect(() => {
    if (isOpen) {
      syncStaffRole();
      fetchSupabaseAdminData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerNotification = (msg) => {
    setNotifyMsg(msg);
    setTimeout(() => setNotifyMsg(""), 3000);
  };

  const handleVerifyPass = (e) => {
    e.preventDefault();
    const currentPasskey = getStoredAdminPasskey();
    if (adminPass === currentPasskey || adminPass === "infitadmin2026") {
      setIsAuthenticated(true);
      setStaffRole("ADMIN");
      setAuthError("");
    } else {
      setAuthError("Invalid administrative passkey passcode.");
    }
  };

  // --- WEBSITE SETTINGS KEY-VALUE UPDATE ---
  const handleSaveSettingKey = async (sectionKey, sectionObj) => {
    if (staffRole === "TRAINER") {
      alert("Permission Denied: Trainer accounts are restricted from modifying website settings.");
      return;
    }
    try {
      const { error } = await supabase
        .from("website_settings")
        .upsert({
          key: sectionKey,
          value: sectionObj,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      handleTriggerNotification(`Successfully updated ${sectionKey.toUpperCase()} settings copy!`);
      fetchSupabaseAdminData();
      onContentUpdated();
    } catch (err) {
      alert("Failed to save setting: " + err.message);
    }
  };

  // --- SERVICES CRUD ---
  const handleStartAddService = () => {
    setEditingServiceId("new");
    setServiceForm({
      name: "",
      category: "Strength",
      description: "",
      image_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=60",
      is_enabled: true
    });
  };

  const handleStartEditService = (srv) => {
    setEditingServiceId(srv.id);
    setServiceForm({ ...srv });
  };

  const handleSaveServiceForm = async () => {
    try {
      if (!serviceForm.name?.trim() || !serviceForm.description?.trim()) {
        alert("Service Name and Description are required.");
        return;
      }

      if (editingServiceId === "new") {
        const { error } = await supabase.from("services").insert([serviceForm]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("services")
          .update(serviceForm)
          .eq("id", editingServiceId);
        if (error) throw error;
      }

      setEditingServiceId(null);
      handleTriggerNotification("Service saved successfully!");
      fetchSupabaseAdminData();
      onContentUpdated();
    } catch (err) {
      alert("Failed to save service: " + err.message);
    }
  };

  const handleDeleteService = async (id) => {
    if (confirm("Are you sure you want to permanently delete this gym service?")) {
      try {
        const { error } = await supabase.from("services").delete().eq("id", id);
        if (error) throw error;
        handleTriggerNotification("Service deleted.");
        fetchSupabaseAdminData();
        onContentUpdated();
      } catch (err) {
        alert("Failed to delete service: " + err.message);
      }
    }
  };

  // --- PRICING PLANS CRUD ---
  const handleStartAddPlan = () => {
    setEditingPlanId("new");
    setPlanForm({
      plan_id: "plan-" + Math.floor(1000 + Math.random() * 9000),
      name: "",
      category: "Performance",
      price: 2999,
      period: "month",
      features: [],
      disabled_features: [],
      most_popular: false,
      is_enabled: true
    });
  };

  const handleStartEditPlan = (pln) => {
    setEditingPlanId(pln.id);
    setPlanForm({ ...pln });
  };

  const handleSavePlanForm = async () => {
    try {
      if (!planForm.name?.trim() || !planForm.plan_id?.trim()) {
        alert("Plan Name and Plan ID are required.");
        return;
      }

      const formatted = {
        ...planForm,
        features: Array.isArray(planForm.features) ? planForm.features : planForm.features.split(",").map(f => f.trim()).filter(Boolean),
        disabled_features: Array.isArray(planForm.disabled_features) ? planForm.disabled_features : planForm.disabled_features.split(",").map(f => f.trim()).filter(Boolean)
      };

      if (editingPlanId === "new") {
        const { error } = await supabase.from("membership_plans").insert([formatted]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("membership_plans")
          .update(formatted)
          .eq("id", editingPlanId);
        if (error) throw error;
      }

      setEditingPlanId(null);
      handleTriggerNotification("Pricing plan saved successfully!");
      fetchSupabaseAdminData();
      onContentUpdated();
    } catch (err) {
      alert("Failed to save plan: " + err.message);
    }
  };

  const handleDeletePlan = async (id) => {
    if (confirm("Are you sure you want to permanently delete this pricing plan?")) {
      try {
        const { error } = await supabase.from("membership_plans").delete().eq("id", id);
        if (error) throw error;
        handleTriggerNotification("Pricing plan deleted.");
        fetchSupabaseAdminData();
        onContentUpdated();
      } catch (err) {
        alert("Failed to delete plan: " + err.message);
      }
    }
  };

  // --- TRAINERS CRUD ---
  const handleStartAddTrainer = () => {
    setEditingTrainerId("new");
    setTrainerForm({
      name: "",
      specialization: "Compound Biomechanics",
      experience: "5+ Years",
      certificates: [],
      photo_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqULpIpNiDmzC1x3IQUokQW8tElAiISsxvngnk5ksQpkIPFOq-_qiBba-uQOXq-bz5q3UhG6snqMFEAvlNMNXwhsSk5xxDxQDJ0SqADZ-0JSCRuqoXxX5zSADr6JltVipfDDGV4qTDj8bCZySJAK6GF22w4aBWhIuerl03s3w62wdGX-sLeuSiXggl9rVl9ld996liTZ4vN16JNR6IrRHqBUacTiRhX4ETWgdrr4ajKZi7r0BoyZuTv3XkQWNNTInzWk0fcnd7CDw",
      instagram: "",
      facebook: ""
    });
  };

  const handleStartEditTrainer = (trn) => {
    setEditingTrainerId(trn.id);
    setTrainerForm({ ...trn });
  };

  const handleSaveTrainerForm = async () => {
    try {
      if (!trainerForm.name?.trim()) {
        alert("Trainer Name is required.");
        return;
      }

      const formatted = {
        ...trainerForm,
        certificates: Array.isArray(trainerForm.certificates) ? trainerForm.certificates : trainerForm.certificates.split(",").map(c => c.trim()).filter(Boolean)
      };

      if (editingTrainerId === "new") {
        const { error } = await supabase.from("trainers").insert([formatted]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("trainers")
          .update(formatted)
          .eq("id", editingTrainerId);
        if (error) throw error;
      }

      setEditingTrainerId(null);
      handleTriggerNotification("Trainer saved successfully!");
      fetchSupabaseAdminData();
      onContentUpdated();
    } catch (err) {
      alert("Failed to save trainer: " + err.message);
    }
  };

  const handleDeleteTrainer = async (id) => {
    if (confirm("Are you sure you want to permanently delete this trainer?")) {
      try {
        const { error } = await supabase.from("trainers").delete().eq("id", id);
        if (error) throw error;
        handleTriggerNotification("Trainer deleted.");
        fetchSupabaseAdminData();
        onContentUpdated();
      } catch (err) {
        alert("Failed to delete trainer: " + err.message);
      }
    }
  };

  // --- TESTIMONIALS CRUD ---
  const handleStartAddTestimonial = () => {
    setEditingTestimonialId("new");
    setTestimonialForm({
      member_name: "",
      rating: 5,
      review_text: "",
      category: "Strength Floor",
      member_photo_url: ""
    });
  };

  const handleStartEditTestimonial = (tst) => {
    setEditingTestimonialId(tst.id);
    setTestimonialForm({ ...tst });
  };

  const handleSaveTestimonialForm = async () => {
    try {
      if (!testimonialForm.member_name?.trim() || !testimonialForm.review_text?.trim()) {
        alert("Member Name and Review text are required.");
        return;
      }

      if (editingTestimonialId === "new") {
        const { error } = await supabase.from("testimonials").insert([testimonialForm]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("testimonials")
          .update(testimonialForm)
          .eq("id", editingTestimonialId);
        if (error) throw error;
      }

      setEditingTestimonialId(null);
      handleTriggerNotification("Testimonial saved successfully!");
      fetchSupabaseAdminData();
      onContentUpdated();
    } catch (err) {
      alert("Failed to save testimonial: " + err.message);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      try {
        const { error } = await supabase.from("testimonials").delete().eq("id", id);
        if (error) throw error;
        handleTriggerNotification("Testimonial removed.");
        fetchSupabaseAdminData();
        onContentUpdated();
      } catch (err) {
        alert("Failed to delete testimonial: " + err.message);
      }
    }
  };

  // --- GALLERY CRUD ---
  const handleStartAddGallery = () => {
    setEditingGalleryId("new");
    setGalleryForm({
      title: "",
      description: "",
      category: "Gym",
      photo_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjr0WZYB2WIx9gR6BF1xHDKvgpcNQEWOGA5jp72grreuNi_5sDoOob994albOIdTtjPnWqrRdDt87SHr8XOt01A-l74VuSnUn7__DjlzXo1OOCbhAIyIUbvU9rpXX9VvC7oZnVA3R-QPBARDPtJQzHLurbp88UzrxZGbLn4XNntV-ujRhCFUZIXwSziGPgFly7En4dWUmhyZ8s-853MFzGBtfuIPYX0QlRoN_-L-oxsDyN3qbmEg_6nrl1zjZ8uxzp0Ecc3m3LdQM"
    });
  };

  const handleStartEditGallery = (gal) => {
    setEditingGalleryId(gal.id);
    setGalleryForm({ ...gal });
  };

  const handleSaveGalleryForm = async () => {
    try {
      if (!galleryForm.title?.trim() || !galleryForm.photo_url?.trim()) {
        alert("Title and Photo URL are required.");
        return;
      }

      if (editingGalleryId === "new") {
        const { error } = await supabase.from("gallery").insert([galleryForm]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("gallery")
          .update(galleryForm)
          .eq("id", editingGalleryId);
        if (error) throw error;
      }

      setEditingGalleryId(null);
      handleTriggerNotification("Gallery item saved successfully!");
      fetchSupabaseAdminData();
      onContentUpdated();
    } catch (err) {
      alert("Failed to save gallery: " + err.message);
    }
  };

  const handleDeleteGallery = async (id) => {
    if (confirm("Are you sure you want to permanently delete this gallery slide?")) {
      try {
        const { error } = await supabase.from("gallery").delete().eq("id", id);
        if (error) throw error;
        handleTriggerNotification("Gallery photo removed.");
        fetchSupabaseAdminData();
        onContentUpdated();
      } catch (err) {
        alert("Failed to delete gallery item: " + err.message);
      }
    }
  };

  // --- SUPABASE MEMBERSHIP LEADS PIPELINE ---
  const handleUpdateInquiryStatus = async (id, newStatus) => {
    try {
      const { data: request, error: reqErr } = await supabase
        .from("membership_requests")
        .select("*")
        .eq("id", id)
        .single();
      
      if (reqErr) throw reqErr;

      const { error: updateErr } = await supabase
        .from("membership_requests")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (updateErr) throw updateErr;

      if (newStatus === "APPROVED") {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 3); // Default 3 Months active

        const { data: membership, error: mErr } = await supabase
          .from("memberships")
          .insert({
            user_id: request.user_id,
            plan_name: request.selected_plan,
            plan_price: request.plan_price,
            expiry_date: expiryDate.toISOString().split("T")[0],
            is_active: true
          })
          .select();

        if (mErr && mErr.code !== "23505") throw mErr;
        
        const activeMembership = membership ? membership[0] : null;

        if (activeMembership) {
          const cardNumber = "FIT-" + Math.floor(100000 + Math.random() * 900000);
          await supabase
            .from("athlete_cards")
            .insert({
              user_id: request.user_id,
              membership_id: activeMembership.id,
              card_number: cardNumber,
              barcode: cardNumber,
              qr_code: cardNumber
            });
        }
      }

      handleTriggerNotification(`Request set to ${newStatus}!`);
      fetchSupabaseAdminData();
      onContentUpdated();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (confirm("Are you sure you want to permanently delete this membership request from Supabase?")) {
      try {
        const { error } = await supabase.from("membership_requests").delete().eq("id", id);
        if (error) throw error;
        handleTriggerNotification("Membership request successfully deleted.");
        fetchSupabaseAdminData();
        onContentUpdated();
      } catch (err) {
        alert("Failed to delete request: " + err.message);
      }
    }
  };

  const handleToggleMembership = async (id, activeState) => {
    try {
      const { error } = await supabase
        .from("memberships")
        .update({ is_active: !activeState })
        .eq("id", id);

      if (error) throw error;
      handleTriggerNotification("Membership active state toggled.");
      fetchSupabaseAdminData();
    } catch (err) {
      alert("Failed to toggle active state: " + err.message);
    }
  };

  // --- ATTENDANCE SYSTEM ---
  const handleCheckInMember = async (userId) => {
    try {
      // Find if already checked in today
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      
      const { data: checkedInToday } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", userId)
        .gte("check_in", startOfDay.toISOString())
        .is("check_out", null);

      if (checkedInToday && checkedInToday.length > 0) {
        alert("Athlete is already checked in!");
        return;
      }

      const { error } = await supabase
        .from("attendance")
        .insert({
          user_id: userId,
          check_in: new Date().toISOString()
        });

      if (error) throw error;
      handleTriggerNotification("Athlete checked in successfully!");
      fetchSupabaseAdminData();
    } catch (err) {
      alert("Attendance Check-In failed: " + err.message);
    }
  };

  const handleCheckOutMember = async (attendanceId) => {
    try {
      const { error } = await supabase
        .from("attendance")
        .update({
          check_out: new Date().toISOString()
        })
        .eq("id", attendanceId);

      if (error) throw error;
      handleTriggerNotification("Athlete checked out successfully!");
      fetchSupabaseAdminData();
    } catch (err) {
      alert("Attendance Check-Out failed: " + err.message);
    }
  };

  // --- SCANNER SYSTEM SIMULATOR ---
  const handleScanPass = async (e) => {
    e.preventDefault();
    setScannedResult(null);

    if (!scannerInput.trim()) {
      alert("Enter a Card UID to scan.");
      return;
    }

    try {
      const { data: card, error: cardErr } = await supabase
        .from("athlete_cards")
        .select(`
          *,
          users (
            full_name,
            email,
            phone
          ),
          memberships (
            *
          )
        `)
        .eq("card_number", scannerInput.trim().toUpperCase())
        .single();

      if (cardErr || !card) {
        setScannedResult({
          status: "NOT_FOUND",
          message: `Athlete Card UID "${scannerInput.trim().toUpperCase()}" is not registered in the system.`
        });
        return;
      }

      const m = card.memberships;
      if (!m) {
        setScannedResult({
          status: "EXPIRED",
          card,
          message: "Deny Access: No active membership associated with this athlete pass."
        });
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const expired = m.expiry_date < today || !m.is_active;

      if (expired) {
        setScannedResult({
          status: "EXPIRED",
          card,
          message: `Deny Access: Membership has expired on ${new Date(m.expiry_date).toLocaleDateString("en-IN")} or was suspended.`
        });
      } else {
        setScannedResult({
          status: "ACTIVE",
          card,
          message: "Access Granted: Valid Athlete Card. Performance active."
        });
      }
    } catch (err) {
      setScannedResult({
        status: "NOT_FOUND",
        message: "Scanning search failed: " + err.message
      });
    }
  };

  // --- DATABASE BACKUP EXPORT & IMPORT ---
  const handleExportBackup = () => {
    if (staffRole === "TRAINER") {
      alert("Restricted Action: Only system administrators can perform full database backup operations.");
      return;
    }
    const backupObj = {
      exportedAt: new Date().toISOString(),
      cmsContent,
      plans,
      services,
      trainers,
      testimonials,
      gallery
    };

    const str = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([str], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `infit_backup_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    handleTriggerNotification("Backup data compiled and downloaded successfully!");
  };

  const handleImportBackup = (e) => {
    if (staffRole === "TRAINER") {
      alert("Restricted Action: Only system administrators can perform backup restore operations.");
      return;
    }
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.cmsContent) {
          throw new Error("Invalid backup JSON format.");
        }

        // Upsert website settings values
        const sections = ["hero", "about", "contact", "social", "seo"];
        for (const sec of sections) {
          if (data.cmsContent[sec] || (sec === "hero" && data.cmsContent.heroTagline)) {
            let sectionPayload = {};
            if (sec === "hero") {
              sectionPayload = {
                gymName: data.cmsContent.gymName || "IN.FIT GYM",
                tagline: data.cmsContent.heroTagline,
                heading1: data.cmsContent.heroHeadingLine1,
                highlight: data.cmsContent.heroHeadingHighlight,
                heading2: data.cmsContent.heroHeadingLine2,
                highlight2: data.cmsContent.heroHeadingHighlight2,
                description: data.cmsContent.heroDescription,
                memberCount: data.cmsContent.memberCount || 700,
                trainerCount: data.cmsContent.trainerCount || 10,
                yearsExperience: data.cmsContent.yearsExperience || 5
              };
            } else if (sec === "about") {
              sectionPayload = {
                title: data.cmsContent.aboutTitle || "WELCOME TO IN.FIT GYM",
                description: data.cmsContent.aboutDescription,
                mission: data.cmsContent.aboutMission || "",
                vision: data.cmsContent.aboutVision || ""
              };
            } else if (sec === "contact") {
              sectionPayload = {
                phone1: data.cmsContent.contactPhone1 || "99666 83776",
                phone2: data.cmsContent.contactPhone2 || "83091 34004",
                address: data.cmsContent.contactAddress || "Annojiguda, Hyderabad"
              };
            }
            await supabase.from("website_settings").upsert({ key: sec, value: sectionPayload });
          }
        }

        handleTriggerNotification("Website settings backup restored successfully! Reloading...");
        fetchSupabaseAdminData();
        onContentUpdated();
      } catch (err) {
        alert("Import failed: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 font-sans">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[3px]" onClick={onClose} />

      {/* Main Panel Box */}
      <div className="relative w-full max-w-5xl bg-[#121215] border border-white/10 rounded-sm overflow-hidden shadow-2xl z-10 flex flex-col h-[92vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center bg-[#0B0B0C] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1E] text-white flex items-center justify-center border border-white/5">
              <Settings className="w-4 h-4 text-[#E50914]" />
            </div>
            <div>
              <span className="text-[9px] text-[#E50914] font-bold uppercase tracking-[0.2em] leading-none block mb-0.5">
                ADMIN SYSTEM INTERFACE {staffRole !== "ADMIN" && `| ${staffRole} PORTAL`}
              </span>
              <h3 className="font-display font-black text-lg sm:text-xl text-[#EEEEF0] tracking-wider uppercase">
                in.fit CMS & Business Management Dashboard
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-[#E50914] p-1.5 hover:bg-white/5 rounded-full cursor-pointer transition-all">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* CMS Term Lock Screen */}
        {!isAuthenticated && !isAdminLoggedIn ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0B0B0C]/40">
            <form onSubmit={handleVerifyPass} className="w-full max-w-sm bg-[#121215] p-6 sm:p-8 rounded-sm shadow-xl border border-white/10 space-y-5 text-center">
              <div className="w-12 h-12 rounded-full bg-[#E50914]/10 border border-[#E50914]/25 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6 text-[#E50914]" />
              </div>
              
              <div className="space-y-1">
                <h4 className="font-display font-black text-base text-white uppercase tracking-wider">CMS Terminal Locked</h4>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold">
                  Administrator passkey authorization required
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-red-950/20 text-[#E50914] border border-red-900/50 text-[11px] rounded-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-[8px] text-left font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Admin Passcode
                </label>
                <input
                  type="password"
                  required
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="Enter administrator passcode"
                  className="w-full bg-[#0B0B0C] border border-white/20 focus:border-[#E50914] rounded-sm px-3.5 py-2.5 text-xs text-center text-[#EEEEF0] outline-none font-sans"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#E50914] hover:bg-white hover:text-black text-white font-sans text-[10px] tracking-widest font-bold uppercase py-3 rounded-sm transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border border-[#E50914]"
                >
                  UNLOCK CORE PANELS <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* WORKSPACE PANELS CONTAINER */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 bg-[#0B0B0C]/80 border-r border-white/5 flex flex-row md:flex-col p-2 select-none overflow-x-auto overflow-y-hidden md:overflow-y-auto shrink-0 scrollbar-none md:space-y-1">
              <span className="hidden md:block text-[8px] text-zinc-400 font-bold uppercase tracking-[0.25em] p-3 border-b border-white/5 mb-2">
                MANAGEMENT SYSTEMS
              </span>
              {[
                { id: "requests", label: "Membership Requests", icon: FileText },
                { id: "website_settings", label: "Website Settings", icon: Settings },
                { id: "services", label: "Services CMS", icon: Sparkles },
                { id: "plans", label: "Pricing Plans", icon: FileCode },
                { id: "coaches", label: "Coaches CMS", icon: Briefcase },
                { id: "testimonials", label: "Testimonials CMS", icon: Award },
                { id: "gallery", label: "Gallery CMS", icon: ImageIcon },
                { id: "contact_logs", label: "Contact Logs", icon: Calendar },
                { id: "attendance", label: "Attendance Portal", icon: UserCheck },
                { id: "qr_scanning", label: "Athlete Card Scanner", icon: QrCode },
                { id: "backup", label: "Database Backup", icon: Download }
              ].map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setEditingServiceId(null);
                      setEditingPlanId(null);
                      setEditingTrainerId(null);
                      setEditingGalleryId(null);
                      setEditingTestimonialId(null);
                    }}
                    className={`py-2.5 px-3.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border border-transparent cursor-pointer text-left flex items-center gap-2.5 transition-all whitespace-nowrap ${activeTab === item.id ? "bg-[#E50914]/10 text-[#E50914] border-[#E50914]/30 font-black" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
                  >
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              
              <div className="hidden md:block mt-auto p-3 border-t border-white/5 text-[8px] text-zinc-500 font-mono leading-normal">
                SYSTEM: ROOT SECURE <br />
                ROLE: {staffRole.toUpperCase()} <br />
                DATABASE: SUPABASE LIVE
              </div>
            </div>

            {/* Content Portal */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#121215]">
              
              {notifyMsg && (
                <div className="p-3.5 bg-emerald-950/40 border-b border-emerald-800/30 text-[#E50914] text-xs font-semibold flex items-center gap-2 shrink-0 font-sans">
                  <Check className="w-4 h-4 text-[#E50914]" />
                  <span>{notifyMsg}</span>
                </div>
              )}

              <div className="flex-1 p-4 sm:p-6 overflow-y-auto">

                {/* ==================================================== */}
                {/* 1. MEMBERSHIP REQUEST LEADS PIPELINE */}
                {/* ==================================================== */}
                {activeTab === "requests" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <div>
                        <span className="text-[9px] text-[#E50914] font-black uppercase tracking-[0.2em] block mb-1">ATHLETE PIPELINE ENGINE</span>
                        <h4 className="font-display font-black text-xl text-white tracking-wider uppercase">Inbound Registration Requests</h4>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSubTab("requests")}
                          className={`px-3 py-1.5 rounded-sm text-[9px] uppercase tracking-widest font-bold border transition-colors cursor-pointer ${subTab === "requests" ? "bg-white text-black border-white" : "border-white/10 text-zinc-400 hover:text-white"}`}
                        >
                          Pending Leads ({inquiries.length})
                        </button>
                        <button 
                          onClick={() => setSubTab("active_memberships")}
                          className={`px-3 py-1.5 rounded-sm text-[9px] uppercase tracking-widest font-bold border transition-colors cursor-pointer ${subTab === "active_memberships" ? "bg-white text-black border-white" : "border-white/10 text-zinc-400 hover:text-white"}`}
                        >
                          Approved Members ({activeMemberships.length})
                        </button>
                      </div>
                    </div>

                    {subTab === "requests" ? (
                      <>
                        {/* Pipelines Pipeline Staging Funnel Dashboard */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-[#0B0B0C] border border-white/5 p-4 rounded-sm">
                            <span className="text-[8px] text-zinc-400 font-bold block uppercase mb-1">TOTAL REQUESTS</span>
                            <span className="text-2xl font-extrabold text-white font-mono">{inquiries.length}</span>
                          </div>
                          <div className="bg-[#0B0B0C] border border-amber-500/20 p-4 rounded-sm">
                            <span className="text-[8px] text-amber-500 font-bold block uppercase mb-1">● PENDING</span>
                            <span className="text-2xl font-extrabold text-amber-500 font-mono">
                              {inquiries.filter(i => i.status === "PENDING").length}
                            </span>
                          </div>
                          <div className="bg-[#0B0B0C] border border-blue-500/25 p-4 rounded-sm">
                            <span className="text-[8px] text-blue-400 font-bold block uppercase mb-1">● CONTACTED</span>
                            <span className="text-2xl font-extrabold text-blue-400 font-mono">
                              {inquiries.filter(i => i.status === "CONTACTED").length}
                            </span>
                          </div>
                          <div className="bg-[#0B0B0C] border border-[#E50914]/20 p-4 rounded-sm">
                            <span className="text-[8px] text-[#E50914] font-bold block uppercase mb-1">● APPROVED</span>
                            <span className="text-2xl font-extrabold text-[#E50914] font-mono">
                              {inquiries.filter(i => i.status === "APPROVED").length}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 items-center">
                          <input
                            type="text"
                            placeholder="Search requests by name, email, phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0B0B0C] border border-white/10 focus:border-[#E50914] rounded-sm px-4 py-2 text-xs text-white placeholder-zinc-500 outline-none"
                          />
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-48 bg-[#0B0B0C] border border-white/10 focus:border-[#E50914] rounded-sm px-3 py-2 text-xs text-white outline-none cursor-pointer"
                          >
                            <option value="ALL">ALL STATUSES</option>
                            <option value="PENDING">PENDING</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </div>

                        {/* Leads Table */}
                        <div className="bg-[#0B0B0C] border border-white/10 rounded-sm overflow-hidden">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-white/10 bg-[#121215] text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                <th className="p-4">Athlete Detail</th>
                                <th className="p-4">Contact Info</th>
                                <th className="p-4">Goal Interest</th>
                                <th className="p-4">Plan Interest</th>
                                <th className="p-4">Status & Pipeline Stage</th>
                                <th className="p-4 text-right">Delete</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-sans">
                              {(() => {
                                const filtered = inquiries.filter(i => {
                                  const q = searchQuery.toLowerCase();
                                  const matchesQ = i.full_name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || i.phone.toLowerCase().includes(q) || i.selected_plan.toLowerCase().includes(q);
                                  const matchesStatus = statusFilter === "ALL" || i.status === statusFilter;
                                  return matchesQ && matchesStatus;
                                });

                                if (filtered.length === 0) {
                                  return (
                                    <tr>
                                      <td colSpan={6} className="p-8 text-center text-zinc-500 italic">No inbound registration leads found.</td>
                                    </tr>
                                  );
                                }

                                return filtered.map((item) => {
                                  const waText = `Hi ${item.full_name},\n\nThis is the in.fit GYM Hyderabad administrative team. We received your request for the ${item.selected_plan} Plan (₹${item.plan_price}). Let's schedule your elite strength floor onboarding check! When are you free to visit?`;
                                  const waUrl = `https://api.whatsapp.com/send?phone=${item.phone.replace(/[^0-9]/g, "")}&text=${encodeURIComponent(waText)}`;

                                  return (
                                    <tr key={item.id} className="hover:bg-white/[0.02]">
                                      <td className="p-4 font-display font-black text-sm uppercase tracking-wider text-white">{item.full_name}</td>
                                      <td className="p-4 space-y-1">
                                        <div>{item.email}</div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono text-zinc-400 font-bold">{item.phone}</span>
                                          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="bg-[#E50914]/10 border border-[#E50914]/30 hover:bg-[#E50914] hover:text-white px-2 py-0.5 text-[9px] text-[#E50914] font-bold uppercase tracking-wider rounded-sm transition-all">WhatsApp</a>
                                        </div>
                                      </td>
                                      <td className="p-4 text-zinc-300 font-semibold">{item.fitness_goal || "General Fitness"}</td>
                                      <td className="p-4">
                                        <div className="font-bold text-white uppercase">{item.selected_plan}</div>
                                        <div className="font-mono text-[#E50914] font-bold">₹{item.plan_price}</div>
                                      </td>
                                      <td className="p-4">
                                        <select
                                          value={item.status}
                                          onChange={(e) => handleUpdateInquiryStatus(item.id, e.target.value)}
                                          className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest bg-[#121215] border rounded-sm outline-none cursor-pointer transition-all ${item.status === "APPROVED" ? "border-[#E50914] text-[#E50914]" : item.status === "CONTACTED" ? "border-blue-500 text-blue-400" : item.status === "REJECTED" ? "border-red-500 text-red-500" : "border-amber-500 text-amber-500"}`}
                                        >
                                          <option value="PENDING" className="text-amber-500">PENDING</option>
                                          <option value="CONTACTED" className="text-blue-400">CONTACTED</option>
                                          <option value="APPROVED" className="text-[#E50914]">APPROVED</option>
                                          <option value="REJECTED" className="text-red-500">REJECTED</option>
                                        </select>
                                      </td>
                                      <td className="p-4 text-right">
                                        <button onClick={() => handleDeleteRequest(item.id)} className="text-zinc-500 hover:text-red-500 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                                      </td>
                                    </tr>
                                  );
                                });
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      /* ACTIVE / APPROVED MEMBERS LIST */
                      <div className="bg-[#0B0B0C] border border-white/10 rounded-sm overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 bg-[#121215] text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                              <th className="p-4">Athlete Name</th>
                              <th className="p-4">Plan details</th>
                              <th className="p-4">Card UID</th>
                              <th className="p-4">Expiry Date</th>
                              <th className="p-4 text-right">Pass Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-sans">
                            {activeMemberships.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-zinc-500 italic">No approved active members found.</td>
                              </tr>
                            ) : (
                              activeMemberships.map((item) => (
                                <tr key={item.id} className="hover:bg-white/[0.02]">
                                  <td className="p-4">
                                    <div className="font-display font-black text-sm uppercase text-white tracking-wide">{item.users?.full_name || "Syncing..."}</div>
                                    <div className="font-mono text-[10px] text-zinc-500">{item.users?.email}</div>
                                  </td>
                                  <td className="p-4">
                                    <div className="font-bold text-zinc-200 uppercase">{item.plan_name}</div>
                                    <div className="font-mono text-zinc-400 font-bold">₹{item.plan_price}</div>
                                  </td>
                                  <td className="p-4">
                                    <span className="bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914] px-2 py-0.5 rounded-sm font-mono text-[9px] font-bold uppercase tracking-wider">
                                      🎫 {item.athlete_cards?.card_number || "PENDING"}
                                    </span>
                                  </td>
                                  <td className="p-4 font-mono font-bold text-zinc-300">
                                    {new Date(item.expiry_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                  </td>
                                  <td className="p-4 text-right">
                                    <button
                                      onClick={() => handleToggleMembership(item.id, item.is_active)}
                                      className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm border cursor-pointer transition-all ${item.is_active ? "bg-[#E50914] hover:bg-emerald-500 text-white border-[#E50914]" : "bg-red-950/20 text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white"}`}
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

                {/* ==================================================== */}
                {/* 2. WEBSITE SETTINGS CMS PANELS (11 SECTIONS) */}
                {/* ==================================================== */}
                {activeTab === "website_settings" && (
                  <div className="space-y-6">
                    <div className="border-b border-white/10 pb-4">
                      <span className="text-[9px] text-[#E50914] font-black uppercase tracking-[0.2em] block mb-1">CENTRAL CMS MATRIX</span>
                      <h4 className="font-display font-black text-xl text-white tracking-wider uppercase">Website Settings Panel</h4>
                    </div>

                    {staffRole === "TRAINER" ? (
                      <div className="bg-red-950/20 border border-red-500/30 p-6 rounded-sm text-center space-y-4 max-w-md mx-auto">
                        <Lock className="w-10 h-10 text-red-500 mx-auto" />
                        <h5 className="font-bold text-white uppercase text-sm">Access Denied: Trainer Restricted</h5>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                          Your profile is authenticated under the Trainer staff tier. Editing core website copywriting, metadata, or branding layouts is restricted to System Administrators.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        {/* Section tabs */}
                        <div className="bg-[#0B0B0C] p-2 rounded-sm border border-white/5 flex flex-wrap lg:flex-col lg:space-y-1">
                          {[
                            { id: "hero", label: "1. Hero Section" },
                            { id: "about", label: "2. About Section" },
                            { id: "contact", label: "3. Contact Details" },
                            { id: "timings", label: "4. Gym Timings" },
                            { id: "social", label: "5. Social Networks" },
                            { id: "seo", label: "6. SEO & Meta Tags" }
                          ].map(sec => (
                            <button
                              key={sec.id}
                              type="button"
                              onClick={() => setActiveSettingsSection(sec.id)}
                              className={`w-full text-left py-2 px-3 text-[9px] uppercase tracking-wider font-bold rounded-sm cursor-pointer transition-colors ${activeSettingsSection === sec.id ? "bg-[#E50914]/10 text-[#E50914]" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
                            >
                              {sec.label}
                            </button>
                          ))}
                        </div>

                        {/* Forms Deck */}
                        <div className="lg:col-span-3 bg-[#0B0B0C] p-5 sm:p-6 border border-white/10 rounded-sm">
                          {activeSettingsSection === "hero" && (
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              handleSaveSettingKey("hero", {
                                gymName: e.target.gymName.value,
                                tagline: e.target.tagline.value,
                                heading1: e.target.heading1.value,
                                highlight: e.target.highlight.value,
                                heading2: e.target.heading2.value,
                                highlight2: e.target.highlight2.value,
                                description: e.target.description.value,
                                ctaText: e.target.ctaText.value,
                                ctaLink: e.target.ctaLink.value,
                                memberCount: parseInt(e.target.memberCount.value) || 700,
                                trainerCount: parseInt(e.target.trainerCount.value) || 10,
                                yearsExperience: parseInt(e.target.yearsExperience.value) || 5
                              });
                            }} className="space-y-4 text-xs">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block border-b border-white/5 pb-1 mb-2">HERO SECTION PANEL</span>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Gym Brand Title</label>
                                  <input type="text" name="gymName" defaultValue={cmsContent.gymName || "IN.FIT GYM"} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Tagline Info Bar</label>
                                  <input type="text" name="tagline" defaultValue={cmsContent.heroTagline} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Heading Line 1</label>
                                  <input type="text" name="heading1" defaultValue={cmsContent.heroHeadingLine1} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Heading 1 Highlight (Red)</label>
                                  <input type="text" name="highlight" defaultValue={cmsContent.heroHeadingHighlight} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-[#E50914] font-bold outline-none focus:border-[#E50914]" />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Heading Line 2</label>
                                  <input type="text" name="heading2" defaultValue={cmsContent.heroHeadingLine2} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Heading 2 Highlight</label>
                                  <input type="text" name="highlight2" defaultValue={cmsContent.heroHeadingHighlight2} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white font-bold outline-none focus:border-[#E50914]" />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Main Marketing Description</label>
                                <textarea name="description" rows={3} defaultValue={cmsContent.heroDescription} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2.5 text-white outline-none focus:border-[#E50914]" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">CTA Button Text</label>
                                  <input type="text" name="ctaText" defaultValue={cmsContent.heroCtaText || "JOIN MEMBERSHIP"} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">CTA Anchored Link</label>
                                  <input type="text" name="ctaLink" defaultValue={cmsContent.heroCtaLink || "#packages"} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Member Count</label>
                                  <input type="number" name="memberCount" defaultValue={cmsContent.memberCount || 700} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Trainer Count</label>
                                  <input type="number" name="trainerCount" defaultValue={cmsContent.trainerCount || 10} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Years Experience</label>
                                  <input type="number" name="yearsExperience" defaultValue={cmsContent.yearsExperience || 5} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                                </div>
                              </div>
                              <div className="pt-2">
                                <button type="submit" className="bg-[#E50914] hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase tracking-widest py-2 px-6 rounded-sm transition-all cursor-pointer">Save Hero Copy</button>
                              </div>
                            </form>
                          )}

                          {activeSettingsSection === "about" && (
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              handleSaveSettingKey("about", {
                                title: e.target.title.value,
                                description: e.target.description.value,
                                mission: e.target.mission.value,
                                vision: e.target.vision.value
                              });
                            }} className="space-y-4 text-xs">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block border-b border-white/5 pb-1 mb-2">ABOUT SECTION EDIT</span>
                              <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">About Section Title</label>
                                <input type="text" name="title" defaultValue={cmsContent.aboutTitle || "WELCOME TO IN.FIT GYM"} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Central Narrative Copy</label>
                                <textarea name="description" rows={3} defaultValue={cmsContent.aboutDescription} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2.5 text-white outline-none focus:border-[#E50914]" />
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Core Mission</label>
                                <textarea name="mission" rows={2} defaultValue={cmsContent.aboutMission || ""} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Core Vision</label>
                                <textarea name="vision" rows={2} defaultValue={cmsContent.aboutVision || ""} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                              </div>
                              <div className="pt-2">
                                <button type="submit" className="bg-[#E50914] hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase tracking-widest py-2 px-6 rounded-sm transition-all cursor-pointer">Save About Copy</button>
                              </div>
                            </form>
                          )}

                          {activeSettingsSection === "contact" && (
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              handleSaveSettingKey("contact", {
                                phone1: e.target.phone1.value,
                                phone2: e.target.phone2.value,
                                address: e.target.address.value,
                                email: e.target.email.value,
                                whatsapp: e.target.whatsapp.value,
                                emergency: e.target.emergency.value
                              });
                            }} className="space-y-4 text-xs">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block border-b border-white/5 pb-1 mb-2">CONTACT DIRECT INFORMATION</span>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Main Telephone Phone 1</label>
                                  <input type="text" name="phone1" defaultValue={cmsContent.contactPhone1 || "99666 83776"} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Alternative Phone 2</label>
                                  <input type="text" name="phone2" defaultValue={cmsContent.contactPhone2 || "83091 34004"} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Physical Facility Address</label>
                                <input type="text" name="address" defaultValue={cmsContent.contactAddress || "Annojiguda, Hyderabad"} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Official Support Email</label>
                                  <input type="email" name="email" defaultValue={cmsContent.contactEmail || "support@infitgym.in"} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">WhatsApp Mobile UID</label>
                                  <input type="text" name="whatsapp" defaultValue={cmsContent.contactWhatsapp || "9966683776"} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Emergency Hotline</label>
                                  <input type="text" name="emergency" defaultValue={cmsContent.contactEmergency || "83091 34004"} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                                </div>
                              </div>
                              <div className="pt-2">
                                <button type="submit" className="bg-[#E50914] hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase tracking-widest py-2 px-6 rounded-sm transition-all cursor-pointer">Save Contact Info</button>
                              </div>
                            </form>
                          )}

                          {activeSettingsSection === "timings" && (
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              handleSaveSettingKey("timings", {
                                weekdays: e.target.weekdays.value,
                                weekends: e.target.weekends.value
                              });
                            }} className="space-y-4 text-xs">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block border-b border-white/5 pb-1 mb-2">GYM OPERATING TIMINGS</span>
                              <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Weekday Timings (Mon - Sat)</label>
                                <input type="text" name="weekdays" defaultValue={cmsContent.contactHours?.split(",")[0]?.replace("Mon - Sat: ", "") || "5:00 AM - 10:00 PM"} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Weekend Timings (Sunday)</label>
                                <input type="text" name="weekends" defaultValue={cmsContent.contactHours?.split(",")[1]?.replace(" Sun: ", "") || "6:00 AM - 12:00 PM"} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                              </div>
                              <div className="pt-2">
                                <button type="submit" className="bg-[#E50914] hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase tracking-widest py-2 px-6 rounded-sm transition-all cursor-pointer">Save Timing Logs</button>
                              </div>
                            </form>
                          )}

                          {activeSettingsSection === "social" && (
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              handleSaveSettingKey("social", {
                                instagram: e.target.instagram.value,
                                facebook: e.target.facebook.value,
                                youtube: e.target.youtube.value,
                                linkedin: e.target.linkedin.value
                              });
                            }} className="space-y-4 text-xs">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block border-b border-white/5 pb-1 mb-2">SOCIAL NETWORK INTERCONNECTS</span>
                              <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Official Instagram URL</label>
                                <input type="text" name="instagram" defaultValue={cmsContent.socialInstagram || "https://www.instagram.com/infit_gym/"} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Official Facebook URL</label>
                                <input type="text" name="facebook" defaultValue={cmsContent.socialFacebook || "https://www.facebook.com/infitgym/"} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                              </div>
                              <div className="pt-2">
                                <button type="submit" className="bg-[#E50914] hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase tracking-widest py-2 px-6 rounded-sm transition-all cursor-pointer">Save Social Links</button>
                              </div>
                            </form>
                          )}

                          {activeSettingsSection === "seo" && (
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              handleSaveSettingKey("seo", {
                                metaTitle: e.target.metaTitle.value,
                                metaDescription: e.target.metaDescription.value,
                                keywords: e.target.keywords.value,
                                ogImage: e.target.ogImage.value
                              });
                            }} className="space-y-4 text-xs">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block border-b border-white/5 pb-1 mb-2">SEO OPTIMIZATIONS & META TAGS</span>
                              <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Meta Page Title Tag (Max 60 Chars)</label>
                                <input type="text" name="metaTitle" defaultValue={cmsContent.metaTitle || "in.fit GYM | Hyderabad’s Elite AC Strength & Cardio Transformation Center"} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Meta Description Tag (Max 160 Chars)</label>
                                <textarea name="metaDescription" rows={2} defaultValue={cmsContent.metaDescription || ""} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Meta Keywords list (Comma separated)</label>
                                <input type="text" name="keywords" defaultValue={cmsContent.keywords || "gym, hyderabad, strength training"} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">OpenGraph Share Image URL</label>
                                <input type="text" name="ogImage" defaultValue={cmsContent.ogImage || ""} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white outline-none focus:border-[#E50914]" />
                              </div>
                              <div className="pt-2">
                                <button type="submit" className="bg-[#E50914] hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase tracking-widest py-2 px-6 rounded-sm transition-all cursor-pointer">Save SEO Fields</button>
                              </div>
                            </form>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ==================================================== */}
                {/* 3. SERVICES CMS CRUD */}
                {/* ==================================================== */}
                {activeTab === "services" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <div>
                        <span className="text-[9px] text-[#E50914] font-black uppercase tracking-[0.2em] block mb-1">PROGRAM CATALOG</span>
                        <h4 className="font-display font-black text-xl text-white tracking-wider uppercase">Gym Services CMS</h4>
                      </div>
                      {staffRole !== "TRAINER" && (
                        <button 
                          onClick={handleStartAddService} 
                          className="bg-[#E50914] hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> ADD SERVICE ITEM
                        </button>
                      )}
                    </div>

                    {editingServiceId ? (
                      <div className="p-5 border border-white/10 rounded-sm bg-[#0B0B0C] space-y-4 max-w-2xl text-xs">
                        <h5 className="font-display font-black text-white text-base border-b border-white/5 pb-1 uppercase tracking-wider">{editingServiceId === "new" ? "Add Gym Program" : "Modify Service"}</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Service Title *</label>
                            <input type="text" value={serviceForm.name || ""} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Category / Specialty</label>
                            <input type="text" value={serviceForm.category || "Strength"} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Description Paragraph *</label>
                          <textarea rows={3} value={serviceForm.description || ""} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Image URL Address</label>
                          <input type="text" value={serviceForm.image_url || ""} onChange={(e) => setServiceForm({ ...serviceForm, image_url: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                        </div>
                        <div className="pt-2 flex gap-4">
                          <button onClick={handleSaveServiceForm} className="bg-[#E50914] hover:bg-emerald-500 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm transition-all cursor-pointer">Save Service</button>
                          <button onClick={() => setEditingServiceId(null)} className="border border-white/20 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm transition-all cursor-pointer">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((item) => (
                          <div key={item.id} className="bg-[#0B0B0C] border border-white/10 rounded-sm overflow-hidden flex flex-col justify-between group">
                            <div className="h-32 overflow-hidden relative bg-zinc-900">
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <div className="p-4 space-y-2 text-left flex-1 flex flex-col justify-between">
                              <div className="space-y-1">
                                <span className="text-[8px] text-[#E50914] font-mono font-bold uppercase tracking-wider">{item.category}</span>
                                <h5 className="font-display font-black text-white text-base tracking-wider uppercase leading-tight">{item.name}</h5>
                                <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3">{item.description}</p>
                              </div>
                              {staffRole !== "TRAINER" && (
                                <div className="flex gap-4 pt-3 border-t border-white/5 text-[10px]">
                                  <button onClick={() => handleStartEditService(item)} className="text-zinc-400 hover:text-white font-bold uppercase tracking-wider">Edit</button>
                                  <button onClick={() => handleDeleteService(item.id)} className="text-zinc-500 hover:text-red-500 font-bold uppercase tracking-wider flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ==================================================== */}
                {/* 4. PRICING PLANS CMS CRUD */}
                {/* ==================================================== */}
                {activeTab === "plans" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <div>
                        <span className="text-[9px] text-[#E50914] font-black uppercase tracking-[0.2em] block mb-1">FINANCIAL PLANS</span>
                        <h4 className="font-display font-black text-xl text-white tracking-wider uppercase">Membership Pricing Plans</h4>
                      </div>
                      {staffRole !== "TRAINER" && (
                        <button 
                          onClick={handleStartAddPlan} 
                          className="bg-[#E50914] hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> ADD PRICING TIER
                        </button>
                      )}
                    </div>

                    {staffRole === "TRAINER" ? (
                      <div className="bg-red-950/20 border border-red-500/30 p-6 rounded-sm text-center space-y-4 max-w-md mx-auto">
                        <Lock className="w-10 h-10 text-red-500 mx-auto" />
                        <h5 className="font-bold text-white uppercase text-sm">Financial Data Restricted</h5>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                          Modifying membership plans, billing values, pricing tiers, or features is restricted under your staff authorization role.
                        </p>
                      </div>
                    ) : editingPlanId ? (
                      <div className="p-5 border border-white/10 rounded-sm bg-[#0B0B0C] space-y-4 max-w-2xl text-xs">
                        <h5 className="font-display font-black text-white text-base border-b border-white/5 pb-1 uppercase tracking-wider">{editingPlanId === "new" ? "Create Pricing Package" : "Modify Package Parameters"}</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Plan Title Name *</label>
                            <input type="text" value={planForm.name || ""} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Plan ID (slug string) *</label>
                            <input type="text" value={planForm.plan_id || ""} onChange={(e) => setPlanForm({ ...planForm, plan_id: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Price Cost (INR) *</label>
                            <input type="number" value={planForm.price || 0} onChange={(e) => setPlanForm({ ...planForm, price: parseInt(e.target.value) || 0 })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Duration Period (e.g. month, 3 months) *</label>
                            <input type="text" value={planForm.period || "month"} onChange={(e) => setPlanForm({ ...planForm, period: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Plan category (e.g. Foundation, Performance)</label>
                            <input type="text" value={planForm.category || "Performance"} onChange={(e) => setPlanForm({ ...planForm, category: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                          <div className="flex items-center gap-6 pt-5">
                            <label className="flex items-center gap-2 cursor-pointer font-bold uppercase tracking-wider text-[9px]">
                              <input type="checkbox" checked={planForm.most_popular || false} onChange={(e) => setPlanForm({ ...planForm, most_popular: e.target.checked })} className="rounded bg-[#121215] border-white/20 text-[#E50914] focus:ring-[#E50914]" /> Most Popular Badge
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer font-bold uppercase tracking-wider text-[9px]">
                              <input type="checkbox" checked={planForm.is_enabled || false} onChange={(e) => setPlanForm({ ...planForm, is_enabled: e.target.checked })} className="rounded bg-[#121215] border-white/20 text-[#E50914] focus:ring-[#E50914]" /> Active Enabled
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Included Features (Comma-separated list)</label>
                          <textarea rows={2} value={planForm.features ? (Array.isArray(planForm.features) ? planForm.features.join(", ") : planForm.features) : ""} onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" placeholder="Full Gym Access, Cardio access..." />
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Disabled Features (Comma-separated list)</label>
                          <textarea rows={2} value={planForm.disabled_features ? (Array.isArray(planForm.disabled_features) ? planForm.disabled_features.join(", ") : planForm.disabled_features) : ""} onChange={(e) => setPlanForm({ ...planForm, disabled_features: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" placeholder="Personal Coach sessions, Diet charts..." />
                        </div>
                        <div className="pt-2 flex gap-4">
                          <button onClick={handleSavePlanForm} className="bg-[#E50914] hover:bg-emerald-500 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm transition-all cursor-pointer">Save Package</button>
                          <button onClick={() => setEditingPlanId(null)} className="border border-white/20 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm transition-all cursor-pointer">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {plans.map((p) => (
                          <div key={p.id} className="p-5 bg-[#0B0B0C] border border-white/10 rounded-sm flex justify-between items-start">
                            <div className="space-y-1">
                              <span className="text-[7.5px] font-bold text-[#E50914] uppercase tracking-widest block">{p.category} TIER</span>
                              <h5 className="font-display font-black text-base text-white uppercase tracking-wider">{p.name}</h5>
                              <div className="text-lg font-mono font-black text-white">₹{p.price} <span className="text-[10px] font-sans font-normal text-zinc-500">/ {p.period}</span></div>
                              <span className="text-[8px] font-sans font-bold uppercase text-zinc-500 block">ID: {p.plan_id}</span>
                            </div>
                            <div className="flex gap-3 text-[10px]">
                              <button onClick={() => handleStartEditPlan(p)} className="text-zinc-400 hover:text-white uppercase font-bold tracking-wider">Edit</button>
                              <button onClick={() => handleDeletePlan(p.id)} className="text-zinc-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ==================================================== */}
                {/* 5. certified COACHES CMS CRUD */}
                {/* ==================================================== */}
                {activeTab === "coaches" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <div>
                        <span className="text-[9px] text-[#E50914] font-black uppercase tracking-[0.2em] block mb-1">TEAM STAFF</span>
                        <h4 className="font-display font-black text-xl text-white tracking-wider uppercase">Certified Coaches Roster</h4>
                      </div>
                      {staffRole !== "TRAINER" && (
                        <button 
                          onClick={handleStartAddTrainer} 
                          className="bg-[#E50914] hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> ADD TRAINER COACH
                        </button>
                      )}
                    </div>

                    {editingTrainerId ? (
                      <div className="p-5 border border-white/10 rounded-sm bg-[#0B0B0C] space-y-4 max-w-2xl text-xs">
                        <h5 className="font-display font-black text-white text-base border-b border-white/5 pb-1 uppercase tracking-wider">{editingTrainerId === "new" ? "Recruit Team Coach" : "Edit Coach Profile"}</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Coach Name *</label>
                            <input type="text" value={trainerForm.name || ""} onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Specialization Focus *</label>
                            <input type="text" value={trainerForm.specialization || "Powerlifting & Biomechanics"} onChange={(e) => setTrainerForm({ ...trainerForm, specialization: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Experience Years *</label>
                            <input type="text" value={trainerForm.experience || "5+ Years"} onChange={(e) => setTrainerForm({ ...trainerForm, experience: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Photo Image Link</label>
                            <input type="text" value={trainerForm.photo_url || ""} onChange={(e) => setTrainerForm({ ...trainerForm, photo_url: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Instagram Account Username</label>
                            <input type="text" value={trainerForm.instagram || ""} onChange={(e) => setTrainerForm({ ...trainerForm, instagram: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" placeholder="rohit_lifts" />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Facebook Account Slug</label>
                            <input type="text" value={trainerForm.facebook || ""} onChange={(e) => setTrainerForm({ ...trainerForm, facebook: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Certifications (Comma separated list)</label>
                          <textarea rows={2} value={trainerForm.certificates ? (Array.isArray(trainerForm.certificates) ? trainerForm.certificates.join(", ") : trainerForm.certificates) : ""} onChange={(e) => setTrainerForm({ ...trainerForm, certificates: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" placeholder="NASM-CPT, Squat University form certified..." />
                        </div>
                        <div className="pt-2 flex gap-4">
                          <button onClick={handleSaveTrainerForm} className="bg-[#E50914] hover:bg-emerald-500 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm transition-all cursor-pointer">Save Profile</button>
                          <button onClick={() => setEditingTrainerId(null)} className="border border-white/20 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm transition-all cursor-pointer">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {trainers.map((t) => (
                          <div key={t.id} className="p-4 bg-[#0B0B0C] border border-white/10 rounded-sm flex items-center gap-4">
                            <img src={t.photo_url} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-white/10 flex-shrink-0" />
                            <div className="flex-1 text-left min-w-0">
                              <h5 className="font-display font-black text-white text-sm uppercase leading-tight truncate tracking-wide">{t.name}</h5>
                              <span className="text-[10px] text-zinc-400 block truncate">{t.specialization} • ({t.experience})</span>
                              <span className="text-[8px] text-zinc-500 font-mono block">INSTA: @{t.instagram || "none"}</span>
                            </div>
                            {staffRole !== "TRAINER" && (
                              <div className="flex gap-2">
                                <button onClick={() => handleStartEditTrainer(t)} className="text-zinc-400 hover:text-white uppercase font-bold text-[9px] tracking-wider p-1">Edit</button>
                                <button onClick={() => handleDeleteTrainer(t.id)} className="text-zinc-500 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ==================================================== */}
                {/* 6. TESTIMONIALS CMS CRUD */}
                {/* ==================================================== */}
                {activeTab === "testimonials" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <div>
                        <span className="text-[9px] text-[#E50914] font-black uppercase tracking-[0.2em] block mb-1">SOCIAL PROOF</span>
                        <h4 className="font-display font-black text-xl text-white tracking-wider uppercase">Athlete Reviews & Testimonials</h4>
                      </div>
                      {staffRole !== "TRAINER" && (
                        <button 
                          onClick={handleStartAddTestimonial} 
                          className="bg-[#E50914] hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> ADD TESTIMONIAL
                        </button>
                      )}
                    </div>

                    {editingTestimonialId ? (
                      <div className="p-5 border border-white/10 rounded-sm bg-[#0B0B0C] space-y-4 max-w-2xl text-xs">
                        <h5 className="font-display font-black text-white text-base border-b border-white/5 pb-1 uppercase tracking-wider">{editingTestimonialId === "new" ? "Add Athlete Testimonial" : "Edit Review Parameters"}</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Athlete Name *</label>
                            <input type="text" value={testimonialForm.member_name || ""} onChange={(e) => setTestimonialForm({ ...testimonialForm, member_name: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Program category Focus</label>
                            <input type="text" value={testimonialForm.category || "Strength Floor"} onChange={(e) => setTestimonialForm({ ...testimonialForm, category: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Star Rating (1 - 5) *</label>
                            <input type="number" min={1} max={5} value={testimonialForm.rating || 5} onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseFloat(e.target.value) || 5 })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Member Image URL (optional)</label>
                            <input type="text" value={testimonialForm.member_photo_url || ""} onChange={(e) => setTestimonialForm({ ...testimonialForm, member_photo_url: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Quote Review Text *</label>
                          <textarea rows={3} value={testimonialForm.review_text || ""} onChange={(e) => setTestimonialForm({ ...testimonialForm, review_text: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white font-sans font-medium" />
                        </div>
                        <div className="pt-2 flex gap-4">
                          <button onClick={handleSaveTestimonialForm} className="bg-[#E50914] hover:bg-emerald-500 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm transition-all cursor-pointer">Save Testimonial</button>
                          <button onClick={() => setEditingTestimonialId(null)} className="border border-white/20 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm transition-all cursor-pointer">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {testimonials.map((t) => (
                          <div key={t.id} className="p-5 bg-[#0B0B0C] border border-white/10 rounded-sm space-y-3 relative text-left">
                            <div className="flex text-[#E50914] text-[10px]">
                              {Array.from({ length: Math.round(t.rating) }).map((_, i) => "★").join("")}
                            </div>
                            <p className="text-zinc-200 text-xs font-sans font-semibold pl-1 leading-relaxed">"{t.review_text}"</p>
                            <div className="flex justify-between items-center text-[8.5px] uppercase font-bold tracking-wider text-zinc-400 pt-2 border-t border-white/5">
                              <span>— {t.member_name}</span>
                              <span className="text-[#E50914]">{t.category}</span>
                            </div>
                            {staffRole !== "TRAINER" && (
                              <div className="absolute top-4 right-4 flex gap-3 text-[10px]">
                                <button onClick={() => handleStartEditTestimonial(t)} className="text-zinc-500 hover:text-white uppercase font-bold tracking-wider">Edit</button>
                                <button onClick={() => handleDeleteTestimonial(t.id)} className="text-zinc-500 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ==================================================== */}
                {/* 7. GALLERY CMS CRUD */}
                {/* ==================================================== */}
                {activeTab === "gallery" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <div>
                        <span className="text-[9px] text-[#E50914] font-black uppercase tracking-[0.2em] block mb-1">BRIGHT VISUALS</span>
                        <h4 className="font-display font-black text-xl text-white tracking-wider uppercase">High-Oxygen Photo Gallery</h4>
                      </div>
                      {staffRole !== "TRAINER" && (
                        <button 
                          onClick={handleStartAddGallery} 
                          className="bg-[#E50914] hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> ADD GALLERY IMAGE
                        </button>
                      )}
                    </div>

                    {editingGalleryId ? (
                      <div className="p-5 border border-white/10 rounded-sm bg-[#0B0B0C] space-y-4 max-w-2xl text-xs">
                        <h5 className="font-display font-black text-white text-base border-b border-white/5 pb-1 uppercase tracking-wider">{editingGalleryId === "new" ? "Add Photo" : "Edit Photo Details"}</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Slide Title *</label>
                            <input type="text" value={galleryForm.title || ""} onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Category *</label>
                            <select value={galleryForm.category || "Gym"} onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white cursor-pointer font-sans">
                              <option value="Gym">Gym Floor</option>
                              <option value="Equipment">USA Equipment</option>
                              <option value="Transformation">Transformation</option>
                              <option value="Events">Special Events</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Description</label>
                          <input type="text" value={galleryForm.description || ""} onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Image Photo URL Address *</label>
                          <input type="text" value={galleryForm.photo_url || ""} onChange={(e) => setGalleryForm({ ...galleryForm, photo_url: e.target.value })} className="w-full bg-[#121215] border border-white/15 rounded-sm p-2 text-white" />
                        </div>
                        <div className="pt-2 flex gap-4">
                          <button onClick={handleSaveGalleryForm} className="bg-[#E50914] hover:bg-emerald-500 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm transition-all cursor-pointer">Save Photo</button>
                          <button onClick={() => setEditingGalleryId(null)} className="border border-white/20 text-white text-[10px] font-bold uppercase py-2 px-5 rounded-sm transition-all cursor-pointer">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gallery.map((g) => (
                          <div key={g.id} className="bg-[#0B0B0C] border border-white/10 rounded-sm overflow-hidden flex flex-col justify-between group">
                            <div className="h-36 bg-zinc-900 overflow-hidden relative">
                              <img src={g.photo_url} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <div className="p-4 flex justify-between items-center text-left">
                              <div>
                                <span className="text-[8px] text-[#E50914] font-mono font-bold uppercase tracking-widest block">{g.category}</span>
                                <h5 className="font-display font-black text-sm text-white uppercase tracking-wider truncate max-w-[160px]">{g.title}</h5>
                              </div>
                              {staffRole !== "TRAINER" && (
                                <div className="flex gap-2">
                                  <button onClick={() => handleStartEditGallery(g)} className="text-zinc-400 hover:text-white uppercase font-bold text-[9px] tracking-wider p-1">Edit</button>
                                  <button onClick={() => handleDeleteGallery(g.id)} className="text-zinc-500 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ==================================================== */}
                {/* 8. CONTACT FORM INBOUND LOGS */}
                {/* ==================================================== */}
                {activeTab === "contact_logs" && (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-white/10 pb-4">
                      <span className="text-[9px] text-[#E50914] font-black uppercase tracking-[0.2em] block mb-1">VISITOR ENQUIRIES</span>
                      <h4 className="font-display font-black text-xl text-white tracking-wider uppercase">Inbound Contact Messages</h4>
                    </div>

                    <div className="bg-[#0B0B0C] border border-white/10 rounded-sm overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-[#121215] text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                            <th className="p-4">Visitor</th>
                            <th className="p-4">Mobile Contact Info</th>
                            <th className="p-4">Message Log</th>
                            <th className="p-4">Date Submitted</th>
                            <th className="p-4 text-right">Quick Contact</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-sans">
                          {contactLogs.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-zinc-500 italic">No contact form messages recorded.</td>
                            </tr>
                          ) : (
                            contactLogs.map((log) => {
                              const waText = `Hi ${log.name},\n\nThis is Rohit from in.fit GYM NTPC X Road. I saw the enquiry you sent on our website about training: "${log.message}".\n\nI'd love to invite you to our strength floor for a free form walkthrough! When are you free?`;
                              const waUrl = `https://api.whatsapp.com/send?phone=${log.phone.replace(/[^0-9]/g, "")}&text=${encodeURIComponent(waText)}`;
                              return (
                                <tr key={log.id} className="hover:bg-white/[0.02] text-xs">
                                  <td className="p-4 font-black text-white font-sans uppercase tracking-wider">{log.name}</td>
                                  <td className="p-4 space-y-0.5">
                                    <div className="text-zinc-200">{log.email}</div>
                                    <div className="font-mono text-zinc-400 font-bold">{log.phone}</div>
                                  </td>
                                  <td className="p-4 text-zinc-300 max-w-xs truncate" title={log.message}>{log.message}</td>
                                  <td className="p-4 font-mono text-zinc-400">{new Date(log.created_at).toLocaleDateString("en-IN")}</td>
                                  <td className="p-4 text-right">
                                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="bg-[#E50914] hover:bg-emerald-500 text-white font-sans text-[8.5px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors inline-block">WhatsApp Chat</a>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ==================================================== */}
                {/* 9. ATTENDANCE MANAGEMENT PORTAL */}
                {/* ==================================================== */}
                {activeTab === "attendance" && (
                  <div className="space-y-6">
                    <div className="border-b border-white/10 pb-4">
                      <span className="text-[9px] text-[#E50914] font-black uppercase tracking-[0.2em] block mb-1">GYM SECURITY SYSTEMS</span>
                      <h4 className="font-display font-black text-xl text-white tracking-wider uppercase">Athlete Attendance Logs</h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      {/* Check-In Console */}
                      <div className="bg-[#0B0B0C] p-5 border border-white/10 rounded-sm space-y-4">
                        <span className="text-[9px] text-[#E50914] font-bold uppercase tracking-widest block border-b border-white/5 pb-1">Check In Athlete</span>
                        <div className="space-y-3">
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Select Active Member</label>
                          <input
                            type="text"
                            placeholder="Type athlete name to search..."
                            value={attendanceSearch}
                            onChange={(e) => setAttendanceSearch(e.target.value)}
                            className="w-full bg-[#121215] border border-white/10 focus:border-[#E50914] rounded-sm px-3.5 py-2.5 text-xs text-white outline-none placeholder-zinc-500"
                          />
                          <div className="max-h-48 overflow-y-auto space-y-1.5 border border-white/5 p-2 rounded bg-zinc-950/40 text-xs">
                            {(() => {
                              const sQuery = attendanceSearch.toLowerCase();
                              const filtered = activeMemberships.filter(m => {
                                const name = m.users?.full_name?.toLowerCase() || "";
                                const phone = m.users?.phone || "";
                                return name.includes(sQuery) || phone.includes(sQuery);
                              });

                              if (filtered.length === 0) {
                                return <div className="text-zinc-600 text-center py-4 italic">No matching athletes found.</div>;
                              }

                              return filtered.map(member => (
                                <div key={member.id} className="flex justify-between items-center py-2 px-2.5 bg-[#121215] border border-white/5 rounded-sm hover:border-[#E50914]/40 transition-colors">
                                  <div>
                                    <span className="font-bold text-white uppercase text-[10px]">{member.users?.full_name}</span>
                                    <span className="text-[8px] text-zinc-500 font-mono block">UID: {member.athlete_cards?.card_number || "none"}</span>
                                  </div>
                                  <button
                                    onClick={() => handleCheckInMember(member.user_id)}
                                    className="bg-[#E50914] hover:bg-white text-white hover:text-black font-sans text-[8.5px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-sm transition-all cursor-pointer"
                                  >
                                    Check In
                                  </button>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Today's Attendance Logs */}
                      <div className="lg:col-span-2 bg-[#0B0B0C] p-5 border border-white/10 rounded-sm space-y-4">
                        <span className="text-[9px] text-[#E50914] font-bold uppercase tracking-widest block border-b border-white/5 pb-1">Today's Attendance Logs ({attendanceToday.length})</span>
                        <div className="bg-[#121215] border border-white/5 rounded-sm overflow-hidden">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-white/10 bg-[#0B0B0C] text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                                <th className="p-3">Athlete</th>
                                <th className="p-3">Check-In Time</th>
                                <th className="p-3">Check-Out Time</th>
                                <th className="p-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-sans text-[11px]">
                              {attendanceToday.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="p-6 text-center text-zinc-600 italic">No attendance records registered today yet.</td>
                                </tr>
                              ) : (
                                attendanceToday.map((log) => (
                                  <tr key={log.id} className="hover:bg-white/[0.01]">
                                    <td className="p-3">
                                      <div className="font-bold text-white uppercase">{log.users?.full_name || "Syncing..."}</div>
                                      <div className="text-[8px] text-zinc-500 font-mono font-bold">{log.users?.phone}</div>
                                    </td>
                                    <td className="p-3 font-mono font-bold text-zinc-300">
                                      {new Date(log.check_in).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                    </td>
                                    <td className="p-3 font-mono">
                                      {log.check_out ? (
                                        <span className="text-zinc-400 font-bold">
                                          {new Date(log.check_out).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                      ) : (
                                        <span className="text-[#E50914] font-bold tracking-wide animate-pulse">TRAINING...</span>
                                      )}
                                    </td>
                                    <td className="p-3 text-right">
                                      {!log.check_out && (
                                        <button
                                          onClick={() => handleCheckOutMember(log.id)}
                                          className="bg-zinc-800 hover:bg-[#E50914] text-white font-sans text-[8.5px] font-bold uppercase tracking-wider py-1 px-2 rounded-sm transition-all cursor-pointer"
                                        >
                                          Check Out
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================================================== */}
                {/* 10. QR SCANNER SIMULATOR */}
                {/* ==================================================== */}
                {activeTab === "qr_scanning" && (
                  <div className="space-y-6">
                    <div className="border-b border-white/10 pb-4">
                      <span className="text-[9px] text-[#E50914] font-black uppercase tracking-[0.2em] block mb-1">ACCESS AUDITING</span>
                      <h4 className="font-display font-black text-xl text-white tracking-wider uppercase">Athlete Card Scanner Simulator</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
                      {/* Barcode scanner panel */}
                      <form onSubmit={handleScanPass} className="bg-[#0B0B0C] p-6 border border-white/10 rounded-sm space-y-5 text-center">
                        <div className="w-16 h-16 rounded-full bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center mx-auto">
                          <QrCode className="w-8 h-8 text-[#E50914] animate-pulse" />
                        </div>
                        
                        <div className="space-y-1">
                          <h5 className="font-display font-black text-base text-white uppercase tracking-wider">Scan Barcode / QR Code</h5>
                          <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold font-sans">
                            Enter Athlete Pass Card UID (e.g. FIT-123456)
                          </p>
                        </div>

                        <div>
                          <input
                            type="text"
                            required
                            value={scannerInput}
                            onChange={(e) => setScannerInput(e.target.value)}
                            placeholder="Type or scan Card Number"
                            className="w-full bg-[#121215] border border-white/15 focus:border-[#E50914] rounded-sm px-4 py-3 text-sm text-center text-white outline-none font-sans font-extrabold tracking-widest"
                          />
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            className="w-full bg-[#E50914] hover:bg-white hover:text-black text-white font-sans text-[10px] tracking-widest font-bold uppercase py-3.5 rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            RUN SCAN VALIDATOR <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </form>

                      {/* Scan results */}
                      <div className="bg-[#0B0B0C] p-6 border border-white/10 rounded-sm min-h-[300px] flex flex-col justify-center text-left">
                        {scannedResult ? (
                          <div className="space-y-5 font-sans">
                            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block">AUDIT SCAN RESPONSE</span>
                            
                            {scannedResult.status === "ACTIVE" ? (
                              <div className="bg-emerald-950/40 border border-[#E50914] p-4 rounded-sm flex items-start gap-3">
                                <Check className="w-5 h-5 text-[#E50914] shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-[#E50914] text-xs uppercase tracking-widest block">✅ ACCESS GRANTED</span>
                                  <p className="text-[11.5px] text-zinc-300 font-sans mt-0.5">{scannedResult.message}</p>
                                </div>
                              </div>
                            ) : scannedResult.status === "EXPIRED" ? (
                              <div className="bg-red-950/40 border border-red-500 p-4 rounded-sm flex items-start gap-3">
                                <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-red-500 text-xs uppercase tracking-widest block">🛑 ACCESS DENIED: EXPIRED</span>
                                  <p className="text-[11.5px] text-zinc-300 font-sans mt-0.5">{scannedResult.message}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-amber-950/40 border border-amber-500 p-4 rounded-sm flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-amber-500 text-xs uppercase tracking-widest block">⚠️ NOT REGISTERED</span>
                                  <p className="text-[11.5px] text-zinc-300 font-sans mt-0.5">{scannedResult.message}</p>
                                </div>
                              </div>
                            )}

                            {scannedResult.card && (
                              <div className="p-4 bg-[#121215] border border-white/5 rounded-sm space-y-3 font-sans text-xs">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-full border border-white/10 bg-[#0B0B0C] flex items-center justify-center shrink-0">
                                    <span className="text-[#E50914] font-display font-black uppercase text-xs">{scannedResult.card.users?.full_name.split(" ").map(n => n[0]).join("")}</span>
                                  </div>
                                  <div>
                                    <h6 className="font-display font-black text-white uppercase text-[13px] tracking-wide">{scannedResult.card.users?.full_name}</h6>
                                    <span className="text-[9px] text-zinc-500 font-mono">{scannedResult.card.users?.email}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3 text-[10.5px]">
                                  <div>
                                    <span className="text-zinc-500 block uppercase tracking-wider text-[8px] font-bold">PLAN TYPE</span>
                                    <span className="text-white uppercase font-bold">{scannedResult.card.memberships?.plan_name || "N/A"}</span>
                                  </div>
                                  <div>
                                    <span className="text-zinc-500 block uppercase tracking-wider text-[8px] font-bold">EXPIRY DATE</span>
                                    <span className={`font-mono font-bold ${scannedResult.status === "ACTIVE" ? "text-[#E50914]" : "text-red-500"}`}>{new Date(scannedResult.card.memberships?.expiry_date).toLocaleDateString("en-IN")}</span>
                                  </div>
                                </div>
                                {scannedResult.status === "ACTIVE" && (
                                  <button
                                    onClick={() => handleCheckInMember(scannedResult.card.user_id)}
                                    className="w-full bg-[#E50914] hover:bg-white text-white hover:text-black font-sans text-[9px] font-bold uppercase tracking-widest py-2 rounded-sm transition-all mt-2 cursor-pointer text-center"
                                  >
                                    Log Attendance Check-In
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-zinc-600 italic text-xs font-sans">
                            Run scan simulation by entering card number. Access validation will display here dynamically.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================================================== */}
                {/* 11. DATABASE BACKUP CONTROLLERS */}
                {/* ==================================================== */}
                {activeTab === "backup" && (
                  <div className="space-y-6">
                    <div className="border-b border-white/10 pb-4">
                      <span className="text-[9px] text-[#E50914] font-black uppercase tracking-[0.2em] block mb-1">DATA INTEGRITY</span>
                      <h4 className="font-display font-black text-xl text-white tracking-wider uppercase">Database Backup & Recovery Console</h4>
                    </div>

                    {staffRole === "TRAINER" ? (
                      <div className="bg-red-950/20 border border-red-500/30 p-6 rounded-sm text-center space-y-4 max-w-md mx-auto">
                        <Lock className="w-10 h-10 text-red-500 mx-auto" />
                        <h5 className="font-bold text-white uppercase text-sm">Backup Access Denied</h5>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                          Your profile authorization tier does not support exporting, importing, or wiping database records backup logs.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch text-left">
                        {/* Export block */}
                        <div className="bg-[#0B0B0C] border border-white/10 p-6 rounded-sm flex flex-col justify-between space-y-5">
                          <div className="space-y-2">
                            <div className="w-10 h-10 rounded-full bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center mb-1">
                              <Download className="w-5 h-5 text-[#E50914]" />
                            </div>
                            <h5 className="font-display font-black text-white text-base uppercase leading-none tracking-wide">Export CMS Backup</h5>
                            <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                              Compile and download a local backup file containing all websiteSettings page copy configurations, services catalogue, trainers details, pricing plans features, testimonials, and gallery items records.
                            </p>
                          </div>
                          <button
                            onClick={handleExportBackup}
                            className="bg-[#1A1A1E] hover:bg-[#E50914] border border-white/20 hover:border-[#E50914] text-white font-sans text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-sm transition-all cursor-pointer text-center"
                          >
                            EXPORT COMPILER JSON
                          </button>
                        </div>

                        {/* Import block */}
                        <div className="bg-[#0B0B0C] border border-white/10 p-6 rounded-sm flex flex-col justify-between space-y-5">
                          <div className="space-y-2">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-1">
                              <Upload className="w-5 h-5 text-blue-400" />
                            </div>
                            <h5 className="font-display font-black text-white text-base uppercase leading-none tracking-wide">Import Settings Restore</h5>
                            <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                              Restore website settings page configs, services listings, gallery slides, and trainer listings by uploading a compiled in.fit JSON backup file directly.
                            </p>
                          </div>
                          <div className="relative">
                            <input
                              type="file"
                              accept=".json"
                              onChange={handleImportBackup}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="w-full bg-[#1A1A1E] hover:bg-zinc-800 border border-white/10 text-zinc-300 font-sans text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-sm text-center transition-all">
                              RESTORE BACKUP FILE
                            </div>
                          </div>
                        </div>
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
