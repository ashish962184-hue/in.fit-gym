import { useState, useEffect, useRef } from "react";
import { 
  getStoredPageContent, 
  getStoredPlans, 
  getStoredClasses, 
  getStoredTrainers 
} from "./cmsDefaults";
import AuthModal from "./components/AuthModal";
import AdminCMSModal from "./components/AdminCMSModal";
import { 
  Dumbbell, 
  Wind, 
  ShieldCheck, 
  MapPin, 
  Star, 
  Users, 
  Award, 
  Phone, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Instagram, 
  Sparkles,
  Settings
} from "lucide-react";
import Navbar from "./components/Navbar";
import RegistrationModal from "./components/RegistrationModal";
import ClassesScheduler from "./components/ClassesScheduler";
import BookPTModal from "./components/BookPTModal";
import LegalConsentModal from "./components/LegalConsentModal";
import VisualGallery from "./components/VisualGallery";
import AthleteChatbot from "./components/AthleteChatbot";
import UserComments from "./components/UserComments";
import { supabase } from "./supabaseClient";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isRenewing, setIsRenewing] = useState(false);

  // Dynamic user auth sessions 
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminCmsOpen, setIsAdminCmsOpen] = useState(false);

  // Dynamic live CMS parameters
  const [pageContent, setPageContent] = useState(getStoredPageContent);
  const [plans, setPlans] = useState(getStoredPlans);
  const [classesList, setClassesList] = useState(getStoredClasses);
  const [trainersList, setTrainersList] = useState(getStoredTrainers);

  // Modal States
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [selectedPlanForReg, setSelectedPlanForReg] = useState(null);
  const [isClassesOpen, setIsClassesOpen] = useState(false);
  const [isPtOpen, setIsPtOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  
  // Footer Legal States
  const [legalDocType, setLegalDocType] = useState(null);

  // References for Smooth Scrolling
  const facilityRef = useRef(null);
  const packagesRef = useRef(null);
  const communityRef = useRef(null);

  // Synchronize dynamic profiles from Supabase based on current authenticated session
  const syncSupabaseProfile = async (sessionUser) => {
    if (!sessionUser) {
      setLoggedInUser(null);
      setCurrentUser(null);
      return;
    }

    try {
      // 1. Fetch user role details
      const { data: profile, error: profileErr } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionUser.id)
        .single();

      if (profileErr) throw profileErr;

      setLoggedInUser({
        email: profile.email,
        fullName: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        joinedDate: new Date(profile.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
      });

      // 2. Fetch requests, active memberships, and athlete cards if standard user
      if (profile.role === "MEMBER") {
        const { data: requests } = await supabase
          .from("membership_requests")
          .select("*")
          .eq("user_id", sessionUser.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const { data: memberships } = await supabase
          .from("memberships")
          .select("*")
          .eq("user_id", sessionUser.id);
        const membership = memberships && memberships.length > 0 ? memberships[0] : null;

        const { data: cards } = await supabase
          .from("athlete_cards")
          .select("*")
          .eq("user_id", sessionUser.id);
        const card = cards && cards.length > 0 ? cards[0] : null;

        const activeRequest = requests && requests.length > 0 ? requests[0] : null;

        let calculatedStatus = "NONE";
        if (membership) {
          const today = new Date().toISOString().split("T")[0];
          if (membership.expiry_date < today || !membership.is_active) {
            calculatedStatus = "EXPIRED";
          } else {
            calculatedStatus = "ACTIVE";
          }
        } else if (activeRequest) {
          calculatedStatus = activeRequest.status; // 'PENDING', 'CONTACTED', 'APPROVED', 'REJECTED'
        }

        const activeMemberProfile = {
          fullName: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          selectedPlanId: activeRequest ? activeRequest.selected_plan : (membership ? membership.plan_name : "quarterly-pro"),
          price: activeRequest ? activeRequest.plan_price : (membership ? membership.plan_price : 9999),
          parqAnswers: {
            heartCondition: false, chestPain: false, dizziness: false,
            boneJoint: false, bloodPressureDrugs: false, otherReason: false
          },
          signedWaiver: true,
          signatureName: profile.full_name,
          memberId: card ? card.card_number : (activeRequest ? activeRequest.id : "REQ-PENDING"),
          joinedDate: membership ? new Date(membership.start_date).toLocaleDateString("en-IN") : (activeRequest ? new Date(activeRequest.created_at).toLocaleDateString("en-IN") : "PENDING"),
          status: calculatedStatus,
          membershipDetails: membership ? {
            planName: membership.plan_name,
            startDate: new Date(membership.start_date).toLocaleDateString("en-IN"),
            expiryDate: new Date(membership.expiry_date).toLocaleDateString("en-IN"),
            isActive: membership.is_active
          } : null
        };

        setCurrentUser(activeMemberProfile);
      }
    } catch (err) {
      console.error("Profile synchronization error:", err.message);
    }
  };

  // Sync profile details on start and hook session state listeners
  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        syncSupabaseProfile(session.user);
      }
    };
    initSession();

    // Setup Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        syncSupabaseProfile(session.user);
      } else {
        setLoggedInUser(null);
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const reloadCmsContent = () => {
    setPageContent(getStoredPageContent());
    setPlans(getStoredPlans());
    setClassesList(getStoredClasses());
    setTrainersList(getStoredTrainers());

    // Re-sync current logged user profiles
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) syncSupabaseProfile(user);
    });
  };

  const handleEnrollComplete = (member) => {
    setCurrentUser(member);
    // Re-fetch profile to load the stored Supabase requests list
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) syncSupabaseProfile(user);
    });
  };

  const handleLoginSuccess = (profile) => {
    setLoggedInUser(profile);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) syncSupabaseProfile(user);
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLoggedInUser(null);
    setCurrentUser(null);
    setIsRenewing(false);
  };

  const handleTriggerSignUp = (defaultPlanId = "quarterly-pro") => {
    const plan = plans.find((p) => p.id === defaultPlanId) || plans[0];
    setSelectedPlanForReg(plan);
    setIsRegOpen(true);
  };

  const scrollToRef = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#EEEEF0] overflow-x-hidden selection:bg-[#EF4444] selection:text-white font-sans pt-20">
      
      {/* Navigation Header */}
      <Navbar 
        onJoinClick={() => handleTriggerSignUp("quarterly-pro")}
        onClassesClick={() => setIsClassesOpen(true)}
        onFacilityClick={() => scrollToRef(facilityRef)}
        onPackagesClick={() => scrollToRef(packagesRef)}
        onCommunityClick={() => scrollToRef(communityRef)}
        currentUser={currentUser}
        loggedInUser={loggedInUser}
        onAuthTrigger={() => setIsAuthOpen(true)}
        onAdminTrigger={() => setIsAdminCmsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Hero Section */}
      <section 
        className="relative min-h-[85vh] flex items-center bg-cover bg-center py-20 px-5 md:px-20 overflow-hidden border-b border-white/10"
        style={{
          backgroundImage: `linear-gradient(rgba(11, 11, 12, 0.85), rgba(11, 11, 12, 0.96)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCjr0WZYB2WIx9gR6BF1xHDKvgpcNQEWOGA5jp72grreuNi_5sDoOob994albOIdTtjPnWqrRdDt87SHr8XOt01A-l74VuSnUn7__DjlzXo1OOCbhAIyIUbvU9rpXX9VvC7oZnVA3R-QPBARDPtJQzHLurbp88UzrxZGbLn4XNntV-ujRhCFUZIXwSziGPgFly7En4dWUmhyZ8s-853MFzGBtfuIPYX0QlRoN_-L-oxsDyN3qbmEg_6nrl1zjZ8uxzp0Ecc3m3LdQM')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-start gap-6 text-left">
          
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-[#EF4444] border border-[#EF4444]/30 bg-[#EF4444]/5 py-1 px-4 uppercase tracking-[0.25em] rounded-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> {pageContent.heroTagline}
          </span>

          <h1 className="font-display text-4xl sm:text-6xl md:text-8xl tracking-tight text-[#EEEEF0] font-light leading-none">
            {pageContent.heroHeadingLine1} <span className="font-bold italic text-[#EF4444]">{pageContent.heroHeadingHighlight}</span> <br />
            {pageContent.heroHeadingLine2} <span className="font-bold italic">{pageContent.heroHeadingHighlight2}</span>
          </h1>

          <p className="text-[#EEEEF0]/80 text-sm sm:text-base max-w-xl leading-relaxed mt-2 font-serif italic">
            {pageContent.heroDescription}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4 font-sans">
            <button 
              onClick={() => scrollToRef(packagesRef)}
              className="bg-[#EF4444] hover:bg-white text-white hover:text-black border border-[#EF4444] hover:border-white font-sans text-[10px] tracking-[0.25em] font-bold px-8 py-4 uppercase rounded-sm transition-all shadow-lg shadow-[#EF4444]/20 cursor-pointer text-center"
            >
              Explore Packages
            </button>
            {loggedInUser?.role === "ADMIN" ? (
              <button 
                onClick={() => setIsAdminCmsOpen(true)}
                className="border border-[#EF4444]/60 text-[#EF4444] hover:text-white hover:bg-[#EF4444] font-sans text-[10px] tracking-[0.25em] font-bold px-8 py-4 rounded-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Settings className="w-3.5 h-3.5 animate-spin" /> Open Admin CMS Dashboard
              </button>
            ) : (
              <button 
                onClick={() => handleTriggerSignUp("quarterly-pro")}
                className="border border-white/20 hover:border-[#06B6D4] text-[#EEEEF0] hover:text-[#06B6D4] hover:bg-[#06B6D4]/5 font-sans text-[10px] tracking-[0.25em] font-bold px-8 py-4 rounded-sm transition-all cursor-pointer text-center"
              >
                Get Started
              </button>
            )}
          </div>

        </div>

        {/* Ambient Decorative Graphic */}
        <div className="absolute right-12 bottom-12 w-64 h-64 border border-white/5 rounded-full pointer-events-none flex items-center justify-center opacity-30">
          <div className="w-48 h-48 border border-dashed border-white/10 rounded-full" />
        </div>
      </section>

      {/* Bento Core Features / "Facility Highlights" */}
      <section 
        id="facility" 
        ref={facilityRef}
        className="py-24 px-5 md:px-20 max-w-7xl mx-auto scroll-mt-10"
      >
        <div className="flex justify-between items-end mb-16 border-b border-white/10 pb-4">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-[#EEEEF0] tracking-tight">
            facility <span className="font-bold italic text-[#EF4444]">highlights</span>
          </h2>
          <span className="text-[10px] text-[#EEEEF0]/60 font-sans tracking-[0.2em] uppercase hidden sm:block font-bold">
            AUTHENTIC QUALITY RACKS
          </span>
        </div>

        {/* Bento Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Large Card: Real Leader USA Equipment */}
          <div className="md:col-span-2 group relative overflow-hidden bg-[#121215] border border-white/5 p-8 sm:p-10 min-h-[340px] flex flex-col justify-end rounded-sm transition-all hover:border-white/20 hover:shadow-lg">
            <div className="absolute top-8 right-8 text-[#EEEEF0]/5 group-hover:text-[#EF4444]/10 transition-colors duration-500">
              <Dumbbell className="w-24 h-24 stroke-[1.5]" />
            </div>
            <div className="relative z-10 space-y-3 text-left">
              <span className="text-[#EF4444] font-sans text-[10px] font-bold uppercase tracking-[0.25em] block">
                WORLD CLASS GEAR
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-light text-[#EEEEF0] tracking-tight">
                REAL LEADER USA <span className="font-bold italic">EQUIPMENT</span>
              </h3>
              <p className="text-[#EEEEF0]/70 text-xs sm:text-sm max-w-md leading-relaxed">
                Trusted worldwide for extreme durability and biomechanical ergonomic precision. Our floor features the latest professional series of selectorized and heavy plate-loaded gym machines.
              </p>
            </div>
          </div>

          {/* AC Facility Card */}
          <div className="group relative overflow-hidden bg-[#121215] border border-white/5 p-8 flex flex-col items-center justify-center text-center rounded-sm transition-all hover:border-white/20 hover:shadow-lg">
            <div className="w-16 h-16 bg-[#EF4444]/5 border border-[#EF4444]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Wind className="w-8 h-8 text-[#EF4444]" />
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-light text-[#EEEEF0] tracking-tight mb-2">
              AC <span className="font-bold italic">FACILITY</span>
            </h3>
            <p className="text-[#EEEEF0]/70 text-xs leading-relaxed max-w-xs">
              Train in peak oxygenated comfort with our fully centralized climate-controlled strength and cardio floors.
            </p>
          </div>

          {/* High-Quality Training Card */}
          <div className="group relative overflow-hidden bg-[#121215] border border-white/5 p-8 flex flex-col items-start text-left rounded-sm transition-all hover:border-white/20 hover:shadow-lg justify-between min-h-[300px]">
            <div className="w-12 h-12 bg-[#EF4444]/5 border border-[#EF4444]/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-[#EF4444]" />
            </div>
            <div className="space-y-2 mt-auto">
              <h3 className="font-display text-xl sm:text-2xl font-light text-[#EEEEF0] tracking-tight">
                HIGH-QUALITY <span className="font-bold italic">TRAINING</span>
              </h3>
              <p className="text-[#EEEEF0]/70 text-xs leading-relaxed">
                Expert direct guidance tailored entirely to your physiology and dynamic power goals. Precision and safety in every rep.
              </p>
            </div>
            <button 
              onClick={() => setIsPtOpen(true)}
              className="mt-6 text-[#EF4444] hover:text-[#EEEEF0] font-sans text-[10px] tracking-[0.2em] font-bold uppercase flex items-center gap-1.5 hover:line-through transition-all cursor-pointer"
            >
              BOOK EXPERT <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Locations Card (col-span-2 on md) */}
          <div className="md:col-span-2 group relative overflow-hidden bg-[#121215] border border-white/5 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-sm transition-all hover:border-white/20 hover:shadow-lg">
            <div className="max-w-md text-left space-y-3">
              <span className="text-[#EF4444] font-sans text-[10px] font-bold uppercase tracking-[0.25em] block">
                LOCATION HUB
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-light text-[#EEEEF0] tracking-tight">
                LOCATION: NTPC <span className="font-bold italic">X ROAD</span>
              </h3>
              <p className="text-[#EEEEF0]/70 text-xs sm:text-sm leading-relaxed">
                Conveniently situated at Annojiguda, providing easy highway access and secure parking spaces for the twin-cities' elite fitness community.
              </p>
              <div className="pt-2">
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=in.fit+GYM+Annojiguda+Hyderabad" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 border-b border-[#EF4444] text-[#EF4444] font-sans text-[10px] font-bold uppercase tracking-[0.2em] pb-1 hover:text-[#EEEEF0] hover:border-[#EEEEF0]/20 transition-all"
                >
                  GET DIRECTIONS <MapPin className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Rotating dashed target indicator */}
            <div className="hidden sm:flex w-36 h-36 rounded-full border border-dashed border-white/10 items-center justify-center animate-[spin_45s_linear_infinite] flex-shrink-0">
              <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-[#EF4444]" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Services & Navigation Hub */}
      <section className="py-24 bg-[#121215]/60 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-5 md:px-20">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 text-left border-b border-white/10 pb-4">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-[#EEEEF0] tracking-tight mb-2">
                our <span className="font-bold italic text-[#EF4444]">services</span>
              </h2>
              <p className="text-[#EEEEF0]/70 text-sm italic font-serif">
                Specialized athletic programs and tools for every fitness milestone.
              </p>
            </div>
          </div>

          {/* Cards Deck */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Book PT Card */}
            <div 
              onClick={() => setIsPtOpen(true)}
              className="group bg-[#121215] p-8 border border-white/5 hover:border-[#EF4444]/40 transition-all relative overflow-hidden text-left rounded-sm cursor-pointer min-h-[250px] flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div className="absolute top-0 left-0 w-[2px] h-0 bg-[#EF4444] group-hover:h-full transition-all duration-300" />
              <div>
                <Award className="w-8 h-8 text-[#EF4444] mb-6" />
                <h4 className="font-display text-xl font-bold uppercase tracking-tight text-[#EEEEF0]">
                  BOOK PT
                </h4>
                <p className="text-[#EEEEF0]/70 text-xs leading-relaxed mt-2">
                  One-on-one custom sessions with certified elite performance coaches.
                </p>
              </div>
              <span className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-[#EEEEF0]/60 group-hover:text-[#EF4444] group-hover:line-through transition-colors mt-6 block">
                START TRAINING →
              </span>
            </div>

            {/* 2. Group Class Card */}
            <div 
              onClick={() => setIsClassesOpen(true)}
              className="group bg-[#121215] p-8 border border-white/5 hover:border-[#EF4444]/40 transition-all relative overflow-hidden text-left rounded-sm cursor-pointer min-h-[250px] flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div className="absolute top-0 left-0 w-[2px] h-0 bg-[#EF4444] group-hover:h-full transition-all duration-300" />
              <div>
                <Users className="w-8 h-8 text-[#EF4444] mb-6" />
                <h4 className="font-display text-xl font-bold uppercase tracking-tight text-[#EEEEF0]">
                  GROUP CLASS
                </h4>
                <p className="text-[#EEEEF0]/70 text-xs leading-relaxed mt-2">
                  High-energy regional sessions that push collective absolute performance boundaries.
                </p>
              </div>
              <span className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-[#EEEEF0]/60 group-hover:text-[#EF4444] group-hover:line-through transition-colors mt-6 block">
                BOOK SESSION →
              </span>
            </div>

            {/* 3. Gallery Card */}
            <div 
              onClick={() => setIsGalleryOpen(true)}
              className="group bg-[#121215] p-8 border border-white/5 hover:border-[#EF4444]/40 transition-all relative overflow-hidden text-left rounded-sm cursor-pointer min-h-[250px] flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div className="absolute top-0 left-0 w-[2px] h-0 bg-[#EF4444] group-hover:h-full transition-all duration-300" />
              <div>
                <Sparkles className="w-8 h-8 text-[#EF4444] mb-6" />
                <h4 className="font-display text-xl font-bold uppercase tracking-tight text-[#EEEEF0]">
                  GALLERY
                </h4>
                <p className="text-[#EEEEF0]/70 text-xs leading-relaxed mt-2">
                  Take a widescreen virtual exploration of our precision strength hardware spaces.
                </p>
              </div>
              <span className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-[#EEEEF0]/60 group-hover:text-[#EF4444] group-hover:line-through transition-colors mt-6 block">
                EXPLORE SPACE →
              </span>
            </div>

            {/* 4. Trainers Card */}
            <div 
              onClick={() => setIsPtOpen(true)}
              className="group bg-[#121215] p-8 border border-white/5 hover:border-[#EF4444]/40 transition-all relative overflow-hidden text-left rounded-sm cursor-pointer min-h-[250px] flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div className="absolute top-0 left-0 w-[2px] h-0 bg-[#EF4444] group-hover:h-full transition-all duration-300" />
              <div>
                <CheckCircle2 className="w-8 h-8 text-[#EF4444] mb-6" />
                <h4 className="font-display text-xl font-bold uppercase tracking-tight text-[#EEEEF0]">
                  TRAINERS
                </h4>
                <p className="text-[#EEEEF0]/70 text-xs leading-relaxed mt-2">
                  Meet the licensed, certified architects of your biometric lifting transformation.
                </p>
              </div>
              <span className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-[#EEEEF0]/60 group-hover:text-[#EF4444] group-hover:line-through transition-colors mt-6 block">
                MEET ELITE →
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* Packages Pricing table / "Elite Membership" */}
      <section 
        id="packages" 
        ref={packagesRef}
        className="py-24 px-5 md:px-20 relative overflow-hidden scroll-mt-10"
      >
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16 space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-[#EEEEF0] tracking-tight">
              elite <span className="font-bold italic text-[#EF4444]">membership</span>
            </h2>
            <p className="text-[#EEEEF0]/70 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-serif italic">
              Flexible structured plans designed for athletic consistency and verifiable strength results. Find the perfect package tier for your physical journey.
            </p>
          </div>

          {/* Pricing Grid or Membership Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-2">
            {currentUser && currentUser.status === "PENDING" && !isRenewing ? (
              <div className="col-span-1 md:col-span-3 bg-[#121215] border border-amber-500/30 p-10 sm:p-14 rounded-sm text-center space-y-6 max-w-2xl mx-auto shadow-xl">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto animate-pulse">
                  <span className="text-amber-500 font-serif italic text-2xl font-bold">!</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-light text-white tracking-tight uppercase">
                    Membership Request <span className="font-bold italic text-amber-500">Pending</span>
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
                    Your membership request is currently under review. <br />
                    Our team will contact you shortly.
                  </p>
                </div>
              </div>
            ) : currentUser && currentUser.status === "CONTACTED" && !isRenewing ? (
              <div className="col-span-1 md:col-span-3 bg-[#121215] border border-blue-500/30 p-10 sm:p-14 rounded-sm text-center space-y-6 max-w-2xl mx-auto shadow-xl">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-7 h-7 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-light text-white tracking-tight uppercase">
                    Inquiry <span className="font-bold italic text-blue-400">Contacted</span>
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
                    Our team has contacted you regarding your membership. <br />
                    Please complete the enrollment process.
                  </p>
                </div>
              </div>
            ) : currentUser && currentUser.status === "APPROVED" && !isRenewing ? (
              <div className="col-span-1 md:col-span-3 bg-[#121215] border border-emerald-500/30 p-10 sm:p-14 rounded-sm text-center space-y-6 max-w-2xl mx-auto shadow-xl">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto animate-pulse">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-light text-white tracking-tight uppercase">
                    Membership <span className="font-bold italic text-emerald-400">Approved</span>
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
                    Please complete payment or gym verification to activate your membership.
                  </p>
                </div>
              </div>
            ) : currentUser && currentUser.status === "ACTIVE" && !isRenewing ? (
              <div className="col-span-1 md:col-span-3 bg-[#121215] border-2 border-[#EF4444] p-8 sm:p-12 rounded-sm max-w-2xl mx-auto shadow-2xl relative overflow-hidden text-left space-y-6 w-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#EF4444]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="border-b border-white/10 pb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[#EF4444] font-sans text-[10px] font-bold uppercase tracking-[0.25em] block mb-1">
                      ATHLETE CONTROL PORTAL
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-light text-[#EEEEF0] tracking-tight uppercase">
                      Current <span className="font-bold italic text-[#EF4444]">Membership</span>
                    </h3>
                  </div>
                  <span className="bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm">
                    ● Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans text-xs">
                  <div className="p-4 bg-[#0B0B0C] border border-white/5 rounded-sm">
                    <span className="text-zinc-400 uppercase tracking-wider text-[9px] font-bold block mb-1">PLAN NAME</span>
                    <span className="text-sm font-serif italic font-bold text-white uppercase">{currentUser.membershipDetails?.planName || "Quarterly Pro"}</span>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] border border-white/5 rounded-sm">
                    <span className="text-zinc-400 uppercase tracking-wider text-[9px] font-bold block mb-1">MEMBERSHIP STATUS</span>
                    <span className="text-sm font-bold text-[#EF4444]">ACTIVE</span>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] border border-white/5 rounded-sm">
                    <span className="text-zinc-400 uppercase tracking-wider text-[9px] font-bold block mb-1">START DATE</span>
                    <span className="text-sm font-mono font-bold text-[#EEEEF0]">{currentUser.membershipDetails?.startDate || currentUser.joinedDate}</span>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] border border-white/5 rounded-sm">
                    <span className="text-zinc-400 uppercase tracking-wider text-[9px] font-bold block mb-1">EXPIRY DATE</span>
                    <span className="text-sm font-mono font-bold text-[#EF4444]">{currentUser.membershipDetails?.expiryDate || "N/A"}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button 
                    onClick={() => {
                      const viewBtn = document.getElementById("nav-view-pass-btn");
                      if (viewBtn) {
                        viewBtn.click();
                      } else {
                        alert("Click the 'VIEW ATHLETE CARD' button in the top navigation bar to open your digital pass card!");
                      }
                    }}
                    className="w-full bg-[#EF4444] hover:bg-white text-white hover:text-black font-sans text-[10px] tracking-[0.25em] font-bold uppercase py-4 rounded-sm transition-all shadow-md cursor-pointer text-center"
                  >
                    VIEW ATHLETE CARD
                  </button>
                </div>
              </div>
            ) : currentUser && currentUser.status === "EXPIRED" && !isRenewing ? (
              <div className="col-span-1 md:col-span-3 bg-[#121215] border border-red-500/30 p-10 sm:p-14 rounded-sm text-center space-y-6 max-w-2xl mx-auto shadow-xl">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
                  <span className="text-red-500 font-bold font-serif text-2xl">X</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-light text-white tracking-tight uppercase">
                    Membership <span className="font-bold italic text-red-500">Expired</span>
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
                    Your membership has expired. Renew your plan to regain full access to classes, equipment, and personal coaching slots.
                  </p>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={() => setIsRenewing(true)}
                    className="bg-[#EF4444] hover:bg-white text-white hover:text-black font-sans text-[10px] tracking-[0.25em] font-bold uppercase py-3.5 px-8 rounded-sm transition-all cursor-pointer text-center"
                  >
                    RENEW MEMBERSHIP
                  </button>
                </div>
              </div>
            ) : (
              plans.map((plan) => {
                const isRecommended = plan.mostPopular || plan.category === "Performance";
                return (
                  <div 
                    key={plan.id}
                    className={`bg-[#121215] p-10 flex flex-col justify-between rounded-sm transition-all hover:shadow-lg text-left relative ${
                      isRecommended ? "border-2 border-[#EF4444] md:scale-105 shadow-xl z-20" : "border border-white/10 hover:border-white/25"
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#EF4444] text-white px-5 py-1 text-[8px] font-bold uppercase tracking-widest rounded-sm font-sans">
                        RECOMMENDED
                      </div>
                    )}

                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] block mb-1 text-zinc-200/50">
                        {plan.category.toUpperCase()} TIER
                      </span>
                      <h3 className="font-display text-2xl font-bold text-[#EEEEF0] uppercase tracking-tight mb-6">
                        {plan.name}
                      </h3>
                      
                      <div className="mb-8 flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-[#EEEEF0]">₹ {plan.price.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-[#EEEEF0]/60 font-serif italic">/ {plan.period}</span>
                      </div>

                      <ul className="space-y-4 mb-10 text-xs text-[#EEEEF0]/80">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#EF4444] flex-shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                        {plan.disabledFeatures?.map((feat, i) => (
                          <li key={i} className="flex items-center gap-3 text-[#EEEEF0]/45 line-through opacity-60">
                            <Circle className="w-4 h-4 flex-shrink-0 opacity-45" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {loggedInUser?.role === "ADMIN" ? (
                      <button 
                        onClick={() => setIsAdminCmsOpen(true)}
                        className="w-full bg-[#06B6D4]/10 hover:bg-[#06B6D4]/25 text-[#06B6D4] border border-[#06B6D4]/35 font-sans text-[10px] tracking-widest font-bold uppercase py-3.5 rounded-sm transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <Settings className="w-3.5 h-3.5" /> EDIT PLAN DETAILS
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleTriggerSignUp(plan.id)}
                        className={`w-full font-sans text-[10px] tracking-widest font-bold uppercase py-3.5 rounded-sm transition-colors cursor-pointer text-center ${
                          isRecommended 
                            ? "bg-[#EF4444] text-white border border-[#EF4444] hover:bg-black hover:border-white" 
                            : "border border-white/60 hover:bg-black hover:text-white text-[#EEEEF0]"
                        }`}
                      >
                        SELECT PLAN
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Prominent Logo-Branded strength cardio Features Banner */}
          <div className="mt-14 max-w-4xl mx-auto bg-[#121215] border-2 border-[#EF4444] rounded-sm p-8 relative overflow-hidden text-center shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#84CC16] via-[#06B6D4] to-[#EF4444]" />
            
            <div className="relative z-10 flex flex-col items-center gap-4">
              <span className="text-[10px] text-[#06B6D4] font-bold uppercase tracking-[0.3em] font-sans">
                in.fit gym priority level
              </span>
              
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white tracking-widest leading-none">
                INCLUDES <span className="text-[#EF4444]">STRENGTH</span> & <span className="text-[#06B6D4]">CARDIO</span>
              </h3>
              
              <p className="text-[#EEEEF0]/70 text-xs max-w-xl mx-auto leading-relaxed font-serif italic">
                All memberships include unrestricted access to our heavy compound lifting cages, prime strength selectorized isolation floor, and state-of-the-art cardiovascular suite.
              </p>
              
              <div className="w-12 h-0.5 bg-white/10 my-1" />
              
              {/* Official Contact Hotline links */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-2">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[#EEEEF0]/50 font-bold block">
                  OFFICIAL HOTLINES:
                </span>
                
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <a 
                    href="tel:9966683776"
                    className="group/phone flex items-center gap-2 text-white hover:text-[#EF4444] transition-colors font-sans font-extrabold tracking-wider text-sm"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#EF4444]/10 flex items-center justify-center border border-[#EF4444]/20 group-hover/phone:border-[#EF4444] transition-colors">
                      <Phone className="w-4 h-4 text-[#EF4444]" />
                    </span>
                    99666 83776
                  </a>

                  <a 
                    href="tel:8309134004"
                    className="group/phone flex items-center gap-2 text-white hover:text-[#06B6D4] transition-colors font-sans font-extrabold tracking-wider text-sm"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#06B6D4]/10 flex items-center justify-center border border-[#06B6D4]/20 group-hover/phone:border-[#06B6D4] transition-colors">
                      <Phone className="w-4 h-4 text-[#06B6D4]" />
                    </span>
                    83091 34004
                  </a>
                </div>
              </div>
            </div>
            
            {/* Ambient glows */}
            <div className="absolute -left-20 -bottom-20 w-44 h-44 rounded-full bg-[#EF4444]/5 blur-3xl pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-44 h-44 rounded-full bg-[#06B6D4]/5 blur-3xl pointer-events-none" />
          </div>

        </div>
      </section>

      {/* Social Proof & Certified Trainers */}
      <section 
        id="community" 
        ref={communityRef}
        className="py-24 bg-[#121215]/40 border-y border-white/5"
      >
        <div className="max-w-7xl mx-auto px-5 md:px-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Review column */}
          <div className="text-left space-y-8">
            <div className="space-y-2 pb-2 border-b border-white/10">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-[#EEEEF0] tracking-tight">
                what our <span className="font-bold italic text-[#EF4444]">athletes</span> say
              </h2>
              <p className="text-[#EEEEF0]/70 text-xs sm:text-sm font-serif italic text-left">
                Real feedback from serious athletes training in our Hyderabad facility.
              </p>
            </div>

            {/* Testimonial Card */}
            <div className="bg-[#121215] p-8 border-l-4 border-[#EF4444] rounded-sm space-y-4 shadow-sm border-y border-r border-white/5 text-left">
              <div className="flex text-[#EF4444]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#EF4444] text-[#EF4444]" />
                ))}
              </div>
              <p className="text-[#EEEEF0] text-xs sm:text-sm italic leading-relaxed font-serif">
                "{pageContent.testimonialQuote}"
              </p>
              <div className="flex justify-between items-center text-[9px] font-sans font-bold tracking-wider text-[#EEEEF0]/60 uppercase">
                <span>— {pageContent.testimonialAuthor}</span>
                <span className="text-[#EF4444] font-semibold">{pageContent.testimonialCategory}</span>
              </div>
            </div>

            {/* Dynamic Comment Section */}
            <div className="pt-4 border-t border-white/5 text-left">
              <UserComments />
            </div>

            {/* Avatar prompts */}
            <div className="flex items-center gap-4 p-2 pl-0">
              <div className="flex -space-x-3">
                <img 
                  alt="Athlete 1" 
                  className="w-10 h-10 rounded-full border-2 border-[#0B0B0C] object-cover" 
                  referrerPolicy="no-referrer"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqULpIpNiDmzC1x3IQUokQW8tElAiISsxvngnk5ksQpkIPFOq-_qiBba-uQOXq-bz5q3UhG6snqMFEAvlNMNXwhsSk5xxDxQDJ0SqADZ-0JSCRuqoXxX5zSADr6JltVipfDDGV4qTDj8bCZySJAK6GF22w4aBWhIuerl03s3w62wdGX-sLeuSiXggl9rVl9ld996liTZ4vN16JNR6IrRHqBUacTiRhX4ETWgdrr4ajKZi7r0BoyZuTv3XkQWNNTInzWk0fcnd7CDw" 
                />
                <img 
                  alt="Athlete 2" 
                  className="w-10 h-10 rounded-full border-2 border-[#0B0B0C] object-cover" 
                  referrerPolicy="no-referrer"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAt_HOMvpotaxRSrV_HWr0lblzQAnHfSHn1P_dDrpPFQFqzeFtpc5irUxz7GTfNjfX_VgeE7Bgl4af96mLJO1D_yiRpkhy3j7epmWiqLc1ks3jxeye3D-rY1L846YS5aZp5Y_-JY9DOjKXr6h1aFHeoEIa0zNcUTUmiLpC7OzVJ8q8kze8yaJTpGQHIaaOJQ0j4mTnGn6LWgpOk5uefPmJ1babR7uSg9v-HMn0Q0KbLqObWfsXxI2doSqdXuhEfTr9_lxKNtkeFFOw" 
                />
                <img 
                  alt="Athlete 3" 
                  className="w-10 h-10 rounded-full border-2 border-[#0B0B0C] object-cover" 
                  referrerPolicy="no-referrer"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsbE0zkc5syu0mPnUOHxooZ380zUN7K5qvSRi6YivCZrjFptOVOEdLHxMKjSstuvVhuw23ANiz3xDNoZbRzKM-4S__yYTHBcP9dhDS0GcmS9T3u21l9EqL71QMtVdS5OTnxm1BKDoqsjyyKO6fXL-r4EamjN_3LyxP2_ILpy3IHTKDGbItcQd78nevn8qU28jy9LgN-2rD_lt7i8jmWBaCaurZ_0CjAgaGRDFLpp3wyO25nnNGD1Xoqgd0erhMp3c8qt5NaeJsqbM" 
                />
              </div>
              <span className="text-[#EEEEF0]/70 font-sans text-xs font-semibold">
                Join 500+ active performance members
              </span>
            </div>

          </div>

          {/* Right expert qualifications */}
          <div className="relative">
            <div className="relative bg-[#121215] border border-white/5 p-8 sm:p-10 rounded-sm overflow-hidden group min-h-[380px] flex flex-col justify-end shadow-sm hover:shadow-md transition-shadow">
              
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAVs1hC75ipnjlGbmNO2F3ltwsFsm2dAugqfpgylqtFONh8tVgVMzJTy5HDc9AWVsOZoQJgxscmpbpDpDef2X4qiGFqfGjSbV2_vODb_gjBYYlwp31pKdGG5cjw7yI7d5g0K4lvAAk7iBKzoL1GCT4Hh3_4aRAv5BmPpbnhiDQx1WuwDBeqpFQEOFGpuQHZnfjgMXuPKMtTklRHeO4JkRPm3wPh9ZFkho4TBi2U4lYgpnG3RiJOS91NHx6pvwjUynwZng-pdsnfXI" 
                alt="Trainer Qualifications background" 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity duration-500 filter grayscale" 
              />

              <div className="relative z-10 text-left space-y-5">
                
                <h3 className="font-display text-2xl sm:text-3xl font-light text-[#EEEEF0] tracking-tight leading-none">
                  EXPERT <span className="font-bold italic text-[#EF4444]">QUALIFICATIONS</span>
                </h3>
                
                <p className="text-[#EEEEF0]/70 text-xs sm:text-sm leading-relaxed max-w-sm">
                  Our coaches and personal trainers aren't just weightlifting enthusiasts; they are highly certified performance specialists with years of competitive sports backgrounds.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0B0B0C]/90 border border-white/10 backdrop-blur-sm rounded-sm text-left">
                    <span className="text-[#EF4444] font-sans text-xs font-bold block">NASM</span>
                    <span className="text-[9px] uppercase tracking-wider text-[#EEEEF0]/60">CERTIFIED PES SPECIALIST</span>
                  </div>
                  
                  <div className="p-4 bg-[#0B0B0C]/90 border border-white/10 backdrop-blur-sm rounded-sm text-left">
                    <span className="text-[#EF4444] font-sans text-xs font-bold block">ACE</span>
                    <span className="text-[9px] uppercase tracking-wider text-[#EEEEF0]/60">PERFORMANCE INSPIRED</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Footer Area */}
      <footer className="bg-[#121215] border-t border-white/10 w-full py-16 px-5 md:px-20 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto text-left">
          
          {/* Col 1: Brand & Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                alt="in.fit GYM Logo" 
                className="h-10 w-10 p-0.5 border border-white/20 rounded-full" 
                src="/logo.jpg" 
              />
              <span className="font-display text-xl font-bold italic text-[#EEEEF0] tracking-tight">
                in.fit <span className="font-sans text-xs font-light tracking-[0.1em] uppercase opacity-70">GYM</span>
              </span>
            </div>
            
            <p className="text-[#EEEEF0]/60 text-xs leading-relaxed font-sans font-medium">
              Annojiguda, Hyderabad.<br />
              NTPC X Road.
            </p>

            <div className="flex gap-2.5 pt-1">
              <a 
                href="https://www.instagram.com/infit_gym/" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Connect on Instagram"
                className="w-10 h-10 border border-white/10 bg-[#0B0B0C] text-[#EEEEF0]/70 hover:border-[#EF4444] hover:text-[#EF4444] transition-all flex items-center justify-center rounded-sm"
              >
                <i className="fab fa-instagram text-sm"></i>
              </a>
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=in.fit+GYM+Annojiguda+Hyderabad" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Google Maps Location Listing"
                className="w-10 h-10 border border-white/10 bg-[#0B0B0C] text-[#EEEEF0]/70 hover:border-[#EF4444] hover:text-[#EF4444] transition-all flex items-center justify-center rounded-sm"
              >
                <i className="fas fa-map-marker-alt text-sm"></i>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation links */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#EEEEF0] border-b border-white/5 pb-1.5">
              NAVIGATION
            </h4>
            <ul className="space-y-3.5 text-xs text-[#EEEEF0]/80 font-semibold tracking-wide uppercase">
              <li>
                <button 
                  onClick={() => scrollToRef(packagesRef)}
                  className="hover:text-[#EF4444] hover:line-through transition-colors cursor-pointer text-left"
                >
                  Packages
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setLegalDocType("waiver")}
                  className="hover:text-[#EF4444] hover:line-through transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setLegalDocType("waiver")}
                  className="hover:text-[#EF4444] hover:line-through transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Admin */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#EEEEF0] border-b border-white/5 pb-1.5">
              LEGAL & ADMIN
            </h4>
            <ul className="space-y-3.5 text-xs text-[#EEEEF0]/80 font-semibold tracking-wide uppercase">
              {loggedInUser?.role === "ADMIN" && (
                <li>
                  <button 
                    onClick={() => setIsAdminCmsOpen(true)} 
                    className="hover:text-[#EF4444] hover:line-through flex items-center gap-1.5 cursor-pointer text-[#EF4444] font-black outline-none"
                  >
                    <Settings className="w-3.5 h-3.5 animate-spin" /> CMS Admin Portal
                  </button>
                </li>
              )}
              <li>
                <button 
                  onClick={() => setLegalDocType("parq")} 
                  className="hover:text-[#EF4444] hover:line-through flex items-center gap-1.5 cursor-pointer text-left"
                >
                  PAR-Q Form
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setLegalDocType("contract")} 
                  className="hover:text-[#EF4444] hover:line-through flex items-center gap-1.5 cursor-pointer text-left"
                >
                  PT Contract
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setLegalDocType("waiver")} 
                  className="hover:text-[#EF4444] hover:line-through flex items-center gap-1.5 cursor-pointer text-left"
                >
                  Trial Waiver
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Support links */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#EEEEF0] border-b border-white/5 pb-1.5">
              SUPPORT
            </h4>
            <ul className="space-y-3.5 text-xs">
              <li>
                <a 
                  href="tel:9966683776" 
                  className="text-[#EF4444] hover:text-[#EEEEF0] font-sans font-bold flex items-center gap-1.5 uppercase tracking-wider text-[12px]"
                >
                  99666 83776
                </a>
              </li>
              <li>
                <a 
                  href="tel:8309134004" 
                  className="text-[#06B6D4] hover:text-[#EEEEF0] font-sans font-bold flex items-center gap-1.5 uppercase tracking-wider text-[12px]"
                >
                  83091 34004
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Brand Copyright */}
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 text-center text-xs text-[#EEEEF0]/40 font-medium">
          <p>© {new Date().getFullYear()} in.fit GYM. All Rights Reserved. Engineered for Performance.</p>
        </div>
      </footer>

      {/* Floating Action Button */}
      {loggedInUser?.role !== "ADMIN" && (
        <div className="fixed bottom-8 right-8 z-30 flex flex-col items-end gap-3 font-sans">
          
          {/* Prompt banner */}
          {!isChatbotOpen && (
            <div className="bg-[#1A1A1E] border border-white/10 text-white py-1.5 px-3.5 rounded-sm text-[9px] font-bold uppercase tracking-[0.15em] shadow-[0_5px_20px_rgba(0,0,0,0.15)] flex items-center gap-1.5 select-none font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping" />
              Find your best plan!
            </div>
          )}

          <button 
            onClick={() => setIsChatbotOpen(!isChatbotOpen)}
            className="bg-[#EF4444] hover:bg-black text-white p-4 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center hover:scale-105"
            title="Open Athlete Companion Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* MODALS OVERLAY PORTAL */}

      {/* 1. Membership Registration */}
      <RegistrationModal 
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        selectedPlan={selectedPlanForReg}
        allPlans={plans}
        onComplete={handleEnrollComplete}
      />

      {/* 2. Group Class Scheduler */}
      <ClassesScheduler 
        isOpen={isClassesOpen}
        onClose={() => setIsClassesOpen(false)}
        memberName={currentUser?.fullName || ""}
        memberEmail={currentUser?.email || ""}
        onTriggerSignUp={handleTriggerSignUp}
      />

      {/* 3. Book PT */}
      <BookPTModal 
        isOpen={isPtOpen}
        onClose={() => setIsPtOpen(false)}
        memberName={currentUser?.fullName || ""}
        memberEmail={currentUser?.email || ""}
        onTriggerSignUp={handleTriggerSignUp}
      />

      {/* 4. Footer Legal */}
      <LegalConsentModal 
        isOpen={legalDocType !== null}
        onClose={() => setLegalDocType(null)}
        documentType={legalDocType}
      />

      {/* 5. Photographic slideshow */}
      <VisualGallery 
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      {/* 6. Coach assistant chat */}
      <AthleteChatbot 
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        gymContext={{ pageContent, plans, classesList, trainersList }}
      />

      {/* 7. Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 8. Admin CMS Modal */}
      <AdminCMSModal 
        isOpen={isAdminCmsOpen}
        onClose={() => setIsAdminCmsOpen(false)}
        onContentUpdated={reloadCmsContent}
        isAdminLoggedIn={loggedInUser?.role === "ADMIN"}
      />

    </div>
  );
}
