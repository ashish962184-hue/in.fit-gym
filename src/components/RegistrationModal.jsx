import { useState, useEffect } from "react";
import { X, Check, Phone, ArrowUpRight } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function RegistrationModal({ isOpen, onClose, selectedPlan, allPlans = [], onComplete }) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("General Fitness");
  const [formErrors, setFormErrors] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [whatsappDirectUrl, setWhatsappDirectUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFullName("");
      setEmail("");
      setPhone("");
      setFitnessGoal("General Fitness");
      setFormErrors("");
      setWhatsappDirectUrl("");
      
      if (selectedPlan) {
        setSelectedPlanId(selectedPlan.id);
      } else if (allPlans && allPlans.length > 0) {
        setSelectedPlanId(allPlans[0].id);
      } else {
        setSelectedPlanId("1-month");
      }

      // Check for current logged in user session on open
      const fetchSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          setUserId(session.user.id);
          // Auto fill details if session profile exists
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();
          
          if (profile) {
            setFullName(profile.full_name || "");
            setEmail(profile.email || "");
            setPhone(profile.phone || "");
          }
        }
      };
      fetchSession();
    }
  }, [isOpen, selectedPlan, allPlans]);

  const activePlan = allPlans.find((p) => p.id === selectedPlanId) || selectedPlan || {
    id: "1-month",
    name: "1 Month",
    category: "Foundation",
    price: 1499,
    period: "month",
    features: ["Full Gym Access", "Locker Access", "Strength & Cardio Equipment"]
  };

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormErrors("");
    setLoading(true);

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setFormErrors("Please fill in all details to proceed.");
      setLoading(false);
      return;
    }

    if (!userId) {
      setFormErrors("You must be signed in to submit a membership request. Please Sign In first.");
      setLoading(false);
      return;
    }

    try {
      const requestDateStr = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      // A. Check for existing active memberships
      const { data: activeMember, error: memberCheckErr } = await supabase
        .from("memberships")
        .select("*")
        .eq("user_id", userId);

      if (activeMember && activeMember.length > 0) {
        const activeItem = activeMember.find(m => m.is_active);
        if (activeItem) {
          const today = new Date().toISOString().split("T")[0];
          if (activeItem.expiry_date >= today) {
            setFormErrors("You already have an active membership. Multiple active memberships are not allowed.");
            setLoading(false);
            return;
          }
        }
      }

      // B. Check for existing pending/contacted/approved requests
      const { data: existingRequests, error: requestCheckErr } = await supabase
        .from("membership_requests")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["PENDING", "CONTACTED", "APPROVED"]);

      if (existingRequests && existingRequests.length > 0) {
        const currentReq = existingRequests[0];
        if (currentReq.status === "PENDING" || currentReq.status === "CONTACTED") {
          setFormErrors(`You already have a membership request in progress (Status: ${currentReq.status}). Multiple requests are not allowed.`);
          setLoading(false);
          return;
        } else if (currentReq.status === "APPROVED") {
          setFormErrors("Your membership request has already been approved! Please complete payment or gym verification to activate.");
          setLoading(false);
          return;
        }
      }

      // 1. Store Membership Request in Supabase table
      const { data, error } = await supabase
        .from("membership_requests")
        .insert({
          user_id: userId,
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          fitness_goal: fitnessGoal,
          selected_plan: activePlan.name,
          plan_price: activePlan.price,
          status: "PENDING"
        })
        .select();

      if (error) throw error;

      const newInquiry = data[0];

      // 2. Invoke complete callback with PENDING status so that cards aren't generated instantly
      const enrolledMember = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        selectedPlanId: activePlan.id,
        price: activePlan.price,
        parqAnswers: {
          heartCondition: false, chestPain: false, dizziness: false,
          boneJoint: false, bloodPressureDrugs: false, otherReason: false
        },
        signedWaiver: true,
        signatureName: fullName.trim(),
        memberId: newInquiry.id,
        joinedDate: requestDateStr,
        status: "PENDING"
      };

      onComplete(enrolledMember);

      // Formulate the WhatsApp text message
      const msgLines = [
        "New Membership Inquiry",
        "",
        `Name: ${fullName.trim()}`,
        "",
        `Phone: ${phone.trim()}`,
        "",
        `Email: ${email.trim()}`,
        "",
        `Selected Plan: ${activePlan.name}`,
        "",
        `Price: ₹ ${activePlan.price.toLocaleString("en-IN")}`,
        "",
        "Interested in joining our Gym.",
        "",
        "Please contact me regarding membership enrollment."
      ];
      
      const msgText = msgLines.join("\n");
      const whatsappUrl = `https://api.whatsapp.com/send?phone=919966683776&text=${encodeURIComponent(msgText)}`;
      setWhatsappDirectUrl(whatsappUrl);

      // Try automatic open
      try {
        window.open(whatsappUrl, "_blank");
      } catch (err) {
        console.warn("Direct pop-up blocked. Visitor can use manual WhatsApp trigger on success panel.");
      }

      setStep(2);
    } catch (err) {
      console.error("Registration DB Error:", err);
      setFormErrors("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/65 backdrop-blur-[4px]"
        onClick={() => step !== 2 && onClose()}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-[#121215] border-2 border-white/10 rounded-sm overflow-hidden shadow-2xl z-10 font-sans">
        
        {/* Header */}
        <div className="flex flex-col p-5 border-b border-white/10 bg-[#0B0B0C] text-left">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-black text-[#EEEEF0] tracking-widest uppercase text-[#E50914]">
              MEMBERSHIP REQUEST
            </h3>
            {step !== 2 && (
              <button 
                onClick={onClose} 
                disabled={loading}
                className="text-[#EEEEF0]/60 hover:text-[#E50914] p-1.5 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {step === 1 && (
            <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed font-sans font-medium">
              Submit your details and our team will contact you shortly regarding your selected membership plan.
            </p>
          )}
        </div>

        {/* Content Wrapper */}
        <div className="p-6 max-h-[72vh] overflow-y-auto">
          
          {step === 1 ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-5 text-left">
              
              {/* Dynamic Interactive Selection Dropdown based on interest */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-[#EEEEF0]/70 uppercase tracking-[0.15em]">
                  CHOOSE PLAN INTEREST
                </label>
                <select
                  value={selectedPlanId}
                  disabled={loading}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full bg-[#0B0B0C] border border-white/15 focus:border-[#E50914] rounded-sm px-3 py-2.5 text-xs text-[#EEEEF0] font-sans font-medium uppercase tracking-wider outline-none transition-all cursor-pointer"
                >
                  {allPlans.map((plan) => (
                    <option key={plan.id} value={plan.id} className="bg-[#121215] text-[#EEEEF0]">
                      {plan.name} ({plan.category}) — ₹{plan.price.toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Plan Details display card */}
              <div className="bg-[#1A1A1E] text-white p-5 rounded-sm border border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-[9px] uppercase tracking-widest font-bold">MEMBERSHIP PLAN</span>
                  <span className="bg-[#E50914] text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">
                    {activePlan.category.toUpperCase()}
                  </span>
                </div>
                <div className="font-display text-lg font-black text-white leading-none uppercase tracking-wide">
                  {activePlan.name} Membership Plan
                </div>
                <p className="text-[10px] text-white/77 leading-relaxed font-sans">
                  All-access premium package. Submit request to get in-person equipment training access slots and coach guidance at Hyderabad’s premier performance center.
                </p>
                <div className="text-2xl text-[#E50914] font-black pt-1">
                  ₹ {activePlan.price.toLocaleString("en-IN")}{" "}
                  <span className="text-xs text-white/50 font-normal font-sans">
                    / {activePlan.period}
                  </span>
                </div>
              </div>

              {formErrors && (
                <div className="p-3 bg-red-950/40 text-[#E50914] border border-red-900/50 text-xs rounded-sm">
                  {formErrors}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-[#EEEEF0]/70 uppercase tracking-widest mb-1 font-sans">
                    Full Athlete Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={loading}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your Name"
                    className="w-full bg-[#0B0B0C] border border-white/15 focus:border-[#E50914] rounded-sm px-3 py-2.5 text-xs text-[#EEEEF0] outline-none transition-all placeholder-zinc-500/50 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-[#EEEEF0]/70 uppercase tracking-widest mb-1 font-sans">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your Email"
                    className="w-full bg-[#0B0B0C] border border-white/15 focus:border-[#E50914] rounded-sm px-3 py-2.5 text-xs text-[#EEEEF0] outline-none transition-all placeholder-zinc-500/50 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-[#EEEEF0]/70 uppercase tracking-widest mb-1 font-sans">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={loading}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your Mobile Number"
                    className="w-full bg-[#0B0B0C] border border-white/15 focus:border-[#E50914] rounded-sm px-3 py-2.5 text-xs text-[#EEEEF0] outline-none transition-all placeholder-zinc-500/50 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-[#EEEEF0]/70 uppercase tracking-widest mb-1 font-sans">
                    Fitness Goal *
                  </label>
                  <select
                    disabled={loading}
                    value={fitnessGoal}
                    onChange={(e) => setFitnessGoal(e.target.value)}
                    className="w-full bg-[#0B0B0C] border border-white/15 focus:border-[#E50914] rounded-sm px-3 py-2.5 text-xs text-[#EEEEF0] outline-none transition-all cursor-pointer font-sans"
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

              <div className="pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#E50914] hover:bg-white text-white hover:text-black font-sans text-[10px] tracking-[0.25em] font-bold uppercase py-4 rounded-sm transition-all shadow-md cursor-pointer text-center disabled:opacity-50"
                >
                  {loading ? "SENDING REQUEST..." : "SEND MEMBERSHIP REQUEST"}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-6">
              
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg border border-emerald-500 shadow-emerald-900/20">
                  <Check className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-2xl font-display font-black text-white tracking-widest uppercase">
                  Thank You!
                </h4>
                <p className="text-[#EEEEF0]/90 text-sm font-sans font-semibold leading-relaxed max-w-sm">
                  Your membership request has been submitted successfully.
                </p>
                <p className="text-zinc-400 text-xs font-sans max-w-sm leading-relaxed">
                  Our team will contact you shortly to complete your enrollment. Your selected membership plan: <strong className="text-zinc-200">{activePlan.name} (₹{activePlan.price.toLocaleString("en-IN")})</strong>.
                </p>
              </div>

              <div className="bg-[#1A1A1E] border border-white/10 p-5 rounded-sm text-left space-y-3 font-sans">
                <span className="text-[8px] font-bold text-[#E50914] uppercase tracking-widest block font-sans">
                  AUTOMATED WHATSAPP LEADS
                </span>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  We have formulated a direct inquiry message for you to send to our support desk immediately via WhatsApp.
                </p>
                
                {whatsappDirectUrl && (
                  <a
                    href={whatsappDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-[10px] tracking-[0.15em] font-bold uppercase py-3 px-4 rounded-sm transition-all flex items-center justify-center gap-2 mt-2 leading-none"
                    id="submit-whatsapp-btn"
                  >
                    <Phone className="w-3.5 h-3.5" /> OPEN WHATSAPP INQUIRY <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  onClick={onClose}
                  className="w-full bg-[#1A1A1E] hover:bg-red-600 text-white hover:text-white font-sans text-[10px] tracking-[0.2em] font-bold uppercase py-3 rounded-sm transition-all cursor-pointer text-center"
                >
                  CLOSE & BACK TO SITE
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
