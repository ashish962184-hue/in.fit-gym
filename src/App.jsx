import { useState, useEffect, useRef } from "react";
import { DEFAULT_PAGE_CONTENT } from "./cmsDefaults";
import { supabase } from "./supabaseClient";
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
  Settings,
  AlertCircle
} from "lucide-react";
import Navbar from "./components/Navbar";
import RegistrationModal from "./components/RegistrationModal";
import ClassesScheduler from "./components/ClassesScheduler";
import BookPTModal from "./components/BookPTModal";
import LegalConsentModal from "./components/LegalConsentModal";
import VisualGallery from "./components/VisualGallery";
import AthleteChatbot from "./components/AthleteChatbot";
import UserComments from "./components/UserComments";


export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isRenewing, setIsRenewing] = useState(false);

  // Dynamic user auth sessions 
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminCmsOpen, setIsAdminCmsOpen] = useState(false);

  // Dynamic live CMS parameters loaded from Supabase
  const [pageContent, setPageContent] = useState(DEFAULT_PAGE_CONTENT);
  const [plans, setPlans] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [trainersList, setTrainersList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [galleryList, setGalleryList] = useState([]);
  const [testimonialsList, setTestimonialsList] = useState([]);

  // Modal States
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [selectedPlanForReg, setSelectedPlanForReg] = useState(null);
  const [isClassesOpen, setIsClassesOpen] = useState(false);
  const [isPtOpen, setIsPtOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  
  // Footer Legal States
  const [legalDocType, setLegalDocType] = useState(null);

  // References for Smooth Scrolling
  const facilityRef = useRef(null);
  const packagesRef = useRef(null);
  const communityRef = useRef(null);

  // Member Profile self-management states
  const [profilePhone, setProfilePhone] = useState("");
  const [profileEmergency, setProfileEmergency] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileGoal, setProfileGoal] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState("");

  useEffect(() => {
    if (currentUser) {
      setProfilePhone(currentUser.phone || "");
      setProfileEmergency(currentUser.emergencyContact || "");
      setProfileAvatar(currentUser.avatarUrl || "");
      setProfileGoal(currentUser.fitnessGoal || "General Fitness");
    }
  }, [currentUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaveSuccess("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user session.");

      // Upsert profiles table
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          phone: profilePhone,
          avatar_url: profileAvatar,
          emergency_contact: profileEmergency,
          fitness_goal: profileGoal,
          updated_at: new Date().toISOString()
         });

      if (error) throw error;
      
      setProfileSaveSuccess("Profile details updated successfully!");
      // Trigger sync
      syncSupabaseProfile(user);
      setTimeout(() => setProfileSaveSuccess(""), 3000);
      setIsEditingProfile(false);
    } catch (err) {
      alert("Failed to save profile: " + err.message);
    }
  };

  // Fetch all Website Settings and Core listings from Supabase tables
  const fetchGlobalCMSData = async () => {
    try {
      // 1. Fetch website_settings — map DB keys → UI state keys
      const { data: settings } = await supabase
        .from("website_settings")
        .select("*");

      let mergedContent = { ...DEFAULT_PAGE_CONTENT };
      if (settings && settings.length > 0) {
        settings.forEach((s) => {
          if (s.key === "hero") {
            const h = s.value;
            mergedContent = {
              ...mergedContent,
              heroTagline:          h.tagline          ?? mergedContent.heroTagline,
              heroHeadingLine1:     h.heading1         ?? mergedContent.heroHeadingLine1,
              heroHeadingHighlight: h.highlight        ?? mergedContent.heroHeadingHighlight,
              heroHeadingLine2:     h.heading2         ?? mergedContent.heroHeadingLine2,
              heroHeadingHighlight2:h.highlight2       ?? mergedContent.heroHeadingHighlight2,
              heroDescription:      h.description      ?? mergedContent.heroDescription,
              heroBgUrl:            h.bgImageUrl       ?? mergedContent.heroBgUrl,
              heroCtaText:          h.ctaText          ?? mergedContent.heroCtaText,
              heroCtaLink:          h.ctaLink          ?? mergedContent.heroCtaLink,
              heroMemberCount:      h.memberCount      ?? mergedContent.heroMemberCount,
              heroTrainerCount:     h.trainerCount     ?? mergedContent.heroTrainerCount,
              heroYearsExperience:  h.yearsExperience  ?? mergedContent.heroYearsExperience,
              heroSatisfaction:     h.satisfaction     ?? mergedContent.heroSatisfaction,
            };
          }
          if (s.key === "about") {
            const a = s.value;
            mergedContent = {
              ...mergedContent,
              aboutTitle:       a.title       ?? mergedContent.aboutTitle,
              aboutDescription: a.description ?? mergedContent.aboutDescription,
              aboutMission:     a.mission     ?? mergedContent.aboutMission,
              aboutVision:      a.vision      ?? mergedContent.aboutVision,
              aboutImages:      a.images      ?? mergedContent.aboutImages,
            };
          }
          if (s.key === "contact") {
            const c = s.value;
            mergedContent = {
              ...mergedContent,
              contactPhone1:    c.phone1    ?? mergedContent.contactPhone1,
              contactPhone2:    c.phone2    ?? mergedContent.contactPhone2,
              contactWhatsapp:  c.whatsapp  ?? mergedContent.contactWhatsapp,
              contactEmail:     c.email     ?? mergedContent.contactEmail,
              contactAddress:   c.address   ?? mergedContent.contactAddress,
              contactMapUrl:    c.mapUrl    ?? mergedContent.contactMapUrl,
              contactHours:     c.hours     ?? mergedContent.contactHours,
              contactEmergency: c.emergency ?? mergedContent.contactEmergency,
            };
          }
          if (s.key === "social") {
            const soc = s.value;
            mergedContent = {
              ...mergedContent,
              socialInstagram: soc.instagram ?? mergedContent.socialInstagram,
              socialFacebook:  soc.facebook  ?? mergedContent.socialFacebook,
              socialYoutube:   soc.youtube   ?? mergedContent.socialYoutube,
              socialLinkedin:  soc.linkedin  ?? mergedContent.socialLinkedin,
            };
          }
          if (s.key === "seo") {
            const seo = s.value;
            mergedContent = {
              ...mergedContent,
              seoMetaTitle:          seo.metaTitle          ?? mergedContent.seoMetaTitle,
              seoMetaDescription:    seo.metaDescription    ?? mergedContent.seoMetaDescription,
              seoKeywords:           seo.keywords           ?? mergedContent.seoKeywords,
              seoOgImage:            seo.ogImage            ?? mergedContent.seoOgImage,
              seoGoogleAnalyticsId:  seo.googleAnalyticsId  ?? mergedContent.seoGoogleAnalyticsId,
            };
          }
        });
      }
      setPageContent(mergedContent);

      // 2. Fetch membership plans
      const { data: plansData } = await supabase
        .from("membership_plans")
        .select("*")
        .eq("is_enabled", true)
        .order("price", { ascending: true });
      
      if (plansData && plansData.length > 0) {
        setPlans(plansData.map(p => ({
          id: p.plan_id,
          name: p.name,
          category: p.category,
          price: Number(p.price),
          period: p.period,
          features: p.features,
          disabledFeatures: p.disabled_features,
          mostPopular: p.most_popular
        })));
      } else {
        setPlans([]);
      }

      // 3. Fetch services
      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("is_enabled", true)
        .order("created_at", { ascending: true });
      
      if (servicesData && servicesData.length > 0) {
        setServicesList(servicesData);
      } else {
        setServicesList([
          { id: "s1", name: "Strength Training", description: "Unleash absolute raw power on our dedicated biomechanic plates floor, complete with barbell deadlifting racks and professional cages.", image_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=60", category: "Strength", schedule: "Mon–Sat: 6:00 AM – 9:00 PM", features: "Power Cages & Barbells,Plate-Loaded Machines,Real Leader USA Equipment,Deadlift Platforms,Trainer Guidance Available" },
          { id: "s2", name: "Cardio Training", description: "Improve metabolic output and stamina on our high-performance temperature-regulated treadmill cardio suites.", image_url: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&auto=format&fit=crop&q=60", category: "Conditioning", schedule: "Mon–Sat: 5:00 AM – 10:00 PM", features: "Commercial Treadmills,Elliptical Machines,Stationary Bikes,Air-Conditioned Floor,Heart Rate Monitoring" },
          { id: "s3", name: "Functional Training", description: "Dynamic cross-functional circuits targeting joint stability, kinetic balance, and high anaerobic recovery.", image_url: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&auto=format&fit=crop&q=60", category: "Functional", schedule: "Mon–Sat: 7:00 AM – 8:00 PM", features: "Kettlebells & Battle Ropes,TRX Suspension Training,Medicine Balls,Agility Ladders,Group or Solo Sessions" },
          { id: "s4", name: "Personal Training", description: "One-on-one biometric masterclasses with certified elite coaches focused entirely on your lifting form.", image_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=60", category: "Coaching", schedule: "By Appointment — 7 Days", features: "1-on-1 Certified Coach,Custom Workout Plan,Nutritional Guidance,Progress Tracking,Form Correction & Safety" },
          { id: "s5", name: "Zumba Class", description: "High-energy dance fitness sessions designed to burn fat, build endurance, and boost your cardiovascular health.", image_url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=60", category: "Aerobics", schedule: "Tue & Thu: 6:30 PM – 7:30 PM", features: "Expert Zumba Instructor,Group Class Format,High-Energy Music,Calorie Burning Dance Moves,All Fitness Levels Welcome" },
          { id: "s6", name: "HIIT Workout", description: "High-Intensity Interval Training classes featuring kettlebells, slam balls, and battling ropes for maximum athletic output.", image_url: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&auto=format&fit=crop&q=60", category: "Conditioning", schedule: "Mon/Wed/Fri: 7:00 AM & 6:00 PM", features: "Interval Timer Training,Kettlebell Circuits,Battle Rope Slams,Group Energy Atmosphere,Measurable Performance" },
          { id: "s7", name: "Yoga & Flexibility", description: "Develop mobility, core stability, and targeted flexibility to complement your heavy lifting routines.", image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=60", category: "Flexibility", schedule: "Mon & Wed: 8:00 AM – 9:00 AM", features: "Certified Yoga Instructor,Yoga Mats & Props Provided,Breathing Techniques,Stretch & Mobility Work,Stress Reduction" },
          { id: "s8", name: "Weight Loss Program", description: "Scientifically structured exercise and dietary pathways targeting steady, healthy body composition improvements.", image_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&auto=format&fit=crop&q=60", category: "Weight Loss", schedule: "Custom Schedule with Coach", features: "Diet & Calorie Planning,Cardio + Strength Mix,Weekly Progress Check-in,Body Composition Tracking,Expert Accountability" },
          { id: "s9", name: "Muscle Building Program", description: "Heavy compound hypertrophic programming and macro structures curated to maximize lean skeletal mass accretion.", image_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=60", category: "Hypertrophy", schedule: "Custom Schedule with Coach", features: "Progressive Overload Plans,Compound Lift Focus,Macro Nutrition Blueprint,Supplement Guidance,Monthly Strength Tests" }
        ]);
      }

      // 4. Fetch trainers
      const { data: trainersData } = await supabase
        .from("trainers")
        .select("*")
        .order("created_at", { ascending: true });
      
      if (trainersData && trainersData.length > 0) {
        setTrainersList(trainersData.map(t => ({
          id: t.id,
          name: t.name,
          specialty: t.specialization,
          experience: t.experience,
          certifications: t.certificates,
          image: t.photo_url,
          instagram: t.instagram,
          facebook: t.facebook
        })));
      } else {
        setTrainersList([]);
      }

      // 5. Fetch gallery
      const { data: galleryData } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: true });
      
      if (galleryData && galleryData.length > 0) {
        setGalleryList(galleryData.map(g => ({
          id: g.id,
          title: g.title,
          description: g.description,
          category: g.category,
          image: g.photo_url
        })));
      } else {
        setGalleryList([]);
      }

      // 6. Fetch testimonials
      const { data: testimonialsData } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: true });
      
      if (testimonialsData && testimonialsData.length > 0) {
        setTestimonialsList(testimonialsData);
      } else {
        setTestimonialsList([
          { id: "t1", member_name: "Vikram Reddy", rating: 5, review_text: "Best compound lifting cages in Hyderabad. The deadlifting platforms are world-class and always maintained properly. Highly recommend for serious powerlifters.", category: "Strength Training" },
          { id: "t2", member_name: "Anjali Sharma", rating: 4, review_text: "Elite atmosphere with excellent ventilation. The high-performance treadmills keep up with intensive sprinting series. Extremely clean lockers as well!", category: "Cardio Suite" },
          { id: "t3", member_name: "Karthik Rao", rating: 5, review_text: "Unlocking massive strength milestones here. Sandeep’s customized coaching on form checks and periodization completely level-up your training protocol.", category: "Personal Training" }
        ]);
      }

      // 7. Classes list — no DB fallback (managed via Admin CMS)
    } catch (err) {
      console.error("CMS central database sync failure:", err.message);
    }
  };

  // Synchronize dynamic profiles from Supabase based on current authenticated session
  const syncSupabaseProfile = async (sessionUser) => {
    if (!sessionUser) {
      setLoggedInUser(null);
      setCurrentUser(null);
      return;
    }

    try {
      // 1. Fetch user role details (with robust fallback)
      let profile = {
        email: sessionUser.email,
        full_name: sessionUser.user_metadata?.full_name || "Gym Member",
        phone: sessionUser.user_metadata?.phone || "Not provided",
        role: sessionUser.user_metadata?.role || "MEMBER",
        created_at: sessionUser.created_at
      };

      const { data: dbProfile, error: profileErr } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionUser.id)
        .single();

      if (!profileErr && dbProfile) {
        profile = dbProfile;
      } else if (profileErr) {
        console.warn("Could not fetch db profile, falling back to session metadata:", profileErr.message);
      }

      setLoggedInUser({
        email: profile.email,
        fullName: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        joinedDate: new Date(profile.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
      });

      // 2. Fetch requests, active memberships, and athlete cards if standard user
      if (profile.role === "ADMIN") {
        setCurrentUser({
          email: profile.email,
          fullName: profile.full_name,
          phone: profile.phone,
          role: profile.role,
          joinedDate: new Date(profile.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
        });
      } else if (profile.role === "MEMBER") {
        const { data: requests } = await supabase
          .from("membership_requests")
          .select("*")
          .eq("user_id", sessionUser.id)
          .order("created_at", { ascending: false });

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

        const { data: profileMeta } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .single();

        const activeRequest = requests && requests.length > 0 ? requests[0] : null;

        let calculatedStatus = "NONE";
        let daysRemaining = 0;
        let expiryWarning = null; // 'WARNING' (7-day notice) | 'URGENT' (3-day notice)

        if (membership) {
          const today = new Date();
          const expiry = new Date(membership.expiry_date);
          const diffMs = expiry - today;
          daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          if (daysRemaining <= 0 || !membership.is_active) {
            calculatedStatus = "EXPIRED";
          } else {
            calculatedStatus = "ACTIVE";
            if (daysRemaining <= 3) {
              expiryWarning = "URGENT";
            } else if (daysRemaining <= 7) {
              expiryWarning = "WARNING";
            }
          }
        } else if (activeRequest) {
          calculatedStatus = activeRequest.status;
        }

        const activeMemberProfile = {
          fullName: profile.full_name,
          email: profile.email,
          phone: profileMeta?.phone || profile.phone,
          avatarUrl: profileMeta?.avatar_url || null,
          emergencyContact: profileMeta?.emergency_contact || "",
          fitnessGoal: profileMeta?.fitness_goal || (activeRequest ? activeRequest.fitness_goal : "General Fitness"),
          selectedPlanId: activeRequest ? activeRequest.selected_plan : (membership ? membership.plan_name : "3-months"),
          price: activeRequest ? activeRequest.plan_price : (membership ? membership.plan_price : 3499),
          parqAnswers: {
            heartCondition: false, chestPain: false, dizziness: false,
            boneJoint: false, bloodPressureDrugs: false, otherReason: false
          },
          signedWaiver: true,
          signatureName: profile.full_name,
          memberId: card ? card.card_number : (activeRequest ? activeRequest.id : "REQ-PENDING"),
          joinedDate: membership ? new Date(membership.start_date).toLocaleDateString("en-IN") : (activeRequest ? new Date(activeRequest.created_at).toLocaleDateString("en-IN") : "PENDING"),
          status: calculatedStatus,
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
          expiryWarning,
          membershipDetails: membership ? {
            planName: membership.plan_name,
            startDate: new Date(membership.start_date).toLocaleDateString("en-IN"),
            expiryDate: new Date(membership.expiry_date).toLocaleDateString("en-IN"),
            isActive: membership.is_active
          } : null,
          requestHistory: requests || []
        };

        setCurrentUser(activeMemberProfile);
      }
    } catch (err) {
      console.error("Profile synchronization error:", err.message);
    }
  };

  // Sync profile details on start and hook session state listeners
  useEffect(() => {
    fetchGlobalCMSData();

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
    fetchGlobalCMSData();
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
    <div className="min-h-screen bg-[#000000] text-[#EEEEF0] overflow-x-hidden selection:bg-[#E50914] selection:text-white font-sans pt-20">
      
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
        className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-black"
        style={{
          backgroundImage: `url('/hero-bg3.png')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Gradients for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent pointer-events-none" style={{zIndex:1}} />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent pointer-events-none" style={{zIndex:2}} />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" style={{zIndex:2}} />

        {/* Main Content — text on left side */}
        <div className="relative flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 pt-32 pb-10" style={{zIndex:3}}>
          <div className="max-w-[40%] min-w-[300px] flex flex-col gap-6 text-left">
            
            {/* Small overline tag */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-[3px] bg-[#E50914]" />
              <span className="text-[#E50914] font-sans text-[11px] font-black uppercase tracking-[0.3em]">
                2 FLOORS A/C GYM
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-display text-[4.5rem] sm:text-[6rem] md:text-[8rem] text-white font-black leading-[0.85] uppercase tracking-tight">
              TRAIN HARD.
              <br />
              <span className="text-[#E50914]">
                TRANSFORM FASTER.
              </span>
            </h1>

            <h3 className="text-white font-sans text-xs sm:text-sm font-bold uppercase tracking-[0.2em]">
              Strength • Cardio • Functional Training
            </h3>

            {/* Description */}
            <p className="text-zinc-300 text-sm font-sans font-medium leading-relaxed max-w-sm">
              Professional equipment and expert trainers built for real transformation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4 font-sans">
              <button 
                onClick={() => scrollToRef(packagesRef)}
                className="bg-[#E50914] hover:bg-white text-white hover:text-black font-sans text-[11px] tracking-[0.2em] font-black px-8 py-4 uppercase transition-all cursor-pointer text-center"
              >
                JOIN NOW
              </button>
              
              <button 
                onClick={() => scrollToRef(packagesRef)}
                className="border-2 border-white/30 hover:border-white text-white hover:bg-white/5 font-sans text-[11px] tracking-[0.2em] font-black px-8 py-4 uppercase transition-all cursor-pointer text-center"
              >
                VIEW MEMBERSHIP
              </button>
              
              <button 
                onClick={() => window.open('https://wa.me/911234567890', '_blank')}
                className="border-2 border-green-500/50 hover:border-green-500 text-green-400 hover:bg-green-500/10 font-sans text-[11px] tracking-[0.2em] font-black px-8 py-4 uppercase transition-all cursor-pointer text-center"
              >
                WHATSAPP
              </button>

              {loggedInUser?.role === "ADMIN" && (
                <button 
                  onClick={() => setIsAdminCmsOpen(true)}
                  className="border-2 border-[#E50914]/50 hover:border-[#E50914] text-[#E50914] hover:bg-[#E50914]/10 font-sans text-[11px] tracking-[0.2em] font-black px-8 py-4 uppercase transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5" /> ADMIN CMS
                </button>
              )}
            </div>

          </div>
        </div>

        <div className="relative w-full flex flex-col" style={{zIndex:3}}>
          {/* Membership Quick Strip */}
          <div className="w-full bg-black/80 backdrop-blur-md border-t border-white/10 overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-start md:justify-center gap-8 px-6 py-4 min-w-max">
              <div className="flex flex-col text-center">
                <span className="text-zinc-500 text-[9px] font-bold tracking-[0.2em] uppercase">Student</span>
                <span className="text-white font-display text-xl tracking-wide">₹1299</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col text-center">
                <span className="text-zinc-500 text-[9px] font-bold tracking-[0.2em] uppercase">1 Month</span>
                <span className="text-white font-display text-xl tracking-wide">₹1499</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col text-center relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E50914] text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm tracking-widest uppercase">Popular</span>
                <span className="text-[#E50914] text-[9px] font-bold tracking-[0.2em] uppercase pt-1">3 Months</span>
                <span className="text-white font-display text-xl tracking-wide">₹3499</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col text-center">
                <span className="text-zinc-500 text-[9px] font-bold tracking-[0.2em] uppercase">6 Months</span>
                <span className="text-white font-display text-xl tracking-wide">₹6499</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col text-center relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[7px] font-black px-1.5 py-0.5 rounded-sm tracking-widest uppercase whitespace-nowrap">Best Value</span>
                <span className="text-yellow-500 text-[9px] font-bold tracking-[0.2em] uppercase pt-1">12 Months</span>
                <span className="text-white font-display text-xl tracking-wide">₹10999</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col text-center">
                <span className="text-zinc-500 text-[9px] font-bold tracking-[0.2em] uppercase">Couple</span>
                <span className="text-white font-display text-xl tracking-wide">₹5999</span>
              </div>
            </div>
          </div>

          {/* Stats Bar at the bottom */}
          <div className="w-full bg-black border-t-2 border-[#E50914]">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-20 py-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
              {[
                { value: `${pageContent.heroMemberCount || 700}+`, label: "Members" },
                { value: `${pageContent.heroTrainerCount || 10}+`, label: "Trainers" },
                { value: `${pageContent.heroYearsExperience || 5}+`, label: "Years" },
                { value: `${pageContent.heroSatisfaction || 95}%`, label: "Satisfaction" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1 py-2">
                  <span className="font-display text-3xl sm:text-4xl text-[#E50914] font-black leading-none tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.2em] font-sans">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>


      {/* Bento Core Features / "Facility Highlights" */}
      <section 
        id="facility" 
        ref={facilityRef}
        className="py-24 px-5 md:px-20 max-w-7xl mx-auto scroll-mt-10"
      >
        <div className="flex justify-between items-end mb-16 border-b border-white/10 pb-4">
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter uppercase">
            FACILITY <span className="text-[#E50914] italic">HIGHLIGHTS</span>
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
              <h3 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase">
                REAL LEADER USA <span className="text-[#E50914] italic">EQUIPMENT</span>
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
            <h3 className="font-display text-xl sm:text-2xl font-black text-white tracking-tighter uppercase mb-2">
              AC <span className="text-[#E50914] italic">FACILITY</span>
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
              <h3 className="font-display text-xl sm:text-2xl font-black text-white tracking-tighter uppercase">
                HIGH-QUALITY <span className="text-[#E50914] italic">TRAINING</span>
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
              <h3 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase">
                LOCATION: NTPC <span className="text-[#E50914] italic">X ROAD</span>
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
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter mb-2 uppercase">
                OUR <span className="text-[#E50914]">SERVICES</span>
              </h2>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                Specialized athletic programs and tools for every fitness milestone.
              </p>
            </div>
          </div>

          {/* Dynamic Services Cards Deck */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesList.map((service, index) => (
              <div 
                key={service.id || index}
                onClick={() => setSelectedService(service)}
                className="group bg-[#121215] border border-white/5 hover:border-[#EF4444]/40 transition-all relative overflow-hidden text-left rounded-sm min-h-[350px] flex flex-col justify-between shadow-sm hover:shadow-lg duration-300 cursor-pointer"
              >
                {/* Image Background Header with Dark Gradient Overlay */}
                <div className="h-44 w-full overflow-hidden relative">
                  <img 
                    src={service.image_url} 
                    alt={service.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter grayscale group-hover:grayscale-0" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-[#121215]/30 to-transparent" />
                  {/* Floating Red Accent Strip */}
                  <div className="absolute top-0 left-0 w-[3px] h-0 bg-[#EF4444] group-hover:h-full transition-all duration-300" />
                  {/* View Details hint on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-[#E50914] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5">VIEW DETAILS</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[#EF4444] font-mono text-[9px] font-bold uppercase tracking-[0.2em]">
                      {service.category || "TRAINING"} PROGRAM
                    </span>
                    <h4 className="font-sans font-black text-lg uppercase tracking-tight text-white">
                      {service.name}
                    </h4>
                    <p className="text-[#EEEEF0]/70 text-xs leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <div className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-[#EF4444] flex items-center gap-1.5 mt-2">
                    VIEW DETAILS <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
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
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter uppercase">
              ELITE <span className="text-[#E50914]">MEMBERSHIPS</span>
            </h2>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
              Flexible structured plans designed for athletic consistency and verifiable strength results. Find the perfect package tier for your physical journey.
            </p>
          </div>

          {/* Pricing Grid or Membership Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-2">
            {currentUser && currentUser.status === "PENDING" && !isRenewing ? (
              <div className="col-span-1 md:col-span-3 bg-[#121215] border border-amber-500/30 p-10 sm:p-14 rounded-sm text-center space-y-6 max-w-2xl mx-auto shadow-xl">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto animate-pulse">
                  <span className="text-amber-500 font-sans text-2xl font-black">!</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                    Membership Request <span className="text-amber-500">Pending</span>
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
                  <h3 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                    Inquiry <span className="text-blue-400">Contacted</span>
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
                  <h3 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                    Membership <span className="text-emerald-400">Approved</span>
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
                    Please complete payment or gym verification to activate your membership.
                  </p>
                </div>
              </div>
            ) : currentUser && currentUser.status === "ACTIVE" && !isRenewing ? (
              <div className="col-span-1 md:col-span-3 bg-[#121215] border-2 border-[#EF4444] p-6 sm:p-10 rounded-sm max-w-3xl mx-auto shadow-2xl relative overflow-hidden text-left space-y-6 w-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#EF4444]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="border-b border-white/10 pb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[#EF4444] font-sans text-[10px] font-bold uppercase tracking-[0.25em] block mb-1">
                      ATHLETE CONTROL PORTAL
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                      Current <span className="text-[#E50914]">Membership</span>
                    </h3>
                  </div>
                  <span className="bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm">
                    ● Active
                  </span>
                </div>

                {/* Expiry Alert Warning Banners */}
                {currentUser.expiryWarning && (
                  <div className={`p-4 rounded-sm border flex items-start gap-3.5 animate-pulse ${
                    currentUser.expiryWarning === "URGENT" 
                      ? "bg-red-950/45 border-red-500 text-red-400" 
                      : "bg-amber-950/45 border-amber-500 text-amber-400"
                  }`}>
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-left">
                      <span className="font-bold uppercase tracking-widest text-[9px] block">
                        {currentUser.expiryWarning === "URGENT" ? "🚨 Urgent Renewal Notice" : "⚠️ Membership Expiring Soon"}
                      </span>
                      <p className="text-[11px] font-sans leading-relaxed mt-0.5">
                        Your membership expires in <strong className="font-mono text-xs">{currentUser.daysRemaining} days</strong>. 
                        {currentUser.expiryWarning === "URGENT" 
                          ? " Please renew immediately to avoid lockouts and keep your active digital passcard open."
                          : " Keep up your training momentum! Renew today to stay consistent."
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Athlete Identity Row */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-[#0B0B0C] border border-white/5 rounded-sm">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-white/10 bg-[#121215] flex-shrink-0 flex items-center justify-center">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#E50914] font-sans text-lg font-black uppercase">
                        {currentUser.fullName ? currentUser.fullName.split(" ").map(n => n[0]).join("") : "FIT"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <span className="text-[9px] text-[#EF4444] font-mono uppercase tracking-[0.2em] font-bold block">REGISTERED ATHLETE</span>
                    <h4 className="font-sans font-black text-lg text-white uppercase tracking-tight leading-none">{currentUser.fullName}</h4>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Phone: <span className="font-mono text-zinc-200">{currentUser.phone || "Not Set"}</span> | Emergency: <span className="font-mono text-zinc-200">{currentUser.emergencyContact || "Not Set"}</span>
                    </p>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Performance Goal: <span className="text-[#EF4444] font-semibold">{currentUser.fitnessGoal}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsEditingProfile(!isEditingProfile);
                      setProfilePhone(currentUser.phone || "");
                      setProfileEmergency(currentUser.emergencyContact || "");
                      setProfileAvatar(currentUser.avatarUrl || "");
                      setProfileGoal(currentUser.fitnessGoal || "General Fitness");
                      setProfileSaveSuccess("");
                    }}
                    className="w-full sm:w-auto border border-white/15 hover:border-[#EF4444] hover:text-[#EF4444] text-zinc-300 text-[9px] tracking-wider font-bold uppercase py-2 px-4 rounded-sm transition-all"
                  >
                    {isEditingProfile ? "Cancel" : "Edit Profile"}
                  </button>
                </div>

                {/* Profile Edit Form */}
                {isEditingProfile && (
                  <form onSubmit={handleSaveProfile} className="space-y-4 p-5 bg-[#0B0B0C] border border-white/10 rounded-sm font-sans text-xs">
                    <span className="text-[10px] text-[#EF4444] font-bold uppercase tracking-widest block border-b border-white/5 pb-1">Update Personal Metrics</span>
                    
                    {profileSaveSuccess && (
                      <div className="p-2.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 rounded-sm mb-3">
                        {profileSaveSuccess}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-zinc-200/50 uppercase tracking-widest mb-1 font-sans">Profile Photo URL</label>
                        <input 
                          type="text" 
                          placeholder="e.g. https://images.unsplash.com/..." 
                          value={profileAvatar}
                          onChange={(e) => setProfileAvatar(e.target.value)}
                          className="w-full bg-[#121215] border border-white/15 focus:border-[#EF4444] rounded-sm p-2.5 text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-zinc-200/50 uppercase tracking-widest mb-1 font-sans">Mobile Phone *</label>
                        <input 
                          type="tel" 
                          required
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="w-full bg-[#121215] border border-white/15 focus:border-[#EF4444] rounded-sm p-2.5 text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-zinc-200/50 uppercase tracking-widest mb-1 font-sans">Emergency Contact *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Name & Number"
                          value={profileEmergency}
                          onChange={(e) => setProfileEmergency(e.target.value)}
                          className="w-full bg-[#121215] border border-white/15 focus:border-[#EF4444] rounded-sm p-2.5 text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-zinc-200/50 uppercase tracking-widest mb-1 font-sans">Fitness Goal Interest</label>
                        <select 
                          value={profileGoal}
                          onChange={(e) => setProfileGoal(e.target.value)}
                          className="w-full bg-[#121215] border border-white/15 focus:border-[#EF4444] rounded-sm p-2.5 text-white outline-none cursor-pointer font-sans"
                        >
                          <option value="General Fitness">General Fitness</option>
                          <option value="Muscle Building">Muscle Building</option>
                          <option value="Weight Loss">Weight Loss</option>
                          <option value="Powerlifting">Powerlifting</option>
                          <option value="Cardio Conditioning">Cardio Conditioning</option>
                          <option value="Functional Strength">Functional Strength</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button 
                        type="submit" 
                        className="bg-[#EF4444] hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase tracking-widest py-2 px-5 rounded-sm transition-all"
                      >
                        Save Info
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsEditingProfile(false)}
                        className="border border-white/20 text-white text-[9px] font-bold uppercase py-2 px-5 rounded-sm transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Membership Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
                  <div className="p-4 bg-[#0B0B0C] border border-white/5 rounded-sm">
                    <span className="text-zinc-400 uppercase tracking-wider text-[9px] font-bold block mb-1">PLAN NAME</span>
                    <span className="text-sm font-sans font-black text-white uppercase">{currentUser.membershipDetails?.planName || "Quarterly Pro"}</span>
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

                {/* Membership Requests History Logs */}
                {currentUser.requestHistory && currentUser.requestHistory.length > 0 && (
                  <div className="p-4 bg-[#0B0B0C] border border-white/5 rounded-sm font-sans text-xs space-y-2">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Requests History Logs ({currentUser.requestHistory.length})</span>
                    <div className="max-h-28 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                      {currentUser.requestHistory.map((req) => (
                        <div key={req.id} className="flex justify-between items-center py-1.5 border-b border-white/5 text-[10px]">
                          <div>
                            <span className="font-bold text-white uppercase">{req.selected_plan}</span>
                            <span className="text-zinc-500 font-mono block text-[8px] mt-0.5">Submitted: {new Date(req.created_at).toLocaleDateString("en-IN")}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-sm font-bold uppercase tracking-widest text-[8px] border ${
                            req.status === "APPROVED" ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-400" :
                            req.status === "CONTACTED" ? "bg-blue-600/10 border-blue-500/30 text-blue-400" :
                            req.status === "REJECTED" ? "bg-red-600/10 border-red-500/30 text-red-500" :
                            "bg-amber-600/10 border-amber-500/30 text-amber-400"
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => {
                      const viewBtn = document.getElementById("nav-view-pass-btn");
                      if (viewBtn) {
                        viewBtn.click();
                      } else {
                        alert("Click the 'VIEW ATHLETE CARD' button in the top navigation bar to open your digital pass card!");
                      }
                    }}
                    className="flex-1 bg-[#E50914] hover:bg-white text-white hover:text-black font-sans text-[10px] tracking-[0.25em] font-bold uppercase py-4 rounded-sm transition-all shadow-md cursor-pointer text-center"
                  >
                    VIEW ATHLETE CARD
                  </button>
                  <button 
                    onClick={() => setIsRenewing(true)}
                    className="flex-1 border-2 border-white/15 hover:border-white text-white hover:bg-white/5 font-sans text-[10px] tracking-[0.25em] font-bold uppercase py-4 rounded-sm transition-all cursor-pointer text-center"
                  >
                    RENEW MEMBERSHIP
                  </button>
                </div>
              </div>
            ) : currentUser && currentUser.status === "EXPIRED" && !isRenewing ? (
              <div className="col-span-1 md:col-span-3 bg-[#121215] border border-red-500/30 p-10 sm:p-14 rounded-sm text-center space-y-6 max-w-2xl mx-auto shadow-xl">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
                  <span className="text-red-500 font-bold font-sans text-2xl font-black">X</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                    Membership <span className="text-red-500">Expired</span>
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
              <>
                {isRenewing && (
                  <div className="col-span-1 md:col-span-3 bg-[#121215] border border-[#E50914]/40 p-6 rounded-sm flex flex-col sm:flex-row justify-between items-center gap-4 text-left font-sans mb-2 w-full">
                    <div>
                      <span className="text-[#E50914] text-[9px] font-bold uppercase tracking-[0.2em] block mb-1">
                        ACTIVE ATHLETE RENEWAL & UPGRADE
                      </span>
                      <h4 className="text-white text-xs font-bold uppercase">
                        Select any membership package below to extend your active pass card cycle.
                      </h4>
                    </div>
                    <button 
                      onClick={() => setIsRenewing(false)}
                      className="bg-transparent border border-white/20 hover:border-white text-white text-[9px] font-bold uppercase py-2.5 px-5 rounded-sm transition-all cursor-pointer whitespace-nowrap"
                    >
                      Cancel Renewal
                    </button>
                  </div>
                )}
                {plans.map((plan) => {
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
                      <h3 className="font-display text-2xl font-bold text-white uppercase tracking-tight mb-6">
                        {plan.name}
                      </h3>
                      
                      <div className="mb-8 flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-[#EEEEF0]">₹ {plan.price.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">/ {plan.period}</span>
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
              })}
            </>)}
          </div>

          {/* Prominent Logo-Branded strength cardio Features Banner */}
          <div className="mt-14 max-w-4xl mx-auto bg-[#121215] border-2 border-[#EF4444] rounded-sm p-8 relative overflow-hidden text-center shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#84CC16] via-[#06B6D4] to-[#EF4444]" />
            
            <div className="relative z-10 flex flex-col items-center gap-4">
              <span className="text-[10px] text-[#06B6D4] font-bold uppercase tracking-[0.3em] font-sans">
                in.fit gym priority level
              </span>
              
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white tracking-widest leading-none">
                INCLUDES <span className="text-[#EF4444]">STRENGTH</span> & <span className="text-white">CARDIO</span>
              </h3>
              
              <p className="text-zinc-400 text-xs max-w-xl mx-auto leading-relaxed font-sans font-bold uppercase tracking-wider">
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
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter uppercase">
                ATHLETE <span className="text-[#E50914]">TESTIMONIALS</span>
              </h2>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest text-left">
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
              <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed font-sans font-semibold uppercase tracking-wide">
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
                
                <h3 className="font-display text-2xl sm:text-3xl font-black text-white leading-none uppercase tracking-tight">
                  EXPERT <span className="text-[#E50914]">QUALIFICATIONS</span>
                </h3>
                
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-sm">
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
              <span className="font-display text-2xl font-black text-white uppercase tracking-tighter">
                in.fit <span className="font-sans text-xs font-bold tracking-[0.1em] uppercase opacity-80 text-[#E50914]">GYM</span>
              </span>
            </div>
            
            <p className="text-[#EEEEF0]/60 text-xs leading-relaxed font-sans font-medium">
              Annojiguda, Hyderabad.<br />
              NTPC X Road.
            </p>

            <div className="flex gap-2.5 pt-1">
              <a 
                href={pageContent.socialInstagram || "https://www.instagram.com/infit_gym/"}
                target="_blank" 
                rel="noopener noreferrer"
                title="Connect on Instagram"
                className="w-10 h-10 border border-white/10 bg-[#0B0B0C] text-[#EEEEF0]/70 hover:border-[#EF4444] hover:text-[#EF4444] transition-all flex items-center justify-center rounded-sm"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=in.fit+GYM+Annojiguda+Hyderabad" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Google Maps Location"
                className="w-10 h-10 border border-white/10 bg-[#0B0B0C] text-[#EEEEF0]/70 hover:border-[#EF4444] hover:text-[#EF4444] transition-all flex items-center justify-center rounded-sm"
              >
                <MapPin className="w-4 h-4" />
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
        galleryItems={galleryList}
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

      {/* ============================================================ */}
      {/* Service Detail Modal */}
      {/* ============================================================ */}
      {selectedService && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedService(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          
          {/* Modal Panel */}
          <div 
            className="relative z-10 bg-[#0B0B0C] border border-white/10 rounded-sm w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hero Image */}
            <div className="relative h-56 sm:h-72 overflow-hidden">
              <img 
                src={selectedService.image_url} 
                alt={selectedService.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-black/40 to-transparent" />
              {/* Close button */}
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 w-9 h-9 bg-black/70 border border-white/20 text-white hover:bg-[#E50914] hover:border-[#E50914] transition-all flex items-center justify-center rounded-sm font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
              {/* Category badge on image */}
              <div className="absolute bottom-4 left-6">
                <span className="bg-[#E50914] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5">
                  {selectedService.category || "TRAINING"} PROGRAM
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Title + Schedule */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <h2 className="font-display text-3xl sm:text-4xl text-white font-black uppercase tracking-tight">
                  {selectedService.name}
                </h2>
                {selectedService.schedule && (
                  <div className="flex-shrink-0 bg-[#121215] border border-white/10 px-4 py-2 rounded-sm text-center">
                    <span className="block text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">SCHEDULE</span>
                    <span className="text-[11px] text-[#E50914] font-black uppercase tracking-wide">{selectedService.schedule}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-zinc-300 text-sm leading-relaxed font-sans">
                {selectedService.description}
              </p>

              {/* Features List */}
              {selectedService.features && (
                <div>
                  <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                    WHAT'S INCLUDED
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(typeof selectedService.features === 'string' 
                      ? selectedService.features.split(',') 
                      : selectedService.features
                    ).map((feat, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-5 h-5 flex-shrink-0 bg-[#E50914]/10 border border-[#E50914]/30 rounded-sm flex items-center justify-center">
                          <span className="text-[#E50914] text-[10px] font-black">✓</span>
                        </span>
                        <span className="text-zinc-300 text-xs font-medium">{feat.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-white/5">
                <button
                  onClick={() => {
                    setSelectedService(null);
                    scrollToRef(packagesRef);
                  }}
                  className="flex-1 bg-[#E50914] hover:bg-white text-white hover:text-black font-sans text-[11px] tracking-[0.3em] font-black py-4 uppercase transition-all cursor-pointer text-center"
                >
                  JOIN NOW — VIEW PLANS
                </button>
                <button
                  onClick={() => {
                    setSelectedService(null);
                    setIsPtOpen(true);
                  }}
                  className="flex-1 border-2 border-white/20 hover:border-white text-white font-sans text-[11px] tracking-[0.25em] font-black py-4 uppercase transition-all cursor-pointer text-center"
                >
                  BOOK A FREE TRIAL
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>

  );
}
